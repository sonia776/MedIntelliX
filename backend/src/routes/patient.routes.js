/**
 * MedIntelliX Patient Portal Routes
 * Developed by: Sonia (Backend Architecture & Healthcare APIs)
 */

const express = require("express");
const router = express.Router();
const db = require("../config/database");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// Protect all patient routes with authenticate & authorize('patient')
router.use(authenticate);

/**
 * @route   GET /api/patient/dashboard
 * @desc    Get patient dashboard summary (stats, recent appointments, medications)
 * @access  Private (Patient)
 */
router.get("/dashboard", async (req, res, next) => {
    try {
        const data = await db.getPatientDashboardData(req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/patient/appointments
 * @desc    Get patient appointments list
 * @access  Private (Patient)
 */
router.get("/appointments", async (req, res, next) => {
    try {
        const appointments = await db.getAppointments(req.user.id, "patient");
        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/patient/appointments
 * @desc    Book a new appointment
 * @access  Private (Patient)
 */
router.post("/appointments", async (req, res, next) => {
    try {
        const { doctor_name, department, hospital_name, appointment_date, appointment_time, type, reason } = req.body;

        if (!doctor_name || !appointment_date || !appointment_time) {
            return res.status(400).json({
                success: false,
                message: "Doctor name, appointment date, and time are required."
            });
        }

        const newApt = await db.createAppointment({
            patient_id: req.user.id,
            patient_name: req.user.full_name,
            doctor_name,
            department: department || "General Medicine",
            hospital_name: hospital_name || "City Central Hospital",
            appointment_date,
            appointment_time,
            type: type || "In-Person",
            reason: reason || "General consultation"
        });

        res.status(201).json({
            success: true,
            message: "Appointment successfully booked!",
            appointment: newApt
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/patient/medications
 * @desc    Get patient active and historical medications
 * @access  Private (Patient)
 */
router.get("/medications", async (req, res, next) => {
    try {
        const medications = await db.getMedications(req.user.id);
        res.status(200).json({
            success: true,
            medications
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/patient/medications
 * @desc    Add a prescribed medication
 * @access  Private (Patient)
 */
router.post("/medications", async (req, res, next) => {
    try {
        const { medication_name, dosage, frequency, timing, instructions, prescribed_by } = req.body;

        if (!medication_name || !dosage || !frequency) {
            return res.status(400).json({
                success: false,
                message: "Medication name, dosage, and frequency are required."
            });
        }

        const newMed = await db.addMedication({
            patient_id: req.user.id,
            medication_name,
            dosage,
            frequency,
            timing: timing || "After meals",
            instructions: instructions || "Take as directed",
            prescribed_by: prescribed_by || "Physician"
        });

        res.status(201).json({
            success: true,
            message: "Medication successfully tracked!",
            medication: newMed
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/patient/records
 * @desc    Get patient medical records & test reports
 * @access  Private (Patient)
 */
router.get("/records", async (req, res, next) => {
    try {
        const records = await db.getMedicalRecords(req.user.id);
        res.status(200).json({
            success: true,
            records
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
