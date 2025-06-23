# Interview Prep Tracker - Deployment Guide

## Overview
This guide walks you through deploying your Interview Prep Tracker application outside of Replit to various hosting platforms.

## Prerequisites

### Required Software
- Node.js 18+ 
- npm or yarn package manager
- Git
- PostgreSQL database (cloud or local)

### Required Accounts & Services
- **Database**: Supabase (recommended) or PostgreSQL provider
- **Hosting**: Vercel, Netlify, Railway, or VPS
- **Optional**: Redis provider (Upstash) for caching

## Environment Setup

### 1. Database Setup (Supabase Recommended)

**Option A: Supabase (Easiest)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your database URL from Settings → Database
4. Copy the "Connection string" → "Transaction pooler" URL
5. Replace `[YOUR-PASSWORD]` with your actual password

**Option B: Other PostgreSQL Provider**
- Neon, PlanetScale, or any PostgreSQL provider
- Get connection string in format: `postgresql://user:password@host:port/database`

### 2. Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase (if using Supabase)
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Redis for caching
UPSTASH_REDIS_URL=your-redis-url

# Optional: Email service
BREVO_API_KEY=your-brevo-key

# Production settings
NODE_ENV=production
PORT=3000
```

### 3. Database Migration

Run database setup:

```bash
# Install dependencies
npm install

# Push schema to database
npm run db:push

# Verify tables are created
npm run db:studio
```

## Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)

1. **Prepare for Vercel:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "client/dist/$1"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   # Follow prompts, add environment variables in Vercel dashboard
   ```

### Option 2: Railway (Full-Stack with Database)

1. **Connect GitHub repo to Railway**
2. **Add environment variables in Railway dashboard**
3. **Deploy automatically on push**

### Option 3: Netlify + Separate API

1. **Frontend (Netlify):**
   ```bash
   # Build frontend
   cd client
   npm run build
   
   # Deploy to Netlify
   npx netlify deploy --prod --dir=dist
   ```

2. **Backend (Railway/Heroku):**
   - Deploy backend separately
   - Update frontend API URLs

### Option 4: VPS/DigitalOcean

1. **Server Setup:**
   ```bash
   # Install Node.js, PostgreSQL, nginx
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql nginx
   ```

2. **Application Setup:**
   ```bash
   # Clone repo
   git clone your-repo-url
   cd interview-prep-tracker
   
   # Install dependencies
   npm install
   
   # Build frontend
   npm run build
   
   # Start with PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

3. **Create `ecosystem.config.js`:**
   ```javascript
   module.exports = {
     apps: [{
       name: 'interview-prep-tracker',
       script: 'server/index.js',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

## Build Configuration

### 1. Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "tsc -p server/tsconfig.json",
    "start": "node server/dist/index.js",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch server/index.ts",
    "dev:client": "cd client && npm run dev"
  }
}
```

### 2. Update server configuration for production:

```typescript
// server/index.ts
const app = express();

// Production settings
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Domain & SSL Setup

### Custom Domain
1. **Purchase domain** from Namecheap, GoDaddy, etc.
2. **Configure DNS** to point to your hosting provider
3. **SSL Certificate** - Most providers offer free SSL

### Example DNS Setup (Vercel):
```
A Record: @ → 76.76.19.61
CNAME: www → your-app.vercel.app
```

## Monitoring & Maintenance

### 1. Error Tracking
- Add Sentry for error tracking
- Set up log aggregation

### 2. Database Backups
- Enable automatic backups on Supabase/provider
- Set up monitoring alerts

### 3. Performance Monitoring
- Use Vercel Analytics or similar
- Monitor API response times

## Security Checklist

- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] HTTPS enabled
- [ ] API rate limiting configured
- [ ] Input validation implemented
- [ ] User authentication secured

## Cost Estimates

### Free Tier Options:
- **Vercel**: Free for personal projects
- **Netlify**: Free tier available
- **Supabase**: Free tier with 500MB database
- **Railway**: $5/month after free trial

### Paid Options:
- **Vercel Pro**: $20/month
- **Railway**: $5-20/month
- **DigitalOcean**: $4-10/month VPS

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify DATABASE_URL format
   - Check firewall settings
   - Ensure database is accessible

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review build logs

3. **Environment Variables Missing**
   - Double-check variable names
   - Ensure variables set in hosting platform
   - Restart application after changes

### Support Resources:
- Supabase Documentation
- Vercel Documentation
- Railway Documentation
- Stack Overflow for specific issues

## Next Steps After Deployment

1. **Set up monitoring** for uptime and performance
2. **Configure backups** for database and files
3. **Set up CI/CD** for automated deployments
4. **Add custom domain** and SSL certificate
5. **Monitor costs** and optimize as needed

Your Interview Prep Tracker is now ready for production deployment outside of Replit!