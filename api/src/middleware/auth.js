export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
}

export function requireHost(req, res, next) {
  if (req.isAuthenticated() && req.user.is_host) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'Host access required'
  });
}