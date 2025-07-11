
import express from 'express';
import apiController from '../controllers/apiController.js';


const router = express.Router();

router.get('/getMenuList', apiController.getMenuList);

router.post('/getDropDown', apiController.getDropDown);

router.post('/scanBarcode', apiController.scanBarcode);

router.post('/excelMapping', apiController.excelMapping);
router.post('/setExcelMapping', apiController.setExcelMapping);
router.post('/addExcelMapping', apiController.addExcelMapping);

router.post('/getSheet', apiController.getSheet);

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

// Raw
router.post('/getRaw', apiController.getRaw);
router.post('/setRaw', apiController.setRaw);
router.post('/addRaw', apiController.addRaw);
router.post('/delRaw', apiController.delRaw);

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
router.post('/getEquipmentCheckLog', apiController.getEquipmentCheckLog);
router.post('/setEquipmentCheck', apiController.setEquipmentCheck);
router.post('/addEquipmentCheck', apiController.addEquipmentCheck);
router.post('/addEquipmentCheckLog', apiController.addEquipmentCheckLog);
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


// Receipt 
router.post('/getReceipt', apiController.getReceipt);
router.post('/getReceiptDet', apiController.getReceiptDet);
router.post('/setReceipt', apiController.setReceipt);
router.post('/setReceiptDet', apiController.setReceiptDet);
router.post('/setReceiptClose', apiController.setReceiptClose);
router.post('/addReceipt', apiController.addReceipt);
router.post('/delReceipt', apiController.delReceipt);


// ReceiptLog
router.post('/getReceiptLog', apiController.getReceiptLog);


// ReceiptReturn
router.post('/getReceiptReturn', apiController.getReceiptReturn);
router.post('/getReceiptReturnDet', apiController.getReceiptReturnDet);
router.post('/setReceiptReturn', apiController.setReceiptReturn);
router.post('/setReceiptReturnDet', apiController.setReceiptReturnDet);
router.post('/setReceiptReturnClose', apiController.setReceiptReturnClose);
router.post('/addReceiptReturn', apiController.addReceiptReturn);


// Release 
router.post('/getRelease', apiController.getRelease);
router.post('/getReleaseDet', apiController.getReleaseDet);
router.post('/setRelease', apiController.setRelease);
router.post('/setReleaseDet', apiController.setReleaseDet);
router.post('/addRelease', apiController.addRelease);
router.post('/delRelease', apiController.delRelease);


// ReleaseReturn
router.post('/addReleaseReturn', apiController.addReleaseReturn);
router.post('/setReleaseReturn', apiController.setReleaseReturn);


// Inventory
router.post('/getInventory', apiController.getInventory);
router.post('/getInventoryDet', apiController.getInventoryDet);
router.post('/setInventory', apiController.setInventory);


// SalesOrder
router.post('/getSalesOrder', apiController.getSalesOrder);
router.post('/getSalesOrderDet', apiController.getSalesOrderDet);
router.post('/setSalesOrder', apiController.setSalesOrder);
router.post('/setSalesOrderDet', apiController.setSalesOrderDet);
router.post('/addSalesOrder', apiController.addSalesOrder);
router.post('/delSalesOrder', apiController.delSalesOrder);


// WorkOrder
router.post('/getWorkOrder', apiController.getWorkOrder);
router.post('/getWorkOrderDet', apiController.getWorkOrderDet);
router.post('/setWorkOrder', apiController.setWorkOrder);
router.post('/addWorkOrder', apiController.addWorkOrder);
router.post('/delWorkOrder', apiController.delWorkOrder);


// WorkResult
router.post('/getWorkResult', apiController.getWorkResult);
router.post('/setWorkResult', apiController.setWorkResult);
router.post('/addWorkResult', apiController.addWorkResult);
router.post('/delWorkResult', apiController.delWorkResult);


export default router;