import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";

const AddJob = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [scheduleForLater, setScheduleForLater] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    jobTitle: "",
    instructions: "",
    salesperson: "",
    subtotal: 0
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
        {/* Overview Section */}
        <h2 className="text-xl text-gray-500 font-medium mb-4">Overview</h2>
        
        <div className="space-y-4 mb-8">
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            placeholder="Job title"
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <textarea
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Instructions"
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Salesperson Section */}
        <div className="mb-8">
          <div className="relative mb-4">
            <label className="text-sm text-gray-500 font-medium mb-1 block">Salesperson</label>
            <div className="relative">
              <select
                value={formData.salesperson}
                onChange={(e) => handleInputChange('salesperson', e.target.value)}
                className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">Please select</option>
                <option value="john doe">John Doe</option>
                <option value="jane smith">Jane Smith</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Product / Service Section */}
        <h2 className="text-xl text-gray-500 font-medium mb-4">Product / Service</h2>
        
        {/* Line items Section */}
        <div className="flex items-center justify-between border-t border-b py-4 mb-4">
          <h3 className="text-xl font-medium">Line items</h3>
          <button className="text-green-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Subtotal Section */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-medium">Subtotal</h3>
          <span className="text-xl">{formatCurrency(formData.subtotal)}</span>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Schedule Section */}
        <h2 className="text-xl text-gray-500 font-medium mb-4">Schedule</h2>
        
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-medium">Schedule later</h3>
          <div 
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out ${scheduleForLater ? 'bg-gray-400' : 'bg-gray-300'}`}
            onClick={() => setScheduleForLater(!scheduleForLater)}
          >
            <div 
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${scheduleForLater ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </div>
        </div>
        
        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-green-600 text-white font-medium rounded-xl flex items-center justify-center"
          >
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddJob; 
 
 
 
 