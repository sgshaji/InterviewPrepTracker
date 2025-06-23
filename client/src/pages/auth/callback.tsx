import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";
import { Loader2, Briefcase } from "lucide-react";

export default function AuthCallbackPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔁 Auth callback page - Auth state:', { 
      user: user?.email, 
      isLoading 
    });

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // If we have a user, redirect to home
    if (!isLoading && user) {
      console.log('✅ User authenticated, redirecting to home');
      navigate("/", { replace: true });
      return;
    }

    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      console.log('🚫 No user found, redirecting to login');
      navigate("/auth", { replace: true });
      return;
    }

    // Set a timeout to redirect to login if auth doesn't complete
    const id = setTimeout(() => {
      console.log('⏰ Auth timeout, redirecting to login');
      navigate("/auth", { replace: true });
    }, 5000);

    setTimeoutId(id);

    return () => {
      if (id) clearTimeout(id);
    };
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing your login...
        </h2>
        <p className="text-gray-600">
          Please wait while we process your authentication.
        </p>
      </div>
    </div>
  );
}
