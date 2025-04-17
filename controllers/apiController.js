import { get } from 'mongoose';
import apiService from '../services/apiService.js';

const itemController = {

  getMenuList: async (req, res) => {
    try {
      
      const result = await apiService.getMenuList(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  getDropDown: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.getDropDown(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  

  
  // Category
  getCategoryMst: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getCategoryMst(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getCategoryDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getCategoryDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setCategory: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setCategory(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addCategory: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addCategory(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delCategory: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delCategory(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  // item
  getItem: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getItem(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setItem: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setItem(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addItem: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addItem(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delItem: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delItem(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  // price
  getPrice: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getPrice(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setPrice: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setPrice(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addPrice: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addPrice(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delPrice: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delPrice(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  

  // Client
  getClient: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getClient(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setClient: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setClient(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addClient: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addClient(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delClient: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delClient(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },



  // Code
  getCodeMst: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getCodeMst(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getCodeDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getCodeDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setCodeMst: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setCodeMst(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setCodeDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setCodeDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addCodeMst: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addCodeMst(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addCodeDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addCodeDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delCodeMst: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delCodeMst(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delCodeDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delCodeDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  
}

export default itemController;



