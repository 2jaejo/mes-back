import { get, set } from 'mongoose';
import apiModel from '../models/apiModel.js';


const apiService = {

  getMenuList: async (req) => {
    try {
      console.log("getMenuList");

      const { id } = req.user;
      const params = [id];

      return await apiModel.getMenuList(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getDropDown: async (params) => {
    try {
      console.log("getDropDown");

      return await apiModel.getDropDown(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },




  // Category
  getCategoryMst: async (req) => {
    try {
      return await apiModel.getCategoryMst(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCategoryDet: async (params) => {
    try {
      const { category_id } = params;
      const data = [category_id];
      return await apiModel.getCategoryDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setCategory: async (params) => {
    try {
      const { category_id, category_nm, sort, use_yn, comment, company_cd } = params;
      const data = [category_nm, sort, use_yn, comment, category_id ];
      return await apiModel.setCategory(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addCategory: async (params) => {
    try {
      const { category_id, category_nm, sort, use_yn, comment, parent_id } = params;
      const data = [category_id, category_nm, sort, use_yn, comment, parent_id ];
      return await apiModel.addCategory(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delCategory: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.category_id); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delCategory(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // Item
  getItem: async (req) => {
    try {
      return await apiModel.getItem(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setItem: async (params) => {
    try {
      const { 
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
      } = params;

      const data = [
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
      ];

      return await apiModel.setItem(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addItem: async (params) => {
    try {
      const { 
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
      } = params;

      const data = [
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
      ];
      return await apiModel.addItem(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delItem: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.item_code); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delItem(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // Price
  getPrice: async (params) => {
    try {
      const { client_code } = params;
      const data = [client_code]; 
      return await apiModel.getPrice(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getPriceHistory: async (params) => {
    try {
      const { item_code, client_code } = params;
      const data = [item_code, client_code]; 
      return await apiModel.getPriceHistory(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setPrice: async (params) => {
    try {
      const { 
        idx
        , quantity_min
        , quantity_max
        , price
        , discount_rate
        , start_date
        , end_date
        , comment
      } = params;

      const data = [
        idx
        , quantity_min
        , quantity_max
        , price
        , discount_rate
        , start_date
        , end_date
        , comment
      ];

      return await apiModel.setPrice(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addPrice: async (params) => {
    try {
      const { 
        item_code
        , client_code
      } = params;

      const data = [
         item_code
        , client_code
      ];
      return await apiModel.addPrice(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delPrice: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.idx); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delPrice(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // Client
  getClient: async (req) => {
    try {
      return await apiModel.getClient(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setClient: async (params) => {
    try {
      const { 
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
      } = params;

      const data = [
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
      ];

      return await apiModel.setClient(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addClient: async (params) => {
    try {
      const { 
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
      } = params;

      const data = [
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
      ];
      return await apiModel.addClient(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delClient: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.client_code); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delClient(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },



  // Equipment
  getEquipment: async (req) => {
    try {
      return await apiModel.getEquipment(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setEquipment: async (params) => {
    try {
      const { 
        equipment_id
        , equipment_code
        , equipment_name
        , equipment_type
        , manufacturer
        , model
        , location
        , status
        , install_date
        , use_yn
        , comment
      } = params;

      const data = [
        equipment_code
        , location
        , status
        , install_date
        , use_yn
        , comment
      ];

      return await apiModel.setEquipment(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addEquipment: async (params) => {
    try {
      const { 
        equipment_code
        , equipment_name
        , equipment_type
        , manufacturer
        , model
        , install_date
        , location
        , status
        , use_yn
        , comment
      } = params;

      const data = [
        equipment_code
        , equipment_name
        , equipment_type
        , manufacturer
        , model
        , install_date
        , location
        , status
        , use_yn
        , comment
      ];
      return await apiModel.addEquipment(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delEquipment: async (params) => {
    try {
      const {arr} = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.equipment_code); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delEquipment(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // EquipmentCheck
  getEquipmentCheck: async (params) => {
    try {
      const { equipment_code } = params;
      const data = [equipment_code];

      return await apiModel.getEquipmentCheck(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getEquipmentCheckLog: async (params) => {
    try {
      return await apiModel.getEquipmentCheckLog(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setEquipmentCheck: async (params) => {
    try {
      const { 
        check_code
        , method
        , standard
        , cycle
        , comment
      } = params;

      const data = [
        check_code
        , method
        , standard
        , cycle
        , comment
      ];

      return await apiModel.setEquipmentCheck(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addEquipmentCheck: async (params) => {
    try {
      const { 
        equipment_code
        , check_code
        , check_name
        , method
        , standard
        , cycle
        , comment
      } = params;

      const data = [
        equipment_code
        , check_code
        , check_name
        , method
        , standard
        , cycle
        , comment
      ];
      return await apiModel.addEquipmentCheck(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addEquipmentCheckLog: async (params) => {
    try {
 
      return await apiModel.addEquipmentCheckLog(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delEquipmentCheck: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.check_code); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delEquipmentCheck(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // Process
  getProcess: async (params) => {
    try {
      return await apiModel.getProcess(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setProcess: async (params) => {
    try {
      const { 
        process_code
        , check_yn
        , use_yn
        , comment
      } = params;

      const data = [
        process_code
        , check_yn
        , use_yn
        , comment
      ];

      return await apiModel.setProcess(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addProcess: async (params) => {
    try {
      const { 
        process_code
        , process_name
        , process_type
        , check_yn
        , use_yn
        , comment
      } = params;

      const data = [
        process_code
        , process_name
        , process_type
        , check_yn
        , use_yn
        , comment
      ];
      return await apiModel.addProcess(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delProcess: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.process_code); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delProcess(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Router
  getRouter: async (params) => {
    try {
      return await apiModel.getRouter(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getRouterStep: async (params) => {
    try {
      return await apiModel.getRouterStep(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRouter: async (params) => {
    try {
      const { 
        router_code
        , use_yn
        , comment
      } = params;

      const data = [
        router_code
        , use_yn
        , comment
      ];

      return await apiModel.setRouter(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRouterStep: async (params) => {
    try {
      const { 
        idx
        , expected_time_min
        , is_optional
        , comment
      } = params;

      const data = [
        idx
        , expected_time_min
        , is_optional
        , comment
      ];

      return await apiModel.setRouterStep(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addRouter: async (params) => {
    try {
      return await apiModel.addRouter(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delRouter: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.router_code); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delRouter(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Bom
  getBom: async (params) => {
    try {
      return await apiModel.getBom(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setBom: async (params) => {
    try {
      const { 
        idx
        , quantity
        , unit
        , sort
        , comment
      } = params;

      const data = [
        idx
        , quantity
        , unit
        , sort
        , comment
      ];

      return await apiModel.setBom(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addBom: async (params) => {
    try {
      const { 
        item_code
        , material_code
      } = params;

      const data = [
        item_code
        , material_code
      ];
      return await apiModel.addBom(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delBom: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.idx); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delBom(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },



  // Code
  getCodeMst: async (req) => {
    try {
      return await apiModel.getCodeMst(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCodeDet: async (params) => {
    try {
      const { group_code } = params;
      const data = [group_code];
      return await apiModel.getCodeDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setCodeMst: async (params) => {
    try {
      const { group_code, group_name, sort, use_yn, comment } = params;
      const data = [ group_code, group_name, sort, use_yn, comment ];
      return await apiModel.setCodeMst(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setCodeDet: async (params) => {
    try {
      const { group_code, code, code_name, sort, use_yn, comment, opt1, opt2, opt3 } = params;
      const data = [ group_code, code, code_name, sort, use_yn, comment, opt1, opt2, opt3 ];
      return await apiModel.setCodeDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addCodeMst: async (params) => {
    try {
      const { group_code, group_name, sort, use_yn, comment } = params;
      const data = [ group_code, group_name, sort, use_yn, comment ];
      return await apiModel.addCodeMst(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  addCodeDet: async (params) => {
    try {
      const { group_code, code, code_name, sort, use_yn, comment, opt1, opt2, opt3 } = params;
      const data = [ group_code, code, code_name, sort, use_yn, comment, opt1, opt2, opt3 ];
      return await apiModel.addCodeDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delCodeMst: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      // 필요한 키만 추출
      const arr_ids = arr.map(el => el.group_code); 
      const data = [arr_ids];

      return await apiModel.delCodeMst(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delCodeDet: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      // 필요한 키만 추출
      const arr_ids = arr.map(el => el.code); 
      const data = [arr[0].group_code, arr_ids];

      return await apiModel.delCodeDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },




  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  // Order
  getOrder: async (params) => {
    try {
      return await apiModel.getOrder(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOrderDet: async (params) => {
    try {
      
      return await apiModel.getOrderDet(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setOrder: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setOrder(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setOrderDet: async (params) => {
    try {
      const { 
        idx
        , status
        , received_qty
        , due_date
        , comment
      } = params;

      const data = [
        idx
        , status
        , received_qty
        , due_date
        , comment
      ];

      return await apiModel.setOrderDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addOrder: async (params) => {
    try {
      const purchase_id = await apiModel.generagteTableId({prefix:'PO', table_name:'tb_purchase'});
      // console.log(purchase_id);
      params.purchase_id = purchase_id.id;
      params.status = 'ready';
      params.det_status = 'pending';
      return await apiModel.addOrder(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delOrder: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.idx); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delOrder(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  // Receipt
  getReceipt: async (params) => {
    try {
      return await apiModel.getReceipt(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getReceiptDet: async (params) => {
    try {
      
      return await apiModel.getReceiptDet(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceipt: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setReceipt(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptDet: async (params) => {
    try {
      const { 
        idx
        , status
        , received_qty
        , comment
      } = params;

      const data = [
        idx
        , status
        , received_qty
        , comment
      ];

      return await apiModel.setReceiptDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptClose: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      return await apiModel.setReceiptClose(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addReceipt: async (params) => {
    try {
      const id = await apiModel.generagteTableId({prefix:'RV', table_name:'tb_purchase_receipt'});
      params.receipt_id = id.id;
      params.status = 'ready';
      params.det_status = 'pending';
      return await apiModel.addReceipt(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delReceipt: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.idx); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delReceipt(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  

  // ReceiptLog
  getReceiptLog: async (params) => {
    try {
      return await apiModel.getReceiptLog(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },



  // ReceiptReturn
  getReceiptReturn: async (params) => {
    try {
      return await apiModel.getReceiptReturn(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getReceiptReturnDet: async (params) => {
    try {
      
      return await apiModel.getReceiptReturnDet(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptReturn: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setReceiptReturn(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptReturnDet: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setReceiptReturnDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReceiptReturnClose: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      return await apiModel.setReceiptReturnClose(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addReceiptReturn: async (params) => {
    try {
      const id = await apiModel.generagteTableId({prefix:'RT', table_name:'tb_purchase_return'});
      params.return_id = id.id;
      params.status = 'ready';
      params.det_status = 'pending';
      return await apiModel.addReceiptReturn(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },



  // Release
  getRelease: async (params) => {
    try {
      return await apiModel.getRelease(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getReleaseDet: async (params) => {
    try {
      
      return await apiModel.getReleaseDet(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setRelease: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setRelease(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReleaseDet: async (params) => {
    try {
      const { 
        idx
        , status
        , received_qty
        , comment
      } = params;

      const data = [
        idx
        , status
        , received_qty
        , comment
      ];

      return await apiModel.setReleaseDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addRelease: async (params) => {
    try {
      const id = await apiModel.generagteTableId({prefix:'RS', table_name:'tb_purchase_return'});
      params.release_id = id.id;
      params.status = 'ready';
      params.det_status = 'pending';
      return await apiModel.addRelease(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  
  delRelease: async (params) => {
    try {
      const arr = params;
      
      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
      
      const arr_ids = arr.map(el => el.idx); // 필요한 키만 추출
      const data = [arr_ids];
      
      return await apiModel.delRelease(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  // ReleaseReturn
  addReleaseReturn: async (params) => {
    try {
      const id = await apiModel.generagteTableId({prefix:'RR', table_name:'tb_purchase_return'});
      params.releaseReturn_id = id.id;
      params.status = 'ready';
      params.det_status = 'pending';
      return await apiModel.addReleaseReturn(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setReleaseReturn: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setReleaseReturn(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },


  // Inventory
  getInventory: async (params) => {
    try {
      return await apiModel.getInventory(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getInventoryDet: async (params) => {
    try {
      return await apiModel.getInventoryDet(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setInventory: async (params) => {
    try {
      const { 
        idx
        , quantity
        , comment
      } = params;

      const data = [
        idx
        , quantity
        , comment
      ];

      return await apiModel.setInventory(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },





// SalesOrder
  getSalesOrder: async (params) => {
    try {
      return await apiModel.getSalesOrder(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSalesOrderDet: async (params) => {
    try {
      
      return await apiModel.getSalesOrderDet(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setSalesOrder: async (params) => {
    try {
      const { 
        idx
        , status
        , comment
      } = params;

      const data = [
        idx
        , status
        , comment
      ];

      return await apiModel.setSalesOrder(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  setSalesOrderDet: async (params) => {
    try {
      const { 
        idx
        , status
        , delivery_qty
        , due_date
        , comment
      } = params;

      const data = [
        idx
        , status
        , delivery_qty
        , due_date
        , comment
      ];

      return await apiModel.setSalesOrderDet(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addSalesOrder: async (params) => {
    try {
      const gen_id = await apiModel.generagteTableId({prefix:'SO', table_name:'tb_sales_order'});
      // console.log(gen_id);
      params.purchase_id = gen_id.id;
      params.status = 'ready';
      params.det_status = 'pending';
      return await apiModel.addSalesOrder(params);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delSalesOrder: async (params) => {
    try {
      const arr = params;

      if (!Array.isArray(arr)) {
        return res.status(400).json({ message: '배열이 필요합니다.' });
      }
    
      const arr_ids = arr.map(el => el.idx); // 필요한 키만 추출
      const data = [arr_ids];

      return await apiModel.delSalesOrder(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },












  
};

export default apiService;
