// AppWatch Performance Monitoring & Analytics
// Advanced metrics collection, analysis, and business intelligence

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  constructor(env) {
    this.env = env;
    this.metrics = new Map();
    this.timers = new Map();
  }

  /**
   * Start a performance timer
   */
  startTimer(name, metadata = {}) {
    const timer = {
      name,
      startTime: Date.now(),
      metadata,
      checkpoints: []
    };
    this.timers.set(name, timer);
    return timer;
  }

  /**
   * Add checkpoint to timer
   */
  checkpoint(name, label, metadata = {}) {
    const timer = this.timers.get(name);
    if (timer) {
      timer.checkpoints.push({
        label,
        timestamp: Date.now(),
        elapsed: Date.now() - timer.startTime,
        metadata
      });
    }
  }

  /**
   * End timer and record metric
   */
  endTimer(name, metadata = {}) {
    const timer = this.timers.get(name);
    if (!timer) return null;

    const duration = Date.now() - timer.startTime;
    this.timers.delete(name);

    const metric = {
      name: timer.name,
      type: 'duration',
      value: duration,
      unit: 'milliseconds',
      timestamp: new Date().toISOString(),
      metadata: { ...timer.metadata, ...metadata },
      checkpoints: timer.checkpoints
    };

    this.recordMetric(metric);
    return metric;
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric) {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    
    const metrics = this.metrics.get(metric.name);
    metrics.push(metric);
    
    // Keep only last 1000 metrics per type
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  /**
   * Get metrics summary
   */
  getSummary(timeWindow = 3600000) { // 1 hour default
    const now = Date.now();
    const cutoff = new Date(now - timeWindow).toISOString();
    
    const summary = {};
    
    for (const [name, metrics] of this.metrics) {
      const recentMetrics = metrics.filter(m => m.timestamp >= cutoff);
      
      if (recentMetrics.length === 0) continue;
      
      const values = recentMetrics.map(m => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      
      summary[name] = {
        count: recentMetrics.length,
        sum: sum,
        avg: sum / recentMetrics.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: recentMetrics[recentMetrics.length - 1],
        unit: recentMetrics[0].unit || 'count'
      };
    }
    
    return summary;
  }

  /**
   * Get percentiles for a metric
   */
  getPercentiles(metricName, percentiles = [50, 90, 95, 99], timeWindow = 3600000) {
    const now = Date.now();
    const cutoff = new Date(now - timeWindow).toISOString();
    
    const metrics = this.metrics.get(metricName);
    if (!metrics) return null;
    
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoff);
    if (recentMetrics.length === 0) return null;
    
    const values = recentMetrics.map(m => m.value).sort((a, b) => a - b);
    const result = {};
    
    percentiles.forEach(p => {
      const index = Math.ceil((p / 100) * values.length) - 1;
      result[`p${p}`] = values[Math.max(0, index)];
    });
    
    return result;
  }
}

/**
 * Application health analyzer
 */
export class HealthAnalyzer {
  constructor(env) {
    this.env = env;
  }

  /**
   * Analyze overall system health
   */
  async analyzeSystemHealth() {
    const [apps, recentLogs, stats] = await Promise.all([
      this.env.DB.prepare('SELECT COUNT(*) as total FROM apps').first(),
      this.env.DB.prepare(`
        SELECT status, COUNT(*) as count 
        FROM status_logs 
        WHERE checked_at > datetime('now', '-1 hour')
        GROUP BY status
      `).all(),
      this.env.DB.prepare(`
        SELECT 
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time
        FROM status_logs 
        WHERE checked_at > datetime('now', '-1 hour')
        AND response_time IS NOT NULL
      `).first()
    ]);

    const logCounts = {};
    (recentLogs.results || []).forEach(log => {
      logCounts[log.status] = log.count;
    });

    const totalChecks = Object.values(logCounts).reduce((a, b) => a + b, 0);
    const successRate = totalChecks > 0 ? 
      ((logCounts.online || 0) / totalChecks) * 100 : 100;

    return {
      total_apps: apps.total,
      health_score: this.calculateHealthScore(successRate, stats.avg_response_time),
      success_rate: Math.round(successRate * 100) / 100,
      total_checks_1h: totalChecks,
      response_time: {
        avg: Math.round(stats.avg_response_time || 0),
        min: stats.min_response_time || 0,
        max: stats.max_response_time || 0
      },
      status_distribution: logCounts,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate health score (0-100)
   */
  calculateHealthScore(successRate, avgResponseTime) {
    let score = successRate; // Start with success rate
    
    // Penalize slow response times
    if (avgResponseTime > 5000) score *= 0.7;
    else if (avgResponseTime > 2000) score *= 0.85;
    else if (avgResponseTime > 1000) score *= 0.95;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Analyze individual app performance
   */
  async analyzeAppPerformance(appId, timeWindow = 86400000) { // 24 hours
    const app = await this.env.DB.prepare('SELECT * FROM apps WHERE id = ?').bind(appId).first();
    if (!app) return null;

    const logs = await this.env.DB.prepare(`
      SELECT * FROM status_logs 
      WHERE app_id = ? 
      AND checked_at > datetime('now', '-24 hours')
      ORDER BY checked_at DESC
    `).bind(appId).all();

    const logData = logs.results || [];
    
    if (logData.length === 0) {
      return {
        app_id: appId,
        app_name: app.name,
        no_data: true
      };
    }

    const responseTimes = logData
      .filter(log => log.response_time != null)
      .map(log => log.response_time);

    const uptime = logData.filter(log => log.status === 'online').length / logData.length * 100;
    
    return {
      app_id: appId,
      app_name: app.name,
      uptime_24h: Math.round(uptime * 100) / 100,
      total_checks: logData.length,
      response_time: responseTimes.length > 0 ? {
        avg: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        p95: this.getPercentile(responseTimes, 95)
      } : null,
      incidents: logData.filter(log => log.status === 'offline').length,
      last_incident: logData.find(log => log.status === 'offline')?.checked_at,
      health_trend: this.calculateTrend(logData)
    };
  }

  /**
   * Get percentile value
   */
  getPercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Calculate health trend
   */
  calculateTrend(logs) {
    if (logs.length < 10) return 'insufficient_data';
    
    const recent = logs.slice(0, Math.floor(logs.length / 2));
    const older = logs.slice(Math.floor(logs.length / 2));
    
    const recentUptime = recent.filter(l => l.status === 'online').length / recent.length;
    const olderUptime = older.filter(l => l.status === 'online').length / older.length;
    
    const diff = recentUptime - olderUptime;
    
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'degrading';
    return 'stable';
  }

  /**
   * Detect anomalies in app performance
   */
  async detectAnomalies() {
    const apps = await this.env.DB.prepare('SELECT id, name FROM apps').all();
    const anomalies = [];

    for (const app of apps.results || []) {
      const analysis = await this.analyzeAppPerformance(app.id);
      
      if (!analysis || analysis.no_data) continue;
      
      // Detect anomalies
      if (analysis.uptime_24h < 95) {
        anomalies.push({
          app_id: app.id,
          app_name: app.name,
          type: 'low_uptime',
          severity: analysis.uptime_24h < 90 ? 'high' : 'medium',
          value: analysis.uptime_24h,
          threshold: 95
        });
      }
      
      if (analysis.response_time && analysis.response_time.avg > 5000) {
        anomalies.push({
          app_id: app.id,
          app_name: app.name,
          type: 'slow_response',
          severity: analysis.response_time.avg > 10000 ? 'high' : 'medium',
          value: analysis.response_time.avg,
          threshold: 5000
        });
      }
      
      if (analysis.health_trend === 'degrading') {
        anomalies.push({
          app_id: app.id,
          app_name: app.name,
          type: 'degrading_performance',
          severity: 'medium',
          trend: analysis.health_trend
        });
      }
    }

    return anomalies;
  }
}

/**
 * SLA (Service Level Agreement) monitoring
 */
export class SLAMonitor {
  constructor(env) {
    this.env = env;
  }

  /**
   * Check SLA compliance for all apps
   */
  async checkSLACompliance() {
    const slaConfigs = await this.env.DB.prepare(`
      SELECT s.*, a.name as app_name, a.url as app_url
      FROM sla_configs s
      JOIN apps a ON s.app_id = a.id
      WHERE s.enabled = 1
    `).all();

    const results = [];

    for (const sla of slaConfigs.results || []) {
      const compliance = await this.checkAppSLA(sla);
      results.push(compliance);
    }

    return results;
  }

  /**
   * Check SLA compliance for a specific app
   */
  async checkAppSLA(slaConfig) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const stats = await this.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks,
        AVG(response_time) as avg_response_time,
        MAX(response_time) as max_response_time
      FROM status_logs 
      WHERE app_id = ? 
      AND checked_at > ?
      AND response_time IS NOT NULL
    `).bind(slaConfig.app_id, thirtyDaysAgo).first();

    const actualUptime = stats.total_checks > 0 ? 
      (stats.successful_checks / stats.total_checks) * 100 : 100;

    const uptimeCompliant = actualUptime >= slaConfig.target_uptime;
    const responseCompliant = (stats.avg_response_time || 0) <= slaConfig.max_response_time;

    return {
      app_id: slaConfig.app_id,
      app_name: slaConfig.app_name,
      sla_id: slaConfig.id,
      uptime: {
        target: slaConfig.target_uptime,
        actual: Math.round(actualUptime * 100) / 100,
        compliant: uptimeCompliant,
        difference: actualUptime - slaConfig.target_uptime
      },
      response_time: {
        target: slaConfig.max_response_time,
        actual: Math.round(stats.avg_response_time || 0),
        max: stats.max_response_time || 0,
        compliant: responseCompliant
      },
      overall_compliant: uptimeCompliant && responseCompliant,
      period: '30 days',
      checked_at: new Date().toISOString()
    };
  }

  /**
   * Generate SLA report
   */
  async generateSLAReport(period = 30) {
    const compliance = await this.checkSLACompliance();
    
    const summary = {
      total_apps: compliance.length,
      compliant_apps: compliance.filter(c => c.overall_compliant).length,
      uptime_violations: compliance.filter(c => !c.uptime.compliant).length,
      response_violations: compliance.filter(c => !c.response_time.compliant).length,
      avg_uptime: compliance.length > 0 ? 
        compliance.reduce((sum, c) => sum + c.uptime.actual, 0) / compliance.length : 100,
      period_days: period,
      generated_at: new Date().toISOString()
    };

    return {
      summary,
      details: compliance
    };
  }
}

/**
 * Cost and resource usage monitor
 */
export class ResourceMonitor {
  constructor(env) {
    this.env = env;
  }

  /**
   * Estimate costs based on usage
   */
  async estimateCosts() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const stats = await this.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_checks,
        COUNT(DISTINCT app_id) as unique_apps
      FROM status_logs 
      WHERE checked_at >= ?
    `).bind(monthStart).first();

    // Cloudflare Workers pricing (approximate)
    const requestCost = 0.0000005; // $0.50 per million requests
    const dbOperationCost = 0.000001; // $1 per million operations
    
    const estimatedMonthlyCost = 
      (stats.total_checks * requestCost) + 
      (stats.total_checks * 3 * dbOperationCost); // ~3 DB ops per check

    return {
      current_month: {
        total_checks: stats.total_checks,
        unique_apps: stats.unique_apps,
        estimated_cost_usd: Math.round(estimatedMonthlyCost * 10000) / 10000
      },
      daily_average: {
        checks: Math.round(stats.total_checks / now.getDate()),
        cost_usd: Math.round((estimatedMonthlyCost / now.getDate()) * 10000) / 10000
      },
      projected_monthly: {
        checks: Math.round(stats.total_checks / now.getDate() * 30),
        cost_usd: Math.round((estimatedMonthlyCost / now.getDate() * 30) * 10000) / 10000
      }
    };
  }

  /**
   * Get database usage statistics
   */
  async getDatabaseStats() {
    const [appCount, logCount, alertCount, slaCount] = await Promise.all([
      this.env.DB.prepare('SELECT COUNT(*) as count FROM apps').first(),
      this.env.DB.prepare('SELECT COUNT(*) as count FROM status_logs').first(),
      this.env.DB.prepare('SELECT COUNT(*) as count FROM alerts').first(),
      this.env.DB.prepare('SELECT COUNT(*) as count FROM sla_configs').first()
    ]);

    const oldLogs = await this.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM status_logs 
      WHERE checked_at < datetime('now', '-30 days')
    `).first();

    return {
      tables: {
        apps: appCount.count,
        status_logs: logCount.count,
        alerts: alertCount.count,
        sla_configs: slaCount.count
      },
      cleanup_candidates: {
        old_logs: oldLogs.count
      },
      total_records: appCount.count + logCount.count + alertCount.count + slaCount.count
    };
  }
}

/**
 * Main performance monitoring service
 */
export class PerformanceMonitoringService {
  constructor(env) {
    this.env = env;
    this.metrics = new PerformanceMetrics(env);
    this.healthAnalyzer = new HealthAnalyzer(env);
    this.slaMonitor = new SLAMonitor(env);
    this.resourceMonitor = new ResourceMonitor(env);
  }

  /**
   * Get comprehensive performance dashboard data
   */
  async getDashboardData() {
    const [systemHealth, anomalies, slaReport, costs, dbStats] = await Promise.all([
      this.healthAnalyzer.analyzeSystemHealth(),
      this.healthAnalyzer.detectAnomalies(),
      this.slaMonitor.generateSLAReport(),
      this.resourceMonitor.estimateCosts(),
      this.resourceMonitor.getDatabaseStats()
    ]);

    return {
      system_health: systemHealth,
      anomalies,
      sla_compliance: slaReport,
      resource_usage: {
        costs,
        database: dbStats
      },
      metrics_summary: this.metrics.getSummary(),
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Record API endpoint performance
   */
  recordEndpointPerformance(endpoint, method, duration, statusCode) {
    this.metrics.recordMetric({
      name: 'api_endpoint_duration',
      type: 'duration',
      value: duration,
      unit: 'milliseconds',
      timestamp: new Date().toISOString(),
      metadata: {
        endpoint,
        method,
        status_code: statusCode
      }
    });
  }
}

// Export factory function
export function createPerformanceMonitor(env) {
  return new PerformanceMonitoringService(env);
}