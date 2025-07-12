// AppWatch Security Module
// Handles authentication, rate limiting, input validation, and security headers

/**
 * Rate Limiting Store using in-memory cache
 * In production, this could be moved to KV storage for persistence
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 60000; // 1 minute
    this.maxRequests = 100; // requests per window
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    this.requests.forEach((data, key) => {
      if (data.timestamp < windowStart) {
        this.requests.delete(key);
      }
    });

    const currentRequests = this.requests.get(identifier) || { count: 0, timestamp: now };
    
    if (currentRequests.timestamp < windowStart) {
      // Reset counter for new window
      this.requests.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (currentRequests.count >= this.maxRequests) {
      return false;
    }

    // Increment counter
    this.requests.set(identifier, { 
      count: currentRequests.count + 1, 
      timestamp: currentRequests.timestamp 
    });
    
    return true;
  }

  getRemainingRequests(identifier) {
    const current = this.requests.get(identifier) || { count: 0 };
    return Math.max(0, this.maxRequests - current.count);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Input Validation Functions
 */
export const validators = {
  url: (url) => {
    try {
      const parsedUrl = new URL(url);
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
      }
      // Block localhost and private IPs for security
      if (parsedUrl.hostname === 'localhost' || 
          parsedUrl.hostname.startsWith('192.168.') ||
          parsedUrl.hostname.startsWith('10.') ||
          parsedUrl.hostname.startsWith('172.')) {
        return { valid: false, error: 'Private/localhost URLs are not allowed' };
      }
      return { valid: true, value: url };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  },

  appName: (name) => {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'App name is required' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      return { valid: false, error: 'App name must be between 2-100 characters' };
    }
    // Basic XSS prevention
    if (/<script|javascript:|on\w+=/i.test(trimmed)) {
      return { valid: false, error: 'Invalid characters in app name' };
    }
    return { valid: true, value: trimmed };
  },

  description: (description) => {
    if (!description) return { valid: true, value: '' };
    if (typeof description !== 'string') {
      return { valid: false, error: 'Description must be a string' };
    }
    const trimmed = description.trim();
    if (trimmed.length > 500) {
      return { valid: false, error: 'Description must be less than 500 characters' };
    }
    // Basic XSS prevention
    if (/<script|javascript:|on\w+=/i.test(trimmed)) {
      return { valid: false, error: 'Invalid characters in description' };
    }
    return { valid: true, value: trimmed };
  },

  category: (category) => {
    const validCategories = ['web', 'api', 'database', 'microservice', 'other'];
    if (!validCategories.includes(category)) {
      return { valid: false, error: 'Invalid category' };
    }
    return { valid: true, value: category };
  },

  checkInterval: (interval) => {
    const numInterval = parseInt(interval);
    if (isNaN(numInterval) || numInterval < 60 || numInterval > 3600) {
      return { valid: false, error: 'Check interval must be between 60-3600 seconds' };
    }
    return { valid: true, value: numInterval };
  },

  timeout: (timeout) => {
    const numTimeout = parseInt(timeout);
    if (isNaN(numTimeout) || numTimeout < 1000 || numTimeout > 30000) {
      return { valid: false, error: 'Timeout must be between 1000-30000 milliseconds' };
    }
    return { valid: true, value: numTimeout };
  },

  uuid: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { valid: false, error: 'Invalid ID format' };
    }
    return { valid: true, value: id };
  }
};

/**
 * Validate app data for creation/update
 */
export function validateAppData(data) {
  const errors = {};
  const validatedData = {};

  // Required fields
  const nameResult = validators.appName(data.name);
  if (!nameResult.valid) {
    errors.name = nameResult.error;
  } else {
    validatedData.name = nameResult.value;
  }

  const urlResult = validators.url(data.url);
  if (!urlResult.valid) {
    errors.url = urlResult.error;
  } else {
    validatedData.url = urlResult.value;
  }

  // Optional fields
  if (data.description !== undefined) {
    const descResult = validators.description(data.description);
    if (!descResult.valid) {
      errors.description = descResult.error;
    } else {
      validatedData.description = descResult.value;
    }
  }

  if (data.category !== undefined) {
    const catResult = validators.category(data.category);
    if (!catResult.valid) {
      errors.category = catResult.error;
    } else {
      validatedData.category = catResult.value;
    }
  }

  if (data.check_interval !== undefined) {
    const intervalResult = validators.checkInterval(data.check_interval);
    if (!intervalResult.valid) {
      errors.check_interval = intervalResult.error;
    } else {
      validatedData.check_interval = intervalResult.value;
    }
  }

  if (data.timeout !== undefined) {
    const timeoutResult = validators.timeout(data.timeout);
    if (!timeoutResult.valid) {
      errors.timeout = timeoutResult.error;
    } else {
      validatedData.timeout = timeoutResult.value;
    }
  }

  if (data.enable_alerts !== undefined) {
    validatedData.enable_alerts = Boolean(data.enable_alerts);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: validatedData
  };
}

/**
 * Security Headers
 */
export function getSecurityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' fonts.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"
  };
}

/**
 * Rate Limiting Middleware
 */
export function checkRateLimit(request) {
  const identifier = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';
  
  const allowed = rateLimiter.isAllowed(identifier);
  const remaining = rateLimiter.getRemainingRequests(identifier);

  return {
    allowed,
    remaining,
    identifier
  };
}

/**
 * Enhanced CORS headers with security considerations
 */
export function getSecureCorsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'false'
  };
}

/**
 * Authentication middleware (placeholder for future OAuth implementation)
 */
export function verifyAuth(request) {
  // For now, we'll return true (no auth)
  // TODO: Implement JWT/OAuth verification
  return {
    authenticated: true,
    user: { id: 'anonymous', role: 'user' }
  };
}

/**
 * Sanitize output data to prevent XSS
 */
export function sanitizeOutput(data) {
  if (typeof data === 'string') {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Enhanced error response with security considerations
 */
export function createSecureErrorResponse(error, status = 500, corsHeaders = {}) {
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const errorMessage = isProduction ? 'Internal Server Error' : error.message;
  
  return new Response(JSON.stringify({
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      ...corsHeaders,
      ...getSecurityHeaders(),
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Enhanced success response with security headers
 */
export function createSecureResponse(data, corsHeaders = {}) {
  return new Response(JSON.stringify({
    success: true,
    ...sanitizeOutput(data),
    timestamp: new Date().toISOString()
  }), {
    headers: {
      ...corsHeaders,
      ...getSecurityHeaders(),
      'Content-Type': 'application/json'
    }
  });
}