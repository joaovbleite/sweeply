import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Quote {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  sent_at?: string;
  valid_until?: string;
  total_amount: number;
  discount?: number;
  tax?: number;
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  notes?: string;
  terms?: string;
  salesperson?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface CreateQuoteInput {
  client_id: string;
  title: string;
  description?: string;
  valid_until?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  discount?: number;
  tax?: number;
  notes?: string;
  terms?: string;
  salesperson?: string;
}

export interface UpdateQuoteInput {
  title?: string;
  description?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string;
  line_items?: Array<{
    id?: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  discount?: number;
  tax?: number;
  notes?: string;
  terms?: string;
  salesperson?: string;
  sent_at?: string;
}

export interface QuoteFilters {
  status?: string[];
  client_id?: string;
  date_from?: string;
  date_to?: string;
}

export const quotesApi = {
  // Get all quotes for the current user
  async getAll(filters?: QuoteFilters): Promise<Quote[]> {
    let query = supabase
      .from('quotes')
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
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
      throw new Error('Failed to fetch quotes');
    }

    return data || [];
  },

  // Get a single quote by ID
  async getById(id: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
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
      console.error('Error fetching quote:', error);
      throw new Error('Failed to fetch quote');
    }

    return data;
  },

  // Create a new quote
  async create(quoteData: CreateQuoteInput): Promise<Quote> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Calculate line item totals and overall total
    const line_items = quoteData.line_items.map(item => ({
      id: uuidv4(),
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    }));

    const subtotal = line_items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = quoteData.discount || 0;
    const taxAmount = ((subtotal - discountAmount) * (quoteData.tax || 0)) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;

    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          user_id: user.id,
          client_id: quoteData.client_id,
          title: quoteData.title,
          description: quoteData.description,
          status: 'draft',
          valid_until: quoteData.valid_until || null,
          line_items,
          discount: discountAmount,
          tax: quoteData.tax || 0,
          total_amount: totalAmount,
          notes: quoteData.notes,
          terms: quoteData.terms || 'This quote is valid for 30 days from the date of issue.',
          salesperson: quoteData.salesperson
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
      console.error('Error creating quote:', error);
      throw new Error('Failed to create quote');
    }

    return data;
  },

  // Update an existing quote
  async update(id: string, quoteData: UpdateQuoteInput): Promise<Quote> {
    // If line items are being updated, recalculate totals
    let updateData: any = { ...quoteData };
    
    if (quoteData.line_items) {
      const line_items = quoteData.line_items.map(item => ({
        id: item.id || uuidv4(),
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      }));
      
      updateData.line_items = line_items;
      
      // Recalculate total if line items or discount/tax changed
      const subtotal = line_items.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = quoteData.discount !== undefined 
        ? quoteData.discount 
        : (await this.getById(id))?.discount || 0;
        
      const taxRate = quoteData.tax !== undefined
        ? quoteData.tax
        : (await this.getById(id))?.tax || 0;
        
      const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
      updateData.total_amount = subtotal - discountAmount + taxAmount;
    }

    const { data, error } = await supabase
      .from('quotes')
      .update(updateData)
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
      console.error('Error updating quote:', error);
      throw new Error('Failed to update quote');
    }

    return data;
  },

  // Delete a quote
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quote:', error);
      throw new Error('Failed to delete quote');
    }
  },

  // Mark quote as sent
  async markAsSent(id: string): Promise<Quote> {
    return this.update(id, { 
      status: 'sent',
      sent_at: new Date().toISOString()
    });
  },

  // Mark quote as accepted
  async markAsAccepted(id: string): Promise<Quote> {
    return this.update(id, { 
      status: 'accepted'
    });
  },

  // Mark quote as rejected
  async markAsRejected(id: string): Promise<Quote> {
    return this.update(id, { 
      status: 'rejected'
    });
  },

  // Get quotes for a specific client
  async getByClientId(clientId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
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
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client quotes:', error);
      throw new Error('Failed to fetch client quotes');
    }

    return data || [];
  }
}; 