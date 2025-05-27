import { supabase } from '@/lib/supabase';

export interface TeamInvitation {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'manager' | 'cleaner' | 'viewer';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token: string;
  expires_at: string;
  invited_by: string | null;
  invited_user_id: string | null;
  invitation_message: string | null;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  cancelled_at: string | null;
}

export interface TeamMember {
  id: string;
  user_id: string;
  member_user_id: string;
  role: 'admin' | 'manager' | 'cleaner' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  permissions: Record<string, any>;
  settings: Record<string, any>;
  joined_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  member_name?: string;
  member_email?: string;
}

export interface CreateInvitationData {
  email: string;
  role: 'admin' | 'manager' | 'cleaner' | 'viewer';
  invitation_message?: string;
  permissions?: Record<string, any>;
}

export interface UpdateTeamMemberData {
  role?: 'admin' | 'manager' | 'cleaner' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  permissions?: Record<string, any>;
  settings?: Record<string, any>;
}

class TeamManagementAPI {
  // Team Invitations
  async getTeamInvitations(): Promise<TeamInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPendingInvitations(): Promise<TeamInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createInvitation(invitationData: CreateInvitationData): Promise<TeamInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if email is already invited
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('user_id', user.id)
      .eq('email', invitationData.email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      throw new Error('Email already has a pending invitation');
    }

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        ...invitationData,
        user_id: user.id,
        invited_by: user.id,
        permissions: invitationData.permissions || {},
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invitation email here
    // await this.sendInvitationEmail(data);

    return data;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('team_invitations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async resendInvitation(invitationId: string): Promise<TeamInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Extend expiration and update invitation
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('team_invitations')
      .update({
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invitation email again
    // await this.sendInvitationEmail(data);

    return data;
  }

  async acceptInvitation(invitationToken: string): Promise<{ success: boolean; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('accept_team_invitation', {
      p_invitation_token: invitationToken,
      p_user_id: user.id,
    });

    if (error) throw error;

    return data;
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    const members = await this.getTeamMembers();
    return members.filter(member => member.status === 'active');
  }

  async getTeamMember(memberId: string): Promise<TeamMember | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async updateTeamMember(memberId: string, updates: UpdateTeamMemberData): Promise<TeamMember> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeTeamMember(memberId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async updateTeamMemberRole(memberId: string, role: TeamMember['role']): Promise<TeamMember> {
    return this.updateTeamMember(memberId, { role });
  }

  async updateTeamMemberStatus(memberId: string, status: TeamMember['status']): Promise<TeamMember> {
    return this.updateTeamMember(memberId, { status });
  }

  async getTeamMembersByRole(role: TeamMember['role']): Promise<TeamMember[]> {
    const members = await this.getActiveTeamMembers();
    return members.filter(member => member.role === role);
  }

  async getTeamStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    pendingInvitations: number;
    roleDistribution: Record<string, number>;
  }> {
    const [members, invitations] = await Promise.all([
      this.getTeamMembers(),
      this.getPendingInvitations(),
    ]);

    const activeMembers = members.filter(m => m.status === 'active');
    const roleDistribution = activeMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      pendingInvitations: invitations.length,
      roleDistribution,
    };
  }

  // Utility functions
  async expireOldInvitations(): Promise<void> {
    const { error } = await supabase.rpc('expire_old_invitations');
    if (error) throw error;
  }

  private async sendInvitationEmail(invitation: TeamInvitation): Promise<void> {
    // TODO: Implement email sending
    // This would integrate with your email service (SendGrid, etc.)
    console.log('TODO: Send invitation email to', invitation.email);
  }
}

export const teamManagementApi = new TeamManagementAPI(); 