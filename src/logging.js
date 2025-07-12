// AppWatch Structured Logging System
// Provides comprehensive logging with structured data, levels, and correlation IDs

/**
 * Log levels in order of severity
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Log level names
 */
const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
};

/**
 * Performance timer for measuring execution times
 */
class PerformanceTimer {
  constructor(name) {
    this.name = name;
    this.startTime = Date.now();
    this.checkpoints = [];
  }

  checkpoint(label) {
    const now = Date.now();
    this.checkpoints.push({
      label,
      timestamp: now,
      elapsed: now - this.startTime
    });
  }

  end() {
    const endTime = Date.now();
    return {
      name: this.name,
      total_duration: endTime - this.startTime,
      checkpoints: this.checkpoints
    };
  }
}

/**
 * Correlation ID manager for tracking requests across services
 */
class CorrelationManager {
  constructor() {
    this.correlationIds = new Map();
  }

  generateId() {
    return crypto.randomUUID();
  }

  setCorrelationId(id) {
    // In a real environment, this would use AsyncLocalStorage or similar
    this.currentId = id;
  }

  getCorrelationId() {
    return this.currentId || this.generateId();
  }

  withCorrelation(id, fn) {
    const oldId = this.currentId;
    this.currentId = id;
    try {
      return fn();
    } finally {
      this.currentId = oldId;
    }
  }
}

/**
 * Main structured logger class
 */
export class StructuredLogger {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'appwatch';
    this.environment = options.environment || 'production';
    this.version = options.version || '1.0.0';
    this.minLevel = options.minLevel || LogLevel.INFO;
    this.correlationManager = new CorrelationManager();
    this.timers = new Map();
  }

  /**
   * Create a base log entry with common fields
   */
  createBaseEntry(level, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: LOG_LEVEL_NAMES[level],
      service: this.serviceName,
      version: this.version,
      environment: this.environment,
      correlation_id: this.correlationManager.getCorrelationId(),
      message,
      ...metadata
    };
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return level >= this.minLevel;
  }

  /**
   * Core logging method
   */
  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createBaseEntry(level, message, metadata);
    
    // Output to console with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(entry));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(entry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(entry));
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(JSON.stringify(entry));
        break;
      default:
        console.log(JSON.stringify(entry));
    }

    return entry;
  }

  /**
   * Convenience methods for different log levels
   */
  debug(message, metadata = {}) {
    return this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message, metadata = {}) {
    return this.log(LogLevel.INFO, message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log(LogLevel.WARN, message, metadata);
  }

  error(message, error = null, metadata = {}) {
    const errorData = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {};
    
    return this.log(LogLevel.ERROR, message, { ...errorData, ...metadata });
  }

  fatal(message, error = null, metadata = {}) {
    const errorData = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {};
    
    return this.log(LogLevel.FATAL, message, { ...errorData, ...metadata });
  }

  /**
   * HTTP request logging
   */
  logRequest(request, metadata = {}) {
    const url = new URL(request.url);
    
    return this.info('HTTP Request', {
      http: {
        method: request.method,
        url: request.url,
        path: url.pathname,
        query: url.search,
        user_agent: request.headers.get('User-Agent'),
        content_type: request.headers.get('Content-Type'),
        content_length: request.headers.get('Content-Length'),
        cf_ray: request.headers.get('CF-Ray'),
        cf_ip: request.headers.get('CF-Connecting-IP')
      },
      ...metadata
    });
  }

  /**
   * HTTP response logging
   */
  logResponse(request, response, duration, metadata = {}) {
    const url = new URL(request.url);
    
    return this.info('HTTP Response', {
      http: {
        method: request.method,
        path: url.pathname,
        status: response.status,
        content_type: response.headers.get('Content-Type'),
        content_length: response.headers.get('Content-Length'),
        duration_ms: duration
      },
      ...metadata
    });
  }

  /**
   * Database operation logging
   */
  logDatabaseOperation(operation, table, metadata = {}) {
    return this.debug('Database Operation', {
      database: {
        operation,
        table,
        ...metadata
      }
    });
  }

  /**
   * Security event logging
   */
  logSecurityEvent(event, severity, metadata = {}) {
    const level = severity === 'high' ? LogLevel.ERROR : 
                 severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    
    return this.log(level, `Security Event: ${event}`, {
      security: {
        event,
        severity,
        ...metadata
      }
    });
  }

  /**
   * Performance timing
   */
  startTimer(name) {
    const timer = new PerformanceTimer(name);
    this.timers.set(name, timer);
    return timer;
  }

  endTimer(name, metadata = {}) {
    const timer = this.timers.get(name);
    if (!timer) {
      this.warn('Timer not found', { timer_name: name });
      return;
    }

    const result = timer.end();
    this.timers.delete(name);

    return this.info('Performance Timing', {
      performance: result,
      ...metadata
    });
  }

  /**
   * Monitoring event logging
   */
  logMonitoringEvent(event, app, status, metadata = {}) {
    return this.info('Monitoring Event', {
      monitoring: {
        event,
        app_id: app.id,
        app_name: app.name,
        app_url: app.url,
        old_status: status.old,
        new_status: status.new,
        response_time: status.response_time,
        ...metadata
      }
    });
  }

  /**
   * Alert event logging
   */
  logAlertEvent(event, alert, app, metadata = {}) {
    return this.info('Alert Event', {
      alert: {
        event,
        alert_id: alert.id,
        alert_type: alert.alert_type,
        endpoint: alert.endpoint,
        app_id: app.id,
        app_name: app.name,
        ...metadata
      }
    });
  }

  /**
   * Circuit breaker event logging
   */
  logCircuitBreakerEvent(event, appId, state, metadata = {}) {
    return this.warn('Circuit Breaker Event', {
      circuit_breaker: {
        event,
        app_id: appId,
        state,
        ...metadata
      }
    });
  }

  /**
   * Rate limiting event logging
   */
  logRateLimitEvent(identifier, remaining, metadata = {}) {
    return this.warn('Rate Limit Event', {
      rate_limit: {
        identifier,
        remaining,
        ...metadata
      }
    });
  }

  /**
   * Business metrics logging
   */
  logMetric(name, value, unit = 'count', metadata = {}) {
    return this.info('Metric', {
      metric: {
        name,
        value,
        unit,
        ...metadata
      }
    });
  }

  /**
   * Health check logging
   */
  logHealthCheck(app, result, metadata = {}) {
    const level = result.success ? LogLevel.DEBUG : LogLevel.WARN;
    
    return this.log(level, 'Health Check', {
      health_check: {
        app_id: app.id,
        app_name: app.name,
        app_url: app.url,
        success: result.success,
        status: result.status,
        response_time: result.response_time,
        error: result.error,
        ...metadata
      }
    });
  }

  /**
   * Correlation ID management
   */
  setCorrelationId(id) {
    this.correlationManager.setCorrelationId(id);
  }

  getCorrelationId() {
    return this.correlationManager.getCorrelationId();
  }

  withCorrelation(id, fn) {
    return this.correlationManager.withCorrelation(id, fn);
  }
}

/**
 * Request middleware for automatic logging
 */
export function createLoggingMiddleware(logger) {
  return {
    async logRequest(request, handler) {
      const startTime = Date.now();
      const correlationId = request.headers.get('X-Correlation-ID') || logger.correlationManager.generateId();
      
      logger.setCorrelationId(correlationId);
      logger.logRequest(request);
      
      try {
        const response = await handler(request);
        const duration = Date.now() - startTime;
        
        logger.logResponse(request, response, duration);
        
        // Add correlation ID to response
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            'X-Correlation-ID': correlationId
          }
        });
        
        return newResponse;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error('Request Failed', error, {
          http: {
            method: request.method,
            url: request.url,
            duration_ms: duration
          }
        });
        
        throw error;
      }
    }
  };
}

/**
 * Log aggregation and analysis utilities
 */
export class LogAnalyzer {
  constructor(logger) {
    this.logger = logger;
    this.buffer = [];
    this.bufferSize = 1000;
  }

  addEntry(entry) {
    this.buffer.push(entry);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  getErrorRate(timeWindow = 3600000) { // 1 hour default
    const now = Date.now();
    const cutoff = new Date(now - timeWindow).toISOString();
    
    const recentEntries = this.buffer.filter(entry => entry.timestamp >= cutoff);
    const errors = recentEntries.filter(entry => 
      entry.level === 'ERROR' || entry.level === 'FATAL'
    );
    
    return recentEntries.length > 0 ? errors.length / recentEntries.length : 0;
  }

  getAverageResponseTime(timeWindow = 3600000) {
    const now = Date.now();
    const cutoff = new Date(now - timeWindow).toISOString();
    
    const httpResponses = this.buffer.filter(entry => 
      entry.timestamp >= cutoff && 
      entry.message === 'HTTP Response' && 
      entry.http?.duration_ms
    );
    
    if (httpResponses.length === 0) return 0;
    
    const totalTime = httpResponses.reduce((sum, entry) => sum + entry.http.duration_ms, 0);
    return totalTime / httpResponses.length;
  }

  getTopErrors(limit = 10, timeWindow = 3600000) {
    const now = Date.now();
    const cutoff = new Date(now - timeWindow).toISOString();
    
    const errors = this.buffer.filter(entry => 
      entry.timestamp >= cutoff && 
      (entry.level === 'ERROR' || entry.level === 'FATAL')
    );
    
    const errorCounts = {};
    errors.forEach(entry => {
      const key = entry.error?.name || entry.message;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }
}

// Default logger instance
export const logger = new StructuredLogger({
  serviceName: 'appwatch',
  environment: 'production',
  minLevel: LogLevel.INFO
});

// Export logging middleware
export const loggingMiddleware = createLoggingMiddleware(logger);