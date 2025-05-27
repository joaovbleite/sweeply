-- Create team_invitations table for managing team member invitations
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The business owner who sent the invitation
    
    -- Invitation Details
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cleaner', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    
    -- Security
    invitation_token UUID DEFAULT gen_random_uuid() UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    
    -- Tracking
    invited_by UUID REFERENCES auth.users(id),
    invited_user_id UUID REFERENCES auth.users(id), -- Set when invitation is accepted
    
    -- Additional Information
    invitation_message TEXT,
    permissions JSONB DEFAULT '{}', -- Role-specific permissions
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create team_members table for accepted team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Business owner
    member_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Team member
    
    -- Role and Status
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cleaner', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Permissions and Settings
    permissions JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    
    -- Metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique team member per business
    UNIQUE(user_id, member_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_team_invitations_user_id ON team_invitations(user_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_invitations_expires ON team_invitations(expires_at);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_member_user_id ON team_members(member_user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Enable Row Level Security
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_invitations
CREATE POLICY "Users can view their own invitations" ON team_invitations
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = invited_user_id);

CREATE POLICY "Users can insert their own invitations" ON team_invitations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitations" ON team_invitations
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = invited_user_id);

CREATE POLICY "Users can delete their own invitations" ON team_invitations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for team_members
CREATE POLICY "Users can view their team members" ON team_members
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = member_user_id);

CREATE POLICY "Business owners can insert team members" ON team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can update team members" ON team_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Business owners can delete team members" ON team_members
    FOR DELETE USING (auth.uid() = user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_team_invitations_updated_at
    BEFORE UPDATE ON team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to accept team invitation
CREATE OR REPLACE FUNCTION accept_team_invitation(
    p_invitation_token UUID,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_invitation team_invitations%ROWTYPE;
    v_team_member_id UUID;
BEGIN
    -- Get invitation
    SELECT * INTO v_invitation 
    FROM team_invitations 
    WHERE invitation_token = p_invitation_token 
      AND status = 'pending' 
      AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;
    
    -- Check if user email matches invitation
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = p_user_id AND email = v_invitation.email
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email does not match invitation');
    END IF;
    
    -- Check if already a team member
    IF EXISTS (
        SELECT 1 FROM team_members 
        WHERE user_id = v_invitation.user_id AND member_user_id = p_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already a team member');
    END IF;
    
    -- Create team member record
    INSERT INTO team_members (user_id, member_user_id, role, permissions)
    VALUES (v_invitation.user_id, p_user_id, v_invitation.role, v_invitation.permissions)
    RETURNING id INTO v_team_member_id;
    
    -- Update invitation status
    UPDATE team_invitations
    SET status = 'accepted',
        invited_user_id = p_user_id,
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = v_invitation.id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'team_member_id', v_team_member_id,
        'role', v_invitation.role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE team_invitations
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending' 
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql; 