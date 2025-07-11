import { get } from 'mongoose';
import apiService from '../services/apiService.js';
import { google } from 'googleapis';

import fs from 'fs';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const itemController = {

  getSheet: async (req, res) => {
    try {
      let keys = JSON.parse(fs.readFileSync('./sheetKey.json', 'utf8'));
      // Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
      const serviceAccountAuth = new JWT({
        // env var values here are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        email: keys.client_email,
        key: keys.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const doc = new GoogleSpreadsheet('1S-xxAQqnhIot8oeUjTAFMWCfONueb0KsNKWi5sVMnXg', serviceAccountAuth);
      // const doc = new GoogleSpreadsheet('1cWd9gQfaHOFeLyYRCNXX-8NVj4SF-5N-wwQNTQKaCgA', serviceAccountAuth);
      await doc.loadInfo(); // loads document properties and worksheets
      const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`

      const rows = await sheet.getRows(); 
      const data = [];
      rows.forEach((row, i) => {
        data.push(row._rawData);
      });
      
      const result = {
        docTitle: doc.title,
        sheetTitle: sheet.title,
        rowCount: sheet.rowCount,
        header: sheet.headerValues,
        data: data,
      };

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getMenuList: async (req, res) => {
    try {
      
      const result = await apiService.getMenuList(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
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

  scanBarcode: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.scanBarcode(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  excelMapping: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.excelMapping(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  setExcelMapping: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.setExcelMapping(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  addExcelMapping: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.addExcelMapping(data);
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
      const result = await apiService.addItem(data, req.user.name);
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

  
  // Raw
  getRaw: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.getRaw(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },    

  setRaw: async (req, res) => { 
    try {
      const data = req.body;
      const result = await apiService.setRaw(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addRaw: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.addRaw(data, req.user.name);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delRaw: async (req, res) => {
    try {
      const data = req.body;
      const result = await apiService.delRaw(data);
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
      data.user_nm = req.user.name; // 사용자 이름 추가
      const result = await apiService.setClient(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addClient: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addClient(data, req.user.name);
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

  getEquipmentCheckLog: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getEquipmentCheckLog(data);
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

  addEquipmentCheckLog: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addEquipmentCheckLog(data);
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
      const result = await apiService.addOrder(data, req.user.name);
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
      const result = await apiService.setReceiptClose(data, req.user.name);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addReceipt: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addReceipt(data, req.user.name);
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
  


  // Release
  getRelease: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getRelease(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getReleaseDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getReleaseDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setRelease: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setRelease(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReleaseDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReleaseDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addRelease: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addRelease(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  
  delRelease: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delRelease(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  
  // ReleaseReturn
  addReleaseReturn: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addReleaseReturn(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setReleaseReturn: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setReleaseReturn(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Inventory
  getInventory: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getInventory(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getInventoryDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getInventoryDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setInventory: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setInventory(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },



  // SalesOrder
  getSalesOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getSalesOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getSalesOrderDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getSalesOrderDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setSalesOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setSalesOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setSalesOrderDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setSalesOrderDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addSalesOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addSalesOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delSalesOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delSalesOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // WorkOrder
  getWorkOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getWorkOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getWorkOrderDet: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getWorkOrderDet(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setWorkOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setWorkOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addWorkOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addWorkOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delWorkOrder: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delWorkOrder(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // WorkResult
  getWorkResult: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.getWorkResult(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  setWorkResult: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.setWorkResult(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addWorkResult: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.addWorkResult(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delWorkResult: async (req, res) => {
    try {      
      const data = req.body;
      const result = await apiService.delWorkResult(data);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },




}

export default itemController;



