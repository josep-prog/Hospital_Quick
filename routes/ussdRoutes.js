const express = require('express');
const router = express.Router();
const ussdController = require('../controllers/ussdController');

// USSD entry point
router.post('/', ussdController.handleUSSDRequest);

module.exports = router;