# DriveSense Backend API

<div align="center">
  <img src="https://raw.githubusercontent.com/Pudd11ng/drivesense/main/assets/drivesense_logo.png" alt="DriveSense Logo" width="200"/>
  
  [![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange.svg)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Related Repositories](#related-repositories)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Flutter Integration](#flutter-integration)
- [Emergency System](#emergency-system)
- [AI Integration](#ai-integration)
- [Data Models](#data-models)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

DriveSense Backend is a comprehensive driving safety backend service built with Node.js and Express.js, featuring real-time accident detection, emergency contact notifications, and AI-powered driving insights. It serves as the core API server for the DriveSense intelligent driver safety assistant system.

### Key Technologies
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, Google OAuth 2.0
- **Cloud Services**: Firebase Cloud Messaging, Google Cloud Storage
- **AI Integration**: Google Gemini AI for driving insights
- **Email**: Nodemailer with Gmail integration
- **Security**: bcrypt, helmet, input validation

## 🔗 Related Repositories

- **Main App**: [drivesense](https://github.com/Pudd11ng/drivesense) - Flutter mobile application
- **Backend API**: [drivesense-backend](https://github.com/Pudd11ng/drivesense-backend) - Node.js backend server (this repository)
- **ESP32-CAM**: [drivesense-ESP32CAM](https://github.com/Pudd11ng/drivesense-ESP32CAM) - Camera module firmware

## ✨ Features

The backend provides RESTful APIs for:

### 🚗 Core Safety Features
- **User Management**: Secure registration, authentication, and profile management
- **Accident Detection**: Real-time accident monitoring and emergency notifications
- **Emergency Contacts**: Invitation-based emergency contact system with 24-hour invite codes
- **Driving History**: Comprehensive driving session tracking with behavior analysis
- **Risky Behavior Analysis**: Detection and monitoring of dangerous driving patterns
- **AI-Powered Insights**: Personalized driving tips using Google Gemini AI
- **Alert System**: Customizable audio alerts for different driving behaviors
- **Push Notifications**: Real-time notifications via Firebase Cloud Messaging

### 🔔 Notification System
- **Real-time Alerts**: Immediate notifications for accidents and risky behaviors
- **Emergency Broadcasting**: Automatic alerts to all emergency contacts
- **In-app Notifications**: Persistent notification history with read/unread status
- **Multi-device Support**: FCM token management for multiple devices per user

### 📊 Analytics & AI
- **Behavior Tracking**: Historical data analysis of driving patterns
- **AI Insights**: Google Gemini-powered personalized driving recommendations
- **Trip Analytics**: Detailed statistics and safety scores
- **Predictive Analysis**: Pattern recognition for safety improvement

### 🔐 Security & Privacy
- **JWT Authentication**: Secure token-based authentication with 24-hour expiry
- **Google OAuth**: Seamless integration with Google Sign-In
- **Data Encryption**: bcrypt password hashing and secure data storage
- **Input Validation**: Comprehensive request validation and sanitization
- **Role-based Access**: User-specific data access control

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, Google OAuth 2.0
- **File Storage**: Google Cloud Storage
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Email Service**: Nodemailer with Gmail
- **AI Integration**: Google Gemini AI for driving insights
- **Security**: bcrypt for password hashing, helmet for security headers

### Database Models
- **User**: User profiles, emergency contacts, FCM tokens
- **Accident**: Accident records with location and contact information
- **DrivingHistory**: Driving session tracking with accidents and behaviors
- **RiskyBehaviour**: Dangerous driving behavior detection
- **Alert**: Customizable audio alerts for different behaviors
- **Notification**: In-app notification history
- **Device**: Device management for multi-device support

## 📋 Prerequisites

### Development Environment
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Git**: For version control
- **MongoDB**: Database (local or MongoDB Atlas)

### Required Accounts & Services
- **MongoDB Atlas**: Cloud database service
- **Google Cloud Platform**: For storage and AI services
- **Firebase Project**: For Cloud Messaging
- **Gmail Account**: For email services (with app password)

### API Keys & Credentials
- Firebase service account key
- Google Cloud service account key
- JWT secret key
- Email service credentials

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Pudd11ng/drivesense-backend.git
cd drivesense-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Google Cloud Services
GCS_BUCKET_NAME=your-storage-bucket-name
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend Integration
FRONTEND_URL=http://localhost:3000
```

### 4. Firebase Configuration
- Place your `firebase-service-account.json` file in the `src/config/` directory
- This file should contain your Firebase Admin SDK credentials

### 5. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## ⚙️ Configuration

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Cloud Messaging

2. **Generate Service Account Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-service-account.json` in your project root

3. **Configure FCM**
   - The Firebase Admin SDK is automatically initialized in the app
   - FCM tokens are managed through the user registration system

### Google Cloud Storage Setup

1. **Create a Storage Bucket**
   ```bash
   gsutil mb gs://your-bucket-name
   ```

2. **Set up Authentication**
   - Enable the Google Cloud Storage API
   - Create a service account with Storage Admin role
   - Download the JSON key file
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable or use Application Default Credentials

3. **Configure CORS (Optional)**
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "responseHeader": ["Content-Type"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

### Email Service Setup

1. **Gmail App Password**
   - Enable 2-factor authentication on your Gmail account
   - Generate an app password: Account → Security → App passwords
   - Use this password in the `EMAIL_PASSWORD` environment variable

2. **Alternative Email Services**
   - The service supports other email providers through Nodemailer
   - Update the `EMAIL_SERVICE` configuration accordingly

### Google Gemini AI Setup

1. **Enable Vertex AI API**
   - Go to Google Cloud Console
   - Enable the Vertex AI API
   - Ensure your service account has Vertex AI User role

2. **Configuration**
   - Set `GOOGLE_GENAI_USE_VERTEXAI=True` in your environment
   - The service will automatically use your default credentials

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Headers
All protected routes require:
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/emergency-invite` - Generate emergency contact invitation
- `POST /api/users/emergency-accept` - Accept emergency contact invitation
- `GET /api/users/emergency-contacts` - Get emergency contacts
- `DELETE /api/users/emergency-contacts/:contactId` - Remove emergency contact
- `POST /api/users/device-token` - Register FCM token
- `DELETE /api/users/device-token` - Remove FCM token

### Accident Management
- `POST /api/accidents` - Create accident record
- `GET /api/accidents` - Get user's accidents
- `GET /api/accidents/stats` - Get accident statistics
- `GET /api/accidents/:id` - Get specific accident
- `PUT /api/accidents/:id` - Update accident
- `DELETE /api/accidents/:id` - Delete accident

### Driving History
- `POST /api/driving` - Create driving session
- `GET /api/driving` - Get driving history
- `GET /api/driving/tips` - Get AI driving tips
- `GET /api/driving/:id` - Get specific session
- `PUT /api/driving/:id` - Update session
- `DELETE /api/driving/:id` - Delete session
- `POST /api/driving/:id/accidents` - Add accident to session
- `POST /api/driving/:id/behaviours` - Add risky behavior to session

### Risky Behaviors
- `POST /api/behaviours` - Create risky behavior record
- `GET /api/behaviours` - Get user's risky behaviors
- `GET /api/behaviours/:id` - Get specific behavior
- `PUT /api/behaviours/:id` - Update behavior
- `DELETE /api/behaviours/:id` - Delete behavior

### Alert System
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `POST /api/alerts/:id/upload` - Upload audio file

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔐 Security

### JWT Authentication
- Access tokens expire in 24 hours
- Refresh tokens are not implemented (stateless design)
- All protected routes require `Authorization: Bearer <token>` header

### Google OAuth 2.0
- Supports Google Sign-In for web and mobile
- Automatically creates user accounts for new Google users
- Links existing accounts if email matches

### Security Features
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting (configurable)
- CORS protection
- Helmet security headers
- MongoDB injection protection

## 📱 Flutter Integration

### API Client Setup
```dart
// Base API configuration
class ApiClient {
  static const String baseUrl = 'https://your-backend-url.com/api';
  
  // Add JWT token to requests
  static Map<String, String> getHeaders(String? token) {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
}
```

### FCM Token Management
```dart
// Register FCM token
await FirebaseMessaging.instance.requestPermission();
String? token = await FirebaseMessaging.instance.getToken();

// Send to backend
await apiClient.post('/api/users/device-token', {
  'token': token,
  'deviceId': deviceId
});
```

### Emergency Contact System
```dart
// Generate invitation code
final response = await apiClient.post('/api/users/emergency-invite');
final inviteCode = response.data['inviteCode'];

// Accept invitation
await apiClient.post('/api/users/emergency-accept', {
  'inviteCode': inviteCode
});
```

### Real-time Notifications
```dart
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  if (message.data['type'] == 'accident_alert') {
    // Handle accident notification
    showAccidentAlert(message.data);
  }
});
```

## 🚨 Emergency System

### How it Works
1. User generates a temporary invitation code (24-hour expiry)
2. User shares the code with their emergency contact
3. Emergency contact accepts the invitation using the code
4. Both users are now connected as emergency contacts
5. Accident notifications are automatically sent to all emergency contacts

### Notification Flow
1. Accident is detected and recorded
2. System finds all emergency contacts for the user
3. In-app notifications are created for each contact
4. Push notifications are sent via FCM to all contact devices
5. Notifications include accident location and time

## 🤖 AI Integration

### Google Gemini Integration
- Analyzes driving history, accidents, and risky behaviors
- Provides personalized driving tips and recommendations
- Generates insights based on driving patterns
- Supports both specific trip analysis and overall driving assessment

### Usage Example
```javascript
// Get driving tips for a specific trip
GET /api/driving/12345/tips

// Get overall driving insights
GET /api/driving/tips?startDate=2024-01-01&endDate=2024-12-31
```

## 📊 Data Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  dateOfBirth: String,
  country: String,
  authMethod: String, // 'local' or 'google'
  fcmTokens: [String], // FCM device tokens
  emergencyContactUserIds: [ObjectId], // Emergency contacts
  emergencyInviteCode: String, // Temporary invite code
  emergencyInviteExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Accident Model
```javascript
{
  detectedTime: Date,
  location: String,
  contactNum: String,
  contactTime: Date,
  userId: ObjectId,
  deviceId: ObjectId
}
```

### DrivingHistory Model
```javascript
{
  startTime: Date,
  endTime: Date,
  distanceDriven: Number,
  userId: ObjectId,
  deviceId: ObjectId,
  accidents: [ObjectId],
  riskyBehaviours: [ObjectId]
}
```

## 🔄 Development

### Running in Development Mode
```bash
# Install dependencies
npm install

# Start with auto-reload (if nodemon is installed)
npm run dev

# Start normally
npm start

# Run tests
npm test

# Code analysis
npm run lint
```

### Project Structure
```
src/
├── config/             # Configuration files
│   ├── database.js
│   └── firebase-service-account.json
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── accidentController.js
│   ├── drivingHistoryController.js
│   ├── alertController.js
│   └── notificationController.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation/
├── models/            # Database models
│   ├── User.js
│   ├── Accident.js
│   ├── DrivingHistory.js
│   └── Alert.js
├── routes/            # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── index.js
├── services/          # Business logic
│   ├── notificationService.js
│   ├── emailService.js
│   ├── storageService.js
│   └── geminiService.js
├── utils/             # Utility functions
│   └── logger.js
└── app.js             # Main application file
```

### Environment Variables
- Copy `.env.example` to `.env` (if available)
- Update all required environment variables
- Never commit `.env` files to version control

### Database Schema
- MongoDB is schema-less, but models define structure
- Use Mongoose for ODM and validation
- Indexes are created automatically for frequently queried fields

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MongoDB URI format
- Verify database credentials
- Ensure MongoDB Atlas IP whitelist includes your server

**Firebase FCM Errors**
- Verify service account key is properly configured
- Check Firebase project settings
- Ensure FCM is enabled in Firebase Console

**Google Cloud Storage Issues**
- Verify bucket exists and is accessible
- Check service account permissions
- Ensure proper CORS configuration

**ESP32-CAM Integration Issues**
- Backend doesn't directly connect to ESP32-CAM
- Flutter app streams video from ESP32-CAM to backend for processing
- Ensure ESP32-CAM firmware is properly configured
- Default network: `drivesense_camera_ds000001`, Password: `password123`
- Stream URL: `http://192.168.4.1` (configured in Flutter app)

**YOLO AI Model Integration**
- Backend receives processed data from Flutter app
- AI insights are generated using Google Gemini, not local YOLO
- Ensure proper data flow from Flutter → Backend → AI service

**Accelerometer Data Processing**
- Backend receives accelerometer data from Flutter app
- Accident detection algorithms process the sensor data
- Ensure proper data validation and threshold configuration

### Debug Commands
```bash
# View detailed logs
DEBUG=* npm start

# Check dependencies
npm list

# Analyze code
npm run analyze

# Test API endpoints
curl -X GET http://localhost:3000/api/health
```

## 🚀 Deployment

### Production Environment Setup
1. **Database**: Set up production MongoDB cluster (MongoDB Atlas recommended)
2. **Firebase**: Configure production Firebase project
3. **Google Cloud**: Set up production Google Cloud Storage bucket
4. **SSL/TLS**: Configure HTTPS certificates for production domain
5. **Environment**: Set all production environment variables

### Docker Deployment
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  drivesense-backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./src/config/firebase-service-account.json:/app/src/config/firebase-service-account.json:ro
    restart: unless-stopped
    depends_on:
      - mongodb
    
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Google App Engine (app.yaml)
```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  MONGODB_URI: ${MONGODB_URI}
  JWT_SECRET: ${JWT_SECRET}
  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
  GCS_BUCKET_NAME: ${GCS_BUCKET_NAME}
  EMAIL_USER: ${EMAIL_USER}
  EMAIL_PASSWORD: ${EMAIL_PASSWORD}

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

handlers:
- url: /.*
  script: auto
```

### Health Checks & Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version
  });
});
```

### Performance Monitoring
- Monitor MongoDB connection status
- Track API response times
- Set up log aggregation (ELK stack, CloudWatch)
- Configure alerts for error rates and response times
- Monitor Firebase FCM delivery rates

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines
- Follow Node.js and Express.js best practices
- Use async/await for asynchronous operations
- Implement proper error handling
- Add comprehensive JSDoc comments
- Write unit tests for new features
- Follow RESTful API design principles

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "UserController"

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking (if TypeScript)
npm run type-check
```

## 🙏 Acknowledgments

- **Express.js** team for the robust web framework
- **MongoDB** team for the flexible NoSQL database
- **Firebase** team for cloud messaging services
- **Google Cloud** team for AI and storage services
- **Mongoose** team for elegant MongoDB object modeling
- **Node.js** community for the runtime environment
- **DriveSense** team for the innovative safety concept

---

<div align="center">
  <p>Built with ❤️ for road safety</p>
  <p>© 2025 DriveSense. All rights reserved.</p>
</div>
