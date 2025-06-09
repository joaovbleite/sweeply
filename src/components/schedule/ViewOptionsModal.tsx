import React, { useState } from 'react';
import { X, Check, Search, ArrowLeft } from 'lucide-react';

interface ViewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (options: ViewOptionsState) => void;
  initialOptions: ViewOptionsState;
}

export interface ViewOptionsState {
  view: 'Day' | 'List' | '3 Day' | 'Week' | 'Map';
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

  // Mock team members data - replace with actual data from your app
  const teamMembers = [
    { id: '1', name: 'victor leite' },
    { id: '2', name: 'John Doe' },
    { id: '3', name: 'Jane Smith' }
  ];

  const filteredTeamMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSelect = (view: ViewOptionsState['view']) => {
    setOptions(prev => ({ ...prev, view }));
  };

  const toggleUnscheduledAppointments = () => {
    setOptions(prev => ({ 
      ...prev, 
      showUnscheduledAppointments: !prev.showUnscheduledAppointments 
    }));
  };

  const toggleWeekends = () => {
    setOptions(prev => ({ 
      ...prev, 
      showWeekends: !prev.showWeekends 
    }));
  };

  const toggleTeamMember = (memberId: string) => {
    setOptions(prev => {
      const isSelected = prev.selectedTeamMembers.includes(memberId);
      
      return {
        ...prev,
        selectedTeamMembers: isSelected
          ? prev.selectedTeamMembers.filter(id => id !== memberId)
          : [...prev.selectedTeamMembers, memberId]
      };
    });
  };

  const handleDeselectAll = () => {
    setOptions(prev => ({ ...prev, selectedTeamMembers: [] }));
  };

  const handleApply = () => {
    onApply(options);
    onClose();
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
        {/* View Section */}
        <div className="mt-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">View</h2>
          <div className="bg-gray-100 rounded-full p-1 flex">
            {['Day', 'List', '3 Day', 'Week', 'Map'].map((view) => (
              <button
                key={view}
                className={`flex-1 py-2 rounded-full text-center text-sm ${
                  options.view === view 
                    ? 'bg-white shadow-sm font-medium text-gray-800' 
                    : 'text-gray-600'
                }`}
                onClick={() => handleViewSelect(view as ViewOptionsState['view'])}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="mt-6">
          <div className="flex items-center justify-between py-3">
            <p className="text-base text-gray-800">
              Show unscheduled appointments on map view
            </p>
            <button
              onClick={toggleUnscheduledAppointments}
              className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                options.showUnscheduledAppointments ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  options.showUnscheduledAppointments ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <p className="text-base text-gray-800">
              Show weekends on week view
            </p>
            <button
              onClick={toggleWeekends}
              className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                options.showWeekends ? 'bg-green-600' : 'bg-gray-300'
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
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Selected count and Deselect */}
          <div className="flex justify-between items-center mb-3">
            <p className="text-base font-bold text-gray-800">
              {options.selectedTeamMembers.length} selected
            </p>
            <button
              onClick={handleDeselectAll}
              className="text-base font-medium text-green-600"
            >
              Deselect all
            </button>
          </div>

          {/* Team Members List */}
          <div className="space-y-1">
            {filteredTeamMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 border-t"
              >
                <p className="text-base text-gray-800">{member.name}</p>
                <button
                  onClick={() => toggleTeamMember(member.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    options.selectedTeamMembers.includes(member.id) 
                      ? 'bg-green-600 text-white' 
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

      {/* Apply Button */}
      <div className="border-t p-4">
        <button
          onClick={handleApply}
          className="w-full py-3 bg-green-600 text-white text-base font-medium rounded-lg"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ViewOptionsModal; 