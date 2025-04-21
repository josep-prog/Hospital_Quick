-- Seed data for Hospital Quick

-- Insert districts
INSERT INTO districts (name) VALUES 
('Rusizi District'),
('Ruhango District'),
('Kigali'),
('Nyagatare'),
('Rubavu');

-- Insert hospitals
INSERT INTO hospitals (district_id, name, address, phone, email, has_emergency) VALUES 
(1, 'Gihuindwe Hospital', 'Kamembe, Rusizi', '+250789123456', 'info@gihuindwe.rw', TRUE),
(2, 'Ruhango Medical Center', 'Ruhango Town', '+250789123457', 'info@ruhangomc.rw', TRUE),
(3, 'King Faisal Hospital', 'Kigali', '+250789123458', 'info@kfh.rw', TRUE),
(3, 'Rwanda Military Hospital', 'Kigali', '+250789123459', 'info@rmh.rw', TRUE),
(4, 'Nyagatare District Hospital', 'Nyagatare', '+250789123460', 'info@nyagataredh.rw', FALSE),
(5, 'Rubavu District Hospital', 'Rubavu', '+250789123461', 'info@rubavudh.rw', TRUE);

-- Insert specialist categories
INSERT INTO specialist_categories (name, description) VALUES 
('Cardiologist', 'Heart specialist'),
('Dermatologist', 'Skin specialist'),
('Neurologist', 'Brain and nervous system specialist'),
('Orthopedic', 'Bone and joint specialist'),
('Pediatrician', 'Child health specialist'),
('Gynecologist', 'Women\'s health specialist');

-- Insert doctors
INSERT INTO doctors (hospital_id, specialist_category_id, name, license_number, phone, email, is_specialist) VALUES 
(1, NULL, 'Dr. Jean Mugisha', 'RW12345', '+250789123401', 'j.mugisha@gihuindwe.rw', FALSE),
(1, 1, 'Dr. Marie Uwase', 'RW12346', '+250789123402', 'm.uwase@gihuindwe.rw', TRUE),
(2, NULL, 'Dr. Patrick Habimana', 'RW12347', '+250789123403', 'p.habimana@ruhangomc.rw', FALSE),
(2, 3, 'Dr. Claire Niwemahoro', 'RW12348', '+250789123404', 'c.niwemahoro@ruhangomc.rw', TRUE),
(3, NULL, 'Dr. James Karega', 'RW12349', '+250789123405', 'j.karega@kfh.rw', FALSE),
(3, 2, 'Dr. Alice Isimbi', 'RW12350', '+250789123406', 'a.isimbi@kfh.rw', TRUE),
(3, 4, 'Dr. Robert Kanyarwanda', 'RW12351', '+250789123407', 'r.kanyarwanda@kfh.rw', TRUE),
(4, 5, 'Dr. Emma Umutoni', 'RW12352', '+250789123408', 'e.umutoni@rmh.rw', TRUE),
(5, NULL, 'Dr. Frank Mugabo', 'RW12353', '+250789123409', 'f.mugabo@nyagataredh.rw', FALSE),
(6, 6, 'Dr. Grace Mukashema', 'RW12354', '+250789123410', 'g.mukashema@rubavudh.rw', TRUE);

-- Insert sample appointment slots (for the next 7 days)
DELIMITER //
CREATE PROCEDURE generate_appointment_slots()
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE j INT DEFAULT 0;
  DECLARE slot_date DATE;
  DECLARE slot_hour INT;
  DECLARE slot_datetime DATETIME;
  DECLARE hospital_id INT;
  DECLARE doctor_id INT;
  
  -- For each of the next 7 days
  WHILE i < 7 DO
    SET slot_date = DATE_ADD(CURRENT_DATE, INTERVAL i DAY);
    
    -- Skip if it's a Sunday
    IF DAYOFWEEK(slot_date) != 1 THEN
      -- For each hospital
      SELECT id INTO hospital_id FROM hospitals ORDER BY id LIMIT 1;
      WHILE hospital_id IS NOT NULL DO
        -- For each doctor in this hospital
        SELECT id INTO doctor_id FROM doctors WHERE hospital_id = hospital_id ORDER BY id LIMIT 1;
        WHILE doctor_id IS NOT NULL DO
          -- Add slots from 8 AM to 4 PM
          SET j = 0;
          WHILE j < 8 DO
            SET slot_hour = 8 + j;
            SET slot_datetime = CONCAT(slot_date, ' ', slot_hour, ':00:00');
            
            -- Insert the slot
            INSERT INTO appointment_slots (hospital_id, doctor_id, slot_datetime, duration_minutes)
            VALUES (hospital_id, doctor_id, slot_datetime, 30);
            
            -- 30-minute intervals
            SET slot_datetime = CONCAT(slot_date, ' ', slot_hour, ':30:00');
            INSERT INTO appointment_slots (hospital_id, doctor_id, slot_datetime, duration_minutes)
            VALUES (hospital_id, doctor_id, slot_datetime, 30);
            
            SET j = j + 1;
          END WHILE;
          
          -- Get next doctor
          SELECT MIN(id) INTO doctor_id FROM doctors 
          WHERE hospital_id = hospital_id AND id > doctor_id;
        END WHILE;
        
        -- Get next hospital
        SELECT MIN(id) INTO hospital_id FROM hospitals 
        WHERE id > hospital_id;
      END WHILE;
    END IF;
    
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

-- Execute the procedure
CALL generate_appointment_slots();

-- Drop the procedure
DROP PROCEDURE generate_appointment_slots;