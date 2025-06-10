import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { teamManagementApi, CreateInvitationData } from "@/lib/api/team-management";

const AddTeamMember = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Worker type - this could be expanded with more types
  const [workerType, setWorkerType] = useState<'cleaner' | 'manager' | 'admin' | 'viewer'>('cleaner');
  
  // Permissions
  const [permissions, setPermissions] = useState({
    viewSchedule: true,
    viewClientDetails: true,
    recordTime: true,
    editNotes: true,
    seePricing: false
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddFromContacts = () => {
    // This would connect to the device's contacts
    toast.info("Contact integration would open here");
  };

  const handleSaveUser = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      // Format permissions for the API
      const permissionsData = {
        viewSchedule: permissions.viewSchedule,
        viewClientDetails: permissions.viewClientDetails,
        recordTime: permissions.recordTime,
        editNotes: permissions.editNotes,
        seePricing: permissions.seePricing
      };

      // Create the invitation data
      const invitationData: CreateInvitationData = {
        email: email,
        role: workerType,
        invitation_message: `You've been invited to join the team as a ${workerType}.`,
        permissions: permissionsData
      };

      // Create the invitation
      await teamManagementApi.createInvitation(invitationData);
      
      toast.success("Team member invitation sent successfully");
      navigate("/team");
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header styled to match the screenshot while using PageHeader */}
        <div className="bg-white shadow-sm">
          <div className="px-4 py-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3"
              aria-label="Back"
            >
              <X className="w-6 h-6 text-[#1a2e35]" />
            </button>
            <h1 className="text-xl font-bold text-[#1a2e35]">Add new user</h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-5">
          {/* Add from contacts button - blue */}
          <button
            onClick={handleAddFromContacts}
            className="w-full py-4 px-4 border border-gray-300 rounded-lg flex items-center justify-center text-blue-600 font-medium"
          >
            <User className="mr-2 w-5 h-5" />
            Add From Contacts
          </button>

          {/* Form fields */}
          <div className="space-y-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full py-4 px-4 border border-gray-300 rounded-lg text-gray-700 text-lg"
            />
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full py-4 px-4 border border-gray-300 rounded-lg text-gray-700 text-lg"
              required
            />
            
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Mobile phone number"
              className="w-full py-4 px-4 border border-gray-300 rounded-lg text-gray-700 text-lg"
            />
          </div>

          {/* Permissions Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-[#1a2e35]">Permissions</h2>
            
            <h3 className="text-xl font-bold text-[#1a2e35] mt-4 mb-2">Limited Worker</h3>
            
            <p className="text-gray-600 mb-4">
              User will be sent an invitation to join your Sweeply account. Once accepted, they will be able to login with the following permissions.
            </p>

            {/* Permission items - blue checkmarks */}
            <div className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <span className="text-lg text-gray-700">View their schedule and mark work complete</span>
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <span className="text-lg text-gray-700">View client details for their assigned work</span>
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <span className="text-lg text-gray-700">View and record their time</span>
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <span className="text-lg text-gray-700">View and edit notes</span>
                <button 
                  onClick={() => togglePermission('editNotes')}
                  className="focus:outline-none"
                >
                  {permissions.editNotes ? (
                    <Check className="w-6 h-6 text-blue-600" />
                  ) : (
                    <X className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <span className="text-lg text-gray-700">Cannot see pricing details</span>
                <button 
                  onClick={() => togglePermission('seePricing')}
                  className="focus:outline-none"
                >
                  {!permissions.seePricing ? (
                    <Check className="w-6 h-6 text-blue-600" />
                  ) : (
                    <X className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 mt-6">
              To modify permissions further, visit the Manage Team settings page in Sweeply Online
            </p>
          </div>

          {/* Save Button - blue */}
          <button
            onClick={handleSaveUser}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors mt-8"
          >
            {isLoading ? "Saving..." : "Save New User"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTeamMember; 