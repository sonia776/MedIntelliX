/**
 * MedIntelliX Hospital Portal Routes
 * Developed by: Sonia (Backend Architecture & Healthcare APIs)
 */

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const db = require("../config/database");

// Require authentication & hospital role (or government overview)
router.use(authenticate);
router.use(authorize("hospital", "government"));

/**
 * @route   GET /api/hospital/dashboard
 * @desc    Get hospital administrative metrics
 * @access  Private (Hospital, Government)
 */
router.get("/dashboard", async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                hospital_name: req.user.organisation_name || "City Central Medical Center",
                active_patients: 142,
                available_beds: 38,
                total_doctors: 24,
                today_appointments: 19,
                emergency_queue: 3
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/hospital/patients
 * @desc    Get list of registered patients
 * @access  Private (Hospital)
 */
router.get("/patients", async (req, res, next) => {
    try {
        const store = require("../config/database");
        // Mock patient list
        res.status(200).json({
            success: true,
            patients: [
                {
                    id: "usr_pat_alex_001",
                    name: "Alex Morgan",
                    gender: "Male",
                    age: 34,
                    blood_group: "O+",
                    last_visit: "2026-10-10",
                    condition: "Stable (Under Observation)"
                },
                {
                    id: "usr_pat_002",
                    name: "Priya Sharma",
                    gender: "Female",
                    age: 28,
                    blood_group: "B+",
                    last_visit: "2026-10-22",
                    condition: "Post-op Followup"
                }
            ]
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
