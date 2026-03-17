#!/bin/bash

# CampusHire - Quick Start Setup Script
# This script sets up both frontend and backend

echo "🚀 Setting up CampusHire..."
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# Backend Setup  
echo "📦 Setting up Backend..."
cd Backend
python -m venv venv

# Activate venv based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
echo "✅ Backend dependencies installed"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "  Option 1 - Using Docker Compose (Recommended):"
echo "    docker-compose up"
echo ""
echo "  Option 2 - Manual Setup:"
echo "    Terminal 1 - Backend:"
echo "      cd Backend && source venv/bin/activate && python main.py"
echo ""
echo "    Terminal 2 - Frontend:"
echo "      cd frontend && npm start"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:8000"
echo "API Documentation will be available at: http://localhost:8000/docs"
