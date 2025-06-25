# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
npm run setup
```
This creates a `.env` file template. Edit it with your Supabase credentials.

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 🔧 Required Setup

### Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your credentials from Settings → API
4. Update your `.env` file with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (from Database → Connection string)

### Database Setup
```bash
npm run db:push
```

## 📁 Project Structure
- `client/` - React frontend
- `server/` - Express backend
- `shared/` - Shared types
- `migrations/` - Database migrations

## 🛠️ Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript checking
- `npm run db:push` - Push database schema
- `npm run setup` - Create environment template

## 🐛 Troubleshooting

### Port Already in Use
Change `PORT=3000` in your `.env` file

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure your IP is allowed in Supabase

### TypeScript Errors
The project has some TypeScript errors that don't prevent running:
```bash
npm run check
```

## 📚 More Information
- See `LOCAL_SETUP.md` for detailed instructions
- See `DEPLOYMENT_GUIDE.md` for production deployment 