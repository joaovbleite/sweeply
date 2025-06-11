import React, { useState } from "react";
import { ArrowLeft, Plus, UserCircle, Mail, Phone, ChevronRight, Calendar, UserCheck, Users, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";

// Mock data for team members
const MOCK_TEAM_MEMBERS = [
  {
    id: 1,
    name: "Emma Thompson",
    role: "Cleaner",
    email: "emma.t@example.com",
    phone: "+1 (555) 123-4567",
    avatar: null,
    performanceRating: 4.8,
    joinedDate: "2022-06-15"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Team Lead",
    email: "michael.r@example.com",
    phone: "+1 (555) 987-6543",
    avatar: null,
    performanceRating: 4.9,
    joinedDate: "2021-09-22"
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Cleaner",
    email: "sarah.j@example.com",
    phone: "+1 (555) 234-5678",
    avatar: null,
    performanceRating: 4.5,
    joinedDate: "2022-11-03"
  }
];

const Team: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  
  const [teamMembers] = useState(MOCK_TEAM_MEMBERS);
  const [activeTab, setActiveTab] = useState<'members' | 'performance' | 'schedule'>('members');
  
  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return (
          <div className="space-y-4 mt-4">
            {teamMembers.map(member => (
              <div 
                key={member.id} 
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pulse-100 text-pulse-500 rounded-full flex items-center justify-center font-semibold text-lg mr-3">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#1a2e35]">{member.name}</h3>
                    <p className="text-gray-500 text-sm">{member.role}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>
            ))}
            
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
          <div className="mt-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="py-8">
              <Star className="w-16 h-16 text-pulse-300 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Performance Reviews</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">Track employee performance and set goals with our simple review system.</p>
              <Link 
                to="/performance" 
                className="inline-flex items-center px-5 py-2.5 bg-pulse-500 text-white font-medium rounded-lg hover:bg-pulse-600 transition-colors"
              >
                View Performance
              </Link>
            </div>
          </div>
        );
        
      case 'schedule':
        return (
          <div className="mt-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="py-8">
              <Calendar className="w-16 h-16 text-pulse-300 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Team Schedule</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">Manage your team's availability and job assignments all in one place.</p>
              <Link 
                to="/schedule" 
                className="inline-flex items-center px-5 py-2.5 bg-pulse-500 text-white font-medium rounded-lg hover:bg-pulse-600 transition-colors"
              >
                View Schedule
              </Link>
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
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Use PageHeader component with add button */}
        <PageHeader
          title="Manage Team"
          onBackClick={() => navigate(-1)}
          rightElement={AddButton}
        />

        <div className="px-4 pb-36 pt-28">
          {/* Team Stats Summary */}
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2e35]">{teamMembers.length}</div>
              <div className="text-sm text-gray-500">Team Members</div>
            </div>
            <div className="h-10 border-l border-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2e35]">4.7</div>
              <div className="text-sm text-gray-500">Avg. Rating</div>
            </div>
            <div className="h-10 border-l border-gray-200"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2e35]">87%</div>
              <div className="text-sm text-gray-500">On-time</div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex rounded-lg bg-white border border-gray-200 shadow-sm mb-4 overflow-hidden">
            <button 
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'members' ? 'bg-pulse-50 text-pulse-500 border-b-2 border-pulse-500' : 'text-gray-600'}`}
              onClick={() => setActiveTab('members')}
            >
              <Users className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Members</span>
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'performance' ? 'bg-pulse-50 text-pulse-500 border-b-2 border-pulse-500' : 'text-gray-600'}`}
              onClick={() => setActiveTab('performance')}
            >
              <UserCheck className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Performance</span>
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'schedule' ? 'bg-pulse-50 text-pulse-500 border-b-2 border-pulse-500' : 'text-gray-600'}`}
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