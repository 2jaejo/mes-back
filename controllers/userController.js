
import userService from '../services/userService.js';


const userController = {


  getUsers: async (req, res) => {
    console.log("getUsers");
    try {
      const result = await userService.getUsers(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getUser: async (req, res) => {
    console.log("getUsers");
    try {
      const result = await userService.getUser(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setUser: async (req, res) => {
    console.log("setUser");
    try {
      const result = await userService.setUser(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  addUser: async (req, res) => {
    console.log("addUser");
    try {
      const result = await userService.addUser(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delUser: async (req, res) => {
    console.log("delUser");
    try {
      const result = await userService.delUser(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  setMenu: async (req, res) => {
    console.log("setMenu");
    try {
      const result = await userService.setMenu(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  getTheme: async (req, res) => {
    console.log("getTheme");
    try {
      const result = await userService.getTheme(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setTheme: async (req, res) => {
    console.log("setTheme");
    try {
      
      const result = await userService.setTheme(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getLogs: async (req, res) => {
    console.log("getLogs");
    try {
      const result = await userService.getLogs(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getUserInfo: async (req, res) => {
    console.log("getUser");
    try {
      const result = await userService.getUserInfo(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setUserInfo: async (req, res) => {
    console.log("setUserInfo");
    try {

      const result = await userService.setUserInfo(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
 
  
}

export default userController;

