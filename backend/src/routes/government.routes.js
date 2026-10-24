/**
 * MedIntelliX Government & Public Health Portal Routes
 * Developed by: Sonia (Backend Architecture & Healthcare APIs)
 */

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.use(authenticate);
router.use(authorize("government"));

/**
 * @route   GET /api/government/dashboard
 * @desc    Get regional health intelligence and disease surveillance
 * @access  Private (Government)
 */
router.get("/dashboard", async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                department: req.user.organisation_name || "Ministry of Health",
                monitored_hospitals: 48,
                total_admissions: 12480,
                vaccination_rate: "89.4%",
                epidemic_alert_level: "Low / Normal",
                top_trends: [
                    { condition: "Seasonal Influenza", change: "-4.2%", status: "Declining" },
                    { condition: "Type 2 Diabetes", change: "+1.1%", status: "Monitored" },
                    { condition: "Hypertension", change: "+0.5%", status: "Stable" }
                ]
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
