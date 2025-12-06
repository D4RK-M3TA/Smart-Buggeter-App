# Quick Start Guide

Get Smart Personal Budgeter up and running in minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd smart-budgeter

# Run the setup script
./scripts/setup.sh
```

The script will:
1. Check for Docker and Docker Compose
2. Create `.env` file from template
3. Start all services
4. Run database migrations
5. Optionally create superuser
6. Initialize system categories
7. Optionally train ML model

## Option 2: Manual Setup

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (optional for local development)
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Initialize categories
docker-compose exec backend python manage.py init_categories
```

### 4. Train ML Model (Optional)

```bash
docker-compose exec backend python -c "from ml_engine.classifier import train_initial_model; train_initial_model()"
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin/

## First Steps

1. **Register an Account**
   - Go to http://localhost:3000
   - Click "Register"
   - Fill in your details

2. **Upload a Statement**
   - Navigate to "Upload" page
   - Upload a CSV file with transactions
   - Wait for processing to complete

3. **Set Up Budgets**
   - Go to "Budgets" page
   - Create budgets for different categories
   - Set spending limits

4. **View Insights**
   - Check the Dashboard for spending overview
   - View Insights page for detailed analytics

## Sample CSV Format

Your CSV file should have columns like:
- Date (YYYY-MM-DD or similar)
- Description/Memo
- Amount (positive for credits, negative for debits)

Example:
```csv
Date,Description,Amount
2024-01-15,GROCERY STORE,-50.00
2024-01-16,SALARY DEPOSIT,2000.00
2024-01-17,UBER RIDE,-15.50
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

### Database connection errors
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db
```

### Frontend not loading
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### ML model not working
```bash
# Train the model
docker-compose exec backend python -c "from ml_engine.classifier import train_initial_model; train_initial_model()"
```

## Development Mode

For development, you can run services separately:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Next Steps

- Read the [API Documentation](API.md)
- Check the [Deployment Guide](DEPLOYMENT.md) for production setup
- Review [Sequence Diagrams](SEQUENCE_DIAGRAMS.md) to understand the flow

## Support

For issues, check:
- [README.md](../README.md)
- [API.md](API.md)
- GitHub Issues

