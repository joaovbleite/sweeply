import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";

const Refer: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get user's name for generating referral code - first 3 letters + 25
  const userName = user?.email?.split('@')[0] || "victor";
  const firstName = userName.split('.')[0] || userName; // Get first name part before any dot
  const referralCode = `${firstName.substring(0, 3).toUpperCase()}25`;
  
  const [redeemCode, setRedeemCode] = useState("");

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  // Handle share code
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Sweeply',
        text: `Use my referral code ${referralCode} and we'll both get rewards!`,
        url: 'https://sweeply.com/refer',
      }).catch(error => {
        console.log('Error sharing:', error);
        handleCopy();
      });
    } else {
      handleCopy();
    }
  };

  // Handle redeem code
  const handleRedeem = () => {
    if (!redeemCode) {
      toast.error("Please enter a referral code");
      return;
    }
    
    // Here you'd normally call an API to redeem the code
    toast.success("Referral code redeemed successfully!");
    setRedeemCode("");
  };

  return (
    <AppLayout>
      <div className="bg-white flex flex-col min-h-screen">
        {/* Use the PageHeader component */}
        <PageHeader
          title="Refer a friend"
          onBackClick={() => navigate(-1)}
        />

        <div className="flex-1 overflow-y-auto pb-20">
          {/* Hero Section with dark blue background */}
          <div className="bg-[#0a2434] text-white px-4 py-6">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              When your community is strong, you're strong
            </h2>
            
            {/* Gift Card Image */}
            <div className="relative w-full bg-[#f5f5f0] rounded-lg p-5 mb-3 overflow-hidden">
              <img 
                src="https://i.postimg.cc/SRTXyMKm/image.png" 
                alt="$100 Gift Card" 
                className="w-full h-auto rounded"
              />
            </div>
          </div>
          
          {/* Share Code Section */}
          <div className="px-4 pt-5">
            <h3 className="text-2xl font-bold text-[#0d3547] mb-2">Share your code</h3>
            <p className="text-gray-700 text-base mb-3">
              Refer friends to Sweeply with your unique code! If they become a customer, you'll get a <span className="font-bold">$100 prepaid gift card</span> and they'll get rewarded too!
            </p>
            
            {/* Referral Code Display */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-3xl font-bold text-[#307842]">{referralCode}</div>
              <button 
                onClick={handleCopy}
                className="text-[#307842] font-bold text-lg"
              >
                COPY
              </button>
            </div>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-[#307842] text-white font-bold text-base py-3 rounded-lg mb-6"
            >
              Share Code
            </button>
            
            {/* Redeem Section */}
            <h3 className="text-2xl font-bold text-[#0d3547] mb-2">Redeem a code</h3>
            
            <p className="text-gray-700 text-base mb-3">
              Did your friend refer you to Sweeply? Enter their referral code and we will send you both a reward!
            </p>
            
            {/* Redeem Input */}
            <div className="mb-5">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 text-base focus:ring-[#307842] focus:border-[#307842] mb-3"
              />
              
              <button
                onClick={handleRedeem}
                className="w-full bg-white border border-[#307842] text-[#307842] font-bold text-base py-3 rounded-lg mb-3"
              >
                Redeem a Code
              </button>
            </div>
            
            {/* Terms Note */}
            <p className="text-gray-600 text-sm mb-6">
              By sharing or redeeming a referral code, you agree to the <a href="#" className="text-[#307842]">program terms of use</a>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Refer; 