import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, Building, List } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { CreateClientInput } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

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
  
  // Expanded field states
  const [companyExpanded, setCompanyExpanded] = useState(false);
  const [phoneExpanded, setPhoneExpanded] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [leadSourceExpanded, setLeadSourceExpanded] = useState(false);

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
      // Update client type based on company name
      setFormData(prev => ({
        ...prev,
        client_type: value ? "commercial" : "residential",
        notes: value ? `Company: ${value}` : prev.notes
      }));
    } else if (field === "leadSource") {
      setFormData(prev => ({
        ...prev,
        preferences: value
      }));
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

    try {
      await clientsApi.create(formData);
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
    <AppLayout>
      {/* Use the PageHeader component */}
      <PageHeader
        title="New client"
        onBackClick={() => navigate(-1)}
      />

      {/* Content with padding to account for fixed header */}
      <div className="pt-28 px-4 pb-24 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Add from contacts button */}
        <button 
          className="w-full flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg mb-6 text-[#307842] font-medium"
          onClick={() => toast.info("Contacts access feature coming soon")}
        >
          <User className="w-5 h-5" />
          Add From Contacts
        </button>

        {/* Form fields */}
        <div className="space-y-6 mb-16">
          {/* Name fields */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-500 mt-4" />
            <div className="flex-1 space-y-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
              />
            </div>
          </div>

          {/* Company name */}
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-500" />
            {companyExpanded ? (
              <input
                type="text"
                placeholder="Company name"
                value={formData.notes?.replace('Company: ', '') || ''}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
                autoFocus
              />
            ) : (
              <button 
                onClick={() => setCompanyExpanded(true)}
                className="text-[#307842] font-medium text-left w-full py-2"
              >
                Add Company Name
              </button>
            )}
          </div>

          {/* Phone number */}
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            {phoneExpanded ? (
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
                autoFocus
              />
            ) : (
              <button 
                onClick={() => setPhoneExpanded(true)}
                className="text-[#307842] font-medium text-left w-full py-2"
              >
                Add Phone Number
              </button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-500" />
            {emailExpanded ? (
              <input
                type="email"
                placeholder="Email address"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
                autoFocus
              />
            ) : (
              <button 
                onClick={() => setEmailExpanded(true)}
                className="text-[#307842] font-medium text-left w-full py-2"
              >
                Add Email
              </button>
            )}
          </div>

          {/* Lead source */}
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-gray-500" />
            {leadSourceExpanded ? (
              <input
                type="text"
                placeholder="Lead source"
                value={formData.preferences || ""}
                onChange={(e) => handleInputChange("leadSource", e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
                autoFocus
              />
            ) : (
              <button 
                onClick={() => setLeadSourceExpanded(true)}
                className="text-[#307842] font-medium text-left w-full py-2"
              >
                Add Lead Source
              </button>
            )}
          </div>

          {/* Property address field */}
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Property address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#307842] text-gray-900"
            />
          </div>
        </div>

        {/* Save Button - using green color instead of blue */}
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          className="w-full py-4 bg-[#307842] text-white font-medium rounded-lg disabled:opacity-70 flex items-center justify-center"
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
 
 
 
 