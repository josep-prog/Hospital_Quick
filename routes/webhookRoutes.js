const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const notificationController = require('../controllers/notificationController');

// Payment webhooks
router.post('/payment', paymentController.handlePaymentWebhook);

// SMS delivery status webhooks
router.post('/sms', notificationController.handleSMSWebhook);

module.exports = router;