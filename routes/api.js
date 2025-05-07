
import express from 'express';
import apiController from '../controllers/apiController.js';

const router = express.Router();

router.get('/getMenuList', apiController.getMenuList);

router.post('/getDropDown', apiController.getDropDown);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//기준정보관리


// category
router.post('/getCategoryMst', apiController.getCategoryMst);
router.post('/getCategoryDet', apiController.getCategoryDet);
router.post('/setCategory', apiController.setCategory);
router.post('/addCategory', apiController.addCategory);
router.post('/delCategory', apiController.delCategory);


// item
router.post('/getItem', apiController.getItem);
router.post('/setItem', apiController.setItem);
router.post('/addItem', apiController.addItem);
router.post('/delItem', apiController.delItem);


// price
router.post('/getPrice', apiController.getPrice);
router.post('/getPriceHistory', apiController.getPriceHistory);
router.post('/setPrice', apiController.setPrice);
router.post('/addPrice', apiController.addPrice);
router.post('/delPrice', apiController.delPrice);


// client
router.post('/getClient', apiController.getClient);
router.post('/setClient', apiController.setClient);
router.post('/addClient', apiController.addClient);
router.post('/delClient', apiController.delClient);


// equipment
router.post('/getEquipment', apiController.getEquipment);
router.post('/setEquipment', apiController.setEquipment);
router.post('/addEquipment', apiController.addEquipment);
router.post('/delEquipment', apiController.delEquipment);


// equipmentCheck
router.post('/getEquipmentCheck', apiController.getEquipmentCheck);
router.post('/setEquipmentCheck', apiController.setEquipmentCheck);
router.post('/addEquipmentCheck', apiController.addEquipmentCheck);
router.post('/delEquipmentCheck', apiController.delEquipmentCheck);


// Process
router.post('/getProcess', apiController.getProcess);
router.post('/setProcess', apiController.setProcess);
router.post('/addProcess', apiController.addProcess);
router.post('/delProcess', apiController.delProcess);

// Router
router.post('/getRouter', apiController.getRouter);
router.post('/getRouterStep', apiController.getRouterStep);
router.post('/setRouter', apiController.setRouter);
router.post('/setRouterStep', apiController.setRouterStep);
router.post('/addRouter', apiController.addRouter);
router.post('/delRouter', apiController.delRouter);

// BOM
router.post('/getBom', apiController.getBom);
router.post('/setBom', apiController.setBom);
router.post('/addBom', apiController.addBom);
router.post('/delBom', apiController.delBom);



// code
router.post('/getCodeMst', apiController.getCodeMst);
router.post('/getCodeDet', apiController.getCodeDet);
router.post('/setCodeMst', apiController.setCodeMst);
router.post('/setCodeDet', apiController.setCodeDet);
router.post('/addCodeMst', apiController.addCodeMst);
router.post('/addCodeDet', apiController.addCodeDet);
router.post('/delCodeMst', apiController.delCodeMst);
router.post('/delCodeDet', apiController.delCodeDet);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 자재관리


// Order
router.post('/getOrder', apiController.getOrder);
router.post('/getOrderDet', apiController.getOrderDet);
router.post('/setOrder', apiController.setOrder);
router.post('/setOrderDet', apiController.setOrderDet);
router.post('/addOrder', apiController.addOrder);
router.post('/delOrder', apiController.delOrder);
















export default router;