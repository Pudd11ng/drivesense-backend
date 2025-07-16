# DriveSense Backend Docker Setup Script (PowerShell)
# This script helps set up and deploy the DriveSense backend using Docker

Write-Host "🚗 DriveSense Backend Docker Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"        Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
        Write-Host "📝 Please edit .env file with your actual configuration values" -ForegroundColor Cyan
        Write-Host "   - MongoDB Atlas connection string (MONGODB_URI)" -ForegroundColor Cyan
        Write-Host "   - JWT secret key" -ForegroundColor Cyan
        Write-Host "   - Google Cloud credentials" -ForegroundColor Cyan
        Write-Host "   - Email service credentials" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  Important: Make sure your MongoDB Atlas cluster allows connections from 0.0.0.0/0" -ForegroundColor Yellow
        Write-Host "   or add your server's IP to the whitelist in MongoDB Atlas Network Access" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to continue after editing .env file"
    } else {
        Write-Host "❌ .env.example file not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Check if firebase-service-account.json exists
if (-not (Test-Path "src/config/firebase-service-account.json")) {
    Write-Host "⚠️  Firebase service account file not found." -ForegroundColor Yellow
    Write-Host "   Please place your firebase-service-account.json file in src/config/" -ForegroundColor Yellow
    Write-Host "   This file is required for Firebase Cloud Messaging." -ForegroundColor Yellow
    Read-Host "Press Enter to continue after adding the file"
}

# Build and start services
Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
docker-compose build

Write-Host "🚀 Starting services..." -ForegroundColor Blue
docker-compose up -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check if services are running
$services = docker-compose ps
if ($services -match "Up") {    Write-Host "✅ Services are running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Backend API: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🗄️  Database: MongoDB Atlas (cloud)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Useful commands:" -ForegroundColor Yellow
    Write-Host "   - View logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "   - Stop services: docker-compose down" -ForegroundColor White
    Write-Host "   - Restart: docker-compose restart" -ForegroundColor White
    Write-Host "   - Remove everything: docker-compose down -v" -ForegroundColor White
    Write-Host ""
    Write-Host "🏥 Health check: curl http://localhost:3000/health" -ForegroundColor Magenta
} else {
    Write-Host "❌ Some services failed to start. Check logs:" -ForegroundColor Red
    docker-compose logs
}
