import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, User, MapPin, Phone, Mail, ChevronDown, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { Invoice, UpdateInvoiceInput } from "@/types/invoice";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { format } from "date-fns";
import { useLocale } from "@/hooks/useLocale";
import { teamManagementApi, TeamMember } from "@/lib/api/team-management";

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useLocale();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientMessage, setShowClientMessage] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const [formData, setFormData] = useState<UpdateInvoiceInput>({
    invoice_title: "",
    due_date: "",
    issue_date: "",
    worker: "",
    payment_terms: "",
    items: [],
    tax_rate: 0,
    discount_amount: 0,
    notes: "",
    terms: "",
    footer_text: ""
  });

  // Load invoice and clients on mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [invoiceData, clientsData, teamData] = await Promise.all([
          invoicesApi.getById(id),
          clientsApi.getAll(),
          teamManagementApi.getActiveTeamMembers()
        ]);
        
        if (!invoiceData) {
          toast.error("Invoice not found");
          navigate("/invoices");
          return;
        }
        
        setInvoice(invoiceData);
        setClients(clientsData);
        setTeamMembers(teamData);
        
        // Find selected client
        const client = clientsData.find(c => c.id === invoiceData.client_id);
        if (client) {
          setSelectedClient(client);
        }
        
        // Set form data from invoice
        setFormData({
          invoice_title: invoiceData.invoice_title || "For Services Rendered",
          due_date: invoiceData.due_date,
          issue_date: invoiceData.issue_date,
          worker: invoiceData.worker || "",
          payment_terms: invoiceData.payment_terms || "Net 30",
          items: invoiceData.items || [],
          tax_rate: invoiceData.tax_rate || 0,
          discount_amount: invoiceData.discount_amount || 0,
          notes: invoiceData.notes || "",
          terms: invoiceData.terms || "Payment due within 30 days of invoice date.",
          footer_text: invoiceData.footer_text || "Thank you for your business. Please contact us with any questions regarding this invoice."
        });
        
        // Show client message if present
        if (invoiceData.notes) {
          setShowClientMessage(true);
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast.error("Failed to load invoice");
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

  const handleSaveChanges = async () => {
    if (!id || !invoice) return;
    
    setSaving(true);
    try {
      await invoicesApi.update(id, formData);
      toast.success("Invoice updated successfully");
      navigate("/invoices");
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error("Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleReviewAndSend = async () => {
    if (!id || !invoice) return;
    
    setSaving(true);
    try {
      await invoicesApi.update(id, formData);
      await invoicesApi.markAsSent(id);
      toast.success("Invoice updated and sent");
      navigate("/invoices");
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error("Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const calculateSubtotal = () => {
    return formData.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
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
        title="Edit Invoice" 
        onBackClick={() => navigate(-1)}
        rightElement={SendButton}
      />

      <div className="px-4 pt-7 pb-32 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Billed To Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Billed to</h2>
        
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
          {/* Invoice Title */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Invoice title</label>
            <input
              type="text"
              value={formData.invoice_title}
              onChange={(e) => handleInputChange('invoice_title', e.target.value)}
              className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white shadow-sm"
            />
          </div>
          
          {/* Issue Date */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Issued</label>
            <div className="flex items-center w-full">
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleInputChange('issue_date', e.target.value)}
                className="w-full pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Payment due</label>
            <div className="flex items-center w-full">
              <select
                value={formData.payment_terms}
                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                className="w-full appearance-none pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 shadow-sm"
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 7">Net 7</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Worker (formerly Salesperson) */}
          <div className="relative">
            <label className="text-sm text-gray-600 font-medium absolute top-2 left-4">Worker</label>
            <div className="flex items-center w-full">
              <select
                value={formData.worker}
                onChange={(e) => handleInputChange('worker', e.target.value)}
                className="w-full appearance-none pt-7 pb-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 shadow-sm"
              >
                <option value="">Please select</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.member_name || member.member_email || member.id}>
                    {member.member_name || member.member_email || 'Team Member'}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator - full width */}
        <div className="w-full h-3 bg-gray-100 -mx-4 mb-8"></div>
        
        {/* Product / Service Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Product / Service</h2>
        
        {/* Line items Section */}
        <div className="flex items-center justify-between py-4 border-t border-b mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Line items</h3>
          <button className="text-blue-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Line Items List */}
        {formData.items && formData.items.length > 0 ? (
          <div className="mb-6 space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{item.description}</h4>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(item.amount || 0)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.quantity} × {formatCurrency(item.rate || 0)}
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
            <span className="text-lg text-blue-600 font-medium">{formatCurrency(formData.discount_amount || 0)}</span>
          </div>
          
          {/* Tax */}
          <div className="flex items-center justify-between py-4">
            <h3 className="text-lg font-medium text-gray-800">Tax ({formData.tax_rate || 0}%)</h3>
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
        
        {/* Contract / Disclaimer Section */}
        <div className="border-b py-4 mb-8">
          <div className="flex justify-between items-center cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-800">Contract / Disclaimer</h3>
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </div>
          <p className="mt-2 text-gray-700">{formData.footer_text}</p>
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

export default EditInvoice; 