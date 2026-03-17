@echo off
REM CampusHire - Quick Start Setup Script (Windows)

echo 🚀 Setting up CampusHire...
echo.

REM Frontend Setup
echo 📦 Setting up Frontend...
cd frontend
call npm install
echo ✅ Frontend dependencies installed
cd ..

REM Backend Setup  
echo 📦 Setting up Backend...
cd Backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo ✅ Backend dependencies installed
cd ..

echo.
echo ✅ Setup complete!
echo.
echo To run the application:
echo   Option 1 - Using Docker Compose (Recommended):
echo     docker-compose up
echo.
echo   Option 2 - Manual Setup:
echo     Terminal 1 - Backend:
echo       cd Backend && venv\Scripts\activate.bat && python main.py
echo.
echo     Terminal 2 - Frontend:
echo       cd frontend && npm start
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:8000
echo API Documentation will be available at: http://localhost:8000/docs
pause
