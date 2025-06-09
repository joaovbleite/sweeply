import React, { useState, useEffect } from "react";
import { X, Search, User, MapPin, Phone, Mail, Plus, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { useLocale } from "@/hooks/useLocale";
import PageHeader from "@/components/ui/PageHeader";

const NewQuote = () => {
  const { t } = useTranslation(['common', 'quotes']);
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  
  // Form state
  const [quoteData, setQuoteData] = useState({
    jobTitle: '',
    worker: 'victor leite',
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    requiredDeposit: 0,
    disclaimerText: 'This quote is valid for the next 30 days, after which values may be subject to change.'
  });
  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    email: ''
  });
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showLineItems, setShowLineItems] = useState(false);
  const [showClientMessage, setShowClientMessage] = useState(false);
  const [showDisclaimerEdit, setShowDisclaimerEdit] = useState(false);

  // Handle quote data changes
  const handleQuoteDataChange = (field: string, value: string | number) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle client data changes
  const handleClientDataChange = (field: string, value: string) => {
    setClientData(prev => ({
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

  // Toggle disclaimer edit
  const handleToggleDisclaimerEdit = () => {
    setShowDisclaimerEdit(!showDisclaimerEdit);
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

  // Create the review button for the header
  const ReviewButton = (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
      onClick={handleSubmit}
    >
      Review and Send
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Use the new PageHeader component with right element */}
      <PageHeader
        title="New quote"
        onBackClick={handleBack}
        rightElement={ReviewButton}
      />

      {/* Main content - with top padding to account for fixed header */}
      <div className="pt-28">
        {/* Client section */}
        <div className="p-4">
          <h2 className="text-lg text-gray-600 mb-4">Service for</h2>
          
          {/* Client selector */}
          <div className="mb-4">
            <button className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white">
              <Search className="w-6 h-6 text-blue-500 mr-3" />
              <span className="text-blue-500 text-lg">Select Existing Client</span>
            </button>
          </div>
          
          {/* New client form */}
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="w-6 h-6 text-gray-400 mr-3" />
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={clientData.firstName}
                  onChange={(e) => handleClientDataChange('firstName', e.target.value)}
                  placeholder="First name"
                  className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={clientData.lastName}
                  onChange={(e) => handleClientDataChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="w-6 h-6 text-gray-400 mr-3" />
              <input
                type="text"
                value={clientData.address}
                onChange={(e) => handleClientDataChange('address', e.target.value)}
                placeholder="Property address"
                className="flex-1 p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center">
              <Phone className="w-6 h-6 text-gray-400 mr-3" />
              <button className="flex-1 text-left p-4 text-blue-500 text-lg">
                Add Phone Number
              </button>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-gray-400 mr-3" />
              <button className="flex-1 text-left p-4 text-blue-500 text-lg">
                Add Email
              </button>
            </div>
          </div>
        </div>
        
        {/* Separator bar */}
        <div className="w-full h-12 bg-gray-100 border-t border-b border-gray-200"></div>
        
        {/* Overview section */}
        <div className="p-4">
          <h2 className="text-lg text-gray-600 mb-4">Overview</h2>
          
          <div className="space-y-4">
            {/* Job Title */}
            <input
              type="text"
              value={quoteData.jobTitle}
              onChange={(e) => handleQuoteDataChange('jobTitle', e.target.value)}
              placeholder="Job title"
              className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Worker (previously Salesperson) */}
            <div className="relative">
              <div className="absolute left-4 top-2 transform pointer-events-none text-gray-400 text-sm font-medium">
                Worker
              </div>
              <select
                value={quoteData.worker}
                onChange={(e) => handleQuoteDataChange('worker', e.target.value)}
                className="w-full pt-7 pb-3 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-800 bg-gray-100"
              >
                <option value="victor leite">victor leite</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
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
            <h2 className="text-xl font-medium text-gray-800">Introduction</h2>
            <Plus className="w-6 h-6 text-blue-500" />
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
          <h2 className="text-xl font-medium text-gray-600">Product / Service</h2>
        </div>
        
        {/* Line Items Section */}
        <div className="border-t border-b border-gray-200 px-4 py-5">
          <button 
            onClick={handleToggleLineItems}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-xl font-medium text-gray-800">Line items</h2>
            <Plus className="w-6 h-6 text-blue-500" />
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
              <h3 className="text-xl font-medium text-gray-800">Subtotal</h3>
              <span className="text-xl text-gray-800">{formatCurrency(quoteData.subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-gray-800">Discount</h3>
              <span className="text-xl text-blue-500">{formatCurrency(quoteData.discount)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-gray-800">Tax</h3>
              <span className="text-xl text-blue-500">{formatCurrency(quoteData.tax)}</span>
            </div>
          </div>
        </div>
        
        {/* Total Section */}
        <div className="bg-gray-100 px-4 py-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-gray-800">Total</h3>
            <span className="text-xl text-gray-800">{formatCurrency(quoteData.total)}</span>
          </div>
        </div>
        
        {/* Required Deposit Section */}
        <div className="px-4 py-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-gray-800">Required deposit</h3>
            <span className="text-xl text-blue-500">{formatCurrency(quoteData.requiredDeposit)}</span>
          </div>
        </div>
        
        {/* Client Message Section */}
        <div className="border-t border-b border-gray-200 px-4 py-5">
          <button 
            onClick={handleToggleClientMessage}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-xl font-medium text-gray-800">Client message</h2>
            <Plus className="w-6 h-6 text-blue-500" />
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
        
        {/* Contract / Disclaimer Section */}
        <div className="border-b border-gray-200 px-4 py-5">
          <button 
            onClick={handleToggleDisclaimerEdit}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-xl font-medium text-gray-800">Contract / Disclaimer</h2>
            <ChevronRight className="w-6 h-6 text-blue-500" />
          </button>
          <div className="mt-2">
            <p className="text-gray-600">{quoteData.disclaimerText}</p>
          </div>
          {showDisclaimerEdit && (
            <div className="mt-4">
              <textarea
                value={quoteData.disclaimerText}
                onChange={(e) => handleQuoteDataChange('disclaimerText', e.target.value)}
                placeholder="Add disclaimer text"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              ></textarea>
            </div>
          )}
        </div>
        
        {/* Draft Button */}
        <div className="px-4 py-5 flex justify-center">
          <button
            className="w-full text-blue-500 py-4 rounded-lg font-medium border border-blue-500"
            onClick={handleSave}
          >
            Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewQuote; 