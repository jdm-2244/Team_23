const express = require('express');
const router = express.Router();
const { getCSV, getPDF } = require('./reportController');

router.get('/csv', getCSV);
router.get('/pdf', getPDF);

module.exports = router;
