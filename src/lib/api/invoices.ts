import { supabase } from '@/lib/supabase';
import { Invoice, CreateInvoiceInput, UpdateInvoiceInput, InvoiceFilters, InvoiceStats, PaymentRecord, InvoiceStatus } from '@/types/invoice';

export const invoicesApi = {
  // Get all invoices for the current user
  async getAll(filters?: InvoiceFilters): Promise<Invoice[]> {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    if (filters?.date_from) {
      query = query.gte('issue_date', filters.date_from);
    }
    
    if (filters?.date_to) {
      query = query.lte('issue_date', filters.date_to);
    }

    if (filters?.overdue_only) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('due_date', today).in('status', ['sent']);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }

    return data || [];
  },

  // Get a single invoice by ID
  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      throw new Error('Failed to fetch invoice');
    }

    return data;
  },

  // Create a new invoice
  async create(invoiceData: CreateInvoiceInput): Promise<Invoice> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceData.tax_rate || 0) / 100;
    const totalAmount = subtotal + taxAmount - (invoiceData.discount_amount || 0);

    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          ...invoiceData,
          user_id: user.id,
          invoice_number: invoiceNumber,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          paid_amount: 0,
          balance_due: totalAmount,
          tax_rate: invoiceData.tax_rate || 0,
          discount_amount: invoiceData.discount_amount || 0,
          job_ids: invoiceData.job_ids || [],
        }
      ])
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip
        )
      `)
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }

    return data;
  },

  // Update an existing invoice
  async update(id: string, updates: UpdateInvoiceInput): Promise<Invoice> {
    // Recalculate totals if items are updated
    let calculatedUpdates = { ...updates };
    
    if (updates.items) {
      const subtotal = updates.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (updates.tax_rate || 0) / 100;
      const totalAmount = subtotal + taxAmount - (updates.discount_amount || 0);
      
      calculatedUpdates = {
        ...updates,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: totalAmount - (updates.paid_amount || 0),
      };
    }

    // Set timestamps based on status changes
    if (updates.status === 'sent' && !calculatedUpdates.sent_at) {
      calculatedUpdates.sent_at = new Date().toISOString();
    } else if (updates.status === 'paid' && !calculatedUpdates.paid_at) {
      calculatedUpdates.paid_at = new Date().toISOString();
      calculatedUpdates.payment_date = calculatedUpdates.payment_date || new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(calculatedUpdates)
      .eq('id', id)
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip
        )
      `)
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }

    return data;
  },

  // Delete an invoice
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  },

  // Mark invoice as sent
  async markAsSent(id: string): Promise<Invoice> {
    return this.update(id, { 
      status: 'sent',
      sent_at: new Date().toISOString()
    });
  },

  // Record payment
  async recordPayment(id: string, paymentData: {
    amount: number;
    payment_method: string;
    payment_date: string;
    reference?: string;
  }): Promise<Invoice> {
    const invoice = await this.getById(id);
    if (!invoice) throw new Error('Invoice not found');

    const newPaidAmount = invoice.paid_amount + paymentData.amount;
    const newBalanceDue = invoice.total_amount - newPaidAmount;
    const newStatus: InvoiceStatus = newBalanceDue <= 0 ? 'paid' : 'sent';

    return this.update(id, {
      paid_amount: newPaidAmount,
      balance_due: newBalanceDue,
      status: newStatus,
      payment_method: paymentData.payment_method as any,
      payment_date: paymentData.payment_date,
      payment_reference: paymentData.reference,
      ...(newStatus === 'paid' && { paid_at: new Date().toISOString() })
    });
  },

  // Get overdue invoices
  async getOverdue(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip
        )
      `)
      .lt('due_date', today)
      .in('status', ['sent'])
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching overdue invoices:', error);
      throw new Error('Failed to fetch overdue invoices');
    }

    return data || [];
  },

  // Get invoice statistics
  async getStats(): Promise<InvoiceStats> {
    const { data, error } = await supabase
      .from('invoices')
      .select('status, total_amount, paid_amount, issue_date, paid_at, due_date');

    if (error) {
      console.error('Error fetching invoice stats:', error);
      throw new Error('Failed to fetch invoice statistics');
    }

    const stats: InvoiceStats = {
      total: data.length,
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      total_revenue: 0,
      outstanding_amount: 0,
      avg_invoice_value: 0,
      avg_payment_time: 0,
    };

    const today = new Date();
    let totalPaymentDays = 0;
    let paidInvoicesCount = 0;

    data.forEach(invoice => {
      // Count by status
      if (invoice.status === 'sent' && new Date(invoice.due_date) < today) {
        stats.overdue++;
      } else {
        stats[invoice.status]++;
      }

      // Calculate revenue and outstanding amounts
      if (invoice.status === 'paid') {
        stats.total_revenue += invoice.total_amount;
        
        // Calculate payment time
        if (invoice.paid_at && invoice.issue_date) {
          const issueDate = new Date(invoice.issue_date);
          const paidDate = new Date(invoice.paid_at);
          const daysDiff = Math.ceil((paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
          totalPaymentDays += daysDiff;
          paidInvoicesCount++;
        }
      } else if (invoice.status === 'sent') {
        stats.outstanding_amount += (invoice.total_amount - invoice.paid_amount);
      }
    });

    // Calculate averages
    if (data.length > 0) {
      stats.avg_invoice_value = stats.total_revenue / Math.max(stats.paid, 1);
    }
    
    if (paidInvoicesCount > 0) {
      stats.avg_payment_time = totalPaymentDays / paidInvoicesCount;
    }

    return stats;
  },

  // Generate invoice number
  async generateInvoiceNumber(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the latest invoice number for this user
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting latest invoice number:', error);
    }

    const currentYear = new Date().getFullYear();
    let nextNumber = 1;

    if (data && data.length > 0) {
      const lastNumber = data[0].invoice_number;
      const match = lastNumber.match(/INV-(\d{4})-(\d+)/);
      if (match && parseInt(match[1]) === currentYear) {
        nextNumber = parseInt(match[2]) + 1;
      }
    }

    return `INV-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
  },

  // Search invoices
  async search(searchTerm: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip
        )
      `)
      .or(`invoice_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching invoices:', error);
      throw new Error('Failed to search invoices');
    }

    return data || [];
  },

  // Create invoice from jobs
  async createFromJobs(jobIds: string[], clientId: string, dueDate: string): Promise<Invoice> {
    // Get job details
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds)
      .eq('client_id', clientId);

    if (error) {
      throw new Error('Failed to fetch jobs for invoice');
    }

    if (!jobs || jobs.length === 0) {
      throw new Error('No jobs found for invoice');
    }

    // Create invoice items from jobs
    const items = jobs.map(job => ({
      description: `${job.title} - ${job.service_type.replace('_', ' ')}`,
      quantity: 1,
      rate: job.actual_price || job.estimated_price || 0,
      amount: job.actual_price || job.estimated_price || 0,
      job_id: job.id
    }));

    return this.create({
      client_id: clientId,
      due_date: dueDate,
      items,
      job_ids: jobIds,
      terms: 'Payment due within 30 days of invoice date.',
      footer_text: 'Thank you for your business!'
    });
  }
}; 