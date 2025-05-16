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

  getPriceHistory: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getPriceHistory(data);
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



  // Equipment
  getEquipment: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getEquipment(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setEquipment: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setEquipment(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addEquipment: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addEquipment(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delEquipment: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delEquipment(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  // EquipmentCheck
  getEquipmentCheck: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getEquipmentCheck(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setEquipmentCheck: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setEquipmentCheck(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addEquipmentCheck: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addEquipmentCheck(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delEquipmentCheck: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delEquipmentCheck(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Process
  getProcess: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getProcess(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setProcess: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setProcess(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addProcess: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addProcess(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delProcess: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delProcess(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  // Router
  getRouter: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getRouter(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getRouterStep: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getRouterStep(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setRouter: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setRouter(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setRouterStep: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setRouterStep(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addRouter: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addRouter(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delRouter: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delRouter(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Bom
  getBom: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getBom(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setBom: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setBom(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addBom: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addBom(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delBom: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delBom(data);
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









  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  





  // Order
  getOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getOrderDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getOrderDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setOrderDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setOrderDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  
  
  // Receipt
  getReceipt: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getReceipt(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getReceiptDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getReceiptDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReceipt: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReceipt(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReceiptDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReceiptDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReceiptClose: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReceiptClose(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addReceipt: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addReceipt(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delReceipt: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delReceipt(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },




  // ReceiptLog
  getReceiptLog: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getReceiptLog(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  // ReceiptReturn

  getReceiptReturn: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getReceiptReturn(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getReceiptReturnDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getReceiptReturnDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReceiptReturn: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReceiptReturn(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReceiptReturnDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReceiptReturnDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReceiptReturnClose: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReceiptReturnClose(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addReceiptReturn: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addReceiptReturn(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },











}

export default itemController;



