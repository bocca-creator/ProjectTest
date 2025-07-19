const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// Generate Refresh Token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create tokens
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes for access token
  };

  const refreshOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
  };

  // Set cookies
  res.cookie('accessToken', token, options);
  res.cookie('refreshToken', refreshToken, refreshOptions);

  // Get user data for response (excluding password)
  const userData = user.getJWTPayload();

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: userData
  });
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User account is inactive.'
        });
      }

      // Update last active
      user.updateLastActive();

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Token expired.',
          expired: true
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware for optional authentication
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token, continue without authentication
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        // Update last active
        user.updateLastActive();
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // If token is invalid, continue without authentication
      req.user = null;
    }

    next();
  } catch (error) {
    // If any error occurs, continue without authentication
    req.user = null;
    next();
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Middleware to refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    try {
      // Verify refresh token
      const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new access token
      const newAccessToken = signToken(user._id);

      // Set new access token cookie
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      };

      res.cookie('accessToken', newAccessToken, options);

      res.json({
        success: true,
        token: newAccessToken,
        message: 'Token refreshed successfully'
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Clear cookies if refresh token is expired
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(401).json({
          success: false,
          message: 'Refresh token expired. Please login again.',
          requiresLogin: true
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
};

// Middleware to check if user owns resource
const checkOwnership = (resourceField = 'user.id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and moderators can access any resource
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
      return next();
    }

    // For regular users, check ownership
    const resourceUserId = req.resource ? req.resource[resourceField] : null;
    
    if (!resourceUserId || resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Middleware to rate limit requests
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    
    // Clean old entries
    for (const [key, data] of requests.entries()) {
      if (now - data.resetTime > windowMs) {
        requests.delete(key);
      }
    }

    // Get or create user request data
    let userData = requests.get(identifier);
    if (!userData) {
      userData = { count: 0, resetTime: now };
      requests.set(identifier, userData);
    }

    // Reset if window expired
    if (now - userData.resetTime > windowMs) {
      userData.count = 0;
      userData.resetTime = now;
    }

    // Check if limit exceeded
    if (userData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userData.resetTime)) / 1000)
      });
    }

    // Increment counter
    userData.count++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - userData.count,
      'X-RateLimit-Reset': new Date(userData.resetTime + windowMs).toISOString()
    });

    next();
  };
};

module.exports = {
  signToken,
  signRefreshToken,
  sendTokenResponse,
  protect,
  optionalAuth,
  authorize,
  refreshToken,
  checkOwnership,
  rateLimitByUser
};