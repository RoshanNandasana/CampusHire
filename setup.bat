@echo off

echo Setting up CampusHire...

cd frontend
call npm install
cd ..

cd Backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt

if not exist .env if exist .env.example copy .env.example .env >nul

echo Setup complete.
echo Start services:
echo 1) docker compose up -d postgres minio
echo 2) cd Backend ^&^& venv\Scripts\activate.bat ^&^& python seed.py ^&^& python main.py
echo 3) cd frontend ^&^& npm start
pause
