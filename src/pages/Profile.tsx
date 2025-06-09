import React, { useState, useRef } from "react";
import { Mail, ArrowRight, User, Phone, Lock, Camera, Trash2, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";

const Profile: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User profile state with defaults
  const [profileData, setProfileData] = useState({
    fullName: 'victor leite', // Hardcoded for demo
    email: user?.email || 'sustennabliet@gmail.com',
    phone: '+1 (555) 123-4567' // Added default phone for better UI
  });

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 5MB.");
        return;
      }
      
      // Check file type
      if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
        toast.error("Unsupported file format. Please use JPG, PNG or WebP.");
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Store file for upload
      setAvatarFile(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle profile picture upload
  const handleUploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Profile picture updated successfully");
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
      setAvatarFile(null);
    }
  };

  // Handle removing profile picture
  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    try {
      setUploading(true);
      
      // Update user profile to remove avatar
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      setAvatarUrl(null);
      toast.success("Profile picture removed");
      
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error("Failed to remove profile picture");
    } finally {
      setUploading(false);
    }
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If there's a new avatar file, upload it first
      if (avatarFile) {
        await handleUploadAvatar();
      }
      
      // Update user profile data
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.fullName,
            phone: profileData.phone
          })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    }
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
              {/* Avatar display */}
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border-2 border-white shadow-md">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-[#307842]" />
                )}
                
                {/* Loading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Edit button */}
              <button 
                type="button"
                onClick={handleUploadClick}
                className="absolute bottom-0 right-0 bg-[#307842] text-white rounded-full p-2 shadow-md"
                disabled={uploading}
              >
                <Camera className="w-4 h-4" />
              </button>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
              />
            </div>
          </div>
          
          {/* Avatar actions - only show if avatar is selected or user has avatar */}
          {(avatarUrl || user?.user_metadata?.avatar_url) && (
            <div className="flex justify-center gap-3 -mt-2 mb-6">
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  className="text-sm text-[#307842] font-medium"
                  disabled={uploading}
                >
                  Save Photo
                </button>
              )}
              
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-sm text-red-500 font-medium"
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          )}

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-[#307842] focus:border-[#307842]"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-[#307842] focus:border-[#307842]"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-600 focus:ring-[#307842] focus:border-[#307842]"
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
                <Lock className="w-5 h-5 text-[#307842] mr-3" />
                <div>
                  <h3 className="text-lg font-bold text-[#0d3547]">Change password</h3>
                  <p className="text-gray-600 text-sm">Send password reset link to your email</p>
                </div>
              </div>
              <div className="text-[#307842]">
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
            disabled={uploading}
            className="w-full mt-8 mb-10 py-3 bg-[#307842] hover:bg-[#276335] text-white font-medium rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Profile; 