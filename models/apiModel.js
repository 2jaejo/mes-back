import pool from '../config/db.js';


const apiModel = {
  getItems: async () => {
    try {
      const result = await pool.query('SELECT * FROM tb_item ORDER BY id asc');
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
    }
  },

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


  // Client
  getClient: async (params) => {
    try {
      const { Client_id, use_yn } = params;
      const data = [];
      let query = `SELECT * FROM tb_Client WHERE 1=1`;
      let idx = 1;

      // Client_id 조건
      if (Client_id === '') {
        query += ` AND parent_id IS NULL`;
      } else {
        query += ` AND Client_id = $${idx++}`;
        data.push(Client_id);
      }

      // use_yn 조건
      if (use_yn !== '') {
        query += ` AND use_yn = $${idx++}`;
        data.push(use_yn);
      }

      query += ` ORDER BY Client_id asc`;

      const result = await pool.query(query, data);
      return result.rows; 

    } catch (error) {
      throw new Error(error.message);
    }
  },

  setClient: async (params) => {
    try {
      const query = `
        UPDATE tb_Client
        SET
          Client_nm = $1
          ,sort       = $2
          ,use_yn     = $3
          ,comment    = $4
        WHERE
          Client_id = $5
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
        INSERT INTO tb_Client (
          Client_id
          , Client_nm
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

  delClient: async (params) => {
    try {
      const query = `
        DELETE FROM tb_Client
        WHERE Client_id = ANY($1::text[])
        OR  parent_id = ANY($1::text[])
        RETURNING *
      `;
      const result = await pool.query(query, params);
      return result.rows; 
    } catch (error) {
      throw new Error(error.message);
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
      const sql1 = await pool.query(query, params);

      const query2 = `
        DELETE FROM tb_common_code WHERE group_code = ANY($1)
        RETURNING * 
      `;
      const sql2 = await pool.query(query2, params);

     
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
