import pool from "../config/db.js";

const userModel = {

  getUsers: async (req) => {
    try {
      // 검색조건
      const { user_id, user_nm } = req.body;

      // SQL 쿼리문
      let sql = `
        SELECT 
          idx 	
          , company_cd
          , user_id
          , user_nm
          , to_char(input_dt, 'YYYY-MM-DD HH24:MI:SS') AS input_dt
          , email
          , phone
          , addr
          , birthday
        FROM tb_user
        where 1 = 1
      `;

      const params = [];
      let paramIndex = 1;

      if (user_id) {
        sql += ` and user_id = $${paramIndex}`;
        params.push(user_id);
        paramIndex++;
      }

      if (user_nm) {
        sql += ` and user_nm ILIKE $${paramIndex}`;
        params.push(`%${user_nm}%`);
        paramIndex++;
      }

      sql += ` order by idx desc`;

      const result = await pool.query(sql, params);

      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUser: async (req) => {
    try {
      // 검색조건
      const { user_id } = req.body;
      const params = [user_id];

      // SQL 쿼리문
      let sql = `
        SELECT 
          idx 	
          , company_cd
          , user_id
          , user_nm
          , to_char(input_dt, 'YYYY-MM-DD HH24:MI:SS') AS input_dt
          , email
          , phone
          , addr
          , birthday
        FROM tb_user
        where user_id = $1
      `;

      const result = await pool.query(sql, params);

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserMenu: async (req) => {

    try {
      // 검색조건
      const { user_id } = req.body;
      const params = [user_id];

      // SQL 쿼리문
      let sql = `
        SELECT 
          m.*
          , CASE
            WHEN EXISTS (
              SELECT 1 FROM tb_user_menu um WHERE um.user_id = $1
            )
            THEN
              CASE WHEN um.user_id IS NOT NULL THEN 'y' ELSE 'n' END
            ELSE
              'y'
          END AS show
        FROM tb_menu m
        LEFT JOIN tb_user_menu um ON um.menu_id = m.menu_id AND um.user_id = $1
        WHERE m.parent_id IS NULL 
        AND m.use_yn = 'Y'
        ORDER BY m.sort
      `;

      const result = await pool.query(sql, params);

      return result.rows;
    }
    catch (error) { 
      throw new Error(error.message);
    }
  },

  setUser: async (params) => {
    try {
      const result = await pool.query(
        `UPDATE tb_User SET 
          user_nm = $2 
          , email = $3
          , phone = $4
          , addr = $5
          , birthday = $6
        WHERE user_id = $1 
        RETURNING * `,
        params
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  

  addUser: async (params) => {
    const client = await pool.connect();

    try {
      // 트랜잭션 시작

      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO tb_User (
          company_cd
          , user_id
          , user_pw
          , user_nm
          , input_dt
          , email
          , phone
          , addr
          , birthday
        ) VALUES (
          '000'
          , $1
          , $2
          , $3
          , now()
          , $4
          , $5
          , $6
          , $7
        ) 
        RETURNING user_id, user_nm, email, phone, addr, birthday  
        `,
        params
      );

      const params2 = [params[0]]; // user_id
      const result2 = await client.query(
        `INSERT INTO tb_user_menu (user_id, menu_id)
        VALUES ($1, 'pop')
        ON CONFLICT DO NOTHING
        RETURNING *`,
        params2
      );

      await client.query('COMMIT');
      
      return {
        user: result.rows[0], 
        menu: result2.rows[0]
      };
    } catch (error) {
      // 에러 발생 시 롤백
      await client.query("ROLLBACK");
      throw new Error(error.message);

    } finally {
      // 커넥션 해제
      client.release();
    }
  },

  delUser: async (params) => {
    try {
      const result = await pool.query(
        `DELETE FROM tb_User 
          WHERE user_id = $1
          RETURNING *`
        , params
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },


  setMenu: async (req) => {
    const client = await pool.connect();

    try {
      const { user_id, menus } = req.body;
  
      // 트랜잭션 시작

      await client.query('BEGIN');

      const del_params = [user_id];
      await client.query(
        `DELETE FROM tb_user_menu 
        WHERE user_id = $1`
        , del_params
      );

      const values = [];
      const params = [];
      menus.forEach((row, i) => {
        const idx = i * 2;
        values.push(`($${idx + 1}, $${idx + 2})`);
        params.push(user_id, row);
      });

      const result = await client.query(
        `INSERT INTO tb_user_menu (user_id, menu_id)
        VALUES ${values.join(', ')} 
        ON CONFLICT DO NOTHING
        RETURNING *`,
        params
      );
      
      await client.query('COMMIT');
      
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


  getTheme: async (params) => {
    try {
      const result = await pool.query(
        "SELECT * FROM tb_theme where user_id = $1",
        params
      );
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addTheme: async (params) => {
    try {
      const result = await pool.query(
        `INSERT INTO tb_theme (
          user_id
          , color
          , bg_color
        ) VALUES (
          $1
          , $2
          , $3
        ) RETURNING *`,
        params
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setTheme: async (params) => {
    try {
      const result = await pool.query(
        `UPDATE tb_theme SET 
        color = $2
        , bg_color = $3 
        WHERE user_id = $1 
        RETURNING * `,
        params
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getLogs: async (req) => {
    try {
      // 검색조건
      const { user_id, ip_address, login_dt } = req.body;

      // SQL 쿼리문
      let sql = `
          SELECT 
            user_id 	
            , ip_address
            , user_agent
            , to_char(login_dt, 'YYYY-MM-DD HH24:MI:SS') AS login_dt
            , success
          FROM login_history 
          where 1 = 1
        `;
      const params = [];
      let paramIndex = 1;

      if (user_id) {
        sql += ` and user_id = $${paramIndex}`;
        params.push(user_id);
        paramIndex++;
      }

      if (ip_address) {
        sql += ` and ip_address ILIKE $${paramIndex}`;
        params.push(`%${ip_address}%`);
        paramIndex++;
      }

      if (login_dt) {
        sql += ` and login_dt >= $${paramIndex}`;
        params.push(login_dt);
        paramIndex++;
      }

      sql += ` order by login_dt desc`;

      const result = await pool.query(sql, params);

      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertLog: async (params) => {
    try {
      const result = await pool.query(
        `INSERT INTO login_history (
            user_id
            , ip_address
            , user_agent
            , login_dt
            , success
          ) VALUES (
            $1
            , $2
            , $3
            , now()
            , $4
          ) RETURNING *`,
        params
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserInfo: async (params) => {
    try {
      const result = await pool.query(
        `SELECT 
            user_id 	
            , user_nm
            , COALESCE(email, '') as email 	
            , COALESCE(phone, '') as phone 	
            , COALESCE(addr, '') as addr 	
            , COALESCE(birthday, '') as birthday 	
          FROM tb_User 
          where user_id = $1`,
        params
      );
      return result.rows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setUserInfo: async (user_id, params) => {
    try {
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(params)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      if (setClauses.length === 0) {
        console.log('업데이트할 값이 없습니다.');
        return;
      }

      const query = `
        UPDATE tb_user
        SET ${setClauses.join(', ')}
        WHERE user_id = '${user_id}'
        returning user_id, user_nm, email, phone, addr, birthday
      `;

      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default userModel;
