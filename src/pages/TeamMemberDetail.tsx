import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Calendar, Clock, Shield, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { teamManagementApi, TeamMember, UpdateTeamMemberData } from "@/lib/api/team-management";

const TeamMemberDetail: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateTeamMemberData>({
    role: 'cleaner',
    status: 'active',
    permissions: {},
  });
  
  // Load team member data
  useEffect(() => {
    const loadTeamMember = async () => {
      if (!memberId) return;
      
      try {
        setLoading(true);
        const memberData = await teamManagementApi.getTeamMember(memberId);
        
        if (!memberData) {
          toast.error("Team member not found");
          navigate("/team");
          return;
        }
        
        setMember(memberData);
        setEditData({
          role: memberData.role,
          status: memberData.status,
          permissions: memberData.permissions || {},
        });
      } catch (error: any) {
        console.error("Error loading team member:", error);
        toast.error("Failed to load team member: " + error.message);
        navigate("/team");
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamMember();
  }, [memberId, navigate]);
  
  // Handle role change
  const handleRoleChange = (role: TeamMember['role']) => {
    setEditData(prev => ({ ...prev, role }));
  };
  
  // Handle status change
  const handleStatusChange = (status: TeamMember['status']) => {
    setEditData(prev => ({ ...prev, status }));
  };
  
  // Handle permission toggle
  const handlePermissionToggle = (key: string) => {
    setEditData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions?.[key]
      }
    }));
  };
  
  // Save changes
  const handleSaveChanges = async () => {
    if (!member || !memberId) return;
    
    try {
      setLoading(true);
      const updatedMember = await teamManagementApi.updateTeamMember(memberId, editData);
      setMember(updatedMember);
      setIsEditing(false);
      toast.success("Team member updated successfully");
    } catch (error: any) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove team member
  const handleRemoveTeamMember = async () => {
    if (!member || !memberId) return;
    
    if (!window.confirm("Are you sure you want to remove this team member? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      await teamManagementApi.removeTeamMember(memberId);
      toast.success("Team member removed successfully");
      navigate("/team");
    } catch (error: any) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member: " + error.message);
      setLoading(false);
    }
  };
  
  // Get initials from name
  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Create the edit/save button for the header
  const HeaderButton = isEditing ? (
    <button
      onClick={handleSaveChanges}
      disabled={loading}
      className="text-blue-600 font-medium flex items-center"
    >
      {loading ? "Saving..." : "Save"}
    </button>
  ) : (
    <button
      onClick={() => setIsEditing(true)}
      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
    >
      <Edit2 className="w-5 h-5" />
    </button>
  );
  
  if (loading && !member) {
    return (
      <AppLayout>
        <PageHeader
          title="Team Member"
          onBackClick={() => navigate("/team")}
        />
        <div className="pt-28 px-4 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <PageHeader
        title={isEditing ? "Edit Team Member" : "Team Member"}
        onBackClick={() => isEditing ? setIsEditing(false) : navigate("/team")}
        rightElement={HeaderButton}
      />
      
      <div className="pt-28 px-4 pb-36">
        {/* Member Profile */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl mr-4">
              {getInitials(member?.member_name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a2e35]">{member?.member_name || 'Team Member'}</h2>
              <p className="text-gray-500 capitalize">{member?.role || 'Member'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">{member?.member_email || 'No email'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">Joined {member ? new Date(member.joined_at).toLocaleDateString() : 'Recently'}</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-gray-400 mr-3" />
              <span className={`font-medium ${member?.status === 'active' ? 'text-green-600' : member?.status === 'suspended' ? 'text-red-600' : 'text-gray-500'}`}>
                {member?.status === 'active' ? 'Active' : member?.status === 'suspended' ? 'Suspended' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <>
            {/* Role Selection */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Role</h3>
              <div className="space-y-3">
                {['admin', 'manager', 'cleaner', 'viewer'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role as TeamMember['role'])}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                      editData.role === role 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="font-medium capitalize">{role}</span>
                    {editData.role === role && <Check className="w-5 h-5 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Status Selection */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Status</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange('active')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                    editData.status === 'active' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <span className="font-medium">Active</span>
                  {editData.status === 'active' && <Check className="w-5 h-5 text-green-500" />}
                </button>
                <button
                  onClick={() => handleStatusChange('inactive')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                    editData.status === 'inactive' 
                      ? 'border-gray-500 bg-gray-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <span className="font-medium">Inactive</span>
                  {editData.status === 'inactive' && <Check className="w-5 h-5 text-gray-500" />}
                </button>
                <button
                  onClick={() => handleStatusChange('suspended')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                    editData.status === 'suspended' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <span className="font-medium">Suspended</span>
                  {editData.status === 'suspended' && <Check className="w-5 h-5 text-red-500" />}
                </button>
              </div>
            </div>
            
            {/* Permissions */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Permissions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-base text-gray-700">View schedule</span>
                  <button 
                    onClick={() => handlePermissionToggle('viewSchedule')}
                    className="focus:outline-none"
                  >
                    {editData.permissions?.viewSchedule ? (
                      <Check className="w-6 h-6 text-blue-600" />
                    ) : (
                      <X className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-base text-gray-700">View client details</span>
                  <button 
                    onClick={() => handlePermissionToggle('viewClientDetails')}
                    className="focus:outline-none"
                  >
                    {editData.permissions?.viewClientDetails ? (
                      <Check className="w-6 h-6 text-blue-600" />
                    ) : (
                      <X className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-base text-gray-700">Record time</span>
                  <button 
                    onClick={() => handlePermissionToggle('recordTime')}
                    className="focus:outline-none"
                  >
                    {editData.permissions?.recordTime ? (
                      <Check className="w-6 h-6 text-blue-600" />
                    ) : (
                      <X className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-base text-gray-700">Edit notes</span>
                  <button 
                    onClick={() => handlePermissionToggle('editNotes')}
                    className="focus:outline-none"
                  >
                    {editData.permissions?.editNotes ? (
                      <Check className="w-6 h-6 text-blue-600" />
                    ) : (
                      <X className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-base text-gray-700">See pricing details</span>
                  <button 
                    onClick={() => handlePermissionToggle('seePricing')}
                    className="focus:outline-none"
                  >
                    {editData.permissions?.seePricing ? (
                      <Check className="w-6 h-6 text-blue-600" />
                    ) : (
                      <X className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Remove Team Member */}
            <button
              onClick={handleRemoveTeamMember}
              className="w-full py-4 mt-4 bg-red-50 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Remove Team Member
            </button>
          </>
        ) : (
          <>
            {/* Role & Permissions */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Role & Permissions</h3>
              <div className="mb-4">
                <h4 className="font-medium text-gray-600 mb-2">Role</h4>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
                  {member?.role || 'Member'}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-600 mb-2">Permissions</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    {member?.permissions?.viewSchedule ? (
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-700">View schedule</span>
                  </div>
                  <div className="flex items-center">
                    {member?.permissions?.viewClientDetails ? (
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-700">View client details</span>
                  </div>
                  <div className="flex items-center">
                    {member?.permissions?.recordTime ? (
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-700">Record time</span>
                  </div>
                  <div className="flex items-center">
                    {member?.permissions?.editNotes ? (
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-700">Edit notes</span>
                  </div>
                  <div className="flex items-center">
                    {member?.permissions?.seePricing ? (
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-700">See pricing details</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Last active</span>
                  </div>
                  <span className="text-gray-500">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Jobs completed</span>
                  </div>
                  <span className="text-gray-500">12 this month</span>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-4 mt-4 bg-blue-50 text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center"
            >
              <Edit2 className="w-5 h-5 mr-2" />
              Edit Team Member
            </button>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TeamMemberDetail;
