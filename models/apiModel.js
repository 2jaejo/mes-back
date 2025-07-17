import { set } from 'mongoose';
import pool from '../config/db.js';
import { sql } from 'googleapis/build/src/apis/sql/index.js';


// prefix + YYMMDD + 다섯자리(updated_at 카운터 + 1)
const generateTableId = async (params) => {
  try {
    const {prefix, table_name} = params;
    const query = `
      SELECT 
        '${prefix}' 
          || TO_CHAR(NOW(), 'YYMMDDHH24MISS') 
          || LPAD(CAST(EXTRACT(MILLISECONDS FROM NOW()) AS INTEGER)::text, 3, '0') 
          || '-'
          || LPAD( (COALESCE(COUNT(*), 0) + 1)::text, 3,'0')  as id
        FROM ${table_name} 
        WHERE updated_at::date = CURRENT_DATE 
    `;
    const result = await pool.query(query);
    return result.rows[0]; 
  } catch (error) {
    throw new Error(error.message);
  }
};



const apiModel = {

  generateTableId,

  getMenuList: async (params) => {
    try {
      const result = await pool.query(
        `SELECT m.*
        FROM tb_menu m
        WHERE 
          EXISTS (
            SELECT 1 FROM tb_user_menu um
            WHERE um.user_id = $1
          )
          AND (
            m.menu_id IN (
              SELECT menu_id FROM tb_user_menu WHERE user_id = $1
            )
            OR
            m.parent_id IN (
              SELECT menu_id FROM tb_user_menu WHERE user_id = $1
            )
        )
        and m.use_yn = 'Y'
        UNION
        SELECT mm.*
        FROM tb_menu mm
        WHERE NOT EXISTS (
          SELECT 1 FROM tb_user_menu um
          WHERE user_id = $1
        )
        and mm.use_yn = 'Y'
        ORDER BY parent_id NULLS FIRST, sort`
      , params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getDropDown: async (params) => {
    try {

      const { category, code } = params;
      const results = {
        category:{
          item_group_a:[],
          item_group_b:{},
        },
        common:[],
      };

      const item_group_a = [];
      const item_group_b = {};
      // 1. category가 있을 경우: 카테고리 기준 데이터 조회
      if (category !== undefined) {
        const categoryQuery = `SELECT *
          FROM tb_category 
          ORDER BY parent_id,sort ASC`;
        const categoryResult = await pool.query(categoryQuery);
        categoryResult.rows.forEach(row => {
          if (row.parent_id === null) {
            // 최상위 분류 (대분류)
            item_group_a.push(row);
          } else {
            // 하위 분류 (소분류) - parent_id 기준으로 그룹핑
            if (!item_group_b[row.parent_id]) {
              item_group_b[row.parent_id] = [];
            }
            item_group_b[row.parent_id].push(row);
          }
        });

        results['category']['item_group_a'] = item_group_a;
        results['category']['item_group_b'] = item_group_b;
      }


      // 2. group_code 배열로 조회
      if (Array.isArray(code) && code.length > 0) {
        const codeResult = await pool.query(
          `SELECT *
          FROM tb_common_code
          WHERE group_code = ANY($1)
          ORDER BY sort ASC`,
          [code]
        );
        
        // group_code별로 묶기
        const grouped = {};
        for (const row of codeResult.rows) {
          if (!grouped[row.group_code]) grouped[row.group_code] = [];
          grouped[row.group_code].push(row);
        }

        results['common'] = grouped;
      }
      
      return results; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  // 바코드 스캔
  scanBarcode: async (params) => {
    try {
      const query = `
        SELECT
          *
        FROM tb_item
        WHERE barcode = $1
      `;
      const result = await pool.query(query, params);
      if (result.rows.length === 0) {
        throw new Error('해당 바코드에 대한 정보가 없습니다.');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // 엑셀 매핑
  excelMapping: async (params) => {
    try {
      const query = `
        SELECT
          *
        FROM tb_excel_mapping
        WHERE category = $1
      `;
      const result = await pool.query(query, params);
      if (result.rows.length === 0) {
        throw new Error('해당 카테고리에 대한 정보가 없습니다.');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setExcelMapping: async (params) => {
    try {
      // category 값 추출 및 제거
      const { category, ...columns } = params;

      if (!category) {
        throw new Error("category 값이 없습니다.");
      }

      const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // ['A'...'Z']

      // SET절 구성
      const setClauses = alphabet.map((col, idx) => `"${col}" = $${idx + 1}`);
      const values = alphabet.map(col => columns[col] ?? ""); // 없는 키는 빈 문자열

      // WHERE절은 마지막 파라미터로 category
      values.push(category);
      const query = `UPDATE tb_excel_mapping SET ${setClauses.join(', ')} WHERE category = $${values.length};`;

    
      const result = await pool.query(query, values);

      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addExcelMapping: async (params) => {
    const client = await pool.connect();

    try {

      // 트랜잭션 시작
      await client.query('BEGIN');
      
      const { tb, items } = params;

      // 테이블 이름 검증 테스트용
      const allowedTables = ['tb_item', 'tb_raw', 'tb_client', 'tb_vendor'];

      // tb 값이 포함된 allowedTables 항목 찾기
      const matchedTables = allowedTables.filter(table => table.includes(tb));
      if (matchedTables.length === 0) {
        throw new Error('Invalid table name');
      }

      // 첫번째 매칭된 테이블 사용 예
      const tableName = matchedTables[0];
      const successRows = [];
      const failedRows = [];

      for (const [i, row] of items.entries()) {
        try {
          await client.query(`SAVEPOINT sp_${i}`);

          const columns = Object.keys(row);                        
          const values = Object.values(row);                       
          const placeholders = columns.map((_, idx) => `$${idx + 1}`); 
          
          await client.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`, values);
          successRows.push(row);

        } catch (err) {
          await client.query(`ROLLBACK TO SAVEPOINT sp_${i}`);
          failedRows.push({ row, error: err.message });
        }
      }

      await client.query('COMMIT');

      return { successRows, failedRows };
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }

  },   

  

  // category
  getCategoryMst: async (params) => {
    try {
      const { category_id, use_yn } = params;
      const data = [];
      let query = `SELECT * FROM tb_category WHERE 1=1 AND parent_id IS NULL`;
      let idx = 1;

      // category_id 조건
      if (category_id !== '') {
        query += ` AND category_id ILIKE $${idx++}`;
        data.push(`%${category_id}%`);
      }

      // use_yn 조건
      if (use_yn !== '') {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY category_id asc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCategoryDet: async (params) => {
    try {
      const result = await pool.query('SELECT * FROM tb_category where parent_id = $1 ORDER BY category_id asc', params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setCategory: async (params) => {
    try {
      const query = `
        UPDATE tb_category
        SET
          category_nm = $1
          ,sort       = $2
          ,use_yn     = $3
          ,comment    = $4
          ,updated_at = now()
        WHERE
          category_id = $5
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addCategory: async (params) => {
    try {

      const query = `
        INSERT INTO tb_category (
          category_id
          , category_nm
          , sort
          , use_yn
          , comment
          , parent_id
        ) VALUES (
          $1
          , $2
          , COALESCE(NULLIF($3, '')::int, 0)
          , COALESCE(NULLIF($4, ''), 'y')
          , NULLIF($5, '')
          , NULLIF($6, '')
        );
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delCategory: async (params) => {
    try {
      const query = `
        DELETE FROM tb_category
        WHERE category_id = ANY($1::text[])
        OR  parent_id = ANY($1::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },


  // Item
  getItem: async (params) => {
    try {
      const { item_type, use_yn, item_dotno, item_name, barcode } = params;
      const data = [];

      let query = `
        SELECT 
          * 
        FROM tb_item WHERE 1=1
      `;
      let idx = 1;
      
      // item_type 조건
      if (item_type !== '' && item_type !== undefined) {
        query += ` AND item_type = $${idx++}`;
        data.push(item_type);
      }


      // use_yn 조건
      if (use_yn !== '' && use_yn !== undefined) {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      // item_dotno 조건
      if (item_dotno !== '' && item_dotno !== undefined) {
        query += ` AND item_dotno ILIKE $${idx++}`;
        data.push(`%${item_dotno}%`);
      }

      // item_name 조건
      if (item_name !== '' && item_name !== undefined) {
        query += ` AND item_name ILIKE $${idx++}`;
        data.push(`%${item_name}%`);
      }

      // barcode 조건
      if (barcode !== '' && barcode !== undefined) {
        query += ` AND bar_code ILIKE $${idx++}`;
        data.push(`%${barcode}%`);
      }

      query += ` ORDER BY idx desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setItem: async (params) => {
    try {
      const query = `
        UPDATE tb_item SET 
          item_name= $2
          , item_type= $3
          , item_group_a= $4
          , item_group_b= $5
          , base_unit= $6
          , purchase_unit= $7
          , default_warehouse= $8
          , inspection_method= $9
          , incoming_inspection= $10
          , outgoing_inspection= $11
          , standard_price= $12
          , shelf_life_days= $13
          , shelf_life_managed= $14
          , lot_managed= $15
          , use_yn= $16
          , comment= $17
          , item_status = $18
          , updated_at=now()
        WHERE item_dotno = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addItem: async (params, user_nm) => {
    try {
      const tableName = 'tb_item';

      // 유효한 값만 필터링
      const entries = Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      );

      const columns = entries.map(([key]) => key);
      const values = entries.map(([_, value]) => value);
      const placeholders = entries.map((_, idx) => `$${idx + 1}`);

      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')} , reg_date, reg_admin_name)
        VALUES (${placeholders.join(', ')}, TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '${user_nm}');
      `;

      const result = await pool.query(query, values);
      
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delItem: async (params) => {
    try {
      const query = `
        DELETE FROM tb_item
        WHERE item_dotno = ANY($1::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },

  // Raw
  getRaw: async (params) => {
    try {
      const { raw_code, raw_name, barcode } = params;
      const data = [];

      let query = `
        SELECT 
          * 
        FROM tb_raw WHERE 1=1
      `;
      let idx = 1;
      
      // raw_code 조건
      if (raw_code !== '' && raw_code !== undefined) {
        query += ` AND raw_code ILIKE $${idx++}`;
        data.push(`%${raw_code}%`);
      }

      // raw_name 조건
      if (raw_name !== '' && raw_name !== undefined) {
        query += ` AND raw_name ILIKE $${idx++}`;
        data.push(`%${raw_name}%`);
      }

      // barcode 조건
      if (barcode !== '' && barcode !== undefined) {
        query += ` AND bar_code ILIKE $${idx++}`;
        data.push(`%${barcode}%`);
      }

      query += ` ORDER BY idx desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRaw: async (params) => {
    try {
      const query = `
        UPDATE tb_raw SET 
           type_name = $2
          , base_unit = $3
          , unit_size = $4
          , buyprice = $5
          , right_qty = $6
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addRaw: async (params, user_nm) => {
    try {
      const tableName = 'tb_raw';

      // 유효한 값만 필터링
      const entries = Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      );

      const columns = entries.map(([key]) => key);
      const values = entries.map(([_, value]) => value);
      const placeholders = entries.map((_, idx) => `$${idx + 1}`);

      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')} , created_at, created_by)
        VALUES (${placeholders.join(', ')}, TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '${user_nm}');
      `;

      const result = await pool.query(query, values);

      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delRaw: async (params) => {
    try {
      const query = `
        DELETE FROM tb_raw
        WHERE idx = ANY($1::int[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },



  // Price
  getPrice: async (params) => {
    try {
      let query = `
        SELECT DISTINCT ON (t1.item_dotno, t1.quantity_min, t1.quantity_max)
          t1.idx
          , t1.price_id
          , t1.item_dotno
          , t2.item_name 
          , t1.client_code
          , t1.contract_id
          , t1.quantity_min
          , t1.quantity_max
          , t1.price
          , t1.discount_rate
          , t1.currency
          , TO_CHAR(t1.start_date, 'YYYY-MM-DD') AS start_date
          , TO_CHAR(t1.end_date, 'YYYY-MM-DD') AS end_date
          , t1.use_yn
          , t1.comment
          , t1.created_at
          , t1.updated_at 
        FROM tb_Price t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno 
        WHERE t1.use_yn = 'Y'
        AND t1.client_code = $1 
        AND t1.start_date <= CURRENT_DATE
        AND (t1.end_date IS NULL OR t1.end_date >= CURRENT_DATE)
        ORDER by t1.item_dotno, t1.quantity_min, t1.quantity_max, t1.start_date desc, t1.idx desc
      `;
      const result = await pool.query(query, params);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getPriceHistory: async (params) => {
    try {
      let query = `
        SELECT 
          t1.idx
          , t1.price_id
          , t1.item_dotno
          , t2.item_name 
          , t1.client_code
          , t1.contract_id
          , t1.quantity_min
          , t1.quantity_max
          , t1.price
          , t1.discount_rate
          , t1.currency
          , TO_CHAR(t1.start_date, 'YYYY-MM-DD') AS start_date
          , TO_CHAR(t1.end_date, 'YYYY-MM-DD') AS end_date
          , t1.use_yn
          , t1.comment
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_Price t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno 
        WHERE t1.use_yn = 'Y'
        AND t1.item_dotno = $1 
        AND t1.client_code = $2 
        ORDER by t1.start_date desc
      `;
      const result = await pool.query(query, params);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setPrice: async (params) => {
    try {
      const query = `
        UPDATE tb_Price SET 
          quantity_min = $2
          , quantity_max = $3
          , price = $4
          , discount_rate = $5
          , start_date = $6
          , end_date = $7
          , comment = $8
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addPrice: async (params) => {
    try {
      const query = `
        INSERT INTO tb_price(
           item_dotno
          , client_code
        ) values (
           $1
          , $2
        )
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delPrice: async (params) => {
    try {
      const query = `
        UPDATE tb_Price SET 
          use_yn= 'N'
          , updated_at=now()
        WHERE idx = ANY($1::int[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },



  // Client
  getClient: async (params) => {
    try {
      const { client_code, client_name, client_type, use_yn } = params;
      const data = [];

      let query = `SELECT * FROM tb_client WHERE 1=1`;
      let idx = 1;
      
      // client_code 조건
      if (client_code !== '' && client_code !== undefined) {
        query += ` AND client_code ILIKE $${idx++}`;
        data.push(`%${client_code}%`);
      }

      // client_name 조건
      if (client_name !== '' && client_name !== undefined) {
        query += ` AND client_name ILIKE $${idx++}`;
        data.push(`%${client_name}%`);
      }

      // client_type 조건
      if (client_type !== '' && client_type !== undefined) {
        query += ` AND client_type = $${idx++}`;
        data.push(client_type);
      }

      // use_yn 조건
      if (use_yn !== '' && use_yn !== undefined) {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY idx desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setClient: async (params) => {
    try {
      const query = `
        UPDATE tb_client
        SET
           use_yn = $3
          , comment = $4
          , updated_at = TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
          , updated_by = $1
        WHERE
          idx = $2
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addClient: async (params, user_nm) => {
    try {

      const tableName = 'tb_client';

      // 유효한 값만 필터링
      const entries = Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      );

      const columns = entries.map(([key]) => key);
      const values = entries.map(([_, value]) => value);
      const placeholders = entries.map((_, idx) => `$${idx + 1}`);

      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')} , created_at, created_by, updated_at, updated_by)
        VALUES (${placeholders.join(', ')}, TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '${user_nm}', TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'), '${user_nm}');
      `;

      const result = await pool.query(query, values);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delClient: async (params) => {
    try {
      const query = `
        DELETE FROM tb_client
        WHERE idx = ANY($1::int[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },


  // Equipment
  getEquipment: async (params) => {
    try {
      const { equipment_type, equipment_code, equipment_name, use_yn } = params;
      const data = [];

      let query = `
        SELECT 
          idx
          , equipment_id
          , equipment_code
          , equipment_name
          , equipment_type
          , manufacturer
          , model
          , TO_CHAR(install_date, 'YYYY-MM-DD') AS install_date
          , status
          , use_yn
          , TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
          , comment
        FROM tb_equipment
        WHERE 1=1
      `;
      let idx = 1;
      
      // equipment_code 조건
      if (equipment_code !== '' && equipment_code !== undefined) {
        query += ` AND equipment_code ILIKE $${idx++}`;
        data.push(`%${equipment_code}%`);
      }

      // equipment_name 조건
      if (equipment_name !== '' && equipment_code !== undefined) {
        query += ` AND equipment_name ILIKE $${idx++}`;
        data.push(`%${equipment_name}%`);
      }

      // equipment_type 조건
      if (equipment_type !== '' && equipment_code !== undefined) {
        query += ` AND equipment_type = $${idx++}`;
        data.push(equipment_type);
      }

      // use_yn 조건
      if (use_yn !== '' && equipment_code !== undefined) {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY equipment_code asc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setEquipment: async (params) => {
    try {
      const query = `
        UPDATE tb_equipment SET 
          location = $2
          , status = $3
          , install_date = $4
          , use_yn = $5
          , comment = $6
          , updated_at=now()
        WHERE equipment_code = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addEquipment: async (params) => {
    try {
      const query = `
        INSERT INTO tb_equipment(
           equipment_code
          , equipment_name
          , equipment_type
          , manufacturer
          , model
          , install_date
          , "location"
          , status
          , use_yn
          , created_at
          , updated_at
          , "comment"
        )VALUES(
           $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , $7
          , $8
          , $9
          , CURRENT_TIMESTAMP
          , CURRENT_TIMESTAMP
          , $10
        )
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delEquipment: async (params) => {
    try {
      const query = `
        DELETE FROM tb_equipment
        WHERE equipment_code = ANY($1::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },


  // EquipmentCheck
  getEquipmentCheck: async (params) => {
    try {
      const data = params;
      let query = `
        SELECT 
          idx
          , equipment_code
          , check_code
          , check_name
          , "method"
          , standard
          , "cycle"
          , "comment"
          , TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_equipment_check
        WHERE equipment_code = $1
        ORDER BY check_code asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getEquipmentCheckLog: async (params) => {
    try {
      const { equipment_type, equipment_code, equipment_name, use_yn } = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.equipment_code 
          , t1.check_result 
          , t1.created_by 
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , t1.check_code 
          , t2.check_name 
          , t2."method" 
          , t2.standard 
          , t2."cycle" 
          , t2."comment" 
          , t3.equipment_name
          , t3.equipment_type
          , t3.manufacturer
          , t3.model
          , TO_CHAR(t3.install_date, 'YYYY-MM-DD') AS install_date
          , t3.status
          , t3.use_yn
        FROM tb_equipment_check_log t1
        left join tb_equipment_check t2 on t1.check_code = t2.check_code 
        left join tb_equipment t3 on t1.equipment_code = t3.equipment_code
        WHERE 1=1
      `;

      let idx = 1;
      
      // equipment_code 조건
      if (equipment_code !== '' && equipment_code !== undefined) {
        query += ` AND t3.equipment_code ILIKE $${idx++}`;
        data.push(`%${equipment_code}%`);
      }

      // equipment_name 조건
      if (equipment_name !== '' && equipment_name !== undefined) {
        query += ` AND t3.equipment_name ILIKE $${idx++}`;
        data.push(`%${equipment_name}%`);
      }

      // equipment_type 조건
      if (equipment_type !== '' && equipment_type !== undefined) {
        query += ` AND t3.equipment_type = $${idx++}`;
        data.push(equipment_type);
      }

      // use_yn 조건
      if (use_yn !== '' && use_yn !== undefined) {
        query += ` AND t3.use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY t1.created_at desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setEquipmentCheck: async (params) => {
    try {
      const query = `
        UPDATE tb_equipment_check SET 
          method = $2
          , standard = $3
          , cycle = $4
          , comment = $5
          , updated_at=now()
        WHERE check_code = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addEquipmentCheck: async (params) => {
    try {
      const query = `
        INSERT INTO tb_equipment_check(
           equipment_code
          , check_code
          , check_name
          , "method"
          , standard
          , "cycle"
          , "comment"
          , created_at
          , updated_at
        ) VALUES (
           $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , $7
          , CURRENT_TIMESTAMP
          , CURRENT_TIMESTAMP
        )
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addEquipmentCheckLog: async (params) => {
    try {

      const values = [];
      const data = [];
    
      params.forEach((el, index) => {
        values.push(
          `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
        );
    
        data.push(
          el.equipment_code
        , el.check_code
        , el.check_result
        );
      });

      const query = `
        INSERT INTO tb_equipment_check_log(
           equipment_code
          , check_code
          , check_result
        ) values ${values.join(', ')}
        RETURNING *
      `;
      const result = await pool.query(query, data);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delEquipmentCheck: async (params) => {
    try {
      const query = `
        DELETE FROM tb_equipment_check
        WHERE check_code = ANY($1::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },


  // Process
  getProcess: async (params) => {
    try {
 
      const { process_type, process_code, process_name, use_yn } = params;
      const data = [];

      let query = `
        SELECT 
          idx
          , process_code
          , process_name
          , process_type
          , check_yn
          , use_yn
          , "comment"
          , TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_process
        WHERE 1=1
      `;
      let idx = 1;
      
      // process_code 조건
      if (process_code !== '' && process_code !== undefined) {
        query += ` AND process_code ILIKE $${idx++}`;
        data.push(`%${process_code}%`);
      }

      // process_name 조건
      if (process_name !== '' && process_name !== undefined ) {
        query += ` AND process_name ILIKE $${idx++}`;
        data.push(`%${process_name}%`);
      }

      // process_type 조건
      if (process_type !== '' && process_type !== undefined ) {
        query += ` AND process_type = $${idx++}`;
        data.push(process_type);
      }

      // use_yn 조건
      if (use_yn !== '' && use_yn !== undefined ) {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY process_code asc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getProcess2: async () => {
    try {
 
      let query = `
        SELECT 
          tp.process_code
          , tp.process_name
          , tp.process_type
          , tp.use_yn
          , tcc.code_name as process_type_name
          , two.work_id 
          , two.item_code 
          , ti.item_name 
          , twr.work_idx 
          , case 
            WHEN twr.work_idx IS NULL THEN NULL
              WHEN twr.start_dttm IS NULL AND twr.end_dttm IS NULL THEN 'ready'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NULL AND twr.pause = 'Y' THEN 'pause'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NULL AND twr.pause = 'N' THEN 'start'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NOT NULL THEN 'end'
              ELSE 'unknown'
            END AS status
        FROM tb_process tp
        left join tb_common_code tcc on tp.process_type = tcc.code and tcc.group_code = 'cd011'
        LEFT JOIN tb_work_order two ON tp.process_code = two.process_code 
          AND (two.start_date || ' ' || two.start_time)::timestamp <= now()
          AND (two.end_date || ' ' || two.end_time)::timestamp >= now()
        left join tb_item ti on two.item_code = ti.item_dotno 
        left join tb_work_result twr on two.idx = twr.work_idx 
        where tp.use_yn = 'Y'
        order by tp.process_code;
      `;

      const result = await pool.query(query);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getProcess3: async () => {
    try {
 
      let query = `
        SELECT
          code as process_code
          , code_name as process_name
        FROM tb_common_code tcc 
        where tcc.group_code = 'cd008' 

      `;

      const result = await pool.query(query);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setProcess: async (params) => {
    try {
      const query = `
        UPDATE tb_process SET 
          check_yn = $2
          , use_yn = $3
          , comment = $4
          , updated_at=now()
        WHERE process_code = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addProcess: async (params) => {
    try {
      const query = `
        INSERT INTO tb_process(
          process_code
          , process_name
          , process_type
          , check_yn
          , use_yn
          , "comment"
          , created_at
          , updated_at
        ) values (
           $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , CURRENT_TIMESTAMP
          , CURRENT_TIMESTAMP
        )
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delProcess: async (params) => {
    try {
      const query = `
        DELETE FROM tb_process
        WHERE process_code = ANY($1::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },


  // Router
  getRouter: async (params) => {
    try {
 
      const { router_code, router_name, use_yn } = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.item_dotno
          , t2.item_name 
          , t1.router_code
          , t1.router_name
          , t1."version"
          , t1.use_yn
          , t1."comment"
          , t1.created_at
          , t1.updated_at
        FROM tb_router t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno
        WHERE 1=1
      `;
      let idx = 1;
      
      // router_code 조건
      if (router_code !== '') {
        query += ` AND t1.router_code ILIKE $${idx++}`;
        data.push(`%${router_code}%`);
      }

      // router_name 조건
      if (router_name !== '') {
        query += ` AND t1.router_name ILIKE $${idx++}`;
        data.push(`%${router_name}%`);
      }

      // use_yn 조건
      if (use_yn !== '') {
        query += ` AND t1.use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY t1.router_code desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getRouterStep: async (params) => {
    try {
 
      const { router_code } = params;
      const data = [router_code];

      let query = `
        SELECT 
          t1.idx
          , t1.router_code
          , t1.sort
          , t1.process_code
          , tcc.code_name as process_name
          , t1.expected_time_min
          , t1.is_optional
          , t1."comment"
          , t1.created_at
          , t1.updated_at
        FROM tb_router_step t1
        left join tb_common_code tcc on t1.process_code = tcc.code and tcc.group_code = 'cd008' 
        WHERE t1.router_code = $1
      `;

      query += ` ORDER BY t1.sort asc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRouter: async (params) => {
    try {
      const query = `
        UPDATE tb_router SET 
           use_yn = $2
          , comment = $3
          , updated_at=now()
        WHERE router_code = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRouterStep: async (params) => {
    try {
      const query = `
        UPDATE tb_router_step SET 
          expected_time_min = $2
          , is_optional = $3
          , comment = $4
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addRouter: async (params) => {

    const client = await pool.connect();

    try {
      const { 
        router_code
        , router_name
        , item_dotno
        , use_yn
        , version
        , comment
        , arr_proc
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      const data = [
        router_code
        , router_name
        , item_dotno
        , use_yn
        , version
        , comment
      ];

      const query = `
        INSERT INTO tb_router(
          router_code
          , router_name
          , item_dotno
          , use_yn
          , version
          , comment
          , created_at
          , updated_at
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , CURRENT_TIMESTAMP
          , CURRENT_TIMESTAMP
        )
        RETURNING *
      `;
      const sql1 = await client.query(query, data);


      const values = [];
      const data2 = [];
    
      arr_proc.forEach((proc, index) => {
        values.push(
          `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
        );
    
        data2.push(
          router_code,
          index + 1,
          proc.process_code
        );
      });
    
      const query2 = `
        INSERT INTO tb_router_step(
          router_code
          , sort
          , process_code
        ) values ${values.join(', ')}
        RETURNING *
      `;

      const sql2 = await client.query(query2, data2);

      
     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        router: sql1.rows,
        router_step: sql2?.rows || []
      }
      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },

  delRouter: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_router WHERE router_code = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

      const query2 = `
        DELETE FROM tb_router_step WHERE router_code = ANY($1)
        RETURNING * 
      `;
      const sql2 = await client.query(query2, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        router: sql1.rows,
        router_step: sql2.rows
      }

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },


  // Bom
  getBom: async (params) => {
    try {
      const { item_dotno } = params;
      const data = [item_dotno];

      let query = `
        SELECT 
          t1.idx
          , t1.item_dotno
          , t2.item_name
          , t1.material_code as raw_code
          , t3.raw_name
          , t1.quantity
          , t1.unit
          , t1.sort
          , t1.comment
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM public.tb_bom t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno
        left join tb_raw t3 on t1.material_code = t3.raw_code
        where t1.item_dotno = $1
        ORDER BY sort asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setBom: async (params) => {
    try {
      const query = `
        UPDATE tb_Bom SET 
            quantity = $2
          , unit = $3
          , sort = $4
          , comment = $5
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addBom: async (params) => {

    try {
      const query = `
        INSERT INTO tb_bom (
          item_dotno
          , material_code
        ) values (
          $1
          , $2
        )
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delBom: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_Bom WHERE idx = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = sql1.rows;

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },
  

  
  // Code
  getCodeMst: async (params) => {
    try {
      const { group_code, group_name } = params;
      const data = [];
      let query = `SELECT * FROM tb_common_code_group WHERE 1=1`;
      let idx = 1;

      // group_code 조건
      if (group_code !== '') {
        query += ` AND group_code ILIKE $${idx++}`;
        data.push(`%${group_code}%`);
      }

      // group_name 조건
      if (group_name !== '') {
        query += ` AND group_name ILIKE $${idx++}`;
        data.push(`%${group_name}%`);
      }

      query += ` ORDER BY group_code asc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCodeDet: async (params) => {
    try {

      let query = `
        select 
          t1.idx 
          ,t1.company_cd 
          ,t2.group_code 
          ,t2.group_name 
          ,t1.code 
          ,t1.code_name 
          ,t1.comment 
          ,t1.sort 
          ,t1.use_yn 
          ,t1.opt1
          ,t1.opt2
          ,t1.opt3
        from tb_common_code t1
        join tb_common_code_group t2 on t1.group_code = t2.group_code and t2.group_code = $1
        order by sort asc
      `;

      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setCodeMst: async (params) => {
    try {
      const query = `
        UPDATE tb_common_code_group SET
          group_name = $2
          ,sort       = $3
          ,use_yn     = $4
          ,comment    = $5
          ,updated_at = now()
        WHERE
          group_code = $1
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setCodeDet: async (params) => {
    try {
      const query = `
        UPDATE tb_common_code SET
          code_name = $3
          ,sort       = $4
          ,use_yn     = $5
          ,comment    = $6
          ,opt1    = $7
          ,opt2    = $8
          ,opt3    = $9
          ,updated_at = now()
        WHERE group_code = $1 
        AND code = $2
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addCodeMst: async (params) => {
    try {

      const query = `
        INSERT INTO tb_common_code_group (
          group_code
          , group_name
          , sort
          , use_yn
          , comment
        ) VALUES (
          $1
          , $2
          , $3
          , $4
          , $5
        );
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addCodeDet: async (params) => {
    try {

      const query = `
        INSERT INTO tb_common_code (
          group_code
          , code
          , code_name
          , sort
          , use_yn
          , comment
          , opt1
          , opt2
          , opt3
        ) VALUES (
          $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , $7
          , $8
          , $9
        );
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delCodeMst: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_common_code_group WHERE group_code = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

      const query2 = `
        DELETE FROM tb_common_code WHERE group_code = ANY($1)
        RETURNING * 
      `;
      const sql2 = await client.query(query2, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        group: sql1.rows,
        code: sql2.rows
      }
      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },

  delCodeDet: async (params) => {
    try {
      const query = `
        DELETE FROM tb_common_code
        WHERE group_code = $1
        AND code = ANY($2::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
    
  },


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  // Order
  getOrder: async (params) => {
    try {
 
      const { start_date, end_date, client_code, client_name, purchase_id, purchase_status} = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.purchase_id
          , t1.client_code
          , t2.client_name 
          , TO_CHAR(t1.order_date, 'YYYY-MM-DD') AS order_date
          , t3.supply_price
          , t3.tax
          , t3.total_price
          , t1.status
          , t1.comment
          , t1.request_id
          , t1.created_by
          , t1.updated_by
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_purchase t1
        left join tb_client t2 on t1.client_code = t2.client_code
        left join (
            select
                purchase_id 
                , sum(supply_price) as supply_price
                , sum(tax) as tax
                , sum(total_price) as total_price
            from tb_purchase_det
            group by purchase_id 
        )  t3 on t1.purchase_id = t3.purchase_id
        WHERE 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '') {
        query += ` AND t1.order_date BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // client_code 조건
      if (client_code !== '') {
        query += ` AND t1.client_code ILIKE $${idx++}`;
        data.push(`%${client_code}%`);
      }

      // client_name 조건
      if (client_name !== '') {
        query += ` AND t2.client_name ILIKE $${idx++}`;
        data.push(`%${client_name}%`);
      }

      // purchase_id 조건
      if (purchase_id !== '') {
        query += ` AND t1.purchase_id ILIKE $${idx++}`;
        data.push(`%${purchase_id}%`);
      }

      // purchase_status 조건
      if (purchase_status !== '') {
        query += ` AND t1.status ILIKE $${idx++}`;
        data.push(`%${purchase_status}%`);
      }




      query += ` ORDER BY t1.purchase_id desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },


  getOrderDet: async (params) => {
    try {
      const { purchase_id } = params;
      const data = [purchase_id];

      let query = `
        SELECT 
          t1.idx
          , t1.purchase_id
          , t1.raw_code
          , t2.raw_name
          , t2.base_unit
          , t2.unit_size
          , t1.quantity
          , t1.unit_price
          , t1.status
          , t1.comment
          , TO_CHAR(t1.due_date, 'YYYY-MM-DD') AS due_date
          , t1.supply_price
          , t1.tax
          , t1.total_price
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
          , COALESCE(t3.changed_quantity, 0) as received_qty
        FROM tb_purchase_det t1
        left join tb_raw t2 on t1.raw_code = t2.raw_code 
        left join (
          select 
            max(t11.purchase_id) as purchase_id
            , max(t11.raw_code) as raw_code 
            , sum(trsl.changed_quantity) changed_quantity 
          from (
            select 
              tpr.purchase_id 
              , tprd.receipt_id
              , tprd.raw_code
            from tb_purchase_receipt tpr 
            left join tb_purchase_receipt_det tprd on tpr.receipt_id = tprd.receipt_id
            where tpr.purchase_id <> ''
          ) as t11
          left join tb_raw_stock_log trsl on t11.receipt_id = trsl.receipt_id and t11.raw_code = trsl.raw_code and trsl.change_type = 'IN'
          where changed_quantity is not null
          group by t11.purchase_id, t11.raw_code 
        ) t3 on t1.purchase_id = t3.purchase_id and t1.raw_code = t3.raw_code
        where t1.purchase_id = $1
        order by t1.idx asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setOrder: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase SET 
            status = $2
          , comment = $3
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setOrderDet: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_det SET 
            status = $2
          ,  received_qty = $3
          , due_date = $4
          , comment = $5
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addOrder: async (params, name) => {

    const client = await pool.connect();

    try {

      const { 
        purchase_id
        , client_code
        , order_date
        , comment
        , user_id
        , status
        , det_status
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');


      const data = [
        purchase_id
        , client_code
        , order_date
        , status
        , comment
        , user_id
      ];
      
      const query = `
        INSERT INTO tb_purchase(
          purchase_id
          , client_code
          , order_date
          , status
          , comment
          , request_id
          , created_at
          , created_by
          , updated_at
          , updated_by
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , now()
          , '${name}'
          , now()
          , '${name}'
        )
        RETURNING *
      `;
      const sql1 = await client.query(query, data);


      const values = [];
      const data2 = [];
    
      sel_row.forEach((proc, index) => {
        values.push(
          `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`
        );
    
        data2.push(
          purchase_id,
          proc.raw_code,
          proc.quantity,
          proc.unit_price,
          det_status,
          proc.supply_price,
          proc.tax,
          proc.total_price,
        );
      });
    
      const query2 = `
        INSERT INTO tb_purchase_det(
          purchase_id
          , raw_code
          , quantity
          , unit_price
          , status
          , supply_price
          , tax
          , total_price
        ) values ${values.join(', ')}
        RETURNING *
      `;

      const sql2 = await client.query(query2, data2);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        mst: sql1.rows,
        det: sql2.rows,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },

  delOrder: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_Order WHERE idx = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = sql1.rows;

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },




  // Receipt
  getReceipt: async (params) => {
    try {
 
      const { start_date, end_date, client_code, client_name, receipt_id, type} = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.purchase_id
          , t1.receipt_id 
          , TO_CHAR(t1.receipt_date, 'YYYY-MM-DD') AS receipt_date
          , t1.client_code
          , t2.client_name 
          , t3.item_count
          , t3.total_price
          , t1.status
          , t1.comment
          , t1.manager
          , t1.created_by
          , t1.updated_by
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_purchase_receipt t1
        left join tb_client t2 on t1.client_code = t2.client_code
        left join (
            select
                receipt_id 
                , count(raw_code) as item_count
                , sum(total_price) as total_price
            from tb_purchase_receipt_det
            group by receipt_id 
        )  t3 on t1.receipt_id = t3.receipt_id
        WHERE 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '') {
        query += ` AND t1.request_date BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // client_code 조건
      if (client_code !== '') {
        query += ` AND t1.client_code ILIKE $${idx++}`;
        data.push(`%${client_code}%`);
      }

      // client_name 조건
      if (client_name !== '') {
        query += ` AND t2.client_name ILIKE $${idx++}`;
        data.push(`%${client_name}%`);
      }

      // receipt_id 조건
      if (receipt_id !== '') {
        query += ` AND t1.receipt_id ILIKE $${idx++}`;
        data.push(`%${receipt_id}%`);
      }

      // type 조건
      if (type !== '' && type !== undefined) {
        query += ` AND t1.client_code is null`;
      }else{
        query += ` AND t1.client_code is not null`;

      }



      query += ` order BY t1.receipt_id desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },


  getReceiptDet: async (params) => {
    try {
      const { receipt_id } = params;
      const data = [receipt_id];

      let query = `
        SELECT 
          t1.idx
          , t1.purchase_det_id
          , t1.receipt_id 
          , t1.raw_code
          , t2.raw_name
          , t2.base_unit
          , t2.unit_size
          , t1.received_qty
          , t1.status
          , t1.lot_no 
          , t1.unit_price
          , t1.total_price 
          , t1.comment
          , t1.created_by 
          , t1.updated_by 
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_purchase_receipt_det t1
        left join tb_raw t2 on t1.raw_code = t2.raw_code 
        where receipt_id = $1
        order by t1.idx asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceipt: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_receipt SET 
            status = $2
          , comment = $3
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptDet: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_receipt_det SET 
            status = $2
          , received_qty = $3
          , comment = $4
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setReceiptClose: async (params, name) => {
    
    const client = await pool.connect();

    try {
      const arr = params;
      const arr_ids = arr.map(el => el.receipt_id); // 필요한 키만 추출
      const data = [arr_ids];
      
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      // const query = `
      //   UPDATE tb_purchase_receipt_det SET 
      //       status = 'complete'
      //     , updated_by = 'test'
      //     , updated_at=now()
      //   WHERE receipt_id = ANY($1)
      //   RETURNING *
      // `;
      // const sql1 = await client.query(query, data);
    
      const query2 = `
        UPDATE tb_purchase_receipt_det SET 
            status = 'complete'
          , updated_by = '${name}'
          , updated_at=now()
        WHERE receipt_id = ANY($1)
        RETURNING *
      `;

      const sql2 = await client.query(query2, data);


      const arr_ids2 = arr.map(el => el.idx); // 필요한 키만 추출
      const data2 = [arr_ids2];

      const query3 = `
        SELECT update_receipt_stock($1::int[], 'IN')
      `;

      const sql3 = await client.query(query3, data2);
     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        // mst: sql1.rows,
        det: sql2.rows,
        stock: sql3.rows[0].update_receipt_stock,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }


  },

  addReceipt: async (params, user) => {

    const client = await pool.connect();

    try {

      const { 
        purchase_id
        , receipt_id
        , client_code
        , receipt_date
        , comment
        , status
        , det_status
        , sel_row
      } = params;

      let { user_id } = params; 

      if(user_id === '' || user_id === null ||  user_id === undefined){
        user_id = user.id;
      }
      
      let sql1 = null;
      let sql2 = null;

      // 트랜잭션 시작
      await client.query('BEGIN');


  
      const data = [
        purchase_id
        , receipt_id
        , client_code
        , receipt_date
        , status
        , comment
        , user_id
      ];
      
      const query = `
        INSERT INTO tb_purchase_receipt(
          purchase_id
          , receipt_id
          , client_code
          , receipt_date
          , status
          , comment
          , manager
          , created_by
          , updated_by
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , $7
          , '${user.name}'
          , '${user.name}'
        )
        RETURNING *
      `;
      sql1 = await client.query(query, data);
  

      const values = [];
      const data2 = [];
    
      sel_row.forEach((proc, index) => {
        values.push(
          `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`
        );
    
        data2.push(
          receipt_id,
          proc.raw_code,
          proc.quantity,
          proc.unit_price,
          det_status,
          proc.total_price,
        );
      });
    
      const query2 = `
        INSERT INTO tb_purchase_receipt_det(
           receipt_id
          , raw_code
          , received_qty
          , unit_price
          , status
          , total_price
        ) values ${values.join(', ')}
        RETURNING *
      `;

      sql2 = await client.query(query2, data2);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        mst: sql1 ? sql1.rows : [], // 존재 안 하면 빈 배열
        det: sql2.rows,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },

  delReceipt: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_purchase_receipt WHERE receipt_id = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

      const query2 = `
        DELETE FROM tb_purchase_receipt_det WHERE receipt_id = ANY($1)
        RETURNING * 
      `;
      const sql2 = await client.query(query2, params);

     
      // 커밋
      await client.query('COMMIT');
      

      const result = {
        mst:sql1.rows,
        det: sql2.rows
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },


  // ReceiptLog
  getReceiptLog: async (params) => {
    try {
 
      const { start_date, end_date, raw_code, raw_name, receipt_id, change_type} = params;
      const data = [];

      let query = `
        SELECT 
            t1.idx
            , t1.receipt_id
            , t1.raw_code
            , t2.raw_name 
            , t1.warehouse_id
            , t1.lot_no
            , t1.changed_quantity
            , t1.change_type
            , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS receipt_date
            , t1.created_at
            , t1.updated_at
        FROM tb_raw_stock_log t1 
        left join tb_raw t2 on t1.raw_code = t2.raw_code
        WHERE 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '') {
        query += ` AND t1.created_at BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // raw_code 조건
      if (raw_code !== '') {
        query += ` AND t1.raw_code ILIKE $${idx++}`;
        data.push(`%${raw_code}%`);
      }

      // raw_name 조건
      if (raw_name !== '') {
        query += ` AND t2.raw_name ILIKE $${idx++}`;
        data.push(`%${raw_name}%`);
      }

      // receipt_id 조건
      if (receipt_id !== '') {
        query += ` AND t1.receipt_id ILIKE $${idx++}`;
        data.push(`%${receipt_id}%`);
      }

      // change_type 조건
      if (change_type !== '') {
        query += ` AND t1.change_type ILIKE $${idx++}`;
        data.push(`%${change_type}%`);
      }




      query += ` order BY t1.idx desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },




  // ReceiptReturn

  getReceiptReturn: async (params) => {
    try {
 
      const { start_date, end_date, return_id} = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.return_id
          , t1.reference_receipt_id 
          , TO_CHAR(t1.return_date, 'YYYY-MM-DD') AS return_date
          , t1.client_code
          , t2.client_name 
          , t3.item_count
          , t3.supply_price
          , t3.tax
          , t3.total_price
          , t1.status
          , t1.comment
          , t1.manager
          , t1.created_by
          , t1.updated_by
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_purchase_return t1
        left join tb_client t2 on t1.client_code = t2.client_code
        left join (
            select
                return_id 
                , count(raw_code) as item_count
                , sum(supply_price) as supply_price
                , sum(tax) as tax
                , sum(total_price) as total_price
            from tb_purchase_return_det
            group by return_id 
        )  t3 on t1.return_id = t3.return_id
        WHERE 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '') {
        query += ` AND t1.return_date BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // // client_code 조건
      // if (client_code !== '') {
      //   query += ` AND t1.client_code ILIKE $${idx++}`;
      //   data.push(`%${client_code}%`);
      // }

      // // client_name 조건
      // if (client_name !== '') {
      //   query += ` AND t2.client_name ILIKE $${idx++}`;
      //   data.push(`%${client_name}%`);
      // }

      // return_id 조건
      if (return_id !== '' && return_id !== undefined) {
        query += ` AND t1.return_id ILIKE $${idx++}`;
        data.push(`%${return_id}%`);
      }

    



      query += ` order BY t1.return_id desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },


  getReceiptReturnDet: async (params) => {
    try {
      const { return_id } = params;
      const data = [return_id];

      let query = `
        SELECT 
          t1.idx
          , t1.return_det_id
          , t1.return_id 
          , t1.raw_code
          , t2.raw_name
          , t2.base_unit
          , t2.unit_size
          , t1.return_qty
          , t1.status
          , t1.lot_no 
          , t1.unit_price
          , t1.supply_price 
          , t1.tax 
          , t1.total_price 
          , t1.comment
          , t1.created_by 
          , t1.updated_by 
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_purchase_return_det t1
        left join tb_raw t2 on t1.raw_code = t2.raw_code 
        where return_id = $1
        order by t1.idx asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptReturn: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_return SET 
            status = $2
          , comment = $3
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptReturnDet: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_return_det SET 
            status = $2
          , comment = $3
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setReceiptReturnClose: async (params) => {
    
    const client = await pool.connect();

    try {
      const arr = params;
      const arr_ids = arr.map(el => el.return_id); // 필요한 키만 추출
      const data = [arr_ids];
      
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      const query = `
        UPDATE tb_purchase_receipt SET 
            status = 'complete'
          , updated_by = 'test'
          , updated_at=now()
        WHERE receipt_id = ANY($1)
        RETURNING *
      `;
      const sql1 = await client.query(query, data);
    
      const query2 = `
        UPDATE tb_purchase_return_det SET 
            status = 'complete'
          , updated_by = 'test'
          , updated_at=now()
        WHERE return_id = ANY($1)
        RETURNING *
      `;

      const sql2 = await client.query(query2, data);


      const arr_ids2 = arr.map(el => el.idx); // 필요한 키만 추출
      const data2 = [arr_ids2];

      const query3 = `
        SELECT update_receipt_stock($1::int[], 'OUT')
      `;

      const sql3 = await client.query(query3, data2);
     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        // mst: sql1.rows,
        det: sql2.rows,
        stock: sql3.rows[0].update_receipt_stock,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }


  },

  addReceiptReturn: async (params) => {

    const client = await pool.connect();

    try {

      const { 
        return_id
        , receipt_id
        , client_code
        , request_date
        , comment
        , user_id
        , status
        , det_status
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');


      const data = [
        return_id
        , receipt_id
        , client_code
        , request_date
        , status
        , comment
        , user_id
      ];
      
      const query = `
        INSERT INTO tb_purchase_return(
          return_id
          , reference_receipt_id
          , client_code
          , return_date
          , status
          , comment
          , manager
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
          , $6
          , $7
        )
        RETURNING *
      `;
      const sql1 = await client.query(query, data);


      const values = [];
      const data2 = [];
    
      sel_row.forEach((proc, index) => {
        values.push(
          `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`
        );
    
        data2.push(
          return_id,
          proc.item_dotno,
          proc.quantity,
          proc.unit_price,
          det_status,
          proc.supply_price,
          proc.tax,
          proc.total_price,
        );
      });
    
      const query2 = `
        INSERT INTO tb_purchase_return_det(
           return_id
          , item_dotno
          , return_qty
          , unit_price
          , status
          , supply_price
          , tax
          , total_price
        ) values ${values.join(', ')}
        RETURNING *
      `;

      const sql2 = await client.query(query2, data2);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        mst: sql1.rows,
        det: sql2.rows,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },


  // Release
  getRelease: async (params) => {
    try {
 
      const { item_dotno, item_name } = params;
      const data = [];

      let query = `
        select 
          t1.idx 
          , t1.item_dotno 
          , t2.item_name 
          , t1.warehouse_id 
          , t1.lot_no 
          , t1.quantity 
          , t1.unit 
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
            , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        from tb_purchase_stock t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno
        WHERE 1=1
        and t1.quantity is not null
        and t1.quantity != 0
      `;
      let idx = 1;

      // item_dotno 조건
      if (item_dotno !== '') {
        query += ` AND t1.item_dotno ILIKE $${idx++}`;
        data.push(`%${item_dotno}%`);
      }

      // item_name 조건
      if (item_name !== '') {
        query += ` AND t2.item_name ILIKE $${idx++}`;
        data.push(`%${item_name}%`);
      }

      query += ` order BY t1.quantity desc`;

      const result = await pool.query(query, data);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },


  getReleaseDet: async (params) => {
    try {
      const { Release_id } = params;
      const data = [Release_id];

      let query = `
        SELECT 
          t1.idx
          , t1.purchase_det_id
          , t1.Release_id 
          , t1.item_dotno
          , t2.item_name
          , t1.received_qty
          , t1.status
          , t1.lot_no 
          , t1.unit_price
          , t1.supply_price 
          , t1.tax 
          , t1.total_price 
          , t1.comment
          , t1.created_by 
          , t1.updated_by 
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_purchase_Release_det t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno 
        where Release_id = $1
        order by t1.idx asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRelease: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_Release SET 
            status = $2
          , comment = $3
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReleaseDet: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_Release_det SET 
            status = $2
          , received_qty = $3
          , comment = $4
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },


  addRelease: async (params, name) => {

    const client = await pool.connect();

    try {

      const { 
         release_id
        , request_date
        , comment
        , user_id
        , status
        , det_status
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');


      const data = [
         release_id
        , request_date
        , status
        , comment
        , user_id
      ];
      
      const query = `
        INSERT INTO tb_purchase_return(
           return_id
          , return_date
          , status
          , comment
          , manager
          , created_by
          , updated_by
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
          , '${name}'
          , '${name}'
        )
        RETURNING *
      `;
      const sql1 = await client.query(query, data);


      const values = [];
      const data2 = [];
    
      sel_row.forEach((proc, index) => {
        values.push(
          `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
        );
    
        data2.push(
          release_id,
          proc.raw_code,
          proc.release_qty,
          det_status,
        );
      });
    
      const query2 = `
        INSERT INTO tb_purchase_return_det(
           return_id
          , raw_code
          , return_qty
          , status
        ) values ${values.join(', ')}
        RETURNING *
      `;

      const sql2 = await client.query(query2, data2);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        mst: sql1.rows,
        // det: sql2.rows,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },

  

  delRelease: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_purchase_Release WHERE idx = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = sql1.rows;

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },

  

  // ReleaseReturn 
  addReleaseReturn: async (params) => {

    const client = await pool.connect();

    try {

      const { 
         releaseReturn_id
        , request_date
        , comment
        , user_id
        , status
        , det_status
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');


      const data = [
         releaseReturn_id
        , request_date
        , status
        , comment
        , user_id
      ];
      
      const query = `
        INSERT INTO tb_purchase_receipt(
           receipt_id
          , receipt_date
          , status
          , comment
          , manager
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
        )
        RETURNING *
      `;
      const sql1 = await client.query(query, data);


      const values = [];
      const data2 = [];
    
      sel_row.forEach((proc, index) => {
        values.push(
          `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
        );
    
        data2.push(
          releaseReturn_id,
          proc.raw_code,
          proc.quantity,
          det_status,
        );
      });
    
      const query2 = `
        INSERT INTO tb_purchase_receipt_det(
           receipt_id
          , raw_code
          , received_qty
          , status
        ) values ${values.join(', ')}
        RETURNING *
      `;

      const sql2 = await client.query(query2, data2);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        mst: sql1.rows,
        // det: sql2.rows,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },


  setReleaseReturnClose: async (params) => {
    
    const client = await pool.connect();

    try {
      const arr = params;
      const arr_ids = arr.map(el => el.return_id); // 필요한 키만 추출
      const data = [arr_ids];
      
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      const query = `
        UPDATE tb_purchase_receipt SET 
            status = 'complete'
          , updated_by = 'test'
          , updated_at=now()
        WHERE receipt_id = ANY($1)
        RETURNING *
      `;
      const sql1 = await client.query(query, data);
    
      const query2 = `
        UPDATE tb_purchase_return_det SET 
            status = 'complete'
          , updated_by = 'test'
          , updated_at=now()
        WHERE return_id = ANY($1)
        RETURNING *
      `;

      const sql2 = await client.query(query2, data);


      const arr_ids2 = arr.map(el => el.idx); // 필요한 키만 추출
      const data2 = [arr_ids2];

      const query3 = `
        SELECT update_receipt_stock($1::int[], 'IN')
      `;

      const sql3 = await client.query(query3, data2);
     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        // mst: sql1.rows,
        det: sql2.rows,
        stock: sql3.rows[0].update_receipt_stock,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }


  },

  // Inventory
  getInventory: async (params) => {
    try {
 
      const { raw_code, raw_name, bar_code } = params;
      const data = [];

      let query = `
        select 
          t1.*
          , coalesce(t2.quantity, 0) as quantity
          , CASE
            WHEN COALESCE(t1.right_qty, 0) <> 0 THEN 
              CAST(
                CAST(COALESCE(t2.quantity, 0) AS NUMERIC)
                / CAST(COALESCE(t1.right_qty, 0) AS NUMERIC)
                * 100
                AS INT
              )
            ELSE 0
            END AS stock_ratio
          , cast(t1.right_qty as int) - COALESCE(t2.quantity, 0)  as chk_cnt 
        from tb_raw t1
        left join tb_raw_stock t2 on t1.raw_code = t2.raw_code 
        WHERE 1=1
      `;
      let idx = 1;

      // raw_code 조건
      if (raw_code !== '' && raw_code !== undefined) {
        query += ` AND t1.raw_code ILIKE $${idx++}`;
        data.push(`%${raw_code}%`);
      }

      // raw_name 조건
      if (raw_name !== '' && raw_name !== undefined) {
        query += ` AND t1.raw_name ILIKE $${idx++}`;
        data.push(`%${raw_name}%`);
      }

      // bar_code 조건
      if (bar_code !== '' && bar_code !== undefined) {
        query += ` AND t1.bar_code ILIKE $${idx++}`;
        data.push(`%${bar_code}%`);
      }

      query += ` order by chk_cnt desc, quantity desc`;

      const result = await pool.query(query, data);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },



  getInventoryDet: async (params) => {
    try {
 
      const { raw_code } = params;
      const data = [raw_code];

      let query = `
        SELECT 
          t1.idx
          , t1.receipt_id
          , t1.raw_code
          , t2.raw_name 
          , t1.warehouse_id
          , t1.lot_no
          , t1.changed_quantity
          , t1.change_type
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM public.tb_raw_stock_log t1
        left join tb_raw t2 on t1.raw_code = t2.raw_code 
        where t1.raw_code = $1
        order by created_at desc
      `;

      const result = await pool.query(query, data);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setInventory: async (params) => {
    try {
      const query = `
        UPDATE tb_purchase_stock SET 
            quantity = $2
          , comment = $3
          , updated_at= CURRENT_TIMESTAMP
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // SalesOrder
  getSalesOrder: async (params) => {
    try {
 
      const { start_date, end_date, client_code, client_name, purchase_id} = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.order_id
          , t1.client_code
          , t2.client_name 
          , TO_CHAR(t1.order_date, 'YYYY-MM-DD') AS order_date
          , t3.supply_price
          , t3.tax
          , t3.total_price
          , t1.status
          , t1.comment
          , t1.created_by
          , t1.updated_by
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_sales_order t1
        left join tb_client t2 on t1.client_code = t2.client_code
        left join (
            select
                order_id 
                , sum(supply_price) as supply_price
                , sum(tax) as tax
                , sum(total_price) as total_price
            from tb_sales_order_det
            group by order_id 
        )  t3 on t1.order_id = t3.order_id
        WHERE 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '') {
        query += ` AND t1.request_date BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // client_code 조건
      if (client_code !== '') {
        query += ` AND t1.client_code ILIKE $${idx++}`;
        data.push(`%${client_code}%`);
      }

      // client_name 조건
      if (client_name !== '') {
        query += ` AND t2.client_name ILIKE $${idx++}`;
        data.push(`%${client_name}%`);
      }

      // purchase_id 조건
      if (purchase_id !== '') {
        query += ` AND t1.order_id ILIKE $${idx++}`;
        data.push(`%${purchase_id}%`);
      }




      query += ` ORDER BY t1.order_id desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },


  getSalesOrderDet: async (params) => {
    try {
      const { order_id } = params;
      const data = [order_id];

      let query = `
        SELECT 
          t1.idx
          , t1.order_id
          , t1.item_dotno
          , t2.item_name
          , t1.quantity
          , t1.unit_price
          , t1.status
          , t1.comment
          , TO_CHAR(t1.due_date, 'YYYY-MM-DD') AS due_date
          , t1.delivery_qty
          , t1.supply_price
          , t1.tax
          , t1.total_price
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM tb_sales_order_det t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno 
        where order_id = $1
        order by t1.idx asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setSalesOrder: async (params) => {
    try {
      const query = `
        UPDATE tb_sales_order SET 
            status = $2
          , comment = $3
          , updated_by = 'test'
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setSalesOrderDet: async (params) => {
    try {
      const query = `
        UPDATE tb_sales_order_det SET 
            status = $2
          , delivery_qty = $3
          , due_date = $4
          , comment = $5
          , updated_at=now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addSalesOrder: async (params) => {

    const client = await pool.connect();

    try {

      const { 
        purchase_id
        , client_code
        , request_date
        , comment
        , user_id
        , status
        , det_status
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');


      const data = [
        purchase_id
        , client_code
        , request_date
        , status
        , comment
        , user_id
      ];
      
      const query = `
        INSERT INTO tb_sales_order (
          order_id
          , client_code
          , order_date
          , status
          , comment
          , request_id
        ) values (
          $1
          , $2
          , $3
          , $4
          , $5
          , $6
        )
        RETURNING *
      `;
      const sql1 = await client.query(query, data);


      const values = [];
      const data2 = [];
    
      sel_row.forEach((proc, index) => {
        values.push(
          `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`
        );
    
        data2.push(
          purchase_id,
          proc.item_dotno,
          proc.quantity,
          proc.unit_price,
          det_status,
          proc.supply_price,
          proc.tax,
          proc.total_price,
        );
      });
    
      const query2 = `
        INSERT INTO tb_sales_order_det(
          order_id
          , item_dotno
          , quantity
          , unit_price
          , status
          , supply_price
          , tax
          , total_price
        ) values ${values.join(', ')}
        RETURNING *
      `;

      const sql2 = await client.query(query2, data2);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = {
        mst: sql1.rows,
        det: sql2.rows,
      };

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },

  delSalesOrder: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_sales_order WHERE idx = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = sql1.rows;

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },

  // WorkOrder
  getWorkOrder: async (params) => {
    try {
 
      const { start_date, end_date, item_code, item_name, work_id} = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx
          , t1.sales_id
          , t1.work_id
          , t1.process_code
          , t2.process_name 
          , t1.item_code
          , t3.item_name
          , t1.worker_id
          , t1.order_qty
          , t1.start_date
          , t1.start_time
          , t1.end_date
          , t1.end_time
          , t1.created_by
          , t1.updated_by
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
          , t1.remark
          , case 
              WHEN twr.start_dttm IS NULL AND twr.end_dttm IS NULL THEN 'ready'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NULL AND twr.pause = 'Y' THEN 'pause'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NULL AND twr.pause = 'N' THEN 'start'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NOT NULL THEN 'end'
              ELSE 'unknown'
            END AS status
          , case WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NOT NULL THEN false ELSE true end as editable
        FROM tb_work_order t1
        left join tb_process t2 on t1.process_code = t2.process_code 
        left join tb_item t3 on t1.item_code = t3.item_dotno
        left join tb_work_result twr on t1.idx = twr.work_idx
        where 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '' && start_date !== undefined && end_date !== undefined) {
        query += ` AND t1.created_at BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // item_code 조건
      if (item_code !== undefined && item_code !== '') {
        query += ` AND t1.item_code ILIKE $${idx++}`;
        data.push(`%${item_code}%`);
      }

      // item_name 조건
      if (item_name !== undefined && item_name !== '') {
        query += ` AND t1.item_name ILIKE $${idx++}`;
        data.push(`%${item_name}%`);
      }

      // work_id 조건
      if (work_id !== undefined && work_id !== '') {
        query += ` AND t1.work_id ILIKE $${idx++}`;
        data.push(`%${work_id}%`);
      }

      query += ` ORDER BY idx desc`;

      const result = await pool.query(query, data);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getWorkOrder2: async () => {
    try {
      let query = `
        select 
          two.*
          , tp.process_name 
          , ti.item_name 
          , case 
              WHEN twr.start_dttm IS NULL AND twr.end_dttm IS NULL THEN 'ready'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NULL AND twr.pause = 'Y' THEN 'pause'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NULL AND twr.pause = 'N' THEN 'start'
              WHEN twr.start_dttm IS NOT NULL AND twr.end_dttm IS NOT NULL THEN 'end'
              ELSE 'unknown'
            END AS status
        from tb_work_order two
        left join tb_process tp on two.process_code = tp.process_code 
        left join tb_item ti on two.item_code = ti.item_dotno
        left join tb_work_result twr on two.idx = twr.work_idx 
        WHERE two.start_date::timestamp <= CURRENT_DATE + INTERVAL '2 DAY'
        AND two.end_date::timestamp >= CURRENT_DATE + INTERVAL '-1 DAY'
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },


  getWorkOrderDet: async (params) => {
    try {
 
      const { work_id } = params;
      const data = [work_id];

      let query = `
        SELECT 
          t1.idx
          , t1.sales_id
          , t1.work_id
          , t1.process_code
          , t2.process_name 
          , t1.item_code
          , t3.item_name
          , t1.worker_id
          , t1.order_qty
          , t1.start_date
          , t1.start_time
          , t1.end_date
          , t1.end_time
          , t1.status
          , t1.created_by
          , t1.updated_by
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
          , t1.remark
        FROM tb_work_order t1
        left join tb_process t2 on t1.process_code = t2.process_code 
        left join tb_item t3 on t1.item_code = t3.item_dotno
        where work_id = $1
        order by t1.idx desc
      `;

      const result = await pool.query(query, data);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  
  setWorkOrder: async (params, name) => {
    try {
      const query = `
        UPDATE tb_work_order SET 
            order_qty = $2
          , status = $3
          , start_date = $4
          , start_time = $5
          , end_date = $6
          , end_time = $7
          , remark = $8
          , updated_by = '${name}'
          , updated_at = now()
        WHERE idx = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setWorkOrderPlan: async (params, name) => {
    try {
      const { id, ...rest } = params;

      const setClause = Object.entries(rest)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');

      const query = `UPDATE tb_work_order SET ${setClause} , updated_at = now(), updated_by = '${name}' WHERE idx = ${id};`;

      const result = await pool.query(query);

      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addWorkOrder: async (params, name) => {

    const client = await pool.connect();

    try {

      const { 
        work_id
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');

      const values = [];
      const data2 = [];
      sel_row.forEach((proc, index) => {
        values.push(`(
            $${index * 11 + 1}
          , $${index * 11 + 2}
          , $${index * 11 + 3}
          , $${index * 11 + 4}
          , $${index * 11 + 5}
          , $${index * 11 + 6}
          , $${index * 11 + 7}
          , $${index * 11 + 8}
          , $${index * 11 + 9}
          , $${index * 11 + 10}
          , $${index * 11 + 11}
          , '${name}'
          , '${name}'
        )`);
    
        data2.push(
          proc.order_id,
          work_id,
          proc.process_code,
          proc.item_code,
          proc.user_id,
          proc.quantity,
          proc.start_date,
          proc.start_time,
          proc.end_date,
          proc.end_time,
          proc.remark
        );

      });

      const query2 = `
        INSERT INTO tb_work_order(
          sales_id
          , work_id
          , process_code
          , item_code
          , worker_id
          , order_qty
          , start_date
          , start_time
          , end_date
          , end_time
          , remark
          , created_by
          , updated_by
        ) values ${values.join(', ')}
        RETURNING *
      `;
      const sql2 = await client.query(query2, data2);

      // 커밋
      await client.query('COMMIT');
      const result = {
        det: sql2.rows,
      };
      return result;

    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);
    }
    finally {
      // 커넥션 해제
      client.release();
    }
  },

  delWorkOrder: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_work_order WHERE idx = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

     
      // 커밋
      await client.query('COMMIT');
      
      const result = sql1.rows;

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },

  // WorkResult
  getWorkResult: async (params) => {
    try {
 

      const { start_date, end_date, item_code, item_name, work_id} = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx as work_idx
          , t1.work_id
          , t1.process_code
          , t2.process_name 
          , t1.item_code
          , t3.item_name
          , t1.worker_id
          , t1.order_qty
          , t1.start_date
          , t1.start_time
          , t1.end_date
          , t1.end_time
          , t4.idx 
          , t4.result_id 
          , TO_CHAR( t4.start_dttm, 'YYYY-MM-DD HH24:MI:SS') AS start_dttm
          , TO_CHAR( t4.end_dttm, 'YYYY-MM-DD HH24:MI:SS') AS end_dttm
          , t4.result_qty
          , t4.defect_qty
          , TO_CHAR(t4.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , t4.created_by
          , TO_CHAR(t4.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
          , t4.updated_by
          , t4.remark
          , t4.pause
          , case 
              WHEN t4.start_dttm IS NULL AND t4.end_dttm IS NULL THEN 'ready'
              WHEN t4.start_dttm IS NOT NULL AND t4.end_dttm IS NULL AND t4.pause = 'Y' THEN 'pause'
              WHEN t4.start_dttm IS NOT NULL AND t4.end_dttm IS NULL AND t4.pause = 'N' THEN 'start'
              WHEN t4.start_dttm IS NOT NULL AND t4.end_dttm IS NOT NULL THEN 'end'
              ELSE 'unknown'
            END AS status
        FROM tb_work_order t1
        left join tb_process t2 on t1.process_code = t2.process_code 
        left join tb_item t3 on t1.item_code = t3.item_dotno
        left join tb_work_result t4 on t1.idx = t4.work_idx and t1.work_id = t4.work_id
        where 1=1
      `;
      let idx = 1;
      
      // date 조건
      if (start_date !== '' && end_date !== '' && start_date !== undefined && end_date !== undefined) {
        query += ` AND t1.created_at BETWEEN $${idx++} AND $${idx++}`;
        data.push(start_date);
        data.push(end_date);
      }

      // item_code 조건
      if (item_code !== undefined && item_code !== '') {
        query += ` AND t1.item_code ILIKE $${idx++}`;
        data.push(`%${item_code}%`);
      }

      // item_name 조건
      if (item_name !== undefined && item_name !== '') {
        query += ` AND t3.item_name ILIKE $${idx++}`;
        data.push(`%${item_name}%`);
      }

      // work_id 조건
      if (work_id !== undefined && work_id !== '') {
        query += ` AND t1.work_id ILIKE $${idx++}`;
        data.push(`%${work_id}%`);
      }

      query += ` ORDER BY work_idx desc`;

      const result = await pool.query(query, data);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getWorkResult2: async (params) => {
    try {


      let query = `
        SELECT 
          t1.idx as work_idx
          , t1.work_id
          , t1.item_code
          , t3.item_name
          , t1.process_code
          , t2.process_name 
          , t4.end_dttm
        FROM tb_work_order t1
        left join tb_process t2 on t1.process_code = t2.process_code 
        left join tb_item t3 on t1.item_code = t3.item_dotno
        left join tb_work_result t4 on t1.idx = t4.work_idx and t1.work_id = t4.work_id
        WHERE t1.start_date::timestamp <= CURRENT_DATE
        and t1.end_date::timestamp >= CURRENT_DATE
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getWorkResult3: async (params) => {
    try {

      const { work_idx } = params;
      const data = [];

      let query = `
        SELECT 
          t1.idx as work_idx
          , t1.sales_id
          , t1.work_id
          , t1.process_code
          , t2.process_name 
          , t1.item_code
          , t3.item_name
          , t1.worker_id
          , t1.order_qty
          , t1.start_date
          , t1.start_time
          , t1.end_date
          , t1.end_time
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , t4.idx 
          , t4.result_id 
          , TO_CHAR( t4.start_dttm, 'YYYY-MM-DD HH24:MI:SS') AS start_dttm
          , TO_CHAR( t4.end_dttm, 'YYYY-MM-DD HH24:MI:SS') AS end_dttm
          , CASE 
            WHEN start_dttm IS NULL OR end_dttm IS NULL THEN ''
            ELSE CONCAT(
              EXTRACT(day FROM t4.end_dttm - t4.start_dttm), '일 ',
              LPAD(EXTRACT(hour FROM t4.end_dttm - t4.start_dttm)::text, 2, '0'), '시간 ',
              LPAD(EXTRACT(minute FROM t4.end_dttm - t4.start_dttm)::text, 2, '0'), '분 ',
              LPAD(FLOOR(EXTRACT(second FROM t4.end_dttm - t4.start_dttm))::text, 2, '0'), '초'
            ) END as product_dttm
          , t4.end_dttm - t4.start_dttm as product_dttm2
          , t4.result_qty
          , t4.defect_qty
          , t4.created_by
          , t4.updated_by
          , TO_CHAR(t4.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
          , t4.remark
          , t4.pause
          , case 
              WHEN t4.start_dttm IS NULL AND t4.end_dttm IS NULL THEN 'ready'
              WHEN t4.start_dttm IS NOT NULL AND t4.end_dttm IS NULL AND t4.pause = 'Y' THEN 'pause'
              WHEN t4.start_dttm IS NOT NULL AND t4.end_dttm IS NULL AND t4.pause = 'N' THEN 'start'
              WHEN t4.start_dttm IS NOT NULL AND t4.end_dttm IS NOT NULL THEN 'end'
              ELSE 'unknown'
            END AS status
        FROM tb_work_order t1
        left join tb_process t2 on t1.process_code = t2.process_code 
        left join tb_item t3 on t1.item_code = t3.item_dotno
        left join tb_work_result t4 on t1.idx = t4.work_idx and t1.work_id = t4.work_id
        WHERE t1.start_date::timestamp <= CURRENT_DATE
        and t1.end_date::timestamp >= CURRENT_DATE
        and t1.idx = '${work_idx}'
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setWorkResult: async (params, name) => {
    const client = await pool.connect();

    try {
      
      const { 
        type,
        idx,
        work_idx,
        work_id,
        result_id,
        result_qty,
        defect_qty,
        start_dttm,
        end_dttm,
        remark,
        pause,
        oldValue,
        newValue,
      } = params;
      
      const data = [
        work_idx
        , work_id
        , result_id
        , result_qty
        , defect_qty
        , start_dttm
        , end_dttm
        , remark 
      ];
      
      // 트랜잭션 시작
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO tb_work_result(
          work_idx
          , work_id
          , result_id
          , result_qty
          , defect_qty
          , start_dttm
          , end_dttm
          , remark
          , created_by 
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, '${name}'
        )
        ON CONFLICT (work_idx, work_id)
        DO UPDATE SET
           result_qty = EXCLUDED.result_qty
          , defect_qty = EXCLUDED.defect_qty
          , start_dttm = EXCLUDED.start_dttm
          , end_dttm = EXCLUDED.end_dttm
          , remark = EXCLUDED.remark
          , pause = '${pause}'
          , updated_by = '${name}'
          , updated_at = now()
        RETURNING *
      `;
      const sql = await client.query(query, data);

      if( type === 'result_qty' ) {
        const chk_oldValue = oldValue || 0; // null, undefined, '' 처리
        const change_value = newValue - chk_oldValue;

        const query2 = `
          INSERT INTO tb_work_result_log(
            result_id
            , change_qty
          ) VALUES (
            $1
            , $2
          )
          RETURNING *
        `;
        await client.query(query2, [result_id, change_value]);
      }

      if( type === 'defect_qty' ) {
        const chk_oldValue = oldValue || 0; // null, undefined, '' 처리
        const change_value = newValue - chk_oldValue;

        const query2 = `
          INSERT INTO tb_work_defect_log(
            result_id
            , change_qty
          ) VALUES (
            $1
            , $2
          )
          RETURNING *
        `;
        await client.query(query2, [result_id, change_value]);
      }

      // 커밋
      await client.query('COMMIT');

      const result = {
        rows: sql.rows,
      };

      return result;

    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);
    }
    finally {
      // 커넥션 해제
      client.release();
    }
  },

  addWorkResult: async (params) => {

    const client = await pool.connect();

    try {

      const { 
        work_id
        , sel_row
      } = params;

      
      // 트랜잭션 시작
      await client.query('BEGIN');

      const values = [];
      const data2 = [];
      sel_row.forEach((proc, index) => {
        values.push(`(
            $${index * 10 + 1}
          , $${index * 10 + 2}
          , $${index * 10 + 3}
          , $${index * 10 + 4}
          , $${index * 10 + 5}
          , $${index * 10 + 6}
          , $${index * 10 + 7}
          , $${index * 10 + 8}
          , $${index * 10 + 9}
          , $${index * 10 + 10}
        )`);
    
        data2.push(
          work_id,
          proc.process_code,
          proc.item_dotno,
          proc.user_id,
          proc.quantity,
          proc.start_date,
          proc.start_time,
          proc.end_date,
          proc.end_time,
          proc.remark
        );

      });

      const query2 = `
        INSERT INTO tb_work_result(
          work_id
          , process_code
          , item_dotno
          , worker_id
          , result_qty
          , start_date
          , start_time
          , end_date
          , end_time
          , remark
        ) values ${values.join(', ')}
        RETURNING *
      `;
      const sql2 = await client.query(query2, data2);

      // 커밋
      await client.query('COMMIT');
      const result = {
        det: sql2.rows,
      };
      return result;

    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);
    }
    finally {
      // 커넥션 해제
      client.release();
    }
  },

  delWorkResult: async (params) => {
    const client = await pool.connect();

    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        DELETE FROM tb_work_result WHERE idx = ANY($1)
        RETURNING * 
      `;
      const sql1 = await client.query(query, params);

      // 커밋
      await client.query('COMMIT');
      
      const result = sql1.rows;

      return result; 
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
    
  },


  // ProductionLog
  getProductionLog: async (params) => {
    try {
      const { today } = params;
      const data = [];

      let query = `
        SELECT 
          t1.* 
          , t2.item_name
          , t2.bar_code
        FROM tb_production_log t1
        left join tb_item t2 on t1.item_dotno = t2.item_dotno
        WHERE 1=1
      `;
      let idx = 1;


      // today 조건
      if (today !== '' && today !== undefined) {
        query += ` AND production_dt = $${idx++}`;
        data.push(`${today}`);
      }

      query += ` ORDER BY updated_at desc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },


  addProductionLog: async (params, user_nm) => {
    const client = await pool.connect();
    try {
  
      // 트랜잭션 시작
      await client.query('BEGIN');

      const query = `
        INSERT INTO tb_production_log (
          production_dt,
          item_usr_code,
          item_dotno,
          quantity,
          created_by,
          updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (production_dt, item_usr_code, item_dotno)
        DO UPDATE SET 
          quantity = tb_production_log.quantity + EXCLUDED.quantity,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW()
        RETURNING *
      `;

      // array 전달
      // for (const item of items) {
      //   const { today, item_usr_code, item_dotno, quantity } = item;
      //   const sql = await client.query(query, [today, item_usr_code, item_dotno, quantity, user_nm, user_nm]);
      // }
        
      const { today, item_usr_code, item_dotno, quantity } = params;
      const sql = await client.query(query, [today, item_usr_code, item_dotno, quantity, user_nm, user_nm]);

      // 커밋
      await client.query('COMMIT');
      const result = sql.rows;

      return result; 
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // Report
  getReportProcess: async (params) => {
    try {
      const { date } = params;
      const data = [date];

      let query = `
        WITH time_bounds AS (
          SELECT 
            $1 ::date AS base_date,
              '09:00:00'::time without time zone AS work_start,
              '17:00:00'::time without time zone AS work_end
        ), 
        prod_time AS (
          SELECT 
            t1.idx,
              t1.work_id,
              t1.process_code,
              t1.item_code,
              t11.item_name,
              t1.worker_id,
              t1.order_qty,
              t1.start_date,
              t1.start_time,
              t1.end_date,
              t1.end_time,
              t2.result_id,
              t2.start_dttm,
              t2.end_dttm,
              coalesce(t2.result_qty, 0) as result_qty,
              coalesce(t2.defect_qty, 0 ) as defect_qty,
              t2.pause,
              GREATEST(t2.start_dttm, tb.base_date + tb.work_start) AS overlap_start,
              LEAST(t2.end_dttm, tb.base_date + tb.work_end) AS overlap_end,
              round(EXTRACT(epoch FROM LEAST(least(t2.end_dttm, tb.base_date + tb.work_end), now()) - GREATEST(t2.start_dttm, tb.base_date + tb.work_start)) / 60) AS prod_min,
              round(EXTRACT(epoch FROM (tb.base_date + tb.work_end) - (tb.base_date + tb.work_start)) / 60) as total_min
          FROM tb_work_order t1
            left join tb_item t11 on t1.item_code = t11.item_dotno
            LEFT JOIN tb_work_result t2 ON t1.idx = t2.work_idx AND t1.work_id::text = t2.work_id::text
            CROSS JOIN time_bounds tb
          WHERE t2.start_dttm <= (tb.base_date + tb.work_end) AND t2.end_dttm >= (tb.base_date + tb.work_start) or t2.end_dttm is null
        )
        select 
          tp.process_code
          , tp.process_name
          , tp.process_type
          , t1.*
        from tb_process tp 
        left join prod_time t1 on tp.process_code = t1.process_code
        order by tp.process_code asc
      `;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },



};

export default apiModel;
