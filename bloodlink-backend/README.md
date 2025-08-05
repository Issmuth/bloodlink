# 🩸 Bloodlink Blood Donor Platform - Backend API

A robust Node.js backend API for the Bloodlink Blood Donor Platform, built with Express.js, PostgreSQL, and Prisma ORM. This API handles authentication, user management, blood donation operations, and real-time notifications for both donors and health centers.

## 🚀 Features

### Authentication & Security

- **JWT Authentication** with access and refresh tokens
- **Role-based Authorization** (Donors and Health Centers)
- **Password Security** with bcrypt hashing
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **Comprehensive Error Handling**
- **CORS Configuration** for frontend integration

### User Management

- **User Registration** with role-specific profiles
- **Profile Management** for both donors and health centers
- **Password Management** (change, reset, forgot)
- **Account Status Management** (active, suspended, inactive)
- **Email Verification** system

### Donor Features

- **Donor Profiles** with blood type, medical info, and availability
- **Donation History** tracking and management
- **Availability Management** (available/unavailable status)
- **Donor Search** by blood type and location
- **Statistics Dashboard** for donor metrics

### Health Center Features

- **Health Center Profiles** with facility information
- **Verification System** for health center validation
- **Donor Search** for finding compatible donors
- **Blood Request Management** with urgency levels
- **Capacity and Services Management**

### Blood Request System

- **Create Blood Requests** with urgency and requirements
- **Real-time Donor Matching** by blood type and location
- **Request Status Management** (active, fulfilled, cancelled)
- **Automated Notifications** to matching donors
- **Request History** and analytics

### Telegram Integration

- **Bot Integration** for instant notifications
- **Deep Link Generation** for easy bot connection
- **Broadcast Messaging** for urgent requests
- **User Linking** system for Telegram accounts

### Technical Features

- **Database Transactions** for data consistency
- **Soft Delete** for data integrity
- **Comprehensive Logging** with Morgan
- **API Documentation** with built-in endpoints
- **Health Check** endpoints for monitoring
- **Graceful Shutdown** handling

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Environment**: dotenv
- **HTTP Client**: Axios (for external APIs)

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 12.0 or higher
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to backend directory
cd bloodlink-backend

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bloodlink_db"
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Optional: Seed database with sample data
npm run seed
```

### 4. Start Development Server

```bash
# Start in development mode
npm run dev

# Or start in production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint                | Description               | Auth Required |
| ------ | ----------------------- | ------------------------- | ------------- |
| POST   | `/auth/register`        | Register new user         | No            |
| POST   | `/auth/login`           | User login                | No            |
| POST   | `/auth/refresh`         | Refresh access token      | No            |
| POST   | `/auth/logout`          | User logout               | No            |
| POST   | `/auth/forgot-password` | Request password reset    | No            |
| POST   | `/auth/reset-password`  | Reset password with token | No            |
| GET    | `/auth/profile`         | Get current user profile  | Yes           |
| PUT    | `/auth/change-password` | Change password           | Yes           |

### User Management Endpoints

| Method | Endpoint         | Description         | Auth Required |
| ------ | ---------------- | ------------------- | ------------- |
| GET    | `/users/profile` | Get user profile    | Yes           |
| PUT    | `/users/profile` | Update user profile | Yes           |
| GET    | `/users/stats`   | Get user statistics | Yes           |
| DELETE | `/users/account` | Deactivate account  | Yes           |

### Donor Endpoints

| Method | Endpoint               | Description           | Auth Required |
| ------ | ---------------------- | --------------------- | ------------- |
| GET    | `/donors`              | List available donors | No            |
| GET    | `/donors/stats`        | Get donor statistics  | No            |
| GET    | `/donors/profile`      | Get donor profile     | Yes (Donor)   |
| PUT    | `/donors/profile`      | Update donor profile  | Yes (Donor)   |
| PUT    | `/donors/availability` | Update availability   | Yes (Donor)   |
| POST   | `/donors/donations`    | Record donation       | Yes (Donor)   |
| GET    | `/donors/donations`    | Get donation history  | Yes (Donor)   |

### Health Center Endpoints

| Method | Endpoint                        | Description                  | Auth Required |
| ------ | ------------------------------- | ---------------------------- | ------------- |
| GET    | `/health-centers`               | List health centers          | No            |
| GET    | `/health-centers/stats`         | Get health center stats      | No            |
| GET    | `/health-centers/profile`       | Get health center profile    | Yes (HC)      |
| PUT    | `/health-centers/profile`       | Update health center profile | Yes (HC)      |
| POST   | `/health-centers/verification`  | Submit verification          | Yes (HC)      |
| GET    | `/health-centers/verification`  | Get verification status      | Yes (HC)      |
| GET    | `/health-centers/search-donors` | Search for donors            | Yes (HC)      |

### Blood Request Endpoints

| Method | Endpoint                | Description              | Auth Required |
| ------ | ----------------------- | ------------------------ | ------------- |
| POST   | `/blood-requests`       | Create blood request     | Yes (HC)      |
| GET    | `/blood-requests`       | List blood requests      | Yes           |
| GET    | `/blood-requests/:id`   | Get specific request     | Yes           |
| PUT    | `/blood-requests/:id`   | Update request status    | Yes (HC)      |
| DELETE | `/blood-requests/:id`   | Cancel blood request     | Yes (HC)      |

### Telegram Integration Endpoints

| Method | Endpoint                           | Description                    | Auth Required |
| ------ | ---------------------------------- | ------------------------------ | ------------- |
| POST   | `/telegram/link-telegram`          | Link Telegram account          | Yes           |
| GET    | `/telegram/deep-link/:userId`      | Generate deep link             | Yes           |
| GET    | `/telegram/test-broadcast`         | Test broadcast functionality   | Yes           |
| POST   | `/telegram/notify-blood-request`   | Send blood request notification| Yes (HC)      |

## 🔧 API Usage Examples

### Registration (Donor)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "donor",
    "phone": "+1234567890",
    "location": "New York, NY",
    "telegramUsername": "@donoruser",
    "fullName": "John Doe",
    "bloodType": "O+"
  }'
```

### Registration (Health Center)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hospital@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "health_center",
    "phone": "+1234567890",
    "location": "New York, NY",
    "telegramUsername": "@hospitalgroup",
    "centerName": "City General Hospital",
    "contactPerson": "Dr. Jane Smith"
  }'
```

### Create Blood Request

```bash
curl -X POST http://localhost:5000/api/blood-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "bloodType": "O+",
    "unitsNeeded": 2,
    "urgency": "High",
    "patientAge": 45,
    "procedure": "Emergency Surgery",
    "notes": "Patient requires immediate transfusion",
    "expectedTimeframe": "within-6h"
  }'
```

### Search Donors (Health Center)

```bash
curl -X GET "http://localhost:5000/api/health-centers/search-donors?bloodType=O+&location=New York" \
  -H "Authorization: Bearer your-jwt-token"
```

## 🗄️ Database Schema

### Users Table

- Basic user information (email, password, role, contact info)
- Status management (active, inactive, suspended, pending verification)
- Telegram integration field for notifications
- Timestamps for creation and updates

### Donors Table

- Donor-specific information (full name, blood type, medical notes)
- Donation tracking (count, last donation date)
- Availability status and preferences
- Emergency contact information

### Health Centers Table

- Health center information (name, contact person, type)
- Verification status and documentation
- Capacity and services information
- Operating hours and facility details

### Blood Requests Table

- Request details (blood type, units needed, urgency)
- Patient information and procedure details
- Status tracking (active, fulfilled, cancelled)
- Timestamps and expiration handling

### Supporting Tables

- RefreshTokens: JWT refresh token management
- PasswordResets: Password reset token management
- Donations: Historical donation records
- Notifications: Message delivery tracking

## 🔒 Security Features

### Authentication

- JWT tokens with configurable expiration
- Refresh token rotation for enhanced security
- Password strength validation
- Rate limiting on authentication endpoints

### Authorization

- Role-based access control (RBAC)
- Route-specific permissions
- Resource ownership validation
- Protected endpoint middleware

### Data Protection

- Password hashing with bcrypt
- Input sanitization and validation
- SQL injection prevention with Prisma
- XSS protection with Helmet
- CORS configuration for frontend integration

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=your-strong-production-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:5000/health
```

### API Status

```bash
curl http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### Error Response

```json
{
  "success": false,
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Maintenance

### Database Maintenance

```bash
# Reset database
npm run migrate:reset

# Deploy new migrations
npm run migrate:deploy

# View database
npm run studio
```

### Token Cleanup

The API automatically cleans up expired refresh tokens. You can also run manual cleanup:

```bash
# This would be a custom script
npm run cleanup:tokens
```

## 📞 Support

For support, email support@Bloodlink.org or create an issue in the repository.

---

**Built with ❤️ for saving lives | © 2024 Bloodlink Blood Donor Platform**
