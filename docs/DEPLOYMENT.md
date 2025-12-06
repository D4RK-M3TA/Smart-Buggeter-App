# Deployment Guide

This guide covers deploying Smart Personal Budgeter to various platforms.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (for production)
- AWS account (if using S3)

## Local Development Deployment

### Using Docker Compose

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker-compose up -d`
4. Initialize database: `docker-compose exec backend python manage.py migrate`
5. Create superuser: `docker-compose exec backend python manage.py createsuperuser`

## Production Deployment

### Option 1: AWS ECS (Recommended)

#### 1. Build and Push Docker Images

```bash
# Build images
docker build -t smart-budgeter-backend:latest ./backend
docker build -t smart-budgeter-frontend:latest ./frontend

# Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag smart-budgeter-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/smart-budgeter-backend:latest
docker tag smart-budgeter-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/smart-budgeter-frontend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/smart-budgeter-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/smart-budgeter-frontend:latest
```

#### 2. Create ECS Task Definitions

Create task definitions for:
- Backend service (Django + Gunicorn)
- Celery worker
- Celery beat
- Frontend (Nginx)

#### 3. Set Up RDS PostgreSQL

- Create RDS PostgreSQL instance
- Configure security groups
- Update environment variables with RDS endpoint

#### 4. Set Up ElastiCache Redis

- Create ElastiCache Redis cluster
- Update REDIS_URL in environment variables

#### 5. Configure Application Load Balancer

- Create ALB with SSL certificate
- Configure target groups for backend and frontend
- Set up health checks

#### 6. Environment Variables

Set in ECS task definitions:
```
SECRET_KEY=<generate-secure-key>
DEBUG=False
PGHOST=<rds-endpoint>
REDIS_URL=redis://<elasticache-endpoint>:6379/0
USE_S3=True
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
```

### Option 2: Azure App Service

#### 1. Create App Services

```bash
# Create resource group
az group create --name smart-budgeter-rg --location eastus

# Create PostgreSQL
az postgres flexible-server create \
  --resource-group smart-budgeter-rg \
  --name smart-budgeter-db \
  --admin-user postgres \
  --admin-password <password>

# Create Redis
az redis create \
  --resource-group smart-budgeter-rg \
  --name smart-budgeter-redis \
  --location eastus \
  --sku Basic

# Create App Service for backend
az webapp create \
  --resource-group smart-budgeter-rg \
  --plan smart-budgeter-plan \
  --name smart-budgeter-backend \
  --runtime "PYTHON:3.11"

# Create App Service for frontend
az webapp create \
  --resource-group smart-budgeter-rg \
  --plan smart-budgeter-plan \
  --name smart-budgeter-frontend \
  --runtime "NODE:20-lts"
```

#### 2. Configure App Settings

```bash
az webapp config appsettings set \
  --resource-group smart-budgeter-rg \
  --name smart-budgeter-backend \
  --settings \
    SECRET_KEY=<key> \
    DEBUG=False \
    PGHOST=<postgres-host> \
    REDIS_URL=redis://<redis-host>
```

### Option 3: Simple EC2/VPS

#### 1. Launch EC2 Instance

- Use Ubuntu 22.04 LTS
- Minimum: t3.medium (2 vCPU, 4GB RAM)
- Recommended: t3.large (2 vCPU, 8GB RAM)

#### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 3. Clone and Configure

```bash
git clone <repository-url>
cd smart-budgeter
cp .env.example .env
nano .env  # Edit configuration
```

#### 4. Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

#### 5. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/smart-budgeter`:

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

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 6. Start Services

```bash
docker-compose up -d
```

#### 7. Set Up Systemd Service (Optional)

Create `/etc/systemd/system/smart-budgeter.service`:

```ini
[Unit]
Description=Smart Budgeter
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/smart-budgeter
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

Enable: `sudo systemctl enable smart-budgeter`

## Database Migrations

Always run migrations after deployment:

```bash
docker-compose exec backend python manage.py migrate
```

## Backup Strategy

### Database Backups

```bash
# Manual backup
docker-compose exec db pg_dump -U postgres budgeter > backup.sql

# Automated daily backups (cron)
0 2 * * * docker-compose exec -T db pg_dump -U postgres budgeter > /backups/backup-$(date +\%Y\%m\%d).sql
```

### Media Files

If using S3, enable versioning and lifecycle policies.
For local storage, sync to S3 or another backup location.

## Monitoring

### Health Checks

- Backend: `GET /api/schema/`
- Frontend: `GET /`
- Database: PostgreSQL connection
- Redis: Redis ping

### Logs

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f celery
```

### Performance Monitoring

Consider integrating:
- Sentry for error tracking
- New Relic or Datadog for APM
- CloudWatch (AWS) or Application Insights (Azure)

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False in production
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up SSL/TLS
- [ ] Configure CORS properly
- [ ] Use strong database passwords
- [ ] Enable MFA for admin accounts
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups encrypted
- [ ] S3 bucket with proper IAM policies

## Scaling

### Horizontal Scaling

- Use load balancer with multiple backend instances
- Scale Celery workers based on queue length
- Use managed database services (RDS, Azure Database)

### Vertical Scaling

- Increase instance size for database
- Add more memory for Redis
- Increase Celery worker concurrency

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check PGHOST, credentials, security groups
2. **Redis connection errors**: Verify REDIS_URL and network access
3. **Static files not loading**: Run `collectstatic`
4. **Celery tasks not running**: Check Celery worker logs
5. **CORS errors**: Verify CORS_ALLOWED_ORIGINS settings

### Debug Mode

For troubleshooting, temporarily enable DEBUG:
```bash
export DEBUG=True
docker-compose restart backend
```

Remember to disable in production!

## Maintenance

### Regular Tasks

- Weekly: Review logs and error reports
- Monthly: Update dependencies
- Quarterly: Security audit
- As needed: Database optimization

### Updates

```bash
git pull
docker-compose build
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

