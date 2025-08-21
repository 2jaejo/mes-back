import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';


const userService = {


  getUsers: async (req) => {
    try {
    
      return await userModel.getUsers(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUser: async (req) => {
    try {
      const result = {};

      result.user_info = await userModel.getUser(req);
      result.user_menu = await userModel.getUserMenu(req);

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setUser: async (req) => {
    try {
      const { user_id, user_nm, email, phone, addr, birthday } = req.body;
      const params = [user_id, user_nm, email, phone, addr, birthday];

      return await userModel.setUser(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  addUser: async (req) => {
    try {
      const { user_id, pw, user_nm, email, phone, addr, birthday } = req.body;

      // 비밀번호 해시
      const hashed_pw = await bcrypt.hash(pw, 10);
      const params = [user_id, hashed_pw, user_nm, email, phone, addr, birthday];

      return await userModel.addUser(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delUser: async (req) => {
    try {
      const { user_id, user_nm } = req.body;
      const params = [user_id];

      if (user_id === 'admin'){
        throw new Error('admin은 삭제 할 수 없습니다.');
      }
      
      if (user_nm === '관리자'){
        throw new Error('관리자는 삭제 할 수 없습니다.');
      }
     
      return await userModel.delUser(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  setMenu: async (req) => {
    try {
      const { user_id } = req.body;
      if (user_id === 'admin'){
        throw new Error('admin은 수정 할 수 없습니다.');
      }

      return await userModel.setMenu(req);
    } catch (error) {
      throw new Error(error.message);
    } 
  },


  getTheme: async (req) => {
    try {
      const { id } = req.user;
      const params = [id];

      return await userModel.getTheme(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setTheme: async (req) => {
    try {
      const { id } = req.user;
      const { color, bgColor } = req.body;

      const params = [id];
      const params2 = [id, color, bgColor];

      let theme = await userModel.getTheme(params);

      if (theme.length === 0) {
        return await userModel.addTheme(params2);
      } else {
        return await userModel.setTheme(params2);
      }

    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertLog: async (req) => {
    try {
      await userModel.insertLog(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getLogs: async (req) => {
    try {
      const { id } = req.user;
      const params = [id];

      //사용자 롤 추가 필요


      return await userModel.getLogs(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  getUserInfo: async (req) => {
    try {
      const { id } = req.user;
      const params = [id];
      return await userModel.getUserInfo(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setUserInfo: async (req) => {
    try {
      const { id } = req.user;
      const { pw, email, phone, addr, birthday } = req.body;

      const params = {email, phone, addr, birthday};
      if (pw && pw.trim() !== '' && pw !== undefined) {
        // 비밀번호가 입력된 경우에만 추가
        // 비밀번호 해시
        const hashed_pw = await bcrypt.hash(pw, 10);
        // params에 비밀번호 추가
        params.user_pw = hashed_pw;
      }

      return await userModel.setUserInfo(id, params);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
};

export default userService;

