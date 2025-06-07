import React, { useState, useEffect } from "react";
import { X, Search, User, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";

const NewQuote = () => {
  const { t } = useTranslation(['common', 'quotes']);
  const navigate = useNavigate();
  
  // Form state
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    email: ''
  });
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Load clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const clientsData = await clientsApi.getAll();
        setClients(clientsData);
        setFilteredClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error(t('common:errorFetchingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [t]);

  // Filter clients when search query changes
  useEffect(() => {
    if (clientSearchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = clientSearchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(query) || 
        client.email?.toLowerCase().includes(query) || 
        client.phone?.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [clientSearchQuery, clients]);

  // Handle selecting a client
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientSelector(false);
  };

  // Handle client search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientSearchQuery(e.target.value);
  };

  // Handle new client data changes
  const handleNewClientChange = (field: string, value: string) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle going back
  const handleBack = () => {
    navigate(-1);
  };

  // Handle showing client selector
  const handleShowClientSelector = () => {
    setShowClientSelector(true);
  };

  // Handle showing the phone input
  const handleAddPhone = () => {
    setShowPhoneInput(true);
  };

  // Handle showing the email input
  const handleAddEmail = () => {
    setShowEmailInput(true);
  };

  // Handle form submission
  const handleSubmit = () => {
    // This would be implemented with the actual form submission logic
    toast.success("Quote created successfully!");
    navigate("/quotes"); // Navigate to quotes list
  };

  // Handle save quote
  const handleSave = () => {
    toast.success("Quote saved as draft");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">New quote</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 pb-28">
        {/* Service for section */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-600 mb-4">Service for</h2>
          
          {/* Client selection button */}
          {!selectedClient && !showClientSelector && (
            <button 
              onClick={handleShowClientSelector}
              className="w-full flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 text-left"
            >
              <div className="flex items-center text-blue-600 font-medium">
                <Search className="w-5 h-5 mr-3" />
                <span>Select Existing Client</span>
              </div>
            </button>
          )}

          {/* Client selector dialog */}
          {showClientSelector && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mt-2 bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <div className="mr-3 bg-gray-200 rounded-full p-2">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.email && <div className="text-xs text-gray-500">{client.email}</div>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {loading ? "Loading clients..." : "No clients found"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected client display */}
          {selectedClient && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 bg-gray-200 rounded-full p-2">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{selectedClient.name}</div>
                    {selectedClient.email && <div className="text-xs text-gray-500">{selectedClient.email}</div>}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* New client form */}
          {!selectedClient && (
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="mr-3 text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={newClientData.firstName}
                    onChange={(e) => handleNewClientChange('firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={newClientData.lastName}
                    onChange={(e) => handleNewClientChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newClientData.address}
                    onChange={(e) => handleNewClientChange('address', e.target.value)}
                    placeholder="Property address"
                    className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 text-slate-400 pt-4">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  {showPhoneInput ? (
                    <input
                      type="tel"
                      value={newClientData.phone}
                      onChange={(e) => handleNewClientChange('phone', e.target.value)}
                      placeholder="Phone number"
                      className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <button
                      onClick={handleAddPhone}
                      className="flex items-center text-blue-600 font-medium py-4"
                    >
                      <span>Add Phone Number</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 text-slate-400 pt-4">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  {showEmailInput ? (
                    <input
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => handleNewClientChange('email', e.target.value)}
                      placeholder="Email address"
                      className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <button
                      onClick={handleAddEmail}
                      className="flex items-center text-blue-600 font-medium py-4"
                    >
                      <span>Add Email</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Overview section - placeholder for now */}
        <div className="mb-6">
          <h2 className="text-xl text-gray-600 mb-4">Overview</h2>
          {/* This section would be expanded in future development */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center text-gray-500">
            Quote details will be added here
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white pb-8 pt-4 px-4 border-t border-gray-200 flex flex-col space-y-4">
        <button
          className="w-full bg-[#307842] text-white py-4 rounded-lg font-medium"
          onClick={handleSubmit}
        >
          Review and Send
        </button>
        <button
          className="w-full text-[#307842] py-4 font-medium"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NewQuote; 