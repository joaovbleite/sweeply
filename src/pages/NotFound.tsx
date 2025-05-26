import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-pulse-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-white rounded-full p-8 shadow-xl">
              <AlertCircle className="w-16 h-16 text-pulse-500" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Path Info */}
        <div className="bg-gray-100 rounded-lg px-4 py-2 mb-8 max-w-sm mx-auto">
          <p className="text-sm text-gray-500">Requested path:</p>
          <p className="text-sm font-mono text-gray-700 truncate">{location.pathname}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex-1 px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Link>
              <button
                onClick={handleGoBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex-1 px-6 py-3 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Link>
              <Link
                to="/login"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{" "}
          <a href="mailto:support@sweeply.com" className="text-pulse-500 hover:text-pulse-600">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
