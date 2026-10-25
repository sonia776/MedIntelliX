/**
 * ==========================================================
 * MedIntelliX Healthcare AI & Unified Platform
 * Core Backend Server
 * Lead Backend & Database Architect: Sonia
 * ==========================================================
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const db = require("./config/database");
const errorHandler = require("./middleware/error-handler");

// Route imports
const authRoutes = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const governmentRoutes = require("./routes/government.routes");
const externalRoutes = require("./routes/external.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Normalize URL for Vercel serverless rewrites
app.use((req, res, next) => {
    const matchedPath = req.headers["x-matched-path"] || req.headers["x-invoke-path"];
    if (matchedPath && req.url.startsWith("/src/server.js")) {
        const queryIndex = req.url.indexOf("?");
        const query = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
        req.url = matchedPath + query;
    }
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Root API Health & Documentation Endpoint
const apiDocsHandler = (req, res) => {
    res.json({
        platform: "MedIntelliX Healthcare AI API",
        version: "1.0.0",
        status: "ONLINE",
        architect: "Sonia",
        documentation: {
            auth: {
                register: "POST /api/auth/register",
                login: "POST /api/auth/login",
                me: "GET /api/auth/me",
                forgotPassword: "POST /api/auth/forgot-password"
            },
            patient: {
                dashboard: "GET /api/patient/dashboard",
                appointments: "GET, POST /api/patient/appointments",
                medications: "GET, POST /api/patient/medications",
                records: "GET /api/patient/records"
            },
            externalIntegrations: {
                overview: "GET /api/external/overview",
                drugSearch: "GET /api/external/drugs/search?query=metformin",
                drugInteractions: "GET /api/external/drugs/interactions?drugA=aspirin&drugB=warfarin",
                clinicalTrials: "GET /api/external/trials/search?condition=diabetes&status=RECRUITING"
            },
            hospital: {
                dashboard: "GET /api/hospital/dashboard",
                patients: "GET /api/hospital/patients"
            },
            government: {
                dashboard: "GET /api/government/dashboard"
            }
        },
        timestamp: new Date().toISOString()
    });
};

app.get("/", apiDocsHandler);
app.get("/api", apiDocsHandler);
app.get("/api/health", apiDocsHandler);

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/government", governmentRoutes);
app.use("/api/external", externalRoutes);

// 404 Handler for undefined API routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found on MedIntelliX server.`
    });
});

// Global Error Handler
app.use(errorHandler);

// Start Server locally if run directly
const isDirectExecution = require.main === module;
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (isDirectExecution && !isServerless) {
    app.listen(PORT, async () => {
        try {
            await db.testConnection();
        } catch (e) {
            console.warn("Database initialization notice:", e.message);
        }
        console.log(`
=============================================================
 🚀 MedIntelliX Server is running on port ${PORT}
 📡 API Base URL: http://localhost:${PORT}/
 🔐 Authentication & RBAC Active
 💻 Lead Backend Developer: Sonia
=============================================================
        `);
    });
}

// Export Express app for Vercel Serverless Functions & testing
module.exports = app;

