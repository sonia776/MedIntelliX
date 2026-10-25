/**
 * MedIntelliX External Integrations & Health APIs Routes
 * Developed by: Sonia (Category 6: APIs & External Integrations)
 * Connects OpenFDA Drug Database and ClinicalTrials.gov REST APIs
 */

const express = require("express");
const router = express.Router();
const openfdaService = require("../services/openfda.service");
const clinicaltrialsService = require("../services/clinicaltrials.service");
const llmService = require("../services/llm.service");
const notificationService = require("../services/notification.service");

/**
 * @route   GET /api/external/overview
 * @desc    Get summary of external integrations
 * @access  Public
 */
router.get("/overview", (req, res) => {
    res.json({
        success: true,
        category: "Category 6: APIs & External Integrations",
        developer: "Sonia",
        integrations: {
            aiMedicalAssistant: {
                provider: "Google Gemini LLM / MedIntelliX Clinical Reasoning Engine",
                capabilities: ["Clinical Symptom Triage", "Diagnostic Lab Report Explainer", "Emergency Red-Flag Detection"],
                endpoints: [
                    "POST /api/external/ai/symptom-triage",
                    "POST /api/external/ai/explain-report"
                ]
            },
            drugDatabase: {
                provider: "OpenFDA (U.S. Food & Drug Administration)",
                capabilities: ["Drug Label Lookup", "Dosage & Warnings", "Adverse Reactions", "Harmful Interaction Checking"],
                endpoints: [
                    "GET /api/external/drugs/search?query=aspirin",
                    "GET /api/external/drugs/interactions?drugA=aspirin&drugB=warfarin"
                ]
            },
            clinicalTrials: {
                provider: "ClinicalTrials.gov (U.S. National Library of Medicine / NIH)",
                capabilities: ["Live Clinical Trials Search", "Patient Recruitment Matching", "Interventions & Phases"],
                endpoints: [
                    "GET /api/external/trials/search?condition=diabetes&status=RECRUITING"
                ]
            },
            notifications: {
                channels: ["Transactional Email (Nodemailer / SMTP)", "Cellular SMS (Telecom Gateway)", "In-App Push"],
                capabilities: [
                    "Automated 24h-48h Clinical Appointment Reminders",
                    "Proactive Medication Refill Low-Stock Warnings",
                    "Custom Multi-Channel Clinical Direct Dispatch",
                    "PostgreSQL Audit Logging & Delivery Tracking"
                ],
                endpoints: [
                    "POST /api/external/notifications/trigger-appointment-reminders",
                    "POST /api/external/notifications/trigger-refill-alerts",
                    "POST /api/external/notifications/send",
                    "GET /api/external/notifications/history?userId=usr_pat_alex_001"
                ]
            }
        }
    });
});

/**
 * @route   POST /api/external/ai/symptom-triage
 * @desc    Analyze patient symptoms and return clinical triage guidance
 * @access  Public
 */
router.post("/ai/symptom-triage", async (req, res, next) => {
    try {
        const { symptoms, patientContext } = req.body;
        if (!symptoms) {
            return res.status(400).json({
                success: false,
                message: "Please provide 'symptoms' in the request body."
            });
        }

        const result = await llmService.analyzeSymptoms(symptoms, patientContext || {});
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/external/ai/explain-report
 * @desc    Explain medical laboratory report in patient-friendly terms
 * @access  Public
 */
router.post("/ai/explain-report", async (req, res, next) => {
    try {
        const { reportText, testType } = req.body;
        if (!reportText) {
            return res.status(400).json({
                success: false,
                message: "Please provide 'reportText' in the request body."
            });
        }

        const result = await llmService.explainLabReport(reportText, testType || "General Lab Report");
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/external/drugs/search
 * @desc    Search OpenFDA drug database by brand or generic name
 * @access  Public
 */
router.get("/drugs/search", async (req, res, next) => {
    try {
        const { query, limit } = req.query;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Please provide a query parameter (e.g. ?query=metformin)"
            });
        }

        const data = await openfdaService.searchDrug(query, limit ? parseInt(limit, 10) : 5);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/external/drugs/interactions
 * @desc    Check adverse drug-drug interactions between two medications
 * @access  Public
 */
router.get("/drugs/interactions", async (req, res, next) => {
    try {
        const { drugA, drugB } = req.query;
        if (!drugA || !drugB) {
            return res.status(400).json({
                success: false,
                message: "Both drugA and drugB parameters are required (e.g. ?drugA=aspirin&drugB=warfarin)"
            });
        }

        const result = await openfdaService.checkInteraction(drugA, drugB);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/external/trials/search
 * @desc    Search ClinicalTrials.gov for active medical trials
 * @access  Public
 */
router.get("/trials/search", async (req, res, next) => {
    try {
        const { condition, term, status, limit } = req.query;
        const data = await clinicaltrialsService.searchTrials({
            condition: condition || "",
            term: term || "",
            status: status || "RECRUITING",
            limit: limit ? parseInt(limit, 10) : 6
        });

        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

/**
 * ==========================================================
 * NOTIFICATION APIS (Category 6: APIs & External Integrations)
 * Developer: Sonia
 * ==========================================================
 */

/**
 * @route   POST /api/external/notifications/trigger-appointment-reminders
 * @desc    Scan and trigger automated 24-48h appointment reminders via Email + SMS
 * @access  Public / System
 */
router.post("/notifications/trigger-appointment-reminders", async (req, res, next) => {
    try {
        const result = await notificationService.triggerAppointmentReminders(req.body || {});
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/external/notifications/trigger-refill-alerts
 * @desc    Scan and trigger automated medication refill alerts via Email + SMS
 * @access  Public / System
 */
router.post("/notifications/trigger-refill-alerts", async (req, res, next) => {
    try {
        const daysThreshold = req.body.daysThreshold ? parseInt(req.body.daysThreshold, 10) : 30;
        const result = await notificationService.triggerRefillAlerts(daysThreshold, req.body.userId || null);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/external/notifications/send
 * @desc    Send on-demand clinical notification (Email, SMS, or Multi-channel)
 * @access  Public / Authenticated
 */
router.post("/notifications/send", async (req, res, next) => {
    try {
        const { userId, type, channels, title, message, recipientEmail, recipientPhone, metadata } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "'title' and 'message' are required fields."
            });
        }

        const result = await notificationService.sendManualNotification({
            userId,
            type: type || "SYSTEM_ALERT",
            channels: channels || ["EMAIL", "SMS"],
            title,
            message,
            recipientEmail,
            recipientPhone,
            metadata: metadata || {}
        });

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/external/notifications/history
 * @desc    Retrieve notification logs & delivery status for a user
 * @access  Public / Authenticated
 */
router.get("/notifications/history", async (req, res, next) => {
    try {
        const userId = req.query.userId || req.user?.id || null;
        const email = req.query.email || req.user?.email || null;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

        if (!userId && !email) {
            return res.status(200).json({
                success: true,
                userId: null,
                count: 0,
                notifications: []
            });
        }

        const notifications = await notificationService.getNotifications(userId, email, limit);
        res.status(200).json({
            success: true,
            userId,
            count: notifications.length,
            notifications
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

