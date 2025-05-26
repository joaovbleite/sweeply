export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  preferences?: string;
  is_active: boolean;
  client_type: 'residential' | 'commercial';
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  preferences?: string;
  client_type?: 'residential' | 'commercial';
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  is_active?: boolean;
} 