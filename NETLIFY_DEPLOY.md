# Quick Netlify Deployment Guide

## 🚀 Deploy Frontend to Netlify (5 minutes)

### Step 1: Connect to Netlify

1. Go to https://app.netlify.com and sign in (or create an account)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"** and authorize Netlify
4. Select your repository: **`D4RK-M3TA/Smart-Buggeter-App`**

### Step 2: Configure Build Settings

In the build settings, set:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### Step 3: Set Environment Variable

Before deploying, add this environment variable:

1. Click **"Show advanced"** → **"New variable"**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com/api` (replace with your actual backend URL)

> **Note**: You'll need to deploy your backend first (see Backend Deployment below)

### Step 4: Deploy

Click **"Deploy site"** and wait for the build to complete!

Your site will be live at: `https://random-name-123.netlify.app`

---

## 🔧 Backend Deployment (Required)

Your frontend needs a backend API. Here are quick options:

### Option 1: Railway (Easiest)

1. Sign up at https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway auto-detects Django
5. Add **PostgreSQL** database (New → Database → PostgreSQL)
6. Set environment variables:
   ```
   SECRET_KEY=your-random-secret-key-here
   DEBUG=False
   ```
7. Railway auto-sets database variables
8. Add build command: `cd backend && pip install -r requirements.txt`
9. Add start command: `cd backend && python manage.py migrate && gunicorn budgeter.wsgi:application`
10. Copy the Railway URL (e.g., `https://your-app.railway.app`)
11. Use this URL in Netlify's `VITE_API_URL` environment variable

### Option 2: Render

1. Sign up at https://render.com
2. **New** → **Web Service**
3. Connect GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn budgeter.wsgi:application`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy and copy the URL

---

## ✅ After Deployment

1. Update `VITE_API_URL` in Netlify with your backend URL
2. Redeploy Netlify site (or it will auto-deploy)
3. Test login/registration
4. (Optional) Add custom domain in Netlify settings

---

## 🐛 Troubleshooting

**Frontend shows errors?**
- Check `VITE_API_URL` is set correctly
- Verify backend is running and accessible
- Check browser console for errors

**CORS errors?**
- Backend needs to allow your Netlify domain
- Update `CORS_ALLOWED_ORIGINS` in Django settings

**Build fails?**
- Check Netlify build logs
- Ensure Node.js version is 18+
- Verify `package.json` has correct scripts

---

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

