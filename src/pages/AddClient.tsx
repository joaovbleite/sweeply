import React, { useState } from "react";
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

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <AppLayout>
        <div className="px-4 py-6 pb-40 bg-white flex-1">
          {/* Header */}
          <div className="flex items-center mb-4">
            <Link to="/clients" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">New client</h1>
          </div>

          {/* Add from contacts button */}
          <button 
            className="w-full flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-xl mb-6 text-green-600 font-medium"
            onClick={() => toast.info("Contacts access feature coming soon")}
          >
            <User className="w-5 h-5" />
            Add From Contacts
          </button>

          {/* Form fields */}
          <div className="space-y-4 mb-20">
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
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city || ""}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="relative">
                    <select
                      value={formData.state || ""}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-gray-100"
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
                  />
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-gray-100"
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
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="mt-8 pb-20">
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
        </div>
      </AppLayout>
      
      {/* Add a white background overlay that covers the entire page when address details are shown */}
      {showAddressDetails && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-white z-10" />
      )}
    </div>
  );
};

export default AddClient; 
 
 
 
 