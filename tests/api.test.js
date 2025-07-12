// API integration tests
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('API Integration Tests', () => {
  let mf;
  let db;

  beforeEach(async () => {
    mf = testUtils.getMiniflare();
    db = await mf.getD1Database('DB');
  });

  afterEach(async () => {
    // Cleanup handled by setup.js
  });

  describe('Apps API', () => {
    describe('GET /api/apps', () => {
      it('should return empty list initially', async () => {
        const response = await mf.dispatchFetch('http://localhost/api/apps');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.apps).toEqual([]);
      });

      it('should return apps list', async () => {
        // Create test app
        const testApp = await testUtils.createTestApp(db);

        const response = await mf.dispatchFetch('http://localhost/api/apps');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.apps).toHaveLength(1);
        expect(data.apps[0].name).toBe(testApp.name);
      });
    });

    describe('POST /api/apps', () => {
      it('should create new app with valid data', async () => {
        const appData = {
          name: 'Test Application',
          url: 'https://example.com',
          description: 'A test application',
          category: 'web',
          check_interval: 300,
          timeout: 5000,
          enable_alerts: true
        };

        const response = await mf.dispatchFetch('http://localhost/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appData)
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.app.name).toBe(appData.name);
        expect(data.app.url).toBe(appData.url);
        expect(data.app.id).toBeDefined();
      });

      it('should reject invalid app data', async () => {
        const invalidData = {
          name: '', // Invalid: empty name
          url: 'not-a-url', // Invalid: not a URL
          category: 'invalid' // Invalid: unknown category
        };

        const response = await mf.dispatchFetch('http://localhost/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData)
        });

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Validation failed');
      });

      it('should reject malicious URLs', async () => {
        const maliciousData = {
          name: 'Test App',
          url: 'http://localhost:3000' // Should be rejected
        };

        const response = await mf.dispatchFetch('http://localhost/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(maliciousData)
        });

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Private/localhost URLs are not allowed');
      });

      it('should sanitize XSS attempts', async () => {
        const xssData = {
          name: '<script>alert("xss")</script>',
          url: 'https://example.com',
          description: 'javascript:alert("xss")'
        };

        const response = await mf.dispatchFetch('http://localhost/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(xssData)
        });

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid characters');
      });
    });

    describe('DELETE /api/apps/:id', () => {
      it('should delete existing app', async () => {
        const testApp = await testUtils.createTestApp(db);

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('deleted successfully');
      });

      it('should return 404 for non-existent app', async () => {
        const nonExistentId = '12345678-1234-1234-1234-123456789012';

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${nonExistentId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toContain('not found');
      });

      it('should reject invalid UUIDs', async () => {
        const invalidId = 'not-a-uuid';

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${invalidId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid app ID');
      });
    });

    describe('POST /api/apps/:id/check', () => {
      it('should perform health check on existing app', async () => {
        const testApp = await testUtils.createTestApp(db, {
          url: 'https://httpbin.org/status/200'
        });

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}/check`, {
          method: 'POST'
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.status).toBeDefined();
        expect(data.checked_at).toBeDefined();
      });

      it('should handle unreachable URLs', async () => {
        const testApp = await testUtils.createTestApp(db, {
          url: 'https://definitely-not-reachable-url-12345.com'
        });

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}/check`, {
          method: 'POST'
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.status).toBe('offline');
      });
    });
  });

  describe('Stats API', () => {
    describe('GET /api/stats', () => {
      it('should return basic statistics', async () => {
        // Create test apps and logs
        const app1 = await testUtils.createTestApp(db, { status: 'online' });
        const app2 = await testUtils.createTestApp(db, { status: 'offline' });
        
        await testUtils.createTestStatusLog(db, app1.id, { status: 'online' });
        await testUtils.createTestStatusLog(db, app2.id, { status: 'offline' });

        const response = await mf.dispatchFetch('http://localhost/api/stats');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.stats.total).toBe(2);
        expect(data.stats.online).toBe(1);
        expect(data.stats.offline).toBe(1);
        expect(data.stats.avg_uptime).toBeDefined();
      });
    });
  });

  describe('History API', () => {
    describe('GET /api/apps/:id/history', () => {
      it('should return app history', async () => {
        const testApp = await testUtils.createTestApp(db);
        
        // Create some status logs
        for (let i = 0; i < 5; i++) {
          await testUtils.createTestStatusLog(db, testApp.id, {
            status: i % 2 === 0 ? 'online' : 'offline',
            response_time: 100 + i * 50
          });
        }

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}/history`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.history).toHaveLength(5);
        expect(data.app_info.name).toBe(testApp.name);
        expect(data.statistics.total_checks).toBe(5);
      });

      it('should return 404 for non-existent app', async () => {
        const nonExistentId = '12345678-1234-1234-1234-123456789012';

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${nonExistentId}/history`);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
      });
    });
  });

  describe('Alert Management API', () => {
    describe('GET /api/apps/:id/alerts', () => {
      it('should return app alerts', async () => {
        const testApp = await testUtils.createTestApp(db);
        const testAlert = await testUtils.createTestAlert(db, testApp.id);

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}/alerts`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.alerts).toHaveLength(1);
        expect(data.alerts[0].alert_type).toBe(testAlert.alert_type);
      });
    });

    describe('POST /api/apps/:id/alerts', () => {
      it('should create new alert', async () => {
        const testApp = await testUtils.createTestApp(db);
        const alertData = {
          alert_type: 'slack',
          endpoint: 'https://hooks.slack.com/services/test',
          enabled: true
        };

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}/alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.alert.alert_type).toBe(alertData.alert_type);
        expect(data.alert.endpoint).toBe(alertData.endpoint);
      });

      it('should reject invalid alert configuration', async () => {
        const testApp = await testUtils.createTestApp(db);
        const invalidAlertData = {
          alert_type: 'invalid_type',
          endpoint: 'not-a-url'
        };

        const response = await mf.dispatchFetch(`http://localhost/api/apps/${testApp.id}/alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidAlertData)
        });

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid alert type');
      });
    });
  });

  describe('Monitoring API', () => {
    describe('GET /api/monitoring/stats', () => {
      it('should return monitoring statistics', async () => {
        const response = await mf.dispatchFetch('http://localhost/api/monitoring/stats');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.monitoring.monitored_apps).toBeDefined();
        expect(data.monitoring.total_checks_24h).toBeDefined();
        expect(data.monitoring.success_rate_24h).toBeDefined();
      });
    });

    describe('POST /api/monitoring/health-check', () => {
      it('should trigger manual health check', async () => {
        const testApp = await testUtils.createTestApp(db);

        const response = await mf.dispatchFetch('http://localhost/api/monitoring/health-check', {
          method: 'POST'
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.health_check.message).toContain('completed');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make requests rapidly to trigger rate limit
      const promises = [];
      for (let i = 0; i < 110; i++) { // Exceed default limit of 100
        promises.push(mf.dispatchFetch('http://localhost/api/stats'));
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await mf.dispatchFetch('http://localhost/api/stats');
      
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await mf.dispatchFetch('http://localhost/api/stats');
      
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
      expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('should include security headers for static files', async () => {
      const response = await mf.dispatchFetch('http://localhost/styles.css');
      
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await mf.dispatchFetch('http://localhost/api/apps', {
        method: 'OPTIONS'
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should include CORS headers in API responses', async () => {
      const response = await mf.dispatchFetch('http://localhost/api/apps');

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await mf.dispatchFetch('http://localhost/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should return 404 for non-existent endpoints', async () => {
      const response = await mf.dispatchFetch('http://localhost/api/nonexistent');

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});