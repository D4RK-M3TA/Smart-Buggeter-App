#!/bin/bash

# Smart Personal Budgeter Setup Script

set -e

echo "🚀 Setting up Smart Personal Budgeter..."

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

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Create superuser (optional)
echo ""
read -p "Do you want to create a superuser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose exec backend python manage.py createsuperuser
fi

# Initialize categories
echo "📁 Initializing system categories..."
docker-compose exec -T backend python manage.py init_categories

# Train ML model (optional)
echo ""
read -p "Do you want to train the initial ML model? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🤖 Training ML model..."
    docker-compose exec -T backend python -c "from ml_engine.classifier import train_initial_model; train_initial_model()"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Services:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/api/docs/"
echo "   - Admin: http://localhost:8000/admin/"
echo ""
echo "📝 Next steps:"
echo "   1. Access the frontend at http://localhost:3000"
echo "   2. Register a new account"
echo "   3. Upload a CSV statement to get started"
echo ""
echo "🛑 To stop services: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"

