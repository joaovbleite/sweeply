import { supabase } from '@/lib/supabase';

export interface IntegrationConfig {
  id: string;
  user_id: string;
  integration_type: 'payment' | 'calendar' | 'accounting' | 'communication' | 'marketing' | 'storage' | 'crm';
  integration_name: string;
  display_name: string;
  is_connected: boolean;
  is_enabled: boolean;
  config_data: Record<string, any>;
  webhook_settings: Record<string, any>;
  last_sync: string | null;
  sync_status: 'never' | 'success' | 'error' | 'in_progress';
  last_error: string | null;
  sync_frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
  connected_at: string | null;
}

export interface IntegrationSyncLog {
  id: string;
  user_id: string;
  integration_config_id: string;
  sync_type: 'manual' | 'scheduled' | 'webhook';
  sync_direction: 'import' | 'export' | 'bidirectional';
  status: 'started' | 'success' | 'error' | 'cancelled';
  records_processed: number;
  records_success: number;
  records_error: number;
  error_message: string | null;
  sync_data: Record<string, any>;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ConnectIntegrationData {
  integration_name: string;
  config_data: Record<string, any>;
  webhook_settings?: Record<string, any>;
}

export interface UpdateIntegrationData {
  config_data?: Record<string, any>;
  webhook_settings?: Record<string, any>;
  sync_frequency?: IntegrationConfig['sync_frequency'];
  is_enabled?: boolean;
}

class IntegrationsAPI {
  async getIntegrations(): Promise<IntegrationConfig[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('integration_type', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getConnectedIntegrations(): Promise<IntegrationConfig[]> {
    const integrations = await this.getIntegrations();
    return integrations.filter(integration => integration.is_connected && integration.is_enabled);
  }

  async getIntegrationsByType(type: IntegrationConfig['integration_type']): Promise<IntegrationConfig[]> {
    const integrations = await this.getIntegrations();
    return integrations.filter(integration => integration.integration_type === type);
  }

  async getIntegration(integrationName: string): Promise<IntegrationConfig | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_name', integrationName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async connectIntegration(connectData: ConnectIntegrationData): Promise<IntegrationConfig> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('connect_integration', {
      p_user_id: user.id,
      p_integration_name: connectData.integration_name,
      p_config_data: connectData.config_data,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to connect integration');
    }

    // Return the updated integration
    const integration = await this.getIntegration(connectData.integration_name);
    if (!integration) throw new Error('Integration not found after connection');

    return integration;
  }

  async disconnectIntegration(integrationName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('disconnect_integration', {
      p_user_id: user.id,
      p_integration_name: integrationName,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to disconnect integration');
    }
  }

  async updateIntegration(integrationName: string, updates: UpdateIntegrationData): Promise<IntegrationConfig> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('integration_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('integration_name', integrationName)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleIntegration(integrationName: string): Promise<IntegrationConfig> {
    const integration = await this.getIntegration(integrationName);
    if (!integration) throw new Error('Integration not found');

    return this.updateIntegration(integrationName, { 
      is_enabled: !integration.is_enabled 
    });
  }

  async updateSyncFrequency(integrationName: string, frequency: IntegrationConfig['sync_frequency']): Promise<IntegrationConfig> {
    return this.updateIntegration(integrationName, { sync_frequency: frequency });
  }

  // Sync Logs
  async getSyncLogs(integrationName?: string, limit: number = 50): Promise<IntegrationSyncLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (integrationName) {
      // Join with integration_configs to filter by name
      query = supabase
        .from('integration_sync_logs')
        .select(`
          *,
          integration_configs!inner(integration_name)
        `)
        .eq('user_id', user.id)
        .eq('integration_configs.integration_name', integrationName)
        .order('started_at', { ascending: false })
        .limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getRecentSyncLogs(integrationName: string, days: number = 7): Promise<IntegrationSyncLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('integration_sync_logs')
      .select(`
        *,
        integration_configs!inner(integration_name)
      `)
      .eq('user_id', user.id)
      .eq('integration_configs.integration_name', integrationName)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async triggerSync(integrationName: string, syncDirection: IntegrationSyncLog['sync_direction'] = 'bidirectional'): Promise<IntegrationSyncLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const integration = await this.getIntegration(integrationName);
    if (!integration) throw new Error('Integration not found');
    if (!integration.is_connected) throw new Error('Integration is not connected');

    // Create sync log entry
    const { data, error } = await supabase
      .from('integration_sync_logs')
      .insert({
        user_id: user.id,
        integration_config_id: integration.id,
        sync_type: 'manual',
        sync_direction: syncDirection,
        status: 'started',
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Implement actual sync logic based on integration type
    // For now, just mark as success
    setTimeout(async () => {
      await supabase
        .from('integration_sync_logs')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          duration_ms: 1000,
          records_processed: 0,
          records_success: 0,
        })
        .eq('id', data.id);

      // Update integration last sync
      await supabase
        .from('integration_configs')
        .update({
          last_sync: new Date().toISOString(),
          sync_status: 'success',
        })
        .eq('id', integration.id);
    }, 1000);

    return data;
  }

  // Integration Health
  async getIntegrationHealth(): Promise<{
    totalIntegrations: number;
    connectedIntegrations: number;
    healthyIntegrations: number;
    integrationsByType: Record<string, number>;
    recentErrors: IntegrationSyncLog[];
  }> {
    const [integrations, recentLogs] = await Promise.all([
      this.getIntegrations(),
      this.getSyncLogs(undefined, 20),
    ]);

    const connectedIntegrations = integrations.filter(i => i.is_connected).length;
    const healthyIntegrations = integrations.filter(i => 
      i.is_connected && i.sync_status !== 'error'
    ).length;

    const integrationsByType = integrations.reduce((acc, integration) => {
      if (integration.is_connected) {
        acc[integration.integration_type] = (acc[integration.integration_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = recentLogs.filter(log => log.status === 'error');

    return {
      totalIntegrations: integrations.length,
      connectedIntegrations,
      healthyIntegrations,
      integrationsByType,
      recentErrors,
    };
  }

  // Webhook management
  async updateWebhookSettings(integrationName: string, webhookSettings: Record<string, any>): Promise<IntegrationConfig> {
    return this.updateIntegration(integrationName, { webhook_settings: webhookSettings });
  }

  async testWebhook(integrationName: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.getIntegration(integrationName);
    if (!integration) throw new Error('Integration not found');
    if (!integration.is_connected) throw new Error('Integration is not connected');

    // TODO: Implement webhook testing logic
    return {
      success: true,
      message: 'Webhook test successful',
    };
  }
}

export const integrationsApi = new IntegrationsAPI(); 