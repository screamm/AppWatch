# 🚀 Deployment Guide

## Overview

Denna guide beskriver hur du deployar AppWatch Dashboard till Cloudflare Workers med säker autentisering och optimal prestanda.

## Prerequisites

### 🛠️ Required Tools

- **Node.js** (v18 eller senare)
- **npm** eller **yarn**
- **Wrangler CLI** (v3 eller senare)
- **Cloudflare Account** med Workers och D1 access

### 📦 Installation

```bash
# Install Wrangler globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Clone repository
git clone https://github.com/screamm/AppWatch.git
cd AppWatch

# Install dependencies
npm install
```

## Environment Setup

### 🗄️ Database Configuration

1. **Create D1 Database:**
```bash
wrangler d1 create appwatch_db
```

2. **Update wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "appwatch_db"
database_id = "your-database-id-here"  # Replace with generated ID
```

3. **Run Database Migrations:**
```bash
wrangler d1 execute appwatch_db --file=./schema.sql
```

### 🔐 Security Configuration

1. **Environment Variables:**
```toml
[vars]
ENVIRONMENT = "production"
JWT_ISSUER = "https://your-domain.cloudflareaccess.com"
JWT_AUDIENCE = "appwatch-dashboard"
ACCESS_DOMAIN = "your-domain.cloudflareaccess.com"
```

2. **Secrets Management:**
```bash
# If using additional secrets (optional)
wrangler secret put API_SECRET
wrangler secret put ENCRYPTION_KEY
```

## Deployment Process

### 🌐 Production Deployment

1. **Build and Deploy:**
```bash
npm run deploy
```

2. **Verify Deployment:**
```bash
# Check deployment status
wrangler tail

# Test endpoints
curl https://your-worker.workers.dev/api/stats
```

3. **Initial Setup:**
```bash
# Access dashboard
open https://your-worker.workers.dev

# Login with default credentials:
# Username: admin
# Password: AppWatch2024!

# VIKTIGT: Change password immediately!
```

### 🔄 Development Deployment

```bash
# Local development
npm run dev

# Preview deployment
wrangler deploy --env development
```

## Post-Deployment Configuration

### 🔐 Security Hardening

1. **Change Default Password:**
   - Login to dashboard
   - Navigate to settings
   - Change password to strong, unique password

2. **Configure Access Policies:**
```bash
# Optional: Add Cloudflare Access for additional security
wrangler access policy create
```

3. **Enable Security Features:**
   - Review security headers in deployment
   - Verify HTTPS enforcement
   - Check session timeout settings

### 📊 Monitoring Setup

1. **Enable Worker Analytics:**
```toml
[analytics]
enabled = true
```

2. **Configure Cron Triggers:**
```toml
[triggers]
crons = ["*/5 * * * *"]  # Health checks every 5 minutes
```

3. **Set up Alerting:**
   - Configure Cloudflare notifications
   - Set up monitoring for uptime and errors

## Domain Configuration

### 🌍 Custom Domain Setup

1. **Add Custom Domain:**
```bash
wrangler route publish --compatibility-date 2023-05-18
```

2. **Configure DNS:**
```bash
# Add CNAME record pointing to your worker
your-domain.com -> your-worker.workers.dev
```

3. **SSL Configuration:**
   - Cloudflare provides automatic SSL
   - Verify certificate status in dashboard

### 🔒 Security Headers

Production deployment automatically includes:
- **Strict-Transport-Security**
- **Content-Security-Policy**
- **X-Frame-Options: DENY**
- **X-Content-Type-Options: nosniff**

## Performance Optimization

### ⚡ Worker Configuration

```toml
[build]
command = "npm run build"

[compatibility_flags]
compatibility_date = "2023-05-18"
compatibility_flags = ["nodejs_compat"]

[limits]
memory = 128
cpu = 100
```

### 🗄️ Database Optimization

1. **Index Configuration:**
```sql
-- Add indexes for performance
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_owner ON apps(owner_id);
CREATE INDEX idx_status_logs_app ON status_logs(app_id);
CREATE INDEX idx_sessions_user ON auth_sessions(user_id);
```

2. **Connection Pooling:**
```javascript
// Automatic with Cloudflare D1
// No manual configuration needed
```

## Monitoring and Maintenance

### 📈 Performance Monitoring

1. **Cloudflare Analytics:**
   - Request volume and latency
   - Error rates and status codes
   - Geographic distribution

2. **Custom Metrics:**
```javascript
// Built-in AppWatch metrics
GET /api/monitoring/stats
GET /api/performance/dashboard
```

### 🔧 Maintenance Tasks

1. **Database Cleanup:**
```bash
# Run monthly cleanup
wrangler d1 execute appwatch_db --command="DELETE FROM status_logs WHERE checked_at < datetime('now', '-30 days')"
```

2. **Session Cleanup:**
```bash
# Automatic cleanup via cron jobs
# Manual cleanup if needed:
wrangler d1 execute appwatch_db --command="DELETE FROM auth_sessions WHERE expires_at < datetime('now')"
```

## Backup and Recovery

### 💾 Database Backups

1. **Automated Backups:**
```bash
# Cloudflare D1 provides automatic backups
# Access via dashboard or API
```

2. **Manual Backup:**
```bash
# Export data
wrangler d1 export appwatch_db --output backup_$(date +%Y%m%d).sql
```

3. **Recovery Process:**
```bash
# Restore from backup
wrangler d1 execute appwatch_db --file=backup_20231201.sql
```

## Troubleshooting

### 🐛 Common Issues

1. **Authentication Errors:**
```bash
# Check session table
wrangler d1 execute appwatch_db --command="SELECT * FROM auth_sessions WHERE expires_at > datetime('now')"

# Reset admin password
wrangler d1 execute appwatch_db --command="DELETE FROM auth_users WHERE username = 'admin'"
# Restart worker to recreate admin user
```

2. **Database Connection Issues:**
```bash
# Verify D1 binding
wrangler d1 info appwatch_db

# Test database connection
wrangler d1 execute appwatch_db --command="SELECT COUNT(*) FROM apps"
```

3. **Performance Issues:**
```bash
# Check worker logs
wrangler tail --format pretty

# Review analytics
wrangler analytics
```

### 🔍 Debug Mode

```bash
# Enable debug logging
wrangler deploy --env development --var LOG_LEVEL=debug
```

## Scaling Considerations

### 📈 High Traffic Setup

1. **Worker Limits:**
   - Standard: 100,000 requests/day
   - Paid: Unlimited requests
   - Consider upgrading for production use

2. **Database Scaling:**
   - D1 handles automatic scaling
   - Monitor query performance
   - Implement caching for frequent queries

3. **Geographic Distribution:**
   - Workers automatically deploy globally
   - D1 provides global read replicas
   - Consider regional data compliance

## Security Checklist

### ✅ Pre-Production Checklist

- [ ] Default password changed
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Access logging enabled
- [ ] Rate limiting configured
- [ ] Database backups verified
- [ ] Monitoring alerts configured
- [ ] Custom domain configured (if applicable)
- [ ] Performance testing completed
- [ ] Security audit performed

### 🔒 Ongoing Security

- [ ] Regular password rotation
- [ ] Monthly security log reviews
- [ ] Quarterly dependency updates
- [ ] Annual security audits
- [ ] Incident response plan tested

## Support and Updates

### 📞 Getting Help

1. **Documentation:**
   - Check README.md for basic setup
   - Review SECURITY.md for security issues
   - See CHANGELOG.md for version updates

2. **Community Support:**
   - GitHub Issues for bug reports
   - GitHub Discussions for questions
   - Community forum for best practices

3. **Professional Support:**
   - Enterprise support available
   - Custom deployment assistance
   - Security consultation services

### 🔄 Updates and Upgrades

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Deploy updates
npm run deploy

# Verify deployment
curl https://your-worker.workers.dev/api/stats
```

---

**🎯 Success!** Din AppWatch Dashboard är nu säkert deployad och redo för produktion!

För ytterligare hjälp, se GitHub repository eller kontakta support-teamet.