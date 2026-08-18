const requireRole = (requiredRole) => (req, res, next) => {
  // Ensure roles array exists and has at least one role
  if (!req.currentUser || !req.currentUser.roles || req.currentUser.roles.length === 0) {
    return res.status(403).send({ message: 'Access denied: User roles not found.' });
  }

  // Check if the first role matches the required role
  const userRole = req.currentUser.role;
  if (userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    return res.status(403).send({ message: `Access denied: ${requiredRole} role required.` });
  }

  next(); // Role matches, proceed to the next middleware or route handler
};

module.exports = requireRole;
