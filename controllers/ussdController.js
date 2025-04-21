const sessionManager = require('../services/sessionManager');
const menuBuilder = require('../services/menuBuilder');
const accountService = require('../services/accountService');
const appointmentService = require('../services/appointmentService');
const logger = require('../utils/logger');

/**
 * Handle USSD requests
 */
exports.handleUSSDRequest = async (req, res) => {
  try {
    // Extract USSD parameters from the request
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    // Log the request
    logger.info(`USSD Request - SessionID: ${sessionId}, Phone: ${phoneNumber}, Text: ${text}`);
    
    // Get or create session
    const session = await sessionManager.getOrCreateSession(sessionId, phoneNumber);
    
    // Process the user input and determine the next menu
    let response;
    
    if (text === '') {
      // First request, show the main menu
      response = menuBuilder.getMainMenu();
    } else {
      // Process user input based on current menu state
      const userInput = text.split('*').pop();
      const currentMenu = session.currentMenu || 'main';
      
      response = await processUserInput(userInput, currentMenu, session);
    }
    
    // Update session with new menu state
    await sessionManager.updateSession(sessionId, { 
      currentMenu: response.nextMenu,
      data: { ...session.data, ...response.sessionData }
    });
    
    // Send response back to USSD gateway
    res.set('Content-Type', 'text/plain');
    res.send(response.message);
    
  } catch (error) {
    logger.error(`Error processing USSD request: ${error.message}`);
    res.status(500).send('END An error occurred. Please try again later.');
  }
};

/**
 * Process user input based on current menu state
 */
async function processUserInput(input, currentMenu, session) {
  switch (currentMenu) {
    case 'main':
      return processMainMenu(input, session);
    case 'book_appointment':
      return processBookAppointmentMenu(input, session);
    case 'account_selection':
      return processAccountSelectionMenu(input, session);
    case 'temp_account_creation':
      return processTempAccountCreationMenu(input, session);
    case 'district_selection':
      return processDistrictSelectionMenu(input, session);
    case 'hospital_selection':
      return processHospitalSelectionMenu(input, session);
    case 'appointment_slots':
      return processAppointmentSlotsMenu(input, session);
    case 'appointment_confirmation':
      return processAppointmentConfirmationMenu(input, session);
    case 'history':
      return processHistoryMenu(input, session);
    case 'specialist_selection':
      return processSpecialistSelectionMenu(input, session);
    case 'emergency_booking':
      return processEmergencyBookingMenu(input, session);
    default:
      return {
        message: 'END Invalid menu state. Please dial *xxx# to start again.',
        nextMenu: 'main',
        sessionData: {}
      };
  }
}

/**
 * Process main menu input
 */
async function processMainMenu(input, session) {
  switch (input) {
    case '1':
      return {
        message: menuBuilder.getAccountSelectionMenu(),
        nextMenu: 'account_selection',
        sessionData: { flow: 'book_appointment' }
      };
    case '2':
      return {
        message: menuBuilder.getHistoryAuthMenu(),
        nextMenu: 'history',
        sessionData: { flow: 'history' }
      };
    case '3':
      return {
        message: menuBuilder.getSpecialistCategoriesMenu(),
        nextMenu: 'specialist_selection',
        sessionData: { flow: 'specialist' }
      };
    case '4':
      return {
        message: menuBuilder.getEmergencyDistrictsMenu(),
        nextMenu: 'emergency_booking',
        sessionData: { flow: 'emergency' }
      };
    default:
      return {
        message: 'END Invalid option. Please try again by dialing *xxx#.',
        nextMenu: 'main',
        sessionData: {}
      };
  }
}

/**
 * Process account selection menu
 */
async function processAccountSelectionMenu(input, session) {
  switch (input) {
    case '1':
      // User has an account
      return {
        message: menuBuilder.getAccountAuthMenu(),
        nextMenu: 'account_auth',
        sessionData: { hasAccount: true }
      };
    case '2':
      // Create temporary account
      return {
        message: menuBuilder.getTempAccountTypeMenu(),
        nextMenu: 'temp_account_creation',
        sessionData: { hasAccount: false }
      };
    case '0':
      // Back to main menu
      return {
        message: menuBuilder.getMainMenu(),
        nextMenu: 'main',
        sessionData: {}
      };
    default:
      return {
        message: 'END Invalid option. Please try again by dialing *xxx#.',
        nextMenu: 'main',
        sessionData: {}
      };
  }
}

// Other menu processing functions would be implemented similarly
// These are placeholders and would need to be completed with actual logic

async function processBookAppointmentMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processTempAccountCreationMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processDistrictSelectionMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processHospitalSelectionMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processAppointmentSlotsMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processAppointmentConfirmationMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processHistoryMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processSpecialistSelectionMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}

async function processEmergencyBookingMenu(input, session) {
  // Implementation
  return { message: 'CON Placeholder', nextMenu: 'next_menu', sessionData: {} };
}