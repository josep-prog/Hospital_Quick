/**
 * Menu Builder Service
 * Responsible for building USSD menu text
 */

/**
 * Get main menu
 */
exports.getMainMenu = () => {
  return `CON Welcome to Hospital Quick
1. Book appointment with doctor
2. Review historical appointments
3. Specialist doctor
4. Emergency booking
`;
};

/**
 * Get account selection menu
 */
exports.getAccountSelectionMenu = () => {
  return `CON Book appointment
1. I have an account
2. Create temporary account
0. Back to main menu
`;
};

/**
 * Get account authentication menu
 */
exports.getAccountAuthMenu = () => {
  return `CON Enter your account PIN:
`;
};

/**
 * Get temporary account type selection menu
 */
exports.getTempAccountTypeMenu = () => {
  return `CON Create temporary account using:
1. Email
2. Phone number
0. Back
`;
};

/**
 * Get National ID input menu
 */
exports.getNationalIdMenu = () => {
  return `CON Enter your National ID number:
`;
};

/**
 * Get district selection menu
 */
exports.getDistrictsMenu = () => {
  return `CON Select district:
1. Rusizi District
2. Ruhango District
3. Kigali
4. Nyagatare
5. Rubavu
6. Next
0. Back
`;
};

/**
 * Get hospitals menu for a specific district
 */
exports.getHospitalsMenu = (district, hospitals) => {
  let menu = `CON Hospitals in ${district}:\n`;
  
  hospitals.forEach((hospital, index) => {
    menu += `${index + 1}. ${hospital.name} (${hospital.availableSlots} free)\n`;
  });
  
  menu += '0. Back';
  
  return menu;
};

/**
 * Get appointment slots menu
 */
exports.getAppointmentSlotsMenu = (hospital, slots) => {
  let menu = `CON Available appointments at ${hospital}:\n`;
  
  slots.forEach((slot, index) => {
    menu += `${index + 1}. ${slot.date} ${slot.time}\n`;
  });
  
  menu += '0. Back';
  
  return menu;
};

/**
 * Get appointment confirmation menu
 */
exports.getAppointmentConfirmationMenu = (appointmentDetails) => {
  return `CON Confirm appointment:
Hospital: ${appointmentDetails.hospital}
Date: ${appointmentDetails.date}
Time: ${appointmentDetails.time}

1. Confirm
2. Cancel
`;
};

/**
 * Get history authentication menu
 */
exports.getHistoryAuthMenu = () => {
  return `CON To view appointment history
Enter your PIN:
`;
};

/**
 * Get appointment history menu
 */
exports.getAppointmentHistoryMenu = (appointments) => {
  let menu = `CON Your appointments:\n`;
  
  if (appointments.length === 0) {
    menu += 'No appointments found.\n';
  } else {
    appointments.forEach((appointment, index) => {
      menu += `${index + 1}. ${appointment.date} - ${appointment.hospital}\n`;
    });
  }
  
  menu += '0. Back to main menu';
  
  return menu;
};

/**
 * Get specialist categories menu
 */
exports.getSpecialistCategoriesMenu = () => {
  return `CON Select specialist type:
1. Cardiologist
2. Dermatologist
3. Neurologist
4. Orthopedic
5. Pediatrician
6. Gynecologist
7. Next
0. Back to main menu
`;
};

/**
 * Get emergency districts menu
 */
exports.getEmergencyDistrictsMenu = () => {
  return `CON EMERGENCY BOOKING
Select your district:
1. Rusizi District
2. Ruhango District
3. Kigali
4. Nyagatare
5. Rubavu
6. Next
0. Back to main menu
`;
};

/**
 * Get payment methods menu
 */
exports.getPaymentMethodsMenu = (amount) => {
  return `CON Payment: ${amount} RWF
1. Mobile Money
2. Bank Card
3. Insurance
0. Cancel
`;
};

/**
 * Get temporary account created confirmation
 */
exports.getTempAccountCreatedMenu = (details) => {
  return `END Your temporary account has been created.
This account will be available for 48 hours.
Appointment PIN: ${details.pin}

For assistance call: +250 791 640 062
`;
};

/**
 * Get appointment success message
 */
exports.getAppointmentSuccessMenu = (details) => {
  return `END Appointment confirmed!
Hospital: ${details.hospital}
Date: ${details.date}
Time: ${details.time}
Reference: ${details.reference}

You will receive an SMS confirmation shortly.
Thank you for using Hospital Quick.
`;
};

// Add more menu builders as needed