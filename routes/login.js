// const express = require('express');
// const router = express.Router();
// const loginController = require('../controllers/loginController');

import express from 'express';
import loginController from '../controllers/loginController.js';

const router = express.Router();

// validate
router.get('/validate', loginController.validate);

// 로그인
router.post('/login', loginController.login);

// 로그아웃
router.post('/logout', loginController.logout);

// module.exports = router;
export default router;