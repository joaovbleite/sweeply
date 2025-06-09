import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { CreateInvoiceInput } from "@/types/invoice";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { format, addDays } from "date-fns";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<CreateInvoiceInput>({
    client_id: "",
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // 30 days from now
    items: [{
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    }],
    tax_rate: 0,
    discount_amount: 0,
    notes: "",
    terms: "Payment due within 30 days of invoice date.",
    footer_text: "Thank you for your business!"
  });

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsApi.getAll();
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
        toast.error("Failed to load clients");
      }
    };
    loadClients();
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      client_id: client.id
    }));
  };

  const handleClientDataChange = (field: string, value: string) => {
    // This would update client data for new clients
    console.log(`Updating client ${field} to ${value}`);
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await invoicesApi.create(formData);
      toast.success("Invoice saved as draft");
      navigate("/invoices");
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAndSend = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const invoice = await invoicesApi.create(formData);
      await invoicesApi.markAsSent(invoice.id);
      toast.success("Invoice created and sent");
      navigate("/invoices");
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.client_id && !selectedClient) {
      toast.error("Please select or enter client information");
      return false;
    }
    
    // Add additional validation as needed
    return true;
  };

  // Save button component for the header
  const SaveButton = (
    <button
      onClick={handleSaveAsDraft}
      disabled={loading}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium"
    >
      Save
    </button>
  );

  return (
    <AppLayout>
      {/* Page Header with Save button on the right */}
      <PageHeader 
        title="New Invoice" 
        onBackClick={() => navigate(-1)}
        rightElement={SaveButton}
      />

      <div className="px-4 pt-7 pb-32 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Billed To Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Billed to</h2>
        
        {/* Client Selector */}
        <div className="mb-6">
          <button 
            className="w-full flex items-center justify-center p-4 rounded-xl border border-gray-300 bg-white"
            onClick={() => toast.info("Client selection coming soon")}
          >
            <Search className="w-6 h-6 text-green-600 mr-3" />
            <span className="text-green-600 text-lg font-medium">Select Existing Client</span>
          </button>
        </div>
        
        {/* Client Form */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <User className="w-6 h-6 text-gray-500 mr-3" />
            <div className="flex-1 space-y-3">
              <input
                type="text"
                onChange={(e) => handleClientDataChange('firstName', e.target.value)}
                placeholder="First name"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                onChange={(e) => handleClientDataChange('lastName', e.target.value)}
                placeholder="Last name"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-gray-500 mr-3" />
            <input
              type="text"
              onChange={(e) => handleClientDataChange('address', e.target.value)}
              placeholder="Property address"
              className="flex-1 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <Phone className="w-6 h-6 text-gray-500 mr-3" />
            <button 
              className="flex-1 text-left p-4 text-green-600 text-lg font-medium"
              onClick={() => toast.info("Phone input coming soon")}
            >
              Add Phone Number
            </button>
          </div>
          
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-gray-500 mr-3" />
            <button 
              className="flex-1 text-left p-4 text-green-600 text-lg font-medium"
              onClick={() => toast.info("Email input coming soon")}
            >
              Add Email
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Overview Section - Placeholder for now */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Overview</h2>
        
        <div className="space-y-4 mb-20">
          {/* This section would be expanded based on requirements */}
          <p className="text-gray-500">Invoice details will be added here.</p>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 space-y-4 bg-white border-t border-gray-200">
          <button
            onClick={handleReviewAndSend}
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white font-medium rounded-xl flex items-center justify-center"
          >
            Review and Send
          </button>
          
          <button
            onClick={handleSaveAsDraft}
            disabled={loading}
            className="w-full text-blue-600 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateInvoice; 