/**
 * Cloudflare Auto-Discovery Service
 * Automatically discovers and imports Cloudflare Workers and Pages projects
 */

import { logger } from './logging.js';

/**
 * Cloudflare API Service for Auto-Discovery
 */
export class CloudflareDiscoveryService {
  constructor(database, userManagement) {
    this.db = database;
    this.userManagement = userManagement;
  }

  /**
   * Discover all Cloudflare resources for a user
   */
  async discoverUserResources(userId, apiToken) {
    try {
      logger.info('Starting Cloudflare discovery', { user_id: userId });

      const discovered = {
        workers: [],
        pages: [],
        errors: []
      };

      // Discover Workers
      try {
        const workers = await this.discoverWorkers(apiToken);
        discovered.workers = workers;
        logger.info('Workers discovered', { 
          user_id: userId, 
          count: workers.length 
        });
      } catch (error) {
        discovered.errors.push(`Workers discovery failed: ${error.message}`);
        logger.error('Workers discovery failed', { 
          user_id: userId, 
          error: error.message 
        });
      }

      // Discover Pages
      try {
        const pages = await this.discoverPages(apiToken);
        discovered.pages = pages;
        logger.info('Pages discovered', { 
          user_id: userId, 
          count: pages.length 
        });
      } catch (error) {
        discovered.errors.push(`Pages discovery failed: ${error.message}`);
        logger.error('Pages discovery failed', { 
          user_id: userId, 
          error: error.message 
        });
      }

      return discovered;
    } catch (error) {
      logger.error('Error in discoverUserResources', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Discover Cloudflare Workers
   */
  async discoverWorkers(apiToken) {
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/accounts', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.status}`);
      }

      const accountsData = await response.json();
      
      if (!accountsData.success || !accountsData.result?.length) {
        throw new Error('No Cloudflare accounts found');
      }

      const workers = [];

      // Get workers for each account
      for (const account of accountsData.result) {
        try {
          const workersResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${account.id}/workers/scripts`,
            {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (workersResponse.ok) {
            const workersData = await workersResponse.json();
            
            if (workersData.success && workersData.result) {
              for (const worker of workersData.result) {
                // Get worker subdomain/routes
                const routes = await this.getWorkerRoutes(account.id, worker.id, apiToken);
                
                workers.push({
                  id: worker.id,
                  name: worker.id,
                  account_id: account.id,
                  account_name: account.name,
                  type: 'worker',
                  urls: routes,
                  created_on: worker.created_on,
                  modified_on: worker.modified_on
                });
              }
            }
          }
        } catch (error) {
          logger.error('Error getting workers for account', { 
            account_id: account.id, 
            error: error.message 
          });
        }
      }

      return workers;
    } catch (error) {
      logger.error('Error discovering workers', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Worker routes/URLs
   */
  async getWorkerRoutes(accountId, workerId, apiToken) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerId}/routes`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result) {
          return data.result.map(route => route.pattern);
        }
      }

      // Fallback: try to construct subdomain URL
      return [`https://${workerId}.workers.dev`];
    } catch (error) {
      logger.error('Error getting worker routes', { 
        worker_id: workerId, 
        error: error.message 
      });
      return [`https://${workerId}.workers.dev`];
    }
  }

  /**
   * Discover Cloudflare Pages
   */
  async discoverPages(apiToken) {
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/accounts', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.status}`);
      }

      const accountsData = await response.json();
      
      if (!accountsData.success || !accountsData.result?.length) {
        return [];
      }

      const pages = [];

      // Get pages for each account
      for (const account of accountsData.result) {
        try {
          const pagesResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${account.id}/pages/projects`,
            {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json();
            
            if (pagesData.success && pagesData.result) {
              for (const page of pagesData.result) {
                const urls = [];
                
                // Add subdomain URL
                if (page.subdomain) {
                  urls.push(`https://${page.subdomain}.pages.dev`);
                }
                
                // Add custom domains
                if (page.domains) {
                  page.domains.forEach(domain => {
                    urls.push(`https://${domain}`);
                  });
                }

                pages.push({
                  id: page.id,
                  name: page.name,
                  account_id: account.id,
                  account_name: account.name,
                  type: 'pages',
                  urls: urls,
                  subdomain: page.subdomain,
                  domains: page.domains || [],
                  created_on: page.created_on,
                  modified_on: page.modified_on
                });
              }
            }
          }
        } catch (error) {
          logger.error('Error getting pages for account', { 
            account_id: account.id, 
            error: error.message 
          });
        }
      }

      return pages;
    } catch (error) {
      logger.error('Error discovering pages', { error: error.message });
      throw error;
    }
  }

  /**
   * Import discovered resources as apps
   */
  async importDiscoveredResources(userId, discovered, options = {}) {
    try {
      const imported = {
        workers: [],
        pages: [],
        skipped: [],
        errors: []
      };

      // Import Workers
      for (const worker of discovered.workers) {
        try {
          const result = await this.importWorkerAsApp(userId, worker, options);
          if (result.imported) {
            imported.workers.push(result.app);
          } else {
            imported.skipped.push({
              name: worker.name,
              reason: result.reason
            });
          }
        } catch (error) {
          imported.errors.push({
            name: worker.name,
            error: error.message
          });
        }
      }

      // Import Pages
      for (const page of discovered.pages) {
        try {
          const result = await this.importPageAsApp(userId, page, options);
          if (result.imported) {
            imported.pages.push(result.app);
          } else {
            imported.skipped.push({
              name: page.name,
              reason: result.reason
            });
          }
        } catch (error) {
          imported.errors.push({
            name: page.name,
            error: error.message
          });
        }
      }

      logger.info('Resources imported', {
        user_id: userId,
        workers_imported: imported.workers.length,
        pages_imported: imported.pages.length,
        skipped: imported.skipped.length,
        errors: imported.errors.length
      });

      return imported;
    } catch (error) {
      logger.error('Error importing discovered resources', { 
        user_id: userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Import Worker as App
   */
  async importWorkerAsApp(userId, worker, options = {}) {
    try {
      // Choose primary URL (first route or subdomain)
      const primaryUrl = worker.urls && worker.urls.length > 0 
        ? worker.urls[0] 
        : `https://${worker.name}.workers.dev`;

      // Check if app already exists
      const existingApp = await this.db.prepare(`
        SELECT id FROM apps 
        WHERE cloudflare_worker_name = ? AND owner_id = ?
      `).bind(worker.name, userId).first();

      if (existingApp && !options.update_existing) {
        return {
          imported: false,
          reason: 'App already exists'
        };
      }

      const appData = {
        id: `cf-worker-${crypto.randomUUID()}`,
        name: `🔧 ${worker.name}`,
        url: primaryUrl,
        description: `Cloudflare Worker - Auto-discovered from ${worker.account_name}`,
        category: 'api',
        owner_id: userId,
        cloudflare_worker_name: worker.name,
        auto_discovered: true,
        status: 'unknown',
        check_interval: options.check_interval || 300,
        timeout: options.timeout || 10000,
        enable_alerts: options.enable_alerts !== false,
        created_at: new Date().toISOString()
      };

      if (existingApp) {
        // Update existing app
        await this.db.prepare(`
          UPDATE apps SET 
            name = ?, url = ?, description = ?, 
            updated_at = ?
          WHERE id = ?
        `).bind(
          appData.name,
          appData.url,
          appData.description,
          appData.created_at,
          existingApp.id
        ).run();

        appData.id = existingApp.id;
      } else {
        // Create new app
        await this.db.prepare(`
          INSERT INTO apps (
            id, name, url, description, category, status,
            check_interval, timeout, enable_alerts, owner_id,
            cloudflare_worker_name, auto_discovered, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          appData.id, appData.name, appData.url, appData.description,
          appData.category, appData.status, appData.check_interval,
          appData.timeout, appData.enable_alerts, appData.owner_id,
          appData.cloudflare_worker_name, appData.auto_discovered,
          appData.created_at
        ).run();
      }

      return {
        imported: true,
        app: appData
      };
    } catch (error) {
      logger.error('Error importing worker as app', { 
        worker_name: worker.name, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Import Page as App
   */
  async importPageAsApp(userId, page, options = {}) {
    try {
      // Choose primary URL
      const primaryUrl = page.urls && page.urls.length > 0 
        ? page.urls[0] 
        : `https://${page.subdomain}.pages.dev`;

      // Check if app already exists
      const existingApp = await this.db.prepare(`
        SELECT id FROM apps 
        WHERE cloudflare_worker_name = ? AND owner_id = ?
      `).bind(page.name, userId).first();

      if (existingApp && !options.update_existing) {
        return {
          imported: false,
          reason: 'App already exists'
        };
      }

      const appData = {
        id: `cf-pages-${crypto.randomUUID()}`,
        name: `📄 ${page.name}`,
        url: primaryUrl,
        description: `Cloudflare Pages - Auto-discovered from ${page.account_name}`,
        category: 'web',
        owner_id: userId,
        cloudflare_worker_name: page.name,
        auto_discovered: true,
        status: 'unknown',
        check_interval: options.check_interval || 300,
        timeout: options.timeout || 10000,
        enable_alerts: options.enable_alerts !== false,
        created_at: new Date().toISOString()
      };

      if (existingApp) {
        // Update existing app
        await this.db.prepare(`
          UPDATE apps SET 
            name = ?, url = ?, description = ?, 
            updated_at = ?
          WHERE id = ?
        `).bind(
          appData.name,
          appData.url,
          appData.description,
          appData.created_at,
          existingApp.id
        ).run();

        appData.id = existingApp.id;
      } else {
        // Create new app
        await this.db.prepare(`
          INSERT INTO apps (
            id, name, url, description, category, status,
            check_interval, timeout, enable_alerts, owner_id,
            cloudflare_worker_name, auto_discovered, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          appData.id, appData.name, appData.url, appData.description,
          appData.category, appData.status, appData.check_interval,
          appData.timeout, appData.enable_alerts, appData.owner_id,
          appData.cloudflare_worker_name, appData.auto_discovered,
          appData.created_at
        ).run();
      }

      return {
        imported: true,
        app: appData
      };
    } catch (error) {
      logger.error('Error importing page as app', { 
        page_name: page.name, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Test API token permissions
   */
  async testApiToken(apiToken) {
    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.errors?.[0]?.message || 'Invalid API token');
      }

      return {
        valid: true,
        token_info: data.result
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Encrypt API token for storage
   */
  async encryptApiToken(token, userId) {
    try {
      // Simple encryption using Web Crypto API
      // In production, consider using a more robust encryption method
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      
      // Use user ID as part of key derivation
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userId.slice(0, 32).padEnd(32, '0')),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('appwatch-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);
      
      // Convert to base64
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      logger.error('Error encrypting API token', { error: error.message });
      throw error;
    }
  }

  /**
   * Decrypt API token
   */
  async decryptApiToken(encryptedToken, userId) {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Convert from base64
      const encrypted = new Uint8Array(
        atob(encryptedToken).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract IV and data
      const iv = encrypted.slice(0, 12);
      const data = encrypted.slice(12);
      
      // Recreate key
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userId.slice(0, 32).padEnd(32, '0')),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('appwatch-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );
      
      return decoder.decode(decrypted);
    } catch (error) {
      logger.error('Error decrypting API token', { error: error.message });
      throw error;
    }
  }
}

/**
 * Factory function to create Cloudflare discovery service
 */
export function createCloudflareDiscoveryService(database, userManagement) {
  return new CloudflareDiscoveryService(database, userManagement);
}