/**
 * MedIntelliX Authentication Routes
 * Developed by: Sonia (Backend & Auth Systems)
 * Endpoints for multi-portal registration, login, token verification
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const authenticate = require("../middleware/authenticate");

const JWT_SECRET = process.env.JWT_SECRET || "medintellix_super_secret_jwt_key_sonia_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helper: Generate Token
function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// Helper: Redirect Path based on portal
function getPortalRedirect(role) {
    switch (role) {
        case "hospital":
            return "/pages/hospital/dashboard.html";
        case "government":
            return "/pages/government/dashboard.html";
        case "patient":
        default:
            return "/pages/patient/dashboard.html";
    }
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Patient, Hospital, Government)
 * @access  Public
 */
router.post("/register", async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            password,
            accountType,
            organisationName,
            institutionId,
            phone
        } = req.body;

        // Basic Validations
        if (!fullName || !email || !password || !accountType) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, password, and account type are required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const validRoles = ["patient", "hospital", "government"];
        if (!validRoles.includes(accountType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account type specified."
            });
        }

        // Institutional details check
        if ((accountType === "hospital" || accountType === "government") && (!organisationName || !institutionId)) {
            return res.status(400).json({
                success: false,
                message: "Organisation name and Institutional ID are required for institutional accounts."
            });
        }

        // Check if email already registered
        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email address already exists. Please sign in."
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Save User
        const newUser = await db.createUser({
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            password_hash,
            role: accountType,
            organisation_name: organisationName ? organisationName.trim() : null,
            institution_id: institutionId ? institutionId.trim() : null,
            phone: phone || null
        });

        // Audit Log
        await db.logAudit({
            user_id: newUser.id,
            user_email: newUser.email,
            role: newUser.role,
            action: "USER_REGISTRATION",
            resource: "AUTH",
            ip_address: req.ip || "127.0.0.1"
        });

        // Generate Token
        const token = createToken(newUser);

        res.status(201).json({
            success: true,
            message: `Account created successfully for ${newUser.full_name}!`,
            token,
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email,
                role: newUser.role,
                organisation_name: newUser.organisation_name
            },
            redirectUrl: getPortalRedirect(newUser.role)
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password."
            });
        }

        const user = await db.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials. No user found with this email."
            });
        }

        // Role verification
        if (role && user.role !== role) {
            return res.status(400).json({
                success: false,
                message: `This account is registered under the '${user.role.toUpperCase()}' portal. Please select '${user.role.toUpperCase()}' above to continue.`
            });
        }

        // Password matching
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password. Please check your credentials."
            });
        }

        // Audit log
        await db.logAudit({
            user_id: user.id,
            user_email: user.email,
            role: user.role,
            action: "USER_LOGIN",
            resource: "AUTH",
            ip_address: req.ip || "127.0.0.1"
        });

        // Generate Token
        const token = createToken(user);

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.full_name}!`,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                organisation_name: user.organisation_name
            },
            redirectUrl: getPortalRedirect(user.role)
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user info
 * @access  Private
 */
router.get("/me", authenticate, async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Simulated password recovery
 * @access  Public
 */
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    res.status(200).json({
        success: true,
        message: `Password reset instructions have been dispatched to ${email || "your email"}.`
    });
});

module.exports = router;
