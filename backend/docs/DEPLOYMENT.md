# Smart Personal Budgeter - Deployment Guide

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (for Celery, optional for development)

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/budgeter
SESSION_SECRET=your-secure-secret-key
```

### Optional
```bash
DEBUG=False
REDIS_URL=redis://localhost:6379/0
```

## Development Setup

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt
# Or with uv
uv sync

# Run migrations
python manage.py migrate

# Initialize categories
python manage.py init_categories

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Celery Worker (Optional)

For async task processing (statement parsing, ML inference):

```bash
celery -A budgeter worker -l info
```

## Production Deployment

### Backend

```bash
# Collect static files
python manage.py collectstatic --no-input

# Run with Gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 4 budgeter.wsgi:application
```

### Frontend

```bash
cd frontend

# Build production bundle
npm run build

# The dist/ folder contains the production build
```

### Docker Compose (Alternative)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: budgeter
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  backend:
    build: .
    command: gunicorn --bind 0.0.0.0:8000 --workers 4 budgeter.wsgi:application
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/budgeter
      - REDIS_URL=redis://redis:6379/0
      - DEBUG=False
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"

  celery:
    build: .
    command: celery -A budgeter worker -l info
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/budgeter
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5000:5000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## API Documentation

Once deployed, access API documentation at:

- Swagger UI: `http://your-domain/api/docs/`
- ReDoc: `http://your-domain/api/redoc/`
- OpenAPI Schema: `http://your-domain/api/schema/`

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use a strong `SESSION_SECRET`
- [ ] Configure HTTPS
- [ ] Set proper `ALLOWED_HOSTS`
- [ ] Review CORS settings
- [ ] Enable rate limiting
- [ ] Set up database backups

## ML Model Training

The ML model for transaction categorization can be trained:

1. **Initial Training**: Call `POST /api/ml/initialize/` to train with default data
2. **Custom Training**: Call `POST /api/ml/train/` with `include_user_data: true` to include your categorized transactions

The model is stored in `ml_models/transaction_classifier.joblib`.
