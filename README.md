# URL Shortener

A comprehensive URL shortening web application with a CMS dashboard and detailed analytics. Built with Node.js, React, PostgreSQL, and Docker.

## Features

### 🔐 Modern Authentication
- **Google OAuth SSO**: Secure sign-in with Google accounts
- **Multi-user support**: Admin can invite users by email
- **Role-based access**: SUPER_ADMIN, ADMIN, and USER roles
- **Invitation-only system**: No self-registration, secure by default

### 🔗 URL Shortening
- Create short URLs with custom slugs or auto-generated ones
- Bulk URL management with edit and delete functionality
- URL validation and duplicate slug prevention
- Real-time click tracking

### 📊 Analytics & Insights
- Detailed click analytics with charts and graphs
- Daily click trends and patterns
- Top referrer tracking
- Recent activity monitoring
- Export-ready data visualization

### 🎨 Modern UI/UX
- **Dark theme support**: Automatic system theme detection + manual toggle
- Clean, responsive design built with Tailwind CSS
- Real-time notifications and feedback
- Mobile-friendly interface
- Copy-to-clipboard functionality

### 🐳 Docker Ready
- Complete containerization with Docker Compose
- Production-ready configuration
- Health checks and auto-restart policies
- Volume persistence for database

## 1. Prerequisites

- **Docker & Docker Compose**: For containerized deployment
- **Node.js 18+**: For manual development setup
- **PostgreSQL**: For manual development setup
- **Git**: For cloning the repository

## 2. Environment Examples

### Docker (.env)
```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=urlshortener

# JWT & Session Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-at-least-32-characters
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-at-least-32-characters

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DOMAIN_NAME=localhost

# Initial Admin User (OAuth only - no password)
ADMIN_EMAIL=admin@example.com

# Port Configuration
FRONTEND_PORT=3000
BACKEND_PORT=4000
```

### Backend (.env)
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/urlshortener?schema=public"

# JWT Secret for token signing
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-at-least-32-characters"

# Session Secret for OAuth sessions
SESSION_SECRET="your-super-secret-session-key-change-this-in-production-at-least-32-characters"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Initial Admin User Configuration
# This email will be created as SUPER_ADMIN on first run
ADMIN_EMAIL=admin@example.com
```

### Frontend (.env)
```env
# Backend API URL
VITE_API_URL=http://localhost:4000
```

## 3. Run

For development with manual setup:

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 4. Run with Docker

```bash
# Clone the repository
git clone <repository-url>
cd url-shortener

# Copy and configure environment
cp .env.example .env
# Edit .env with your values:
# - Set ADMIN_EMAIL to your Google-enabled email
# - Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
# - Update database passwords and secrets

# Start all services
docker-compose up -d

# The system will automatically:
# 1. Set up PostgreSQL database
# 2. Run database migrations
# 3. Create admin user with ADMIN_EMAIL
# 4. Start all services

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**🎉 After deployment:**
1. Go to `http://localhost:3000`
2. Click "Sign in with Google"
3. Use the email you set in `ADMIN_EMAIL`
4. You'll have full admin access immediately!

## 5. Migrate

Apply database schema changes:

```bash
# Manual setup
cd backend
npm run db:migrate

# Docker setup
docker-compose exec backend npm run db:migrate
```

## 6. DB Push

Push schema changes to database (alternative to migrate):

```bash
# Manual setup
cd backend
npx prisma db push

# Docker setup
docker-compose exec backend npx prisma db push
```

## 7. DB Seed

Seed the database:

```bash
# Manual setup
cd backend
npm run db:seed

# Docker setup
docker-compose exec backend npm run db:seed
```

**Note**: The system automatically creates an initial super admin user on first deployment using the `ADMIN_EMAIL` environment variable. This user must sign in via Google OAuth.

## API Documentation

### Authentication Endpoints

- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user information
- `POST /auth/logout` - Logout user

### User Management Endpoints (Admin only)

- `POST /auth/invite-user` - Invite a new user by email
- `GET /auth/users` - List all users with pagination
- `PATCH /auth/users/:id/toggle-active` - Toggle user active status
- `DELETE /auth/users/:id` - Delete a user

### URL Management Endpoints

- `POST /urls` - Create a new short URL
- `GET /urls` - List all URLs with pagination
- `GET /urls/:id` - Get URL details with analytics
- `PUT /urls/:id` - Update URL destination
- `DELETE /urls/:id` - Delete a URL

### Redirect Endpoint

- `GET /:slug` - Redirect to original URL and log click

## Database Schema

### Users Table
- `id` (String, Primary Key, CUID)
- `email` (String, Unique)
- `googleId` (String, Unique, Nullable)
- `name` (String, Nullable)
- `avatar` (String, Nullable)
- `role` (UserRole: SUPER_ADMIN, ADMIN, USER)
- `isActive` (Boolean, default: true)
- `createdAt` (DateTime)
- `lastLoginAt` (DateTime, Nullable)

### Short URLs Table
- `id` (String, Primary Key, UUID)
- `slug` (String, Unique)
- `destination` (String)
- `createdBy` (String, Foreign Key → users.id)
- `createdAt` (DateTime)

### Clicks Table
- `id` (String, Primary Key, UUID)
- `shortUrlId` (String, Foreign Key → short_urls.id)
- `clickedAt` (DateTime)
- `ipHash` (String, Hashed for privacy)
- `referrer` (String, Nullable)

## Google OAuth Setup

1. **Create Google OAuth Application**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set authorized redirect URIs:
     - `http://localhost:4000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)

2. **Configure Environment Variables**:
   - Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your `.env`
   - Follow detailed instructions in `GOOGLE_OAUTH_SETUP.md`

3. **Initial Admin User**:
   - The system automatically creates a super admin user using `ADMIN_EMAIL` environment variable
   - Make sure the email in `ADMIN_EMAIL` has access to a Google account
   - On first deployment, this user will be created and can immediately sign in via Google OAuth
   - No API calls needed - the admin user is ready after first database seed

## Useful Commands

### Database Management
```bash
# Reset database (careful - deletes all data!)
cd backend
npx prisma migrate reset

# View database in browser
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Check migration status
npx prisma migrate status
```

### Docker Management
```bash
# Rebuild containers after code changes
docker-compose up --build

# View container logs
docker-compose logs backend
docker-compose logs frontend

# Execute commands in running containers
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d urlshortener

# Clean up Docker resources
docker-compose down -v  # Removes volumes too
docker system prune     # Clean unused resources
```

### Development
```bash
# Backend development with hot reload
cd backend && npm run dev

# Frontend development with hot reload
cd frontend && npm run dev

# Lint frontend code
cd frontend && npm run lint

# Build frontend for production
cd frontend && npm run build
```

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │────│   Backend   │────│ PostgreSQL  │
│ (React/Vite)│    │(Node.js/API)│    │  Database   │
│             │    │             │    │             │
│ Port: 3000  │    │ Port: 4000  │    │ Port: 5432  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Tech Stack

**Backend:**
- Node.js with Express.js
- Prisma ORM for database operations
- JWT for authentication
- bcrypt for password hashing
- CORS, Helmet for security

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Recharts for analytics visualization
- Lucide React for icons
- Axios for API communication

**Database:**
- PostgreSQL 15

**DevOps:**
- Docker & Docker Compose
- Nginx for frontend serving
- Health checks and auto-restart

## Security Features

- **OAuth-only authentication**: Google OAuth SSO eliminates password-based vulnerabilities
- **JWT-based sessions**: Secure token handling with configurable expiration
- **Role-based access control**: SUPER_ADMIN, ADMIN, and USER roles
- **Invitation-only system**: No self-registration, admin-controlled user creation
- **Privacy-compliant analytics**: IP address hashing for click tracking
- **CORS protection**: Configurable cross-origin resource sharing
- **Security headers**: Helmet.js for comprehensive HTTP security
- **Input validation**: Server-side validation and sanitization
- **SQL injection prevention**: Prisma ORM with parameterized queries

## Production Deployment

### Environment Variables for Production

Make sure to update these for production:

1. **Change JWT & Session Secrets**: Generate strong, random secrets (32+ characters)
2. **Update Database Credentials**: Use managed database service (AWS RDS, Google Cloud SQL)
3. **Set NODE_ENV**: Set to `production`
4. **Configure CORS**: Set appropriate FRONTEND_URL with HTTPS
5. **Google OAuth**: Update redirect URIs to production domain

### Scaling Considerations

- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL)
- Implement Redis for session storage and caching
- Use a CDN for static assets
- Set up load balancing for multiple backend instances
- Implement rate limiting
- Set up monitoring and logging

## API Rate Limiting

Consider implementing rate limiting in production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring

For production deployments, consider adding:

- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (ELK stack)
- Uptime monitoring
- Database performance monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Happy URL Shortening! 🎉**