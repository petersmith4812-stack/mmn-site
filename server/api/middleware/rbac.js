const ROLE_LEVELS = {
  SUPERADMIN: 100, PRINCIPAL: 90, HR_MANAGER: 70, FINANCE_OFFICER: 70,
  TEACHER: 60, TEACHER_ASSISTANT: 50, CRM_AGENT: 50, PARENT_LIAISON: 50,
  CONTENT_EDITOR: 40, EDITOR: 40, ANALYTICS_VIEWER: 30, VIEWER: 10,
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role === "SUPERADMIN" || roles.includes(req.user.role)) return next();
  return res.status(403).json({ error: "Insufficient permissions" });
};

const requireLevel = (min) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if ((ROLE_LEVELS[req.user.role] || 0) >= min) return next();
  return res.status(403).json({ error: "Insufficient permissions" });
};

// Inject schoolId from token so routes never trust the client-supplied one
const injectSchool = (req, _res, next) => {
  if (req.user) req.schoolId = req.user.schoolId;
  next();
};

module.exports = { requireRole, requireLevel, injectSchool, ROLE_LEVELS };
