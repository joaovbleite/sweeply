import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, UserCircle, Mail, Phone, ChevronRight, Calendar, UserCheck, Users, Star, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { teamManagementApi, TeamMember, TeamInvitation } from "@/lib/api/team-management";

const Team: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'performance' | 'schedule'>('members');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    avgRating: 0,
    onTimePercentage: 0
  });
  
  // Load team data
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        
        // Load team members
        const members = await teamManagementApi.getTeamMembers();
        setTeamMembers(members);
        
        // Load pending invitations
        const invitations = await teamManagementApi.getPendingInvitations();
        setPendingInvitations(invitations);
        
        // Load team stats
        const teamStats = await teamManagementApi.getTeamStats();
        setStats({
          totalMembers: teamStats.activeMembers,
          avgRating: 4.7, // Placeholder until we implement actual ratings
          onTimePercentage: 87 // Placeholder until we implement actual metrics
        });
      } catch (error: any) {
        console.error("Error loading team data:", error);
        toast.error("Failed to load team data: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamData();
  }, []);
  
  // Helper to get initials from name
  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Handle canceling an invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await teamManagementApi.cancelInvitation(invitationId);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      toast.success("Invitation cancelled successfully");
    } catch (error: any) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation: " + error.message);
    }
  };
  
  // Handle resending an invitation
  const handleResendInvitation = async (invitationId: string) => {
    try {
      await teamManagementApi.resendInvitation(invitationId);
      toast.success("Invitation resent successfully");
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation: " + error.message);
    }
  };
  
  // Render different content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }
    
    switch (activeTab) {
      case 'members':
        return (
          <div className="space-y-4 mt-4">
            {/* Active Team Members */}
            {teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <Link 
                key={member.id} 
                  to={`/team/member/${member.id}`}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm block"
              >
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-semibold text-lg mr-3">
                      {getInitials(member.member_name)}
                  </div>
                  <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[#1a2e35]">{member.member_name || 'Team Member'}</h3>
                      <p className="text-gray-500 text-sm capitalize">{member.role}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="truncate">{member.member_email || 'No email'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Team Members Yet</h3>
                <p className="text-gray-500 mb-6">Add your first team member to get started.</p>
              </div>
            )}
            
            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Invitations</h3>
                {pendingInvitations.map(invitation => (
                  <div 
                    key={invitation.id} 
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center font-semibold text-lg mr-3">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#1a2e35]">{invitation.email}</h3>
                        <p className="text-gray-500 text-sm capitalize">{invitation.role} (Pending)</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                      <div className="text-sm text-gray-600">
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                      <div className="space-x-4">
                        <button 
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="text-blue-600 text-sm font-medium"
                        >
                          Resend
                        </button>
                        <button 
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Team Member Button */}
            <Link 
              to="/team/add" 
              className="flex items-center justify-center py-4 mt-4 bg-blue-50 text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Team Member
            </Link>
          </div>
        );
        
      case 'performance':
        return (
          <div className="mt-4 space-y-4">
            {/* Performance Summary */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Performance</h3>
              
              {teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                          {getInitials(member.member_name)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{member.member_name || 'Team Member'}</h4>
                          <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium mr-2">
                          4.8
                        </div>
                        <Link to={`/team/member/${member.id}/performance`}>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Add team members to track performance</p>
                </div>
              )}
            </div>
            
            {/* Performance Metrics */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">On-Time Completion</h4>
                  <p className="text-2xl font-bold text-green-600">87%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Client Satisfaction</h4>
                  <p className="text-2xl font-bold text-blue-600">4.7/5</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Tasks Completed</h4>
                  <p className="text-2xl font-bold text-purple-600">124</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-1">Avg Response Time</h4>
                  <p className="text-2xl font-bold text-orange-600">1.2h</p>
                </div>
              </div>
              
              <Link 
                to="/team-analytics" 
                className="mt-4 w-full py-3 bg-blue-50 text-blue-600 font-medium rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                View Detailed Analytics
              </Link>
            </div>
          </div>
        );
        
      case 'schedule':
        return (
          <div className="mt-4 space-y-4">
            {/* Team Schedule View */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Schedule</h3>
              
              {teamMembers.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">Today's Schedule</h4>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                  </div>
                  
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                          {getInitials(member.member_name)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{member.member_name || 'Team Member'}</h4>
                          <p className="text-sm text-gray-500">
                            {Math.random() > 0.5 ? (
                              <span className="text-green-600">Available</span>
                            ) : (
                              <span className="text-orange-600">Assigned (2 jobs)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Link to="/calendar">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  ))}
                  
                  <Link 
                    to="/calendar" 
                    className="mt-4 w-full py-3 bg-blue-50 text-blue-600 font-medium rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    View Full Calendar
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Add team members to manage schedules</p>
                </div>
              )}
            </div>
            
            {/* Schedule Management */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Schedule Management</h3>
              <div className="space-y-3">
                <Link 
                  to="/calendar" 
                  className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Team Calendar</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link 
                  to="/jobs" 
                  className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Job Assignments</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              <Link 
                  to="/settings" 
                  className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                  <span className="font-medium">Schedule Settings</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Create the add button for the header
  const AddButton = (
    <Link 
      to="/team/add"
      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
    >
      <Plus className="w-6 h-6" />
    </Link>
  );
  
  return (
    <AppLayout hideBottomNav>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Use PageHeader component with add button */}
        <PageHeader
          title="Manage Team"
          onBackClick={() => navigate(-1)}
          rightElement={AddButton}
          compact
        />

        <div className="px-4 pb-36 pt-28">
          {/* Team Stats Summary */}
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2e35]">{stats.totalMembers}</div>
              <div className="text-sm text-gray-500">Team Members</div>
            </div>
            <div className="h-10 border-l border-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2e35]">{stats.avgRating}</div>
              <div className="text-sm text-gray-500">Avg. Rating</div>
            </div>
            <div className="h-10 border-l border-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2e35]">{stats.onTimePercentage}%</div>
              <div className="text-sm text-gray-500">On-time</div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex rounded-lg bg-white border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <button 
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'members' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('members')}
            >
              <Users className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Members</span>
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'performance' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('performance')}
            >
              <UserCheck className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Performance</span>
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'schedule' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Schedule</span>
            </button>
          </div>
          
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  );
};

export default Team; 