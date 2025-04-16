// const express = require('express');
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the Node.js API!');
});

// module.exports = router;
export default router;