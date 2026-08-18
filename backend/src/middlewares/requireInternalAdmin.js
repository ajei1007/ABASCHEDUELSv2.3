// Middleware: Only internalAdmin users can access new constraint generator
export const requireInternalAdmin = (req, res, next) => {
  if (!req.currentUser.internalAdmin) {
    return res.status(403).send({ message: 'Forbidden' });
  }
  next();
};