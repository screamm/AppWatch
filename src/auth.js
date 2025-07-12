// AppWatch Authentication & Authorization
// JWT verification, role-based access control, and Cloudflare Access integration

/**
 * JWT Token verification for Cloudflare Access
 */
export class JWTVerifier {
  constructor(options = {}) {
    this.issuer = options.issuer || 'https://your-team.cloudflareaccess.com';
    this.audience = options.audience || 'your-app-aud';
    this.domain = options.domain || 'your-team.cloudflareaccess.com';
    this.publicKeyCache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }

  /**
   * Verify JWT token from Cloudflare Access
   */
  async verifyToken(token) {
    try {
      const [header, payload, signature] = token.split('.');
      
      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }

      const decodedHeader = JSON.parse(this.base64UrlDecode(header));
      const decodedPayload = JSON.parse(this.base64UrlDecode(payload));

      // Basic validation
      if (decodedPayload.iss !== this.issuer) {
        throw new Error('Invalid issuer');
      }

      if (decodedPayload.aud !== this.audience) {
        throw new Error('Invalid audience');
      }

      if (decodedPayload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      // Get public key and verify signature
      const publicKey = await this.getPublicKey(decodedHeader.kid);
      const isValid = await this.verifySignature(
        `${header}.${payload}`,
        signature,
        publicKey
      );

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      return {
        valid: true,
        payload: decodedPayload,
        user: {
          id: decodedPayload.sub,
          email: decodedPayload.email,
          name: decodedPayload.name,
          groups: decodedPayload.groups || []
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get public key from Cloudflare Access
   */
  async getPublicKey(keyId) {
    const cacheKey = `publicKey_${keyId}`;
    
    if (this.publicKeyCache.has(cacheKey)) {
      const cached = this.publicKeyCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.key;
      }
      this.publicKeyCache.delete(cacheKey);
    }

    try {
      const response = await fetch(`https://${this.domain}/cdn-cgi/access/certs`);
      const data = await response.json();
      
      const key = data.keys.find(k => k.kid === keyId);
      if (!key) {
        throw new Error('Public key not found');
      }

      // Cache the key
      this.publicKeyCache.set(cacheKey, {
        key: key,
        timestamp: Date.now()
      });

      return key;
    } catch (error) {
      throw new Error(`Failed to fetch public key: ${error.message}`);
    }
  }

  /**
   * Verify JWT signature
   */
  async verifySignature(data, signature, publicKey) {
    try {
      // Convert JWK to CryptoKey
      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        publicKey,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['verify']
      );

      // Verify signature
      const signatureBuffer = this.base64UrlDecodeToBuffer(signature);
      const dataBuffer = new TextEncoder().encode(data);

      return await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBuffer,
        dataBuffer
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Base64 URL decode to string
   */
  base64UrlDecode(str) {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Decode
    return atob(str);
  }

  /**
   * Base64 URL decode to ArrayBuffer
   */
  base64UrlDecodeToBuffer(str) {
    const decoded = this.base64UrlDecode(str);
    const buffer = new ArrayBuffer(decoded.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < decoded.length; i++) {
      view[i] = decoded.charCodeAt(i);
    }
    return buffer;
  }
}

/**
 * Role-based access control
 */
export class RoleBasedAccessControl {
  constructor() {
    this.roles = {
      'admin': {
        permissions: ['*'], // All permissions
        description: 'Full system access'
      },
      'operator': {
        permissions: [
          'apps:read',
          'apps:create',
          'apps:update',
          'apps:check',
          'monitoring:read',
          'alerts:read',
          'alerts:create',
          'alerts:update',
          'performance:read'
        ],
        description: 'Operational monitoring access'
      },
      'viewer': {
        permissions: [
          'apps:read',
          'monitoring:read',
          'performance:read'
        ],
        description: 'Read-only access'
      },
      'guest': {
        permissions: [
          'apps:read'
        ],
        description: 'Limited read access'
      }
    };
  }

  /**
   * Check if user has permission
   */
  hasPermission(user, permission) {
    const userRole = this.getUserRole(user);
    const roleConfig = this.roles[userRole];
    
    if (!roleConfig) {
      return false;
    }

    // Admin has all permissions
    if (roleConfig.permissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return roleConfig.permissions.includes(permission);
  }

  /**
   * Get user role based on groups or email
   */
  getUserRole(user) {
    // Check groups first (from Cloudflare Access)
    if (user.groups) {
      if (user.groups.includes('appwatch-admins')) return 'admin';
      if (user.groups.includes('appwatch-operators')) return 'operator';
      if (user.groups.includes('appwatch-viewers')) return 'viewer';
    }

    // Fallback to email-based role assignment
    if (user.email) {
      if (user.email.endsWith('@admin.example.com')) return 'admin';
      if (user.email.endsWith('@ops.example.com')) return 'operator';
    }

    // Default role
    return 'guest';
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(user) {
    const role = this.getUserRole(user);
    const roleConfig = this.roles[role];
    
    return {
      role,
      permissions: roleConfig ? roleConfig.permissions : [],
      description: roleConfig ? roleConfig.description : 'No role assigned'
    };
  }

  /**
   * Check endpoint access
   */
  checkEndpointAccess(user, method, path) {
    const permissions = this.getRequiredPermissions(method, path);
    
    return permissions.every(permission => 
      this.hasPermission(user, permission)
    );
  }

  /**
   * Get required permissions for endpoint
   */
  getRequiredPermissions(method, path) {
    const routes = [
      // Apps management
      { pattern: /^\/api\/apps$/, methods: ['GET'], permissions: ['apps:read'] },
      { pattern: /^\/api\/apps$/, methods: ['POST'], permissions: ['apps:create'] },
      { pattern: /^\/api\/apps\/[^\/]+$/, methods: ['DELETE'], permissions: ['apps:delete'] },
      { pattern: /^\/api\/apps\/[^\/]+\/check$/, methods: ['POST'], permissions: ['apps:check'] },
      
      // Monitoring
      { pattern: /^\/api\/stats$/, methods: ['GET'], permissions: ['monitoring:read'] },
      { pattern: /^\/api\/monitoring\//, methods: ['GET'], permissions: ['monitoring:read'] },
      { pattern: /^\/api\/monitoring\//, methods: ['POST'], permissions: ['monitoring:execute'] },
      
      // Performance
      { pattern: /^\/api\/performance\//, methods: ['GET'], permissions: ['performance:read'] },
      
      // Alerts
      { pattern: /^\/api\/apps\/[^\/]+\/alerts$/, methods: ['GET'], permissions: ['alerts:read'] },
      { pattern: /^\/api\/apps\/[^\/]+\/alerts$/, methods: ['POST'], permissions: ['alerts:create'] },
      { pattern: /^\/api\/alerts\//, methods: ['DELETE'], permissions: ['alerts:delete'] },
      
      // Database management (admin only)
      { pattern: /^\/api\/database\//, methods: ['GET'], permissions: ['database:read'] },
      { pattern: /^\/api\/database\//, methods: ['POST'], permissions: ['database:manage'] }
    ];

    for (const route of routes) {
      if (route.pattern.test(path) && route.methods.includes(method)) {
        return route.permissions;
      }
    }

    // Default: require basic read access
    return ['apps:read'];
  }
}

/**
 * Main authentication service
 */
export class AuthenticationService {
  constructor(options = {}) {
    this.jwtVerifier = new JWTVerifier(options.jwt);
    this.rbac = new RoleBasedAccessControl();
    this.bypassAuth = options.bypassAuth || false; // For development
  }

  /**
   * Authenticate request
   */
  async authenticateRequest(request) {
    // Development bypass
    if (this.bypassAuth) {
      return {
        authenticated: true,
        user: {
          id: 'dev-user',
          email: 'dev@example.com',
          name: 'Development User',
          groups: ['appwatch-admins']
        }
      };
    }

    // Get JWT token from Cloudflare Access headers
    const cfAccessJwt = request.headers.get('cf-access-jwt-assertion');
    
    if (!cfAccessJwt) {
      return {
        authenticated: false,
        error: 'No authentication token provided'
      };
    }

    // Verify token
    const verification = await this.jwtVerifier.verifyToken(cfAccessJwt);
    
    if (!verification.valid) {
      return {
        authenticated: false,
        error: verification.error
      };
    }

    return {
      authenticated: true,
      user: verification.user
    };
  }

  /**
   * Authorize request
   */
  authorizeRequest(user, method, path) {
    const hasAccess = this.rbac.checkEndpointAccess(user, method, path);
    
    return {
      authorized: hasAccess,
      user_role: this.rbac.getUserRole(user),
      required_permissions: this.rbac.getRequiredPermissions(method, path)
    };
  }

  /**
   * Get user info
   */
  getUserInfo(user) {
    return {
      ...user,
      ...this.rbac.getUserPermissions(user)
    };
  }
}

/**
 * Authentication middleware
 */
export function createAuthMiddleware(options = {}) {
  const authService = new AuthenticationService(options);
  
  return {
    async authenticate(request) {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Skip auth for public endpoints
      const publicEndpoints = [
        '/',
        '/favicon.ico',
        '/styles.css',
        '/script.js'
      ];

      if (publicEndpoints.includes(path)) {
        return { authenticated: true, skipAuth: true };
      }

      // Authenticate user
      const authResult = await authService.authenticateRequest(request);
      
      if (!authResult.authenticated) {
        return authResult;
      }

      // Authorize request
      const authzResult = authService.authorizeRequest(
        authResult.user, 
        method, 
        path
      );

      if (!authzResult.authorized) {
        return {
          authenticated: true,
          authorized: false,
          error: 'Insufficient permissions',
          user_role: authzResult.user_role,
          required_permissions: authzResult.required_permissions
        };
      }

      return {
        authenticated: true,
        authorized: true,
        user: authResult.user,
        user_info: authService.getUserInfo(authResult.user)
      };
    }
  };
}

/**
 * Create secure response with authentication errors
 */
export async function createAuthErrorResponse(authResult, corsHeaders) {
  const { createSecureErrorResponse } = await import('./security.js');
  
  if (!authResult.authenticated) {
    return createSecureErrorResponse(
      new Error('Authentication required'), 
      401, 
      {
        ...corsHeaders,
        'WWW-Authenticate': 'Bearer realm="AppWatch"'
      }
    );
  }

  if (!authResult.authorized) {
    return createSecureErrorResponse(
      new Error('Access denied'), 
      403, 
      corsHeaders
    );
  }

  return null;
}

// Export factory function
export function createAuthService(options = {}) {
  return new AuthenticationService(options);
}