import React, { useState } from "react";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const Profile: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // User profile state with defaults
  const [profileData, setProfileData] = useState({
    fullName: 'victor leite', // Hardcoded for demo
    email: user?.email || 'sustennabliet@gmail.com',
    phone: '' // Default empty
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle sending password reset email
  const handlePasswordReset = () => {
    // This would typically call auth.sendPasswordResetEmail(profileData.email)
    toast.success("Password reset link sent to your email");
  };

  // Handle account closure request
  const handleCloseAccount = () => {
    if (window.confirm("Are you sure you want to close your account? This action cannot be undone.")) {
      // This would typically call a function to close the account
      toast.success("Account closure request submitted");
      // Navigate to login after a delay
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically update the user profile in your auth system
    toast.success("Profile updated successfully");
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        {/* Fixed header with shadow to cover content when scrolling */}
        <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
          <div className="flex items-center px-4 pt-12 pb-3 border-b border-gray-200">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-2 text-gray-600"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a2e35]">
              Profile
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 pb-36">
          {/* User Information */}
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-500 mb-1">Full name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-500 mb-1">Mobile phone number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="Mobile phone number"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
          </div>
          
          {/* Password Reset */}
          <div className="mt-8">
            <button 
              type="button"
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-between py-4 px-0 text-left"
            >
              <div>
                <h3 className="text-xl font-bold text-[#0d3547]">Change password</h3>
                <p className="text-gray-600 mt-1">Send password reset link to your email</p>
              </div>
              <div className="text-pulse-500">
                <Mail className="w-6 h-6" />
              </div>
            </button>
          </div>
          
          {/* Account Closure */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button 
              type="button"
              onClick={handleCloseAccount}
              className="w-full flex items-center justify-between py-4 px-0 text-left"
            >
              <div>
                <h3 className="text-xl font-bold text-[#0d3547]">Close account</h3>
                <p className="text-gray-600 mt-1">Closing your account is permanent. You will not be able to access it in the future</p>
              </div>
              <div className="text-pulse-500">
                <ArrowRight className="w-6 h-6" />
              </div>
            </button>
          </div>
          
          {/* Save Button */}
          <button
            type="submit"
            className="w-full mt-8 mb-10 py-4 bg-pulse-500 hover:bg-pulse-600 text-white text-lg font-medium rounded-lg transition-colors shadow-md"
          >
            Save Profile
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Profile; 