import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface AddressFormSectionProps {
  address: string | undefined;
  addressLine2: string | undefined;
  city: string | undefined;
  state: string | undefined;
  zipCode: string | undefined;
  country: string | undefined;
  onAddressChange: (field: string, value: string) => void;
  billingMatchesProperty: boolean;
  onBillingMatchesPropertyChange: (value: boolean) => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

const COUNTRIES = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Australia'];

const AddressFormSection: React.FC<AddressFormSectionProps> = ({
  address,
  addressLine2,
  city,
  state,
  zipCode,
  country,
  onAddressChange,
  billingMatchesProperty,
  onBillingMatchesPropertyChange
}) => {
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleStateSelect = (selectedState: string) => {
    onAddressChange('state', selectedState);
    setShowStateDropdown(false);
  };

  const handleCountrySelect = (selectedCountry: string) => {
    onAddressChange('country', selectedCountry);
    setShowCountryDropdown(false);
  };

  return (
    <div className="flex flex-col space-y-3 px-4">
      {/* Property address field */}
      <div className="flex flex-col space-y-3">
        <input
          type="text"
          placeholder="Property address"
          value={address || ""}
          onChange={(e) => onAddressChange('address', e.target.value)}
          className="h-12 rounded-lg border border-[#C7D1D9] bg-white text-base text-[#123D36] px-4 py-3 placeholder:text-[#6C7A82] focus:border-[#1D763F] transition-all"
        />
        
        <input
          type="text"
          placeholder="Address line 2"
          value={addressLine2 || ""}
          onChange={(e) => onAddressChange('addressLine2', e.target.value)}
          className="h-12 rounded-lg border border-[#C7D1D9] bg-white text-base text-[#123D36] px-4 py-3 placeholder:text-[#6C7A82] focus:border-[#1D763F] transition-all"
        />
        
        <input
          type="text"
          placeholder="City"
          value={city || ""}
          onChange={(e) => onAddressChange('city', e.target.value)}
          className="h-12 rounded-lg border border-[#C7D1D9] bg-white text-base text-[#123D36] px-4 py-3 placeholder:text-[#6C7A82] focus:border-[#1D763F] transition-all"
        />
        
        {/* State dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStateDropdown(!showStateDropdown)}
            className="w-full h-12 rounded-lg border border-[#C7D1D9] bg-white text-base text-[#123D36] px-4 py-3 flex items-center justify-between focus:border-[#1D763F] transition-all"
          >
            <span className={state ? 'text-[#123D36]' : 'text-[#6C7A82]'}>
              {state || 'State'}
            </span>
            <ChevronDown className="w-5 h-5 text-[#6C7A82]" />
          </button>
          
          {showStateDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-[#C7D1D9] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {US_STATES.map((stateName) => (
                <button
                  key={stateName}
                  type="button"
                  onClick={() => handleStateSelect(stateName)}
                  className="w-full px-4 py-3 text-left text-[#123D36] hover:bg-[#F5F5F5] flex items-center"
                >
                  {stateName}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <input
          type="text"
          placeholder="Zip code"
          value={zipCode || ""}
          onChange={(e) => onAddressChange('zipCode', e.target.value)}
          className="h-12 rounded-lg border border-[#C7D1D9] bg-white text-base text-[#123D36] px-4 py-3 placeholder:text-[#6C7A82] focus:border-[#1D763F] transition-all"
        />
        
        {/* Country dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-full h-12 rounded-lg border border-[#C7D1D9] bg-white text-base text-[#123D36] px-4 py-3 flex items-center justify-between focus:border-[#1D763F] transition-all"
          >
            <span className={country ? 'text-[#123D36]' : 'text-[#6C7A82]'}>
              {country || 'Country'}
            </span>
            <ChevronDown className="w-5 h-5 text-[#6C7A82]" />
          </button>
          
          {showCountryDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-[#C7D1D9] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {COUNTRIES.map((countryName) => (
                <button
                  key={countryName}
                  type="button"
                  onClick={() => handleCountrySelect(countryName)}
                  className="w-full px-4 py-3 text-left text-[#123D36] hover:bg-[#F5F5F5] flex items-center"
                >
                  {countryName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Billing address toggle */}
      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-sm font-medium text-[#123D36]">Billing address matches property</span>
        <button 
          type="button"
          onClick={() => onBillingMatchesPropertyChange(!billingMatchesProperty)}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${billingMatchesProperty ? 'bg-[#1D763F]' : 'bg-[#D0D0D0]'}`}
        >
          <span 
            className={`absolute h-5 w-5 transform rounded-full bg-white transition-transform ${billingMatchesProperty ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default AddressFormSection; 