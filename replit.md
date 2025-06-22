# Interview Prep Tracker

## Overview

The Interview Prep Tracker is a comprehensive full-stack web application designed to help job seekers manage their interview preparation and application tracking process. Built with modern technologies, it provides a centralized dashboard for managing job applications, interview schedules, preparation sessions, and performance assessments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router DOM for client-side navigation
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Supabase Auth for user management
- **Session Management**: Express sessions with PostgreSQL store
- **Email Service**: Brevo API for transactional emails
- **Caching**: Upstash Redis for performance optimization

### Data Storage Solutions
- **Primary Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: Supabase Auth (manages auth.users table)
- **Cache Layer**: Upstash Redis for frequently accessed data
- **File Storage**: Not currently implemented (prepared for future expansion)

## Key Components

### Application Management
- **Job Applications Tracking**: Complete CRUD operations for job applications
- **Status Management**: Track application stages from submission to final outcome
- **Company Information**: Store company details with logo fetching capabilities
- **Resume Version Tracking**: Monitor which resume version was used for each application

### Interview Management
- **Interview Scheduling**: Track upcoming interviews with dates and stages
- **Interview Types**: Support for various interview stages (HR, Technical, System Design, etc.)
- **Status Tracking**: Monitor interview completion and outcomes

### Preparation System
- **Topic-based Preparation**: Organize preparation sessions by topics
- **Progress Tracking**: Monitor preparation consistency and coverage
- **Assessment Integration**: Link preparation sessions to interview performance

### User Authentication
- **Supabase Integration**: Leverages Supabase's built-in authentication system
- **Row-Level Security**: Database-level security policies for user data isolation
- **Session Management**: Persistent sessions with secure token handling

## Data Flow

1. **User Authentication**: Users authenticate through Supabase Auth UI
2. **Data Fetching**: Frontend makes authenticated API calls to Express backend
3. **Database Operations**: Backend uses Drizzle ORM to interact with PostgreSQL
4. **Caching Layer**: Frequently accessed data is cached in Redis
5. **Real-time Updates**: UI updates optimistically with React Query mutations
6. **Email Notifications**: Scheduled reminders sent via Brevo API

## External Dependencies

### Core Services
- **Supabase**: Authentication and PostgreSQL database hosting
- **Upstash Redis**: Caching and session storage
- **Brevo**: Email service for notifications and reminders
- **Clearbit**: Company logo fetching (with fallback handling)

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Jest**: Testing framework for backend unit tests
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code quality and formatting

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Chart.js**: Data visualization for dashboard metrics
- **React Virtual**: Performance optimization for large lists

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Connected to Supabase PostgreSQL instance
- **Environment Variables**: Managed through .env files
- **Process Management**: npm scripts for development workflow

### Production Deployment
- **Platform**: Configured for Replit deployment
- **Build Process**: Vite builds frontend assets, esbuild bundles backend
- **Static Assets**: Served through Express static middleware
- **Environment Configuration**: Production environment variables
- **Monitoring**: Basic error logging and performance tracking

### Database Management
- **Migrations**: Drizzle migrations for schema changes
- **Seeding**: Scripts for generating test data and initial setup
- **Backup**: Database backup utilities for data protection
- **Performance**: Database indexing for query optimization

## Recent Changes
- June 22, 2025: Successfully migrated from Replit Agent to standard Replit environment
- June 22, 2025: Fixed database connectivity and authentication setup
- June 22, 2025: Google OAuth requires additional configuration in Supabase dashboard

## Google OAuth Setup Instructions

The application is fully functional with email/password authentication. To enable Google sign-in:

1. **Go to your Supabase Dashboard** (supabase.com → Your Project)
2. **Navigate to Authentication → Providers**
3. **Enable Google Provider:**
   - Toggle Google provider to ON
   - You'll need Google OAuth credentials from Google Cloud Console
4. **Set up Google OAuth in Google Cloud:**
   - Go to console.cloud.google.com
   - Create or select a project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://bzukbciiqwdckzmwarku.supabase.co/auth/v1/callback`
5. **Add the credentials to Supabase:**
   - Copy Client ID and Client Secret from Google Cloud
   - Paste them in Supabase Authentication → Providers → Google
6. **Configure Site URL in Supabase:**
   - Go to Authentication → URL Configuration
   - Add Site URL: `http://localhost:5000` (development)
   - Add Redirect URLs: 
     - `http://localhost:5000/auth/callback`
     - `https://your-replit-app.replit.app/auth/callback` (production)

## Changelog
- June 22, 2025: Initial setup and migration completed

## User Preferences

Preferred communication style: Simple, everyday language.