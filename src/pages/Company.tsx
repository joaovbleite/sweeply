import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

const Company: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get user's email safely
  const userEmail = user?.email || '';

  // Company state with default values
  const [companyData, setCompanyData] = useState({
    name: `${userEmail}'s Company`,
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // States list
  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
    "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  // Countries list
  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "New Zealand",
    "Germany", "France", "Spain", "Italy", "Japan", "Brazil", "Mexico"
  ];

  // Update form field values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Company data saved:', companyData);
    // TODO: Save company data to database
    navigate(-1);
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
              Company details
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 pb-28">
          {/* Company Information */}
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Company name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={companyData.name}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">Company email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={companyData.email}
                onChange={handleChange}
                placeholder="Company email address"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="sr-only">Company phone number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={companyData.phone}
                onChange={handleChange}
                placeholder="Company phone number"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="sr-only">Company website URL</label>
              <input
                type="url"
                id="website"
                name="website"
                value={companyData.website}
                onChange={handleChange}
                placeholder="Company website URL"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
          </div>
          
          {/* Location Information */}
          <div className="mt-8 mb-4">
            <h2 className="text-xl font-semibold text-[#1a2e35]">Location</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="addressLine1" className="sr-only">Address line 1</label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={companyData.addressLine1}
                onChange={handleChange}
                placeholder="Address line 1"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="addressLine2" className="sr-only">Address line 2</label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={companyData.addressLine2}
                onChange={handleChange}
                placeholder="Address line 2"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="sr-only">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={companyData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div className="relative">
              <label htmlFor="state" className="sr-only">State</label>
              <select
                id="state"
                name="state"
                value={companyData.state}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500 appearance-none"
              >
                <option value="">Select...</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            
            <div>
              <label htmlFor="zipCode" className="sr-only">Zip code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={companyData.zipCode}
                onChange={handleChange}
                placeholder="Zip code"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500"
              />
            </div>
            
            <div className="relative">
              <label htmlFor="country" className="sr-only">Country</label>
              <select
                id="country"
                name="country"
                value={companyData.country}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-600 text-lg focus:ring-pulse-500 focus:border-pulse-500 appearance-none"
              >
                <option value="">Select an option</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <button
            type="submit"
            className="fixed bottom-6 left-4 right-4 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-medium rounded-lg transition-colors shadow-md"
          >
            Save
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Company; 