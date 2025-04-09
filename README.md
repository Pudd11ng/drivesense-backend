# Drivesense

## Overview
Drivesense is a backend application built with Node.js and Express, designed to provide authentication functionality using Passport.js and MongoDB. This application serves as the backend for a Flutter app, enabling user registration, login, and profile management.

## Features
- User authentication with Passport.js
- Google OAuth and local authentication strategies
- MongoDB for data storage
- RESTful API for user-related operations
- Middleware for error handling and route protection

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)
- Docker (optional, for containerization)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd drivesense
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

### Running the Application
To run the application locally, use the following command:
```
npm start
```

### Docker Setup
To run the application using Docker, follow these steps:
1. Build the Docker image:
   ```
   docker-compose build
   ```

2. Start the services:
   ```
   docker-compose up
   ```

### API Endpoints
- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Log in an existing user
- **GET /api/users/profile** - Get user profile (protected route)

### License
This project is licensed under the ISC License.