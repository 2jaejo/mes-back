// const itemModel = require('../models/itemModel');
import itemModel from '../models/itemModel.js';


const itemService = {
  getItems: async () => {
    try {
      return await itemModel.getItems();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getItemById: async (req) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new Error('Invalid ID');
      }
      const params = [id];
      return await itemModel.getItemById(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  addItem: async (req) => {
    try {
      const { name } = req.body;
      const params = [name, name+"@gmail.com"];
      return await itemModel.addItem(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  setItem: async (req) => {
    try {
      const { id, name } = req.body;
      const params = [name, name+"@gmail.com", id];
      return await itemModel.setItem(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  delItem: async (req) => {
    try {
      const id = parseInt(req.params.id, 10);
      const params = [id];
      return await itemModel.delItem(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default itemService;

// export const getItems = async () => {
//   try {
//     return await itemModel.getItems();
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// export const getItemById = async (req) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     if (isNaN(id)) {
//       throw new Error('Invalid ID');
//     }
//     const params = [id];
//     return await itemModel.getItemById(params);
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// export const addItem = async (req) => {
//   try {
//     const { name } = req.body;
//     const params = [name, name+"@gmail.com"];
//     return await itemModel.addItem(params);
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// export const setItem = async (req) => {
//   try {
//     const { id, name } = req.body;
//     const params = [name, name+"@gmail.com", id];
//     return await itemModel.setItem(params);
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

// export const delItem = async (req) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const params = [id];
//     return await itemModel.delItem(params);
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }
