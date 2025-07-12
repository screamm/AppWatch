/**
 * AppWatch User Management Service
 * Handles user registration, authentication integration, and profile management
 */

import { logger } from './logging.js';

/**
 * User Management Service for Multi-tenant AppWatch
 */
export class UserManagementService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Get or create user from Cloudflare Access JWT
   */
  async getOrCreateUser(accessUser) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(accessUser.email);
      
      if (existingUser) {
        // Update last login
        await this.updateLastLogin(existingUser.id);
        
        logger.info('User logged in', {
          user_id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role
        });
        
        return existingUser;
      }

      // Create new user
      const newUser = await this.createUser({
        id: this.generateUserId(),
        email: accessUser.email,
        name: accessUser.name || this.extractNameFromEmail(accessUser.email),
        role: this.determineUserRole(accessUser),
        cloudflare_account_id: accessUser.account_id || null
      });

      logger.info('New user registered', {
        user_id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      return newUser;
    } catch (error) {
      logger.error('Error in getOrCreateUser', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM users 
        WHERE email = ? AND is_active = true
      `).bind(email).first();

      return result || null;
    } catch (error) {
      logger.error('Error getting user by email', { 
        email, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM users 
        WHERE id = ? AND is_active = true
      `).bind(userId).first();

      return result || null;
    } catch (error) {
      logger.error('Error getting user by ID', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      const timestamp = new Date().toISOString();
      
      await this.db.prepare(`
        INSERT INTO users (
          id, email, name, cloudflare_account_id, role, 
          is_active, last_login, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, true, ?, ?, ?)
      `).bind(
        userData.id,
        userData.email,
        userData.name,
        userData.cloudflare_account_id,
        userData.role,
        timestamp,
        timestamp,
        timestamp
      ).run();

      const newUser = await this.getUserById(userData.id);
      
      logger.info('User created successfully', {
        user_id: userData.id,
        email: userData.email,
        role: userData.role
      });

      return newUser;
    } catch (error) {
      logger.error('Error creating user', { 
        email: userData.email, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId) {
    try {
      const timestamp = new Date().toISOString();
      
      await this.db.prepare(`
        UPDATE users 
        SET last_login = ?, updated_at = ?
        WHERE id = ?
      `).bind(timestamp, timestamp, userId).run();

    } catch (error) {
      logger.error('Error updating last login', { 
        user_id: userId, 
        error: error.message 
      });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const allowedFields = ['name', 'cloudflare_account_id'];
      const updateFields = [];
      const values = [];

      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field)) {
          updateFields.push(`${field} = ?`);
          values.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(userId);

      await this.db.prepare(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).bind(...values).run();

      const updatedUser = await this.getUserById(userId);
      
      logger.info('User profile updated', {
        user_id: userId,
        updated_fields: Object.keys(updates)
      });

      return updatedUser;
    } catch (error) {
      logger.error('Error updating user profile', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get user's Cloudflare accounts
   */
  async getUserCloudflareAccounts(userId) {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM cloudflare_accounts 
        WHERE user_id = ? AND is_active = true
        ORDER BY created_at DESC
      `).bind(userId).all();

      return result.results || [];
    } catch (error) {
      logger.error('Error getting user Cloudflare accounts', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Add Cloudflare account for user
   */
  async addCloudflareAccount(userId, accountData) {
    try {
      const timestamp = new Date().toISOString();
      
      const result = await this.db.prepare(`
        INSERT INTO cloudflare_accounts (
          user_id, account_id, account_name, api_token_encrypted,
          token_permissions, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, true, ?)
      `).bind(
        userId,
        accountData.account_id,
        accountData.account_name,
        accountData.api_token_encrypted,
        JSON.stringify(accountData.token_permissions || []),
        timestamp
      ).run();

      logger.info('Cloudflare account added', {
        user_id: userId,
        account_id: accountData.account_id,
        account_name: accountData.account_name
      });

      return result.meta.last_row_id;
    } catch (error) {
      logger.error('Error adding Cloudflare account', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get user's apps
   */
  async getUserApps(userId, filters = {}) {
    try {
      let query = `
        SELECT * FROM apps 
        WHERE owner_id = ?
      `;
      const params = [userId];

      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }

      if (filters.category) {
        query += ` AND category = ?`;
        params.push(filters.category);
      }

      if (filters.auto_discovered !== undefined) {
        query += ` AND auto_discovered = ?`;
        params.push(filters.auto_discovered);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await this.db.prepare(query).bind(...params).all();
      return result.results || [];
    } catch (error) {
      logger.error('Error getting user apps', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const [apps, uptime, recentChecks] = await Promise.all([
        // Total apps count by status
        this.db.prepare(`
          SELECT status, COUNT(*) as count 
          FROM apps 
          WHERE owner_id = ? 
          GROUP BY status
        `).bind(userId).all(),

        // Average uptime
        this.db.prepare(`
          SELECT AVG(uptime_percentage) as avg_uptime
          FROM apps 
          WHERE owner_id = ?
        `).bind(userId).first(),

        // Recent status checks
        this.db.prepare(`
          SELECT COUNT(*) as count
          FROM status_logs sl
          JOIN apps a ON sl.app_id = a.id
          WHERE a.owner_id = ? AND sl.checked_at > datetime('now', '-24 hours')
        `).bind(userId).first()
      ]);

      const appStats = {};
      (apps.results || []).forEach(row => {
        appStats[row.status] = row.count;
      });

      return {
        total_apps: Object.values(appStats).reduce((sum, count) => sum + count, 0),
        apps_by_status: appStats,
        average_uptime: uptime?.avg_uptime || 0,
        recent_checks: recentChecks?.count || 0
      };
    } catch (error) {
      logger.error('Error getting user stats', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return `user-${crypto.randomUUID()}`;
  }

  /**
   * Extract name from email
   */
  extractNameFromEmail(email) {
    const localPart = email.split('@')[0];
    return localPart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Determine user role based on email or groups
   */
  determineUserRole(accessUser) {
    // Check Cloudflare Access groups first
    if (accessUser.groups) {
      if (accessUser.groups.includes('appwatch-admins')) return 'admin';
      if (accessUser.groups.includes('appwatch-operators')) return 'operator';
      if (accessUser.groups.includes('appwatch-viewers')) return 'viewer';
    }

    // Fallback to email-based role assignment
    if (accessUser.email) {
      if (accessUser.email.includes('admin') || 
          accessUser.email.endsWith('@davidrydgren.com')) {
        return 'admin';
      }
    }

    // Default role
    return 'operator';
  }

  /**
   * Check if user owns app
   */
  async userOwnsApp(userId, appId) {
    try {
      const result = await this.db.prepare(`
        SELECT id FROM apps 
        WHERE id = ? AND owner_id = ?
      `).bind(appId, userId).first();

      return !!result;
    } catch (error) {
      logger.error('Error checking app ownership', { 
        user_id: userId, 
        app_id: appId, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteUser(userId) {
    try {
      const timestamp = new Date().toISOString();
      
      await this.db.prepare(`
        UPDATE users 
        SET is_active = false, updated_at = ?
        WHERE id = ?
      `).bind(timestamp, userId).run();

      logger.info('User account deactivated', { user_id: userId });
    } catch (error) {
      logger.error('Error deleting user', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }
}

/**
 * Factory function to create user management service
 */
export function createUserManagementService(database) {
  return new UserManagementService(database);
}