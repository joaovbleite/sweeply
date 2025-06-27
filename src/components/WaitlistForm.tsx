import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Loader2 } from "lucide-react";

const WaitlistForm: React.FC = () => {
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
      // Store the email in Supabase - assumes a 'waitlist' table exists
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email, created_at: new Date().toISOString() }]);
      
      if (error) {
        // Check if it's a duplicate email error
        if (error.code === "23505") {
          setStatus("success"); // Treat duplicates as success to avoid revealing if someone is already signed up
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
    <section className="bg-gradient-to-b from-pulse-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="pulse-chip mx-auto mb-4">
            <span>Join Waitlist</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Be the first to know when we launch
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Join our waitlist to get early access to Sweeply and transform how you manage your cleaning business.
          </p>
        </div>

        <div className="max-w-md mx-auto">
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
      </div>
    </section>
  );
};

export default WaitlistForm; 