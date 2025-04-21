const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

/**
 * Verify user credentials
 */
exports.verifyCredentials = async (identifier, pin) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE phone = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );
    
    if (rows.length === 0) {
      return { success: false, message: 'Account not found' };
    }
    
    const user = rows[0];
    
    // Verify PIN
    const isValid = await bcrypt.compare(pin, user.pin_hash);
    
    if (!isValid) {
      return { success: false, message: 'Invalid PIN' };
    }
    
    return { 
      success: true, 
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.full_name,
        accountType: user.account_type
      }
    };
  } catch (error) {
    logger.error(`Error verifying credentials: ${error.message}`);
    throw error;
  }
};

/**
 * Create a temporary account
 */
exports.createTemporaryAccount = async (data) => {
  try {
    // Generate a random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the PIN for storage
    const pinHash = await bcrypt.hash(pin, 10);
    
    // Generate expiry date (48 hours from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 48);
    
    // Begin transaction
    await db.beginTransaction();
    
    // Insert the user
    const [result] = await db.execute(
      `INSERT INTO users 
       (national_id, phone, email, pin_hash, account_type, account_expiry, created_at) 
       VALUES (?, ?, ?, ?, 'temporary', ?, NOW())`,
      [data.nationalId, data.phone, data.email, pinHash, expiryDate]
    );
    
    // Commit transaction
    await db.commit();
    
    // Send notification with PIN
    await notificationService.sendAccountCreationSMS(
      data.phone,
      {
        pin,
        expiryDate: expiryDate.toISOString().split('T')[0]
      }
    );
    
    return {
      success: true,
      userId: result.insertId,
      pin,
      expiryDate
    };
  } catch (error) {
    // Rollback transaction in case of error
    await db.rollback();
    logger.error(`Error creating temporary account: ${error.message}`);
    throw error;
  }
};

/**
 * Check if a user exists
 */
exports.checkUserExists = async (identifier) => {
  try {
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE phone = ? OR email = ? OR national_id = ? LIMIT 1',
      [identifier, identifier, identifier]
    );
    
    return rows.length > 0;
  } catch (error) {
    logger.error(`Error checking if user exists: ${error.message}`);
    throw error;
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (userId) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, national_id, phone, email, full_name, account_type, account_expiry, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    logger.error(`Error getting user by ID: ${error.message}`);
    throw error;
  }
};

/**
 * Update user account to permanent
 */
exports.upgradeToPermanentAccount = async (userId, iremboCode) => {
  try {
    // Validate IREMBO code (this would integrate with IREMBO API in production)
    // For now, we'll assume the code is valid
    
    // Update the account
    await db.execute(
      `UPDATE users 
       SET account_type = 'permanent', 
           account_expiry = NULL,
           irembo_code = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [iremboCode, userId]
    );
    
    return { success: true };
  } catch (error) {
    logger.error(`Error upgrading to permanent account: ${error.message}`);
    throw error;
  }
};