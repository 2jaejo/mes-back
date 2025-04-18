import { get } from 'mongoose';
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
  getPrice: async (req) => {
    try {
      return await apiModel.getPrice(req);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  setPrice: async (params) => {
    try {
      const { 
        Price_code
        , Price_name
        , Price_type
        , Price_group_a
        , Price_group_b
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
        Price_code
        , Price_name
        , Price_type
        , Price_group_a
        , Price_group_b
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

      return await apiModel.setPrice(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  addPrice: async (params) => {
    try {
      const { 
        Price_code
        , Price_name
        , Price_type
        , Price_group_a
        , Price_group_b
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
        Price_code
        , Price_name
        , Price_type
        , Price_group_a
        , Price_group_b
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
    
      const arr_ids = arr.map(el => el.Price_code); // 필요한 키만 추출
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

  
};

export default apiService;
