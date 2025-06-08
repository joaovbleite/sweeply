import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Building, ChevronDown, List } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { CreateClientInput } from "@/types/client";
import AppLayout from "@/components/AppLayout";

const AddClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateClientInput>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    client_type: "residential"
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("United States");
  const [billingMatchesProperty, setBillingMatchesProperty] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Add listeners for keyboard visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Check if any input is focused - this is more reliable on mobile
      const isInputFocused = document.activeElement instanceof HTMLInputElement || 
                             document.activeElement instanceof HTMLTextAreaElement ||
                             document.activeElement instanceof HTMLSelectElement;
      
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDifference = windowHeight - viewportHeight;
        
        // If an input is focused and there's a height difference, keyboard is likely visible
        // Use a lower threshold to catch more cases
        setIsKeyboardVisible(isInputFocused && heightDifference > 100);
      } else {
        // Fallback for browsers without visualViewport API
        setIsKeyboardVisible(isInputFocused);
      }
    };

    // Listen for viewport changes and focus changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisibilityChange);
      window.visualViewport.addEventListener('scroll', handleVisibilityChange);
    }
    
    // Also check on focus/blur events throughout the document
    document.addEventListener('focusin', handleVisibilityChange);
    document.addEventListener('focusout', handleVisibilityChange);

    // Initial check
    handleVisibilityChange();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisibilityChange);
        window.visualViewport.removeEventListener('scroll', handleVisibilityChange);
      }
      document.removeEventListener('focusin', handleVisibilityChange);
      document.removeEventListener('focusout', handleVisibilityChange);
    };
  }, []);

  // Scroll to the bottom when address details are shown
  useEffect(() => {
    if (showAddressDetails && contentRef.current) {
      // Add a short delay to ensure DOM is updated
      setTimeout(() => {
        if (contentRef.current) {
          const element = contentRef.current;
          window.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [showAddressDetails]);

  // Handle blur events
  const handleBlur = () => {
    setFocusedField(null);
    // Don't set keyboard visibility here, let the event handlers do it
  };

  // Handle focus events
  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    // If focusing an address field, force the keyboard visible state
    if (['address', 'addressLine2', 'city', 'state', 'zip', 'country'].includes(fieldName)) {
      setIsKeyboardVisible(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "firstName") {
      setFirstName(value);
      // Update the name field as a combination of first and last name
      setFormData(prev => ({
        ...prev,
        name: `${value} ${lastName}`.trim()
      }));
    } else if (field === "lastName") {
      setLastName(value);
      // Update the name field as a combination of first and last name
      setFormData(prev => ({
        ...prev,
        name: `${firstName} ${value}`.trim()
      }));
    } else if (field === "companyName") {
      setCompanyName(value);
    } else if (field === "leadSource") {
      setLeadSource(value);
      setFormData(prev => ({
        ...prev,
        preferences: value
      }));
    } else if (field === "addressLine2") {
      setAddressLine2(value);
    } else if (field === "country") {
      setCountry(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    setLoading(true);

    // Combine address information into the address field
    const fullAddress = [
      formData.address,
      addressLine2,
      formData.city,
      formData.state,
      formData.zip,
      country !== "United States" ? country : ""
    ].filter(Boolean).join(", ");

    const clientData = {
      ...formData,
      // If company name is provided, set client type to commercial
      client_type: companyName ? "commercial" : "residential" as 'residential' | 'commercial',
      // Store company name in notes field if provided
      notes: companyName ? `Company: ${companyName}` : formData.notes,
      // Add billing address information to notes if different from property
      address: fullAddress
    };

    try {
      await clientsApi.create(clientData);
      toast.success("Client added successfully!");
      navigate("/clients");
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error("Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  // Toggle the address details visibility
  const toggleAddressDetails = () => {
    setShowAddressDetails(!showAddressDetails);
  };

  // Check if currently focused on an address field
  const isAddressFieldFocused = focusedField && 
    ['address', 'addressLine2', 'city', 'state', 'zip', 'country'].includes(focusedField);

  // Determine if toolbar should be hidden - any time keyboard is visible is enough
  // for a better mobile experience, especially with address fields
  const hideToolbar = isKeyboardVisible;

  return (
    <AppLayout hideBottomNav={true}>
      {/* Fixed header */}
      <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
        <div className="flex items-center px-4 pt-12 pb-3 border-b border-gray-200">
          <Link to="/clients" className="mr-2 text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a2e35]">
            New client
          </h1>
        </div>
      </div>

      {/* Content with padding to account for fixed header */}
      <div 
        ref={contentRef}
        className={`px-4 ${showAddressDetails ? 'pb-40' : 'pb-28'} pt-5 flex-1 overflow-y-auto min-h-screen bg-white`}
      >
        {/* Add from contacts button */}
        <button 
          className="w-full flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-xl mb-6 text-green-600 font-medium"
          onClick={() => toast.info("Contacts access feature coming soon")}
        >
          <User className="w-5 h-5" />
          Add From Contacts
        </button>

        {/* Form fields */}
        <div className="space-y-4 mb-10">
          {/* Name fields */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <div className="flex-1 space-y-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                onFocus={() => handleFocus("firstName")}
                onBlur={handleBlur}
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                onFocus={() => handleFocus("lastName")}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Company name */}
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Add Company Name"
              value={companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600 font-medium"
              onFocus={() => handleFocus("companyName")}
              onBlur={handleBlur}
            />
          </div>

          {/* Phone number */}
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <input
              type="tel"
              placeholder="Add Phone Number"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600 font-medium"
              onFocus={() => handleFocus("phone")}
              onBlur={handleBlur}
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Add Email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600 font-medium"
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
            />
          </div>

          {/* Lead source */}
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Add Lead Source"
              value={leadSource}
              onChange={(e) => handleInputChange("leadSource", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600 font-medium"
              onFocus={() => handleFocus("leadSource")}
              onBlur={handleBlur}
            />
          </div>

          {/* Property address */}
          <div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div 
                  className="w-full cursor-pointer"
                  onClick={toggleAddressDetails}
                >
                  <input
                    type="text"
                    placeholder="Property address"
                    value={formData.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddressDetails(true);
                    }}
                    onFocus={() => handleFocus("address")}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>

            {/* Show address details only when showAddressDetails is true */}
            {showAddressDetails && (
              <div className="ml-8 mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Address line 2"
                  value={addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  onFocus={() => handleFocus("addressLine2")}
                  onBlur={handleBlur}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  onFocus={() => handleFocus("city")}
                  onBlur={handleBlur}
                />
                <div className="relative">
                  <select
                    value={formData.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-gray-100"
                    onFocus={() => handleFocus("state")}
                    onBlur={handleBlur}
                  >
                    <option value="">State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    {/* Add more states as needed */}
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="FL">Florida</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
                <input
                  type="text"
                  placeholder="Zip code"
                  value={formData.zip || ""}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  onFocus={() => handleFocus("zip")}
                  onBlur={handleBlur}
                />
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-gray-100"
                    onFocus={() => handleFocus("country")}
                    onBlur={handleBlur}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    {/* Add more countries as needed */}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
                
                <div className="flex items-center justify-between pt-4 pb-2">
                  <span className="text-gray-800">Billing address matches property</span>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={billingMatchesProperty}
                      onChange={() => setBillingMatchesProperty(!billingMatchesProperty)}
                      className="sr-only"
                    />
                    <span className={`relative inline-block h-6 w-11 rounded-full transition-colors ${billingMatchesProperty ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${billingMatchesProperty ? 'translate-x-5' : ''}`}></span>
                    </span>
                  </label>
                </div>
                
                {/* Extra padding at the bottom to push content above keyboard */}
                <div className="h-28"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Save Button at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 z-50">
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          className="w-full py-4 bg-blue-600 text-white font-medium rounded-xl disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </AppLayout>
  );
};

export default AddClient; 
 
 
 
 