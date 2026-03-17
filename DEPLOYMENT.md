# CampusHire - Deployment Guide

This guide covers deploying CampusHire to production environments.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Environment Setup](#environment-setup)
5. [Production Checklist](#production-checklist)

## Local Development

### Quick Start with npm

Install concurrent runner in frontend:
```bash
cd frontend
npm install --save-dev concurrently
```

Update frontend `package.json` scripts:
```json
"scripts": {
  "dev": "concurrently \"npm start\" \"npm run backend\"",
  "backend": "cd ../Backend && python main.py",
  "start": "react-scripts start",
  "build": "react-scripts build"
}
```

Then run both:
```bash
npm run dev
```

### Manual Setup

**Terminal 1 - Backend:**
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Docker Deployment

### Prerequisites
- Docker (latest version)
- Docker Compose (latest version)

### Build and Run

```bash
# Build images
docker-compose build

# Run services
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Setup

1. Update `.env` with production values:
```env
DEBUG=false
SECRET_KEY=your-very-secure-key-here
DATABASE_URL=postgresql://user:pass@db:5432/campushire
```

2. Build production images:
```bash
docker build -t campushire-backend:latest ./Backend
docker build -t campushire-frontend:latest ./frontend
```

3. Push to registry (Docker Hub, ECR, etc.):
```bash
docker tag campushire-backend:latest your-registry/campushire-backend:latest
docker push your-registry/campushire-backend:latest
# Repeat for frontend
```

## Cloud Deployment

### AWS Deployment (ECS + CloudFront)

1. **Backend (ECS/Fargate)**
   - Create ECR repositories for backend
   - Push Docker image: `aws ecr get-login-password | docker login --username AWS --password-stdin`
   - Create ECS task definition
   - Create ECS service
   - Configure RDS for PostgreSQL

2. **Frontend (S3 + CloudFront)**
   - Build React app: `npm run build`
   - Create S3 bucket
   - Upload build to S3
   - Create CloudFront distribution
   - Configure S3 bucket policy for CloudFront access

3. **API Gateway**
   - Create API Gateway
   - Point to ECS backend
   - Enable CORS
   - Setup SSL/TLS

### Heroku Deployment

**Backend:**
```bash
cd Backend
heroku create campushire-api
git push heroku main  # if on main branch
```

Create `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Frontend:**
```bash
cd frontend
npm run build
npx create-react-app campushire --template cra-template
heroku create campushire-web
npm install buildpack-registry heroku-buildpack-create-react-app
git push heroku main
```

### DigitalOcean / Linode Deployment

**Backend:**
1. Create Ubuntu VPS
2. SSH into server
3. Clone repository
4. Install Python 3.9+, pip, venv
5. Setup virtual environment
6. Install dependencies: `pip install -r requirements.txt`
7. Use Gunicorn/Uvicorn: 
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```
8. Setup Nginx as reverse proxy
9. Enable SSL with Let's Encrypt

**Frontend:**
1. Build React app: `npm run build`
2. Deploy to CDN or static hosting
3. Or serve with Nginx

## Environment Setup

### Environment Variables

Create `Backend/.env`:
```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/campushire

# Security
SECRET_KEY=your-very-long-random-secret-key-here

# CORS
CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password

# JWT
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

Create `frontend/.env.production`:
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

## Database Migration

### Setting up PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
createdb campushire

# Create user
createuser campushire_user
psql -d campushire -c "ALTER USER campushire_user WITH PASSWORD 'secure_password';"

# Grant privileges
psql -d campushire -c "GRANT ALL PRIVILEGES ON DATABASE campushire TO campushire_user;"
```

### Update Backend for PostgreSQL

Install psycopg2:
```bash
pip install psycopg2-binary
```

Update database URL in `Backend/.env`:
```env
DATABASE_URL=postgresql://campushire_user:secure_password@localhost:5432/campushire
```

## SSL/TLS Setup

### Using Let's Encrypt with Nginx

```bash
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Production Checklist

- [ ] Update `.env` with production values
- [ ] Set `DEBUG=false` in backend
- [ ] Generate strong `SECRET_KEY`
- [ ] Setup PostgreSQL database
- [ ] Configure CORS for production domain
- [ ] Setup SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Setup email/SMTP if needed
- [ ] Add authentication to sensitive endpoints
- [ ] Implement input validation (Pydantic)
- [ ] Setup logging and monitoring
- [ ] Configure backup strategy
- [ ] Setup CI/CD pipeline
- [ ] Load testing and optimization
- [ ] Security audit
- [ ] Documentation for deployment team

## Monitoring & Logging

### Application Monitoring

Install monitoring tools:
```bash
pip install python-json-logger prometheus-client
```

### Error Tracking

Setup Sentry:
```bash
pip install sentry-sdk
```

In `Backend/main.py`:
```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

## Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Minify CSS/JS
   - Optimize images
   - Use CDN

2. **Backend**
   - Add caching (Redis)
   - Database indexing
   - Query optimization
   - Rate limiting

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check CORS_ORIGINS environment variable |
| Database connection fails | Verify DATABASE_URL and credentials |
| Static files not loading | Configure Nginx or S3 bucket correctly |
| API timeout | Increase timeout settings or optimize queries |
| SSL certificate errors | Verify certificate renewal and nginx configuration |

---

For more help, check the main [README.md](README.md) or contact the development team.
