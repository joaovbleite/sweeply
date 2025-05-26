import { supabase } from '@/lib/supabase';
import { Client, CreateClientInput, UpdateClientInput } from '@/types/client';

export const clientsApi = {
  // Get all clients for the current user
  async getAll(isActive?: boolean) {
    let query = supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as Client[];
  },

  // Get a single client by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  // Create a new client
  async create(input: CreateClientInput) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...input,
        user_id: user.id,
        client_type: input.client_type || 'residential'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  // Update a client
  async update(id: string, input: UpdateClientInput) {
    const { data, error } = await supabase
      .from('clients')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  // Delete a client (soft delete by setting is_active to false)
  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Search clients by name, email, or phone
  async search(query: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Client[];
  }
}; 
 
 
 
 