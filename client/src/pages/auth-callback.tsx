import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        
        // First, check URL for error parameters from OAuth provider
        const urlSearchParams = new URLSearchParams(window.location.search);
        const errorDescription = urlSearchParams.get('error_description');
        const errorCode = urlSearchParams.get('error_code');
        const error = urlSearchParams.get('error');
        
        if (error || errorDescription || errorCode) {
          console.error('OAuth error in URL:', { error, errorDescription, errorCode });
          setStatus('error');
          
          // Provide specific error messages for common OAuth issues
          if (error === 'access_denied') {
            setMessage('Google authentication was cancelled. Please try again.');
          } else if (errorDescription?.includes('unauthorized_client')) {
            setMessage('Google OAuth is not properly configured. Please contact support.');
          } else {
            setMessage(errorDescription || 'Authentication failed');
          }
          
          setTimeout(() => navigate('/auth'), 4000);
          return;
        }

        // Process OAuth callback directly
        console.log('Processing OAuth callback from URL...');
        
        // Parse URL fragments and search params for auth tokens
        const hashFragment = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hashFragment);
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('Hash fragment:', hashFragment);
        console.log('Search params:', window.location.search);
        
        // Check for OAuth tokens in URL
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const authCode = urlParams.get('code');
        
        if (accessToken || authCode) {
          console.log('OAuth tokens found:', { accessToken: !!accessToken, authCode: !!authCode });
          
          if (accessToken && refreshToken) {
            // Manually set the session using the tokens from URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            console.log('Manual session creation result:', data, error);
            
            if (error) {
              console.error('Failed to create session from tokens:', error);
              setStatus('error');
              setMessage(`Authentication failed: ${error.message}`);
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
            
            if (data.session) {
              console.log('Session created successfully from OAuth tokens');
              setStatus('success');
              setMessage('Google authentication successful! Redirecting...');
              
              // Clear the URL hash to prevent re-processing
              window.history.replaceState({}, document.title, window.location.pathname);
              
              setTimeout(() => navigate('/dashboard'), 1500);
              return;
            }
          }
          
          // If we have an auth code, let Supabase handle the exchange
          if (authCode) {
            console.log('Processing authorization code...');
            // Wait for Supabase to process the code
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const { data, error } = await supabase.auth.getSession();
            console.log('Session after code processing:', data, error);
            
            if (data.session) {
              console.log('Session created from authorization code');
              setStatus('success');
              setMessage('Authentication successful! Redirecting...');
              setTimeout(() => navigate('/dashboard'), 1500);
              return;
            }
          }
        }
        
        // Final check for any existing session
        console.log('Checking for existing session...');
        const { data: finalSession } = await supabase.auth.getSession();
        
        if (finalSession.session) {
          console.log('Found existing session');
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          console.log('No session found, authentication failed');
          setStatus('error');
          setMessage('Google authentication completed but session could not be created. Please try again.');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (error: any) {
        console.error('Unexpected auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Authentication</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-red-600" />
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to sign in...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}