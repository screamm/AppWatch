/**
 * Simple Password Authentication for AppWatch
 * Using Web Crypto API with PBKDF2 for secure password hashing
 */

import { logger } from './logging.js';

/**
 * Simple Authentication Service
 */
export class SimpleAuthService {
  constructor(database) {
    this.db = database;
    this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
  }

  /**
   * Hash password using PBKDF2 with Web Crypto API
   */
  async hashPassword(password, salt = null) {
    try {
      // Generate random salt if not provided
      if (!salt) {
        salt = crypto.getRandomValues(new Uint8Array(16));
      } else if (typeof salt === 'string') {
        salt = new Uint8Array(atob(salt).split('').map(char => char.charCodeAt(0)));
      }

      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);

      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // Derive key using PBKDF2
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
      );

      // Export key as raw bytes
      const keyBuffer = await crypto.subtle.exportKey('raw', key);
      const hashArray = new Uint8Array(keyBuffer);

      // Convert to hex string
      const hashHex = Array.from(hashArray)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      // Convert salt to base64
      const saltB64 = btoa(String.fromCharCode(...salt));

      return {
        hash: hashHex,
        salt: saltB64
      };
    } catch (error) {
      logger.error('Error hashing password', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify password against stored hash
   */
  async verifyPassword(password, storedHash, storedSalt) {
    try {
      const { hash } = await this.hashPassword(password, storedSalt);
      return hash === storedHash;
    } catch (error) {
      logger.error('Error verifying password', { error: error.message });
      return false;
    }
  }

  /**
   * Create admin user if it doesn't exist
   */
  async ensureAdminUser() {
    try {
      // Check if admin already exists
      const existingAdmin = await this.db.prepare(`
        SELECT id FROM auth_users WHERE username = 'admin'
      `).first();

      if (existingAdmin) {
        logger.info('Admin user already exists');
        return;
      }

      // Create admin user with default password
      const defaultPassword = 'AppWatch2024!';
      const { hash, salt } = await this.hashPassword(defaultPassword);

      await this.db.prepare(`
        INSERT INTO auth_users (username, password_hash, password_salt, role, created_at)
        VALUES (?, ?, ?, 'admin', ?)
      `).bind('admin', hash, salt, new Date().toISOString()).run();

      logger.info('Admin user created with default password', {
        username: 'admin',
        password: defaultPassword
      });

      // Log important security notice
      logger.logSecurityEvent('admin_user_created', 'high', {
        username: 'admin',
        default_password: true,
        action_required: 'Change default password immediately'
      });

    } catch (error) {
      logger.error('Error ensuring admin user', { error: error.message });
      throw error;
    }
  }

  /**
   * Authenticate user with username/password
   */
  async authenticateUser(username, password) {
    try {
      // Get user from database
      const user = await this.db.prepare(`
        SELECT * FROM auth_users 
        WHERE username = ? AND is_active = true
      `).bind(username).first();

      if (!user) {
        logger.logSecurityEvent('login_failed', 'medium', {
          username: username,
          reason: 'user_not_found'
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.password_hash, user.password_salt);
      
      if (!isValid) {
        logger.logSecurityEvent('login_failed', 'medium', {
          username: username,
          reason: 'invalid_password'
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // Create session
      const sessionToken = await this.createSession(user.id);

      // Update last login
      await this.db.prepare(`
        UPDATE auth_users 
        SET last_login = ?, login_count = login_count + 1
        WHERE id = ?
      `).bind(new Date().toISOString(), user.id).run();

      logger.info('User authenticated successfully', {
        user_id: user.id,
        username: user.username,
        role: user.role
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        session_token: sessionToken
      };

    } catch (error) {
      logger.error('Error authenticating user', { 
        username: username, 
        error: error.message 
      });
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Create session token
   */
  async createSession(userId) {
    try {
      // Generate secure session token
      const tokenArray = crypto.getRandomValues(new Uint8Array(32));
      const sessionToken = Array.from(tokenArray)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      const expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();

      // Store session in database
      await this.db.prepare(`
        INSERT INTO auth_sessions (user_id, session_token, expires_at, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(userId, sessionToken, expiresAt, new Date().toISOString()).run();

      // Clean up old sessions
      await this.cleanupExpiredSessions();

      return sessionToken;
    } catch (error) {
      logger.error('Error creating session', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Verify session token
   */
  async verifySession(sessionToken) {
    try {
      if (!sessionToken) {
        return { valid: false, error: 'No session token provided' };
      }

      const session = await this.db.prepare(`
        SELECT s.*, u.id as user_id, u.username, u.role
        FROM auth_sessions s
        JOIN auth_users u ON s.user_id = u.id
        WHERE s.session_token = ? 
        AND s.expires_at > ? 
        AND u.is_active = true
      `).bind(sessionToken, new Date().toISOString()).first();

      if (!session) {
        return { valid: false, error: 'Invalid or expired session' };
      }

      // Update session activity
      await this.db.prepare(`
        UPDATE auth_sessions 
        SET last_activity = ?
        WHERE session_token = ?
      `).bind(new Date().toISOString(), sessionToken).run();

      return {
        valid: true,
        user: {
          id: session.user_id,
          username: session.username,
          role: session.role
        }
      };

    } catch (error) {
      logger.error('Error verifying session', { 
        session_token: sessionToken?.slice(0, 8) + '...', 
        error: error.message 
      });
      return { valid: false, error: 'Session verification failed' };
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(sessionToken) {
    try {
      if (!sessionToken) {
        return { success: false, error: 'No session token provided' };
      }

      const result = await this.db.prepare(`
        DELETE FROM auth_sessions 
        WHERE session_token = ?
      `).bind(sessionToken).run();

      if (result.changes > 0) {
        logger.info('User logged out successfully', {
          session_token: sessionToken.slice(0, 8) + '...'
        });
        return { success: true };
      } else {
        return { success: false, error: 'Session not found' };
      }

    } catch (error) {
      logger.error('Error during logout', { 
        session_token: sessionToken?.slice(0, 8) + '...', 
        error: error.message 
      });
      return { success: false, error: 'Logout failed' };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current user
      const user = await this.db.prepare(`
        SELECT * FROM auth_users WHERE id = ? AND is_active = true
      `).bind(userId).first();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValid = await this.verifyPassword(currentPassword, user.password_hash, user.password_salt);
      
      if (!isValid) {
        logger.logSecurityEvent('password_change_failed', 'medium', {
          user_id: userId,
          reason: 'invalid_current_password'
        });
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const { hash, salt } = await this.hashPassword(newPassword);

      // Update password
      await this.db.prepare(`
        UPDATE auth_users 
        SET password_hash = ?, password_salt = ?, updated_at = ?
        WHERE id = ?
      `).bind(hash, salt, new Date().toISOString(), userId).run();

      // Invalidate all existing sessions for this user
      await this.db.prepare(`
        DELETE FROM auth_sessions WHERE user_id = ?
      `).bind(userId).run();

      logger.logSecurityEvent('password_changed', 'low', {
        user_id: userId,
        username: user.username
      });

      return { success: true };

    } catch (error) {
      logger.error('Error changing password', { 
        user_id: userId, 
        error: error.message 
      });
      return { success: false, error: 'Password change failed' };
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const result = await this.db.prepare(`
        DELETE FROM auth_sessions 
        WHERE expires_at < ?
      `).bind(new Date().toISOString()).run();

      if (result.changes > 0) {
        logger.info('Cleaned up expired sessions', {
          deleted_sessions: result.changes
        });
      }
    } catch (error) {
      logger.error('Error cleaning up sessions', { error: error.message });
    }
  }

  /**
   * Get session from request headers
   */
  getSessionFromRequest(request) {
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try session cookie
    const cookies = request.headers.get('Cookie');
    if (cookies) {
      const sessionMatch = cookies.match(/appwatch_session=([^;]+)/);
      if (sessionMatch) {
        return sessionMatch[1];
      }
    }

    return null;
  }
}

/**
 * Authentication middleware for simple auth
 */
export function createSimpleAuthMiddleware(database) {
  const authService = new SimpleAuthService(database);
  
  return {
    authService,
    
    async authenticate(request) {
      const url = new URL(request.url);
      const path = url.pathname;

      // Skip auth for public endpoints
      const publicEndpoints = [
        '/',
        '/login',
        '/favicon.ico',
        '/styles.css',
        '/script.js',
        '/api/auth/login',
        '/api/auth/logout'
      ];

      if (publicEndpoints.includes(path)) {
        return { authenticated: true, skipAuth: true };
      }

      // Get session token
      const sessionToken = authService.getSessionFromRequest(request);
      
      if (!sessionToken) {
        return {
          authenticated: false,
          error: 'No session token provided'
        };
      }

      // Verify session
      const sessionResult = await authService.verifySession(sessionToken);
      
      if (!sessionResult.valid) {
        return {
          authenticated: false,
          error: sessionResult.error
        };
      }

      return {
        authenticated: true,
        user: sessionResult.user
      };
    }
  };
}

/**
 * Factory function
 */
export function createSimpleAuthService(database) {
  return new SimpleAuthService(database);
}