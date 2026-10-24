/**
 * MedIntelliX Role-Based Access Control (RBAC) Middleware
 * Developed by: Sonia (Security & Privacy Engineer)
 * Restricts route access based on user role (patient, hospital, government)
 */

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identity not established."
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted. Requires one of [${allowedRoles.join(", ")}] roles, but your account is [${userRole}].`
            });
        }

        next();
    };
}

module.exports = authorize;
