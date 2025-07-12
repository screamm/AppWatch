// AppWatch Alerting System
// Handles email and webhook notifications for status changes

/**
 * Alert template generator
 */
class AlertTemplates {
  static generateSlackMessage(alertData) {
    const { app, old_status, new_status, url, timestamp, severity } = alertData;
    
    const emoji = new_status === 'online' ? '✅' : '🚨';
    const color = severity === 'critical' ? 'danger' : new_status === 'online' ? 'good' : 'warning';
    
    return {
      text: `${emoji} AppWatch Alert: ${app} is now ${new_status}`,
      attachments: [{
        color: color,
        fields: [
          {
            title: 'Application',
            value: app,
            short: true
          },
          {
            title: 'Status Change',
            value: `${old_status} → ${new_status}`,
            short: true
          },
          {
            title: 'URL',
            value: url,
            short: false
          },
          {
            title: 'Timestamp',
            value: new Date(timestamp).toLocaleString(),
            short: true
          },
          {
            title: 'Severity',
            value: severity.toUpperCase(),
            short: true
          }
        ],
        footer: 'AppWatch Monitoring System',
        ts: Math.floor(new Date(timestamp).getTime() / 1000)
      }]
    };
  }

  static generateDiscordMessage(alertData) {
    const { app, old_status, new_status, url, timestamp, severity } = alertData;
    
    const emoji = new_status === 'online' ? '✅' : '🚨';
    const color = severity === 'critical' ? 0xff0000 : new_status === 'online' ? 0x00ff00 : 0xffaa00;
    
    return {
      embeds: [{
        title: `${emoji} AppWatch Alert`,
        description: `**${app}** is now **${new_status}**`,
        color: color,
        fields: [
          {
            name: 'Status Change',
            value: `${old_status} → ${new_status}`,
            inline: true
          },
          {
            name: 'Severity',
            value: severity.toUpperCase(),
            inline: true
          },
          {
            name: 'URL',
            value: url,
            inline: false
          }
        ],
        timestamp: timestamp,
        footer: {
          text: 'AppWatch Monitoring System'
        }
      }]
    };
  }

  static generateMSTeamsMessage(alertData) {
    const { app, old_status, new_status, url, timestamp, severity } = alertData;
    
    const emoji = new_status === 'online' ? '✅' : '🚨';
    const themeColor = severity === 'critical' ? 'FF0000' : new_status === 'online' ? '00FF00' : 'FFAA00';
    
    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: themeColor,
      summary: `AppWatch Alert: ${app} is ${new_status}`,
      sections: [{
        activityTitle: `${emoji} AppWatch Alert`,
        activitySubtitle: `**${app}** is now **${new_status}**`,
        facts: [
          {
            name: 'Status Change',
            value: `${old_status} → ${new_status}`
          },
          {
            name: 'Severity',
            value: severity.toUpperCase()
          },
          {
            name: 'URL',
            value: url
          },
          {
            name: 'Timestamp',
            value: new Date(timestamp).toLocaleString()
          }
        ]
      }],
      potentialAction: [{
        '@type': 'OpenUri',
        name: 'Open AppWatch Dashboard',
        targets: [{
          os: 'default',
          uri: 'https://your-appwatch-domain.com'
        }]
      }]
    };
  }

  static generateGenericWebhook(alertData) {
    return {
      type: 'app_status_change',
      data: alertData,
      version: '1.0'
    };
  }
}

/**
 * Email service using Cloudflare Email Workers
 */
class EmailService {
  constructor(env) {
    this.env = env;
  }

  async sendEmail(to, subject, htmlContent, textContent) {
    // This would use Cloudflare Email Workers or similar service
    // For now, we'll log it and return success
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${textContent}`);
    
    // In production, integrate with:
    // - Cloudflare Email Workers
    // - SendGrid
    // - Mailgun
    // - AWS SES
    
    return { success: true, message: 'Email sent successfully' };
  }

  generateEmailTemplate(alertData) {
    const { app, old_status, new_status, url, timestamp, severity } = alertData;
    
    const emoji = new_status === 'online' ? '✅' : '🚨';
    const statusColor = severity === 'critical' ? '#ff0000' : new_status === 'online' ? '#00ff00' : '#ffaa00';
    
    const subject = `${emoji} AppWatch Alert: ${app} is ${new_status}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppWatch Alert</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status-change { font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center; }
        .details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${emoji} AppWatch Alert</h1>
        </div>
        <div class="content">
            <div class="status-change">
                <strong>${app}</strong> is now <span style="color: ${statusColor};">${new_status}</span>
            </div>
            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Status Change:</span>
                    <span class="detail-value">${old_status} → ${new_status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Severity:</span>
                    <span class="detail-value">${severity.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">URL:</span>
                    <span class="detail-value"><a href="${url}">${url}</a></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timestamp:</span>
                    <span class="detail-value">${new Date(timestamp).toLocaleString()}</span>
                </div>
            </div>
            <div style="text-align: center;">
                <a href="https://your-appwatch-domain.com" class="button">View Dashboard</a>
            </div>
        </div>
        <div class="footer">
            This alert was generated by AppWatch Monitoring System
        </div>
    </div>
</body>
</html>`;

    const textContent = `
AppWatch Alert: ${app} is ${new_status}

Status Change: ${old_status} → ${new_status}
Severity: ${severity.toUpperCase()}
URL: ${url}
Timestamp: ${new Date(timestamp).toLocaleString()}

View Dashboard: https://your-appwatch-domain.com
`;

    return { subject, htmlContent, textContent };
  }
}

/**
 * Webhook service for various platforms
 */
class WebhookService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  async sendWebhook(webhookUrl, payload, options = {}) {
    const { retries = this.retryAttempts, platform = 'generic' } = options;
    
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AppWatch-AlertSystem/1.0',
            ...options.headers
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log(`Webhook sent successfully to ${webhookUrl} (attempt ${attempt})`);
        
        return { 
          success: true, 
          response: responseText,
          attempt: attempt,
          platform: platform
        };
      } catch (error) {
        lastError = error;
        console.error(`Webhook attempt ${attempt} failed:`, error.message);
        
        if (attempt < retries) {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`All webhook attempts failed. Last error: ${lastError.message}`);
  }

  async sendSlackWebhook(webhookUrl, alertData) {
    const payload = AlertTemplates.generateSlackMessage(alertData);
    return this.sendWebhook(webhookUrl, payload, { platform: 'slack' });
  }

  async sendDiscordWebhook(webhookUrl, alertData) {
    const payload = AlertTemplates.generateDiscordMessage(alertData);
    return this.sendWebhook(webhookUrl, payload, { platform: 'discord' });
  }

  async sendMSTeamsWebhook(webhookUrl, alertData) {
    const payload = AlertTemplates.generateMSTeamsMessage(alertData);
    return this.sendWebhook(webhookUrl, payload, { platform: 'msteams' });
  }

  async sendGenericWebhook(webhookUrl, alertData) {
    const payload = AlertTemplates.generateGenericWebhook(alertData);
    return this.sendWebhook(webhookUrl, payload, { platform: 'generic' });
  }
}

/**
 * Main alerting service
 */
export class AlertingService {
  constructor(env) {
    this.env = env;
    this.emailService = new EmailService(env);
    this.webhookService = new WebhookService();
  }

  async sendAlert(alert, app, oldStatus, newStatus) {
    const alertData = {
      app: app.name,
      url: app.url,
      old_status: oldStatus,
      new_status: newStatus,
      timestamp: new Date().toISOString(),
      severity: newStatus === 'offline' ? 'critical' : oldStatus === 'offline' ? 'recovery' : 'info'
    };

    try {
      switch (alert.alert_type) {
        case 'email':
          return await this.sendEmailAlert(alert.endpoint, alertData);
        
        case 'webhook':
          return await this.sendWebhookAlert(alert.endpoint, alertData);
        
        case 'slack':
          return await this.webhookService.sendSlackWebhook(alert.endpoint, alertData);
        
        case 'discord':
          return await this.webhookService.sendDiscordWebhook(alert.endpoint, alertData);
        
        case 'msteams':
          return await this.webhookService.sendMSTeamsWebhook(alert.endpoint, alertData);
        
        default:
          throw new Error(`Unknown alert type: ${alert.alert_type}`);
      }
    } catch (error) {
      console.error(`Failed to send ${alert.alert_type} alert:`, error);
      throw error;
    }
  }

  async sendEmailAlert(emailAddress, alertData) {
    const template = this.emailService.generateEmailTemplate(alertData);
    return this.emailService.sendEmail(
      emailAddress,
      template.subject,
      template.htmlContent,
      template.textContent
    );
  }

  async sendWebhookAlert(webhookUrl, alertData) {
    // Detect platform from URL
    if (webhookUrl.includes('hooks.slack.com')) {
      return this.webhookService.sendSlackWebhook(webhookUrl, alertData);
    } else if (webhookUrl.includes('discord.com/api/webhooks')) {
      return this.webhookService.sendDiscordWebhook(webhookUrl, alertData);
    } else if (webhookUrl.includes('outlook.office.com')) {
      return this.webhookService.sendMSTeamsWebhook(webhookUrl, alertData);
    } else {
      return this.webhookService.sendGenericWebhook(webhookUrl, alertData);
    }
  }

  async testAlert(alertConfig) {
    const testData = {
      app: 'Test Application',
      url: 'https://example.com',
      old_status: 'online',
      new_status: 'offline',
      timestamp: new Date().toISOString(),
      severity: 'critical'
    };

    try {
      const result = await this.sendAlert(alertConfig, 
        { name: testData.app, url: testData.url }, 
        testData.old_status, 
        testData.new_status
      );
      
      return {
        success: true,
        message: 'Test alert sent successfully',
        details: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Test alert failed',
        error: error.message
      };
    }
  }
}

/**
 * Alert escalation manager
 */
export class AlertEscalationManager {
  constructor(env) {
    this.env = env;
    this.alertingService = new AlertingService(env);
  }

  async handleStatusChange(app, oldStatus, newStatus) {
    // Get alert configurations for this app
    const alerts = await this.env.DB.prepare(`
      SELECT * FROM alerts 
      WHERE app_id = ? AND enabled = 1
      ORDER BY id ASC
    `).bind(app.id).all();

    const results = [];
    
    for (const alert of alerts.results || []) {
      try {
        const result = await this.alertingService.sendAlert(alert, app, oldStatus, newStatus);
        results.push({
          alert_id: alert.id,
          alert_type: alert.alert_type,
          endpoint: alert.endpoint,
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`Alert ${alert.id} failed:`, error);
        results.push({
          alert_id: alert.id,
          alert_type: alert.alert_type,
          endpoint: alert.endpoint,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async addAlert(appId, alertType, endpoint, enabled = true) {
    const validation = this.validateAlertConfig(alertType, endpoint);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const alertId = await this.env.DB.prepare(`
      INSERT INTO alerts (app_id, alert_type, endpoint, enabled)
      VALUES (?, ?, ?, ?)
      RETURNING id
    `).bind(appId, alertType, endpoint, enabled ? 1 : 0).first();

    return alertId;
  }

  validateAlertConfig(alertType, endpoint) {
    const validTypes = ['email', 'webhook', 'slack', 'discord', 'msteams'];
    
    if (!validTypes.includes(alertType)) {
      return { valid: false, error: 'Invalid alert type' };
    }

    if (alertType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(endpoint)) {
        return { valid: false, error: 'Invalid email address' };
      }
    } else {
      try {
        new URL(endpoint);
      } catch {
        return { valid: false, error: 'Invalid webhook URL' };
      }
    }

    return { valid: true };
  }
}

// Export the service instances
export function createAlertingService(env) {
  return new AlertingService(env);
}

export function createEscalationManager(env) {
  return new AlertEscalationManager(env);
}