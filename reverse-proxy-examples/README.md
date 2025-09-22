# 🌐 Reverse Proxy Configuration Examples

The URL Shortener application is designed to work behind any reverse proxy. Here are configuration examples for popular reverse proxy solutions.

## 📋 Application Details

- **Frontend**: Runs on port `3000`
- **Backend API**: Runs on port `4000`
- **Health Check**: `GET /health` (backend)
- **WebSocket Support**: Not required
- **CORS**: Configured for reverse proxy setups

## 🔧 Configuration Examples

### 1. Nginx Proxy Manager (GUI-based)

**Recommended for beginners**

1. **Add New Proxy Host**:
   - **Domain Names**: `your-domain.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `your-server-ip`
   - **Forward Port**: `3000`

2. **Custom Locations** (for API):
   - **Location**: `/api`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `your-server-ip`
   - **Forward Port**: `4000`

3. **SSL Tab**:
   - ✅ Request a new SSL Certificate
   - ✅ Force SSL
   - ✅ HTTP/2 Support
   - ✅ HSTS Enabled

4. **Advanced Tab**:
   ```nginx
   # Increase timeout for auth operations
   proxy_read_timeout 300;
   proxy_connect_timeout 300;
   proxy_send_timeout 300;
   
   # Security headers
   add_header X-Frame-Options SAMEORIGIN always;
   add_header X-Content-Type-Options nosniff always;
   add_header X-XSS-Protection "1; mode=block" always;
   ```

---

### 2. Traefik (Labels-based)

**Already configured!** The docker-compose.yml includes Traefik labels.

**docker-compose.yml** (already includes):
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.urlshortener-frontend.rule=Host(`your-domain.com`)"
  - "traefik.http.services.urlshortener-frontend.loadbalancer.server.port=3000"
```

**traefik.yml** example:
```yaml
api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
  
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@your-domain.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

---

### 3. Caddy (Simple Config)

**Caddyfile**:
```caddy
your-domain.com {
    # API routes
    handle_path /api/* {
        reverse_proxy localhost:4000
    }
    
    # Frontend
    reverse_proxy localhost:3000
    
    # Security headers
    header {
        X-Frame-Options SAMEORIGIN
        X-Content-Type-Options nosniff
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

---

### 4. HAProxy

**haproxy.cfg**:
```haproxy
global
    daemon

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend http_frontend
    bind *:80
    redirect scheme https if !{ ssl_fc }

frontend https_frontend
    bind *:443 ssl crt /etc/ssl/certs/your-domain.pem
    
    # API routes
    acl is_api path_beg /api
    use_backend api_backend if is_api
    
    # Default to frontend
    default_backend frontend_backend

backend frontend_backend
    server frontend localhost:3000 check

backend api_backend
    server api localhost:4000 check
```

---

### 5. Manual Nginx Configuration

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:4000/health;
        proxy_set_header Host $host;
    }
    
    # Short URL redirects
    location ~ ^/s/[a-zA-Z0-9]+$ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 6. Cloudflare Tunnel (Zero Trust)

**cloudflared configuration**:
```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: your-domain.com
    path: /api
    service: http://localhost:4000
  - hostname: your-domain.com
    service: http://localhost:3000
  - service: http_status:404
```

---

## 🔧 Environment Configuration

Update your `.env` file for reverse proxy setup:

```bash
# Domain configuration
DOMAIN_NAME=your-domain.com
FRONTEND_URL=https://your-domain.com

# Port customization (if needed)
FRONTEND_PORT=3000
BACKEND_PORT=4000

# API URL for frontend
VITE_API_URL=https://your-domain.com/api

# OAuth redirect (important!)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 🚨 Important Notes

### Google OAuth Configuration
When using a reverse proxy, update your Google OAuth settings:

1. **Authorized JavaScript origins**:
   - `https://your-domain.com`

2. **Authorized redirect URIs**:
   - `https://your-domain.com/auth/google/callback`

### Environment Variables
The app automatically detects reverse proxy setups through these variables:
- `FRONTEND_URL` - Your domain URL
- `VITE_API_URL` - API endpoint URL
- `DOMAIN_NAME` - For Traefik labels

### Health Checks
All reverse proxies should check:
- **Frontend**: `http://localhost:3000/` (returns 200)
- **Backend**: `http://localhost:4000/health` (returns JSON)

## 🔍 Troubleshooting

### Common Issues

1. **OAuth not working**: Check redirect URIs match your domain
2. **API calls failing**: Ensure `/api` routes to port 4000
3. **CORS errors**: Set `FRONTEND_URL` environment variable
4. **Health checks failing**: Check if containers are running

### Debug Commands
```bash
# Check if containers are accessible
curl http://localhost:3000
curl http://localhost:4000/health

# Check environment variables
sudo docker compose exec backend env | grep -E "(FRONTEND_URL|GOOGLE_)"

# Check logs
sudo docker compose logs frontend backend
```

## 🎯 Recommendations

- **Beginners**: Use Nginx Proxy Manager (GUI-based)
- **Docker users**: Use Traefik (already configured)
- **Simplicity**: Use Caddy (automatic HTTPS)
- **Performance**: Use Nginx or HAProxy
- **Cloud**: Use Cloudflare Tunnel