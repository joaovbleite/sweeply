import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, ChevronDown, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { CreateInvoiceInput } from "@/types/invoice";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { format, addDays } from "date-fns";
import { useLocale } from "@/hooks/useLocale";
import BottomNavBar from "@/components/BottomNavBar";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientMessage, setShowClientMessage] = useState(false);
  
  const [formData, setFormData] = useState<CreateInvoiceInput>({
    client_id: "",
    invoice_title: "For Services Rendered",
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // 30 days from now
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    salesperson: "",
    payment_terms: "Net 30",
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
    footer_text: "Thank you for your business. Please contact us with any questions regarding this invoice."
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax_rate || 0) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - (formData.discount_amount || 0);
  };

  // Toggle client message section
  const handleToggleClientMessage = () => {
    setShowClientMessage(!showClientMessage);
  };

  // Send button for the header (Changed from "Review and Send" to "Send")
  const SendButton = (
    <button
      onClick={handleReviewAndSend}
      disabled={loading}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium"
    >
      Send
    </button>
  );

  return (
    <AppLayout>
      {/* Page Header with Send button on the right */}
      <PageHeader 
        title="New Invoice" 
        onBackClick={() => navigate(-1)}
        rightElement={SendButton}
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
            <Search className="w-6 h-6 text-blue-600 mr-3" />
            <span className="text-blue-600 text-lg font-medium">Select Existing Client</span>
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
              className="flex-1 text-left p-4 text-blue-600 text-lg font-medium"
              onClick={() => toast.info("Phone input coming soon")}
            >
              Add Phone Number
                  </button>
                </div>
          
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-gray-500 mr-3" />
              <button
              className="flex-1 text-left p-4 text-blue-600 text-lg font-medium"
              onClick={() => toast.info("Email input coming soon")}
              >
              Add Email
              </button>
            </div>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Overview Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Overview</h2>
        
        <div className="space-y-4 mb-8">
          {/* Invoice Title */}
          <div className="relative">
            <label className="text-sm text-gray-500 absolute top-2 left-4">Invoice title</label>
                        <input
              type="text"
              value={formData.invoice_title}
              onChange={(e) => handleInputChange('invoice_title', e.target.value)}
              className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          
          {/* Issue Date */}
          <div className="relative">
            <label className="text-sm text-gray-500 absolute top-2 left-4">Issued</label>
            <div className="flex items-center w-full">
              <input
                type="text"
                value="Date sent"
                readOnly
                className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="relative">
            <label className="text-sm text-gray-500 absolute top-2 left-4">Payment due</label>
            <div className="flex items-center w-full">
              <input
                type="text"
                value={formData.payment_terms}
                readOnly
                className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Salesperson */}
          <div className="relative">
            <label className="text-sm text-gray-500 absolute top-2 left-4">Salesperson</label>
            <div className="flex items-center w-full">
              <select
                value={formData.salesperson}
                onChange={(e) => handleInputChange('salesperson', e.target.value)}
                className="w-full appearance-none pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Please select</option>
                <option value="victor leite">victor leite</option>
                <option value="john doe">John Doe</option>
                <option value="jane smith">Jane Smith</option>
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-3 bg-gray-100 -mx-4 px-4 mb-8"></div>
        
        {/* Product / Service Section */}
        <h2 className="text-xl text-gray-700 font-medium mb-4">Product / Service</h2>
        
        {/* Line items Section */}
        <div className="flex items-center justify-between py-4 border-t border-b mb-4">
          <h3 className="text-xl font-bold text-gray-800">Line items</h3>
          <button className="text-blue-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Pricing Information */}
        <div className="space-y-4 mb-8">
          {/* Subtotal */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-xl font-medium text-gray-800">Subtotal</h3>
            <span className="text-xl text-gray-800">{formatCurrency(calculateSubtotal())}</span>
          </div>
          
          {/* Discount */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-xl font-medium text-gray-800">Discount</h3>
            <span className="text-xl text-blue-600">{formatCurrency(formData.discount_amount || 0)}</span>
          </div>
          
          {/* Tax */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-xl font-medium text-gray-800">Tax</h3>
            <span className="text-xl text-blue-600">{formatCurrency(calculateTax())}</span>
            </div>
          </div>

        {/* Total Section */}
        <div className="flex items-center justify-between py-4 bg-gray-100 -mx-4 px-4 mb-8">
          <h3 className="text-xl font-bold text-gray-800">Total</h3>
          <span className="text-xl font-bold text-gray-800">{formatCurrency(calculateTotal())}</span>
              </div>
              
        {/* Client Message Section */}
        <div className="border-t border-b py-4 mb-8">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={handleToggleClientMessage}
          >
            <h3 className="text-xl font-bold text-gray-800">Client message</h3>
            <Plus className="w-6 h-6 text-blue-600" />
              </div>
              
          {showClientMessage && (
            <div className="mt-4">
                <textarea
                placeholder="Add a message to your client"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          )}
        </div>
        
        {/* Contract / Disclaimer Section */}
        <div className="border-b py-4 mb-8">
          <div className="flex justify-between items-center cursor-pointer">
            <h3 className="text-xl font-bold text-gray-800">Contract / Disclaimer</h3>
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </div>
          <p className="mt-2 text-gray-700">{formData.footer_text}</p>
          </div>

        {/* Save Button */}
        <div className="pb-20 text-center">
            <button
            onClick={handleSaveAsDraft}
              disabled={loading}
            className="text-blue-600 font-medium text-lg"
          >
            Save
            </button>
          </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </AppLayout>
  );
};

export default CreateInvoice; 