// AppWatch Monitoring & Self-Healing System
// Handles automated health checks, circuit breakers, and recovery mechanisms

/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests to failing services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 300000; // 5 minutes
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = 0;
    this.nextAttempt = 0;
    this.successCount = 0;
  }

  async execute(operation, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        // Circuit is open, use fallback
        return fallback ? fallback() : { success: false, status: 'circuit_open' };
      }
      // Time to try half-open
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        // If we get enough successes, close the circuit
        if (this.successCount >= 2) {
          this.reset();
        }
      } else {
        // Reset failure count on success
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.resetTimeout;
      }
      
      if (fallback) {
        return fallback();
      }
      
      throw error;
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt
    };
  }
}

// Global circuit breaker instances per app
const circuitBreakers = new Map();

/**
 * Get or create circuit breaker for an app
 */
function getCircuitBreaker(appId) {
  if (!circuitBreakers.has(appId)) {
    circuitBreakers.set(appId, new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 120000, // 2 minutes
      monitoringPeriod: 300000 // 5 minutes
    }));
  }
  return circuitBreakers.get(appId);
}

/**
 * Enhanced health check with circuit breaker and retry logic
 */
async function performHealthCheck(app) {
  const circuitBreaker = getCircuitBreaker(app.id);
  
  const healthCheckOperation = async () => {
    const startTime = Date.now();
    const timeoutMs = app.timeout || 10000;
    
    // Exponential backoff for retries
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(app.url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'AppWatch-Monitor/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        return {
          success: true,
          status: response.ok ? 'online' : 'offline',
          response_time: responseTime,
          http_status: response.status,
          attempt: attempt
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    throw lastError;
  };
  
  const fallback = () => ({
    success: false,
    status: 'circuit_open',
    response_time: 0,
    error: 'Circuit breaker is open'
  });
  
  try {
    return await circuitBreaker.execute(healthCheckOperation, fallback);
  } catch (error) {
    return {
      success: false,
      status: 'offline',
      response_time: Date.now() - Date.now(),
      error: error.message
    };
  }
}

/**
 * Automated health check for all apps
 */
export async function runAutomatedHealthChecks(env) {
  const startTime = Date.now();
  const { logger } = await import('./logging.js');
  const { createDatabaseService } = await import('./database.js');
  
  logger.info('Starting automated health checks');
  
  try {
    // Get apps that need checking using optimized query
    const dbService = createDatabaseService(env);
    const apps = await dbService.optimizer.getAppsForHealthCheck();
    
    if (!apps.results || apps.results.length === 0) {
      logger.debug('No apps need health checks at this time');
      return { checked: 0, results: [] };
    }
    
    logger.info(`Health checking ${apps.results.length} apps`);
    
    // Process health checks concurrently (but limit concurrency)
    const results = [];
    const concurrencyLimit = 5;
    
    for (let i = 0; i < apps.results.length; i += concurrencyLimit) {
      const batch = apps.results.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(app => processAppHealthCheck(app, env))
      );
      results.push(...batchResults);
    }
    
    // Calculate uptime percentages
    await updateUptimePercentages(env);
    
    const duration = Date.now() - startTime;
    logger.info(`Health checks completed`, {
      duration_ms: duration,
      apps_checked: results.length,
      status_changes: results.filter(r => r.status_changed).length
    });
    
    logger.logMetric('health_checks_completed', results.length);
    logger.logMetric('health_check_duration', duration, 'milliseconds');
    
    return {
      checked: results.length,
      results: results.filter(r => r.status_changed),
      duration
    };
  } catch (error) {
    logger.error('Error in automated health checks', error);
    throw error;
  }
}

/**
 * Process health check for a single app
 */
async function processAppHealthCheck(app, env) {
  const now = new Date().toISOString();
  const { logger } = await import('./logging.js');
  
  try {
    const result = await performHealthCheck(app);
    const oldStatus = app.status;
    const newStatus = result.status;
    
    logger.logHealthCheck(app, result);
    
    // Update app status
    await env.DB.prepare(`
      UPDATE apps 
      SET status = ?, last_checked = ?, response_time = ?
      WHERE id = ?
    `).bind(newStatus, now, result.response_time, app.id).run();
    
    // Log the check
    await env.DB.prepare(`
      INSERT INTO status_logs (app_id, status, response_time, checked_at, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      app.id, 
      newStatus, 
      result.response_time, 
      now, 
      result.error || null
    ).run();
    
    // Check if we need to trigger alerts
    const statusChanged = oldStatus !== newStatus;
    if (statusChanged && app.enable_alerts) {
      logger.logMonitoringEvent('status_change', app, {
        old: oldStatus,
        new: newStatus,
        response_time: result.response_time
      });
      await triggerStatusAlert(app, oldStatus, newStatus, env);
    }
    
    return {
      app_id: app.id,
      app_name: app.name,
      old_status: oldStatus,
      new_status: newStatus,
      status_changed: statusChanged,
      response_time: result.response_time,
      circuit_breaker: getCircuitBreaker(app.id).getStats()
    };
  } catch (error) {
    logger.error(`Health check failed for app ${app.id}`, error, {
      app_id: app.id,
      app_name: app.name,
      app_url: app.url
    });
    
    // Still log the failure
    await env.DB.prepare(`
      INSERT INTO status_logs (app_id, status, response_time, checked_at, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).bind(app.id, 'offline', 0, now, error.message).run();
    
    return {
      app_id: app.id,
      app_name: app.name,
      old_status: app.status,
      new_status: 'offline',
      status_changed: app.status !== 'offline',
      error: error.message
    };
  }
}

/**
 * Calculate and update uptime percentages
 */
async function updateUptimePercentages(env) {
  const apps = await env.DB.prepare('SELECT id FROM apps').all();
  
  for (const app of apps.results || []) {
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks
      FROM status_logs 
      WHERE app_id = ? AND checked_at > datetime('now', '-30 days')
    `).bind(app.id).first();
    
    const uptimePercentage = stats.total_checks > 0 ? 
      (stats.successful_checks / stats.total_checks) * 100 : 100;
    
    await env.DB.prepare(`
      UPDATE apps 
      SET uptime_percentage = ?
      WHERE id = ?
    `).bind(Math.round(uptimePercentage * 100) / 100, app.id).run();
  }
}

/**
 * Trigger alerts when status changes
 */
async function triggerStatusAlert(app, oldStatus, newStatus, env) {
  console.log(`Status alert: ${app.name} changed from ${oldStatus} to ${newStatus}`);
  
  try {
    // Import alerting service
    const { createEscalationManager } = await import('./alerting.js');
    const escalationManager = createEscalationManager(env);
    
    const results = await escalationManager.handleStatusChange(app, oldStatus, newStatus);
    console.log('Alert results:', results);
    
    return results;
  } catch (error) {
    console.error(`Failed to process alerts for app ${app.id}:`, error);
    return [];
  }
}


/**
 * Self-healing: Attempt to recover failed services
 */
export async function attemptSelfHealing(env) {
  console.log('Starting self-healing procedures...');
  
  // Find apps that have been offline for a while
  const offlineApps = await env.DB.prepare(`
    SELECT * FROM apps 
    WHERE status = 'offline' 
    AND last_checked < datetime('now', '-10 minutes')
  `).all();
  
  const healingResults = [];
  
  for (const app of offlineApps.results || []) {
    try {
      // Reset circuit breaker to allow retry
      const circuitBreaker = getCircuitBreaker(app.id);
      circuitBreaker.reset();
      
      // Attempt health check
      const result = await performHealthCheck(app);
      
      if (result.success && result.status === 'online') {
        // App is back online!
        const now = new Date().toISOString();
        
        await env.DB.prepare(`
          UPDATE apps 
          SET status = 'online', last_checked = ?, response_time = ?
          WHERE id = ?
        `).bind(now, result.response_time, app.id).run();
        
        await env.DB.prepare(`
          INSERT INTO status_logs (app_id, status, response_time, checked_at)
          VALUES (?, ?, ?, ?)
        `).bind(app.id, 'online', result.response_time, now).run();
        
        healingResults.push({
          app_id: app.id,
          app_name: app.name,
          healed: true,
          response_time: result.response_time
        });
        
        // Trigger recovery alert
        if (app.enable_alerts) {
          await triggerStatusAlert(app, 'offline', 'online', env);
        }
      }
    } catch (error) {
      console.error(`Self-healing failed for app ${app.id}:`, error);
      healingResults.push({
        app_id: app.id,
        app_name: app.name,
        healed: false,
        error: error.message
      });
    }
  }
  
  console.log(`Self-healing completed. Healed ${healingResults.filter(r => r.healed).length} apps`);
  return healingResults;
}

/**
 * Database maintenance and cleanup
 */
export async function performMaintenance(env) {
  console.log('Starting maintenance tasks...');
  
  const tasks = [];
  
  // Clean old status logs (keep last 30 days)
  const cleanupResult = await env.DB.prepare(`
    DELETE FROM status_logs 
    WHERE checked_at < datetime('now', '-30 days')
  `).run();
  
  tasks.push({
    task: 'cleanup_old_logs',
    deleted_records: cleanupResult.changes || 0
  });
  
  // Update app statistics
  await updateUptimePercentages(env);
  tasks.push({ task: 'update_uptime_stats', completed: true });
  
  // Reset circuit breakers for apps that have been stable
  let resetCount = 0;
  for (const [appId, breaker] of circuitBreakers) {
    const stats = breaker.getStats();
    if (stats.state === 'OPEN' && (Date.now() - stats.lastFailureTime) > 3600000) { // 1 hour
      breaker.reset();
      resetCount++;
    }
  }
  
  tasks.push({ task: 'reset_circuit_breakers', reset_count: resetCount });
  
  console.log('Maintenance tasks completed');
  return tasks;
}

/**
 * Get monitoring statistics
 */
export async function getMonitoringStats(env) {
  const stats = await env.DB.prepare(`
    SELECT 
      COUNT(DISTINCT app_id) as monitored_apps,
      COUNT(*) as total_checks,
      SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks,
      AVG(response_time) as avg_response_time,
      MAX(checked_at) as last_check
    FROM status_logs 
    WHERE checked_at > datetime('now', '-24 hours')
  `).first();
  
  return {
    monitored_apps: stats.monitored_apps || 0,
    total_checks_24h: stats.total_checks || 0,
    success_rate_24h: stats.total_checks > 0 ? 
      Math.round((stats.successful_checks / stats.total_checks) * 100) : 0,
    avg_response_time: Math.round(stats.avg_response_time || 0),
    last_check: stats.last_check,
    circuit_breakers: Array.from(circuitBreakers.entries()).map(([appId, breaker]) => ({
      app_id: appId,
      ...breaker.getStats()
    }))
  };
}