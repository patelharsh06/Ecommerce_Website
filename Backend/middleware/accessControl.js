// Access control middleware to restrict access based on user roles
export function checkAccess(...allowedRoles) {
    return (req, res, next) => {
        // Check if the user is authenticated and has a role
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }
        // Check if the user's role is in the list of allowed roles
        const userRole = req.user.role;
        // If the user's role is in the allowed roles, proceed to the next middleware
        if (allowedRoles.includes(userRole)) {
            return next();
        }
        // If the user's role is not allowed, return a forbidden response 
        else {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
            });
        }
    };
}