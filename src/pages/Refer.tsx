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
  const [referralCode, setReferralCode] = useState("VICTORLEITE"); // Would normally come from user data
  const [redeemCode, setRedeemCode] = useState("");
  
  // Get user's name for generating referral code
  const userName = user?.email?.split('@')[0]?.toUpperCase() || "VICTORLEITE";

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
          <div className="bg-[#0a2434] text-white px-6 py-8">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              When your community is strong, you're strong
            </h2>
            
            {/* $100 Gift Card Image */}
            <div className="bg-[#f5f5f0] rounded-lg p-6 mb-4">
              <div className="w-full">
                <div className="bg-[#0a2434] text-[#9dfc00] p-3 inline-block font-bold text-7xl rounded">$100</div>
                <div className="bg-[#0a2434] text-white p-2 text-3xl font-bold mt-2 rounded">Prepaid</div>
                <div className="bg-[#0a2434] text-white p-2 text-4xl font-bold mt-2 rounded">Mastercard</div>
              </div>
            </div>
          </div>
          
          {/* Share Code Section */}
          <div className="px-6 pt-6">
            <h3 className="text-3xl font-bold text-[#0d3547] mb-3">Share your code</h3>
            <p className="text-gray-700 text-lg mb-4">
              Refer friends to Jobber with your unique code! If they become a customer, you'll get a <span className="font-bold">$100 prepaid gift card</span> and they'll get rewarded too!
            </p>
            
            {/* Referral Code Display */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-4xl font-bold text-[#307842]">{referralCode}</div>
              <button 
                onClick={handleCopy}
                className="text-[#307842] font-bold text-xl"
              >
                COPY
              </button>
            </div>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-[#307842] text-white font-bold text-xl py-4 rounded-lg mb-8"
            >
              Share Code
            </button>
            
            {/* Redeem Section */}
            <h3 className="text-3xl font-bold text-[#0d3547] mb-3">Redeem a code</h3>
            
            <p className="text-gray-700 text-lg mb-4">
              Did your friend refer you to Jobber? Enter their referral code and we will send you both a reward!
            </p>
            
            {/* Redeem Input */}
            <div className="mb-6">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-800 text-lg focus:ring-[#307842] focus:border-[#307842] mb-4"
              />
              
              <button
                onClick={handleRedeem}
                className="w-full bg-white border border-[#307842] text-[#307842] font-bold text-xl py-4 rounded-lg mb-4"
              >
                Redeem a Code
              </button>
            </div>
            
            {/* Terms Note */}
            <p className="text-gray-600 text-base mb-8">
              By sharing or redeeming a referral code, you agree to the <a href="#" className="text-[#307842]">program terms of use</a>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Refer; 