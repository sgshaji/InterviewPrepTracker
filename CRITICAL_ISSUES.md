# Critical Authentication Issues Found

## 1. Schema Mismatch Between migrations/ and shared/
- **Issue**: Two different schema files with conflicting table definitions
- **Impact**: Database operations fail due to schema inconsistencies
- **Files**: `migrations/schema.ts` vs `shared/schema.ts`

## 2. Missing Users Table in Shared Schema
- **Issue**: `shared/schema.ts` references `auth.users` but it's not properly defined
- **Impact**: User operations and foreign key relationships fail
- **Files**: `shared/schema.ts` line 7-11

## 3. Supabase Auth Configuration Issues
- **Issue**: Missing service role key configuration in supabase-auth.ts
- **Impact**: Server-side authentication fails
- **Files**: `server/supabase-auth.ts` line 66

## 4. Inconsistent User ID Types
- **Issue**: Some tables use serial IDs, others use UUIDs
- **Impact**: Foreign key relationships break
- **Files**: Multiple schema files

## 5. Missing Database Initialization
- **Issue**: No proper user table creation or sync with Supabase auth
- **Impact**: Users can't be created or linked to application data

## 6. Import Path Conflicts
- **Issue**: Server imports from both @shared/schema and ../migrations/schema
- **Impact**: Type mismatches and runtime errors
- **Files**: `server/routes.ts`, `server/db.ts`

## 7. Authentication Flow Inconsistencies
- **Issue**: Client uses Supabase auth but server expects different user structure
- **Impact**: Authentication succeeds but user data isn't accessible

## 8. Missing User Profile Creation
- **Issue**: No mechanism to create user profiles after Supabase signup
- **Impact**: Users exist in auth but not in application database