
import express from 'express';
import apiController from '../controllers/apiController.js';

const router = express.Router();

router.get('/getMenuList', apiController.getMenuList);

router.post('/getDropDown', apiController.getDropDown);

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
router.post('/setPrice', apiController.setPrice);
router.post('/addPrice', apiController.addPrice);
router.post('/delPrice', apiController.delPrice);


// client
router.post('/getClient', apiController.getClient);
router.post('/setClient', apiController.setClient);
router.post('/addClient', apiController.addClient);
router.post('/delClient', apiController.delClient);


// code
router.post('/getCodeMst', apiController.getCodeMst);
router.post('/getCodeDet', apiController.getCodeDet);
router.post('/setCodeMst', apiController.setCodeMst);
router.post('/setCodeDet', apiController.setCodeDet);
router.post('/addCodeMst', apiController.addCodeMst);
router.post('/addCodeDet', apiController.addCodeDet);
router.post('/delCodeMst', apiController.delCodeMst);
router.post('/delCodeDet', apiController.delCodeDet);



export default router;