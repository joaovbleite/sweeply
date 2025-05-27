import { supabase } from '@/lib/supabase';

export interface ServiceType {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  default_price: number;
  default_duration: number;
  category: 'residential' | 'commercial' | 'specialized';
  is_active: boolean;
  requires_estimate: boolean;
  allow_online_booking: boolean;
  service_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceTypeData {
  name: string;
  description?: string;
  default_price: number;
  default_duration: number;
  category: 'residential' | 'commercial' | 'specialized';
  requires_estimate?: boolean;
  allow_online_booking?: boolean;
  service_order?: number;
}

export interface UpdateServiceTypeData extends Partial<CreateServiceTypeData> {
  is_active?: boolean;
}

class ServiceTypesAPI {
  async getServiceTypes(): Promise<ServiceType[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('user_id', user.id)
      .order('service_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getActiveServiceTypes(): Promise<ServiceType[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('service_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getServiceType(id: string): Promise<ServiceType | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createServiceType(serviceTypeData: CreateServiceTypeData): Promise<ServiceType> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the next service order
    const { data: maxOrderData } = await supabase
      .from('service_types')
      .select('service_order')
      .eq('user_id', user.id)
      .order('service_order', { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData.length > 0 
      ? (maxOrderData[0].service_order || 0) + 1 
      : 1;

    const { data, error } = await supabase
      .from('service_types')
      .insert({
        ...serviceTypeData,
        user_id: user.id,
        service_order: serviceTypeData.service_order ?? nextOrder,
        requires_estimate: serviceTypeData.requires_estimate ?? false,
        allow_online_booking: serviceTypeData.allow_online_booking ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateServiceType(id: string, updates: UpdateServiceTypeData): Promise<ServiceType> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('service_types')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteServiceType(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('service_types')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async toggleServiceTypeStatus(id: string): Promise<ServiceType> {
    const serviceType = await this.getServiceType(id);
    if (!serviceType) throw new Error('Service type not found');

    return this.updateServiceType(id, { is_active: !serviceType.is_active });
  }

  async reorderServiceTypes(serviceTypeIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update service_order for each service type
    const updates = serviceTypeIds.map((id, index) => ({
      id,
      user_id: user.id,
      service_order: index + 1,
    }));

    const { error } = await supabase
      .from('service_types')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
  }

  async duplicateServiceType(id: string): Promise<ServiceType> {
    const serviceType = await this.getServiceType(id);
    if (!serviceType) throw new Error('Service type not found');

    const duplicateData: CreateServiceTypeData = {
      name: `${serviceType.name} (Copy)`,
      description: serviceType.description || '',
      default_price: serviceType.default_price,
      default_duration: serviceType.default_duration,
      category: serviceType.category,
      requires_estimate: serviceType.requires_estimate,
      allow_online_booking: serviceType.allow_online_booking,
    };

    return this.createServiceType(duplicateData);
  }

  async getServiceTypesByCategory(category: ServiceType['category']): Promise<ServiceType[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('is_active', true)
      .order('service_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const serviceTypesApi = new ServiceTypesAPI(); 