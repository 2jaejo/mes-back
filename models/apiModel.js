import pool from '../config/db.js';


const apiModel = {

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
        UNION
        SELECT mm.*
        FROM tb_menu mm
        WHERE NOT EXISTS (
          SELECT 1 FROM tb_user_menu um
          WHERE user_id = $1
        )
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



  // category
  getCategoryMst: async (params) => {
    try {
      const { category_id, use_yn } = params;
      const data = [];
      let query = `SELECT * FROM tb_category WHERE 1=1`;
      let idx = 1;

      // category_id 조건
      if (category_id === '') {
        query += ` AND parent_id IS NULL`;
      } else {
        query += ` AND category_id = $${idx++}`;
        data.push(category_id);
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
      const { item_type, item_group_a, item_group_b, use_yn, item_code, item_name, client_code, client_name } = params;
      const data = [];

      let query = `SELECT * FROM tb_item WHERE 1=1`;
      let idx = 1;
      
      // item_type 조건
      if (item_type !== '' && item_type !== undefined) {
        query += ` AND item_type = $${idx++}`;
        data.push(item_type);
      }

      // item_group_a 조건
      if (item_group_a !== '' && item_group_a !== undefined) {
        query += ` AND item_group_a = $${idx++}`;
        data.push(item_group_a);
      }

      // item_group_b 조건
      if (item_group_b !== '' && item_group_b !== undefined) {
        query += ` AND item_group_b = $${idx++}`;
        data.push(item_group_b);
      }

      // use_yn 조건
      if (use_yn !== '' && use_yn !== undefined) {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      // item_code 조건
      if (item_code !== '' && item_code !== undefined) {
        query += ` AND item_code ILIKE $${idx++}`;
        data.push(`%${item_code}%`);
      }

      // item_name 조건
      if (item_name !== '' && item_name !== undefined) {
        query += ` AND item_name ILIKE $${idx++}`;
        data.push(`%${item_name}%`);
      }

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

      query += ` ORDER BY item_code asc`;

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
          , updated_at=now()
        WHERE item_code = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addItem: async (params) => {
    try {

      const query = `
        INSERT INTO tb_item (
          item_code
          , item_name
          , item_type
          , item_group_a
          , item_group_b
          , base_unit
          , purchase_unit
          , default_warehouse
          , inspection_method
          , incoming_inspection
          , outgoing_inspection
          , standard_price
          , shelf_life_days
          , shelf_life_managed
          , lot_managed
          , use_yn
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
          , $7
          , $8
          , $9
          , $10
          , $11
          , $12
          , $13
          , $14
          , $15
          , $16
          , $17
          , now()
          , now()
        )
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delItem: async (params) => {
    try {
      const query = `
        DELETE FROM tb_item
        WHERE item_code = ANY($1::text[])
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
        SELECT DISTINCT ON (t1.item_code, t1.quantity_min, t1.quantity_max)
          t1.idx
          , t1.price_id
          , t1.item_code
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
        left join tb_item t2 on t1.item_code = t2.item_code 
        WHERE t1.use_yn = 'Y'
        AND t1.client_code = $1 
        AND t1.start_date <= CURRENT_DATE
        AND (t1.end_date IS NULL OR t1.end_date >= CURRENT_DATE)
        ORDER by t1.item_code, t1.quantity_min, t1.quantity_max, t1.start_date desc, t1.idx desc
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
          , t1.item_code
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
        left join tb_item t2 on t1.item_code = t2.item_code 
        WHERE t1.use_yn = 'Y'
        AND t1.item_code = $1 
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
           item_code
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

      query += ` ORDER BY client_code asc`;

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
          client_name = $2
          , client_type = $3
          , business_no = $4
          , business_type = $5
          , business_item = $6
          , ceo_name = $7
          , contact_name = $8
          , contact_phone = $9
          , contact_fax = $10
          , contact_email = $11
          , address = $12
          , use_yn = $13
          , comment = $14
          , updated_at = now()
        WHERE
          client_code = $1
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addClient: async (params) => {
    try {

      const query = `
        INSERT INTO tb_client(
          client_code
          , client_name
          , client_type
          , business_no
          , business_type
          , business_item
          , ceo_name
          , contact_name
          , contact_phone
          , contact_fax
          , contact_email
          , address
          , use_yn
          , comment
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
          , $8
          , $9
          , $10
          , $11
          , $12
          , $13
          , $14
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

  delClient: async (params) => {
    try {
      const query = `
        DELETE FROM tb_client
        WHERE client_code = ANY($1::text[])
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
          , location
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
      if (equipment_code !== '') {
        query += ` AND equipment_code ILIKE $${idx++}`;
        data.push(`%${equipment_code}%`);
      }

      // equipment_name 조건
      if (equipment_name !== '') {
        query += ` AND equipment_name ILIKE $${idx++}`;
        data.push(`%${equipment_name}%`);
      }

      // equipment_type 조건
      if (equipment_type !== '') {
        query += ` AND equipment_type = $${idx++}`;
        data.push(equipment_type);
      }

      // use_yn 조건
      if (use_yn !== '') {
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
          , t1.item_code
          , t2.item_name 
          , t1.router_code
          , t1.router_name
          , t1."version"
          , t1.use_yn
          , t1."comment"
          , t1.created_at
          , t1.updated_at
        FROM tb_router t1
        left join tb_item t2 on t1.item_code = t2.item_code
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
          , t2.process_name
          , t1.expected_time_min
          , t1.is_optional
          , t1."comment"
          , t1.created_at
          , t1.updated_at
        FROM tb_router_step t1
        left join tb_process t2 on t1.process_code = t2.process_code
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
        , item_code
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
        , item_code
        , use_yn
        , version
        , comment
      ];

      const query = `
        INSERT INTO tb_router(
          router_code
          , router_name
          , item_code
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
      const { item_code } = params;
      const data = [item_code];

      let query = `
        SELECT 
          t1.idx
          , t1.item_code
          , t2.item_name
          , t1.material_code
          , t3.item_name as material_name
          , t1.quantity
          , t1.unit
          , t1.sort
          , t1.comment
          , TO_CHAR(t1.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
          , TO_CHAR(t1.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
        FROM public.tb_bom t1
        left join tb_item t2 on t1.item_code = t2.item_code
        left join tb_item t3 on t1.material_code = t3.item_code
        where t1.item_code = $1
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
          item_code
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
};

export default apiModel;
