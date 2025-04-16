// const itemService = require('../services/itemService');
import itemService from '../services/itemService.js';

const itemController = {
  getItems: async (req, res) => {
    try {
      const sql = req.query;
      console.log(sql);
      
      const result = await itemService.getItems();
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getItemById: async (req, res) => {
    try {
      const result = await itemService.getItemById(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  addItem: async (req, res) => {
    try {
      const result = await itemService.addItem(req);
      res.status(201).json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  },
  setItem: async (req, res) => {
    try {
      const result = await itemService.setItem(req);
      res.status(202).json(result);
    } catch (error) {
      res.status(402).json({ message: error.message });
    }
  },
  delItem: async (req, res) => {
    try {
      const result = await itemService.delItem(req);
      res.status(203).json(result);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },
}

export default itemController;

// export const getItems = async (req, res) => {
//   try {
//     const result = await itemService.getItems();
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const getItemById = async (req, res) => {
//   try {
//     const result = await itemService.getItemById(req);
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
  
// };

// export const addItem = async (req, res) => {
//   try {
//     const result = await itemService.addItem(req);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(401).json({ message: error.message });
//   }
// };

// export const setItem = async (req, res) => { 
//   try {
//     const result = await itemService.setItem(req);
//     res.status(202).json(result);
//   } catch (error) {
//     res.status(402).json({ message: error.message });
//   }
// };

// export const delItem = async (req, res) => {
//   try {
//     const result = await itemService.delItem(req);
//     res.status(203).json(result);
//   } catch (error) {
//     res.status(403).json({ message: error.message });  
//   }

// };


