# Google OAuth Setup Guide

Your Google OAuth login is implemented and ready to use. Follow these steps to configure it in your Supabase project:

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials" 
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://bzukbciiqwdckzmwarku.supabase.co/auth/v1/callback
     ```
   - Copy the Client ID and Client Secret

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Select your project
3. Navigate to "Authentication" → "Providers"
4. Find "Google" and toggle it ON
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
6. Save the configuration

## Step 3: Configure Site URLs

1. In Supabase, go to "Authentication" → "URL Configuration"
2. Set the following URLs:
   - **Site URL**: `http://localhost:5000` (development)
   - **Redirect URLs**: 
     ```
     http://localhost:5000/auth/callback
     https://your-replit-app.replit.app/auth/callback
     ```

## Step 4: Test Google OAuth

1. Go to your application's login page
2. Click "Continue with Google"
3. Complete the Google authentication flow
4. You should be redirected back to your dashboard

## Common Issues

- **"unauthorized_client" error**: Check that your redirect URIs match exactly in both Google Cloud Console and Supabase
- **"access_denied" error**: User cancelled the authentication or permissions were denied
- **Configuration errors**: Ensure Google+ API is enabled and credentials are correctly copied

The authentication system will now support both email/password and Google OAuth login methods.