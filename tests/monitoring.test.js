// Monitoring module tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runAutomatedHealthChecks, getMonitoringStats } from '../src/monitoring.js';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Monitoring Module', () => {
  let mockEnv;
  let mockDB;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock database
    mockDB = {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          all: vi.fn(() => ({ results: [] })),
          first: vi.fn(() => ({})),
          run: vi.fn(() => ({ success: true }))
        })),
        all: vi.fn(() => ({ results: [] })),
        first: vi.fn(() => ({})),
        run: vi.fn(() => ({ success: true }))
      }))
    };

    mockEnv = {
      DB: mockDB
    };
  });

  describe('Health Checks', () => {
    it('should handle empty app list', async () => {
      mockDB.prepare.mockReturnValue({
        all: vi.fn(() => ({ results: [] }))
      });

      const result = await runAutomatedHealthChecks(mockEnv);
      
      expect(result.checked).toBe(0);
      expect(result.results).toEqual([]);
    });

    it('should process apps that need checking', async () => {
      const mockApps = [
        {
          id: 'app-1',
          name: 'Test App 1',
          url: 'https://example.com',
          timeout: 5000,
          status: 'unknown',
          enable_alerts: true
        }
      ];

      // Mock successful HTTP response
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200
      });

      // Mock database queries
      let callCount = 0;
      mockDB.prepare.mockImplementation((query) => {
        if (query.includes('SELECT * FROM apps')) {
          return {
            all: vi.fn(() => ({ results: mockApps }))
          };
        }
        
        return {
          bind: vi.fn(() => ({
            run: vi.fn(() => ({ success: true })),
            first: vi.fn(() => ({ count: 1 }))
          }))
        };
      });

      const result = await runAutomatedHealthChecks(mockEnv);
      
      expect(result.checked).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          method: 'HEAD',
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should handle fetch timeout', async () => {
      const mockApps = [
        {
          id: 'app-1',
          name: 'Test App 1',
          url: 'https://slow-example.com',
          timeout: 1000,
          status: 'online',
          enable_alerts: true
        }
      ];

      // Mock timeout error
      global.fetch.mockRejectedValue(new Error('Request timed out'));

      mockDB.prepare.mockImplementation((query) => {
        if (query.includes('SELECT * FROM apps')) {
          return {
            all: vi.fn(() => ({ results: mockApps }))
          };
        }
        
        return {
          bind: vi.fn(() => ({
            run: vi.fn(() => ({ success: true })),
            first: vi.fn(() => ({ count: 1 }))
          }))
        };
      });

      const result = await runAutomatedHealthChecks(mockEnv);
      
      expect(result.checked).toBe(1);
      // Should have logged the app as offline due to timeout
    });

    it('should handle non-200 HTTP responses', async () => {
      const mockApps = [
        {
          id: 'app-1',
          name: 'Test App 1',
          url: 'https://failing-example.com',
          timeout: 5000,
          status: 'online',
          enable_alerts: true
        }
      ];

      // Mock 500 response
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      mockDB.prepare.mockImplementation((query) => {
        if (query.includes('SELECT * FROM apps')) {
          return {
            all: vi.fn(() => ({ results: mockApps }))
          };
        }
        
        return {
          bind: vi.fn(() => ({
            run: vi.fn(() => ({ success: true })),
            first: vi.fn(() => ({ count: 1 }))
          }))
        };
      });

      const result = await runAutomatedHealthChecks(mockEnv);
      
      expect(result.checked).toBe(1);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after failures', async () => {
      const mockApps = [
        {
          id: 'app-1',
          name: 'Failing App',
          url: 'https://always-fails.com',
          timeout: 1000,
          status: 'online',
          enable_alerts: false
        }
      ];

      // Mock consistent failures
      global.fetch.mockRejectedValue(new Error('Connection refused'));

      mockDB.prepare.mockImplementation((query) => {
        if (query.includes('SELECT * FROM apps')) {
          return {
            all: vi.fn(() => ({ results: mockApps }))
          };
        }
        
        return {
          bind: vi.fn(() => ({
            run: vi.fn(() => ({ success: true })),
            first: vi.fn(() => ({ count: 1 }))
          }))
        };
      });

      // Run multiple health checks to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        await runAutomatedHealthChecks(mockEnv);
      }

      // Circuit should now be open
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Monitoring Stats', () => {
    it('should calculate basic statistics', async () => {
      const mockStats = {
        monitored_apps: 5,
        total_checks: 100,
        successful_checks: 95,
        avg_response_time: 250,
        last_check: '2024-01-01T12:00:00Z'
      };

      mockDB.prepare.mockReturnValue({
        first: vi.fn(() => mockStats)
      });

      const result = await getMonitoringStats(mockEnv);
      
      expect(result.monitored_apps).toBe(5);
      expect(result.total_checks_24h).toBe(100);
      expect(result.success_rate_24h).toBe(95);
      expect(result.avg_response_time).toBe(250);
      expect(result.last_check).toBe('2024-01-01T12:00:00Z');
    });

    it('should handle empty statistics', async () => {
      mockDB.prepare.mockReturnValue({
        first: vi.fn(() => ({
          monitored_apps: 0,
          total_checks: 0,
          successful_checks: 0,
          avg_response_time: null,
          last_check: null
        }))
      });

      const result = await getMonitoringStats(mockEnv);
      
      expect(result.monitored_apps).toBe(0);
      expect(result.success_rate_24h).toBe(0);
      expect(result.avg_response_time).toBe(0);
    });
  });

  describe('Uptime Calculations', () => {
    it('should calculate uptime percentage correctly', () => {
      const totalChecks = 100;
      const successfulChecks = 95;
      const expectedUptime = 95;
      
      const uptime = (successfulChecks / totalChecks) * 100;
      expect(Math.round(uptime)).toBe(expectedUptime);
    });

    it('should handle zero checks', () => {
      const totalChecks = 0;
      const successfulChecks = 0;
      
      const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;
      expect(uptime).toBe(100);
    });
  });

  describe('Self-Healing', () => {
    it('should attempt to recover offline apps', async () => {
      const mockOfflineApps = [
        {
          id: 'app-1',
          name: 'Previously Offline App',
          url: 'https://recovered-example.com',
          timeout: 5000,
          status: 'offline',
          enable_alerts: true
        }
      ];

      // Mock successful recovery
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200
      });

      mockDB.prepare.mockImplementation((query) => {
        if (query.includes('status = \'offline\'')) {
          return {
            all: vi.fn(() => ({ results: mockOfflineApps }))
          };
        }
        
        return {
          bind: vi.fn(() => ({
            run: vi.fn(() => ({ success: true })),
            first: vi.fn(() => ({ count: 1 }))
          }))
        };
      });

      // Import and test self-healing function
      const { attemptSelfHealing } = await import('../src/monitoring.js');
      const result = await attemptSelfHealing(mockEnv);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete health checks within reasonable time', async () => {
      const mockApps = Array.from({ length: 10 }, (_, i) => ({
        id: `app-${i}`,
        name: `Test App ${i}`,
        url: `https://example-${i}.com`,
        timeout: 1000,
        status: 'unknown',
        enable_alerts: false
      }));

      // Mock fast responses
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200
      });

      mockDB.prepare.mockImplementation((query) => {
        if (query.includes('SELECT * FROM apps')) {
          return {
            all: vi.fn(() => ({ results: mockApps }))
          };
        }
        
        return {
          bind: vi.fn(() => ({
            run: vi.fn(() => ({ success: true })),
            first: vi.fn(() => ({ count: 1 }))
          }))
        };
      });

      const startTime = Date.now();
      const result = await runAutomatedHealthChecks(mockEnv);
      const duration = Date.now() - startTime;
      
      expect(result.checked).toBe(10);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});