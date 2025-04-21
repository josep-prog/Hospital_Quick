const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Send SMS using a third-party SMS gateway
 * This is a mock implementation
 */
async function sendSMS(phoneNumber, message) {
  try {
    // In a real implementation, this would call an SMS gateway API
    logger.info(`Sending SMS to ${phoneNumber}: ${message}`);
    
    // Mock API call to SMS gateway
    /*
    const response = await axios.post('https://smsgateway.com/api/send', {
      apiKey: process.env.SMS_API_KEY,
      to: phoneNumber,
      from: process.env.SMS_SENDER_ID || 'HOSP_QUICK',
      message
    });
    
    return {
      success: true,
      messageId: response.data.messageId
    };
    */
    
    // For now, just return a success response
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    };
  } catch (error) {
    logger.error(`Error sending SMS: ${error.message}`);
    throw error;
  }
}

/**
 * Send account creation SMS
 */
exports.sendAccountCreationSMS = async (phoneNumber, details) => {
  const message = `Your temporary Hospital Quick account has been created. This account will be available for 48 hours.
Your PIN: ${details.pin}
Expiry: ${details.expiryDate}
For assistance call: +250 791 640 062`;

  return sendSMS(phoneNumber, message);
};

/**
 * Send appointment confirmation SMS
 */
exports.sendAppointmentConfirmationSMS = async (phoneNumber, details) => {
  const message = `Your Hospital Quick appointment is confirmed!
Reference: ${details.reference}
Hospital: ${details.hospitalName}
Doctor: ${details.doctorName}
Date: ${details.date}
Time: ${details.time}
Thank you for using Hospital Quick.`;

  return sendSMS(phoneNumber, message);
};

/**
 * Send appointment reminder SMS
 */
exports.sendAppointmentReminderSMS = async (phoneNumber, details) => {
  const message = `Reminder: Your Hospital Quick appointment is tomorrow!
Reference: ${details.reference}
Hospital: ${details.hospitalName}
Doctor: ${details.doctorName}
Date: ${details.date}
Time: ${details.time}`;

  return sendSMS(phoneNumber, message);
};

/**
 * Process SMS delivery report
 */
exports.handleSMSWebhook = async (req, res) => {
  try {
    const { messageId, status } = req.body;
    
    logger.info(`SMS delivery status for ${messageId}: ${status}`);
    
    // In a real implementation, you would update the message status in the database
    
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Error processing SMS webhook: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};