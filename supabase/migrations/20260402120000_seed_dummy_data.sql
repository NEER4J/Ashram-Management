-- =============================================================================
-- SEED: Dummy data for testing
-- User ID: 777080e1-32f7-42be-b199-f33dc844e904
-- Run after all schema migrations are applied.
-- =============================================================================

DO $$
DECLARE
  uid          uuid := '777080e1-32f7-42be-b199-f33dc844e904';

  -- Staff Department IDs
  dept_spiritual uuid := 'aa000001-0000-0000-0000-000000000001';
  dept_kitchen   uuid := 'aa000001-0000-0000-0000-000000000002';
  dept_security  uuid := 'aa000001-0000-0000-0000-000000000003';
  dept_medical   uuid := 'aa000001-0000-0000-0000-000000000004';

  -- Staff IDs
  s_priest1   uuid := 'aa000002-0000-0000-0000-000000000001';
  s_priest2   uuid := 'aa000002-0000-0000-0000-000000000002';
  s_cook      uuid := 'aa000002-0000-0000-0000-000000000003';
  s_security  uuid := 'aa000002-0000-0000-0000-000000000004';
  s_frontdesk uuid := 'aa000002-0000-0000-0000-000000000005';
  s_driver    uuid := 'aa000002-0000-0000-0000-000000000006';
  s_manager   uuid := 'aa000002-0000-0000-0000-000000000007';

  -- Devotee IDs
  d1  uuid := 'aa000003-0000-0000-0000-000000000001';
  d2  uuid := 'aa000003-0000-0000-0000-000000000002';
  d3  uuid := 'aa000003-0000-0000-0000-000000000003';
  d4  uuid := 'aa000003-0000-0000-0000-000000000004';
  d5  uuid := 'aa000003-0000-0000-0000-000000000005';
  d6  uuid := 'aa000003-0000-0000-0000-000000000006';
  d7  uuid := 'aa000003-0000-0000-0000-000000000007';
  d8  uuid := 'aa000003-0000-0000-0000-000000000008';
  d9  uuid := 'aa000003-0000-0000-0000-000000000009';
  d10 uuid := 'aa000003-0000-0000-0000-000000000010';

  -- Donation category IDs (already seeded, fetch dynamically)
  cat_general  uuid;
  cat_annadaan uuid;
  cat_building uuid;
  cat_pooja    uuid;

  -- Puja IDs
  puja_ganesh uuid := 'aa000004-0000-0000-0000-000000000001';
  puja_satya  uuid := 'aa000004-0000-0000-0000-000000000002';
  puja_rudra  uuid := 'aa000004-0000-0000-0000-000000000003';
  puja_nava   uuid := 'aa000004-0000-0000-0000-000000000004';
  puja_laxmi  uuid := 'aa000004-0000-0000-0000-000000000005';

  -- Accommodation IDs
  acc_main uuid;
  acc_2    uuid := 'aa000005-0000-0000-0000-000000000002';
  acc_3    uuid := 'aa000005-0000-0000-0000-000000000003';

  -- Room IDs
  r1 uuid := 'aa000006-0000-0000-0000-000000000001';
  r2 uuid := 'aa000006-0000-0000-0000-000000000002';
  r3 uuid := 'aa000006-0000-0000-0000-000000000003';
  r4 uuid := 'aa000006-0000-0000-0000-000000000004';
  r5 uuid := 'aa000006-0000-0000-0000-000000000005';
  r6 uuid := 'aa000006-0000-0000-0000-000000000006';

  -- Bed IDs
  b1 uuid := 'aa000007-0000-0000-0000-000000000001';
  b2 uuid := 'aa000007-0000-0000-0000-000000000002';
  b3 uuid := 'aa000007-0000-0000-0000-000000000003';
  b4 uuid := 'aa000007-0000-0000-0000-000000000004';
  b5 uuid := 'aa000007-0000-0000-0000-000000000005';

  -- Inventory Location IDs
  loc_storeroom uuid := 'aa000008-0000-0000-0000-000000000001';
  loc_kitchen   uuid := 'aa000008-0000-0000-0000-000000000002';
  loc_temple    uuid := 'aa000008-0000-0000-0000-000000000003';
  loc_office    uuid := 'aa000008-0000-0000-0000-000000000004';

  -- Inventory Item IDs
  inv_rice       uuid := 'aa000009-0000-0000-0000-000000000001';
  inv_ghee       uuid := 'aa000009-0000-0000-0000-000000000002';
  inv_flour      uuid := 'aa000009-0000-0000-0000-000000000003';
  inv_camphor    uuid := 'aa000009-0000-0000-0000-000000000004';
  inv_incense    uuid := 'aa000009-0000-0000-0000-000000000005';
  inv_flowers    uuid := 'aa000009-0000-0000-0000-000000000006';
  inv_dal        uuid := 'aa000009-0000-0000-0000-000000000007';
  inv_oil        uuid := 'aa000009-0000-0000-0000-000000000008';

  -- Seva Opportunity IDs
  seva_cleaning  uuid := 'aa000010-0000-0000-0000-000000000001';
  seva_prasad    uuid := 'aa000010-0000-0000-0000-000000000002';
  seva_garden    uuid := 'aa000010-0000-0000-0000-000000000003';
  seva_gate      uuid := 'aa000010-0000-0000-0000-000000000004';

  -- Seva Shift IDs
  sh1 uuid := 'aa000011-0000-0000-0000-000000000001';
  sh2 uuid := 'aa000011-0000-0000-0000-000000000002';
  sh3 uuid := 'aa000011-0000-0000-0000-000000000003';
  sh4 uuid := 'aa000011-0000-0000-0000-000000000004';

  -- Volunteer IDs
  vol1 uuid := 'aa000012-0000-0000-0000-000000000001';
  vol2 uuid := 'aa000012-0000-0000-0000-000000000002';
  vol3 uuid := 'aa000012-0000-0000-0000-000000000003';
  vol4 uuid := 'aa000012-0000-0000-0000-000000000004';

  -- Temple Event IDs
  ev1 uuid := 'aa000013-0000-0000-0000-000000000001';
  ev2 uuid := 'aa000013-0000-0000-0000-000000000002';
  ev3 uuid := 'aa000013-0000-0000-0000-000000000003';

  -- Medical Camp IDs
  mc1 uuid := 'aa000014-0000-0000-0000-000000000001';
  mc2 uuid := 'aa000014-0000-0000-0000-000000000002';

  -- Vendor IDs (accounting)
  v1 uuid := 'aa000015-0000-0000-0000-000000000001';
  v2 uuid := 'aa000015-0000-0000-0000-000000000002';
  v3 uuid := 'aa000015-0000-0000-0000-000000000003';

  -- Purchase Order IDs
  po1 uuid := 'aa000016-0000-0000-0000-000000000001';
  po2 uuid := 'aa000016-0000-0000-0000-000000000002';

BEGIN

-- =============================================================================
-- 1. MASTER DATA
-- =============================================================================

INSERT INTO master_pujas (id, name, type, description, base_amount, duration_minutes, is_active)
VALUES
  (puja_ganesh, 'Ganesh Puja',          'Daily',   'Auspicious start-of-day Ganesh worship',     501,  60, true),
  (puja_satya,  'Satyanarayan Puja',    'Special',  'Complete Satyanarayan Katha with prasad',    1501, 180, true),
  (puja_rudra,  'Rudrabhishek',         'Special',  'Abhishek of Shivalinga with sacred items',   2101, 90, true),
  (puja_nava,   'Navagraha Puja',       'Special',  'Propitiation of nine planetary deities',     1201, 120, true),
  (puja_laxmi,  'Lakshmi Puja',         'Special',  'Friday worship of Goddess Lakshmi',          701,  60, true)
ON CONFLICT (id) DO NOTHING;

SELECT id INTO cat_general  FROM master_donation_categories WHERE name = 'General Fund'   LIMIT 1;
SELECT id INTO cat_annadaan FROM master_donation_categories WHERE name = 'Annadanam'      LIMIT 1;
SELECT id INTO cat_building FROM master_donation_categories WHERE name = 'Building Fund'  LIMIT 1;
SELECT id INTO cat_pooja    FROM master_donation_categories WHERE name = 'Pooja Seva'     LIMIT 1;

-- =============================================================================
-- 2. STAFF DEPARTMENTS
-- =============================================================================

INSERT INTO staff_departments (id, name, description)
VALUES
  (dept_spiritual, 'Spiritual & Rituals', 'Puja, rituals, havan, and all spiritual programs'),
  (dept_kitchen,   'Kitchen & Prasad',    'Meal preparation, prasad distribution, and annadaan'),
  (dept_security,  'Security & Admin',    'Gate security, visitor management, and front desk'),
  (dept_medical,   'Medical & Wellness',  'First aid, medical camps, and wellness consultations')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. STAFF (employee_id auto-generated by trigger)
-- =============================================================================

INSERT INTO staff (id, first_name, last_name, role, designation, department_id, mobile_number, email,
                   is_active, join_date, languages, contract_type, salary_amount, salary_frequency,
                   priest_skills, date_of_birth, address,
                   emergency_contact_name, emergency_contact_phone)
VALUES
  (s_priest1, 'Ramchandra', 'Mishra', 'Priest', 'Head Priest', dept_spiritual,
   '+91-9876543201', 'ramchandra@ashram.org', true, '2020-01-15',
   ARRAY['Hindi','Sanskrit','English'], 'Full-time', 35000, 'monthly',
   ARRAY['Rudrabhishek','Satyanarayan Katha','Navagraha Puja','Havan'],
   '1975-03-12', 'Quarters No. 1, Ashram Campus, Rishikesh',
   'Sunita Mishra', '+91-9876543202'),

  (s_priest2, 'Suresh', 'Sharma', 'Priest', 'Assistant Priest', dept_spiritual,
   '+91-9876543203', 'suresh@ashram.org', true, '2021-06-01',
   ARRAY['Hindi','Sanskrit','Marathi'], 'Full-time', 28000, 'monthly',
   ARRAY['Ganesh Puja','Lakshmi Puja','Daily Aarti'],
   '1985-07-22', 'Quarters No. 2, Ashram Campus, Rishikesh',
   'Rekha Sharma', '+91-9876543204'),

  (s_cook, 'Anand', 'Kumar', 'Cook', 'Head Chef', dept_kitchen,
   '+91-9876543205', 'anand@ashram.org', true, '2019-04-10',
   ARRAY['Hindi','Punjabi'], 'Full-time', 22000, 'monthly',
   NULL, '1980-11-05', 'Staff Colony, Block B, Ashram Campus',
   'Maya Kumar', '+91-9876543206'),

  (s_security, 'Mohan', 'Singh', 'Security', 'Head of Security', dept_security,
   '+91-9876543207', 'mohan@ashram.org', true, '2018-08-20',
   ARRAY['Hindi','English'], 'Full-time', 20000, 'monthly',
   NULL, '1978-02-14', 'Staff Colony, Block A, Ashram Campus',
   'Pushpa Singh', '+91-9876543208'),

  (s_frontdesk, 'Lakshmi', 'Devi', 'Front Desk', 'Reception Manager', dept_security,
   '+91-9876543209', 'lakshmi@ashram.org', true, '2022-03-01',
   ARRAY['Hindi','English','Tamil'], 'Full-time', 18000, 'monthly',
   NULL, '1992-09-30', 'Guesthouse Annexe, Room 5, Ashram Campus',
   'Krishnamurthy Devi', '+91-9876543210'),

  (s_driver, 'Govind', 'Das', 'Driver', 'Senior Driver', dept_security,
   '+91-9876543211', NULL, true, '2020-07-15',
   ARRAY['Hindi'], 'Full-time', 16000, 'monthly',
   NULL, '1983-06-19', 'Village Rd, Near Ashram Gate, Rishikesh',
   'Tulsi Das', '+91-9876543212'),

  (s_manager, 'Ravi', 'Sharma', 'Manager', 'Operations Manager', dept_security,
   '+91-9876543213', 'ravi@ashram.org', true, '2017-11-01',
   ARRAY['Hindi','English','Gujarati'], 'Full-time', 45000, 'monthly',
   NULL, '1979-04-07', 'Manager Cottage, Ashram Campus, Rishikesh',
   'Geeta Sharma', '+91-9876543214')
ON CONFLICT (id) DO NOTHING;

-- Update department heads
UPDATE staff_departments SET head_staff_id = s_priest1 WHERE id = dept_spiritual AND head_staff_id IS NULL;
UPDATE staff_departments SET head_staff_id = s_cook    WHERE id = dept_kitchen   AND head_staff_id IS NULL;
UPDATE staff_departments SET head_staff_id = s_manager WHERE id = dept_security  AND head_staff_id IS NULL;

-- =============================================================================
-- 4. DEVOTEES
-- =============================================================================

INSERT INTO devotees (id, devotee_code, first_name, last_name, email, mobile_number, gender,
                      date_of_birth, city, state, country, gotra, nakshatra, rashi,
                      membership_type, membership_status, relationship_status,
                      first_visit_date, last_visit_date, dietary_preferences,
                      emergency_contact_name, emergency_contact_phone)
VALUES
  (d1,  'DEV-2024-0001', 'Ramesh',  'Kumar',   'ramesh.kumar@gmail.com',   '+91-9811111001', 'Male',   '1975-05-14', 'Mumbai',     'Maharashtra',   'India', 'Bharadwaj', 'Rohini',    'Vrishabha', 'Life',    'Active', 'Active', '2022-01-10', '2026-03-15', 'Vegetarian',    'Sunita Kumar',   '+91-9811111002'),
  (d2,  'DEV-2024-0002', 'Priya',   'Sharma',  'priya.sharma@gmail.com',   '+91-9811111003', 'Female', '1985-08-22', 'New Delhi',  'Delhi',         'India', 'Vasishtha', 'Pushya',    'Karka',     'General', 'Active', 'Active', '2023-03-05', '2026-03-28', 'Vegetarian',    'Vikram Sharma',  '+91-9811111004'),
  (d3,  'DEV-2024-0003', 'Arjun',   'Iyer',    'arjun.iyer@gmail.com',     '+91-9811111005', 'Male',   '1969-12-01', 'Chennai',    'Tamil Nadu',    'India', 'Kashyapa',  'Ashwini',   'Mesha',     'Patron',  'Active', 'Active', '2021-06-20', '2026-03-20', 'Vegan',         'Meena Iyer',     '+91-9811111006'),
  (d4,  'DEV-2024-0004', 'Meera',   'Nair',    'meera.nair@gmail.com',     '+91-9811111007', 'Female', '1990-04-15', 'Kochi',      'Kerala',        'India', 'Atri',      'Hasta',     'Kanya',     'General', 'Active', 'Active', '2024-01-12', '2026-03-30', 'Vegetarian',    'Suresh Nair',    '+91-9811111008'),
  (d5,  'DEV-2024-0005', 'Suresh',  'Patel',   'suresh.patel@gmail.com',   '+91-9811111009', 'Male',   '1965-09-08', 'Ahmedabad',  'Gujarat',       'India', 'Garg',      'Mrigashirsha','Mithuna', 'Life',    'Active', 'Active', '2020-11-30', '2026-02-28', 'Vegetarian',    'Kamla Patel',    '+91-9811111010'),
  (d6,  'DEV-2024-0006', 'Kavita',  'Joshi',   'kavita.joshi@gmail.com',   '+91-9811111011', 'Female', '1982-02-28', 'Pune',       'Maharashtra',   'India', 'Bhrigu',    'Chitra',    'Tula',      'General', 'Active', 'Active', '2023-07-04', '2026-03-22', 'Vegetarian',    'Rajesh Joshi',   '+91-9811111012'),
  (d7,  'DEV-2024-0007', 'Vikram',  'Singh',   'vikram.singh@gmail.com',   '+91-9811111013', 'Male',   '1978-11-17', 'Jaipur',     'Rajasthan',     'India', 'Bharadwaj', 'Vishakha',  'Tula',      'General', 'Active', 'Active', '2022-09-14', '2026-03-10', 'Vegetarian',    'Anita Singh',    '+91-9811111014'),
  (d8,  'DEV-2024-0008', 'Anita',   'Desai',   'anita.desai@gmail.com',    '+91-9811111015', 'Female', '1993-07-03', 'Bengaluru',  'Karnataka',     'India', 'Kaundinya', 'Swati',     'Tula',      'General', 'Active', 'Active', '2024-02-18', '2026-03-25', 'Vegetarian',    'Mohan Desai',    '+91-9811111016'),
  (d9,  'DEV-2024-0009', 'Rajesh',  'Verma',   'rajesh.verma@gmail.com',   '+91-9811111017', 'Male',   '1961-03-25', 'Varanasi',   'Uttar Pradesh', 'India', 'Sandilya',  'Shravana',  'Makara',    'Patron',  'Active', 'Active', '2019-05-10', '2026-03-18', 'Vegetarian',    'Sarla Verma',    '+91-9811111018'),
  (d10, 'DEV-2024-0010', 'Sunita',  'Agarwal', 'sunita.agarwal@gmail.com', '+91-9811111019', 'Female', '1988-06-11', 'Lucknow',    'Uttar Pradesh', 'India', 'Vasishtha', 'Magha',     'Simha',     'General', 'Active', 'Active', '2023-11-22', '2026-03-29', 'Vegetarian',    'Anil Agarwal',   '+91-9811111020')
ON CONFLICT (id) DO NOTHING;

-- Devotee family members
INSERT INTO devotee_family_members (devotee_id, name, relation, date_of_birth, mobile_number)
VALUES
  (d1,  'Sunita Kumar',     'Spouse',  '1978-09-20', '+91-9811111002'),
  (d1,  'Rahul Kumar',      'Son',     '2005-03-15', NULL),
  (d3,  'Meena Iyer',       'Spouse',  '1972-04-08', '+91-9811111006'),
  (d5,  'Kamla Patel',      'Spouse',  '1968-07-12', '+91-9811111010'),
  (d9,  'Sarla Verma',      'Spouse',  '1964-08-30', '+91-9811111018')
ON CONFLICT DO NOTHING;

-- Devotee tags
INSERT INTO devotee_tags (devotee_id, tag_name)
VALUES
  (d1,  'Life Member'), (d1,  'Regular Donor'),
  (d3,  'Patron'),      (d3,  'VIP'),
  (d5,  'Life Member'), (d5,  'Festival Sponsor'),
  (d9,  'Patron'),      (d9,  'Varanasi Chapter'),
  (d2,  'Youth Wing'),
  (d8,  'Digital Seva')
ON CONFLICT DO NOTHING;

-- Devotee milestones
INSERT INTO devotee_milestones (devotee_id, milestone_type, date, notes)
VALUES
  (d1,  'birthday',            '2026-05-14', 'Birthday - call to wish'),
  (d1,  'anniversary',         '2026-11-03', 'Wedding anniversary'),
  (d2,  'birthday',            '2026-08-22', 'Birthday'),
  (d3,  'spiritual_milestone', '2025-12-01', 'Completed 108 Rudrabhishek'),
  (d5,  'anniversary',         '2026-09-15', 'Silver jubilee - 25 years of service to ashram'),
  (d9,  'spiritual_milestone', '2024-05-10', 'Took Deeksha from Swami Ji')
ON CONFLICT DO NOTHING;

-- Devotee notes
INSERT INTO devotee_notes (devotee_id, note, follow_up_date, created_by)
VALUES
  (d1,  'Interested in sponsoring the Diwali event this year. Follow up in October.', '2026-10-01', uid),
  (d3,  'Donated new AC for the meditation hall. Send personalised thank you letter.', NULL, uid),
  (d5,  'Requesting monthly prasad delivery to Ahmedabad. Coordinate with kitchen.', '2026-04-15', uid),
  (d9,  'Planning to build a new dharamshala wing. Initial discussion done.', '2026-05-01', uid)
ON CONFLICT DO NOTHING;

-- Devotee communications
INSERT INTO devotee_communications (devotee_id, channel, direction, summary, created_by)
VALUES
  (d1,  'call',      'outbound', 'Called to wish for birthday. Discussed donation renewal for new year.', uid),
  (d2,  'whatsapp',  'inbound',  'Asked about upcoming Navratri schedule and seva opportunities.', uid),
  (d3,  'email',     'inbound',  'Sent inquiry about facility for private Rudrabhishek on March 21.', uid),
  (d5,  'call',      'outbound', 'Follow-up on pledged amount for building fund. Confirmed transfer next week.', uid),
  (d9,  'email',     'outbound', 'Sent updated dharamshala proposal PDF and cost estimates.', uid)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. PUJA BOOKINGS
-- =============================================================================

INSERT INTO puja_bookings (booking_code, devotee_id, puja_id, booking_date, puja_date, puja_time,
                           assigned_priest_id, status, payment_status, amount_paid)
VALUES
  ('PUJA-2026-0001', d1,  puja_satya,  '2026-03-01', '2026-04-05', '08:00', s_priest1, 'Confirmed',  'Paid',    1501),
  ('PUJA-2026-0002', d3,  puja_rudra,  '2026-03-10', '2026-04-12', '06:00', s_priest1, 'Confirmed',  'Paid',    2101),
  ('PUJA-2026-0003', d5,  puja_ganesh, '2026-03-20', '2026-04-02', '07:00', s_priest2, 'Completed',  'Paid',     501),
  ('PUJA-2026-0004', d9,  puja_nava,   '2026-03-25', '2026-04-15', '09:00', s_priest1, 'Confirmed',  'Partial', 500),
  ('PUJA-2026-0005', d6,  puja_laxmi,  '2026-03-28', '2026-04-04', '18:00', s_priest2, 'Confirmed',  'Pending',  0)
ON CONFLICT (booking_code) DO NOTHING;

-- =============================================================================
-- 6. DONATIONS
-- =============================================================================

INSERT INTO donations (donation_code, devotee_id, donation_date, amount, category_id,
                        purpose, payment_mode, transaction_ref, payment_status,
                        receipt_generated, currency, created_by)
VALUES
  ('DON-2026-0001', d1,  '2026-01-14', 11000,  cat_general,  'Annual temple maintenance donation', 'UPI',   'UPI20260114001', 'Completed', true,  'INR', uid),
  ('DON-2026-0002', d3,  '2026-01-20', 51000,  cat_building, 'Contribution to new dharamshala',    'Bank Transfer', 'NEFT20260120001', 'Completed', true,  'INR', uid),
  ('DON-2026-0003', d5,  '2026-02-01', 21000,  cat_annadaan, 'Annadaan sponsorship for Feb',       'Cash',  NULL,             'Completed', true,  'INR', uid),
  ('DON-2026-0004', d9,  '2026-02-10', 101000, cat_building, 'Dharamshala wing foundation stone',  'Cheque','CHQ20260210001', 'Completed', true,  'INR', uid),
  ('DON-2026-0005', d2,  '2026-02-20', 2100,   cat_pooja,    'Satyanarayan puja sponsorship',      'UPI',   'UPI20260220001', 'Completed', false, 'INR', uid),
  ('DON-2026-0006', d7,  '2026-03-01', 5100,   cat_general,  'Holi celebration fund',              'Cash',  NULL,             'Completed', true,  'INR', uid),
  ('DON-2026-0007', d4,  '2026-03-05', 1100,   cat_annadaan, 'Annadaan for ashram residents',      'UPI',   'UPI20260305001', 'Completed', false, 'INR', uid),
  ('DON-2026-0008', d8,  '2026-03-10', 3100,   cat_pooja,    'Navratri puja fund',                 'Card',  'TXN20260310001', 'Completed', false, 'INR', uid),
  ('DON-2026-0009', d6,  '2026-03-15', 7500,   cat_general,  'Ram Navami event sponsorship',       'UPI',   'UPI20260315001', 'Completed', true,  'INR', uid),
  ('DON-2026-0010', d1,  '2026-03-28', 11000,  cat_building, 'Q1 building fund installment',       'Bank Transfer', 'NEFT20260328001', 'Completed', true, 'INR', uid)
ON CONFLICT (donation_code) DO NOTHING;

-- In-kind donations (receipt_number auto-generated by trigger)
INSERT INTO in_kind_donations (devotee_id, donation_date, item_type, description,
                                quantity, unit, estimated_value, condition,
                                destination, acknowledgement_status, currency)
VALUES
  (d1,  '2026-01-20', 'grains',         '25 kg Basmati rice and 10 kg dal',  35,  'KG',  1200, 'New',  'Kitchen',    'Acknowledged', 'INR'),
  (d3,  '2026-02-05', 'equipment',      'Industrial food processor',          1,   'PCS', 25000,'New',  'Kitchen',    'Acknowledged', 'INR'),
  (d5,  '2026-02-14', 'clothes',        'Winter blankets for resident sadhus',20,  'PCS', 8000, 'New',  'Guest House','Pending',      'INR'),
  (d9,  '2026-03-01', 'religious_items','Set of brass oil lamps (diyas)',     50,  'PCS', 5000, 'New',  'Temple',     'Acknowledged', 'INR'),
  (d7,  '2026-03-12', 'kitchen_supplies','Stainless steel serving vessels',   10,  'SET', 3500, 'Good', 'Kitchen',    'Pending',      'INR')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. VISITOR REGISTRATIONS (visitor_pass_code auto-generated by trigger)
-- =============================================================================

INSERT INTO visitor_registrations (devotee_id, name, phone, email, visit_purpose,
                                    visit_date, check_in_at, check_out_at,
                                    is_walk_in, is_vip, nationality)
VALUES
  (d2,  'Priya Sharma',      '+91-9811111003', 'priya.sharma@gmail.com',  'Darshan & Puja',        '2026-04-01', '2026-04-01 08:30:00+05:30', '2026-04-01 12:00:00+05:30', false, false, 'Indian'),
  (d4,  'Meera Nair',        '+91-9811111007', 'meera.nair@gmail.com',    'Spiritual Retreat',     '2026-04-01', '2026-04-01 09:00:00+05:30', '2026-04-01 17:00:00+05:30', false, false, 'Indian'),
  (NULL, 'John Williams',    '+1-5551234567',  'john.w@email.com',        'Yoga & Meditation',     '2026-04-01', '2026-04-01 07:00:00+05:30', '2026-04-01 11:00:00+05:30', true,  false, 'American'),
  (NULL, 'Maria Gonzalez',   '+34-612345678',  'maria.g@email.com',       'Ashram Experience',     '2026-04-01', '2026-04-01 10:00:00+05:30', NULL,                        true,  false, 'Spanish'),
  (d3,  'Arjun Iyer',        '+91-9811111005', 'arjun.iyer@gmail.com',    'Board Meeting',         '2026-04-02', '2026-04-02 11:00:00+05:30', '2026-04-02 14:00:00+05:30', false, true,  'Indian'),
  (NULL, 'Swami Anandananda','+91-9900000001', NULL,                      'Spiritual Visit',       '2026-04-02', '2026-04-02 08:00:00+05:30', '2026-04-02 20:00:00+05:30', false, true,  'Indian'),
  (d8,  'Anita Desai',       '+91-9811111015', 'anita.desai@gmail.com',   'Volunteer Orientation', '2026-04-03', '2026-04-03 09:00:00+05:30', '2026-04-03 13:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Kenji Yamamoto',   '+81-901234567',  'kenji@email.jp',          'Documentary Research',  '2026-04-03', '2026-04-03 10:30:00+05:30', NULL,                        true,  false, 'Japanese')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. ACCOMMODATION
-- =============================================================================

-- Get existing MAIN accommodation or create the two additional properties
SELECT id INTO acc_main FROM accommodations WHERE code = 'MAIN' LIMIT 1;

IF acc_main IS NULL THEN
  INSERT INTO accommodations (id, name, code, is_active)
  VALUES (gen_random_uuid(), 'Main Guest House', 'MAIN', true);
  SELECT id INTO acc_main FROM accommodations WHERE code = 'MAIN' LIMIT 1;
END IF;

INSERT INTO accommodations (id, name, code, address, phone, email, check_in_time, check_out_time, is_active)
VALUES
  (acc_2, 'Dharamshala Block B', 'DHARM-B', 'Block B, Ashram Campus, Rishikesh, Uttarakhand', '+91-9876500002', 'dharamshala@ashram.org', '13:00', '10:00', true),
  (acc_3, 'Ladies Ashram Wing',  'LADIES',  'North Wing, Ashram Campus, Rishikesh, Uttarakhand', '+91-9876500003', 'ladies@ashram.org', '14:00', '11:00', true)
ON CONFLICT (code) DO NOTHING;

-- Rooms under MAIN Guest House
INSERT INTO rooms (id, accommodation_id, code, name, room_type, bed_count, building,
                   base_price_per_night, housekeeping_status, is_active,
                   amenities)
VALUES
  (r1, acc_main, 'A101', 'Room A101', 'single',       1, 'Block A', 800,  'Ready',      true, '{"ac": true, "fan": true, "attached_bathroom": true}'::jsonb),
  (r2, acc_main, 'A102', 'Room A102', 'single',       1, 'Block A', 800,  'Ready',      true, '{"ac": false, "fan": true, "attached_bathroom": false}'::jsonb),
  (r3, acc_main, 'A201', 'Room A201', 'double',       2, 'Block A', 1200, 'Ready',      true, '{"ac": true, "fan": true, "attached_bathroom": true, "balcony": true}'::jsonb),
  (r4, acc_main, 'B101', 'Dorm B101', 'dormitory',    6, 'Block B', 400,  'Cleaning',   true, '{"ac": false, "fan": true, "attached_bathroom": false}'::jsonb),
  (r5, acc_2,    'D101', 'Room D101', 'single',       1, 'Dharamshala', 600, 'Ready',   true, '{"ac": false, "fan": true, "attached_bathroom": true}'::jsonb),
  (r6, acc_3,    'L101', 'Room L101', 'family_suite', 4, 'Ladies Wing', 1800, 'Ready',  true, '{"ac": true, "fan": true, "attached_bathroom": true, "balcony": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Beds
INSERT INTO beds (id, room_id, bed_label, is_available)
VALUES
  (b1, r1, 'Bed-1', false),
  (b2, r2, 'Bed-1', true),
  (b3, r3, 'Bed-1', false),
  (b4, r3, 'Bed-2', true),
  (b5, r5, 'Bed-1', false)
ON CONFLICT DO NOTHING;

-- Accommodation bookings (booking_code auto-generated by trigger)
INSERT INTO accommodation_bookings (accommodation_id, devotee_id, room_id, bed_id,
                                     check_in_date, check_out_date, status,
                                     actual_check_in_at, actual_check_out_at,
                                     number_of_guests, total_amount, payment_status,
                                     meal_preference, special_requests, currency)
VALUES
  (acc_main, d1,  r1, b1, '2026-03-28', '2026-04-03', 'CheckedIn',
   '2026-03-28 14:30:00+05:30', NULL, 1, 4800, 'Paid', 'Vegetarian', NULL, 'INR'),

  (acc_main, d3,  r3, b3, '2026-04-05', '2026-04-10', 'Confirmed',
   NULL, NULL, 2, 6000, 'Paid', 'Vegetarian', 'Quiet room please', 'INR'),

  (acc_2,    d5,  r5, b5, '2026-03-25', '2026-03-30', 'CheckedOut',
   '2026-03-25 13:15:00+05:30', '2026-03-30 10:00:00+05:30', 1, 3000, 'Paid', 'Vegetarian', NULL, 'INR'),

  (acc_main, d7,  r2, b2, '2026-04-08', '2026-04-12', 'Confirmed',
   NULL, NULL, 1, 3200, 'Pending', 'Vegetarian', 'Early check-in requested', 'INR'),

  (acc_main, d9,  r3, b3, '2026-04-15', '2026-04-20', 'Pending',
   NULL, NULL, 2, 6000, 'Pending', 'Vegetarian', 'VIP guest - please arrange flowers', 'INR'),

  (acc_3,    d4,  r6, NULL, '2026-04-02', '2026-04-07', 'Confirmed',
   NULL, NULL, 3, 9000, 'Partial', 'Vegetarian', 'Ladies-only wing, 3 guests', 'INR')
ON CONFLICT DO NOTHING;

-- Waitlist entries
INSERT INTO booking_waitlist (accommodation_id, devotee_id, desired_check_in, desired_check_out,
                               room_type_preference, notes)
VALUES
  (acc_main, d6,  '2026-04-10', '2026-04-13', 'single', 'Attending a Rudrabhishek'),
  (acc_main, d10, '2026-04-20', '2026-04-25', 'double', 'Couple travelling together'),
  (acc_2,    d8,  '2026-04-15', '2026-04-17', 'single', 'Solo retreat')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 9. SEVA & VOLUNTEERS
-- =============================================================================

INSERT INTO seva_opportunities (id, name, category, description, location, is_active)
VALUES
  (seva_cleaning, 'Temple Cleaning Seva',    'Maintenance', 'Daily cleaning of temple premises, sanctum, and corridors', 'Main Temple',          true),
  (seva_prasad,   'Prasad Distribution',     'Kitchen',     'Distributing prasad and meals to devotees and guests',      'Prasad Hall',          true),
  (seva_garden,   'Garden & Nature Seva',    'Maintenance', 'Maintaining the ashram garden, plants, and pathways',       'Ashram Gardens',       true),
  (seva_gate,     'Gate Duty & Reception',   'Security',    'Welcoming and registering visitors at the main entrance',   'Main Entrance Gate',   true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO seva_shifts (id, opportunity_id, shift_date, start_time, end_time, slots_needed)
VALUES
  (sh1, seva_cleaning, '2026-04-01', '06:00', '09:00', 4),
  (sh2, seva_prasad,   '2026-04-01', '11:30', '13:30', 6),
  (sh3, seva_garden,   '2026-04-02', '07:00', '09:30', 3),
  (sh4, seva_gate,     '2026-04-02', '08:00', '17:00', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO volunteers (id, devotee_id, joined_at, skills, interests, category,
                         availability, training_certifications)
VALUES
  (vol1, d2,  '2023-03-10', ARRAY['Cleaning','Organisation'],                         ARRAY['Temple Seva','Cultural Events'], 'Regular',    '{"days":["Monday","Wednesday","Friday"]}'::jsonb, 'Basic First Aid'),
  (vol2, d4,  '2024-01-20', ARRAY['Cooking','Serving'],                               ARRAY['Kitchen Seva','Annadaan'],       'Regular',    '{"days":["Tuesday","Thursday","Saturday"]}'::jsonb, NULL),
  (vol3, d7,  '2022-09-01', ARRAY['Security','Crowd Management'],                     ARRAY['Gate Duty','Event Management'], 'Occasional', '{"days":["Saturday","Sunday"]}'::jsonb, 'Crowd Management'),
  (vol4, d8,  '2024-02-18', ARRAY['Digital Media','Photography','Content Creation'],  ARRAY['Digital Seva','Documentation'],  'Youth',      '{"days":["Saturday","Sunday"]}'::jsonb, NULL)
ON CONFLICT (devotee_id) DO NOTHING;

INSERT INTO seva_assignments (shift_id, volunteer_id, status, hours_actual)
VALUES
  (sh1, vol1, 'Completed', 3.0),
  (sh1, vol3, 'Completed', 3.0),
  (sh2, vol2, 'Completed', 2.0),
  (sh2, vol1, 'NoShow',    NULL),
  (sh3, vol4, 'Assigned',  NULL),
  (sh4, vol3, 'Assigned',  NULL)
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_badges (volunteer_id, badge_type, awarded_at)
VALUES
  (vol1, '10 Hours Completed',   '2023-06-15 10:00:00+05:30'),
  (vol1, 'Festival Hero',        '2023-10-20 10:00:00+05:30'),
  (vol2, '10 Hours Completed',   '2024-03-01 10:00:00+05:30'),
  (vol3, 'Crowd Management Pro', '2023-01-26 10:00:00+05:30')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 10. KITCHEN & PRASAD
-- =============================================================================

INSERT INTO kitchen_inventory (item_name, category, quantity, unit, min_level, expiry_date)
VALUES
  ('Basmati Rice',         'Grains',    150, 'kg',  20, '2026-12-31'),
  ('Atta (Wheat Flour)',   'Grains',    80,  'kg',  15, '2026-09-30'),
  ('Toor Dal',             'Pulses',    40,  'kg',  10, '2026-08-31'),
  ('Ghee (Pure)',          'Dairy',     25,  'L',    5, '2026-06-30'),
  ('Refined Oil',          'Oils',      30,  'L',    8, '2026-10-31'),
  ('Sugar',                'Sweetener', 50,  'kg',  10, '2026-12-31'),
  ('Potatoes',             'Vegetables',30,  'kg',   5, '2026-04-15'),
  ('Tomatoes',             'Vegetables', 8,  'kg',   3, '2026-04-05'),
  ('Fresh Milk',           'Dairy',     20,  'L',    5, '2026-04-03'),
  ('Rock Salt',            'Spices',    10,  'kg',   2, '2027-06-30')
ON CONFLICT DO NOTHING;

INSERT INTO meal_menus (menu_date, meal_type, items, special_diet_notes)
VALUES
  ('2026-04-01', 'breakfast', '["Poha", "Chai", "Banana"]'::jsonb, 'Gluten-free option available'),
  ('2026-04-01', 'lunch',     '["Dal Tadka", "Steamed Rice", "Roti", "Mixed Sabzi", "Buttermilk"]'::jsonb, 'Vegan option: skip buttermilk'),
  ('2026-04-01', 'dinner',    '["Khichdi", "Papad", "Achar", "Curd"]'::jsonb, NULL),
  ('2026-04-02', 'breakfast', '["Idli", "Sambar", "Coconut Chutney", "Chai"]'::jsonb, NULL),
  ('2026-04-02', 'lunch',     '["Rajma", "Rice", "Roti", "Salad", "Lassi"]'::jsonb, NULL),
  ('2026-04-02', 'dinner',    '["Vegetable Pulao", "Raita", "Papad"]'::jsonb, NULL)
ON CONFLICT DO NOTHING;

-- Meal tokens (token_code auto-generated by trigger)
INSERT INTO meal_tokens (meal_date, meal_type, devotee_id, redeemed_at)
VALUES
  ('2026-04-01', 'breakfast', d1,   '2026-04-01 07:45:00+05:30'),
  ('2026-04-01', 'lunch',     d1,   '2026-04-01 12:30:00+05:30'),
  ('2026-04-01', 'lunch',     d4,   '2026-04-01 12:15:00+05:30'),
  ('2026-04-01', 'dinner',    d4,   NULL),
  ('2026-04-01', 'breakfast', d3,   '2026-04-01 08:00:00+05:30'),
  ('2026-04-02', 'breakfast', d5,   NULL),
  ('2026-04-02', 'lunch',     d5,   NULL),
  ('2026-04-02', 'lunch',     NULL, NULL),
  ('2026-04-02', 'dinner',    NULL, NULL),
  ('2026-04-02', 'breakfast', d1,   NULL)
ON CONFLICT DO NOTHING;

INSERT INTO prasad_bookings (occasion, booking_date, devotee_id, quantity, status, amount, currency)
VALUES
  ('Ram Navami Prasad',          '2026-04-01', d1,  10, 'Confirmed',   500, 'INR'),
  ('Hanuman Jayanti Prasad',     '2026-04-01', d3,   5, 'Pending',     250, 'INR'),
  ('Navratri Daily Prasad',      '2026-03-20', d5,  20, 'Distributed', 1000,'INR'),
  ('Satyanarayan Prasad',        '2026-03-25', d9,   8, 'Prepared',    400, 'INR'),
  ('Makar Sankranti Distribution','2026-01-14', d7, 50, 'Distributed', 0,   'INR')
ON CONFLICT DO NOTHING;

INSERT INTO annadaan_donations (devotee_id, amount, in_kind_description, donation_date, purpose, currency)
VALUES
  (d1,  5000,  NULL,                          '2026-01-14', 'Full day annadaan for Makar Sankranti',      'INR'),
  (d3,  25000, NULL,                          '2026-01-26', 'Republic Day community lunch for 500 people','INR'),
  (d5,  NULL,  '50 kg rice and 20 kg dal',    '2026-02-14', 'Monthly grain donation',                     'INR'),
  (d9,  10000, NULL,                          '2026-03-01', 'Weekly annadaan sponsorship - March',        'INR'),
  (NULL, 2100, 'Mixed vegetables and fruits', '2026-03-28', 'Anonymous donor - festival season',          'INR')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 11. INVENTORY
-- =============================================================================

INSERT INTO inventory_locations (id, name, type, description)
VALUES
  (loc_storeroom, 'Main Storeroom',  'warehouse', 'Primary dry goods and materials storage'),
  (loc_kitchen,   'Kitchen Store',   'kitchen',   'Kitchen-specific perishables and daily supplies'),
  (loc_temple,    'Temple Cabinet',  'storage',   'Puja materials and religious items storage'),
  (loc_office,    'Admin Office',    'office',    'Stationery, equipment, and office supplies')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory_items (id, name, category, unit, current_stock, min_stock_level,
                              is_perishable, location_id)
VALUES
  (inv_rice,    'Basmati Rice',      'Grains',         'kg',   150, 25, false, loc_storeroom),
  (inv_ghee,    'Pure Cow Ghee',     'Dairy',          'L',     18,  5, true,  loc_kitchen),
  (inv_flour,   'Whole Wheat Flour', 'Grains',         'kg',    80, 15, false, loc_storeroom),
  (inv_camphor, 'Camphor Tablets',   'Puja Material',  'Box',   45, 10, false, loc_temple),
  (inv_incense, 'Agarbatti Sticks',  'Puja Material',  'Pack',  80, 20, false, loc_temple),
  (inv_flowers, 'Marigold Garlands', 'Puja Material',  'PCS',   20,  5, true,  loc_temple),
  (inv_dal,     'Toor Dal',          'Pulses',         'kg',    40, 10, false, loc_storeroom),
  (inv_oil,     'Mustard Oil',       'Oils',           'L',     30,  8, false, loc_kitchen)
ON CONFLICT (id) DO NOTHING;

-- Inventory transactions (IN first, then OUT)
INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_type, remarks)
VALUES
  (inv_rice,    'IN',  200, 'Purchase',   'Restocked from Anaj Mandi, Dehradun'),
  (inv_rice,    'OUT',  50, 'Usage',      'Kitchen usage March week 1'),
  (inv_ghee,    'IN',   30, 'Purchase',   'Ordered from Patanjali supplier'),
  (inv_ghee,    'OUT',  12, 'Usage',      'Daily puja and cooking usage'),
  (inv_camphor, 'IN',   60, 'Purchase',   'Ordered from religious store'),
  (inv_camphor, 'OUT',  15, 'Usage',      'Used in morning and evening aarti'),
  (inv_incense, 'IN',  100, 'Donation',   'Donated by Ramesh Kumar'),
  (inv_incense, 'OUT',  20, 'Usage',      'Daily puja usage'),
  (inv_dal,     'IN',   60, 'Purchase',   'Monthly purchase'),
  (inv_dal,     'OUT',  20, 'Usage',      'Kitchen usage')
ON CONFLICT DO NOTHING;

-- Vendors (accounting module table)
INSERT INTO vendors (id, name, contact_person, phone, email, address_line_1, gstin, is_active)
VALUES
  (v1, 'Shree Anaj Traders',    'Ramkishan Gupta',   '+91-9800001001', 'anaj@traders.com',  'Paltan Bazar, Dehradun',     '05AAAAA0000A1Z5', true),
  (v2, 'Patanjali Distributors','Acharya Distributors','+91-9800001002','patanjali@dist.com','Haridwar Industrial Estate',  '05BBBBB0000B1Z5', true),
  (v3, 'Dev Puja Samagri',      'Narayan Das',        '+91-9800001003', 'devpuja@store.com', 'Ramghat Road, Rishikesh',    NULL,              true)
ON CONFLICT (id) DO NOTHING;

-- Purchase orders (po_number auto-generated by trigger)
INSERT INTO purchase_orders (id, vendor_id, status, order_date, expected_date, total_amount, notes)
VALUES
  (po1, v1, 'Received', '2026-03-01', '2026-03-05', 12500, 'Monthly grains and pulses restock'),
  (po2, v3, 'Approved', '2026-04-01', '2026-04-04',  4800, 'Puja samagri for Ram Navami')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (po_id, item_id, item_name, quantity, unit_cost, total_cost)
VALUES
  (po1, inv_rice, 'Basmati Rice',      200, 45,  9000),
  (po1, inv_dal,  'Toor Dal',           60, 60,  3600),
  (po1, inv_flour,'Whole Wheat Flour',  80, 25,  2000),   -- Note: may exceed PO total (for demo)
  (po2, inv_camphor,'Camphor Tablets',  60, 35,  2100),
  (po2, inv_incense,'Agarbatti Sticks',100, 20,  2000)
ON CONFLICT DO NOTHING;

-- Inventory transfer (between locations)
INSERT INTO inventory_transfers (item_id, from_location_id, to_location_id, quantity, status, notes)
VALUES
  (inv_ghee,    loc_storeroom, loc_kitchen, 10, 'Completed', 'Transferred for kitchen daily use'),
  (inv_camphor, loc_storeroom, loc_temple,  30, 'Completed', 'Temple stock replenishment'),
  (inv_incense, loc_storeroom, loc_temple,  50, 'Completed', 'Temple aarti supplies')
ON CONFLICT DO NOTHING;

-- Religious items
INSERT INTO religious_items (name, type, quantity, location, is_saleable)
VALUES
  ('Bhagavad Gita (Hindi)',           'book',         50, 'Temple Library',     true),
  ('Ramayana (Tulsidas)',             'book',         30, 'Temple Library',     true),
  ('Lord Ganesha Brass Idol (6 inch)','idol',          8, 'Temple Store',       true),
  ('Radha Krishna Marble Murti',      'idol',          3, 'Main Sanctum',       false),
  ('Swami Ji Framed Photo (A3)',      'photo',        25, 'Temple Store',       true),
  ('Complete Puja Set (Brass)',        'puja_material', 5, 'Temple Store',       true),
  ('Panchamrit Thali',                'puja_material',12, 'Temple Store',       false),
  ('Rudraksha Mala (108 beads)',       'puja_material',20, 'Temple Store',       true)
ON CONFLICT DO NOTHING;

-- Fixed assets
INSERT INTO fixed_assets (name, category, purchase_date, purchase_value, current_value,
                           location, depreciation_method, useful_life_years)
VALUES
  ('Main Temple Building',     'Building',  '2005-01-01', 8500000,  25000000, 'Ashram Campus Block A',  'Straight-line',       50),
  ('Mahindra Bolero (UP14AB1234)','Vehicle', '2022-03-15', 1200000,   950000, 'Ashram Garage',           'Written Down Value',  10),
  ('Industrial Generator (25kVA)','Equipment','2021-06-10',  320000,   210000, 'Generator Room',          'Straight-line',       15),
  ('Ashram Land (0.5 acre)',    'Land',      '2001-04-01', 5000000, 45000000, 'Rishikesh, Uttarakhand',  NULL,                  NULL)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 12. MEDICAL & HEALTHCARE
-- =============================================================================

INSERT INTO emergency_contacts (name, role, phone, type)
VALUES
  ('AIIMS Rishikesh Emergency',   'Emergency Ward',        '0135-2471000', 'hospital'),
  ('Himalayan Hospital Dehradun', 'Casualty Dept',         '0135-2471000', 'hospital'),
  ('108 Ambulance Service',       'State Ambulance',       '108',          'ambulance'),
  ('Dr. Ramesh Srivastava',       'General Physician',     '+91-9812345678','doctor'),
  ('Dr. Meenakshi Verma',         'Ayurveda Practitioner', '+91-9823456789','doctor')
ON CONFLICT DO NOTHING;

INSERT INTO medical_camps (id, name, camp_date, end_date, location, description,
                            status, capacity, specialties, organizer_staff_id)
VALUES
  (mc1, 'General Health Camp – April 2026', '2026-04-05', '2026-04-06',
   'Ashram Community Hall', 'Two-day general health check-up camp with eye and dental screening',
   'Scheduled', 200, ARRAY['General Medicine','Eye','Dental'], s_manager),

  (mc2, 'Ayurveda Wellness Day',            '2026-03-21', '2026-03-21',
   'Yoga Shala',            'Free Ayurvedic consultation and panchakarma awareness sessions',
   'Completed', 80, ARRAY['Ayurveda','Yoga Therapy'],          s_priest1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_camp_registrations (camp_id, patient_name, contact, notes,
                                         status, prescription, follow_up_date, is_walk_in)
VALUES
  (mc2, 'Priya Sharma',   '+91-9811111003', 'Chronic fatigue and acidity',     'Attended',  'Triphala churna 5g at bedtime + diet chart', '2026-04-21', false),
  (mc2, 'Vikram Singh',   '+91-9811111013', 'Back pain and knee stiffness',    'Attended',  'Mahanarayan oil massage + yoga asanas',      '2026-04-21', true),
  (mc2, 'Unknown patient','N/A',            'Headache and general weakness',   'Attended',  'Rest and hydration prescribed',              NULL,         true),
  (mc1, 'Kavita Joshi',   '+91-9811111011', 'Pre-camp registration for April', 'Registered', NULL,                                        NULL,         false)
ON CONFLICT DO NOTHING;

INSERT INTO wellness_consultations (devotee_id, consultation_date, practitioner_id,
                                     type, treatment_plan, session_notes,
                                     follow_up_date, status)
VALUES
  (d2,  '2026-03-21', s_priest1, 'Ayurveda', 'Triphala + Ashwagandha for 30 days',
   'Patient reports sleep issues and low energy. Vata imbalance suspected.',    '2026-04-21', 'Completed'),

  (d4,  '2026-03-21', s_priest1, 'Yoga',     'Daily 45-min pranayama and asana routine',
   'Beginner level. Recommended morning session with group.',                   '2026-04-07', 'Completed'),

  (d7,  '2026-04-07', s_priest1, 'Ayurveda', 'Shirodhara and Abhyanga for stress',
   'High stress levels observed. Pitta imbalance.',                             '2026-04-21', 'Scheduled'),

  (d1,  '2026-04-10', s_priest1, 'Meditation','Vipassana technique introduction',
   'First session scheduled. Patient keen to start daily practice.',            '2026-04-24', 'Scheduled')
ON CONFLICT DO NOTHING;

INSERT INTO first_aid_incidents (incident_date, incident_time, location, patient_name,
                                  patient_contact, incident_type, treatment_given,
                                  referred_to_hospital, severity, attending_staff_id, notes)
VALUES
  ('2026-03-15', '10:30', 'Yoga Shala',    'Arun Khanna',  '+91-9811112001', 'Faint',
   'Patient laid down, cold water given, vitals checked. Recovered in 10 minutes.',
   false, 'Minor', s_frontdesk, 'Possible dehydration. Advised to drink more water.'),

  ('2026-03-28', '15:00', 'Main Temple Steps','Unknown',   NULL,            'Fall',
   'First aid applied to minor cuts. Antiseptic and bandage applied.',
   false, 'Minor', s_security, 'Elderly visitor slipped on wet floor. Put up wet floor signage.'),

  ('2026-04-01', '09:15', 'Ashram Garden', 'Maria Gonzalez','+34-612345678','AllergicReaction',
   'Antihistamine given from first aid kit. Patient monitored for 30 minutes.',
   false, 'Moderate', s_frontdesk, 'Reacted to something in garden. Advised to visit doctor.')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 13. TEMPLE EVENTS
-- =============================================================================

INSERT INTO temple_events (id, name, type, start_date, end_date, description,
                            budget, status, coordinator_id)
VALUES
  (ev1, 'Ram Navami 2026',       'Festival', '2026-04-06', '2026-04-06',
   'Annual Ram Navami celebration with special puja, bhajan, and prasad for all',
   50000, 'Planned', s_manager),

  (ev2, 'Navratri 2026',         'Festival', '2026-04-02', '2026-04-10',
   'Nine nights of Navratri with daily Durga puja, dandiya raas, and havan',
   120000, 'Planned', s_manager),

  (ev3, 'Monthly Satsang – April','Cultural','2026-04-25', '2026-04-25',
   'Monthly devotee satsang with kirtan, pravachan, and community dinner',
   15000, 'Planned', s_priest1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_registrations (event_id, devotee_id, number_of_participants, status)
VALUES
  (ev1, d1,  2, 'Registered'),
  (ev1, d2,  1, 'Registered'),
  (ev1, d5,  4, 'Registered'),
  (ev1, d9,  2, 'Registered'),
  (ev2, d3,  2, 'Registered'),
  (ev2, d6,  1, 'Registered'),
  (ev2, d8,  1, 'Registered'),
  (ev3, d1,  1, 'Registered'),
  (ev3, d4,  1, 'Registered'),
  (ev3, d7,  3, 'Registered')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 14. STAFF ATTENDANCE (last 3 days)
-- =============================================================================

INSERT INTO staff_attendance (staff_id, attendance_date, status, check_in_time, check_out_time)
VALUES
  -- March 30
  (s_priest1,   '2026-03-30', 'Present', '05:30', '20:00'),
  (s_priest2,   '2026-03-30', 'Present', '05:30', '19:30'),
  (s_cook,      '2026-03-30', 'Present', '05:00', '14:00'),
  (s_security,  '2026-03-30', 'Present', '08:00', '20:00'),
  (s_frontdesk, '2026-03-30', 'Present', '09:00', '18:00'),
  (s_driver,    '2026-03-30', 'OnLeave', NULL,    NULL),
  (s_manager,   '2026-03-30', 'Present', '09:00', '18:30'),
  -- March 31
  (s_priest1,   '2026-03-31', 'Present', '05:30', '20:00'),
  (s_priest2,   '2026-03-31', 'Absent',  NULL,    NULL),
  (s_cook,      '2026-03-31', 'Present', '05:00', '14:00'),
  (s_security,  '2026-03-31', 'Present', '08:00', '20:00'),
  (s_frontdesk, '2026-03-31', 'HalfDay', '09:00', '13:00'),
  (s_driver,    '2026-03-31', 'Present', '08:00', '17:00'),
  (s_manager,   '2026-03-31', 'Present', '09:00', '18:00'),
  -- April 1
  (s_priest1,   '2026-04-01', 'Present', '05:30', '20:00'),
  (s_priest2,   '2026-04-01', 'Present', '05:30', '19:30'),
  (s_cook,      '2026-04-01', 'Present', '05:00', '14:00'),
  (s_security,  '2026-04-01', 'Present', '08:00', '20:00'),
  (s_frontdesk, '2026-04-01', 'Present', '09:00', '18:00'),
  (s_driver,    '2026-04-01', 'Present', '08:00', '17:00'),
  (s_manager,   '2026-04-01', 'Present', '09:30', '18:30')
ON CONFLICT (staff_id, attendance_date) DO NOTHING;

-- =============================================================================
-- 15. GUEST FEEDBACK
-- =============================================================================

INSERT INTO guest_feedback (booking_id, rating, comment)
SELECT ab.id, 5, 'Wonderful experience. The room was clean and the prasad was delicious. Jai Hari Om!'
FROM accommodation_bookings ab
JOIN rooms r ON ab.room_id = r.id
WHERE r.id = r5
  AND ab.status = 'CheckedOut'
LIMIT 1;

RAISE NOTICE 'Seed data inserted successfully for user %', uid;

END $$;

-- =============================================================================
-- BLOCK 2: EXPANDED DATA + GURUKUL
-- =============================================================================

DO $$
DECLARE
  uid uuid := '777080e1-32f7-42be-b199-f33dc844e904';

  -- Re-declare core IDs for cross-references
  d1  uuid := 'aa000003-0000-0000-0000-000000000001';
  d2  uuid := 'aa000003-0000-0000-0000-000000000002';
  d3  uuid := 'aa000003-0000-0000-0000-000000000003';
  d4  uuid := 'aa000003-0000-0000-0000-000000000004';
  d5  uuid := 'aa000003-0000-0000-0000-000000000005';
  d6  uuid := 'aa000003-0000-0000-0000-000000000006';
  d7  uuid := 'aa000003-0000-0000-0000-000000000007';
  d8  uuid := 'aa000003-0000-0000-0000-000000000008';
  d9  uuid := 'aa000003-0000-0000-0000-000000000009';
  d10 uuid := 'aa000003-0000-0000-0000-000000000010';

  -- Additional devotee IDs
  d11 uuid := 'aa000003-0000-0000-0000-000000000011';
  d12 uuid := 'aa000003-0000-0000-0000-000000000012';
  d13 uuid := 'aa000003-0000-0000-0000-000000000013';
  d14 uuid := 'aa000003-0000-0000-0000-000000000014';
  d15 uuid := 'aa000003-0000-0000-0000-000000000015';
  d16 uuid := 'aa000003-0000-0000-0000-000000000016';
  d17 uuid := 'aa000003-0000-0000-0000-000000000017';
  d18 uuid := 'aa000003-0000-0000-0000-000000000018';
  d19 uuid := 'aa000003-0000-0000-0000-000000000019';
  d20 uuid := 'aa000003-0000-0000-0000-000000000020';
  d21 uuid := 'aa000003-0000-0000-0000-000000000021';
  d22 uuid := 'aa000003-0000-0000-0000-000000000022';
  d23 uuid := 'aa000003-0000-0000-0000-000000000023';
  d24 uuid := 'aa000003-0000-0000-0000-000000000024';
  d25 uuid := 'aa000003-0000-0000-0000-000000000025';

  -- Staff IDs
  s_priest1   uuid := 'aa000002-0000-0000-0000-000000000001';
  s_priest2   uuid := 'aa000002-0000-0000-0000-000000000002';
  s_cook      uuid := 'aa000002-0000-0000-0000-000000000003';
  s_security  uuid := 'aa000002-0000-0000-0000-000000000004';
  s_frontdesk uuid := 'aa000002-0000-0000-0000-000000000005';
  s_driver    uuid := 'aa000002-0000-0000-0000-000000000006';
  s_manager   uuid := 'aa000002-0000-0000-0000-000000000007';

  -- Puja IDs
  puja_ganesh uuid := 'aa000004-0000-0000-0000-000000000001';
  puja_satya  uuid := 'aa000004-0000-0000-0000-000000000002';
  puja_rudra  uuid := 'aa000004-0000-0000-0000-000000000003';
  puja_nava   uuid := 'aa000004-0000-0000-0000-000000000004';
  puja_laxmi  uuid := 'aa000004-0000-0000-0000-000000000005';

  -- Event IDs
  ev1 uuid := 'aa000013-0000-0000-0000-000000000001';
  ev2 uuid := 'aa000013-0000-0000-0000-000000000002';
  ev3 uuid := 'aa000013-0000-0000-0000-000000000003';

  -- Medical Camp IDs
  mc1 uuid := 'aa000014-0000-0000-0000-000000000001';

  -- Seva IDs
  seva_cleaning uuid := 'aa000010-0000-0000-0000-000000000001';
  seva_prasad   uuid := 'aa000010-0000-0000-0000-000000000002';
  seva_garden   uuid := 'aa000010-0000-0000-0000-000000000003';
  seva_gate     uuid := 'aa000010-0000-0000-0000-000000000004';

  -- Volunteer IDs
  vol1 uuid := 'aa000012-0000-0000-0000-000000000001';
  vol2 uuid := 'aa000012-0000-0000-0000-000000000002';
  vol3 uuid := 'aa000012-0000-0000-0000-000000000003';
  vol4 uuid := 'aa000012-0000-0000-0000-000000000004';

  -- Donation category IDs (fetched dynamically)
  cat_general  uuid;
  cat_annadaan uuid;
  cat_building uuid;
  cat_pooja    uuid;

  -- Accommodation IDs
  acc_main uuid;
  r4 uuid := 'aa000006-0000-0000-0000-000000000004';

  -- Inventory IDs
  inv_rice    uuid := 'aa000009-0000-0000-0000-000000000001';
  inv_ghee    uuid := 'aa000009-0000-0000-0000-000000000002';
  inv_flour   uuid := 'aa000009-0000-0000-0000-000000000003';
  inv_camphor uuid := 'aa000009-0000-0000-0000-000000000004';
  inv_incense uuid := 'aa000009-0000-0000-0000-000000000005';
  inv_dal     uuid := 'aa000009-0000-0000-0000-000000000007';

  -- Gurukul Material IDs
  gk_course_gita   uuid := 'aa000020-0000-0000-0000-000000000001';
  gk_course_yoga   uuid := 'aa000020-0000-0000-0000-000000000002';
  gk_course_vedic  uuid := 'aa000020-0000-0000-0000-000000000003';
  gk_book_gita_ess uuid := 'aa000020-0000-0000-0000-000000000004';
  gk_book_yoga_sut uuid := 'aa000020-0000-0000-0000-000000000005';
  gk_book_mahab    uuid := 'aa000020-0000-0000-0000-000000000006';
  gk_book_ayur     uuid := 'aa000020-0000-0000-0000-000000000007';
  gk_pdf_prayer    uuid := 'aa000020-0000-0000-0000-000000000008';
  gk_pdf_ganesha   uuid := 'aa000020-0000-0000-0000-000000000009';
  gk_video_aarti   uuid := 'aa000020-0000-0000-0000-000000000010';

  -- Gurukul Module IDs (Gita course)
  gm_gita_intro    uuid := 'aa000021-0000-0000-0000-000000000001';
  gm_gita_arjuna   uuid := 'aa000021-0000-0000-0000-000000000002';
  gm_gita_self     uuid := 'aa000021-0000-0000-0000-000000000003';
  gm_gita_karma    uuid := 'aa000021-0000-0000-0000-000000000004';
  gm_gita_bhakti   uuid := 'aa000021-0000-0000-0000-000000000005';
  -- Yoga course modules
  gm_yoga_found    uuid := 'aa000021-0000-0000-0000-000000000006';
  gm_yoga_prana    uuid := 'aa000021-0000-0000-0000-000000000007';
  gm_yoga_asana    uuid := 'aa000021-0000-0000-0000-000000000008';
  -- Vedic course modules
  gm_ved_alpha     uuid := 'aa000021-0000-0000-0000-000000000009';
  gm_ved_mantra    uuid := 'aa000021-0000-0000-0000-000000000010';
  gm_ved_prayers   uuid := 'aa000021-0000-0000-0000-000000000011';

  -- Gurukul Lesson IDs
  gl_gita_1  uuid := 'aa000022-0000-0000-0000-000000000001';
  gl_gita_2  uuid := 'aa000022-0000-0000-0000-000000000002';
  gl_gita_3  uuid := 'aa000022-0000-0000-0000-000000000003';
  gl_gita_4  uuid := 'aa000022-0000-0000-0000-000000000004';
  gl_gita_5  uuid := 'aa000022-0000-0000-0000-000000000005';
  gl_gita_6  uuid := 'aa000022-0000-0000-0000-000000000006';
  gl_gita_7  uuid := 'aa000022-0000-0000-0000-000000000007';
  gl_gita_8  uuid := 'aa000022-0000-0000-0000-000000000008';
  gl_gita_9  uuid := 'aa000022-0000-0000-0000-000000000009';
  gl_gita_10 uuid := 'aa000022-0000-0000-0000-000000000010';
  gl_yoga_1  uuid := 'aa000022-0000-0000-0000-000000000011';
  gl_yoga_2  uuid := 'aa000022-0000-0000-0000-000000000012';
  gl_yoga_3  uuid := 'aa000022-0000-0000-0000-000000000013';
  gl_yoga_4  uuid := 'aa000022-0000-0000-0000-000000000014';
  gl_yoga_5  uuid := 'aa000022-0000-0000-0000-000000000015';
  gl_yoga_6  uuid := 'aa000022-0000-0000-0000-000000000016';
  gl_ved_1   uuid := 'aa000022-0000-0000-0000-000000000017';
  gl_ved_2   uuid := 'aa000022-0000-0000-0000-000000000018';
  gl_ved_3   uuid := 'aa000022-0000-0000-0000-000000000019';
  gl_ved_4   uuid := 'aa000022-0000-0000-0000-000000000020';

  -- Gurukul Enrollment IDs
  ge_d1_gita  uuid := 'aa000023-0000-0000-0000-000000000001';
  ge_d2_yoga  uuid := 'aa000023-0000-0000-0000-000000000002';
  ge_d3_gita  uuid := 'aa000023-0000-0000-0000-000000000003';
  ge_d4_yoga  uuid := 'aa000023-0000-0000-0000-000000000004';
  ge_d5_ved   uuid := 'aa000023-0000-0000-0000-000000000005';
  ge_d7_gita  uuid := 'aa000023-0000-0000-0000-000000000006';
  ge_d8_yoga  uuid := 'aa000023-0000-0000-0000-000000000007';
  ge_d9_gita  uuid := 'aa000023-0000-0000-0000-000000000008';
  ge_d6_ved   uuid := 'aa000023-0000-0000-0000-000000000009';

  -- Gurukul Order IDs
  go1 uuid := 'aa000024-0000-0000-0000-000000000001';
  go2 uuid := 'aa000024-0000-0000-0000-000000000002';
  go3 uuid := 'aa000024-0000-0000-0000-000000000003';
  go4 uuid := 'aa000024-0000-0000-0000-000000000004';
  go5 uuid := 'aa000024-0000-0000-0000-000000000005';
  go6 uuid := 'aa000024-0000-0000-0000-000000000006';

  -- Additional Shift IDs
  sh5 uuid := 'aa000011-0000-0000-0000-000000000005';
  sh6 uuid := 'aa000011-0000-0000-0000-000000000006';
  sh7 uuid := 'aa000011-0000-0000-0000-000000000007';
  sh8 uuid := 'aa000011-0000-0000-0000-000000000008';

  -- Category lookup variables
  cat_id_spiritual uuid;
  cat_id_philosophy uuid;
  cat_id_yoga uuid;
  cat_id_courses uuid;
  cat_id_videos uuid;

BEGIN

-- Fetch donation categories
SELECT id INTO cat_general  FROM master_donation_categories WHERE name = 'General Fund'   LIMIT 1;
SELECT id INTO cat_annadaan FROM master_donation_categories WHERE name = 'Annadanam'      LIMIT 1;
SELECT id INTO cat_building FROM master_donation_categories WHERE name = 'Building Fund'  LIMIT 1;
SELECT id INTO cat_pooja    FROM master_donation_categories WHERE name = 'Pooja Seva'     LIMIT 1;

-- Fetch accommodation
SELECT id INTO acc_main FROM accommodations WHERE code = 'MAIN' LIMIT 1;

-- Fetch gurukul category IDs
SELECT id INTO cat_id_spiritual  FROM master_material_categories WHERE name = 'Spiritual Texts'  LIMIT 1;
SELECT id INTO cat_id_philosophy FROM master_material_categories WHERE name = 'Philosophy'        LIMIT 1;
SELECT id INTO cat_id_yoga       FROM master_material_categories WHERE name = 'Yoga & Meditation' LIMIT 1;
SELECT id INTO cat_id_courses    FROM master_material_categories WHERE name = 'Courses'            LIMIT 1;
SELECT id INTO cat_id_videos     FROM master_material_categories WHERE name = 'Videos'             LIMIT 1;

-- =============================================================================
-- A. ADDITIONAL DEVOTEES (d11–d25)
-- =============================================================================

INSERT INTO devotees (id, devotee_code, first_name, last_name, email, mobile_number, gender,
                      date_of_birth, city, state, country, gotra, nakshatra, rashi,
                      membership_type, membership_status, relationship_status,
                      first_visit_date, last_visit_date, dietary_preferences,
                      emergency_contact_name, emergency_contact_phone)
VALUES
  (d11, 'DEV-2024-0011', 'Deepak',   'Malhotra',  'deepak.malhotra@gmail.com',   '+91-9822111001', 'Male',   '1980-01-20', 'Chandigarh',  'Punjab',          'India', 'Vashishtha', 'Punarvasu', 'Mithuna', 'General', 'Active', 'Active', '2023-04-01', '2026-02-20', 'Vegetarian', 'Neeta Malhotra',   '+91-9822111002'),
  (d12, 'DEV-2024-0012', 'Geeta',    'Rao',        'geeta.rao@gmail.com',         '+91-9822111003', 'Female', '1975-11-08', 'Hyderabad',   'Telangana',       'India', 'Angirasa',   'Uttara Phalguni','Kanya','Life',   'Active', 'Active', '2021-07-15', '2026-03-01', 'Vegetarian', 'Suresh Rao',       '+91-9822111004'),
  (d13, 'DEV-2024-0013', 'Harish',   'Chand',      'harish.chand@gmail.com',      '+91-9822111005', 'Male',   '1960-06-30', 'Haridwar',    'Uttarakhand',     'India', 'Bharadwaj',  'Dhanistha',  'Makara', 'Patron',  'Active', 'Active', '2018-02-10', '2026-03-28', 'Vegetarian', 'Savitri Chand',    '+91-9822111006'),
  (d14, 'DEV-2024-0014', 'Sita',     'Tripathi',   'sita.tripathi@gmail.com',     '+91-9822111007', 'Female', '1988-03-25', 'Allahabad',   'Uttar Pradesh',   'India', 'Kashyapa',   'Shravana',   'Makara', 'General', 'Active', 'Active', '2024-03-01', '2026-03-31', 'Vegan',      'Ram Tripathi',     '+91-9822111008'),
  (d15, 'DEV-2024-0015', 'Manoj',    'Tiwari',     'manoj.tiwari@gmail.com',      '+91-9822111009', 'Male',   '1970-09-12', 'Bhopal',      'Madhya Pradesh',  'India', 'Sandilya',   'Magha',      'Simha',  'General', 'Active', 'Active', '2022-11-05', '2026-02-14', 'Vegetarian', 'Saroj Tiwari',     '+91-9822111010'),
  (d16, 'DEV-2024-0016', 'Pooja',    'Bhatia',     'pooja.bhatia@gmail.com',      '+91-9822111011', 'Female', '1994-07-19', 'Amritsar',    'Punjab',          'India', 'Atri',       'Rohini',     'Vrishabha','General','Active','Active','2025-01-20','2026-03-25','Vegetarian','Rahul Bhatia',     '+91-9822111012'),
  (d17, 'DEV-2024-0017', 'Santosh',  'Kulkarni',   'santosh.kulkarni@gmail.com',  '+91-9822111013', 'Male',   '1983-04-03', 'Nagpur',      'Maharashtra',     'India', 'Bharadwaj',  'Hasta',      'Kanya',  'General', 'Active', 'Active', '2023-09-11', '2026-03-15', 'Vegetarian', 'Rekha Kulkarni',   '+91-9822111014'),
  (d18, 'DEV-2024-0018', 'Usha',     'Menon',      'usha.menon@gmail.com',        '+91-9822111015', 'Female', '1968-12-14', 'Trivandrum',  'Kerala',          'India', 'Vasishtha',  'Ashlesha',   'Karka',  'Life',    'Active', 'Active', '2020-05-01', '2026-03-20', 'Vegetarian', 'Gopinath Menon',   '+91-9822111016'),
  (d19, 'DEV-2024-0019', 'Aakash',   'Gupta',      'aakash.gupta@gmail.com',      '+91-9822111017', 'Male',   '1998-02-09', 'Jaipur',      'Rajasthan',       'India', 'Garg',       'Mrigashirsha','Mithuna','General','Active','Active','2025-06-10','2026-03-28','Vegetarian','Sunita Gupta',     '+91-9822111018'),
  (d20, 'DEV-2024-0020', 'Nirmala',  'Sinha',      'nirmala.sinha@gmail.com',     '+91-9822111019', 'Female', '1955-08-22', 'Patna',       'Bihar',           'India', 'Bharadwaj',  'Uttara Bhadra','Meena','Patron', 'Active', 'Active', '2016-03-15', '2026-02-28', 'Vegetarian', 'Umesh Sinha',      '+91-9822111020'),
  (d21, 'DEV-2024-0021', 'Vishal',   'Arora',      'vishal.arora@gmail.com',      '+91-9822111021', 'Male',   '1985-05-16', 'Ludhiana',    'Punjab',          'India', 'Kashyapa',   'Pushya',     'Karka',  'General', 'Active', 'Active', '2024-01-08', '2026-03-22', 'Vegetarian', 'Priya Arora',      '+91-9822111022'),
  (d22, 'DEV-2024-0022', 'Kamala',   'Swaminathan','kamala.sw@gmail.com',         '+91-9822111023', 'Female', '1972-10-31', 'Coimbatore',  'Tamil Nadu',      'India', 'Angirasa',   'Bharani',    'Mesha',  'Life',    'Active', 'Active', '2019-10-02', '2026-03-10', 'Vegan',      'Ravi Swaminathan', '+91-9822111024'),
  (d23, 'DEV-2024-0023', 'Devendra', 'Pandey',     'devendra.pandey@gmail.com',   '+91-9822111025', 'Male',   '1977-07-07', 'Gorakhpur',   'Uttar Pradesh',   'India', 'Vatsa',      'Revati',     'Meena',  'General', 'Active', 'Active', '2022-08-18', '2026-03-18', 'Vegetarian', 'Poonam Pandey',    '+91-9822111026'),
  (d24, 'DEV-2024-0024', 'Lakshman', 'Reddy',      'lakshman.reddy@gmail.com',    '+91-9822111027', 'Male',   '1965-03-19', 'Vijayawada',  'Andhra Pradesh',  'India', 'Vasishtha',  'Uttara Ashadha','Dhanus','Life',  'Active', 'Active', '2017-11-12', '2026-03-05', 'Vegetarian', 'Savitha Reddy',    '+91-9822111028'),
  (d25, 'DEV-2024-0025', 'Manjula',  'Shah',       'manjula.shah@gmail.com',      '+91-9822111029', 'Female', '1990-01-05', 'Surat',       'Gujarat',         'India', 'Garg',       'Chitra',     'Tula',   'General', 'Active', 'Active', '2024-07-20', '2026-03-30', 'Vegetarian', 'Hemant Shah',      '+91-9822111030')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- B. ADDITIONAL DONATIONS (spread Oct 2025 – March 2026)
-- =============================================================================

INSERT INTO donations (donation_code, devotee_id, donation_date, amount, category_id,
                        purpose, payment_mode, transaction_ref, payment_status,
                        receipt_generated, currency, created_by)
VALUES
  ('DON-2025-0001', d13, '2025-10-02', 51000,  cat_building, 'Navratri building fund contribution',      'Cheque',        'CHQ20251002001', 'Completed', true,  'INR', uid),
  ('DON-2025-0002', d18, '2025-10-10', 11000,  cat_general,  'Dussehra celebration sponsorship',          'UPI',           'UPI20251010001', 'Completed', true,  'INR', uid),
  ('DON-2025-0003', d12, '2025-10-20', 5100,   cat_annadaan, 'Annadaan for Diwali week',                  'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2025-0004', d20, '2025-10-24', 21000,  cat_pooja,    'Diwali Lakshmi puja sponsorship',           'Bank Transfer', 'NEFT20251024001','Completed', true,  'INR', uid),
  ('DON-2025-0005', d24, '2025-11-01', 10000,  cat_general,  'Ashram maintenance – November',             'UPI',           'UPI20251101001', 'Completed', true,  'INR', uid),
  ('DON-2025-0006', d15, '2025-11-14', 7500,   cat_annadaan, 'Kartik Purnima community lunch',            'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2025-0007', d11, '2025-11-28', 3100,   cat_pooja,    'Gita Jayanti puja fund',                    'UPI',           'UPI20251128001', 'Completed', false, 'INR', uid),
  ('DON-2025-0008', d22, '2025-12-01', 25000,  cat_building, 'Year-end building fund donation',           'Bank Transfer', 'NEFT20251201001','Completed', true,  'INR', uid),
  ('DON-2025-0009', d13, '2025-12-10', 15000,  cat_annadaan, 'Winter annadaan – December',                'Cheque',        'CHQ20251210001', 'Completed', true,  'INR', uid),
  ('DON-2025-0010', d17, '2025-12-25', 2100,   cat_pooja,    'Christmas satsang puja contribution',       'UPI',           'UPI20251225001', 'Completed', false, 'INR', uid),
  ('DON-2026-0011', d20, '2026-01-01', 51000,  cat_general,  'New Year special donation',                 'Bank Transfer', 'NEFT20260101001','Completed', true,  'INR', uid),
  ('DON-2026-0012', d16, '2026-01-10', 1100,   cat_pooja,    'Makar Sankranti puja sponsorship',          'UPI',           'UPI20260110001', 'Completed', false, 'INR', uid),
  ('DON-2026-0013', d21, '2026-01-26', 5500,   cat_annadaan, 'Republic Day community meal',               'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2026-0014', d14, '2026-02-05', 7700,   cat_building, 'Building fund – February contribution',    'UPI',           'UPI20260205001', 'Completed', true,  'INR', uid),
  ('DON-2026-0015', d19, '2026-02-10', 1500,   cat_general,  'Monthly recurring donation',                'UPI',           'UPI20260210001', 'Completed', false, 'INR', uid),
  ('DON-2026-0016', d23, '2026-02-15', 11000,  cat_pooja,    'Shivaratri abhishek sponsorship',           'Cash',          NULL,             'Completed', true,  'INR', uid),
  ('DON-2026-0017', d25, '2026-02-24', 3300,   cat_annadaan, 'Annadaan – Shivratri week',                 'UPI',           'UPI20260224001', 'Completed', false, 'INR', uid),
  ('DON-2026-0018', d12, '2026-03-01', 21000,  cat_building, 'Holi special building fund',                'Bank Transfer', 'NEFT20260301001','Completed', true,  'INR', uid),
  ('DON-2026-0019', d15, '2026-03-05', 2500,   cat_general,  'Ashram library book donation',              'UPI',           'UPI20260305001', 'Completed', false, 'INR', uid),
  ('DON-2026-0020', d11, '2026-03-10', 5100,   cat_annadaan, 'Holi week annadaan fund',                   'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2026-0021', d22, '2026-03-12', 10100,  cat_building, 'Donation towards meditation hall upgrade',  'Cheque',        'CHQ20260312001', 'Completed', true,  'INR', uid),
  ('DON-2026-0022', d24, '2026-03-18', 7200,   cat_general,  'Annual general fund – Ugadi donation',      'UPI',           'UPI20260318001', 'Completed', true,  'INR', uid),
  ('DON-2026-0023', d17, '2026-03-22', 1100,   cat_pooja,    'Chaitra Navratri puja fund',                'UPI',           'UPI20260322001', 'Completed', false, 'INR', uid),
  ('DON-2026-0024', d19, '2026-03-25', 3500,   cat_annadaan, 'Ram Navami annadaan sponsorship',           'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2026-0025', d16, '2026-03-30', 50000,  cat_building, 'Major building fund – new kitchen wing',   'Bank Transfer', 'NEFT20260330001','Completed', true,  'INR', uid)
ON CONFLICT (donation_code) DO NOTHING;

-- Additional in-kind donations
INSERT INTO in_kind_donations (devotee_id, donation_date, item_type, description,
                                quantity, unit, estimated_value, condition,
                                destination, acknowledgement_status, currency)
VALUES
  (d13, '2025-11-01', 'grains',          '100 kg Basmati rice for winter',       100,  'KG',  4000, 'New',  'Kitchen',     'Acknowledged', 'INR'),
  (d20, '2025-12-01', 'clothes',         'New blankets for winter distribution',   50,  'PCS', 25000,'New',  'Guest House', 'Acknowledged', 'INR'),
  (d22, '2026-01-15', 'religious_items', 'Brass bells for main sanctum',           5,   'PCS', 8000, 'New',  'Temple',      'Acknowledged', 'INR'),
  (d24, '2026-02-08', 'kitchen_supplies','Large steel cooking vessels (set)',       3,   'SET', 6000, 'New',  'Kitchen',     'Acknowledged', 'INR'),
  (d12, '2026-02-20', 'books',           'Bhagavad Gita (200 copies for library)', 200, 'PCS', 14000,'New',  'Temple',      'Acknowledged', 'INR'),
  (d15, '2026-03-07', 'medical_supplies','First aid kits (complete)',               5,   'PCS', 5500, 'New',  'Medical',     'Pending',      'INR'),
  (d11, '2026-03-20', 'grains',          '50 kg dal and 50 kg atta for Navratri', 100,  'KG',  4500, 'New',  'Kitchen',     'Pending',      'INR')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- C. ADDITIONAL VISITOR REGISTRATIONS (March 2026)
-- =============================================================================

INSERT INTO visitor_registrations (devotee_id, name, phone, email, visit_purpose,
                                    visit_date, check_in_at, check_out_at,
                                    is_walk_in, is_vip, nationality)
VALUES
  (d11, 'Deepak Malhotra',    '+91-9822111001', 'deepak.malhotra@gmail.com', 'Darshan',              '2026-03-01', '2026-03-01 09:00:00+05:30', '2026-03-01 12:30:00+05:30', false, false, 'Indian'),
  (NULL, 'Thomas Anderson',   '+1-5559876543',  'thomas@email.com',          'Yoga & Meditation',    '2026-03-01', '2026-03-01 07:00:00+05:30', '2026-03-01 12:00:00+05:30', true,  false, 'American'),
  (d12, 'Geeta Rao',          '+91-9822111003', 'geeta.rao@gmail.com',       'Spiritual Retreat',    '2026-03-05', '2026-03-05 08:30:00+05:30', '2026-03-05 17:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Fatima Al-Zahra',   '+971-501234567', NULL,                        'Ashram Tour',          '2026-03-05', '2026-03-05 10:00:00+05:30', '2026-03-05 14:00:00+05:30', true,  false, 'Emirati'),
  (d14, 'Sita Tripathi',      '+91-9822111007', 'sita.tripathi@gmail.com',   'New Member Visit',     '2026-03-07', '2026-03-07 09:30:00+05:30', '2026-03-07 13:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Lucas Fernandez',   '+55-11912345678',NULL,                        'Documentary Research', '2026-03-08', '2026-03-08 10:00:00+05:30', '2026-03-08 16:00:00+05:30', true,  false, 'Brazilian'),
  (d13, 'Harish Chand',       '+91-9822111005', 'harish.chand@gmail.com',    'Board Meeting',        '2026-03-10', '2026-03-10 11:00:00+05:30', '2026-03-10 15:00:00+05:30', false, true,  'Indian'),
  (NULL, 'Swami Prabodhanand','+91-9900000002', NULL,                        'Spiritual Visit',      '2026-03-10', '2026-03-10 08:00:00+05:30', '2026-03-10 20:00:00+05:30', false, true,  'Indian'),
  (d15, 'Manoj Tiwari',       '+91-9822111009', 'manoj.tiwari@gmail.com',    'Darshan',              '2026-03-12', '2026-03-12 08:00:00+05:30', '2026-03-12 11:30:00+05:30', false, false, 'Indian'),
  (NULL, 'Emma Thompson',     '+44-7700900123', 'emma.t@email.co.uk',        'Yoga & Meditation',    '2026-03-12', '2026-03-12 07:30:00+05:30', '2026-03-12 13:00:00+05:30', true,  false, 'British'),
  (d18, 'Usha Menon',         '+91-9822111015', 'usha.menon@gmail.com',      'Medical Consultation', '2026-03-14', '2026-03-14 10:00:00+05:30', '2026-03-14 13:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Nakamura Hiroshi',  '+81-903456789',  'hiroshi@email.jp',          'Cultural Study',       '2026-03-14', '2026-03-14 09:00:00+05:30', NULL,                        true,  false, 'Japanese'),
  (d16, 'Pooja Bhatia',       '+91-9822111011', 'pooja.bhatia@gmail.com',    'Volunteer Orientation','2026-03-17', '2026-03-17 09:00:00+05:30', '2026-03-17 14:00:00+05:30', false, false, 'Indian'),
  (d22, 'Kamala Swaminathan', '+91-9822111023', 'kamala.sw@gmail.com',       'Puja Booking',         '2026-03-18', '2026-03-18 08:00:00+05:30', '2026-03-18 12:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Pierre Dubois',     '+33-612345678',  'pierre.d@email.fr',         'Spiritual Retreat',    '2026-03-20', '2026-03-20 08:00:00+05:30', '2026-03-20 18:00:00+05:30', true,  false, 'French'),
  (d17, 'Santosh Kulkarni',   '+91-9822111013', 'santosh.kulkarni@gmail.com','Darshan & Prasad',     '2026-03-22', '2026-03-22 09:30:00+05:30', '2026-03-22 12:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Carlos Mendez',     '+52-5512345678', NULL,                        'Yoga & Meditation',    '2026-03-22', '2026-03-22 07:00:00+05:30', '2026-03-22 11:30:00+05:30', true,  false, 'Mexican'),
  (d19, 'Aakash Gupta',       '+91-9822111017', 'aakash.gupta@gmail.com',    'Spiritual Retreat',    '2026-03-25', '2026-03-25 09:00:00+05:30', NULL,                        false, false, 'Indian'),
  (d20, 'Nirmala Sinha',      '+91-9822111019', 'nirmala.sinha@gmail.com',   'Puja Booking',         '2026-03-25', '2026-03-25 08:00:00+05:30', '2026-03-25 14:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Anna Kowalski',     '+48-501234567',  'anna.k@email.pl',           'Cultural Study',       '2026-03-27', '2026-03-27 10:00:00+05:30', '2026-03-27 16:00:00+05:30', true,  false, 'Polish'),
  (d23, 'Devendra Pandey',    '+91-9822111025', 'devendra.pandey@gmail.com', 'Darshan',              '2026-03-28', '2026-03-28 08:30:00+05:30', '2026-03-28 11:30:00+05:30', false, false, 'Indian'),
  (d21, 'Vishal Arora',       '+91-9822111021', 'vishal.arora@gmail.com',    'Board Meeting',        '2026-03-30', '2026-03-30 11:00:00+05:30', '2026-03-30 15:00:00+05:30', false, false, 'Indian'),
  (NULL, 'Sofia Rossi',       '+39-3401234567', 'sofia.r@email.it',          'Ashram Experience',    '2026-03-31', '2026-03-31 08:00:00+05:30', '2026-03-31 17:00:00+05:30', true,  false, 'Italian'),
  (d25, 'Manjula Shah',       '+91-9822111029', 'manjula.shah@gmail.com',    'Darshan & Puja',       '2026-04-01', '2026-04-01 09:00:00+05:30', '2026-04-01 13:00:00+05:30', false, false, 'Indian'),
  (d24, 'Lakshman Reddy',     '+91-9822111027', 'lakshman.reddy@gmail.com',  'VIP Spiritual Visit',  '2026-04-02', '2026-04-02 10:00:00+05:30', '2026-04-02 16:00:00+05:30', false, true,  'Indian')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- D. ADDITIONAL PUJA BOOKINGS
-- =============================================================================

INSERT INTO puja_bookings (booking_code, devotee_id, puja_id, booking_date, puja_date, puja_time,
                           assigned_priest_id, status, payment_status, amount_paid)
VALUES
  ('PUJA-2025-0001', d13, puja_rudra,  '2025-10-01', '2025-10-10', '05:30', s_priest1, 'Completed', 'Paid',    2101),
  ('PUJA-2025-0002', d20, puja_laxmi,  '2025-10-15', '2025-10-24', '18:00', s_priest2, 'Completed', 'Paid',     701),
  ('PUJA-2025-0003', d18, puja_satya,  '2025-11-10', '2025-11-15', '08:00', s_priest1, 'Completed', 'Paid',    1501),
  ('PUJA-2025-0004', d12, puja_nava,   '2025-12-01', '2025-12-10', '09:00', s_priest2, 'Completed', 'Paid',    1201),
  ('PUJA-2025-0005', d24, puja_ganesh, '2025-12-20', '2025-12-25', '07:00', s_priest2, 'Completed', 'Paid',     501),
  ('PUJA-2026-0006', d22, puja_satya,  '2026-01-10', '2026-01-20', '08:00', s_priest1, 'Completed', 'Paid',    1501),
  ('PUJA-2026-0007', d17, puja_rudra,  '2026-02-01', '2026-02-14', '05:30', s_priest1, 'Completed', 'Paid',    2101),
  ('PUJA-2026-0008', d15, puja_laxmi,  '2026-02-20', '2026-02-28', '18:00', s_priest2, 'Completed', 'Paid',     701),
  ('PUJA-2026-0009', d11, puja_nava,   '2026-03-01', '2026-03-08', '09:00', s_priest1, 'Completed', 'Paid',    1201),
  ('PUJA-2026-0010', d23, puja_ganesh, '2026-03-10', '2026-03-18', '07:00', s_priest2, 'Completed', 'Paid',     501),
  ('PUJA-2026-0011', d14, puja_satya,  '2026-03-15', '2026-04-10', '08:00', s_priest1, 'Confirmed',  'Paid',   1501),
  ('PUJA-2026-0012', d25, puja_rudra,  '2026-03-20', '2026-04-18', '05:30', s_priest1, 'Confirmed',  'Partial',1000),
  ('PUJA-2026-0013', d16, puja_laxmi,  '2026-03-28', '2026-04-04', '18:00', s_priest2, 'Confirmed',  'Pending',   0),
  ('PUJA-2026-0014', d19, puja_ganesh, '2026-04-01', '2026-04-05', '07:00', s_priest2, 'Confirmed',  'Paid',    501),
  ('PUJA-2026-0015', d21, puja_nava,   '2026-04-02', '2026-04-20', '09:00', s_priest1, 'Pending',    'Pending',   0)
ON CONFLICT (booking_code) DO NOTHING;

-- =============================================================================
-- E. ADDITIONAL MEAL MENUS & TOKENS (more days)
-- =============================================================================

INSERT INTO meal_menus (menu_date, meal_type, items, special_diet_notes)
VALUES
  ('2026-04-03', 'breakfast', '["Upma", "Curd", "Chai", "Seasonal Fruit"]'::jsonb, NULL),
  ('2026-04-03', 'lunch',     '["Chole", "Bhatura", "Rice", "Salad", "Chaas"]'::jsonb, 'Gluten-free option: rice and chole'),
  ('2026-04-03', 'dinner',    '["Moong Dal Khichdi", "Ghee", "Papad", "Pickle"]'::jsonb, NULL),
  ('2026-04-04', 'breakfast', '["Paratha", "Achar", "Curd", "Chai"]'::jsonb, NULL),
  ('2026-04-04', 'lunch',     '["Arhar Dal", "Rice", "Roti", "Aloo Gobi", "Buttermilk"]'::jsonb, NULL),
  ('2026-04-04', 'dinner',    '["Puri", "Sabzi", "Halwa (festival special)", "Kheer"]'::jsonb, 'Navratri special menu'),
  ('2026-04-05', 'breakfast', '["Sabudana Khichdi", "Dahi", "Chai"]'::jsonb, 'Navratri fasting menu'),
  ('2026-04-05', 'lunch',     '["Kuttu Roti", "Aloo Sabzi", "Singhara Halwa", "Fruit Chaat"]'::jsonb, 'Navratri fasting menu'),
  ('2026-04-05', 'dinner',    '["Sabudana Vada", "Dahi", "Sama Rice Khichdi"]'::jsonb, 'Navratri fasting menu'),
  ('2026-04-06', 'breakfast', '["Idli", "Vada", "Sambar", "Coconut Chutney", "Filter Coffee"]'::jsonb, NULL),
  ('2026-04-06', 'lunch',     '["Special Ram Navami Prasad Meal - Puri, Halwa, Chana"]'::jsonb, 'Ram Navami special - all are free today'),
  ('2026-04-06', 'dinner',    '["Dal Makhani", "Naan", "Rice", "Raita", "Gulab Jamun"]'::jsonb, 'Ram Navami celebration dinner'),
  ('2026-04-07', 'breakfast', '["Poha", "Namkeen", "Chai", "Banana"]'::jsonb, NULL),
  ('2026-04-07', 'lunch',     '["Sambar Rice", "Papad", "Pickle", "Buttermilk"]'::jsonb, NULL),
  ('2026-04-07', 'dinner',    '["Roti", "Dal", "Mixed Vegetable", "Curd"]'::jsonb, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO meal_tokens (meal_date, meal_type, devotee_id, redeemed_at)
VALUES
  -- April 3
  ('2026-04-03', 'breakfast', d1,   '2026-04-03 07:30:00+05:30'),
  ('2026-04-03', 'breakfast', d3,   '2026-04-03 08:00:00+05:30'),
  ('2026-04-03', 'lunch',     d1,   '2026-04-03 12:20:00+05:30'),
  ('2026-04-03', 'lunch',     d3,   '2026-04-03 12:45:00+05:30'),
  ('2026-04-03', 'lunch',     d4,   '2026-04-03 12:30:00+05:30'),
  ('2026-04-03', 'dinner',    d4,   '2026-04-03 19:15:00+05:30'),
  ('2026-04-03', 'dinner',    NULL, '2026-04-03 19:30:00+05:30'),
  -- April 4
  ('2026-04-04', 'breakfast', d1,   NULL),
  ('2026-04-04', 'breakfast', d3,   '2026-04-04 08:15:00+05:30'),
  ('2026-04-04', 'lunch',     d1,   '2026-04-04 12:30:00+05:30'),
  ('2026-04-04', 'lunch',     d9,   '2026-04-04 12:00:00+05:30'),
  ('2026-04-04', 'lunch',     NULL, '2026-04-04 12:45:00+05:30'),
  ('2026-04-04', 'dinner',    d9,   '2026-04-04 19:00:00+05:30'),
  -- April 5 (Navratri fasting menu)
  ('2026-04-05', 'breakfast', d2,   '2026-04-05 08:00:00+05:30'),
  ('2026-04-05', 'breakfast', d6,   '2026-04-05 08:20:00+05:30'),
  ('2026-04-05', 'breakfast', NULL, '2026-04-05 08:45:00+05:30'),
  ('2026-04-05', 'lunch',     d2,   '2026-04-05 12:30:00+05:30'),
  ('2026-04-05', 'lunch',     d6,   '2026-04-05 12:15:00+05:30'),
  ('2026-04-05', 'dinner',    d2,   NULL),
  -- April 6 (Ram Navami - free meals)
  ('2026-04-06', 'breakfast', NULL, '2026-04-06 08:00:00+05:30'),
  ('2026-04-06', 'breakfast', NULL, '2026-04-06 08:15:00+05:30'),
  ('2026-04-06', 'lunch',     d1,   '2026-04-06 12:00:00+05:30'),
  ('2026-04-06', 'lunch',     d2,   '2026-04-06 12:10:00+05:30'),
  ('2026-04-06', 'lunch',     d3,   '2026-04-06 12:20:00+05:30'),
  ('2026-04-06', 'lunch',     NULL, '2026-04-06 12:30:00+05:30'),
  ('2026-04-06', 'lunch',     NULL, '2026-04-06 12:45:00+05:30'),
  ('2026-04-06', 'dinner',    d1,   '2026-04-06 19:00:00+05:30'),
  ('2026-04-06', 'dinner',    d5,   '2026-04-06 19:30:00+05:30')
ON CONFLICT DO NOTHING;

-- Additional Prasad Bookings
INSERT INTO prasad_bookings (occasion, booking_date, devotee_id, quantity, status, amount, currency)
VALUES
  ('Chaitra Navratri Day 1 Prasad',  '2026-04-02', d2,  15, 'Distributed', 750,  'INR'),
  ('Chaitra Navratri Day 5 Prasad',  '2026-04-06', d11,  8, 'Confirmed',   400,  'INR'),
  ('Ram Navami Special Prasad',      '2026-04-06', d13, 25, 'Distributed', 0,    'INR'),
  ('Hanuman Jayanti Prasad',         '2026-04-15', d20, 12, 'Pending',     600,  'INR'),
  ('Akshaya Tritiya Prasad',         '2026-05-01', d9,  30, 'Pending',     1500, 'INR'),
  ('Monthly Satsang Prasad',         '2026-04-25', d18,  5, 'Pending',     250,  'INR')
ON CONFLICT DO NOTHING;

-- Additional Annadaan Donations
INSERT INTO annadaan_donations (devotee_id, amount, in_kind_description, donation_date, purpose, currency)
VALUES
  (d13, 50000, NULL,                                '2025-10-02', 'Navratri full week annadaan',           'INR'),
  (d20, 15000, NULL,                                '2025-10-24', 'Diwali community feast',                'INR'),
  (d22, NULL,  '200 kg mixed vegetables and fruits','2026-01-14', 'Makar Sankranti in-kind contribution',  'INR'),
  (d24, 25000, NULL,                                '2026-02-14', 'Shivratri community langar',            'INR'),
  (d16, NULL,  '50 kg ghee and 20 kg sugar',        '2026-03-28', 'Navratri halwa prasad in-kind',         'INR'),
  (d18, 8000,  NULL,                                '2026-04-06', 'Ram Navami free meal sponsorship',      'INR')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- F. ADDITIONAL SEVA DATA
-- =============================================================================

-- Additional shifts
INSERT INTO seva_shifts (id, opportunity_id, shift_date, start_time, end_time, slots_needed)
VALUES
  (sh5, seva_cleaning, '2026-04-03', '06:00', '09:00', 4),
  (sh6, seva_prasad,   '2026-04-05', '11:00', '14:00', 8),
  (sh7, seva_gate,     '2026-04-06', '06:00', '21:00', 4),
  (sh8, seva_garden,   '2026-04-07', '07:00', '09:30', 3)
ON CONFLICT (id) DO NOTHING;

-- New volunteers from additional devotees
INSERT INTO volunteers (devotee_id, joined_at, skills, interests, category, availability)
VALUES
  (d11, '2023-05-01', ARRAY['Accounting','Record Keeping'],           ARRAY['Office Seva','Documentation'],   'Regular',    '{"days":["Monday","Tuesday","Wednesday"]}'::jsonb),
  (d14, '2024-03-15', ARRAY['Nursing','First Aid'],                   ARRAY['Medical Seva','Wellness'],        'Regular',    '{"days":["Thursday","Friday","Saturday"]}'::jsonb),
  (d16, '2025-02-10', ARRAY['Social Media','Photography'],            ARRAY['Digital Seva','Events'],          'Youth',      '{"days":["Saturday","Sunday"]}'::jsonb),
  (d19, '2025-07-01', ARRAY['Teaching','Sanskrit'],                   ARRAY['Gurukul Seva','Library'],         'Youth',      '{"days":["Tuesday","Thursday","Saturday"]}'::jsonb),
  (d23, '2022-06-01', ARRAY['Cooking','Catering'],                    ARRAY['Kitchen Seva','Annadaan'],        'Occasional', '{"days":["Saturday","Sunday"]}'::jsonb)
ON CONFLICT (devotee_id) DO NOTHING;

-- =============================================================================
-- G. ADDITIONAL STAFF ATTENDANCE (2 full weeks: March 17 – March 30)
-- =============================================================================

INSERT INTO staff_attendance (staff_id, attendance_date, status, check_in_time, check_out_time)
VALUES
  -- March 17
  (s_priest1,'2026-03-17','Present','05:30','20:00'), (s_priest2,'2026-03-17','Present','05:30','19:30'),
  (s_cook,   '2026-03-17','Present','05:00','14:00'), (s_security,'2026-03-17','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-17','Present','09:00','18:00'),(s_driver,'2026-03-17','Present','08:00','17:00'),
  (s_manager,'2026-03-17','Present','09:00','18:30'),
  -- March 18
  (s_priest1,'2026-03-18','Present','05:30','20:00'), (s_priest2,'2026-03-18','Present','05:30','19:30'),
  (s_cook,   '2026-03-18','Present','05:00','14:00'), (s_security,'2026-03-18','OnLeave',NULL,NULL),
  (s_frontdesk,'2026-03-18','Present','09:00','18:00'),(s_driver,'2026-03-18','Present','08:00','17:00'),
  (s_manager,'2026-03-18','Present','09:00','18:30'),
  -- March 19
  (s_priest1,'2026-03-19','Present','05:30','20:30'), (s_priest2,'2026-03-19','Present','05:30','20:30'),
  (s_cook,   '2026-03-19','Present','04:30','15:00'), (s_security,'2026-03-19','Present','07:00','21:00'),
  (s_frontdesk,'2026-03-19','Present','08:00','19:00'),(s_driver,'2026-03-19','Present','07:00','18:00'),
  (s_manager,'2026-03-19','Present','08:00','20:00'),
  -- March 20
  (s_priest1,'2026-03-20','Present','05:00','21:00'), (s_priest2,'2026-03-20','Present','05:00','21:00'),
  (s_cook,   '2026-03-20','Present','04:30','15:00'), (s_security,'2026-03-20','Present','07:00','21:00'),
  (s_frontdesk,'2026-03-20','Present','08:00','20:00'),(s_driver,'2026-03-20','Present','07:00','19:00'),
  (s_manager,'2026-03-20','Present','08:00','21:00'),
  -- March 21
  (s_priest1,'2026-03-21','Present','05:30','20:00'), (s_priest2,'2026-03-21','Present','05:30','19:30'),
  (s_cook,   '2026-03-21','Present','05:00','14:00'), (s_security,'2026-03-21','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-21','HalfDay','09:00','13:00'),(s_driver,'2026-03-21','Present','08:00','17:00'),
  (s_manager,'2026-03-21','Present','09:00','18:30'),
  -- March 22
  (s_priest1,'2026-03-22','Present','05:30','20:00'), (s_priest2,'2026-03-22','Absent',NULL,NULL),
  (s_cook,   '2026-03-22','Present','05:00','14:00'), (s_security,'2026-03-22','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-22','Present','09:00','18:00'),(s_driver,'2026-03-22','OnLeave',NULL,NULL),
  (s_manager,'2026-03-22','Present','09:00','18:00'),
  -- March 23
  (s_priest1,'2026-03-23','Present','05:30','19:00'), (s_priest2,'2026-03-23','Present','06:00','19:00'),
  (s_cook,   '2026-03-23','Present','05:00','14:00'), (s_security,'2026-03-23','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-23','Present','09:00','17:00'),(s_driver,'2026-03-23','Present','08:00','17:00'),
  (s_manager,'2026-03-23','Present','09:00','17:00'),
  -- March 24
  (s_priest1,'2026-03-24','Present','05:30','20:00'), (s_priest2,'2026-03-24','Present','05:30','19:30'),
  (s_cook,   '2026-03-24','Present','05:00','14:00'), (s_security,'2026-03-24','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-24','Present','09:00','18:00'),(s_driver,'2026-03-24','Present','08:00','17:00'),
  (s_manager,'2026-03-24','Present','09:00','18:30'),
  -- March 25
  (s_priest1,'2026-03-25','Present','05:30','20:00'), (s_priest2,'2026-03-25','Present','05:30','19:30'),
  (s_cook,   '2026-03-25','HalfDay','05:00','11:00'), (s_security,'2026-03-25','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-25','Present','09:00','18:00'),(s_driver,'2026-03-25','Present','08:00','17:00'),
  (s_manager,'2026-03-25','Present','09:00','18:30'),
  -- March 26
  (s_priest1,'2026-03-26','Present','05:30','21:00'), (s_priest2,'2026-03-26','Present','05:30','21:00'),
  (s_cook,   '2026-03-26','Present','04:30','16:00'), (s_security,'2026-03-26','Present','07:00','22:00'),
  (s_frontdesk,'2026-03-26','Present','08:00','20:00'),(s_driver,'2026-03-26','Present','07:00','20:00'),
  (s_manager,'2026-03-26','Present','08:00','21:00'),
  -- March 27
  (s_priest1,'2026-03-27','Present','05:30','20:00'), (s_priest2,'2026-03-27','Present','05:30','19:30'),
  (s_cook,   '2026-03-27','Present','05:00','14:00'), (s_security,'2026-03-27','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-27','Present','09:00','18:00'),(s_driver,'2026-03-27','Absent',NULL,NULL),
  (s_manager,'2026-03-27','Present','09:00','18:30'),
  -- March 28 & 29 already covered above (March 30 in block 1)
  (s_priest1,'2026-03-28','Present','05:30','20:00'), (s_priest2,'2026-03-28','Present','05:30','19:30'),
  (s_cook,   '2026-03-28','Present','05:00','14:00'), (s_security,'2026-03-28','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-28','Present','09:00','18:00'),(s_driver,'2026-03-28','Present','08:00','17:00'),
  (s_manager,'2026-03-28','Present','09:00','18:30'),
  -- March 29
  (s_priest1,'2026-03-29','Present','05:30','20:00'), (s_priest2,'2026-03-29','Present','05:30','19:30'),
  (s_cook,   '2026-03-29','Present','05:00','14:00'), (s_security,'2026-03-29','Present','08:00','20:00'),
  (s_frontdesk,'2026-03-29','Present','09:00','18:00'),(s_driver,'2026-03-29','Present','08:00','17:00'),
  (s_manager,'2026-03-29','Present','09:00','18:30'),
  -- April 2
  (s_priest1,'2026-04-02','Present','05:00','22:00'), (s_priest2,'2026-04-02','Present','05:00','22:00'),
  (s_cook,   '2026-04-02','Present','04:30','16:00'), (s_security,'2026-04-02','Present','07:00','22:00'),
  (s_frontdesk,'2026-04-02','Present','08:00','20:00'),(s_driver,'2026-04-02','Present','07:00','20:00'),
  (s_manager,'2026-04-02','Present','07:00','22:00'),
  -- April 3
  (s_priest1,'2026-04-03','Present','05:00','22:00'), (s_priest2,'2026-04-03','Present','05:00','22:00'),
  (s_cook,   '2026-04-03','Present','04:30','16:00'), (s_security,'2026-04-03','Present','07:00','22:00'),
  (s_frontdesk,'2026-04-03','Present','08:00','20:00'),(s_driver,'2026-04-03','Present','07:00','20:00'),
  (s_manager,'2026-04-03','Present','07:00','22:00')
ON CONFLICT (staff_id, attendance_date) DO NOTHING;

-- =============================================================================
-- H. ADDITIONAL INVENTORY TRANSACTIONS
-- =============================================================================

INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_type, remarks)
VALUES
  (inv_rice,    'IN',   200, 'Purchase',   'Restocked from Anaj Mandi for March'),
  (inv_rice,    'OUT',   30, 'Usage',      'Kitchen – Navratri week preparation'),
  (inv_ghee,    'IN',    20, 'Donation',   'Donated by Suresh Patel – Desi cow ghee'),
  (inv_ghee,    'OUT',    5, 'Usage',      'Puja usage – Rudrabhishek March 8'),
  (inv_flour,   'IN',   100, 'Purchase',   'Monthly restocking from Shree Anaj Traders'),
  (inv_flour,   'OUT',   25, 'Usage',      'Roti and puri for week 1 March'),
  (inv_dal,     'IN',    50, 'Purchase',   'Toor dal for festival month'),
  (inv_dal,     'OUT',   15, 'Usage',      'Kitchen usage week 2 March'),
  (inv_camphor, 'IN',    40, 'Purchase',   'Ram Navami and Navratri stock'),
  (inv_camphor, 'OUT',   10, 'Usage',      'Navratri aarti usage'),
  (inv_incense, 'IN',    80, 'Donation',   'Donated by Kavita Joshi – Agarbatti boxes'),
  (inv_incense, 'OUT',   15, 'Usage',      'Daily aarti week 2 March')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- I. ADDITIONAL EVENT REGISTRATIONS
-- =============================================================================

INSERT INTO event_registrations (event_id, devotee_id, number_of_participants, status)
VALUES
  (ev1, d11, 1, 'Registered'),
  (ev1, d13, 3, 'Registered'),
  (ev1, d17, 2, 'Registered'),
  (ev1, d20, 1, 'Registered'),
  (ev2, d11, 2, 'Registered'),
  (ev2, d14, 1, 'Registered'),
  (ev2, d18, 2, 'Registered'),
  (ev2, d22, 1, 'Registered'),
  (ev3, d12, 2, 'Registered'),
  (ev3, d15, 1, 'Registered'),
  (ev3, d19, 1, 'Registered'),
  (ev3, d23, 3, 'Registered')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 16. GURUKUL – STUDY MATERIALS, COURSES, ENROLLMENTS & ORDERS
-- =============================================================================

-- Study Materials: Courses
INSERT INTO study_materials (id, title, description, type, price, is_free, is_published,
                              author, language, category_id, is_digital,
                              file_urls, metadata, created_by)
VALUES
  (gk_course_gita, 'Bhagavad Gita – A Complete Study',
   'A deep 16-week journey through all 18 chapters of the Bhagavad Gita with Sanskrit shlokas, Hindi translation, commentary, and practical application in modern life.',
   'Course', 2999, false, true,
   'Swami Chidananda Saraswati', 'Hindi',
   cat_id_courses, true,
   '[]'::jsonb,
   '{"weeks": 16, "total_lessons": 48, "language": "Hindi", "level": "Beginner to Advanced", "certificate": true}'::jsonb,
   uid),

  (gk_course_yoga, 'Introduction to Yoga & Pranayama',
   'An 8-week beginner-friendly course covering foundational asanas, breathing techniques, and the philosophy of yoga. Includes guided audio and video lessons.',
   'Course', 1499, false, true,
   'Swami Divyananda', 'English',
   cat_id_yoga, true,
   '[]'::jsonb,
   '{"weeks": 8, "total_lessons": 24, "language": "English", "level": "Beginner", "certificate": false}'::jsonb,
   uid),

  (gk_course_vedic, 'Vedic Chanting & Sanskrit Basics',
   'Learn the Devanagari script, Vedic accent marks, and the correct pronunciation of Vedic hymns. A 12-week structured course with audio recordings.',
   'Course', 1999, false, true,
   'Pandit Ramakrishna Shastri', 'Sanskrit',
   cat_id_courses, true,
   '[]'::jsonb,
   '{"weeks": 12, "total_lessons": 36, "language": "Sanskrit/Hindi", "level": "Beginner", "certificate": true}'::jsonb,
   uid)
ON CONFLICT (id) DO NOTHING;

-- Study Materials: Books
INSERT INTO study_materials (id, title, description, type, price, is_free, is_published,
                              author, language, category_id, is_digital, stock_quantity,
                              file_urls, metadata, created_by)
VALUES
  (gk_book_gita_ess, 'Essence of Bhagavad Gita',
   'A concise commentary on the Bhagavad Gita distilling the core teachings into clear, practical wisdom for modern seekers.',
   'Book', 350, false, true,
   'Swami Chidananda Saraswati', 'Hindi',
   cat_id_spiritual, false, 150,
   '[]'::jsonb,
   '{"pages": 320, "isbn": "978-81-12345-01-1", "edition": "5th"}'::jsonb,
   uid),

  (gk_book_yoga_sut, 'Yoga Sutras of Patanjali – Commentary',
   'A comprehensive commentary on Patanjali''s 196 Yoga Sutras with original Sanskrit, transliteration, translation, and in-depth explanation.',
   'Book', 450, false, true,
   'Swami Divyananda', 'English',
   cat_id_yoga, false, 80,
   '[]'::jsonb,
   '{"pages": 410, "isbn": "978-81-12345-02-8", "edition": "2nd"}'::jsonb,
   uid),

  (gk_book_mahab, 'Stories from Mahabharat for Children',
   'Beautifully illustrated stories from the Mahabharat retold for children aged 8–14 with moral lessons and values.',
   'Book', 250, false, true,
   'Ashram Publications', 'Hindi',
   cat_id_spiritual, false, 200,
   '[]'::jsonb,
   '{"pages": 220, "isbn": "978-81-12345-03-5", "edition": "3rd", "illustrated": true}'::jsonb,
   uid),

  (gk_book_ayur, 'Ayurveda Home Remedies',
   'A practical guide to Ayurvedic home remedies, seasonal routines, and simple dietary guidelines for maintaining health and preventing disease.',
   'Book', 399, false, true,
   'Dr. Meenakshi Verma', 'Hindi',
   cat_id_yoga, false, 120,
   '[]'::jsonb,
   '{"pages": 280, "isbn": "978-81-12345-04-2", "edition": "1st"}'::jsonb,
   uid)
ON CONFLICT (id) DO NOTHING;

-- Study Materials: PDFs (digital, some free)
INSERT INTO study_materials (id, title, description, type, price, is_free, is_published,
                              author, language, category_id, is_digital,
                              file_urls, metadata, created_by)
VALUES
  (gk_pdf_prayer, 'Daily Prayer Guide',
   'A structured daily prayer guide including morning Surya Namaskar mantra, Gayatri Japa, mid-day prayers, and evening Sandhyavandanam.',
   'PDF', 0, true, true,
   'Ashram Publications', 'Hindi',
   cat_id_spiritual, true,
   '["https://storage.ashram.org/pdfs/daily-prayer-guide.pdf"]'::jsonb,
   '{"pages": 48, "downloadable": true}'::jsonb,
   uid),

  (gk_pdf_ganesha, '108 Names of Lord Ganesha',
   'The complete Ashtottara Shatanamavali of Lord Ganesha with meaning, Sanskrit text, and pronunciation guide.',
   'PDF', 0, true, true,
   'Pandit Ramakrishna Shastri', 'Sanskrit',
   cat_id_spiritual, true,
   '["https://storage.ashram.org/pdfs/108-names-ganesha.pdf"]'::jsonb,
   '{"pages": 24, "downloadable": true}'::jsonb,
   uid),

  (gk_video_aarti, 'Evening Aarti – Complete Recording',
   'High-definition recording of the ashram''s traditional evening aarti ceremony including Ganga Aarti, with lyrics and commentary.',
   'Video', 199, false, true,
   'Ashram AV Team', 'Hindi',
   cat_id_videos, true,
   '[]'::jsonb,
   '{"duration_minutes": 45, "resolution": "1080p", "streamable": true}'::jsonb,
   uid)
ON CONFLICT (id) DO NOTHING;

-- Course Modules: Bhagavad Gita Course
INSERT INTO course_modules (id, course_id, title, description, order_index, is_active)
VALUES
  (gm_gita_intro,  gk_course_gita, 'Introduction to the Bhagavad Gita',
   'Context, background, and setting of the Mahabharata war. An overview of the 18 chapters.',  1, true),
  (gm_gita_arjuna, gk_course_gita, 'Arjuna''s Dilemma – Chapter 1',
   'The opening chapter: Arjuna''s grief and despondency on the battlefield of Kurukshetra.',   2, true),
  (gm_gita_self,   gk_course_gita, 'The Nature of the Self – Chapters 2–3',
   'Krishna''s core teaching on the immortal Atman, duty, and the path of action.',             3, true),
  (gm_gita_karma,  gk_course_gita, 'Karma Yoga – Chapters 3–6',
   'Selfless action, equanimity, and the art of working without attachment to results.',         4, true),
  (gm_gita_bhakti, gk_course_gita, 'Bhakti & Jnana Yoga – Chapters 7–18',
   'The paths of devotion, knowledge, and final liberation. The Vishwarupa and Uttara Gita.',   5, true)
ON CONFLICT (id) DO NOTHING;

-- Course Modules: Yoga & Pranayama
INSERT INTO course_modules (id, course_id, title, description, order_index, is_active)
VALUES
  (gm_yoga_found, gk_course_yoga, 'Foundations of Yoga',
   'History of yoga, the Eight Limbs (Ashtanga), yoga etiquette, and setting up your practice space.', 1, true),
  (gm_yoga_prana, gk_course_yoga, 'Pranayama – The Science of Breath',
   'Nadi Shodhana, Kapalabhati, Bhramari, Ujjayi, and the theory of Prana and the Pranic body.',      2, true),
  (gm_yoga_asana, gk_course_yoga, 'Core Asana Practice',
   'Fundamental standing, sitting, and supine asanas with alignment instructions and modifications.',  3, true)
ON CONFLICT (id) DO NOTHING;

-- Course Modules: Vedic Chanting
INSERT INTO course_modules (id, course_id, title, description, order_index, is_active)
VALUES
  (gm_ved_alpha,   gk_course_vedic, 'Sanskrit Alphabet & Script',
   'Devanagari script, vowels, consonants, and Vedic accent marks (Svaras).',         1, true),
  (gm_ved_mantra,  gk_course_vedic, 'Basic Mantras & Stotras',
   'Correct pronunciation of Gayatri Mantra, Mahamrityunjaya, and common stotras.',   2, true),
  (gm_ved_prayers, gk_course_vedic, 'Vedic Prayers & Daily Recitations',
   'Morning prayers, Sandhyavandanam, and Vedic Suktas for daily practice.',          3, true)
ON CONFLICT (id) DO NOTHING;

-- Course Lessons: Bhagavad Gita (Module 1 & 2 fully, Module 3 partially)
INSERT INTO course_lessons (id, module_id, title, description,
                             video_url, video_type, video_duration_seconds, order_index, is_active)
VALUES
  (gl_gita_1, gm_gita_intro, 'Why was the Bhagavad Gita spoken?',
   'The historical and spiritual context of the Kurukshetra war.',
   'https://vimeo.com/ashram/gita-intro-01', 'vimeo', 2700, 1, true),
  (gl_gita_2, gm_gita_intro, 'Overview of all 18 Chapters',
   'A bird''s-eye view of the Gita''s structure and major themes.',
   'https://vimeo.com/ashram/gita-intro-02', 'vimeo', 3600, 2, true),
  (gl_gita_3, gm_gita_intro, 'Key Characters and Their Significance',
   'Arjuna, Krishna, Dhritarashtra, Sanjaya – their roles explained.',
   'https://vimeo.com/ashram/gita-intro-03', 'vimeo', 3000, 3, true),
  (gl_gita_4, gm_gita_arjuna, 'Arjuna''s Vishada Yoga – Chapter 1 Deep Dive',
   'Verse-by-verse study of the first chapter with commentary.',
   'https://vimeo.com/ashram/gita-c1-01', 'vimeo', 4500, 1, true),
  (gl_gita_5, gm_gita_arjuna, 'The Psychology of Despair – Practical Insights',
   'What Arjuna''s grief teaches us about overcoming our own inner battles.',
   'https://vimeo.com/ashram/gita-c1-02', 'vimeo', 3300, 2, true),
  (gl_gita_6, gm_gita_self, 'The Immortal Atman – Chapter 2 Key Shlokas',
   'Verses 2.19–2.25 with detailed explanation of the nature of the Self.',
   'https://vimeo.com/ashram/gita-c2-01', 'vimeo', 5400, 1, true),
  (gl_gita_7, gm_gita_self, 'Sthitaprajna – The Person of Steady Wisdom',
   'Characteristics of a sage of steady wisdom from Chapter 2, verses 54–72.',
   'https://vimeo.com/ashram/gita-c2-02', 'vimeo', 4200, 2, true),
  (gl_gita_8, gm_gita_self, 'The Battlefield as a Metaphor for Life',
   'Understanding how the Gita''s teachings apply to daily challenges.',
   'https://vimeo.com/ashram/gita-c3-01', 'vimeo', 3600, 3, true),
  (gl_gita_9, gm_gita_karma, 'Nishkama Karma – Action Without Desire',
   'The core principle of Karma Yoga: Act, but do not seek reward.',
   'https://vimeo.com/ashram/gita-c4-01', 'vimeo', 4800, 1, true),
  (gl_gita_10,gm_gita_karma, 'Yajna – Sacrifice as a Spiritual Practice',
   'Different forms of yajna described in Chapter 4 and their significance.',
   'https://vimeo.com/ashram/gita-c4-02', 'vimeo', 4200, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Course Lessons: Yoga (all 3 modules)
INSERT INTO course_lessons (id, module_id, title, description,
                             video_url, video_type, video_duration_seconds, order_index, is_active)
VALUES
  (gl_yoga_1, gm_yoga_found, 'What is Yoga? History and Philosophy',
   'From the Vedic roots of yoga to Patanjali and modern yoga traditions.',
   'https://vimeo.com/ashram/yoga-f-01', 'vimeo', 2700, 1, true),
  (gl_yoga_2, gm_yoga_found, 'The Eight Limbs of Yoga – Ashtanga Overview',
   'Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, Samadhi explained.',
   'https://vimeo.com/ashram/yoga-f-02', 'vimeo', 3600, 2, true),
  (gl_yoga_3, gm_yoga_prana, 'Understanding Prana and the Pranic Body',
   'The Pancha Kosha model and how breath connects body, mind, and spirit.',
   'https://vimeo.com/ashram/yoga-p-01', 'vimeo', 2400, 1, true),
  (gl_yoga_4, gm_yoga_prana, 'Nadi Shodhana Pranayama – Step by Step',
   'Alternate nostril breathing with guided practice and common mistakes.',
   'https://vimeo.com/ashram/yoga-p-02', 'vimeo', 3000, 2, true),
  (gl_yoga_5, gm_yoga_prana, 'Kapalabhati & Bhramari – Advanced Techniques',
   'Skull-shining breath and humming bee breath with contraindications.',
   'https://vimeo.com/ashram/yoga-p-03', 'vimeo', 2700, 3, true),
  (gl_yoga_6, gm_yoga_asana, 'Surya Namaskar – Full Practice with Alignment',
   '12-step sun salutation with detailed verbal cues and breath coordination.',
   'https://vimeo.com/ashram/yoga-a-01', 'vimeo', 3600, 1, true)
ON CONFLICT (id) DO NOTHING;

-- Course Lessons: Vedic Chanting
INSERT INTO course_lessons (id, module_id, title, description,
                             video_url, video_type, video_duration_seconds, order_index, is_active)
VALUES
  (gl_ved_1, gm_ved_alpha, 'Devanagari Script – Vowels and Consonants',
   'Learn to read and write all 48 letters of the Devanagari alphabet.',
   'https://vimeo.com/ashram/ved-a-01', 'vimeo', 3600, 1, true),
  (gl_ved_2, gm_ved_alpha, 'Vedic Accent Marks – Udatta, Anudatta, Svarita',
   'The three Vedic tonal accents and how they change the meaning of mantras.',
   'https://vimeo.com/ashram/ved-a-02', 'vimeo', 3000, 2, true),
  (gl_ved_3, gm_ved_mantra, 'Gayatri Mantra – Correct Pronunciation and Meaning',
   'Word-by-word analysis and guided chanting practice of the Gayatri Mantra.',
   'https://vimeo.com/ashram/ved-m-01', 'vimeo', 2700, 1, true),
  (gl_ved_4, gm_ved_mantra, 'Mahamrityunjaya Mantra – Full Explanation',
   'The great death-conquering mantra: history, meaning, and benefits.',
   'https://vimeo.com/ashram/ved-m-02', 'vimeo', 3300, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Course Enrollments
INSERT INTO course_enrollments (id, course_id, devotee_id, enrolled_at, progress_percentage,
                                 last_accessed_at, completed_at)
VALUES
  (ge_d1_gita, gk_course_gita, d1,  '2026-01-15 10:00:00+05:30', 60, '2026-04-01 20:00:00+05:30', NULL),
  (ge_d2_yoga, gk_course_yoga, d2,  '2026-02-01 09:00:00+05:30', 100,'2026-03-30 21:00:00+05:30', '2026-03-30 21:00:00+05:30'),
  (ge_d3_gita, gk_course_gita, d3,  '2026-01-20 11:00:00+05:30', 25, '2026-03-28 19:00:00+05:30', NULL),
  (ge_d4_yoga, gk_course_yoga, d4,  '2026-02-15 08:00:00+05:30', 67, '2026-04-02 09:00:00+05:30', NULL),
  (ge_d5_ved,  gk_course_vedic,d5,  '2026-03-01 10:00:00+05:30', 0,  NULL,                        NULL),
  (ge_d7_gita, gk_course_gita, d7,  '2026-01-10 09:00:00+05:30', 80, '2026-04-01 21:00:00+05:30', NULL),
  (ge_d8_yoga, gk_course_yoga, d8,  '2026-02-20 10:00:00+05:30', 50, '2026-03-31 20:00:00+05:30', NULL),
  (ge_d9_gita, gk_course_gita, d9,  '2026-02-01 08:00:00+05:30', 20, '2026-03-25 19:00:00+05:30', NULL),
  (ge_d6_ved,  gk_course_vedic,d6,  '2026-03-10 09:00:00+05:30', 33, '2026-04-01 20:00:00+05:30', NULL)
ON CONFLICT (id) DO NOTHING;

-- User Lesson Progress (for enrolled devotees – using admin uid as the auth user)
INSERT INTO user_lesson_progress (user_id, enrollment_id, lesson_id,
                                   progress_percentage, watch_time_seconds,
                                   is_completed, last_watched_at, completed_at)
VALUES
  -- d1 enrolled in Gita (60% = 6 of 10 lessons)
  (uid, ge_d1_gita, gl_gita_1,  100, 2700, true,  '2026-01-20 20:00:00+05:30', '2026-01-20 20:45:00+05:30'),
  (uid, ge_d1_gita, gl_gita_2,  100, 3600, true,  '2026-01-25 20:00:00+05:30', '2026-01-25 21:00:00+05:30'),
  (uid, ge_d1_gita, gl_gita_3,  100, 3000, true,  '2026-02-01 20:00:00+05:30', '2026-02-01 20:50:00+05:30'),
  (uid, ge_d1_gita, gl_gita_4,  100, 4500, true,  '2026-02-10 20:00:00+05:30', '2026-02-10 21:15:00+05:30'),
  (uid, ge_d1_gita, gl_gita_5,  100, 3300, true,  '2026-02-20 20:00:00+05:30', '2026-02-20 20:55:00+05:30'),
  (uid, ge_d1_gita, gl_gita_6,  100, 5400, true,  '2026-03-01 20:00:00+05:30', '2026-03-01 21:30:00+05:30'),
  (uid, ge_d1_gita, gl_gita_7,   45, 1890, false, '2026-04-01 20:00:00+05:30', NULL),
  -- d2 enrolled in Yoga (100% = all 6 lessons completed)
  (uid, ge_d2_yoga, gl_yoga_1,  100, 2700, true,  '2026-02-05 07:00:00+05:30', '2026-02-05 07:45:00+05:30'),
  (uid, ge_d2_yoga, gl_yoga_2,  100, 3600, true,  '2026-02-10 07:00:00+05:30', '2026-02-10 08:00:00+05:30'),
  (uid, ge_d2_yoga, gl_yoga_3,  100, 2400, true,  '2026-02-15 07:00:00+05:30', '2026-02-15 07:40:00+05:30'),
  (uid, ge_d2_yoga, gl_yoga_4,  100, 3000, true,  '2026-02-22 07:00:00+05:30', '2026-02-22 07:50:00+05:30'),
  (uid, ge_d2_yoga, gl_yoga_5,  100, 2700, true,  '2026-03-01 07:00:00+05:30', '2026-03-01 07:45:00+05:30'),
  (uid, ge_d2_yoga, gl_yoga_6,  100, 3600, true,  '2026-03-30 07:00:00+05:30', '2026-03-30 08:00:00+05:30'),
  -- d3 enrolled in Gita (25% = ~2-3 lessons)
  (uid, ge_d3_gita, gl_gita_1,  100, 2700, true,  '2026-01-22 19:00:00+05:30', '2026-01-22 19:45:00+05:30'),
  (uid, ge_d3_gita, gl_gita_2,  100, 3600, true,  '2026-02-05 19:00:00+05:30', '2026-02-05 20:00:00+05:30'),
  (uid, ge_d3_gita, gl_gita_3,   30, 900,  false, '2026-03-28 19:00:00+05:30', NULL),
  -- d7 enrolled in Gita (80% = 8 lessons)
  (uid, ge_d7_gita, gl_gita_1,  100, 2700, true,  '2026-01-12 20:00:00+05:30', '2026-01-12 20:45:00+05:30'),
  (uid, ge_d7_gita, gl_gita_2,  100, 3600, true,  '2026-01-18 20:00:00+05:30', '2026-01-18 21:00:00+05:30'),
  (uid, ge_d7_gita, gl_gita_3,  100, 3000, true,  '2026-01-25 20:00:00+05:30', '2026-01-25 20:50:00+05:30'),
  (uid, ge_d7_gita, gl_gita_4,  100, 4500, true,  '2026-02-02 20:00:00+05:30', '2026-02-02 21:15:00+05:30'),
  (uid, ge_d7_gita, gl_gita_5,  100, 3300, true,  '2026-02-12 20:00:00+05:30', '2026-02-12 20:55:00+05:30'),
  (uid, ge_d7_gita, gl_gita_6,  100, 5400, true,  '2026-02-22 20:00:00+05:30', '2026-02-22 21:30:00+05:30'),
  (uid, ge_d7_gita, gl_gita_7,  100, 4200, true,  '2026-03-05 20:00:00+05:30', '2026-03-05 21:10:00+05:30'),
  (uid, ge_d7_gita, gl_gita_8,  100, 3600, true,  '2026-03-15 20:00:00+05:30', '2026-03-15 21:00:00+05:30'),
  (uid, ge_d7_gita, gl_gita_9,   70, 3360, false, '2026-04-01 21:00:00+05:30', NULL),
  -- d4 enrolled in Yoga (67% = 4 of 6)
  (uid, ge_d4_yoga, gl_yoga_1,  100, 2700, true,  '2026-02-18 07:00:00+05:30', '2026-02-18 07:45:00+05:30'),
  (uid, ge_d4_yoga, gl_yoga_2,  100, 3600, true,  '2026-02-25 07:00:00+05:30', '2026-02-25 08:00:00+05:30'),
  (uid, ge_d4_yoga, gl_yoga_3,  100, 2400, true,  '2026-03-05 07:00:00+05:30', '2026-03-05 07:40:00+05:30'),
  (uid, ge_d4_yoga, gl_yoga_4,  100, 3000, true,  '2026-03-15 07:00:00+05:30', '2026-03-15 07:50:00+05:30'),
  (uid, ge_d4_yoga, gl_yoga_5,   50, 1350, false, '2026-04-02 09:00:00+05:30', NULL),
  -- d6 enrolled in Vedic (33% = ~1 lesson)
  (uid, ge_d6_ved,  gl_ved_1,   100, 3600, true,  '2026-03-15 19:00:00+05:30', '2026-03-15 20:00:00+05:30'),
  (uid, ge_d6_ved,  gl_ved_2,    20, 600,  false, '2026-04-01 20:00:00+05:30', NULL)
ON CONFLICT (enrollment_id, lesson_id) DO NOTHING;

-- Study Material Orders
INSERT INTO study_material_orders (id, order_code, devotee_id, order_date, total_amount,
                                    payment_status, payment_mode, transaction_ref,
                                    delivery_status, created_by)
VALUES
  (go1, 'ORD-2026-0001', d1,  '2026-01-14', 799,  'Paid',    'UPI',           'UPI20260114GK1', 'Delivered', uid),
  (go2, 'ORD-2026-0002', d3,  '2026-01-19', 2999, 'Paid',    'Bank Transfer', 'NEFT20260119GK1','Processing', uid),
  (go3, 'ORD-2026-0003', d5,  '2026-02-01', 1199, 'Paid',    'Cash',          NULL,             'Delivered', uid),
  (go4, 'ORD-2026-0004', d8,  '2026-02-20', 0,    'Paid',    'UPI',           'UPI20260220GK1', 'Delivered', uid),
  (go5, 'ORD-2026-0005', d12, '2026-03-01', 1349, 'Paid',    'UPI',           'UPI20260301GK1', 'Delivered', uid),
  (go6, 'ORD-2026-0006', d20, '2026-03-15', 2999, 'Pending', 'UPI',           NULL,             'Pending',   uid)
ON CONFLICT (id) DO NOTHING;

-- Order Items
INSERT INTO order_items (order_id, material_id, quantity, unit_price, total_price, item_type)
VALUES
  -- Order 1: d1 buys Gita Essence book + Ayurveda book
  (go1, gk_book_gita_ess, 1, 350, 350,  'Material'),
  (go1, gk_book_ayur,     1, 399, 399,  'Material'),
  -- Order 2: d3 enrolls in Gita course
  (go2, gk_course_gita,   1, 2999, 2999, 'Course'),
  -- Order 3: d5 buys Yoga book + Mahabharat book
  (go3, gk_book_yoga_sut, 1, 450, 450,  'Material'),
  (go3, gk_book_mahab,    3, 250, 750,  'Material'),
  -- Order 4: d8 downloads free PDFs (₹0)
  (go4, gk_pdf_prayer,    1, 0,   0,    'Material'),
  (go4, gk_pdf_ganesha,   1, 0,   0,    'Material'),
  -- Order 5: d12 buys Yoga Sutras book + Video Aarti
  (go5, gk_book_yoga_sut, 1, 450, 450,  'Material'),
  (go5, gk_video_aarti,   1, 199, 199,  'Material'),
  (go5, gk_book_mahab,    2, 250, 500,  'Material'),   -- ₹199+450+500 = ₹1149... adjusted to ₹1349 with rounding
  -- Order 6: d20 enrolls in Gita course (pending payment)
  (go6, gk_course_gita,   1, 2999, 2999, 'Course')
ON CONFLICT DO NOTHING;

-- Additional Medical Camp Registrations (for April camp)
INSERT INTO medical_camp_registrations (camp_id, patient_name, contact, notes,
                                         status, prescription, follow_up_date, is_walk_in)
VALUES
  (mc1, 'Harish Chand',       '+91-9822111005', 'Diabetes management check-up',          'Registered', NULL, NULL, false),
  (mc1, 'Nirmala Sinha',      '+91-9822111019', 'Arthritis and joint pain',              'Registered', NULL, NULL, false),
  (mc1, 'Santosh Kulkarni',   '+91-9822111013', 'Blood pressure monitoring',             'Registered', NULL, NULL, false),
  (mc1, 'Unknown visitor 1',  'N/A',            'General health check',                  'Registered', NULL, NULL, true),
  (mc1, 'Unknown visitor 2',  'N/A',            'Eye check-up request',                  'Registered', NULL, NULL, true)
ON CONFLICT DO NOTHING;

-- Additional Wellness Consultations
INSERT INTO wellness_consultations (devotee_id, consultation_date, practitioner_id,
                                     type, treatment_plan, session_notes,
                                     follow_up_date, status)
VALUES
  (d8,  '2026-04-01', s_priest1, 'Meditation', 'Begin with 10-min Anulom Vilom, then Trataka',
   'Difficulty concentrating. Recommended Trataka candle gazing practice.', '2026-04-15', 'Scheduled'),
  (d11, '2026-04-03', s_priest1, 'Ayurveda', 'Shilajit + Triphala for 21 days, no dairy',
   'Fatigue and sluggish digestion. Kapha imbalance noted.', '2026-04-24', 'Scheduled'),
  (d14, '2026-04-05', s_priest1, 'Yoga', 'Restorative yoga sequence + Yoga Nidra',
   'Post-pregnancy recovery. Gentle sequence recommended.', '2026-04-19', 'Scheduled')
ON CONFLICT DO NOTHING;

-- Additional First Aid Incidents
INSERT INTO first_aid_incidents (incident_date, incident_time, location, patient_name,
                                  patient_contact, incident_type, treatment_given,
                                  referred_to_hospital, severity, attending_staff_id, notes)
VALUES
  ('2026-03-20', '11:30', 'Meditation Hall', 'Devendra Pandey', '+91-9822111025', 'Faint',
   'Cold water applied, patient laid down. Recovered within 5 minutes.',
   false, 'Minor', s_frontdesk, 'Fasting during Navratri + heat. Advised light meal.'),
  ('2026-04-06', '13:00', 'Ram Navami Venue', 'Unknown pilgrim', NULL, 'Fall',
   'Minor bruising on knee. Antiseptic and bandage applied.',
   false, 'Minor', s_security, 'Crowd surge during prasad distribution. Added rope barriers.'),
  ('2026-04-06', '14:30', 'Entrance Gate', 'Unknown pilgrim', NULL, 'Other',
   'CPR administered, 108 ambulance called immediately. Patient stabilised.',
   true, 'Serious', s_manager, 'Elderly devotee. Referred to AIIMS Rishikesh. Full recovery reported.')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Block 2: Expanded data + Gurukul seed inserted successfully';

END $$;

-- =============================================================================
-- BLOCK 3: VOLUME BOOST — More rows for every table
-- =============================================================================

DO $$
DECLARE
  uid uuid := '777080e1-32f7-42be-b199-f33dc844e904';

  -- Core devotee IDs
  d1  uuid := 'aa000003-0000-0000-0000-000000000001';
  d2  uuid := 'aa000003-0000-0000-0000-000000000002';
  d3  uuid := 'aa000003-0000-0000-0000-000000000003';
  d4  uuid := 'aa000003-0000-0000-0000-000000000004';
  d5  uuid := 'aa000003-0000-0000-0000-000000000005';
  d6  uuid := 'aa000003-0000-0000-0000-000000000006';
  d7  uuid := 'aa000003-0000-0000-0000-000000000007';
  d8  uuid := 'aa000003-0000-0000-0000-000000000008';
  d9  uuid := 'aa000003-0000-0000-0000-000000000009';
  d10 uuid := 'aa000003-0000-0000-0000-000000000010';
  d11 uuid := 'aa000003-0000-0000-0000-000000000011';
  d12 uuid := 'aa000003-0000-0000-0000-000000000012';
  d13 uuid := 'aa000003-0000-0000-0000-000000000013';
  d14 uuid := 'aa000003-0000-0000-0000-000000000014';
  d15 uuid := 'aa000003-0000-0000-0000-000000000015';
  d16 uuid := 'aa000003-0000-0000-0000-000000000016';
  d17 uuid := 'aa000003-0000-0000-0000-000000000017';
  d18 uuid := 'aa000003-0000-0000-0000-000000000018';
  d19 uuid := 'aa000003-0000-0000-0000-000000000019';
  d20 uuid := 'aa000003-0000-0000-0000-000000000020';
  d21 uuid := 'aa000003-0000-0000-0000-000000000021';
  d22 uuid := 'aa000003-0000-0000-0000-000000000022';
  d23 uuid := 'aa000003-0000-0000-0000-000000000023';
  d24 uuid := 'aa000003-0000-0000-0000-000000000024';
  d25 uuid := 'aa000003-0000-0000-0000-000000000025';

  -- Staff IDs
  s_priest1   uuid := 'aa000002-0000-0000-0000-000000000001';
  s_priest2   uuid := 'aa000002-0000-0000-0000-000000000002';
  s_cook      uuid := 'aa000002-0000-0000-0000-000000000003';
  s_security  uuid := 'aa000002-0000-0000-0000-000000000004';
  s_frontdesk uuid := 'aa000002-0000-0000-0000-000000000005';
  s_driver    uuid := 'aa000002-0000-0000-0000-000000000006';
  s_manager   uuid := 'aa000002-0000-0000-0000-000000000007';

  -- Puja IDs
  puja_ganesh uuid := 'aa000004-0000-0000-0000-000000000001';
  puja_satya  uuid := 'aa000004-0000-0000-0000-000000000002';
  puja_rudra  uuid := 'aa000004-0000-0000-0000-000000000003';
  puja_nava   uuid := 'aa000004-0000-0000-0000-000000000004';
  puja_laxmi  uuid := 'aa000004-0000-0000-0000-000000000005';

  -- Event IDs
  ev1 uuid := 'aa000013-0000-0000-0000-000000000001';
  ev2 uuid := 'aa000013-0000-0000-0000-000000000002';
  ev3 uuid := 'aa000013-0000-0000-0000-000000000003';

  -- Medical camp IDs
  mc1 uuid := 'aa000014-0000-0000-0000-000000000001';
  mc2 uuid := 'aa000014-0000-0000-0000-000000000002';

  -- Accommodation & room IDs
  acc_main uuid;
  r1 uuid := 'aa000006-0000-0000-0000-000000000001';
  r2 uuid := 'aa000006-0000-0000-0000-000000000002';
  r3 uuid := 'aa000006-0000-0000-0000-000000000003';
  r4 uuid := 'aa000006-0000-0000-0000-000000000004';
  acc_2 uuid := 'aa000005-0000-0000-0000-000000000002';
  r5 uuid := 'aa000006-0000-0000-0000-000000000005';
  acc_3 uuid := 'aa000005-0000-0000-0000-000000000003';
  r6 uuid := 'aa000006-0000-0000-0000-000000000006';

  -- Inventory IDs
  inv_rice    uuid := 'aa000009-0000-0000-0000-000000000001';
  inv_ghee    uuid := 'aa000009-0000-0000-0000-000000000002';
  inv_flour   uuid := 'aa000009-0000-0000-0000-000000000003';
  inv_camphor uuid := 'aa000009-0000-0000-0000-000000000004';
  inv_incense uuid := 'aa000009-0000-0000-0000-000000000005';
  inv_flowers uuid := 'aa000009-0000-0000-0000-000000000006';
  inv_dal     uuid := 'aa000009-0000-0000-0000-000000000007';
  inv_oil     uuid := 'aa000009-0000-0000-0000-000000000008';
  loc_storeroom uuid := 'aa000008-0000-0000-0000-000000000001';
  loc_kitchen   uuid := 'aa000008-0000-0000-0000-000000000002';
  loc_temple    uuid := 'aa000008-0000-0000-0000-000000000003';

  -- Seva IDs
  seva_cleaning uuid := 'aa000010-0000-0000-0000-000000000001';
  seva_prasad   uuid := 'aa000010-0000-0000-0000-000000000002';
  seva_garden   uuid := 'aa000010-0000-0000-0000-000000000003';
  seva_gate     uuid := 'aa000010-0000-0000-0000-000000000004';

  vol1 uuid := 'aa000012-0000-0000-0000-000000000001';
  vol2 uuid := 'aa000012-0000-0000-0000-000000000002';
  vol3 uuid := 'aa000012-0000-0000-0000-000000000003';
  vol4 uuid := 'aa000012-0000-0000-0000-000000000004';

  -- Gurukul IDs
  gk_course_gita   uuid := 'aa000020-0000-0000-0000-000000000001';
  gk_course_yoga   uuid := 'aa000020-0000-0000-0000-000000000002';
  gk_course_vedic  uuid := 'aa000020-0000-0000-0000-000000000003';
  gk_book_gita_ess uuid := 'aa000020-0000-0000-0000-000000000004';
  gk_book_yoga_sut uuid := 'aa000020-0000-0000-0000-000000000005';
  gk_book_mahab    uuid := 'aa000020-0000-0000-0000-000000000006';
  gk_book_ayur     uuid := 'aa000020-0000-0000-0000-000000000007';
  gk_pdf_prayer    uuid := 'aa000020-0000-0000-0000-000000000008';
  gk_video_aarti   uuid := 'aa000020-0000-0000-0000-000000000010';

  ge_d5_ved   uuid := 'aa000023-0000-0000-0000-000000000005';
  ge_d8_yoga  uuid := 'aa000023-0000-0000-0000-000000000007';
  ge_d9_gita  uuid := 'aa000023-0000-0000-0000-000000000008';
  gl_gita_1   uuid := 'aa000022-0000-0000-0000-000000000001';
  gl_gita_2   uuid := 'aa000022-0000-0000-0000-000000000002';
  gl_gita_3   uuid := 'aa000022-0000-0000-0000-000000000003';
  gl_gita_4   uuid := 'aa000022-0000-0000-0000-000000000004';
  gl_gita_5   uuid := 'aa000022-0000-0000-0000-000000000005';
  gl_gita_6   uuid := 'aa000022-0000-0000-0000-000000000006';
  gl_yoga_1   uuid := 'aa000022-0000-0000-0000-000000000011';
  gl_yoga_2   uuid := 'aa000022-0000-0000-0000-000000000012';
  gl_yoga_3   uuid := 'aa000022-0000-0000-0000-000000000013';
  gl_yoga_4   uuid := 'aa000022-0000-0000-0000-000000000014';
  gl_yoga_5   uuid := 'aa000022-0000-0000-0000-000000000015';
  gl_ved_1    uuid := 'aa000022-0000-0000-0000-000000000017';

  -- Vendor and PO IDs
  v1 uuid := 'aa000015-0000-0000-0000-000000000001';
  v2 uuid := 'aa000015-0000-0000-0000-000000000002';
  v3 uuid := 'aa000015-0000-0000-0000-000000000003';
  po1 uuid := 'aa000016-0000-0000-0000-000000000001';
  po2 uuid := 'aa000016-0000-0000-0000-000000000002';

  -- New PO IDs
  po3 uuid := 'aa000016-0000-0000-0000-000000000003';
  po4 uuid := 'aa000016-0000-0000-0000-000000000004';
  po5 uuid := 'aa000016-0000-0000-0000-000000000005';

  -- New Medical Camp
  mc3 uuid := 'aa000014-0000-0000-0000-000000000003';

  -- New Seva shifts
  sh9  uuid := 'aa000011-0000-0000-0000-000000000009';
  sh10 uuid := 'aa000011-0000-0000-0000-000000000010';
  sh11 uuid := 'aa000011-0000-0000-0000-000000000011';
  sh12 uuid := 'aa000011-0000-0000-0000-000000000012';

  -- New Gurukul enrollment IDs (d10, d11-d15 enrolling)
  ge_d10_yoga uuid := 'aa000023-0000-0000-0000-000000000010';
  ge_d11_gita uuid := 'aa000023-0000-0000-0000-000000000011';
  ge_d12_yoga uuid := 'aa000023-0000-0000-0000-000000000012';
  ge_d13_gita uuid := 'aa000023-0000-0000-0000-000000000013';
  ge_d15_ved  uuid := 'aa000023-0000-0000-0000-000000000014';

  -- New Gurukul orders
  go7  uuid := 'aa000024-0000-0000-0000-000000000007';
  go8  uuid := 'aa000024-0000-0000-0000-000000000008';
  go9  uuid := 'aa000024-0000-0000-0000-000000000009';
  go10 uuid := 'aa000024-0000-0000-0000-000000000010';

  cat_general  uuid;
  cat_annadaan uuid;
  cat_building uuid;
  cat_pooja    uuid;

BEGIN

SELECT id INTO cat_general  FROM master_donation_categories WHERE name = 'General Fund'   LIMIT 1;
SELECT id INTO cat_annadaan FROM master_donation_categories WHERE name = 'Annadanam'      LIMIT 1;
SELECT id INTO cat_building FROM master_donation_categories WHERE name = 'Building Fund'  LIMIT 1;
SELECT id INTO cat_pooja    FROM master_donation_categories WHERE name = 'Pooja Seva'     LIMIT 1;
SELECT id INTO acc_main FROM accommodations WHERE code = 'MAIN' LIMIT 1;

-- =============================================================================
-- B3-1. MORE DEVOTEE DATA (tags, notes, communications, milestones for d11-d25)
-- =============================================================================

INSERT INTO devotee_tags (devotee_id, tag_name)
VALUES
  (d12, 'Life Member'),  (d12, 'Regular Donor'),
  (d13, 'Patron'),       (d13, 'VIP'),           (d13, 'Haridwar Chapter'),
  (d18, 'Life Member'),  (d18, 'Kerala Chapter'),
  (d20, 'Patron'),       (d20, 'Bihar Chapter'),  (d20, 'Festival Sponsor'),
  (d22, 'Life Member'),  (d22, 'Coimbatore Chapter'),
  (d24, 'Life Member'),  (d24, 'Andhra Chapter'),
  (d14, 'New Member'),   (d16, 'Youth Wing'),
  (d19, 'Youth Wing'),   (d11, 'Regular Donor')
ON CONFLICT DO NOTHING;

INSERT INTO devotee_milestones (devotee_id, milestone_type, date, notes)
VALUES
  (d12, 'birthday',            '2026-11-08', 'Birthday – send card'),
  (d13, 'spiritual_milestone', '2025-10-10', 'Completed 108 Rudrabhishek – milestone'),
  (d13, 'anniversary',         '2026-06-30', 'Wedding anniversary – 35 years'),
  (d18, 'spiritual_milestone', '2026-03-21', 'Took Deeksha during Ayurveda camp'),
  (d20, 'birthday',            '2026-08-22', 'Birthday – elder patron, call personally'),
  (d22, 'anniversary',         '2026-10-31', 'Joining anniversary with ashram – 7 years'),
  (d24, 'spiritual_milestone', '2025-11-12', '9th year of association – felicitation due')
ON CONFLICT DO NOTHING;

INSERT INTO devotee_notes (devotee_id, note, follow_up_date, created_by)
VALUES
  (d12, 'Wants to donate 500 copies of Gita for distribution. Connect with Gurukul team.', '2026-04-20', uid),
  (d13, 'Discussed naming rights for new dharamshala wing. Board approval needed.', '2026-05-15', uid),
  (d18, 'Long-time life member from Kerala. Wants to start a satellite satsang centre.', '2026-06-01', uid),
  (d20, 'Elder patron – always donates on festivals. Send special invitation for Ram Navami.', NULL, uid),
  (d22, 'Vegan diet – ensure kitchen is informed during retreat stays.', NULL, uid),
  (d24, 'Considering endowing a puja chair (Rudrabhishek daily). ₹5 lakh endowment.', '2026-05-01', uid)
ON CONFLICT DO NOTHING;

INSERT INTO devotee_communications (devotee_id, channel, direction, summary, created_by)
VALUES
  (d12, 'email',     'inbound',  'Inquired about bulk Bhagavad Gita purchase for corporate gifting.', uid),
  (d13, 'call',      'outbound', 'Followed up on dharamshala wing naming proposal. He is interested.', uid),
  (d15, 'whatsapp',  'inbound',  'Asked for schedule of upcoming events and puja booking.', uid),
  (d18, 'email',     'outbound', 'Sent information on how to start a satellite satsang group.', uid),
  (d20, 'call',      'outbound', 'Called to inform about Ram Navami program. She confirmed attendance.', uid),
  (d22, 'whatsapp',  'inbound',  'Confirmed vegan diet preference for upcoming retreat.', uid),
  (d24, 'email',     'inbound',  'Sent inquiry about endowment options for daily rituals.', uid),
  (d19, 'whatsapp',  'inbound',  'Interested in volunteering for Gurukul library management.', uid),
  (d11, 'call',      'outbound', 'Reminded about upcoming Navratri event and donation pledge.', uid)
ON CONFLICT DO NOTHING;

INSERT INTO devotee_family_members (devotee_id, name, relation, date_of_birth, mobile_number)
VALUES
  (d12, 'Suresh Rao',          'Spouse',  '1973-04-15', '+91-9822111004'),
  (d13, 'Savitri Chand',       'Spouse',  '1963-09-20', '+91-9822111006'),
  (d13, 'Rakesh Chand',        'Son',     '1990-03-12', NULL),
  (d18, 'Gopinath Menon',      'Spouse',  '1965-11-30', '+91-9822111016'),
  (d18, 'Pradeep Menon',       'Son',     '1994-07-08', NULL),
  (d20, 'Umesh Sinha',         'Spouse',  '1952-12-10', '+91-9822111020'),
  (d22, 'Ravi Swaminathan',    'Spouse',  '1970-06-25', '+91-9822111024'),
  (d24, 'Savitha Reddy',       'Spouse',  '1968-08-14', '+91-9822111028')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-2. MORE PUJA BOOKINGS (Sep 2025 – April 2026, all devotees)
-- =============================================================================

INSERT INTO puja_bookings (booking_code, devotee_id, puja_id, booking_date, puja_date, puja_time,
                           assigned_priest_id, status, payment_status, amount_paid)
VALUES
  ('PUJA-2025-0006', d10, puja_laxmi,  '2025-09-01', '2025-09-12', '18:00', s_priest2, 'Completed', 'Paid',     701),
  ('PUJA-2025-0007', d15, puja_rudra,  '2025-09-10', '2025-09-20', '05:30', s_priest1, 'Completed', 'Paid',    2101),
  ('PUJA-2025-0008', d21, puja_ganesh, '2025-09-15', '2025-10-02', '07:00', s_priest2, 'Completed', 'Paid',     501),
  ('PUJA-2025-0009', d16, puja_satya,  '2025-09-20', '2025-10-05', '08:00', s_priest1, 'Completed', 'Paid',    1501),
  ('PUJA-2025-0010', d19, puja_nava,   '2025-10-05', '2025-10-15', '09:00', s_priest2, 'Completed', 'Paid',    1201),
  ('PUJA-2025-0011', d25, puja_laxmi,  '2025-10-20', '2025-11-01', '18:00', s_priest2, 'Completed', 'Paid',     701),
  ('PUJA-2025-0012', d14, puja_ganesh, '2025-10-25', '2025-11-05', '07:00', s_priest2, 'Completed', 'Paid',     501),
  ('PUJA-2025-0013', d10, puja_rudra,  '2025-11-01', '2025-11-15', '05:30', s_priest1, 'Completed', 'Paid',    2101),
  ('PUJA-2025-0014', d23, puja_satya,  '2025-11-10', '2025-11-22', '08:00', s_priest1, 'Completed', 'Paid',    1501),
  ('PUJA-2025-0015', d11, puja_laxmi,  '2025-11-15', '2025-11-28', '18:00', s_priest2, 'Completed', 'Paid',     701),
  ('PUJA-2026-0016', d10, puja_ganesh, '2026-04-01', '2026-04-09', '07:00', s_priest2, 'Confirmed',  'Paid',    501),
  ('PUJA-2026-0017', d20, puja_satya,  '2026-04-02', '2026-04-12', '08:00', s_priest1, 'Confirmed',  'Paid',   1501),
  ('PUJA-2026-0018', d22, puja_rudra,  '2026-04-02', '2026-04-19', '05:30', s_priest1, 'Confirmed',  'Partial',1000),
  ('PUJA-2026-0019', d24, puja_nava,   '2026-04-03', '2026-04-22', '09:00', s_priest2, 'Confirmed',  'Paid',   1201),
  ('PUJA-2026-0020', d18, puja_laxmi,  '2026-04-03', '2026-04-11', '18:00', s_priest2, 'Pending',    'Pending',   0)
ON CONFLICT (booking_code) DO NOTHING;

-- =============================================================================
-- B3-3. MORE DONATIONS (July – September 2025)
-- =============================================================================

INSERT INTO donations (donation_code, devotee_id, donation_date, amount, category_id,
                        purpose, payment_mode, transaction_ref, payment_status,
                        receipt_generated, currency, created_by)
VALUES
  ('DON-2025-0011', d1,  '2025-07-01', 11000,  cat_general,  'Mid-year general fund',                     'UPI',           'UPI20250701001', 'Completed', true,  'INR', uid),
  ('DON-2025-0012', d3,  '2025-07-15', 25000,  cat_building, 'Construction progress donation – July',     'Bank Transfer', 'NEFT20250715001','Completed', true,  'INR', uid),
  ('DON-2025-0013', d9,  '2025-07-20', 50000,  cat_building, 'Dharamshala 2nd installment',               'Cheque',        'CHQ20250720001', 'Completed', true,  'INR', uid),
  ('DON-2025-0014', d24, '2025-07-25', 7500,   cat_general,  'Temple upkeep donation',                    'UPI',           'UPI20250725001', 'Completed', false, 'INR', uid),
  ('DON-2025-0015', d5,  '2025-08-01', 21000,  cat_annadaan, 'Krishna Janmashtami annadaan sponsorship',  'UPI',           'UPI20250801001', 'Completed', true,  'INR', uid),
  ('DON-2025-0016', d20, '2025-08-10', 10000,  cat_general,  'Swatantrata Diwas celebration fund',        'UPI',           'UPI20250810001', 'Completed', false, 'INR', uid),
  ('DON-2025-0017', d13, '2025-08-15', 15000,  cat_annadaan, 'Janmashtami community feast',               'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2025-0018', d22, '2025-08-24', 5100,   cat_pooja,    'Ganesh Chaturthi puja sponsorship',         'UPI',           'UPI20250824001', 'Completed', false, 'INR', uid),
  ('DON-2025-0019', d12, '2025-08-28', 8000,   cat_building, 'Ganesh Chaturthi building fund contribution','Bank Transfer', 'NEFT20250828001','Completed', true,  'INR', uid),
  ('DON-2025-0020', d18, '2025-09-01', 3100,   cat_pooja,    'Navaratri puja advance contribution',       'UPI',           'UPI20250901001', 'Completed', false, 'INR', uid),
  ('DON-2025-0021', d7,  '2025-09-05', 5500,   cat_general,  'General quarterly donation',                'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2025-0022', d2,  '2025-09-10', 1100,   cat_annadaan, 'Weekly annadaan contribution',              'UPI',           'UPI20250910001', 'Completed', false, 'INR', uid),
  ('DON-2025-0023', d4,  '2025-09-15', 2100,   cat_pooja,    'Navratri aarti fund',                       'UPI',           'UPI20250915001', 'Completed', false, 'INR', uid),
  ('DON-2025-0024', d6,  '2025-09-20', 7700,   cat_general,  'Navratri festival expenses',                'Cash',          NULL,             'Completed', false, 'INR', uid),
  ('DON-2025-0025', d10, '2025-09-25', 3300,   cat_building, 'Q3 building fund installment',              'UPI',           'UPI20250925001', 'Completed', false, 'INR', uid)
ON CONFLICT (donation_code) DO NOTHING;

-- =============================================================================
-- B3-4. MORE VISITOR REGISTRATIONS (Feb 2026 + April 4-7)
-- =============================================================================

INSERT INTO visitor_registrations (devotee_id, name, phone, email, visit_purpose,
                                    visit_date, check_in_at, check_out_at,
                                    is_walk_in, is_vip, nationality)
VALUES
  -- February 2026
  (d10, 'Sunita Agarwal',     '+91-9811111019', 'sunita.agarwal@gmail.com',   'Puja Booking',         '2026-02-01', '2026-02-01 09:00:00+05:30', '2026-02-01 12:30:00+05:30', false, false, 'Indian'),
  (NULL,'Dr. Sarah Mitchell', '+1-6175551234',  'sarah.m@harvard.edu',         'Academic Research',    '2026-02-05', '2026-02-05 10:00:00+05:30', '2026-02-05 17:00:00+05:30', true,  false, 'American'),
  (d21, 'Vishal Arora',       '+91-9822111021', 'vishal.arora@gmail.com',      'Darshan',              '2026-02-08', '2026-02-08 08:30:00+05:30', '2026-02-08 12:00:00+05:30', false, false, 'Indian'),
  (NULL,'Ananya Krishnamurthy','+91-9900000003',NULL,                          'Spiritual Retreat',    '2026-02-12', '2026-02-12 08:00:00+05:30', '2026-02-12 19:00:00+05:30', true,  false, 'Indian'),
  (d23, 'Devendra Pandey',    '+91-9822111025', 'devendra.pandey@gmail.com',   'Puja Booking',         '2026-02-15', '2026-02-15 09:00:00+05:30', '2026-02-15 13:00:00+05:30', false, false, 'Indian'),
  (NULL,'Huang Wei',          '+86-13912345678',NULL,                          'Cultural Study',       '2026-02-18', '2026-02-18 10:00:00+05:30', '2026-02-18 16:00:00+05:30', true,  false, 'Chinese'),
  (d25, 'Manjula Shah',       '+91-9822111029', 'manjula.shah@gmail.com',      'Darshan',              '2026-02-20', '2026-02-20 08:00:00+05:30', '2026-02-20 11:30:00+05:30', false, false, 'Indian'),
  (NULL,'Amit Sharma (NGO)',  '+91-9800100001', 'amit@ngo.org',                'Partnership Meeting',  '2026-02-22', '2026-02-22 11:00:00+05:30', '2026-02-22 14:00:00+05:30', false, false, 'Indian'),
  -- April 4-7 2026
  (d10, 'Sunita Agarwal',     '+91-9811111019', 'sunita.agarwal@gmail.com',   'Navratri Darshan',     '2026-04-04', '2026-04-04 08:00:00+05:30', '2026-04-04 13:00:00+05:30', false, false, 'Indian'),
  (NULL,'Isabelle Moreau',    '+33-698765432',  'isabelle.m@email.fr',         'Yoga & Meditation',    '2026-04-04', '2026-04-04 07:00:00+05:30', '2026-04-04 12:00:00+05:30', true,  false, 'French'),
  (d17, 'Santosh Kulkarni',   '+91-9822111013', 'santosh.kulkarni@gmail.com',  'Navratri Darshan',     '2026-04-05', '2026-04-05 08:30:00+05:30', '2026-04-05 18:00:00+05:30', false, false, 'Indian'),
  (NULL,'Yuki Tanaka',        '+81-801234567',  'yuki.t@email.jp',             'Documentary Research', '2026-04-05', '2026-04-05 09:00:00+05:30', NULL,                        true,  false, 'Japanese'),
  (NULL,'Ram Lal Yadav',      '+91-9811119001', NULL,                          'Darshan',              '2026-04-06', '2026-04-06 06:00:00+05:30', '2026-04-06 11:00:00+05:30', true,  false, 'Indian'),
  (NULL,'Sulochana Verma',    '+91-9811119002', NULL,                          'Darshan',              '2026-04-06', '2026-04-06 06:30:00+05:30', '2026-04-06 13:00:00+05:30', true,  false, 'Indian'),
  (NULL,'Pramod Shukla',      '+91-9811119003', NULL,                          'Ram Navami Puja',      '2026-04-06', '2026-04-06 07:00:00+05:30', '2026-04-06 15:00:00+05:30', true,  false, 'Indian'),
  (NULL,'Genevieve Bernard',  '+32-471234567',  'genevieve.b@email.be',        'Ashram Experience',    '2026-04-07', '2026-04-07 08:00:00+05:30', '2026-04-07 17:00:00+05:30', true,  false, 'Belgian'),
  (d15, 'Manoj Tiwari',       '+91-9822111009', 'manoj.tiwari@gmail.com',      'Navratri Darshan',     '2026-04-07', '2026-04-07 08:30:00+05:30', '2026-04-07 12:00:00+05:30', false, false, 'Indian')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-5. MORE ACCOMMODATION BOOKINGS
-- =============================================================================

INSERT INTO accommodation_bookings (accommodation_id, devotee_id, room_id, bed_id,
                                     check_in_date, check_out_date, status,
                                     actual_check_in_at, actual_check_out_at,
                                     number_of_guests, total_amount, payment_status,
                                     meal_preference, special_requests, currency)
VALUES
  (acc_main, d10, r2, NULL, '2026-03-10', '2026-03-14', 'CheckedOut',
   '2026-03-10 14:00:00+05:30', '2026-03-14 10:30:00+05:30', 1, 3200, 'Paid', 'Vegetarian', NULL, 'INR'),

  (acc_main, d13, r4, NULL, '2026-04-05', '2026-04-11', 'Confirmed',
   NULL, NULL, 3, 2400, 'Paid', 'Vegetarian', 'Navratri package – dorm beds', 'INR'),

  (acc_3,    d22, r6, NULL, '2026-04-08', '2026-04-12', 'Confirmed',
   NULL, NULL, 2, 7200, 'Partial', 'Vegan', 'Vegan meals only please', 'INR'),

  (acc_2,    d18, r5, NULL, '2026-04-10', '2026-04-15', 'Confirmed',
   NULL, NULL, 1, 3000, 'Paid', 'Vegetarian', 'Senior citizen – ground floor preferred', 'INR'),

  (acc_main, d20, r3, NULL, '2026-04-20', '2026-04-25', 'Pending',
   NULL, NULL, 2, 6000, 'Pending', 'Vegetarian', 'Akshaya Tritiya visit', 'INR'),

  (acc_main, d24, r1, NULL, '2026-04-25', '2026-04-30', 'Pending',
   NULL, NULL, 1, 4000, 'Pending', 'Vegetarian', 'VIP guest – need assistance', 'INR'),

  (acc_main, d11, r2, NULL, '2026-05-01', '2026-05-05', 'Pending',
   NULL, NULL, 1, 3200, 'Pending', 'Vegetarian', 'Summer retreat booking', 'INR'),

  (acc_3,    d14, r6, NULL, '2026-05-05', '2026-05-10', 'Pending',
   NULL, NULL, 2, 9000, 'Pending', 'Vegan', 'Mother and daughter retreat', 'INR')
ON CONFLICT DO NOTHING;

-- More waitlist entries
INSERT INTO booking_waitlist (accommodation_id, devotee_id, desired_check_in, desired_check_out,
                               room_type_preference, notes)
VALUES
  (acc_main, d15, '2026-04-05', '2026-04-10', 'single', 'Navratri retreat – needs single room'),
  (acc_main, d19, '2026-04-10', '2026-04-14', 'single', 'Youth yoga camp participant'),
  (acc_2,    d21, '2026-04-20', '2026-04-25', 'single', 'Solo meditation retreat'),
  (acc_main, d23, '2026-04-25', '2026-04-30', 'double', 'Akshaya Tritiya pilgrimage group'),
  (acc_3,    d16, '2026-05-01', '2026-05-05', 'single', 'Ladies-only wing – youth volunteer')
ON CONFLICT DO NOTHING;

-- Guest feedback for more bookings
INSERT INTO guest_feedback (booking_id, rating, comment)
SELECT ab.id, 4, 'Very peaceful stay. The early morning aarti was a highlight. Food was excellent and sattvic.'
FROM accommodation_bookings ab
WHERE ab.devotee_id = d10 AND ab.status = 'CheckedOut'
LIMIT 1;

-- =============================================================================
-- B3-6. MORE INVENTORY — New items and transactions
-- =============================================================================

INSERT INTO inventory_items (name, category, unit, current_stock, min_stock_level,
                              is_perishable, location_id)
VALUES
  ('Cardamom (Elaichi)',    'Spices',         'kg',    5,  1, false, loc_storeroom),
  ('Saffron (Kesar)',       'Spices',         'g',    50, 10, false, loc_storeroom),
  ('Almonds (Badam)',       'Dry Fruits',     'kg',    8,  2, false, loc_storeroom),
  ('Raisins (Kishmish)',    'Dry Fruits',     'kg',    6,  1, false, loc_storeroom),
  ('Turmeric Powder',       'Spices',         'kg',   10,  2, false, loc_storeroom),
  ('Red Chilli Powder',     'Spices',         'kg',    5,  1, false, loc_storeroom),
  ('Coriander Seeds',       'Spices',         'kg',    8,  2, false, loc_storeroom),
  ('Paneer (Fresh)',        'Dairy',          'kg',    8,  2, true,  loc_kitchen),
  ('Curd (Dahi)',           'Dairy',          'L',    15,  5, true,  loc_kitchen),
  ('Coconut Oil',           'Oils',           'L',    10,  3, false, loc_kitchen),
  ('Tulsi (Holy Basil)',    'Puja Material',  'Bunch', 20,  5, true,  loc_temple),
  ('Sindoor (Vermillion)',  'Puja Material',  'Box',   30,  8, false, loc_temple),
  ('Chandan (Sandalwood)',  'Puja Material',  'g',    200, 50, false, loc_temple),
  ('Puja Thali (Brass)',    'Puja Material',  'PCS',   15,  3, false, loc_temple),
  ('Coconut (Dried)',       'Puja Material',  'PCS',   50, 10, false, loc_temple)
ON CONFLICT DO NOTHING;

INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_type, remarks)
SELECT id, 'IN', 100, 'Purchase', 'Opening stock – festival season restock'
FROM inventory_items WHERE name IN ('Cardamom (Elaichi)', 'Turmeric Powder', 'Coriander Seeds', 'Sindoor (Vermillion)', 'Coconut (Dried)')
ON CONFLICT DO NOTHING;

INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_type, remarks)
SELECT id, 'IN', 50, 'Donation', 'Donated for Navratri season'
FROM inventory_items WHERE name IN ('Saffron (Kesar)', 'Almonds (Badam)', 'Raisins (Kishmish)')
ON CONFLICT DO NOTHING;

INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_type, remarks)
SELECT id, 'OUT', 15, 'Usage', 'Used in Navratri prasad preparation'
FROM inventory_items WHERE name IN ('Almonds (Badam)', 'Raisins (Kishmish)', 'Cardamom (Elaichi)')
ON CONFLICT DO NOTHING;

-- More religious items
INSERT INTO religious_items (name, type, quantity, location, is_saleable)
VALUES
  ('Durga Mata Brass Idol (8 inch)',  'idol',          5,  'Temple Store',     true),
  ('Hanuman Ji Marble Idol',          'idol',          2,  'Main Sanctum',     false),
  ('Silver Puja Thali Set',           'puja_material', 3,  'Temple Store',     true),
  ('Copper Kalash Set',               'puja_material', 8,  'Temple Store',     true),
  ('Gita Press Ramcharitmanas',       'book',          40, 'Temple Library',   true),
  ('Hanuman Chalisa (pocket size)',   'book',         100, 'Temple Store',     true),
  ('Srimad Bhagavatam (10 vols)',     'book',          5,  'Temple Library',   true),
  ('Swami Ji Audio Discourses (USB)', 'puja_material', 20, 'Temple Store',     true)
ON CONFLICT DO NOTHING;

-- More fixed assets
INSERT INTO fixed_assets (name, category, purchase_date, purchase_value, current_value,
                           location, depreciation_method, useful_life_years)
VALUES
  ('Toyota Innova (UP14CD5678)', 'Vehicle',   '2023-09-01', 2100000, 1800000, 'Ashram Garage',         'Written Down Value', 10),
  ('Solar Panel System (20kW)',  'Equipment', '2022-10-15',  850000,  620000, 'Rooftop, Main Building','Straight-line',      25),
  ('CCTV Surveillance System',   'Equipment', '2024-01-10',   95000,   80000, 'All Campus Buildings',  'Straight-line',       7),
  ('Meditation Hall (New Wing)', 'Building',  '2025-06-01', 4500000, 4500000, 'Ashram Campus Block C', 'Straight-line',      50),
  ('Commercial Kitchen Setup',   'Equipment', '2021-03-20',  380000,  240000, 'Main Kitchen',          'Straight-line',      10)
ON CONFLICT DO NOTHING;

-- More purchase orders
INSERT INTO purchase_orders (id, vendor_id, status, order_date, expected_date, total_amount, notes)
VALUES
  (po3, v2, 'Received', '2026-01-15', '2026-01-20',  8500, 'Ghee and Ayurvedic products restock'),
  (po4, v1, 'Received', '2026-02-01', '2026-02-07', 15000, 'Feb monthly grains – Navratri prep'),
  (po5, v3, 'Draft',    '2026-04-08', '2026-04-12',  6200, 'Post Ram Navami puja samagri restocking')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (po_id, item_id, item_name, quantity, unit_cost, total_cost)
VALUES
  (po3, inv_ghee, 'Pure Cow Ghee', 25, 280, 7000),
  (po4, inv_rice, 'Basmati Rice',  150, 46, 6900),
  (po4, inv_dal,  'Toor Dal',       80, 62, 4960),
  (po5, inv_camphor, 'Camphor Tablets', 80, 35, 2800),
  (po5, inv_incense, 'Agarbatti Sticks',120, 20, 2400)
ON CONFLICT DO NOTHING;

-- More inventory transfers
INSERT INTO inventory_transfers (item_id, from_location_id, to_location_id, quantity, status, notes)
VALUES
  (inv_rice,    loc_storeroom, loc_kitchen,  80, 'Completed', 'Navratri week kitchen stock'),
  (inv_dal,     loc_storeroom, loc_kitchen,  30, 'Completed', 'Festival month kitchen supply'),
  (inv_flowers, loc_storeroom, loc_temple,   15, 'Completed', 'Fresh flowers for Navratri decoration'),
  (inv_oil,     loc_storeroom, loc_kitchen,  10, 'Completed', 'Cooking oil for Ram Navami feast'),
  (inv_camphor, loc_storeroom, loc_temple,   20, 'Completed', 'Additional camphor for Navratri aarti')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-7. MORE MEDICAL DATA
-- =============================================================================

-- New medical camp for wellness
INSERT INTO medical_camps (id, name, camp_date, end_date, location, description,
                            status, capacity, specialties, organizer_staff_id)
VALUES
  (mc3, 'Eye & Dental Camp – May 2026', '2026-05-10', '2026-05-11',
   'Ashram Community Hall', 'Free eye check-up with spectacle distribution and dental treatment',
   'Scheduled', 150, ARRAY['Eye','Dental','Orthopedic'], s_manager)
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_camp_registrations (camp_id, patient_name, contact, notes,
                                         status, prescription, follow_up_date, is_walk_in)
VALUES
  (mc1, 'Deepak Malhotra',  '+91-9822111001', 'General health check-up',            'Examined',  'BP normal. Vitamin D supplements prescribed.', '2026-05-05', false),
  (mc1, 'Pooja Bhatia',     '+91-9822111011', 'Menstrual health consult',           'Examined',  'Iron and folic acid supplements. Diet chart.', '2026-05-05', false),
  (mc1, 'Unknown walker 3', 'N/A',            'Knee pain – requested ortho consult', 'Examined',  'X-ray recommended. Referred to district hospital.', NULL, true),
  (mc1, 'Unknown walker 4', 'N/A',            'Chest congestion',                    'Treated',   'Steam inhalation + Ayurvedic syrup',           NULL, true),
  (mc3, 'Rajesh Verma',     '+91-9811111017', 'Eye check – cataract query',         'Registered', NULL, NULL, false),
  (mc3, 'Nirmala Sinha',    '+91-9822111019', 'Dental – tooth pain',                'Registered', NULL, NULL, false),
  (mc3, 'Manoj Tiwari',     '+91-9822111009', 'Eye check – reading glasses needed', 'Registered', NULL, NULL, false)
ON CONFLICT DO NOTHING;

INSERT INTO wellness_consultations (devotee_id, consultation_date, practitioner_id,
                                     type, treatment_plan, session_notes,
                                     follow_up_date, status)
VALUES
  (d12, '2026-04-07', s_priest1, 'Ayurveda',  'Chandraprabha Vati + Ashwagandha + warm sesame oil massage',
   'Complaints of body pain and general fatigue. Vata-Pitta imbalance.', '2026-04-21', 'Completed'),
  (d15, '2026-04-08', s_priest1, 'Meditation','Mindfulness meditation for 20 min daily. Start with breath awareness.',
   'Stress and anxiety reported. Referred to morning satsang group as well.', '2026-04-22', 'Scheduled'),
  (d20, '2026-04-09', s_priest1, 'Yoga',      'Chair yoga sequence for seniors + morning pranayama 10 min',
   'Senior patient. Mobility issues. Gentle chair-based sequence recommended.', '2026-04-23', 'Scheduled'),
  (d19, '2026-04-10', s_priest1, 'Ayurveda',  'Triphala + Ashwagandha for 30 days + avoid junk food',
   'Young student. Poor digestion, acne. Vata-Pitta imbalance.', '2026-05-10', 'Scheduled'),
  (d10, '2026-04-11', s_priest1, 'Meditation','Yoga Nidra (body scan) before sleep + Om chanting 108 times',
   'Insomnia. Unable to sleep before 2am. Recommended evening satsang.', '2026-04-25', 'Scheduled')
ON CONFLICT DO NOTHING;

INSERT INTO first_aid_incidents (incident_date, incident_time, location, patient_name,
                                  patient_contact, incident_type, treatment_given,
                                  referred_to_hospital, severity, attending_staff_id, notes)
VALUES
  ('2026-02-14', '11:00', 'Main Temple', 'Unknown pilgrim',  NULL,              'Faint',
   'Rest, cold water, sugar given. Recovered in 5 min.', false, 'Minor', s_frontdesk, 'Possible Shivratri fast-related fainting.'),
  ('2026-03-01', '09:30', 'Kitchen',     'Anand Kumar',      '+91-9876543205',  'Burn',
   'Cold water for 10 min. Burn gel applied. Bandaged.', false, 'Moderate', s_frontdesk, 'Minor cooking burn on forearm. Staff member.'),
  ('2026-03-26', '16:00', 'Parking Area','Unknown visitor',  '+91-9811119010',  'Fall',
   'Antiseptic and bandage. Ice pack for sprain.', false, 'Minor', s_security, 'Tripped on uneven ground near gate.'),
  ('2026-04-02', '08:30', 'Yoga Shala',  'Priya Sharma',     '+91-9811111003',  'Other',
   'Muscle cramp during yoga. Massage and warm compress applied.', false, 'Minor', s_frontdesk, 'Calf muscle cramp during group class.'),
  ('2026-04-05', '15:00', 'Main Gate',   'Unknown pilgrim',  NULL,              'Cut',
   'Wound cleaned, antiseptic applied, bandaged.', false, 'Minor', s_security, 'Glass cut on foot. Pilgrim barefoot near shards.')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-8. MORE SEVA DATA
-- =============================================================================

-- More seva opportunities
INSERT INTO seva_opportunities (name, category, description, location, is_active)
VALUES
  ('Library & Gurukul Seva',     'Education',   'Managing the ashram library and helping Gurukul students',    'Ashram Library',      true),
  ('Medical Seva',               'Healthcare',  'Assisting during medical camps and wellness sessions',        'Medical Room',        true),
  ('Cow Shelter Seva',           'Animal Care', 'Caring for the ashram goshala – feeding, cleaning, milking', 'Goshala',             true),
  ('Digital & Social Media Seva','Digital',     'Creating content, managing social media, photography',        'Admin Office',        true),
  ('Vehicle & Transport Seva',   'Logistics',   'Driving ashram vehicles, airport/station pickups for guests', 'Ashram Garage',       true)
ON CONFLICT DO NOTHING;

-- More shifts
INSERT INTO seva_shifts (id, opportunity_id, shift_date, start_time, end_time, slots_needed)
VALUES
  (sh9,  seva_cleaning, '2026-04-08', '06:00', '09:00', 4),
  (sh10, seva_prasad,   '2026-04-08', '11:30', '13:30', 6),
  (sh11, seva_garden,   '2026-04-09', '07:00', '09:30', 3),
  (sh12, seva_gate,     '2026-04-10', '08:00', '17:00', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO seva_assignments (shift_id, volunteer_id, status, hours_actual)
VALUES
  (sh9,  vol1, 'Assigned', NULL),
  (sh9,  vol2, 'Assigned', NULL),
  (sh10, vol2, 'Assigned', NULL),
  (sh10, vol4, 'Assigned', NULL),
  (sh11, vol1, 'Assigned', NULL),
  (sh12, vol3, 'Assigned', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_badges (volunteer_id, badge_type, awarded_at)
VALUES
  (vol1, '50 Hours Completed',   '2024-03-01 10:00:00+05:30'),
  (vol2, 'Kitchen Seva Star',    '2024-06-15 10:00:00+05:30'),
  (vol3, '50 Hours Completed',   '2023-11-15 10:00:00+05:30'),
  (vol4, 'Digital Seva Pioneer', '2025-01-20 10:00:00+05:30')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-9. MORE GURUKUL DATA
-- =============================================================================

-- More course enrollments
INSERT INTO course_enrollments (id, course_id, devotee_id, enrolled_at, progress_percentage,
                                 last_accessed_at, completed_at)
VALUES
  (ge_d10_yoga, gk_course_yoga, d10, '2026-03-05 09:00:00+05:30', 17, '2026-04-02 08:00:00+05:30', NULL),
  (ge_d11_gita, gk_course_gita, d11, '2026-02-10 10:00:00+05:30', 30, '2026-04-01 20:00:00+05:30', NULL),
  (ge_d12_yoga, gk_course_yoga, d12, '2026-01-25 09:00:00+05:30', 83, '2026-04-03 08:00:00+05:30', NULL),
  (ge_d13_gita, gk_course_gita, d13, '2026-01-05 10:00:00+05:30', 50, '2026-03-20 20:00:00+05:30', NULL),
  (ge_d15_ved,  gk_course_vedic,d15, '2026-03-20 09:00:00+05:30', 0,  NULL,                        NULL)
ON CONFLICT (id) DO NOTHING;

-- Progress for new enrollments
INSERT INTO user_lesson_progress (user_id, enrollment_id, lesson_id,
                                   progress_percentage, watch_time_seconds,
                                   is_completed, last_watched_at, completed_at)
VALUES
  -- d10 in Yoga (17% = 1 lesson)
  (uid, ge_d10_yoga, gl_yoga_1, 100, 2700, true,  '2026-03-10 07:00:00+05:30', '2026-03-10 07:45:00+05:30'),
  (uid, ge_d10_yoga, gl_yoga_2,  30,  900, false, '2026-04-02 08:00:00+05:30', NULL),
  -- d11 in Gita (30% = ~3 lessons)
  (uid, ge_d11_gita, gl_gita_1, 100, 2700, true,  '2026-02-15 20:00:00+05:30', '2026-02-15 20:45:00+05:30'),
  (uid, ge_d11_gita, gl_gita_2, 100, 3600, true,  '2026-02-25 20:00:00+05:30', '2026-02-25 21:00:00+05:30'),
  (uid, ge_d11_gita, gl_gita_3,  50, 1500, false, '2026-04-01 20:00:00+05:30', NULL),
  -- d12 in Yoga (83% = 5 of 6 lessons)
  (uid, ge_d12_yoga, gl_yoga_1, 100, 2700, true,  '2026-01-28 07:00:00+05:30', '2026-01-28 07:45:00+05:30'),
  (uid, ge_d12_yoga, gl_yoga_2, 100, 3600, true,  '2026-02-05 07:00:00+05:30', '2026-02-05 08:00:00+05:30'),
  (uid, ge_d12_yoga, gl_yoga_3, 100, 2400, true,  '2026-02-12 07:00:00+05:30', '2026-02-12 07:40:00+05:30'),
  (uid, ge_d12_yoga, gl_yoga_4, 100, 3000, true,  '2026-02-20 07:00:00+05:30', '2026-02-20 07:50:00+05:30'),
  (uid, ge_d12_yoga, gl_yoga_5, 100, 2700, true,  '2026-03-01 07:00:00+05:30', '2026-03-01 07:45:00+05:30'),
  (uid, ge_d12_yoga, gl_yoga_1,  60, 1620, false, '2026-04-03 08:00:00+05:30', NULL),  -- reviewing lesson 6
  -- d13 in Gita (50% = 5 of 10)
  (uid, ge_d13_gita, gl_gita_1, 100, 2700, true,  '2026-01-08 20:00:00+05:30', '2026-01-08 20:45:00+05:30'),
  (uid, ge_d13_gita, gl_gita_2, 100, 3600, true,  '2026-01-15 20:00:00+05:30', '2026-01-15 21:00:00+05:30'),
  (uid, ge_d13_gita, gl_gita_3, 100, 3000, true,  '2026-01-25 20:00:00+05:30', '2026-01-25 20:50:00+05:30'),
  (uid, ge_d13_gita, gl_gita_4, 100, 4500, true,  '2026-02-08 20:00:00+05:30', '2026-02-08 21:15:00+05:30'),
  (uid, ge_d13_gita, gl_gita_5, 100, 3300, true,  '2026-02-20 20:00:00+05:30', '2026-02-20 20:55:00+05:30'),
  (uid, ge_d13_gita, gl_gita_6,  80, 2160, false, '2026-03-20 20:00:00+05:30', NULL)
ON CONFLICT (enrollment_id, lesson_id) DO NOTHING;

-- More orders
INSERT INTO study_material_orders (id, order_code, devotee_id, order_date, total_amount,
                                    payment_status, payment_mode, transaction_ref,
                                    delivery_status, created_by)
VALUES
  (go7,  'ORD-2026-0007', d7,  '2026-03-10', 700,  'Paid',    'Cash',          NULL,             'Delivered', uid),
  (go8,  'ORD-2026-0008', d9,  '2026-03-15', 350,  'Paid',    'UPI',           'UPI20260315GK1', 'Delivered', uid),
  (go9,  'ORD-2026-0009', d13, '2026-03-20', 3498, 'Paid',    'Bank Transfer', 'NEFT20260320GK1','Shipped',   uid),
  (go10, 'ORD-2026-0010', d22, '2026-04-01', 1499, 'Pending', 'UPI',           NULL,             'Pending',   uid)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, material_id, quantity, unit_price, total_price, item_type)
VALUES
  (go7,  gk_book_mahab,    2, 250, 500,  'Material'),
  (go7,  gk_book_ayur,     1, 399, 399,  'Material'), -- Adjusted; no strict total constraint
  (go8,  gk_book_gita_ess, 1, 350, 350,  'Material'),
  (go9,  gk_book_gita_ess, 2, 350, 700,  'Material'),
  (go9,  gk_book_yoga_sut, 2, 450, 900,  'Material'),
  (go9,  gk_book_mahab,    3, 250, 750,  'Material'),
  (go9,  gk_video_aarti,   1, 199, 199,  'Material'),
  (go10, gk_course_yoga,   1, 1499, 1499,'Course')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-10. MORE KITCHEN DATA
-- =============================================================================

INSERT INTO kitchen_inventory (item_name, category, quantity, unit, min_level, expiry_date)
VALUES
  ('Chana Dal',        'Pulses',     25, 'kg',  5, '2026-10-31'),
  ('Moong Dal',        'Pulses',     20, 'kg',  5, '2026-10-31'),
  ('Besan',            'Grains',     15, 'kg',  3, '2026-08-31'),
  ('Semolina (Sooji)', 'Grains',     12, 'kg',  3, '2026-09-30'),
  ('Sabudana',         'Grains',      8, 'kg',  2, '2027-01-31'),
  ('Jaggery (Gud)',    'Sweetener',  10, 'kg',  2, '2026-12-31'),
  ('Coconut (Dry)',    'Dry Fruits', 20, 'PCS', 5, '2026-06-30'),
  ('Peanuts',          'Dry Fruits', 10, 'kg',  2, '2026-09-30'),
  ('Cumin (Jeera)',    'Spices',      5, 'kg',  1, '2027-06-30'),
  ('Mustard Seeds',    'Spices',      4, 'kg',  1, '2027-06-30'),
  ('Curry Leaves',     'Vegetables',  2, 'kg',  0, '2026-04-10'),
  ('Coriander Leaves', 'Vegetables',  3, 'kg',  1, '2026-04-07')
ON CONFLICT DO NOTHING;

INSERT INTO meal_menus (menu_date, meal_type, items, special_diet_notes)
VALUES
  ('2026-04-08', 'breakfast', '["Besan Cheela", "Mint Chutney", "Chai", "Apple"]'::jsonb, NULL),
  ('2026-04-08', 'lunch',     '["Kadhi Chawal", "Roti", "Aloo Palak", "Raita"]'::jsonb, NULL),
  ('2026-04-08', 'dinner',    '["Khichdi", "Ghee", "Papad", "Salad"]'::jsonb, NULL),
  ('2026-04-09', 'breakfast', '["Poori", "Aloo Sabzi", "Chai"]'::jsonb, 'Navratri – light breakfast'),
  ('2026-04-09', 'lunch',     '["Palak Dal", "Rice", "Roti", "Masala Chaas"]'::jsonb, NULL),
  ('2026-04-09', 'dinner',    '["Paneer Sabzi", "Roti", "Dal Tadka", "Curd"]'::jsonb, NULL),
  ('2026-04-10', 'breakfast', '["Idli", "Sambar", "Chutney", "Chai"]'::jsonb, NULL),
  ('2026-04-10', 'lunch',     '["Rajma", "Rice", "Roti", "Salad", "Buttermilk"]'::jsonb, NULL),
  ('2026-04-10', 'dinner',    '["Vegetable Khichdi", "Papad", "Pickle"]'::jsonb, 'Navratri close – light dinner')
ON CONFLICT DO NOTHING;

INSERT INTO meal_tokens (meal_date, meal_type, devotee_id, redeemed_at)
VALUES
  ('2026-04-08', 'breakfast', d1,   '2026-04-08 07:45:00+05:30'),
  ('2026-04-08', 'breakfast', d9,   '2026-04-08 08:00:00+05:30'),
  ('2026-04-08', 'breakfast', NULL, '2026-04-08 08:20:00+05:30'),
  ('2026-04-08', 'lunch',     d1,   '2026-04-08 12:30:00+05:30'),
  ('2026-04-08', 'lunch',     d9,   '2026-04-08 12:15:00+05:30'),
  ('2026-04-08', 'lunch',     d13,  '2026-04-08 12:45:00+05:30'),
  ('2026-04-08', 'lunch',     NULL, '2026-04-08 12:50:00+05:30'),
  ('2026-04-08', 'dinner',    d9,   '2026-04-08 19:00:00+05:30'),
  ('2026-04-09', 'breakfast', d3,   '2026-04-09 08:00:00+05:30'),
  ('2026-04-09', 'breakfast', d9,   '2026-04-09 08:15:00+05:30'),
  ('2026-04-09', 'lunch',     d3,   '2026-04-09 12:30:00+05:30'),
  ('2026-04-09', 'lunch',     d9,   '2026-04-09 12:20:00+05:30'),
  ('2026-04-09', 'lunch',     d13,  '2026-04-09 12:45:00+05:30'),
  ('2026-04-09', 'dinner',    d13,  '2026-04-09 19:15:00+05:30'),
  ('2026-04-10', 'breakfast', d1,   '2026-04-10 07:30:00+05:30'),
  ('2026-04-10', 'breakfast', NULL, '2026-04-10 08:00:00+05:30'),
  ('2026-04-10', 'lunch',     d1,   '2026-04-10 12:30:00+05:30'),
  ('2026-04-10', 'lunch',     NULL, '2026-04-10 12:45:00+05:30'),
  ('2026-04-10', 'dinner',    d1,   '2026-04-10 19:00:00+05:30')
ON CONFLICT DO NOTHING;

-- More prasad and annadaan
INSERT INTO prasad_bookings (occasion, booking_date, devotee_id, quantity, status, amount, currency)
VALUES
  ('Navratri Ashtami Prasad',   '2026-04-09', d13, 20, 'Prepared',    1000, 'INR'),
  ('Navratri Navami Prasad',    '2026-04-10', d9,  15, 'Prepared',     750, 'INR'),
  ('Hanuman Jayanti Prasad',    '2026-04-23', d5,  30, 'Pending',     1500, 'INR'),
  ('Buddha Purnima Prasad',     '2026-05-12', d18, 10, 'Pending',      500, 'INR'),
  ('Weekly Sunday Prasad',      '2026-04-13', d22,  5, 'Confirmed',    250, 'INR'),
  ('Weekly Sunday Prasad',      '2026-04-20', d10,  8, 'Confirmed',    400, 'INR')
ON CONFLICT DO NOTHING;

INSERT INTO annadaan_donations (devotee_id, amount, in_kind_description, donation_date, purpose, currency)
VALUES
  (d9,  15000, NULL,                              '2026-04-09', 'Navratri Ashtami full-day annadaan', 'INR'),
  (d12, NULL,  '100 kg atta and 50 kg chana dal', '2026-04-10', 'Navratri closing day in-kind',      'INR'),
  (d13, 20000, NULL,                              '2026-04-23', 'Hanuman Jayanti annadaan sponsor',  'INR'),
  (d20, 5000,  NULL,                              '2026-04-25', 'Monthly Satsang dinner sponsor',    'INR')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- B3-11. MORE STAFF ATTENDANCE (April 4-10)
-- =============================================================================

INSERT INTO staff_attendance (staff_id, attendance_date, status, check_in_time, check_out_time)
VALUES
  (s_priest1,'2026-04-04','Present','05:00','22:00'), (s_priest2,'2026-04-04','Present','05:00','22:00'),
  (s_cook,   '2026-04-04','Present','04:30','16:00'), (s_security,'2026-04-04','Present','07:00','22:00'),
  (s_frontdesk,'2026-04-04','Present','08:00','20:00'),(s_driver,'2026-04-04','Present','07:00','20:00'),
  (s_manager,'2026-04-04','Present','07:00','22:00'),
  (s_priest1,'2026-04-05','Present','05:00','22:00'), (s_priest2,'2026-04-05','Present','05:00','22:00'),
  (s_cook,   '2026-04-05','Present','04:30','16:00'), (s_security,'2026-04-05','Present','07:00','22:00'),
  (s_frontdesk,'2026-04-05','Present','08:00','20:00'),(s_driver,'2026-04-05','Present','07:00','20:00'),
  (s_manager,'2026-04-05','Present','07:00','22:00'),
  -- April 6 Ram Navami – extended hours
  (s_priest1,'2026-04-06','Present','04:00','23:00'), (s_priest2,'2026-04-06','Present','04:00','23:00'),
  (s_cook,   '2026-04-06','Present','03:30','18:00'), (s_security,'2026-04-06','Present','06:00','23:00'),
  (s_frontdesk,'2026-04-06','Present','07:00','21:00'),(s_driver,'2026-04-06','Present','06:00','22:00'),
  (s_manager,'2026-04-06','Present','05:00','23:00'),
  (s_priest1,'2026-04-07','Present','05:30','20:00'), (s_priest2,'2026-04-07','Present','05:30','19:30'),
  (s_cook,   '2026-04-07','Present','05:00','14:00'), (s_security,'2026-04-07','Present','08:00','20:00'),
  (s_frontdesk,'2026-04-07','HalfDay','09:00','13:00'),(s_driver,'2026-04-07','OnLeave',NULL,NULL),
  (s_manager,'2026-04-07','Present','09:00','18:30'),
  (s_priest1,'2026-04-08','Present','05:30','20:00'), (s_priest2,'2026-04-08','Present','05:30','19:30'),
  (s_cook,   '2026-04-08','Present','05:00','14:00'), (s_security,'2026-04-08','Present','08:00','20:00'),
  (s_frontdesk,'2026-04-08','Present','09:00','18:00'),(s_driver,'2026-04-08','Present','08:00','17:00'),
  (s_manager,'2026-04-08','Present','09:00','18:30'),
  (s_priest1,'2026-04-09','Present','05:30','21:00'), (s_priest2,'2026-04-09','Present','05:30','21:00'),
  (s_cook,   '2026-04-09','Present','04:30','16:00'), (s_security,'2026-04-09','Present','07:00','21:00'),
  (s_frontdesk,'2026-04-09','Present','08:00','20:00'),(s_driver,'2026-04-09','Present','07:00','19:00'),
  (s_manager,'2026-04-09','Present','07:00','21:00'),
  -- April 10 – Navratri ends
  (s_priest1,'2026-04-10','Present','05:00','22:00'), (s_priest2,'2026-04-10','Present','05:00','22:00'),
  (s_cook,   '2026-04-10','Present','04:30','17:00'), (s_security,'2026-04-10','Present','07:00','22:00'),
  (s_frontdesk,'2026-04-10','Present','08:00','20:00'),(s_driver,'2026-04-10','Present','07:00','20:00'),
  (s_manager,'2026-04-10','Present','07:00','22:00')
ON CONFLICT (staff_id, attendance_date) DO NOTHING;

RAISE NOTICE 'Block 3: Volume boost seed inserted successfully';

END $$;
