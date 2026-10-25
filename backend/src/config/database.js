/**
 * MedIntelliX Database Service
 * Developed by: Sonia (Backend Architecture & Database Engineering)
 * Tech Stack: PostgreSQL (Matching PDF Category 1) with High-Speed Persistent Fallback
 * Compatible with: Supabase (PostgreSQL), Render PostgreSQL, Neon PostgreSQL, Local PostgreSQL
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DATA_DIR = isServerless ? path.join("/tmp", "medintellix-data") : path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Safely ensure local data directory exists without crashing on read-only filesystems
try {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
} catch (e) {
    console.warn("[Database] Read-only filesystem detected, using in-memory fallback:", e.message);
}

// Global PostgreSQL Pool
let pgPool = null;
let isPostgresConnected = false;

function getPgPool() {
    if (pgPool) return pgPool;

    const connectionString = process.env.DATABASE_URL;
    if (connectionString && (connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://"))) {
        const isRemote = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
        pgPool = new Pool({
            connectionString,
            ssl: isRemote ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 4000
        });

        // Error listener to prevent unhandled process crashes
        pgPool.on("error", (err) => {
            console.warn("[PostgreSQL Pool Notice]:", err.message);
            isPostgresConnected = false;
        });
    }
    return pgPool;
}

// Initial seed data for local storage
function getInitialSeedData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync("Password123!", salt);

    return {
        users: [
            {
                id: "usr_pat_alex_001",
                full_name: "Alex Morgan",
                email: "alex@medintellix.com",
                password_hash: demoPasswordHash,
                role: "patient",
                organisation_name: null,
                institution_id: null,
                phone: "+1-555-0199",
                is_verified: true,
                created_at: new Date().toISOString()
            },
            {
                id: "usr_hosp_city_002",
                full_name: "Dr. Sarah Jenkins",
                email: "hospital@medintellix.com",
                password_hash: demoPasswordHash,
                role: "hospital",
                organisation_name: "City Central Medical Center",
                institution_id: "HOSP-IND-90812",
                phone: "+1-555-0245",
                is_verified: true,
                created_at: new Date().toISOString()
            },
            {
                id: "usr_gov_moh_003",
                full_name: "Rajesh Kumar",
                email: "government@medintellix.gov",
                password_hash: demoPasswordHash,
                role: "government",
                organisation_name: "Ministry of Health & Public Welfare",
                institution_id: "GOV-DEP-44910",
                phone: "+1-555-0382",
                is_verified: true,
                created_at: new Date().toISOString()
            }
        ],
        patient_profiles: [
            {
                id: "prof_alex_001",
                user_id: "usr_pat_alex_001",
                date_of_birth: "1992-05-14",
                gender: "Male",
                blood_group: "O+",
                emergency_contact_name: "Emma Morgan",
                emergency_contact_phone: "+1-555-0921",
                allergies: "Penicillin, Pollen",
                chronic_conditions: "Mild Asthma"
            }
        ],
        appointments: [
            {
                id: "apt_101",
                patient_id: "usr_pat_alex_001",
                patient_name: "Alex Morgan",
                doctor_name: "Dr. Rachel Green",
                department: "Cardiology",
                hospital_name: "City Central Hospital",
                appointment_date: "2026-11-02",
                appointment_time: "10:30 AM",
                type: "In-Person",
                status: "Confirmed",
                reason: "Regular cardiac review and blood pressure check"
            },
            {
                id: "apt_102",
                patient_id: "usr_pat_alex_001",
                patient_name: "Alex Morgan",
                doctor_name: "Dr. Michael Chen",
                department: "Pulmonology",
                hospital_name: "Apex Healthcare Clinic",
                appointment_date: "2026-11-15",
                appointment_time: "02:00 PM",
                type: "Video Consultation",
                status: "Scheduled",
                reason: "Asthma management follow-up"
            }
        ],
        medications: [
            {
                id: "med_201",
                patient_id: "usr_pat_alex_001",
                medication_name: "Atorvastatin",
                dosage: "20mg",
                frequency: "Once daily",
                timing: "At bedtime",
                prescribed_by: "Dr. Rachel Green",
                start_date: "2026-09-01",
                end_date: "2026-12-01",
                status: "Active",
                instructions: "Take with water at bedtime"
            },
            {
                id: "med_202",
                patient_id: "usr_pat_alex_001",
                medication_name: "Albuterol Inhaler",
                dosage: "90mcg",
                frequency: "As needed",
                timing: "Before exercise or symptoms",
                prescribed_by: "Dr. Michael Chen",
                start_date: "2026-08-15",
                end_date: "2027-08-15",
                status: "Active",
                instructions: "2 puffs every 4-6 hours as needed for wheezing"
            }
        ],
        medical_records: [
            {
                id: "rec_301",
                patient_id: "usr_pat_alex_001",
                title: "Complete Blood Count & Lipid Profile",
                category: "Lab Report",
                facility_name: "City Central Pathology",
                doctor_name: "Dr. Rachel Green",
                record_date: "2026-10-10",
                file_url: "#",
                summary: "Lipid panel shows total cholesterol 182 mg/dL. Normal range.",
                ai_insights: "AI Verified: Cholesterol levels are well managed under current statin regimen."
            },
            {
                id: "rec_302",
                patient_id: "usr_pat_alex_001",
                title: "Chest X-Ray (PA View)",
                category: "Imaging",
                facility_name: "City Diagnostic Imaging",
                doctor_name: "Dr. Sarah Jenkins",
                record_date: "2026-08-14",
                file_url: "#",
                summary: "Clear lung fields, no active infiltrates or effusion.",
                ai_insights: "Normal chest radiograph, no signs of acute pulmonary infection."
            }
        ],
        audit_logs: [],
        notifications: []
    };
}

let inMemoryStore = null;

// Local fallback store
function loadLocalDb() {
    if (inMemoryStore) {
        return inMemoryStore;
    }

    try {
        if (!fs.existsSync(DB_FILE)) {
            const seed = getInitialSeedData();
            try {
                if (!fs.existsSync(DATA_DIR)) {
                    fs.mkdirSync(DATA_DIR, { recursive: true });
                }
                fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
            } catch (writeErr) {
                // Ignore write failures in read-only environments
            }
            inMemoryStore = seed;
            return inMemoryStore;
        }
        const raw = fs.readFileSync(DB_FILE, "utf8");
        inMemoryStore = JSON.parse(raw);
        return inMemoryStore;
    } catch (err) {
        console.warn("[Database] Error reading local db, reverting to in-memory seed:", err.message);
        if (!inMemoryStore) {
            inMemoryStore = getInitialSeedData();
        }
        return inMemoryStore;
    }
}

function saveLocalDb(data) {
    inMemoryStore = data;
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        // Read-only filesystem (e.g. Vercel serverless), in-memory cache preserves data during execution
    }
}

const db = {
    // Test PostgreSQL or fallback
    async testConnection() {
        console.log("=========================================");
        console.log("  MedIntelliX Database Architecture");
        console.log("  Developer: Sonia");
        console.log("  Database Tech Stack: PostgreSQL (pg)");

        const pool = getPgPool();
        if (pool) {
            try {
                const client = await pool.connect();
                await client.query("SELECT 1;");
                client.release();
                isPostgresConnected = true;
                console.log("  STATUS: 🟢 Connected to Live PostgreSQL Database!");
                console.log("=========================================");
                return true;
            } catch (err) {
                isPostgresConnected = false;
                console.log("  STATUS: 🟡 Remote PostgreSQL not reachable: " + err.message);
                console.log("  STATUS: 🟢 Running in High-Speed Local Persistent Store (db.json active)");
                console.log("=========================================");
                return false;
            }
        } else {
            isPostgresConnected = false;
            console.log("  STATUS: 🟡 No DATABASE_URL specified.");
            console.log("  STATUS: 🟢 Running in High-Speed Local Persistent Store (db.json active)");
            console.log("=========================================");
            return false;
        }
    },

    // User Operations
    async findUserByEmail(email) {
        const normalized = email.trim().toLowerCase();
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [normalized]);
                if (res.rows.length > 0) return res.rows[0];
            } catch (e) {
                console.warn("[PostgreSQL Query Fallback - findUserByEmail]:", e.message);
            }
        }
        const store = loadLocalDb();
        return store.users.find((u) => u.email.toLowerCase() === normalized) || null;
    },

    async findUserById(id) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const res = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
                if (res.rows.length > 0) return res.rows[0];
            } catch (e) {
                console.warn("[PostgreSQL Query Fallback - findUserById]:", e.message);
            }
        }
        const store = loadLocalDb();
        return store.users.find((u) => u.id === id) || null;
    },

    async createUser(userData) {
        const id = "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const newUser = {
            id,
            full_name: userData.full_name,
            email: userData.email.trim().toLowerCase(),
            password_hash: userData.password_hash,
            role: userData.role,
            organisation_name: userData.organisation_name || null,
            institution_id: userData.institution_id || null,
            phone: userData.phone || null,
            is_verified: true,
            created_at: new Date().toISOString()
        };

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                await pool.query(
                    `INSERT INTO users (id, full_name, email, password_hash, role, organisation_name, institution_id, phone, is_verified)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        newUser.id,
                        newUser.full_name,
                        newUser.email,
                        newUser.password_hash,
                        newUser.role,
                        newUser.organisation_name,
                        newUser.institution_id,
                        newUser.phone,
                        newUser.is_verified
                    ]
                );
                if (newUser.role === "patient") {
                    await pool.query(
                        `INSERT INTO patient_profiles (id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        ["prof_" + Date.now(), newUser.id]
                    );
                }
                return newUser;
            } catch (e) {
                console.warn("[PostgreSQL Insert Fallback - createUser]:", e.message);
            }
        }

        // Local Store Fallback
        const store = loadLocalDb();
        store.users.push(newUser);
        if (userData.role === "patient") {
            store.patient_profiles.push({
                id: "prof_" + Date.now(),
                user_id: id,
                date_of_birth: null,
                gender: null,
                blood_group: null
            });
        }
        saveLocalDb(store);
        return newUser;
    },

    // Patient Dashboard
    async getPatientDashboardData(userId) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const userRes = await pool.query("SELECT id, full_name, email, role FROM users WHERE id = $1", [userId]);
                const profRes = await pool.query("SELECT * FROM patient_profiles WHERE user_id = $1", [userId]);
                const aptRes = await pool.query("SELECT * FROM appointments WHERE patient_id = $1 ORDER BY appointment_date ASC", [userId]);
                const medRes = await pool.query("SELECT * FROM medications WHERE patient_id = $1", [userId]);
                const recRes = await pool.query("SELECT * FROM medical_records WHERE patient_id = $1", [userId]);

                const records = recRes.rows || [];
                const medications = medRes.rows || [];
                const appointments = aptRes.rows || [];

                return {
                    user: userRes.rows[0] || null,
                    profile: profRes.rows[0] || {},
                    statistics: {
                        records: records.length,
                        reports: records.filter((r) => (r.category || "").includes("Report")).length,
                        medications: medications.filter((m) => m.status === "Active").length,
                        appointments: appointments.filter((a) => a.status === "Confirmed" || a.status === "Scheduled").length
                    },
                    recentAppointments: appointments.slice(0, 5),
                    medications: medications.slice(0, 5),
                    records: records.slice(0, 5)
                };
            } catch (e) {
                console.warn("[PostgreSQL Query Fallback - getPatientDashboardData]:", e.message);
            }
        }

        const store = loadLocalDb();
        const user = store.users.find((u) => u.id === userId);
        const profile = store.patient_profiles.find((p) => p.user_id === userId) || {};
        const appointments = store.appointments.filter((a) => a.patient_id === userId);
        const medications = store.medications.filter((m) => m.patient_id === userId);
        const records = store.medical_records.filter((r) => r.patient_id === userId);

        return {
            user: user
                ? {
                      id: user.id,
                      full_name: user.full_name,
                      email: user.email,
                      role: user.role
                  }
                : null,
            profile,
            statistics: {
                records: records.length,
                reports: records.filter((r) => (r.category || "").includes("Report")).length,
                medications: medications.filter((m) => m.status === "Active").length,
                appointments: appointments.filter((a) => a.status === "Confirmed" || a.status === "Scheduled").length
            },
            recentAppointments: appointments.slice(0, 5),
            medications: medications.slice(0, 5),
            records: records.slice(0, 5)
        };
    },

    async getPatientProfile(userId) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const userRes = await pool.query("SELECT id, full_name, email, role, phone FROM users WHERE id = $1", [userId]);
                const profRes = await pool.query("SELECT * FROM patient_profiles WHERE user_id = $1", [userId]);
                return {
                    user: userRes.rows[0] || null,
                    profile: profRes.rows[0] || {}
                };
            } catch (e) {
                console.warn("[PostgreSQL Query Fallback - getPatientProfile]:", e.message);
            }
        }

        const store = loadLocalDb();
        const user = store.users.find((u) => u.id === userId);
        const profile = store.patient_profiles.find((p) => p.user_id === userId) || {};
        return {
            user: user
                ? {
                      id: user.id,
                      full_name: user.full_name,
                      email: user.email,
                      role: user.role,
                      phone: user.phone || ""
                  }
                : null,
            profile
        };
    },

    async updatePatientProfile(userId, data) {
        const {
            fullName,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            emergencyName,
            relationship,
            emergencyPhone,
            address,
            allergies,
            chronicConditions
        } = data;

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                if (fullName || phone !== undefined) {
                    await pool.query(
                        `UPDATE users 
                         SET full_name = COALESCE($1, full_name), 
                             phone = COALESCE($2, phone), 
                             updated_at = CURRENT_TIMESTAMP 
                         WHERE id = $3`,
                        [fullName || null, phone || null, userId]
                    );
                }

                await pool.query(
                    `INSERT INTO patient_profiles 
                     (id, user_id, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                     ON CONFLICT (user_id) DO UPDATE SET 
                         date_of_birth = COALESCE(EXCLUDED.date_of_birth, patient_profiles.date_of_birth),
                         gender = COALESCE(EXCLUDED.gender, patient_profiles.gender),
                         blood_group = COALESCE(EXCLUDED.blood_group, patient_profiles.blood_group),
                         emergency_contact_name = COALESCE(EXCLUDED.emergency_contact_name, patient_profiles.emergency_contact_name),
                         emergency_contact_phone = COALESCE(EXCLUDED.emergency_contact_phone, patient_profiles.emergency_contact_phone),
                         allergies = COALESCE(EXCLUDED.allergies, patient_profiles.allergies),
                         chronic_conditions = COALESCE(EXCLUDED.chronic_conditions, patient_profiles.chronic_conditions)`,
                    [
                        `prof_${Date.now()}`,
                        userId,
                        dateOfBirth || null,
                        gender || null,
                        bloodGroup || null,
                        emergencyName || null,
                        emergencyPhone || null,
                        allergies || null,
                        chronicConditions || null
                    ]
                );

                const userRes = await pool.query("SELECT id, full_name, email, role, phone FROM users WHERE id = $1", [userId]);
                const profRes = await pool.query("SELECT * FROM patient_profiles WHERE user_id = $1", [userId]);
                return {
                    user: userRes.rows[0] || null,
                    profile: profRes.rows[0] || {}
                };
            } catch (e) {
                console.warn("[PostgreSQL Query Fallback - updatePatientProfile]:", e.message);
            }
        }

        const store = loadLocalDb();
        const userIndex = store.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
            if (fullName) store.users[userIndex].full_name = fullName.trim();
            if (phone !== undefined) store.users[userIndex].phone = phone ? phone.trim() : null;
        }

        let profIndex = store.patient_profiles.findIndex((p) => p.user_id === userId);
        if (profIndex === -1) {
            const newProf = {
                id: `prof_${Date.now()}`,
                user_id: userId,
                date_of_birth: dateOfBirth || null,
                gender: gender || null,
                blood_group: bloodGroup || null,
                emergency_contact_name: emergencyName || null,
                emergency_contact_phone: emergencyPhone || null,
                relationship: relationship || null,
                address: address || null,
                allergies: allergies || null,
                chronic_conditions: chronicConditions || null
            };
            store.patient_profiles.push(newProf);
            profIndex = store.patient_profiles.length - 1;
        } else {
            const current = store.patient_profiles[profIndex];
            store.patient_profiles[profIndex] = {
                ...current,
                date_of_birth: dateOfBirth !== undefined ? dateOfBirth : current.date_of_birth,
                gender: gender !== undefined ? gender : current.gender,
                blood_group: bloodGroup !== undefined ? bloodGroup : current.blood_group,
                emergency_contact_name: emergencyName !== undefined ? emergencyName : current.emergency_contact_name,
                emergency_contact_phone: emergencyPhone !== undefined ? emergencyPhone : current.emergency_contact_phone,
                relationship: relationship !== undefined ? relationship : current.relationship,
                address: address !== undefined ? address : current.address,
                allergies: allergies !== undefined ? allergies : current.allergies,
                chronic_conditions: chronicConditions !== undefined ? chronicConditions : current.chronic_conditions
            };
        }

        saveLocalDb(store);

        const updatedUser = store.users.find((u) => u.id === userId);
        const updatedProfile = store.patient_profiles[profIndex];
        return {
            user: updatedUser
                ? {
                      id: updatedUser.id,
                      full_name: updatedUser.full_name,
                      email: updatedUser.email,
                      role: updatedUser.role,
                      phone: updatedUser.phone || ""
                  }
                : null,
            profile: updatedProfile
        };
    },

    // Appointments
    async getAppointments(userId, role) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const res =
                    role === "patient"
                        ? await pool.query("SELECT * FROM appointments WHERE patient_id = $1 ORDER BY appointment_date ASC", [userId])
                        : await pool.query("SELECT * FROM appointments ORDER BY appointment_date ASC");
                return res.rows;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - getAppointments]:", e.message);
            }
        }
        const store = loadLocalDb();
        return role === "patient" ? store.appointments.filter((a) => a.patient_id === userId) : store.appointments;
    },

    async createAppointment(appointmentData) {
        const id = "apt_" + Date.now();
        const newApt = {
            id,
            ...appointmentData,
            status: "Confirmed",
            created_at: new Date().toISOString()
        };

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                await pool.query(
                    `INSERT INTO appointments (id, patient_id, patient_name, doctor_name, department, hospital_name, appointment_date, appointment_time, type, status, reason)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        newApt.id,
                        newApt.patient_id,
                        newApt.patient_name,
                        newApt.doctor_name,
                        newApt.department,
                        newApt.hospital_name,
                        newApt.appointment_date,
                        newApt.appointment_time,
                        newApt.type,
                        newApt.status,
                        newApt.reason
                    ]
                );
                return newApt;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - createAppointment]:", e.message);
            }
        }

        const store = loadLocalDb();
        store.appointments.push(newApt);
        saveLocalDb(store);
        return newApt;
    },

    // Medications
    async getMedications(userId) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const res = await pool.query("SELECT * FROM medications WHERE patient_id = $1", [userId]);
                return res.rows;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - getMedications]:", e.message);
            }
        }
        const store = loadLocalDb();
        return store.medications.filter((m) => m.patient_id === userId);
    },

    async addMedication(medData) {
        const id = "med_" + Date.now();
        const newMed = {
            id,
            ...medData,
            status: "Active",
            created_at: new Date().toISOString()
        };

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                await pool.query(
                    `INSERT INTO medications (id, patient_id, medication_name, dosage, frequency, timing, prescribed_by, status, instructions)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        newMed.id,
                        newMed.patient_id,
                        newMed.medication_name,
                        newMed.dosage,
                        newMed.frequency,
                        newMed.timing,
                        newMed.prescribed_by,
                        newMed.status,
                        newMed.instructions
                    ]
                );
                return newMed;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - addMedication]:", e.message);
            }
        }

        const store = loadLocalDb();
        store.medications.push(newMed);
        saveLocalDb(store);
        return newMed;
    },

    // Medical Records
    async getMedicalRecords(userId) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const res = await pool.query("SELECT * FROM medical_records WHERE patient_id = $1", [userId]);
                return res.rows;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - getMedicalRecords]:", e.message);
            }
        }
        const store = loadLocalDb();
        return store.medical_records.filter((r) => r.patient_id === userId);
    },

    async addMedicalRecord(recData) {
        const id = "rec_" + Date.now();
        const newRec = {
            id,
            ...recData,
            created_at: new Date().toISOString()
        };

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                await pool.query(
                    `INSERT INTO medical_records (id, patient_id, title, category, facility_name, doctor_name, record_date, file_url, summary, ai_insights)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        newRec.id,
                        newRec.patient_id,
                        newRec.title,
                        newRec.category,
                        newRec.facility_name,
                        newRec.doctor_name,
                        newRec.record_date,
                        newRec.file_url,
                        newRec.summary,
                        newRec.ai_insights
                    ]
                );
                return newRec;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - addMedicalRecord]:", e.message);
            }
        }

        const store = loadLocalDb();
        store.medical_records.push(newRec);
        saveLocalDb(store);
        return newRec;
    },

    // Audit Logging
    async logAudit(log) {
        try {
            const id = "log_" + Date.now();
            if (isPostgresConnected) {
                const pool = getPgPool();
                await pool.query(
                    `INSERT INTO audit_logs (id, user_id, user_email, role, action, resource, ip_address)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [id, log.user_id, log.user_email, log.role, log.action, log.resource, log.ip_address]
                );
                return;
            }
            const store = loadLocalDb();
            store.audit_logs.push({
                id,
                ...log,
                timestamp: new Date().toISOString()
            });
            if (store.audit_logs.length > 1000) store.audit_logs.shift();
            saveLocalDb(store);
        } catch (e) {
            console.error("Audit log error:", e.message);
        }
    },

    // ==========================================================
    // NOTIFICATIONS & ALERTS (Category 6: APIs & External Integrations)
    // Developer: Sonia
    // ==========================================================

    async createNotification(notifData) {
        const id = notifData.id || "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const record = {
            id,
            user_id: notifData.user_id,
            type: notifData.type,
            channel: notifData.channel,
            recipient_email: notifData.recipient_email || null,
            recipient_phone: notifData.recipient_phone || null,
            title: notifData.title,
            message: notifData.message,
            status: notifData.status || "SENT",
            metadata: notifData.metadata || {},
            is_read: false,
            created_at: new Date().toISOString()
        };

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                await pool.query(
                    `INSERT INTO notifications (id, user_id, type, channel, recipient_email, recipient_phone, title, message, status, metadata, is_read, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [
                        record.id,
                        record.user_id,
                        record.type,
                        record.channel,
                        record.recipient_email,
                        record.recipient_phone,
                        record.title,
                        record.message,
                        record.status,
                        JSON.stringify(record.metadata),
                        record.is_read,
                        record.created_at
                    ]
                );
                return record;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - createNotification]:", e.message);
            }
        }

        const store = loadLocalDb();
        if (!store.notifications) store.notifications = [];
        store.notifications.unshift(record);
        if (store.notifications.length > 500) store.notifications.pop();
        saveLocalDb(store);
        return record;
    },

    async getNotifications(userId = null, userEmail = null, limit = 20) {
        if (!userId && !userEmail) {
            return [];
        }

        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const conditions = [];
                const params = [];
                if (userId) {
                    params.push(userId);
                    conditions.push(`user_id = $${params.length}`);
                }
                if (userEmail) {
                    params.push(userEmail.toLowerCase());
                    conditions.push(`LOWER(recipient_email) = $${params.length}`);
                }

                params.push(limit);
                const res = await pool.query(
                    `SELECT * FROM notifications 
                     WHERE (${conditions.join(" OR ")}) 
                     ORDER BY created_at DESC LIMIT $${params.length}`,
                    params
                );
                return res.rows;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - getNotifications]:", e.message);
            }
        }

        const store = loadLocalDb();
        if (!store.notifications) store.notifications = [];
        return store.notifications
            .filter((n) => {
                if (userId && n.user_id === userId) return true;
                if (userEmail && n.recipient_email && n.recipient_email.toLowerCase() === userEmail.toLowerCase()) return true;
                return false;
            })
            .slice(0, limit);
    },

    async markNotificationAsRead(id, userId) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                const res = await pool.query(
                    `UPDATE notifications SET is_read = TRUE 
                     WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) 
                     RETURNING *`,
                    [id, userId]
                );
                return res.rows[0];
            } catch (e) {
                console.warn("[PostgreSQL Fallback - markNotificationAsRead]:", e.message);
            }
        }

        const store = loadLocalDb();
        if (!store.notifications) store.notifications = [];
        const notif = store.notifications.find((n) => n.id === id && (!n.user_id || n.user_id === userId));
        if (notif) {
            notif.is_read = true;
            saveLocalDb(store);
        }
        return notif;
    },

    async getUpcomingAppointmentsWithUsers(userId = null) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                let query = `
                    SELECT a.*, u.full_name as patient_full_name, u.email as patient_email, u.phone as patient_phone
                    FROM appointments a
                    JOIN users u ON a.patient_id = u.id
                    WHERE a.status IN ('Confirmed', 'Scheduled')
                `;
                const params = [];
                if (userId) {
                    query += ` AND a.patient_id = $1`;
                    params.push(userId);
                }
                query += ` ORDER BY a.appointment_date ASC`;
                const res = await pool.query(query, params);
                return res.rows;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - getUpcomingAppointmentsWithUsers]:", e.message);
            }
        }

        const store = loadLocalDb();
        return store.appointments
            .filter((a) => (a.status === "Confirmed" || a.status === "Scheduled") && (!userId || a.patient_id === userId))
            .map((a) => {
                const u = store.users.find((user) => user.id === a.patient_id);
                return {
                    ...a,
                    patient_full_name: u ? u.full_name : a.patient_name,
                    patient_email: u ? u.email : "",
                    patient_phone: u ? u.phone : ""
                };
            });
    },

    async getActiveMedicationsWithUsers(userId = null) {
        if (isPostgresConnected) {
            try {
                const pool = getPgPool();
                let query = `
                    SELECT m.*, u.full_name as patient_full_name, u.email as patient_email, u.phone as patient_phone
                    FROM medications m
                    JOIN users u ON m.patient_id = u.id
                    WHERE m.status = 'Active'
                `;
                const params = [];
                if (userId) {
                    query += ` AND m.patient_id = $1`;
                    params.push(userId);
                }
                const res = await pool.query(query, params);
                return res.rows;
            } catch (e) {
                console.warn("[PostgreSQL Fallback - getActiveMedicationsWithUsers]:", e.message);
            }
        }

        const store = loadLocalDb();
        return store.medications
            .filter((m) => m.status === "Active" && (!userId || m.patient_id === userId))
            .map((m) => {
                const u = store.users.find((user) => user.id === m.patient_id);
                return {
                    ...m,
                    patient_full_name: u ? u.full_name : "Patient",
                    patient_email: u ? u.email : "",
                    patient_phone: u ? u.phone : ""
                };
            });
    }
};

module.exports = db;
