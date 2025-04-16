
import express from 'express';
import apiController from '../controllers/apiController.js';

const router = express.Router();

router.get('/getItems', apiController.getItems);

router.get('/getMenuList', apiController.getMenuList);

// common code


// category
router.post('/getCategoryMst', apiController.getCategoryMst);
router.post('/getCategoryDet', apiController.getCategoryDet);
router.post('/setCategory', apiController.setCategory);
router.post('/addCategory', apiController.addCategory);
router.post('/delCategory', apiController.delCategory);


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