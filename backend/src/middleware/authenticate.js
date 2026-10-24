/**
 * MedIntelliX Authentication Middleware
 * Developed by: Sonia (Security & Privacy Engineer)
 * Verifies JWT tokens and populates req.user
 */

const jwt = require("jsonwebtoken");
const db = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "medintellix_super_secret_jwt_key_sonia_2026";

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Authentication token missing."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch user to ensure user still exists
        const user = await db.findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid session. User not found."
            });
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            organisation_name: user.organisation_name,
            institution_id: user.institution_id
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please sign in again."
            });
        }

        return res.status(403).json({
            success: false,
            message: "Invalid or malformed authentication token."
        });
    }
}

module.exports = authenticate;
