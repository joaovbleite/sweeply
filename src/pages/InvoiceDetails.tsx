import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, MapPin, Phone, Mail, ChevronDown, Edit, Download, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { invoicesApi } from "@/lib/api/invoices";
import { Invoice } from "@/types/invoice";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { format } from "date-fns";
import { useLocale } from "@/hooks/useLocale";

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useLocale();
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // Load invoice on mount
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const invoiceData = await invoicesApi.getById(id);
        
        if (!invoiceData) {
          toast.error("Invoice not found");
          navigate("/invoices");
          return;
        }
        
        setInvoice(invoiceData);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    
    loadInvoice();
  }, [id, navigate]);

  const handleSendInvoice = async () => {
    if (!id || !invoice) return;
    
    try {
      await invoicesApi.markAsSent(id);
      toast.success("Invoice sent successfully");
      // Reload invoice data
      const updatedInvoice = await invoicesApi.getById(id);
      setInvoice(updatedInvoice);
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error("Failed to send invoice");
    }
  };

  const handleDownloadInvoice = () => {
    toast.info("Download functionality coming soon");
  };

  const handleEditInvoice = () => {
    navigate(`/invoices/${id}/edit`);
  };

  // Action buttons for the header
  const ActionButtons = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleEditInvoice}
        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg"
      >
        <Edit className="w-4 h-4" />
        <span>Edit</span>
      </button>
      
      <button
        onClick={handleDownloadInvoice}
        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
      
      {invoice && invoice.status === 'draft' && (
        <button
          onClick={handleSendInvoice}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      )}
    </div>
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

  if (!invoice) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Invoice not found</p>
          <button 
            onClick={() => navigate('/invoices')}
            className="mt-4 flex items-center gap-2 text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideBottomNav>
      {/* Page Header with action buttons on the right */}
      <PageHeader 
        title={`Invoice ${invoice.invoice_number}`}
        onBackClick={() => navigate('/invoices')}
        rightElement={ActionButtons}
      />

      <div className="px-4 pt-7 pb-32 flex-1 overflow-y-auto min-h-screen bg-white">
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
        
        {/* Invoice Details */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{invoice.invoice_title || "Invoice"}</h2>
          <div className="flex flex-col gap-1 text-gray-600">
            <p>Issued: {format(new Date(invoice.issue_date), 'MMMM d, yyyy')}</p>
            <p>Due: {format(new Date(invoice.due_date), 'MMMM d, yyyy')}</p>
            {invoice.payment_terms && <p>Terms: {invoice.payment_terms}</p>}
          </div>
        </div>
        
        {/* Client Information */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Billed To</h3>
          
          {invoice.client && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 font-medium">{invoice.client.name}</span>
              </div>
              
              {invoice.client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{invoice.client.address}</span>
                </div>
              )}
              
              {invoice.client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{invoice.client.phone}</span>
                </div>
              )}
              
              {invoice.client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{invoice.client.email}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Line Items */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
          
          <div className="border rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-800">
                      {item.description}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Summary */}
        <div className="mb-8 space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-800">{formatCurrency(invoice.subtotal)}</span>
          </div>
          
          {invoice.tax_rate > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
              <span className="text-gray-800">{formatCurrency(invoice.tax_amount)}</span>
            </div>
          )}
          
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Discount</span>
              <span className="text-gray-800">-{formatCurrency(invoice.discount_amount)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-3 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
          </div>
          
          {invoice.paid_amount > 0 && (
            <>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600">{formatCurrency(invoice.paid_amount)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Balance Due</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.balance_due)}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
        
        {/* Terms */}
        {invoice.terms && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terms</h3>
            <p className="text-gray-600">{invoice.terms}</p>
          </div>
        )}
        
        {/* Footer */}
        {invoice.footer_text && (
          <div className="mt-12 text-center text-gray-500 text-sm">
            {invoice.footer_text}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InvoiceDetails; 