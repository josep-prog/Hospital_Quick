const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// In-memory session store (would be replaced with Redis or database in production)
const sessions = {};

// Session expiry time in milliseconds (15 minutes)
const SESSION_EXPIRY = 15 * 60 * 1000;

/**
 * Get or create a session for a USSD request
 */
exports.getOrCreateSession = async (sessionId, phoneNumber) => {
  // Clean up expired sessions
  cleanupExpiredSessions();
  
  // Check if session exists
  if (sessions[sessionId]) {
    // Update last activity timestamp
    sessions[sessionId].lastActivity = Date.now();
    return sessions[sessionId];
  }
  
  // Create new session
  const newSession = {
    id: sessionId,
    phoneNumber,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    currentMenu: 'main',
    data: {}
  };
  
  sessions[sessionId] = newSession;
  logger.info(`New session created: ${sessionId} for phone ${phoneNumber}`);
  
  return newSession;
};

/**
 * Update session data
 */
exports.updateSession = async (sessionId, updates) => {
  if (!sessions[sessionId]) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  // Update session data
  sessions[sessionId] = {
    ...sessions[sessionId],
    ...updates,
    lastActivity: Date.now()
  };
  
  return sessions[sessionId];
};

/**
 * End a session
 */
exports.endSession = async (sessionId) => {
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    logger.info(`Session ended: ${sessionId}`);
    return true;
  }
  
  return false;
};

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  
  for (const sessionId in sessions) {
    if (now - sessions[sessionId].lastActivity > SESSION_EXPIRY) {
      logger.info(`Session expired: ${sessionId}`);
      delete sessions[sessionId];
    }
  }
}