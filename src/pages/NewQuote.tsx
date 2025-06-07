import React, { useState, useEffect } from "react";
import { X, Search, User, MapPin, Phone, Mail, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { useLocale } from "@/hooks/useLocale";

const NewQuote = () => {
  const { t } = useTranslation(['common', 'quotes']);
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  
  // Form state
  const [quoteData, setQuoteData] = useState({
    jobTitle: '',
    salesperson: 'victor leite',
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    requiredDeposit: 0
  });
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showLineItems, setShowLineItems] = useState(false);
  const [showClientMessage, setShowClientMessage] = useState(false);

  // Handle quote data changes
  const handleQuoteDataChange = (field: string, value: string | number) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle going back
  const handleBack = () => {
    navigate(-1);
  };

  // Toggle introduction section
  const handleToggleIntroduction = () => {
    setShowIntroduction(!showIntroduction);
  };

  // Toggle line items section
  const handleToggleLineItems = () => {
    setShowLineItems(!showLineItems);
  };

  // Toggle client message section
  const handleToggleClientMessage = () => {
    setShowClientMessage(!showClientMessage);
  };

  // Handle form submission
  const handleSubmit = () => {
    // This would be implemented with the actual form submission logic
    toast.success("Quote created successfully!");
    navigate("/quotes"); // Navigate to quotes list
  };

  // Handle save quote
  const handleSave = () => {
    toast.success("Quote saved as draft");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">New quote</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="pb-28">
        {/* Separator bar */}
        <div className="w-full h-12 bg-gray-100 border-t border-b border-gray-200"></div>
        
        {/* Overview section */}
        <div className="p-4">
          <h2 className="text-xl text-gray-600 mb-4">Overview</h2>
          
          <div className="space-y-4">
            {/* Job Title */}
            <input
              type="text"
              value={quoteData.jobTitle}
              onChange={(e) => handleQuoteDataChange('jobTitle', e.target.value)}
              placeholder="Job title"
              className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Salesperson */}
            <div className="relative">
              <select
                value={quoteData.salesperson}
                onChange={(e) => handleQuoteDataChange('salesperson', e.target.value)}
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-600"
              >
                <option value="victor leite">victor leite</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              <div className="absolute left-4 top-4 transform pointer-events-none text-gray-400 font-medium">
                Salesperson
              </div>
            </div>
          </div>
        </div>
        
        {/* Introduction Section */}
        <div className="border-t border-b border-gray-200 px-4 py-5">
          <button 
            onClick={handleToggleIntroduction}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-2xl font-medium text-gray-800">Introduction</h2>
            <Plus className="w-6 h-6 text-blue-600" />
          </button>
          {showIntroduction && (
            <div className="mt-4">
              <textarea
                placeholder="Add introduction text"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              ></textarea>
            </div>
          )}
        </div>
        
        {/* Product / Service Section */}
        <div className="px-4 py-5">
          <h2 className="text-2xl font-medium text-gray-600">Product / Service</h2>
        </div>
        
        {/* Line Items Section */}
        <div className="border-t border-b border-gray-200 px-4 py-5">
          <button 
            onClick={handleToggleLineItems}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-2xl font-medium text-gray-800">Line items</h2>
            <Plus className="w-6 h-6 text-blue-600" />
          </button>
          {showLineItems && (
            <div className="mt-4">
              <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                No items added yet
              </div>
            </div>
          )}
        </div>
        
        {/* Pricing Section */}
        <div className="px-4 py-5">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-medium text-gray-800">Subtotal</h3>
              <span className="text-2xl text-gray-800">{formatCurrency(quoteData.subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-medium text-gray-800">Discount</h3>
              <span className="text-2xl text-green-600">{formatCurrency(quoteData.discount)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-medium text-gray-800">Tax</h3>
              <span className="text-2xl text-green-600">{formatCurrency(quoteData.tax)}</span>
            </div>
          </div>
        </div>
        
        {/* Total Section */}
        <div className="bg-gray-100 px-4 py-5">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium text-gray-800">Total</h3>
            <span className="text-2xl text-gray-800">{formatCurrency(quoteData.total)}</span>
          </div>
        </div>
        
        {/* Required Deposit Section */}
        <div className="px-4 py-5">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium text-gray-800">Required deposit</h3>
            <span className="text-2xl text-green-600">{formatCurrency(quoteData.requiredDeposit)}</span>
          </div>
        </div>
        
        {/* Client Message Section */}
        <div className="border-t border-b border-gray-200 px-4 py-5">
          <button 
            onClick={handleToggleClientMessage}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-2xl font-medium text-gray-800">Client message</h2>
            <Plus className="w-6 h-6 text-blue-600" />
          </button>
          {showClientMessage && (
            <div className="mt-4">
              <textarea
                placeholder="Add a message to your client"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              ></textarea>
            </div>
          )}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white pb-8 pt-4 px-4 border-t border-gray-200 flex flex-col space-y-4">
        <button
          className="w-full bg-[#307842] text-white py-4 rounded-lg font-medium"
          onClick={handleSubmit}
        >
          Review and Send
        </button>
        <button
          className="w-full text-[#307842] py-4 font-medium"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NewQuote; 