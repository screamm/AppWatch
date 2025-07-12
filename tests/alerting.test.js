// Alerting system tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlertingService, AlertEscalationManager } from '../src/alerting.js';

// Mock fetch for webhook testing
global.fetch = vi.fn();

describe('Alerting System', () => {
  let mockEnv;
  let mockDB;
  let alertingService;
  let escalationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    
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

    mockEnv = { DB: mockDB };
    alertingService = new AlertingService(mockEnv);
    escalationManager = new AlertEscalationManager(mockEnv);
  });

  describe('AlertingService', () => {
    describe('Webhook alerts', () => {
      it('should send Slack webhook successfully', async () => {
        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('ok')
        });

        const alertData = {
          app: 'Test App',
          url: 'https://example.com',
          old_status: 'online',
          new_status: 'offline',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        };

        const result = await alertingService.webhookService.sendSlackWebhook(
          'https://hooks.slack.com/test',
          alertData
        );

        expect(result.success).toBe(true);
        expect(result.platform).toBe('slack');
        expect(global.fetch).toHaveBeenCalledWith(
          'https://hooks.slack.com/test',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('AppWatch Alert')
          })
        );
      });

      it('should send Discord webhook successfully', async () => {
        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('ok')
        });

        const alertData = {
          app: 'Test App',
          url: 'https://example.com',
          old_status: 'offline',
          new_status: 'online',
          timestamp: new Date().toISOString(),
          severity: 'recovery'
        };

        const result = await alertingService.webhookService.sendDiscordWebhook(
          'https://discord.com/api/webhooks/test',
          alertData
        );

        expect(result.success).toBe(true);
        expect(result.platform).toBe('discord');
      });

      it('should retry failed webhook requests', async () => {
        // First two calls fail, third succeeds
        global.fetch
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: () => Promise.resolve('ok')
          });

        const alertData = {
          app: 'Test App',
          url: 'https://example.com',
          old_status: 'online',
          new_status: 'offline',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        };

        const result = await alertingService.webhookService.sendSlackWebhook(
          'https://hooks.slack.com/test',
          alertData
        );

        expect(result.success).toBe(true);
        expect(result.attempt).toBe(3);
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });

      it('should fail after max retries', async () => {
        global.fetch.mockRejectedValue(new Error('Persistent network error'));

        const alertData = {
          app: 'Test App',
          url: 'https://example.com',
          old_status: 'online',
          new_status: 'offline',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        };

        await expect(
          alertingService.webhookService.sendSlackWebhook(
            'https://hooks.slack.com/test',
            alertData
          )
        ).rejects.toThrow('All webhook attempts failed');

        expect(global.fetch).toHaveBeenCalledTimes(3); // Default retry attempts
      });
    });

    describe('Email alerts', () => {
      it('should generate proper email template', () => {
        const alertData = {
          app: 'Test App',
          url: 'https://example.com',
          old_status: 'online',
          new_status: 'offline',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        };

        const template = alertingService.emailService.generateEmailTemplate(alertData);

        expect(template.subject).toContain('AppWatch Alert');
        expect(template.subject).toContain('Test App');
        expect(template.subject).toContain('offline');
        expect(template.htmlContent).toContain('Test App');
        expect(template.htmlContent).toContain('offline');
        expect(template.textContent).toContain('Test App');
      });

      it('should handle different severity levels', () => {
        const criticalAlert = {
          app: 'Test App',
          url: 'https://example.com',
          old_status: 'online',
          new_status: 'offline',
          timestamp: new Date().toISOString(),
          severity: 'critical'
        };

        const recoveryAlert = {
          ...criticalAlert,
          old_status: 'offline',
          new_status: 'online',
          severity: 'recovery'
        };

        const criticalTemplate = alertingService.emailService.generateEmailTemplate(criticalAlert);
        const recoveryTemplate = alertingService.emailService.generateEmailTemplate(recoveryAlert);

        expect(criticalTemplate.htmlContent).toContain('#ff0000'); // Red color
        expect(recoveryTemplate.htmlContent).toContain('#00ff00'); // Green color
      });
    });

    describe('Test alerts', () => {
      it('should send test alerts successfully', async () => {
        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('ok')
        });

        const alertConfig = {
          alert_type: 'slack',
          endpoint: 'https://hooks.slack.com/test',
          app_name: 'Test App',
          app_url: 'https://example.com'
        };

        const result = await alertingService.testAlert(alertConfig);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Test alert sent successfully');
        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle test alert failures', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));

        const alertConfig = {
          alert_type: 'webhook',
          endpoint: 'https://invalid-webhook.com',
          app_name: 'Test App',
          app_url: 'https://example.com'
        };

        const result = await alertingService.testAlert(alertConfig);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Test alert failed');
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('AlertEscalationManager', () => {
    describe('Alert validation', () => {
      it('should validate email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'test+tag@example.org'
        ];

        const invalidEmails = [
          'not-an-email',
          '@example.com',
          'test@',
          'test@.com'
        ];

        validEmails.forEach(email => {
          const result = escalationManager.validateAlertConfig('email', email);
          expect(result.valid).toBe(true);
        });

        invalidEmails.forEach(email => {
          const result = escalationManager.validateAlertConfig('email', email);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Invalid email address');
        });
      });

      it('should validate webhook URLs', () => {
        const validUrls = [
          'https://hooks.slack.com/services/test',
          'https://discord.com/api/webhooks/123/token',
          'https://example.com/webhook'
        ];

        const invalidUrls = [
          'not-a-url',
          'ftp://example.com',
          'http://.com'
        ];

        validUrls.forEach(url => {
          const result = escalationManager.validateAlertConfig('webhook', url);
          expect(result.valid).toBe(true);
        });

        invalidUrls.forEach(url => {
          const result = escalationManager.validateAlertConfig('webhook', url);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Invalid webhook URL');
        });
      });

      it('should validate alert types', () => {
        const validTypes = ['email', 'webhook', 'slack', 'discord', 'msteams'];
        const invalidTypes = ['sms', 'unknown', ''];

        validTypes.forEach(type => {
          const result = escalationManager.validateAlertConfig(type, 'https://example.com');
          expect(result.valid).toBe(true);
        });

        invalidTypes.forEach(type => {
          const result = escalationManager.validateAlertConfig(type, 'https://example.com');
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Invalid alert type');
        });
      });
    });

    describe('Status change handling', () => {
      it('should trigger alerts for status changes', async () => {
        const mockAlerts = [
          {
            id: 1,
            app_id: 'app-1',
            alert_type: 'webhook',
            endpoint: 'https://hooks.slack.com/test',
            enabled: 1
          }
        ];

        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('ok')
        });

        mockDB.prepare.mockReturnValue({
          bind: vi.fn(() => ({
            all: vi.fn(() => ({ results: mockAlerts }))
          }))
        });

        const app = {
          id: 'app-1',
          name: 'Test App',
          url: 'https://example.com'
        };

        const results = await escalationManager.handleStatusChange(app, 'online', 'offline');

        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(true);
        expect(results[0].alert_type).toBe('webhook');
        expect(global.fetch).toHaveBeenCalled();
      });

      it('should handle multiple alerts for one app', async () => {
        const mockAlerts = [
          {
            id: 1,
            alert_type: 'slack',
            endpoint: 'https://hooks.slack.com/test',
            enabled: 1
          },
          {
            id: 2,
            alert_type: 'discord',
            endpoint: 'https://discord.com/api/webhooks/test',
            enabled: 1
          }
        ];

        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: () => Promise.resolve('ok')
        });

        mockDB.prepare.mockReturnValue({
          bind: vi.fn(() => ({
            all: vi.fn(() => ({ results: mockAlerts }))
          }))
        });

        const app = {
          id: 'app-1',
          name: 'Test App',
          url: 'https://example.com'
        };

        const results = await escalationManager.handleStatusChange(app, 'online', 'offline');

        expect(results).toHaveLength(2);
        expect(results.every(r => r.success)).toBe(true);
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      it('should continue with other alerts if one fails', async () => {
        const mockAlerts = [
          {
            id: 1,
            alert_type: 'slack',
            endpoint: 'https://failing-webhook.com',
            enabled: 1
          },
          {
            id: 2,
            alert_type: 'discord',
            endpoint: 'https://discord.com/api/webhooks/test',
            enabled: 1
          }
        ];

        global.fetch
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: () => Promise.resolve('ok')
          });

        mockDB.prepare.mockReturnValue({
          bind: vi.fn(() => ({
            all: vi.fn(() => ({ results: mockAlerts }))
          }))
        });

        const app = {
          id: 'app-1',
          name: 'Test App',
          url: 'https://example.com'
        };

        const results = await escalationManager.handleStatusChange(app, 'online', 'offline');

        expect(results).toHaveLength(2);
        expect(results[0].success).toBe(false);
        expect(results[1].success).toBe(true);
      });
    });
  });

  describe('Alert Templates', () => {
    it('should generate correct Slack message format', async () => {
      const { AlertTemplates } = await import('../src/alerting.js');
      
      const alertData = {
        app: 'Test App',
        url: 'https://example.com',
        old_status: 'online',
        new_status: 'offline',
        timestamp: '2024-01-01T12:00:00Z',
        severity: 'critical'
      };

      const message = AlertTemplates.generateSlackMessage(alertData);

      expect(message.text).toContain('AppWatch Alert');
      expect(message.text).toContain('Test App');
      expect(message.text).toContain('offline');
      expect(message.attachments).toHaveLength(1);
      expect(message.attachments[0].color).toBe('danger');
      expect(message.attachments[0].fields).toBeDefined();
    });

    it('should use correct colors for different severities', async () => {
      const { AlertTemplates } = await import('../src/alerting.js');
      
      const criticalAlert = {
        app: 'Test App',
        url: 'https://example.com',
        old_status: 'online',
        new_status: 'offline',
        timestamp: '2024-01-01T12:00:00Z',
        severity: 'critical'
      };

      const recoveryAlert = {
        ...criticalAlert,
        old_status: 'offline',
        new_status: 'online',
        severity: 'recovery'
      };

      const criticalMessage = AlertTemplates.generateSlackMessage(criticalAlert);
      const recoveryMessage = AlertTemplates.generateSlackMessage(recoveryAlert);

      expect(criticalMessage.attachments[0].color).toBe('danger');
      expect(recoveryMessage.attachments[0].color).toBe('good');
    });
  });
});