import React, { useState } from "react";
import { Mail, ArrowRight, User, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";

const Profile: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // User profile state with defaults
  const [profileData, setProfileData] = useState({
    fullName: 'victor leite', // Hardcoded for demo
    email: user?.email || 'sustennabliet@gmail.com',
    phone: '+1 (555) 123-4567' // Added default phone for better UI
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
      <div className="min-h-screen bg-white flex flex-col">
        {/* Use the PageHeader component */}
        <PageHeader
          title="Profile"
          onBackClick={() => navigate(-1)}
        />

        <form onSubmit={handleSubmit} className="px-4 pb-36 flex-1">
          {/* Profile Avatar */}
          <div className="flex justify-center my-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-500" />
              </div>
              <button 
                type="button"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* User Information */}
          <div className="mt-4 space-y-4">
            <div className="relative">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-500 mb-1">Full name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-500 mb-1">Mobile phone number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="Mobile phone number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Password Reset */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <button 
              type="button"
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-between py-3 px-0 text-left"
            >
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-[#0d3547]">Change password</h3>
                  <p className="text-gray-600 text-sm">Send password reset link to your email</p>
                </div>
              </div>
              <div className="text-blue-500">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>
          
          {/* Account Closure */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button 
              type="button"
              onClick={handleCloseAccount}
              className="w-full flex items-center justify-between py-3 px-0 text-left text-red-500"
            >
              <div>
                <h3 className="text-lg font-bold">Close account</h3>
                <p className="text-red-400 text-sm mt-1">Closing your account is permanent</p>
              </div>
              <div>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>
          
          {/* Save Button */}
          <button
            type="submit"
            className="w-full mt-8 mb-10 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            Save Profile
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Profile; 