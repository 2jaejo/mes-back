// const express = require('express');
// const router = express.Router();
// const itemController = require('../controllers/itemController');

import express from 'express';
import itemController from '../controllers/itemController.js';
const router = express.Router();

router.get('/', itemController.getItems);

router.get('/:id', itemController.getItemById);

router.post('/', itemController.addItem);

router.put('/', itemController.setItem);

router.delete('/:id', itemController.delItem);

// module.exports = router;
export default router;