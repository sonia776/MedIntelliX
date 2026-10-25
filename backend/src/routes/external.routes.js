/**
 * MedIntelliX External Integrations & Health APIs Routes
 * Developed by: Sonia (Category 6: APIs & External Integrations)
 * Connects OpenFDA Drug Database and ClinicalTrials.gov REST APIs
 */

const express = require("express");
const router = express.Router();
const openfdaService = require("../services/openfda.service");
const clinicaltrialsService = require("../services/clinicaltrials.service");

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
            }
        }
    });
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

module.exports = router;
