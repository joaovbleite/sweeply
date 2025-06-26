import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, ChevronDown, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { quotesApi, Quote, UpdateQuoteInput } from "@/lib/api/quotes";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { format } from "date-fns";
import { useLocale } from "@/hooks/useLocale";

const EditQuote = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useLocale();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientMessage, setShowClientMessage] = useState(false);
  
  const [formData, setFormData] = useState<UpdateQuoteInput>({
    title: "",
    description: "",
    valid_until: "",
    line_items: [],
    discount: 0,
    tax: 0,
    notes: "",
    terms: "",
    worker: ""
  });

  // Load quote and clients on mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [quoteData, clientsData] = await Promise.all([
          quotesApi.getById(id),
          clientsApi.getAll()
        ]);
        
        if (!quoteData) {
          toast.error("Quote not found");
          navigate("/quotes");
          return;
        }
        
        setQuote(quoteData);
        setClients(clientsData);
        
        // Find selected client
        const client = clientsData.find(c => c.id === quoteData.client_id);
        if (client) {
          setSelectedClient(client);
        }
        
        // Set form data from quote
        setFormData({
          title: quoteData.title || "Service Quote",
          description: quoteData.description || "",
          valid_until: quoteData.valid_until || "",
          line_items: quoteData.line_items || [],
          discount: quoteData.discount || 0,
          tax: quoteData.tax || 0,
          notes: quoteData.notes || "",
          terms: quoteData.terms || "This quote is valid for 30 days from the date of issue.",
          worker: quoteData.worker || ""
        });
        
        // Show client message if present
        if (quoteData.notes) {
          setShowClientMessage(true);
        }
      } catch (error) {
        console.error('Error loading quote:', error);
        toast.error("Failed to load quote");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      client_id: client.id
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!id || !quote) return;
    
    setSaving(true);
    try {
      await quotesApi.update(id, formData);
      toast.success("Quote updated successfully");
      navigate("/quotes");
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error("Failed to update quote");
    } finally {
      setSaving(false);
    }
  };

  const handleReviewAndSend = async () => {
    if (!id || !quote) return;
    
    setSaving(true);
    try {
      await quotesApi.update(id, formData);
      await quotesApi.markAsSent(id);
      toast.success("Quote updated and sent");
      navigate("/quotes");
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error("Failed to update quote");
    } finally {
      setSaving(false);
    }
  };

  const calculateSubtotal = () => {
    return formData.line_items?.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      return sum + itemTotal;
    }, 0) || 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax || 0) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - (formData.discount || 0) + calculateTax();
  };

  // Toggle client message section
  const handleToggleClientMessage = () => {
    setShowClientMessage(!showClientMessage);
  };

  // Send button for the header
  const SendButton = (
    <button
      onClick={handleReviewAndSend}
      disabled={saving || loading}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium"
    >
      Send
    </button>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideBottomNav>
      {/* Page Header with Send button on the right */}
      <PageHeader 
        title="Edit Quote" 
        onBackClick={() => navigate(-1)}
        rightElement={SendButton}
      />

      <div className="px-4 pt-7 pb-32 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Billed To Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Service for</h2>
        
        {/* Client Information */}
        {selectedClient && (
          <div className="mb-6 p-4 rounded-xl border border-gray-300 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-6 h-6 text-gray-700" />
              <span className="text-lg font-medium text-gray-800">{selectedClient.name}</span>
            </div>
            
            {selectedClient.address && (
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-gray-700" />
                <span className="text-gray-700">{selectedClient.address}</span>
              </div>
            )}
            
            {selectedClient.phone && (
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-6 h-6 text-gray-700" />
                <span className="text-gray-700">{selectedClient.phone}</span>
              </div>
            )}
            
            {selectedClient.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-gray-700" />
                <span className="text-gray-700">{selectedClient.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Separator - full width */}
        <div className="w-full h-3 bg-gray-100 -mx-4 mb-8"></div>
        
        {/* Overview Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
        
        <div className="space-y-4 mb-8">
          {/* Quote Title */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Quote title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white shadow-sm"
            />
          </div>
          
          {/* Description */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white shadow-sm"
              rows={3}
            />
          </div>

          {/* Valid Until */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Valid until</label>
            <div className="flex items-center w-full">
              <input
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => handleInputChange('valid_until', e.target.value)}
                className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Worker */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Worker</label>
            <div className="flex items-center w-full">
              <select
                value={formData.worker || ''}
                onChange={(e) => handleInputChange('worker', e.target.value)}
                className="w-full appearance-none pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 shadow-sm"
              >
                <option value="">Please select</option>
                <option value="victor leite">Victor Leite</option>
                <option value="john doe">John Doe</option>
                <option value="jane smith">Jane Smith</option>
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator - full width */}
        <div className="w-full h-3 bg-gray-100 -mx-4 mb-8"></div>
        
        {/* Line Items Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Services & Products</h2>
        
        {/* Line items Section */}
        <div className="flex items-center justify-between py-4 border-t border-b mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Line items</h3>
          <button className="text-blue-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Line Items List */}
        {formData.line_items && formData.line_items.length > 0 ? (
          <div className="mb-6 space-y-3">
            {formData.line_items.map((item, index) => (
              <div key={item.id || index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{item.description}</h4>
                  <span className="font-medium text-gray-800">
                    {formatCurrency((item.quantity || 0) * (item.price || 0))}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.quantity} × {formatCurrency(item.price || 0)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center p-6 mb-6 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No line items added yet</p>
          </div>
        )}

        {/* Pricing Information */}
        <div className="space-y-4 mb-8">
          {/* Subtotal */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-lg font-medium text-gray-800">Subtotal</h3>
            <span className="text-lg text-gray-800 font-medium">{formatCurrency(calculateSubtotal())}</span>
          </div>
          
          {/* Discount */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-lg font-medium text-gray-800">Discount</h3>
            <span className="text-lg text-blue-600 font-medium">{formatCurrency(formData.discount || 0)}</span>
          </div>
          
          {/* Tax */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-lg font-medium text-gray-800">Tax ({formData.tax || 0}%)</h3>
            <span className="text-lg text-blue-600 font-medium">{formatCurrency(calculateTax())}</span>
          </div>
        </div>

        {/* Total Section */}
        <div className="flex items-center justify-between py-4 bg-blue-50 -mx-4 px-8 mb-8 border-t border-b border-blue-100">
          <h3 className="text-xl font-bold text-gray-900">Total</h3>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
        </div>
              
        {/* Client Message Section */}
        <div className="border-t border-b py-4 mb-8">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={handleToggleClientMessage}
          >
            <h3 className="text-lg font-semibold text-gray-800">Client message</h3>
            {showClientMessage ? (
              <ChevronDown className="w-6 h-6 text-blue-600" />
            ) : (
              <Plus className="w-6 h-6 text-blue-600" />
            )}
          </div>
              
          {showClientMessage && (
            <div className="mt-4">
              <textarea
                placeholder="Add a message to your client"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 shadow-sm"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          )}
        </div>
        
        {/* Terms Section */}
        <div className="border-b py-4 mb-8">
          <div className="flex justify-between items-center cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-800">Terms & Conditions</h3>
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </div>
          <p className="mt-2 text-gray-700">{formData.terms}</p>
        </div>

        {/* Save Button */}
        <div className="pb-20 text-center">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditQuote; 