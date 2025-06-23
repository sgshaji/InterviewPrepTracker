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
        const urlParams = new URLSearchParams(window.location.search);
        const errorDescription = urlParams.get('error_description');
        const errorCode = urlParams.get('error_code');
        const error = urlParams.get('error');
        
        if (error || errorDescription || errorCode) {
          console.error('❌ OAuth error in URL:', { error, errorDescription, errorCode });
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

        // Process the OAuth callback using Supabase's built-in session handler
        const { data, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session check:', data, sessionError);

        // If no session yet, wait briefly for Supabase to process the callback
        if (!data.session) {
          console.log('No immediate session, waiting for Supabase to process callback...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          console.log('Retry session check:', retryData, retryError);
          
          if (retryData.session) {
            console.log('Session found after retry, authentication successful');
            setStatus('success');
            setMessage('Authentication successful! Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard'), 1500);
            return;
          }
        } else {
          console.log('Session found immediately, authentication successful');
          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // If we get here, authentication didn't complete successfully
        console.log('No session found, redirecting to auth page');
        setStatus('error');
        setMessage('Google authentication completed but session was not created. Please try again.');
        setTimeout(() => navigate('/auth'), 3000);
      } catch (error: any) {
        console.error('💥 Unexpected auth callback error:', error);
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