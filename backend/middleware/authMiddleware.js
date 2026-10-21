const jwt = require("jsonwebtoken");

require("dotenv").config();

// ============================================================
// AUTHENTICATE
// ============================================================

const authenticateToken = (
  req,
  res,
  next
) => {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const token =
      authorization.split(" ")[1];

    if (
      !process.env.JWT_SECRET
    ) {
      throw new Error(
        "JWT_SECRET is missing."
      );
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.userId =
      decoded.id ||
      decoded._id;

    req.userRole =
      decoded.role;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication.",
    });
  }
};

// ============================================================
// ROLES
// ============================================================

const requireRoles =
  (...allowedRoles) =>
  (
    req,
    res,
    next
  ) => {
    if (
      !allowedRoles.includes(
        req.userRole
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
      });
    }

    next();
  };

module.exports = {
  authenticateToken,
  requireRoles,
};