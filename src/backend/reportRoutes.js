// Update reportRoutes.js
const express = require('express');
const router = express.Router();
const { getCSV, getPDF, getAll } = require('./reportController');

router.get('/csv', getCSV);
router.get('/pdf', getPDF);
router.get('/all', getAll);

module.exports = router;