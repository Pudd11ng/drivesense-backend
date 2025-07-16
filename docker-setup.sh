#!/bin/bash

# DriveSense Backend Docker Setup Script
# This script helps set up and deploy the DriveSense backend using Docker

echo "🚗 DriveSense Backend Docker Setup"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created from .env.example"
        echo "📝 Please edit .env file with your actual configuration values"
        echo "   - MongoDB credentials"
        echo "   - JWT secret key"
        echo "   - Google Cloud credentials"
        echo "   - Email service credentials"
        echo ""
        read -p "Press Enter to continue after editing .env file..."
    else
        echo "❌ .env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if firebase-service-account.json exists
if [ ! -f "src/config/firebase-service-account.json" ]; then
    echo "⚠️  Firebase service account file not found."
    echo "   Please place your firebase-service-account.json file in src/config/"
    echo "   This file is required for Firebase Cloud Messaging."
    read -p "Press Enter to continue after adding the file..."
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Backend API: http://localhost:3000"
    echo "🗄️  MongoDB: mongodb://localhost:27017"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart: docker-compose restart"
    echo "   - Remove everything: docker-compose down -v"
    echo ""
    echo "🏥 Health check: curl http://localhost:3000/health"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
fi
