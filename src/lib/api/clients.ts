import { supabase } from '@/lib/supabase';
import { Client, CreateClientInput, UpdateClientInput } from '@/types/client';

export const clientsApi = {
  // Get all clients for the current user
  async getAll(isActive?: boolean) {
    console.log('Getting all clients, isActive filter:', isActive);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated in getAll clients');
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching clients for user_id:', user.id);
      
      // Build the query
      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id) // Ensure we only get clients for the current user
        .order('name', { ascending: true });

      // Apply active filter if provided
      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} clients`);
      return data as Client[];
    } catch (error) {
      console.error('Error in getAll clients:', error);
      throw error;
    }
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
    
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Creating client with user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...input,
          user_id: user.id,
          client_type: input.client_type || 'residential',
          is_active: true // Ensure is_active is set to true for new clients
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating client:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data returned after client creation');
        throw new Error('Failed to create client: No data returned');
      }
      
      console.log('Client created successfully:', data);
      return data as Client;
    } catch (error) {
      console.error('Error in create client:', error);
      throw error;
    }
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
 
 
 
 