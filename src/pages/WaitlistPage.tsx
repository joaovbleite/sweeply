import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const WaitlistPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    
    try {
      // Store the email in Supabase
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email, created_at: new Date().toISOString() }]);
      
      if (error) {
        // Check if it's a duplicate email error
        if (error.code === "23505") {
          setStatus("success"); // Treat duplicates as success
        } else {
          console.error("Error submitting to waitlist:", error);
          setStatus("error");
          setErrorMessage("Something went wrong. Please try again later.");
        }
      } else {
        setStatus("success");
        setEmail(""); // Clear the form
      }
    } catch (err) {
      console.error("Error submitting to waitlist:", err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background with gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-pulse-50 via-white to-blue-50 z-0"
        style={{
          backgroundImage: "url('/background-section1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay"
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 py-12">
        <div className="max-w-md w-full mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <img src="/logo.svg" alt="Sweeply" className="h-16 mx-auto" />
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-gray-900">
            Coming Soon
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-gray-700 mb-8">
            Sweeply is revolutionizing how cleaning businesses operate. 
            Join our waitlist to be the first to know when we launch.
          </p>
          
          {/* Waitlist Form */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    status === "error" ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-pulse-500"
                  } focus:outline-none focus:ring-2 focus:border-transparent`}
                  disabled={status === "loading" || status === "success"}
                />
                
                {status === "success" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="bg-green-100 text-green-600 p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
              
              {status === "error" && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  status === "success"
                    ? "bg-green-500 text-white"
                    : "bg-pulse-600 hover:bg-pulse-700 text-white"
                }`}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Submitting...
                  </span>
                ) : status === "success" ? (
                  "You're on the list!"
                ) : (
                  "Join the Waitlist"
                )}
              </button>
            </form>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              We respect your privacy and will never share your information.
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white bg-opacity-80 p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-pulse-700">Client Management</h3>
              <p className="text-gray-600">Easily manage all your cleaning clients in one place</p>
            </div>
            <div className="bg-white bg-opacity-80 p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-pulse-700">Smart Scheduling</h3>
              <p className="text-gray-600">Optimize your team's time with intelligent scheduling</p>
            </div>
            <div className="bg-white bg-opacity-80 p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-pulse-700">Seamless Invoicing</h3>
              <p className="text-gray-600">Create and send professional invoices in seconds</p>
            </div>
          </div>
          
          {/* Learn More Link */}
          <Link 
            to="/about" 
            className="inline-flex items-center text-pulse-600 hover:text-pulse-700 font-medium"
          >
            Learn more about Sweeply
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 bg-white bg-opacity-80 py-6 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Sweeply. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-pulse-600">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-pulse-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WaitlistPage; 