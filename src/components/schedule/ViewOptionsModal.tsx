import React, { useState } from 'react';
import { Check, Search, ArrowLeft } from 'lucide-react';

interface ViewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (options: ViewOptionsState) => void;
  initialOptions: ViewOptionsState;
}

export interface ViewOptionsState {
  view: 'Day';
  showUnscheduledAppointments: boolean;
  showWeekends: boolean;
  selectedTeamMembers: string[];
}

const ViewOptionsModal: React.FC<ViewOptionsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialOptions
}) => {
  const [options, setOptions] = useState<ViewOptionsState>(initialOptions);
  const [searchTerm, setSearchTerm] = useState('');

  // Only the current user as a team member
  const teamMembers = [
    { id: '1', name: 'victor leite' }
  ];

  const handleViewSelect = (view: ViewOptionsState['view']) => {
    try {
    setOptions(prev => ({ ...prev, view }));
    // Auto-apply changes when selecting a view
    onApply({...options, view});
    } catch (error) {
      console.error("Error switching view:", error);
      // If there's an error, default to Day view which is more stable
      setOptions(prev => ({ ...prev, view: 'Day' }));
      onApply({...options, view: 'Day'});
    }
  };

  const toggleUnscheduledAppointments = () => {
    const newValue = !options.showUnscheduledAppointments;
    setOptions(prev => ({ 
      ...prev, 
      showUnscheduledAppointments: newValue
    }));
    // Auto-apply changes when toggling
    onApply({...options, showUnscheduledAppointments: newValue});
  };

  const toggleWeekends = () => {
    const newValue = !options.showWeekends;
    setOptions(prev => ({ 
      ...prev, 
      showWeekends: newValue
    }));
    // Auto-apply changes when toggling
    onApply({...options, showWeekends: newValue});
  };

  const toggleTeamMember = (memberId: string) => {
    const isSelected = options.selectedTeamMembers.includes(memberId);
    const newSelectedMembers = isSelected
      ? options.selectedTeamMembers.filter(id => id !== memberId)
      : [...options.selectedTeamMembers, memberId];
    
    setOptions(prev => ({
      ...prev,
      selectedTeamMembers: newSelectedMembers
    }));
    
    // Auto-apply changes when toggling team member
    onApply({...options, selectedTeamMembers: newSelectedMembers});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-full">
      {/* Header - using same style as PageHeader */}
      <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 pt-16 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <button 
              onClick={onClose} 
              className="mr-2 text-gray-600"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a2e35]">
              View Options
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {/* Toggle Options */}
        <div className="mt-6">
          <div className="flex items-center justify-between py-3 border-t">
            <p className="text-base text-gray-800">
              Show weekends on calendar
            </p>
            <button
              onClick={toggleWeekends}
              className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                options.showWeekends ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  options.showWeekends ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Team Members</h2>

          {/* Team Members List - Only showing current user */}
          <div>
            {teamMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3"
              >
                <p className="text-base text-gray-800">{member.name}</p>
                <button
                  onClick={() => toggleTeamMember(member.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    options.selectedTeamMembers.includes(member.id) 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                >
                  {options.selectedTeamMembers.includes(member.id) && (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* No Apply Button - Options apply automatically */}
    </div>
  );
};

export default ViewOptionsModal; 