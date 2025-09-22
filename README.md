# URL Shortener

A comprehensive URL shortening web application with a CMS dashboard and detailed analytics. Built with Node.js, React, PostgreSQL, and Docker.

## Features

### 🔐 Authentication
- Secure admin-only access with JWT-based authentication
- Default admin account with forced password change on first login
- Email and password management

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
- Clean, responsive design built with Tailwind CSS
- Real-time notifications and feedback
- Mobile-friendly interface
- Copy-to-clipboard functionality

### 🐳 Docker Ready
- Complete containerization with Docker Compose
- Production-ready configuration
- Health checks and auto-restart policies
- Volume persistence for database

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system
- Git for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Database: localhost:5432

4. **Default Login Credentials**
   - Email: `admin@example.com`
   - Password: `admin123`

   **⚠️ Important:** You'll be forced to change these credentials on first login.

### That's it! 🚀

The application will automatically:
- Set up the PostgreSQL database
- Run database migrations
- Seed the default admin user
- Build and start all services

## Manual Development Setup

If you prefer to run the application manually for development:

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   # Make sure PostgreSQL is running
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL (default: http://localhost:4000)
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/urlshortener?schema=public"

# JWT Secret (Change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Default Admin Account
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
```

## API Documentation

### Authentication Endpoints

- `POST /auth/login` - Login with email and password
- `POST /auth/change-password` - Change password (required on first login)
- `GET /auth/me` - Get current user information

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
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `password` (Text, Hashed)
- `must_update` (Boolean, default: true)
- `created_at` (Timestamp)

### Short URLs Table
- `id` (UUID, Primary Key)
- `slug` (Text, Unique)
- `destination` (Text)
- `created_by` (Foreign Key → users.id)
- `created_at` (Timestamp)

### Clicks Table
- `id` (UUID, Primary Key)
- `short_url_id` (Foreign Key → short_urls.id)
- `clicked_at` (Timestamp)
- `ip_hash` (Text, Hashed for privacy)
- `referrer` (Text, Nullable)

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

- JWT-based authentication with secure token handling
- Password hashing with bcrypt (12 salt rounds)
- IP address hashing for privacy-compliant analytics
- CORS protection
- Security headers (Helmet.js)
- Input validation and sanitization
- SQL injection prevention with Prisma ORM

## Production Deployment

### Environment Variables for Production

Make sure to update these for production:

1. **Change JWT Secret**: Generate a strong, random JWT secret
2. **Update Database Credentials**: Use secure database credentials
3. **Set NODE_ENV**: Set to `production`
4. **Configure CORS**: Set appropriate FRONTEND_URL

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