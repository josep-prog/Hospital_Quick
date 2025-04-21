const db = require('../config/database');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');
const { v4: uuidv4 } = require('uuid');

/**
 * Get districts
 */
exports.getDistricts = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM districts ORDER BY name');
    return rows;
  } catch (error) {
    logger.error(`Error getting districts: ${error.message}`);
    throw error;
  }
};

/**
 * Get hospitals by district
 */
exports.getHospitalsByDistrict = async (districtId) => {
  try {
    const [rows] = await db.execute(
      `SELECT h.*, 
       (SELECT COUNT(*) FROM appointment_slots s 
        WHERE s.hospital_id = h.id 
        AND s.is_booked = 0
        AND s.slot_datetime > NOW()) as available_slots
       FROM hospitals h
       WHERE h.district_id = ?
       ORDER BY h.name`,
      [districtId]
    );
    
    return rows.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      availableSlots: hospital.available_slots
    }));
  } catch (error) {
    logger.error(`Error getting hospitals by district: ${error.message}`);
    throw error;
  }
};

/**
 * Get available appointment slots for a hospital
 */
exports.getAvailableSlots = async (hospitalId) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM appointment_slots
       WHERE hospital_id = ?
       AND is_booked = 0
       AND slot_datetime > NOW()
       ORDER BY slot_datetime
       LIMIT 10`,
      [hospitalId]
    );
    
    return rows.map(slot => {
      const slotDate = new Date(slot.slot_datetime);
      return {
        id: slot.id,
        date: slotDate.toISOString().split('T')[0],
        time: slotDate.toTimeString().split(' ')[0].substring(0, 5),
        doctorId: slot.doctor_id,
        doctorName: slot.doctor_name
      };
    });
  } catch (error) {
    logger.error(`Error getting available slots: ${error.message}`);
    throw error;
  }
};

/**
 * Get specialist categories
 */
exports.getSpecialistCategories = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM specialist_categories ORDER BY name');
    return rows;
  } catch (error) {
    logger.error(`Error getting specialist categories: ${error.message}`);
    throw error;
  }
};

/**
 * Get specialists by category
 */
exports.getSpecialistsByCategory = async (categoryId) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.*, h.name as hospital_name
       FROM doctors d
       JOIN hospitals h ON d.hospital_id = h.id
       WHERE d.specialist_category_id = ?
       ORDER BY d.name`,
      [categoryId]
    );
    
    return rows;
  } catch (error) {
    logger.error(`Error getting specialists by category: ${error.message}`);
    throw error;
  }
};

/**
 * Book an appointment
 */
exports.bookAppointment = async (userId, slotId, isEmergency = false) => {
  try {
    // Generate reference number
    const reference = `HQ${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Begin transaction
    await db.beginTransaction();
    
    // Get slot details
    const [slots] = await db.execute(
      `SELECT s.*, h.name as hospital_name, d.name as doctor_name
       FROM appointment_slots s
       JOIN hospitals h ON s.hospital_id = h.id
       JOIN doctors d ON s.doctor_id = d.id
       WHERE s.id = ?`,
      [slotId]
    );
    
    if (slots.length === 0) {
      await db.rollback();
      return { success: false, message: 'Appointment slot not found' };
    }
    
    const slot = slots[0];
    
    // Check if slot is already booked
    if (slot.is_booked) {
      await db.rollback();
      return { success: false, message: 'This appointment slot is already booked' };
    }
    
    // Mark slot as booked
    await db.execute(
      `UPDATE appointment_slots
       SET is_booked = 1, booked_at = NOW()
       WHERE id = ?`,
      [slotId]
    );
    
    // Create appointment record
    const [result] = await db.execute(
      `INSERT INTO appointments
       (user_id, slot_id, hospital_id, doctor_id, reference_number, 
        appointment_datetime, is_emergency, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW())`,
      [userId, slotId, slot.hospital_id, slot.doctor_id, reference, 
       slot.slot_datetime, isEmergency ? 1 : 0]
    );
    
    // Commit transaction
    await db.commit();
    
    // Get user details for notification
    const [users] = await db.execute('SELECT phone, email FROM users WHERE id = ?', [userId]);
    
    if (users.length > 0) {
      // Send confirmation SMS
      await notificationService.sendAppointmentConfirmationSMS(
        users[0].phone,
        {
          reference,
          hospitalName: slot.hospital_name,
          doctorName: slot.doctor_name,
          date: new Date(slot.slot_datetime).toISOString().split('T')[0],
          time: new Date(slot.slot_datetime).toTimeString().split(' ')[0].substring(0, 5)
        }
      );
    }
    
    return {
      success: true,
      appointmentId: result.insertId,
      reference,
      hospitalName: slot.hospital_name,
      doctorName: slot.doctor_name,
      date: new Date(slot.slot_datetime).toISOString().split('T')[0],
      time: new Date(slot.slot_datetime).toTimeString().split(' ')[0].substring(0, 5)
    };
  } catch (error) {
    // Rollback transaction in case of error
    await db.rollback();
    logger.error(`Error booking appointment: ${error.message}`);
    throw error;
  }
};

/**
 * Get user appointments
 */
exports.getUserAppointments = async (userId) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, h.name as hospital_name, d.name as doctor_name,
       s.slot_datetime as appointment_datetime
       FROM appointments a
       JOIN hospitals h ON a.hospital_id = h.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN appointment_slots s ON a.slot_id = s.id
       WHERE a.user_id = ?
       ORDER BY s.slot_datetime DESC`,
      [userId]
    );
    
    return rows.map(appointment => {
      const appointmentDate = new Date(appointment.appointment_datetime);
      return {
        id: appointment.id,
        reference: appointment.reference_number,
        hospital: appointment.hospital_name,
        doctor: appointment.doctor_name,
        date: appointmentDate.toISOString().split('T')[0],
        time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
        status: appointment.status,
        isEmergency: appointment.is_emergency === 1
      };
    });
  } catch (error) {
    logger.error(`Error getting user appointments: ${error.message}`);
    throw error;
  }
};

/**
 * Get appointment details
 */
exports.getAppointmentDetails = async (appointmentId) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, h.name as hospital_name, d.name as doctor_name,
       s.slot_datetime as appointment_datetime, h.address as hospital_address,
       h.phone as hospital_phone
       FROM appointments a
       JOIN hospitals h ON a.hospital_id = h.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN appointment_slots s ON a.slot_id = s.id
       WHERE a.id = ?`,
      [appointmentId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const appointment = rows[0];
    const appointmentDate = new Date(appointment.appointment_datetime);
    
    return {
      id: appointment.id,
      reference: appointment.reference_number,
      hospital: appointment.hospital_name,
      hospitalAddress: appointment.hospital_address,
      hospitalPhone: appointment.hospital_phone,
      doctor: appointment.doctor_name,
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
      status: appointment.status,
      isEmergency: appointment.is_emergency === 1,
      notes: appointment.notes
    };
  } catch (error) {
    logger.error(`Error getting appointment details: ${error.message}`);
    throw error;
  }
};