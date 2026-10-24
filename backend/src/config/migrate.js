/**
 * MedIntelliX PostgreSQL Database Migration Script
 * Developed by: Sonia (Backend & Database Architecture)
 * Executes database/schema.sql against live PostgreSQL (Supabase / Render / Neon / Local)
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("❌ ERROR: DATABASE_URL is not set in backend/.env");
        console.log("👉 Please add your PostgreSQL connection string in backend/.env:");
        console.log("   DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres");
        process.exit(1);
    }

    console.log("⏳ Connecting to PostgreSQL database...");
    
    // SSL is required for hosted PostgreSQL (Supabase, Render, Neon, AWS RDS)
    const isRemote = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
    const pool = new Pool({
        connectionString,
        ssl: isRemote ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to PostgreSQL!");

        const schemaPath = path.join(__dirname, "../../../database/schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf8");

        console.log("⏳ Executing database/schema.sql to build tables...");
        await client.query(schemaSql);
        console.log("✅ All tables created successfully (users, patient_profiles, doctors, appointments, medications, medical_records, audit_logs)!");

        // Check if demo user already exists
        const checkUser = await client.query("SELECT id FROM users WHERE email = $1", ["alex@medintellix.com"]);
        
        if (checkUser.rows.length === 0) {
            console.log("⏳ Seeding initial demo healthcare accounts...");
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash("Password123!", salt);

            // 1. Patient: Alex Morgan
            await client.query(`
                INSERT INTO users (id, full_name, email, password_hash, role, phone, is_verified)
                VALUES ('usr_pat_alex_001', 'Alex Morgan', 'alex@medintellix.com', $1, 'patient', '+1-555-0199', true)
                ON CONFLICT (id) DO NOTHING;
            `, [passwordHash]);

            // Patient Profile
            await client.query(`
                INSERT INTO patient_profiles (id, user_id, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions)
                VALUES ('prof_alex_001', 'usr_pat_alex_001', '1992-05-14', 'Male', 'O+', 'Emma Morgan', '+1-555-0921', 'Penicillin, Pollen', 'Mild Asthma')
                ON CONFLICT (id) DO NOTHING;
            `);

            // 2. Hospital Admin
            await client.query(`
                INSERT INTO users (id, full_name, email, password_hash, role, organisation_name, institution_id, phone, is_verified)
                VALUES ('usr_hosp_city_002', 'Dr. Sarah Jenkins', 'hospital@medintellix.com', $1, 'hospital', 'City Central Medical Center', 'HOSP-IND-90812', '+1-555-0245', true)
                ON CONFLICT (id) DO NOTHING;
            `, [passwordHash]);

            // 3. Government Official
            await client.query(`
                INSERT INTO users (id, full_name, email, password_hash, role, organisation_name, institution_id, phone, is_verified)
                VALUES ('usr_gov_moh_003', 'Rajesh Kumar', 'government@medintellix.gov', $1, 'government', 'Ministry of Health & Public Welfare', 'GOV-DEP-44910', '+1-555-0382', true)
                ON CONFLICT (id) DO NOTHING;
            `, [passwordHash]);

            // 4. Sample Appointment
            await client.query(`
                INSERT INTO appointments (id, patient_id, patient_name, doctor_name, department, hospital_name, appointment_date, appointment_time, type, status, reason)
                VALUES ('apt_101', 'usr_pat_alex_001', 'Alex Morgan', 'Dr. Rachel Green', 'Cardiology', 'City Central Hospital', '2026-11-02', '10:30 AM', 'In-Person', 'Confirmed', 'Regular cardiac review')
                ON CONFLICT (id) DO NOTHING;
            `);

            // 5. Sample Medication
            await client.query(`
                INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, timing, prescribed_by, start_date, end_date, status, instructions)
                VALUES ('med_201', 'usr_pat_alex_001', 'Atorvastatin', '20mg', 'Once daily', 'At bedtime', 'Dr. Rachel Green', '2026-09-01', '2026-12-01', 'Active', 'Take with water at bedtime')
                ON CONFLICT (id) DO NOTHING;
            `);

            console.log("✅ Demo seed data successfully inserted!");
        } else {
            console.log("ℹ️ Demo seed data already present in PostgreSQL database.");
        }

        client.release();
        await pool.end();
        console.log("🎉 Database migration completed with 100% success!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed with error:", err.message);
        process.exit(1);
    }
}

runMigration();
