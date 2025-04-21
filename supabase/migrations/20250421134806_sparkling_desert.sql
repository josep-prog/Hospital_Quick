-- Hospital Quick Database Schema

-- Districts Table
CREATE TABLE IF NOT EXISTS districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  has_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Specialist Categories Table
CREATE TABLE IF NOT EXISTS specialist_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  specialist_category_id INT NULL,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(255),
  is_specialist BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (specialist_category_id) REFERENCES specialist_categories(id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  national_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,
  account_type ENUM('temporary', 'permanent') DEFAULT 'temporary',
  account_expiry TIMESTAMP NULL,
  irembo_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Appointment Slots Table
CREATE TABLE IF NOT EXISTS appointment_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  doctor_id INT NOT NULL,
  slot_datetime TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 30,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  slot_id INT NOT NULL,
  hospital_id INT NOT NULL,
  doctor_id INT NOT NULL,
  reference_number VARCHAR(20) UNIQUE NOT NULL,
  appointment_datetime TIMESTAMP NOT NULL,
  is_emergency BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (slot_id) REFERENCES appointment_slots(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('mobile_money', 'bank_card', 'insurance') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  appointment_id INT NULL,
  message TEXT NOT NULL,
  type ENUM('sms', 'email') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  message_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Indexes for performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_datetime);
CREATE INDEX idx_slots_hospital_doctor ON appointment_slots(hospital_id, doctor_id);
CREATE INDEX idx_slots_datetime ON appointment_slots(slot_datetime);
CREATE INDEX idx_slots_is_booked ON appointment_slots(is_booked);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_national_id ON users(national_id);
CREATE INDEX idx_doctors_hospital_id ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialist ON doctors(specialist_category_id);
CREATE INDEX idx_hospitals_district ON hospitals(district_id);