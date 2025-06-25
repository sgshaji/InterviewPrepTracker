# Local Development Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Environment Variables Setup

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Configuration
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Redis for caching
UPSTASH_REDIS_URL=your-redis-url

# Optional: Email service
BREVO_API_KEY=your-brevo-key

# Development settings
NODE_ENV=development
PORT=5000

# Session secret (generate a random string)
SESSION_SECRET=your-session-secret-here
```

### Getting Supabase Credentials:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing one
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. Go to Settings → Database → Connection string → Transaction pooler
6. Copy the connection string and replace `[YOUR-PASSWORD]` with your actual password

## Step 3: Database Setup

Run the database migrations:
```bash
npm run db:push
```

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the PORT in your `.env` file:
```env
PORT=3000
```

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Make sure your Supabase project is active
- Check if your IP is allowed in Supabase dashboard

### Missing Dependencies
If you encounter module not found errors:
```bash
npm install
```

### TypeScript Errors
Run type checking:
```bash
npm run check
```

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run test` - Run tests

## Project Structure

- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared types and utilities
- `migrations/` - Database migration files
- `attached_assets/` - Static assets

## Notes

- The application uses Supabase for authentication and database
- Redis is optional but recommended for caching
- Email service (Brevo) is optional for notifications
- The development server runs both frontend and backend concurrently 