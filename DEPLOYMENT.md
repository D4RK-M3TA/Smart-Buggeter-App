# Deployment Guide

## Netlify Deployment (Frontend)

This guide will help you deploy the Smart Budgeter frontend to Netlify.

### Prerequisites

1. A Netlify account (sign up at https://www.netlify.com)
2. Your backend API hosted somewhere (see Backend Deployment section below)
3. GitHub repository connected to Netlify

### Step 1: Prepare Your Backend API

Before deploying the frontend, you need to have your Django backend API hosted and accessible. You can use:
- **Railway** (recommended): https://railway.app
- **Render**: https://render.com
- **Heroku**: https://www.heroku.com
- **DigitalOcean App Platform**: https://www.digitalocean.com
- **AWS/Google Cloud/Azure**: For production deployments

Your backend should be accessible via HTTPS (e.g., `https://your-api.railway.app` or `https://api.yourdomain.com`)

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended for first-time)

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository: `D4RK-M3TA/Smart-Buggeter-App`

2. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variable:
     ```
     VITE_API_URL = https://your-backend-api-url.com/api
     ```
   - Replace `https://your-backend-api-url.com/api` with your actual backend API URL

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   cd frontend
   netlify init
   # Follow the prompts to connect to your site
   
   # Set environment variable
   netlify env:set VITE_API_URL https://your-backend-api-url.com/api
   
   # Deploy
   netlify deploy --prod
   ```

### Step 3: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow Netlify's DNS configuration instructions

### Step 4: Verify Deployment

1. Visit your Netlify site URL
2. Check that the frontend loads correctly
3. Test API connectivity by logging in

## Backend Deployment

### Railway (Recommended)

1. **Create Railway Account**
   - Sign up at https://railway.app
   - Connect your GitHub account

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Railway will auto-detect Django
   - Set the root directory to `backend`
   - Add environment variables:
     ```
     SECRET_KEY=your-secret-key
     DEBUG=False
     PGDATABASE=railway
     PGUSER=railway
     PGPASSWORD=railway
     PGHOST=railway-provided-host
     PGPORT=railway-provided-port
     REDIS_URL=redis-provided-url
     ```

4. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set database environment variables

5. **Add Redis (Optional)**
   - Click "New" → "Database" → "Redis"
   - Set `REDIS_URL` environment variable

6. **Run Migrations**
   - Add a one-time command in Railway:
     ```
     python manage.py migrate
     ```

7. **Deploy**
   - Railway will automatically deploy on every push to main branch

### Render

1. **Create Render Account**
   - Sign up at https://render.com

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && gunicorn budgeter.wsgi:application`
     - **Environment**: Python 3

3. **Add PostgreSQL Database**
   - New → PostgreSQL
   - Copy the database URL to environment variables

4. **Set Environment Variables**
   - Add all required Django environment variables

5. **Deploy**
   - Render will build and deploy automatically

## Environment Variables Reference

### Frontend (Netlify)
- `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com/api`)

### Backend (Railway/Render/etc.)
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to `False` in production
- `PGDATABASE`: PostgreSQL database name
- `PGUSER`: PostgreSQL username
- `PGPASSWORD`: PostgreSQL password
- `PGHOST`: PostgreSQL host
- `PGPORT`: PostgreSQL port
- `REDIS_URL`: Redis connection URL (optional)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of frontend URLs

## Post-Deployment Checklist

- [ ] Backend API is accessible via HTTPS
- [ ] Frontend environment variable `VITE_API_URL` is set correctly
- [ ] CORS is configured on backend to allow frontend domain
- [ ] Database migrations have been run
- [ ] Static files are being served (if not using CDN)
- [ ] SSL certificates are active
- [ ] Test user registration and login
- [ ] Test API endpoints from frontend

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` environment variable
- Verify backend CORS settings allow your Netlify domain
- Check browser console for CORS errors

### Build fails on Netlify
- Check build logs in Netlify dashboard
- Ensure `package.json` has correct build script
- Verify Node version (should be 18+)

### Backend deployment issues
- Check application logs
- Verify all environment variables are set
- Ensure database migrations have run
- Check that `ALLOWED_HOSTS` includes your domain

