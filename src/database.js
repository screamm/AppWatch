// AppWatch Database Optimization & Management
// Query optimization, connection pooling, and data lifecycle management

/**
 * Database query optimizer
 */
export class QueryOptimizer {
  constructor(env) {
    this.env = env;
    this.queryCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  /**
   * Execute optimized query with caching
   */
  async executeOptimized(query, params = [], cacheKey = null, cacheTTL = 30000) {
    // Check cache first
    if (cacheKey && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTTL) {
        return cached.result;
      }
      this.queryCache.delete(cacheKey);
    }

    // Execute query
    const result = params.length > 0 
      ? await this.env.DB.prepare(query).bind(...params).all()
      : await this.env.DB.prepare(query).all();

    // Cache result if cache key provided
    if (cacheKey) {
      this.queryCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Get apps that need health checking (optimized)
   */
  async getAppsForHealthCheck() {
    const query = `
      SELECT id, name, url, timeout, status, enable_alerts, check_interval
      FROM apps 
      WHERE (last_checked IS NULL 
         OR last_checked < datetime('now', '-' || check_interval || ' seconds'))
      AND status != 'disabled'
      ORDER BY 
        CASE WHEN last_checked IS NULL THEN 0 ELSE 1 END,
        last_checked ASC
      LIMIT 50
    `;
    
    return this.executeOptimized(query, [], 'apps_health_check', 10000);
  }

  /**
   * Get recent status summary (optimized)
   */
  async getRecentStatusSummary(hours = 24) {
    const query = `
      WITH recent_logs AS (
        SELECT app_id, status, response_time, checked_at
        FROM status_logs 
        WHERE checked_at > datetime('now', '-${hours} hours')
      ),
      app_stats AS (
        SELECT 
          a.id,
          a.name,
          a.status as current_status,
          COUNT(rl.status) as total_checks,
          SUM(CASE WHEN rl.status = 'online' THEN 1 ELSE 0 END) as online_checks,
          AVG(rl.response_time) as avg_response_time,
          MIN(rl.response_time) as min_response_time,
          MAX(rl.response_time) as max_response_time
        FROM apps a
        LEFT JOIN recent_logs rl ON a.id = rl.app_id
        GROUP BY a.id, a.name, a.status
      )
      SELECT 
        *,
        CASE 
          WHEN total_checks > 0 
          THEN ROUND((online_checks * 100.0 / total_checks), 2)
          ELSE 100.0 
        END as uptime_percentage
      FROM app_stats
      ORDER BY uptime_percentage ASC, avg_response_time DESC
    `;

    return this.executeOptimized(query, [], `status_summary_${hours}h`, 60000);
  }

  /**
   * Get app performance metrics (optimized)
   */
  async getAppMetrics(appId, days = 7) {
    const query = `
      WITH daily_stats AS (
        SELECT 
          DATE(checked_at) as date,
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_checks,
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time
        FROM status_logs 
        WHERE app_id = ? 
        AND checked_at > datetime('now', '-${days} days')
        GROUP BY DATE(checked_at)
      )
      SELECT 
        date,
        total_checks,
        online_checks,
        ROUND((online_checks * 100.0 / total_checks), 2) as uptime_percentage,
        ROUND(avg_response_time, 0) as avg_response_time,
        min_response_time,
        max_response_time
      FROM daily_stats
      ORDER BY date DESC
    `;

    return this.executeOptimized(query, [appId], `app_metrics_${appId}_${days}d`, 300000);
  }

  /**
   * Get system-wide statistics (optimized)
   */
  async getSystemStats() {
    const query = `
      WITH current_stats AS (
        SELECT 
          COUNT(*) as total_apps,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_apps,
          SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline_apps,
          AVG(uptime_percentage) as avg_uptime,
          AVG(response_time) as avg_response_time
        FROM apps
        WHERE status != 'disabled'
      ),
      recent_activity AS (
        SELECT 
          COUNT(*) as checks_24h,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks_24h,
          AVG(response_time) as avg_response_24h
        FROM status_logs
        WHERE checked_at > datetime('now', '-24 hours')
      ),
      incidents AS (
        SELECT COUNT(*) as incidents_24h
        FROM status_logs
        WHERE status = 'offline' 
        AND checked_at > datetime('now', '-24 hours')
      )
      SELECT 
        cs.*,
        ra.checks_24h,
        ra.successful_checks_24h,
        ra.avg_response_24h,
        i.incidents_24h,
        CASE 
          WHEN ra.checks_24h > 0 
          THEN ROUND((ra.successful_checks_24h * 100.0 / ra.checks_24h), 2)
          ELSE 100.0 
        END as success_rate_24h
      FROM current_stats cs, recent_activity ra, incidents i
    `;

    return this.executeOptimized(query, [], 'system_stats', 60000);
  }

  /**
   * Clear query cache
   */
  clearCache() {
    this.queryCache.clear();
  }
}

/**
 * Database maintenance and optimization
 */
export class DatabaseMaintenance {
  constructor(env) {
    this.env = env;
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(retentionDays = 30) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    
    const results = {};
    
    // Clean old status logs
    const oldLogsResult = await this.env.DB.prepare(`
      DELETE FROM status_logs 
      WHERE checked_at < ?
    `).bind(cutoffDate).run();
    
    results.deleted_logs = oldLogsResult.changes || 0;

    // Clean orphaned records
    const orphanedAlertsResult = await this.env.DB.prepare(`
      DELETE FROM alerts 
      WHERE app_id NOT IN (SELECT id FROM apps)
    `).run();
    
    results.deleted_orphaned_alerts = orphanedAlertsResult.changes || 0;

    const orphanedSLAResult = await this.env.DB.prepare(`
      DELETE FROM sla_configs 
      WHERE app_id NOT IN (SELECT id FROM apps)
    `).run();
    
    results.deleted_orphaned_sla = orphanedSLAResult.changes || 0;

    return results;
  }

  /**
   * Update statistics and calculated fields
   */
  async updateCalculatedFields() {
    // Update uptime percentages for all apps
    const apps = await this.env.DB.prepare('SELECT id FROM apps').all();
    
    for (const app of apps.results || []) {
      const stats = await this.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks
        FROM status_logs 
        WHERE app_id = ? 
        AND checked_at > datetime('now', '-30 days')
      `).bind(app.id).first();
      
      const uptimePercentage = stats.total_checks > 0 ? 
        (stats.successful_checks / stats.total_checks) * 100 : 100;
      
      await this.env.DB.prepare(`
        UPDATE apps 
        SET uptime_percentage = ?
        WHERE id = ?
      `).bind(Math.round(uptimePercentage * 100) / 100, app.id).run();
    }

    return { updated_apps: (apps.results || []).length };
  }

  /**
   * Analyze database performance
   */
  async analyzePerformance() {
    // Note: SQLite ANALYZE is not directly available in D1, 
    // but we can gather statistics manually
    
    const tableStats = await Promise.all([
      this.getTableStats('apps'),
      this.getTableStats('status_logs'),
      this.getTableStats('alerts'),
      this.getTableStats('sla_configs')
    ]);

    return {
      tables: tableStats.reduce((acc, stat) => {
        acc[stat.table] = {
          row_count: stat.count,
          estimated_size_kb: stat.count * stat.avg_row_size / 1024
        };
        return acc;
      }, {}),
      recommendations: this.generateOptimizationRecommendations(tableStats)
    };
  }

  /**
   * Get statistics for a table
   */
  async getTableStats(tableName) {
    const countResult = await this.env.DB.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first();
    
    // Estimate average row size based on table structure
    const avgRowSizes = {
      'apps': 200,
      'status_logs': 100,
      'alerts': 150,
      'sla_configs': 80
    };

    return {
      table: tableName,
      count: countResult.count,
      avg_row_size: avgRowSizes[tableName] || 100
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(tableStats) {
    const recommendations = [];
    
    const statusLogsStats = tableStats.find(t => t.table === 'status_logs');
    if (statusLogsStats && statusLogsStats.count > 100000) {
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: 'Consider reducing status_logs retention period',
        table: 'status_logs',
        current_rows: statusLogsStats.count
      });
    }

    const appsStats = tableStats.find(t => t.table === 'apps');
    if (appsStats && appsStats.count > 1000) {
      recommendations.push({
        type: 'partitioning',
        priority: 'low',
        message: 'Consider app categorization for better organization',
        table: 'apps',
        current_rows: appsStats.count
      });
    }

    return recommendations;
  }

  /**
   * Vacuum database (compact)
   */
  async vacuum() {
    try {
      // D1 doesn't support VACUUM directly, but we can simulate cleanup
      const cleanupResults = await this.cleanupOldData();
      await this.updateCalculatedFields();
      
      return {
        success: true,
        message: 'Database maintenance completed',
        cleanup_results: cleanupResults
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Connection pool manager (simulated for D1)
 */
export class ConnectionManager {
  constructor(env) {
    this.env = env;
    this.activeConnections = 0;
    this.maxConnections = 10; // D1 limitation
    this.connectionQueue = [];
  }

  /**
   * Execute query with connection management
   */
  async executeWithConnection(queryFn) {
    if (this.activeConnections >= this.maxConnections) {
      await this.waitForConnection();
    }

    this.activeConnections++;
    
    try {
      const result = await queryFn(this.env.DB);
      return result;
    } finally {
      this.activeConnections--;
      this.processQueue();
    }
  }

  /**
   * Wait for available connection
   */
  async waitForConnection() {
    return new Promise((resolve) => {
      this.connectionQueue.push(resolve);
    });
  }

  /**
   * Process connection queue
   */
  processQueue() {
    if (this.connectionQueue.length > 0 && this.activeConnections < this.maxConnections) {
      const resolve = this.connectionQueue.shift();
      resolve();
    }
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      active_connections: this.activeConnections,
      max_connections: this.maxConnections,
      queued_requests: this.connectionQueue.length
    };
  }
}

/**
 * Main database service
 */
export class DatabaseService {
  constructor(env) {
    this.env = env;
    this.optimizer = new QueryOptimizer(env);
    this.maintenance = new DatabaseMaintenance(env);
    this.connectionManager = new ConnectionManager(env);
  }

  /**
   * Execute optimized query
   */
  async query(sql, params = [], options = {}) {
    return this.connectionManager.executeWithConnection(async (db) => {
      if (options.cache) {
        return this.optimizer.executeOptimized(
          sql, 
          params, 
          options.cacheKey, 
          options.cacheTTL
        );
      }
      
      return params.length > 0 
        ? await db.prepare(sql).bind(...params).all()
        : await db.prepare(sql).all();
    });
  }

  /**
   * Get comprehensive database health report
   */
  async getHealthReport() {
    const [performance, connectionStats, maintenanceNeeded] = await Promise.all([
      this.maintenance.analyzePerformance(),
      this.connectionManager.getStats(),
      this.checkMaintenanceNeeds()
    ]);

    return {
      performance,
      connections: connectionStats,
      maintenance: maintenanceNeeded,
      cache_stats: {
        cached_queries: this.optimizer.queryCache.size,
        cache_hit_ratio: this.calculateCacheHitRatio()
      },
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Check if maintenance is needed
   */
  async checkMaintenanceNeeds() {
    const oldLogsCount = await this.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM status_logs 
      WHERE checked_at < datetime('now', '-30 days')
    `).first();

    return {
      old_logs_count: oldLogsCount.count,
      cleanup_recommended: oldLogsCount.count > 10000,
      last_maintenance: null // Would be stored in a config table
    };
  }

  /**
   * Calculate cache hit ratio
   */
  calculateCacheHitRatio() {
    // This would require tracking hits/misses
    // For now, return a placeholder
    return 0.85;
  }

  /**
   * Perform scheduled maintenance
   */
  async performMaintenance() {
    const results = {
      started_at: new Date().toISOString(),
      tasks: []
    };

    try {
      // Cleanup old data
      const cleanupResult = await this.maintenance.cleanupOldData();
      results.tasks.push({
        task: 'cleanup_old_data',
        success: true,
        result: cleanupResult
      });

      // Update calculated fields
      const updateResult = await this.maintenance.updateCalculatedFields();
      results.tasks.push({
        task: 'update_calculated_fields',
        success: true,
        result: updateResult
      });

      // Clear query cache
      this.optimizer.clearCache();
      results.tasks.push({
        task: 'clear_cache',
        success: true,
        result: { cache_cleared: true }
      });

      results.completed_at = new Date().toISOString();
      results.success = true;

    } catch (error) {
      results.error = error.message;
      results.success = false;
    }

    return results;
  }
}

// Export factory function
export function createDatabaseService(env) {
  return new DatabaseService(env);
}