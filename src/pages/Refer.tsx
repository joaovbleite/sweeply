import React, { useState } from "react";
import { ArrowLeft, Copy, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

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
      <div className="bg-white flex flex-col">
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
              Refer a friend
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          {/* Hero Section with dark blue background */}
          <div className="bg-[#0d3547] text-white px-4 py-8">
            <h2 className="text-3xl font-bold leading-tight mb-6">
              When your community is strong, you're strong
            </h2>
            
            {/* $100 Gift Card Image */}
            <div className="bg-[#f5f5f0] rounded-lg p-6 mb-4 mx-auto max-w-sm">
              <div className="bg-[#0d3547] text-[#a4ff00] p-4 inline-block font-bold text-4xl rounded">
                $100
              </div>
              <div className="bg-[#0d3547] text-white p-3 text-2xl font-bold mt-2 rounded">
                Prepaid
              </div>
              <div className="bg-[#0d3547] text-white p-3 text-2xl font-bold mt-2 rounded">
                Mastercard
              </div>
            </div>
          </div>
          
          {/* Share Code Section */}
          <div className="px-4 pt-6">
            <h3 className="text-2xl font-bold text-[#0d3547] mb-3">Share your code</h3>
            <p className="text-gray-700 text-lg mb-4">
              Refer friends to Sweeply with your unique code! If they become a customer, you'll get a <span className="font-bold">$100 prepaid gift card</span> and they'll get rewarded too!
            </p>
            
            {/* Referral Code Display */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-3xl font-bold text-green-700">{referralCode}</div>
              <button 
                onClick={handleCopy}
                className="text-green-700 font-bold text-lg"
              >
                COPY
              </button>
            </div>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-green-700 text-white font-bold text-xl py-4 rounded-lg mb-8"
            >
              Share Code
            </button>
            
            {/* Redeem Section */}
            <h3 className="text-2xl font-bold text-[#0d3547] mb-3">Redeem a code</h3>
            <p className="text-gray-700 text-lg mb-4">
              Did your friend refer you to Sweeply? Enter their referral code and we will send you both a reward!
            </p>
            
            {/* Redeem Input */}
            <div className="mb-4">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-800 text-lg focus:ring-green-700 focus:border-green-700 mb-4"
              />
              
              <button
                onClick={handleRedeem}
                className="w-full bg-white border border-green-700 text-green-700 font-bold text-xl py-4 rounded-lg mb-4"
              >
                Redeem a Code
              </button>
            </div>
            
            {/* Terms Note */}
            <p className="text-gray-600 text-center mb-8">
              By sharing or redeeming a referral code, you agree to the <a href="#" className="text-green-700">program terms of use</a>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Refer; 