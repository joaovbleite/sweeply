export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  job_id?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  
  // Invoice Details
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  invoice_title?: string;
  salesperson?: string;
  payment_terms?: string;
  
  // Items and Pricing
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Payment Information
  paid_amount: number;
  balance_due: number;
  payment_method?: PaymentMethod;
  payment_date?: string;
  payment_reference?: string;
  
  // Additional Information
  notes?: string;
  terms?: string;
  footer_text?: string;
  
  // Job References
  job_ids: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
}

export interface CreateInvoiceInput {
  client_id: string;
  due_date: string;
  issue_date?: string;
  invoice_title?: string;
  salesperson?: string;
  payment_terms?: string;
  items: Omit<InvoiceItem, 'id'>[];
  tax_rate?: number;
  discount_amount?: number;
  notes?: string;
  terms?: string;
  footer_text?: string;
  job_ids?: string[];
}

export interface UpdateInvoiceInput {
  status?: InvoiceStatus;
  due_date?: string;
  issue_date?: string;
  invoice_title?: string;
  salesperson?: string;
  payment_terms?: string;
  items?: Omit<InvoiceItem, 'id'>[];
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  balance_due?: number;
  notes?: string;
  terms?: string;
  footer_text?: string;
  payment_method?: PaymentMethod;
  payment_date?: string;
  payment_reference?: string;
  paid_amount?: number;
  sent_at?: string;
  paid_at?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus[];
  client_id?: string;
  date_from?: string;
  date_to?: string;
  overdue_only?: boolean;
}

export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  total_revenue: number;
  outstanding_amount: number;
  avg_invoice_value: number;
  avg_payment_time: number; // days
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
} 
 
 
 
 