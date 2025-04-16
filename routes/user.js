import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();


// 화면관리
router.post('/getTheme', userController.getTheme);
router.post('/setTheme', userController.setTheme);

// 회원관리
router.post('/getUsers', userController.getUsers);
router.post('/getUser', userController.getUser);
router.post('/setUser', userController.setUser);
router.post('/addUser', userController.addUser);
router.post('/delUser', userController.delUser);

router.post('/setMenu', userController.setMenu);

// 개인정보관리
router.post('/getUserInfo', userController.getUserInfo);
router.post('/setUserInfo', userController.setUserInfo);

// 접속이력관리
router.post('/getLogs', userController.getLogs);

export default router; 
