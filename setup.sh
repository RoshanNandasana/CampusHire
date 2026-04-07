#!/bin/bash

set -e

echo "Setting up CampusHire..."

cd frontend
npm install
cd ..

cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

echo "Setup complete."
echo "Start services:"
echo "1) docker compose up -d postgres minio"
echo "2) cd Backend && source venv/bin/activate && python seed.py && python main.py"
echo "3) cd frontend && npm start"
