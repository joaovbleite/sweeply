import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAttempt = async (action: 'login' | 'signup') => {
    setIsLoading(true);
    console.log(`Demo ${action} Attempt:`);
    console.log('Email:', email);
    console.log('Password:', password);
    
    if (!email || !password) {
      toast.error("Validation Error", {
        description: "Please enter both email and password.",
      });
      setIsLoading(false);
      return;
    }
    if (action === 'signup' && password.length < 6) {
      toast.error("Validation Error", {
        description: "Password must be at least 6 characters long for signup.",
      });
      setIsLoading(false);
      return;
    }

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1500));

    // This is where you would integrate with your authentication system
    // For now, we'll just redirect to the app
    window.location.href = 'https://app.sweeply.com/login';

    toast.success("Demo Access Granted!", {
      description: `You've successfully '${action === 'login' ? 'logged in' : 'signed up'}' with demo credentials.`,
    });
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-12 animate-fade-in transition-all duration-300 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage: `
          radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(221 71% 53% / 0.15), transparent 70%),
          linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)
        `,
      }}
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-sweeply/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with logo and tagline - Adjusted for mobile */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in delay-200">
          <Link to="/" className="inline-block mb-3 sm:mb-4 group">
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-sweeply group-hover:text-sweeply-dark transition-colors" />
              <span className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">Sweeply</span>
            </div>
          </Link>
          <p className="text-white/80 text-base sm:text-lg font-medium">Transform your cleaning business</p>
        </div>

        <Card 
          className="shadow-2xl animate-scale-in 
                     bg-white/95
                     backdrop-blur-xl 
                     border-0 shadow-xl
                     hover:shadow-3xl transition-all duration-500"
        >
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sweeply to-sweeply-dark bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sweeply transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 text-base py-4 border-2 border-gray-200 focus:border-sweeply focus:ring-2 focus:ring-sweeply/20 rounded-xl transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <Link to="#" className="text-sm text-sweeply hover:text-sweeply-dark hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-sweeply transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 text-base py-4 border-2 border-gray-200 focus:border-sweeply focus:ring-2 focus:ring-sweeply/20 rounded-xl transition-all duration-300 hover:border-gray-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  onClick={() => handleAuthAttempt('login')} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sweeply to-sweeply-dark hover:from-sweeply-dark hover:to-sweeply text-white text-base py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
                
                <Button 
                  onClick={() => handleAuthAttempt('signup')} 
                  disabled={isLoading}
                  variant="outline" 
                  className="w-full text-base py-4 rounded-xl font-semibold border-2 border-sweeply text-sweeply hover:bg-sweeply hover:text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center text-center pt-8 pb-8 px-8 space-y-6">
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Trusted by 1000+</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              This is a demonstration environment. For full platform access and features, please contact our sales team.
            </p>
            
            <Button variant="link" asChild className="text-sweeply hover:text-sweeply-dark font-medium">
              <Link to="/" className="flex items-center space-x-1">
                <span>← Back to Home</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
