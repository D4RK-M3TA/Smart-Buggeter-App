# Render Configuration Values - Quick Reference

## ✅ Step 1: Configure Web Service Settings

Fill in these values on the Render configuration screen:

| Field | Value |
|-------|-------|
| **Language** | `Docker` (already selected) |
| **Branch** | `main` (already selected) |
| **Region** | `Virginia (US East)` (or your preferred region) |
| **Root Directory** | `backend` |
| **Dockerfile Path** | `Dockerfile` (without `./` - just `Dockerfile`) |

---

## ✅ Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **"New"** → **"PostgreSQL"**
2. Choose a name (e.g., `smart-budgeter-db`)
3. Select a plan (Free tier available)
4. Click **"Create Database"**
5. Wait for it to provision (takes 1-2 minutes)

Once created, you'll see connection details. Copy these values:

---

## ✅ Step 3: Environment Variables

Add these environment variables in your Render Web Service:

### Required Variables:

```
SESSION_SECRET=*tnyr8nwvo)rp1@84y!ny1%5*#k*da=2#0l#f+8-(#88393z49
DEBUG=False
```

### Database Variables (from PostgreSQL you just created):

After creating the PostgreSQL database, Render will show you these values. Copy them exactly:

```
PGDATABASE=<copy-from-render-postgres-details>
PGUSER=<copy-from-render-postgres-details>
PGPASSWORD=<copy-from-render-postgres-details>
PGHOST=<copy-from-render-postgres-details>
PGPORT=<copy-from-render-postgres-details>
```

**Where to find these:**
- In your PostgreSQL service page, look for "Connections" or "Internal Database URL"
- Render usually provides them in a format like:
  - `PGDATABASE`: The database name
  - `PGUSER`: Usually something like `smart_budgeter_user`
  - `PGPASSWORD`: A long random string
  - `PGHOST`: Something like `dpg-xxxxx-a.oregon-postgres.render.com`
  - `PGPORT`: Usually `5432`

---

## 📋 Quick Checklist

- [ ] Set Root Directory: `backend`
- [ ] Set Dockerfile Path: `Dockerfile` (without `./`)
- [ ] Create PostgreSQL database in Render
- [ ] Copy all 5 database environment variables (PGDATABASE, PGUSER, PGPASSWORD, PGHOST, PGPORT)
- [ ] Add `SESSION_SECRET` = `*tnyr8nwvo)rp1@84y!ny1%5*#k*da=2#0l#f+8-(#88393z49`
- [ ] Add `DEBUG` = `False`
- [ ] Deploy!

---

## 🔍 How to Add Environment Variables in Render

1. In your Web Service page, scroll down to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Enter the **Key** (e.g., `SESSION_SECRET`)
4. Enter the **Value** (e.g., `*tnyr8nwvo)rp1@84y!ny1%5*#k*da=2#0l#f+8-(#88393z49`)
5. Click **"Save Changes"**
6. Repeat for each variable

---

## ⚠️ Important Notes

- The `SESSION_SECRET` value above is your generated secret key - keep it secure!
- **Dockerfile Path Fix**: If you get an error about `requirements.txt` not found, try setting Dockerfile Path to `Dockerfile` (without `./`) instead of `./Dockerfile`
- After deployment, you may need to run migrations manually (Render will show instructions)
- Your frontend needs to be deployed separately with `VITE_API_URL` pointing to your Render backend URL

## 🔧 Troubleshooting: "requirements.txt not found" Error

If you see the error `"/requirements.txt": not found`:

**Solution**: A root-level Dockerfile has been created. Use these settings:
- **Root Directory**: (leave empty)
- **Dockerfile Path**: `Dockerfile`

This Dockerfile properly handles the monorepo structure by copying from `backend/` directory.

---

## 🚀 After Deployment

Once deployed, your backend URL will be something like:
`https://smart-budgeter-xxxx.onrender.com`

Use this URL in your frontend's `VITE_API_URL` environment variable (with `/api` appended):
`https://smart-budgeter-xxxx.onrender.com/api`


