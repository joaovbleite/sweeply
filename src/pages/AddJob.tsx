import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

const AddJob = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    jobTitle: ""
  });

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsApi.getAll();
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
        toast.error("Failed to load clients");
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      ...formData,
      clientId: client.id,
      firstName: client.name.split(' ')[0] || '',
      lastName: client.name.split(' ').slice(1).join(' ') || '',
      address: client.address || '',
      phone: client.phone || '',
      email: client.email || ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast.error("Client name is required");
      return;
    }

    toast.success("Job created successfully!");
    navigate("/jobs");
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <PageHeader 
        title="New job" 
        onBackClick={() => navigate(-1)}
      />

      <div className="px-4 pt-7 pb-24 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Client Info Section */}
        <h2 className="text-xl text-gray-500 font-medium mb-4">Client info</h2>
        
        {/* Client Selector */}
        <div className="mb-6">
          <button 
            className="w-full flex items-center justify-center p-4 rounded-xl border border-gray-300 bg-white"
            onClick={() => toast.info("Client selection coming soon")}
          >
            <Search className="w-6 h-6 text-blue-600 mr-3" />
            <span className="text-blue-600 text-lg font-medium">Select Existing Client</span>
          </button>
        </div>
        
        {/* Client Form */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <User className="w-6 h-6 text-gray-400 mr-3" />
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="First name"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Last name"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-gray-400 mr-3" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Property address"
              className="flex-1 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <Phone className="w-6 h-6 text-gray-400 mr-3" />
            <button 
              className="flex-1 text-left p-4 text-blue-600 text-lg font-medium"
              onClick={() => toast.info("Phone input coming soon")}
            >
              Add Phone Number
            </button>
          </div>
          
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-gray-400 mr-3" />
            <button 
              className="flex-1 text-left p-4 text-blue-600 text-lg font-medium"
              onClick={() => toast.info("Email input coming soon")}
            >
              Add Email
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4"></div>
        
        {/* Overview Section */}
        <div className="py-6">
          <h2 className="text-xl text-gray-500 font-medium mb-4">Overview</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="Job title"
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-xl flex items-center justify-center"
          >
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddJob; 
 
 
 
 