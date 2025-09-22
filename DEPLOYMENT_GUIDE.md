# 🚀 URL Shortener Deployment Guide

## 📋 Overview

This URL Shortener is designed to work with any reverse proxy solution:
- **Development**: Direct access via localhost ports
- **Production**: Behind your choice of reverse proxy (Nginx Proxy Manager, Traefik, Caddy, etc.)

## 🔍 Current Status Check

**Frontend Container Status**: ⚠️ **NEEDS REBUILDING**
- Running old image without new features (OAuth, dark theme, user management)
- All new code exists in `frontend/src/` but container needs rebuilding

**Quick Status Check**:
```bash
sudo docker compose ps
sudo docker compose images
```

## 🛠️ Development Deployment (localhost)

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 4000, 5433 available

### Quick Start
```bash
# 1. Rebuild frontend with new features
sudo docker compose build frontend --no-cache

# 2. Start all services
sudo docker compose up -d

# 3. Check health
sudo docker compose ps
sudo docker compose logs -f

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

### Environment Configuration (Optional)
```bash
# Create local environment file
cp .env.prod .env.local

# Edit with your preferences
nano .env.local

# Use local environment
sudo docker compose --env-file .env.local up -d
```

---

## 🌍 Production Deployment (with Domain)

### Prerequisites
- Domain name pointing to your server
- Reverse proxy solution (Nginx Proxy Manager, Traefik, Caddy, etc.)
- Ports 3000 and 4000 available locally

### Step-by-Step Production Deployment

#### 1. Environment Setup
```bash
# Copy production template
cp .env.prod .env

# Edit with your domain settings
nano .env
```

**Required .env Configuration**:
```bash
DOMAIN_NAME=your-domain.com
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
POSTGRES_PASSWORD=secure-database-password
JWT_SECRET=secure-jwt-secret
SESSION_SECRET=secure-session-secret
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=secure-admin-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 2. Deploy Application
```bash
# Build and start the application stack
sudo docker compose up --build -d

# Check deployment status
sudo docker compose ps
sudo docker compose logs -f
```

#### 3. Configure Reverse Proxy
See `reverse-proxy-examples/README.md` for configuration examples:
- Nginx Proxy Manager (GUI-based, recommended for beginners)
- Traefik (Docker labels already configured)
- Caddy (simple configuration)
- Manual Nginx, HAProxy, Cloudflare Tunnel

#### 4. Verify Deployment
```bash
# Check application directly
curl -I http://localhost:3000
curl -I http://localhost:4000/health

# Check through reverse proxy
curl -I https://your-domain.com
curl -I https://your-domain.com/api/health
```

---

## 🔧 Container Management

### Frontend Container Issues
The frontend container needs rebuilding to include new features:

```bash
# Stop current frontend
sudo docker compose stop frontend

# Remove old image
sudo docker image rm url-shortener-frontend

# Rebuild with latest code
sudo docker compose build frontend --no-cache

# Start updated frontend
sudo docker compose up frontend -d
```

### Checking Container Contents
```bash
# List files in frontend container
sudo docker compose exec frontend find /app -name "*.jsx" | head -10

# Check if new components exist
sudo docker compose exec frontend ls -la /app/src/pages/
sudo docker compose exec frontend ls -la /app/src/components/
```

### Troubleshooting Commands
```bash
# View all container logs
sudo docker compose logs

# View specific service logs
sudo docker compose logs frontend
sudo docker compose logs backend
sudo docker compose logs nginx

# Container health checks
sudo docker compose ps
sudo docker compose top

# Resource usage
sudo docker stats

# Clean up
sudo docker compose down
sudo docker system prune -a
```

---

## 🔐 Security Configuration

### SSL/TLS Configuration
- **Production**: Use Let's Encrypt for automatic SSL certificates
- **Development**: Self-signed certificates or HTTP only
- **Custom**: Bring your own certificates

### Security Headers
Nginx automatically adds security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HTTPS only)

### Rate Limiting
Built-in rate limiting:
- **Auth endpoints**: 5 requests/minute
- **API endpoints**: 30 requests/minute

---

## 🌐 DNS Configuration

Point your domain to your server:
```bash
# A Record
your-domain.com -> YOUR_SERVER_IP

# Optional: www subdomain
www.your-domain.com -> YOUR_SERVER_IP
```

---

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl https://your-domain.com/health

# Database health
sudo docker compose exec postgres pg_isready -U postgres

# Container health
sudo docker compose ps
```

### Log Monitoring
```bash
# Real-time logs
sudo docker compose -f docker-compose.prod.yml logs -f

# Nginx access logs
sudo docker compose -f docker-compose.prod.yml logs nginx

# Application logs
sudo docker compose -f docker-compose.prod.yml logs backend frontend
```

### Backup Procedures
```bash
# Database backup
sudo docker compose exec postgres pg_dump -U postgres urlshortener > backup_$(date +%Y%m%d).sql

# Restore database
sudo docker compose exec -T postgres psql -U postgres urlshortener < backup_20240922.sql
```

### SSL Certificate Renewal
```bash
# Manual renewal (Let's Encrypt)
sudo certbot renew --dry-run

# Auto-renewal (add to crontab)
echo "0 2 * * * certbot renew --quiet --deploy-hook \"docker compose -f /path/to/docker-compose.prod.yml restart nginx\"" | sudo crontab -
```

---

## 🚨 Common Issues and Solutions

### Frontend Shows Old Version
```bash
# Rebuild frontend container
sudo docker compose build frontend --no-cache --pull
sudo docker compose up frontend -d
```

### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/certs/cert.pem -text -noout

# Re-run SSL setup
./setup-ssl.sh
```

### Database Connection Issues
```bash
# Check database connectivity
sudo docker compose exec backend npm run db:status

# Reset database
sudo docker compose exec backend npx prisma db push --force-reset
sudo docker compose exec backend npm run db:seed
```

### Nginx Configuration Issues
```bash
# Test nginx configuration
sudo docker compose exec nginx nginx -t

# Reload nginx configuration
sudo docker compose exec nginx nginx -s reload
```

---

## 📋 Quick Reference

### Key Files
- `docker-compose.yml` - Application deployment
- `.env.prod` - Environment template
- `reverse-proxy-examples/` - Reverse proxy configuration examples
- `setup-oauth.sh` - Google OAuth setup
- `rebuild-frontend.sh` - Quick frontend rebuild

### Key Commands
```bash
# Development & Production
sudo docker compose up -d
sudo docker compose build frontend --no-cache

# Setup
./setup-oauth.sh
./rebuild-frontend.sh

# Maintenance
sudo docker compose logs -f
sudo docker compose ps
sudo docker compose restart <service>
```

### URLs
- **Development**: http://localhost:3000 (frontend), http://localhost:4000 (backend)
- **Production**: https://your-domain.com (via reverse proxy)
- **API**: https://your-domain.com/api (routed to port 4000)
- **Health Check**: http://localhost:4000/health (direct), https://your-domain.com/api/health (via proxy)

---

## 🎯 Next Steps After Deployment

1. **Configure Google OAuth** using `./setup-oauth.sh`
2. **Test complete authentication flow**
3. **Create first admin user**
4. **Set up SSL certificate auto-renewal**
5. **Configure monitoring and backups**
6. **Test URL shortening functionality**

---

## 📞 Support

If you encounter issues:
1. Check `DEPLOYMENT_STATUS.md` for current system status
2. Review container logs: `sudo docker compose logs`
3. Verify environment variables in `.env` file
4. Check firewall and DNS settings
5. Verify SSL certificate validity

For Google OAuth issues, see `GOOGLE_OAUTH_SETUP.md`.