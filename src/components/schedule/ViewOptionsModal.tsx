import React, { useState } from 'react';
import { X, Check, Search } from 'lucide-react';

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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">View Options</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* View Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">View</h2>
          <div className="bg-gray-100 rounded-full p-1.5 flex">
            {['Day', 'List', '3 Day', 'Week', 'Map'].map((view) => (
              <button
                key={view}
                className={`flex-1 py-2.5 rounded-full text-center text-lg ${
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
        <div className="mt-8">
          <div className="flex items-center justify-between py-4">
            <p className="text-lg text-gray-800">
              Show unscheduled appointments on map view
            </p>
            <button
              onClick={toggleUnscheduledAppointments}
              className={`w-16 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                options.showUnscheduledAppointments ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  options.showUnscheduledAppointments ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4 border-t">
            <p className="text-lg text-gray-800">
              Show weekends on week view
            </p>
            <button
              onClick={toggleWeekends}
              className={`w-16 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                options.showWeekends ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  options.showWeekends ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Members</h2>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Selected count and Deselect */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-bold text-gray-800">
              {options.selectedTeamMembers.length} selected
            </p>
            <button
              onClick={handleDeselectAll}
              className="text-lg font-medium text-green-600"
            >
              Deselect all
            </button>
          </div>

          {/* Team Members List */}
          <div className="space-y-2">
            {filteredTeamMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between py-4 border-t"
              >
                <p className="text-lg text-gray-800">{member.name}</p>
                <button
                  onClick={() => toggleTeamMember(member.id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    options.selectedTeamMembers.includes(member.id) 
                      ? 'bg-green-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                >
                  {options.selectedTeamMembers.includes(member.id) && (
                    <Check className="w-6 h-6" />
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
          className="w-full py-4 bg-green-600 text-white text-lg font-medium rounded-lg"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ViewOptionsModal; 