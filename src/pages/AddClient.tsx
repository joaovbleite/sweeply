import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Building, List, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { CreateClientInput } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import AddressFormSection from "@/components/forms/AddressFormSection";

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
  const [useCompanyAsName, setUseCompanyAsName] = useState(false);
  const [phoneLabel, setPhoneLabel] = useState("Main");
  const [receivesSMS, setReceivesSMS] = useState(false);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const phoneLabels = ["Main", "Work", "Mobile", "Home", "Fax", "Other"];
  
  // Address form fields
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("United States");
  const [billingMatchesProperty, setBillingMatchesProperty] = useState(true);
  
  // Track which fields are currently being edited
  const [companyExpanded, setCompanyExpanded] = useState<boolean>(false);
  const [phoneExpanded, setPhoneExpanded] = useState<boolean>(false);
  const [emailExpanded, setEmailExpanded] = useState<boolean>(false);
  const [leadSourceExpanded, setLeadSourceExpanded] = useState<boolean>(false);
  const [addressFormExpanded, setAddressFormExpanded] = useState<boolean>(false);

  const handleInputChange = (field: string, value: string) => {
    if (field === "firstName") {
      setFirstName(value);
      // Update the name field as a combination of first and last name
      if (!useCompanyAsName) {
        setFormData(prev => ({
          ...prev,
          name: `${value} ${lastName}`.trim()
        }));
      }
    } else if (field === "lastName") {
      setLastName(value);
      // Update the name field as a combination of first and last name
      if (!useCompanyAsName) {
        setFormData(prev => ({
          ...prev,
          name: `${firstName} ${value}`.trim()
        }));
      }
    } else if (field === "companyName") {
      setCompanyName(value);
      // Update client type based on company name
      setFormData(prev => ({
        ...prev,
        client_type: value ? "commercial" : "residential",
        notes: value ? `Company: ${value}` : prev.notes
      }));
      
      // If using company name as client name, update the name field
      if (useCompanyAsName && value) {
        setFormData(prev => ({
          ...prev,
          name: value
        }));
      }
    } else if (field === "leadSource") {
      setFormData(prev => ({
        ...prev,
        preferences: value
      }));
    } else if (field === "addressLine2") {
      setAddressLine2(value);
    } else if (field === "zipCode") {
      setFormData(prev => ({
        ...prev,
        zip: value
      }));
    } else if (field === "country") {
      setCountry(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    if (field === "addressLine2") {
      setAddressLine2(value);
    } else if (field === "zipCode") {
      setFormData(prev => ({
        ...prev,
        zip: value
      }));
    } else if (field === "country") {
      setCountry(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleUseCompanyAsName = () => {
    const newState = !useCompanyAsName;
    setUseCompanyAsName(newState);
    
    // Update the name field based on toggle state
    if (newState && companyName) {
      setFormData(prev => ({
        ...prev,
        name: companyName
      }));
    } else {
      // Reset to first+last name
      setFormData(prev => ({
        ...prev,
        name: `${firstName} ${lastName}`.trim()
      }));
    }
  };

  const selectPhoneLabel = (label: string) => {
    setPhoneLabel(label);
    setShowLabelDropdown(false);
  };

  const toggleReceivesSMS = () => {
    setReceivesSMS(!receivesSMS);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting client data:', formData);
      const newClient = await clientsApi.create(formData);
      console.log('Client created successfully:', newClient);
      toast.success("Client added successfully!");
      navigate("/clients");
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error("Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout hideBottomNav>
      <PageHeader
        title="New Client"
        onBackClick={() => navigate(-1)}
        compact
      />

      <div className="pt-12 px-4 pb-24 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Add From Contacts button */}
        <div className="mb-6">
          <button 
            className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 text-blue-500 font-medium"
            onClick={() => toast.info("Contacts access feature coming soon")}
          >
            <User className="w-5 h-5 text-blue-500" />
            Add From Contacts
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-6 mb-16">
          {/* Name fields - always shown as inputs */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-500 mt-5" />
            <div className="flex-1 space-y-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-900"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Company Name section */}
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-gray-500 mt-5" />
            {companyExpanded ? (
              <div className="flex-1 flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-900"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Use company name as client name</span>
                  <button 
                    onClick={toggleUseCompanyAsName}
                    className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-300"
                  >
                    <span 
                      className={`absolute h-5 w-5 transform rounded-full bg-white transition-transform ${useCompanyAsName ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setCompanyExpanded(true)}
                className="text-blue-500 font-medium text-left w-full py-2"
              >
                Add Company Name
              </button>
            )}
          </div>

          {/* Phone Number section */}
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-500 mt-5" />
            {phoneExpanded ? (
              <div className="flex-1 flex flex-col space-y-4">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-900"
                  autoFocus
                />
                
                {/* Phone Label Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Label</span>
                      <span>{phoneLabel}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {showLabelDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      {phoneLabels.map((label) => (
                        <button
                          key={label}
                          onClick={() => selectPhoneLabel(label)}
                          className="w-full p-4 text-left text-white hover:bg-gray-700 flex items-center"
                        >
                          {label === phoneLabel && (
                            <span className="mr-2">✓</span>
                          )}
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Receives text messages toggle */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-gray-700">Receives text messages</span>
                  <button 
                    onClick={toggleReceivesSMS}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${receivesSMS ? 'bg-green-600' : 'bg-gray-300'}`}
                  >
                    <span 
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${receivesSMS ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Add another phone number button */}
                <button 
                  className="text-green-600 font-medium text-left w-full py-2"
                  onClick={() => toast.info("Multiple phone numbers coming soon")}
                >
                  Add Another Phone Number
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setPhoneExpanded(true)}
                className="text-blue-500 font-medium text-left w-full py-2"
              >
                Add Phone Number
              </button>
            )}
          </div>

          {/* Email - blue text only, no box until expanded */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            {emailExpanded ? (
              <input
                type="email"
                placeholder="Email address"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-4 bg-white border border-blue-500 rounded-lg focus:outline-none text-gray-900"
                autoFocus
              />
            ) : (
              <button 
                onClick={() => setEmailExpanded(true)}
                className="text-blue-500 font-medium text-left w-full py-2"
              >
                Add Email
              </button>
            )}
          </div>

          {/* Lead Source - blue text only, no box until expanded */}
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-gray-500" />
            {leadSourceExpanded ? (
              <input
                type="text"
                placeholder="Lead source"
                value={formData.preferences || ""}
                onChange={(e) => handleInputChange("leadSource", e.target.value)}
                className="w-full p-4 bg-white border border-blue-500 rounded-lg focus:outline-none text-gray-900"
                autoFocus
              />
            ) : (
              <button 
                onClick={() => setLeadSourceExpanded(true)}
                className="text-blue-500 font-medium text-left w-full py-2"
              >
                Add Lead Source
              </button>
            )}
          </div>

          {/* Property Address section */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-5" />
            <div className="flex-1">
              {addressFormExpanded ? (
                <AddressFormSection 
                  address={formData.address}
                  addressLine2={addressLine2}
                  city={formData.city}
                  state={formData.state}
                  zipCode={formData.zip}
                  country={country}
                  onAddressChange={handleAddressChange}
                  billingMatchesProperty={billingMatchesProperty}
                  onBillingMatchesPropertyChange={setBillingMatchesProperty}
                />
              ) : (
            <input
              type="text"
              placeholder="Property address"
                  value={formData.address}
                  onClick={() => setAddressFormExpanded(true)}
              className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none text-gray-900"
            />
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          className="w-full py-4 bg-green-600 text-white font-medium rounded-lg disabled:opacity-70 flex items-center justify-center"
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
 
 
 
 