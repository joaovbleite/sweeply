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

    const clientData = {
      ...formData,
      // If company name is provided, set client type to commercial
      client_type: companyName ? "commercial" : "residential" as 'residential' | 'commercial',
      // Store company name in notes field if provided
      notes: companyName ? `Company: ${companyName}` : formData.notes
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

  return (
    <AppLayout>
      {/* Fixed header */}
      <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
        <div className="flex items-center px-4 pt-14 pb-4 border-b border-gray-200">
          <Link to="/clients" className="mr-2 text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a2e35]">
            New client
          </h1>
        </div>
      </div>

      {/* Content with padding to account for fixed header */}
      <div className="px-4 pt-6 pb-24 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Add from contacts button */}
        <button 
          className="w-full flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-xl mb-6 text-green-600 font-medium"
          onClick={() => toast.info("Contacts access feature coming soon")}
        >
          <User className="w-5 h-5" />
          Add From Contacts
        </button>

        {/* Form fields */}
        <div className="space-y-4 mb-16">
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

          {/* Simple property address field (non-expandable) */}
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Property address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Non-fixed Save Button at bottom of content */}
        <div className="mt-4 mb-10">
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
  );
};

export default AddClient; 
 
 
 
 