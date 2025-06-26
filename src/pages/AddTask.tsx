import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Users, Calendar, User, AlertTriangle, Flag, Clock, CheckCircle, X, Search, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";
import { tasksApi } from "@/lib/api/tasks";
import { clientsApi } from "@/lib/api/clients";
import { Client } from "@/types/client";
import { CreateTaskInput, TaskPriority, TaskStatus } from "@/types/task";
import { format, addDays, isToday } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

const AddTask = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Team members (would be fetched from API in a real implementation)
  const teamMembers = [
    { id: "1", name: "Victor Leite", role: "Owner", avatar: "" },
    { id: "2", name: "Jane Smith", role: "Manager", avatar: "" },
    { id: "3", name: "John Doe", role: "Cleaner", avatar: "" },
  ];

  const [formData, setFormData] = useState<CreateTaskInput>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    due_date: "",
    client_id: "",
    assignee_id: "",
  });

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsApi.getAll();
        setClients(data);
      } catch (error) {
        console.error("Error loading clients:", error);
        toast.error("Failed to load clients");
      }
    };

    loadClients();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientSelect = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client_id: client.id
    }));
    setShowClientSelector(false);
  };

  const handleTeamMemberSelect = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignee_id: memberId
    }));
    setShowTeamSelector(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title) {
      toast.error("Task title is required");
      return;
    }

    try {
      setSaving(true);
      await tasksApi.create(formData);
      toast.success("Task created successfully!");
      navigate("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  // Get selected client
  const selectedClient = clients.find(client => client.id === formData.client_id);
  
  // Get selected team member
  const selectedTeamMember = teamMembers.find(member => member.id === formData.assignee_id);

  // Format due date for display
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "Select due date";
    
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return "Today";
    }
    
    return format(date, "MMM d, yyyy");
  };

  // Get priority details
  const getPriorityDetails = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return { 
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />, 
          label: "Urgent", 
          color: "text-red-600" 
        };
      case 'high':
        return { 
          icon: <Flag className="h-4 w-4 text-orange-600" />, 
          label: "High", 
          color: "text-orange-600" 
        };
      case 'medium':
        return { 
          icon: <Flag className="h-4 w-4 text-yellow-600" />, 
          label: "Medium", 
          color: "text-yellow-600" 
        };
      case 'low':
        return { 
          icon: <Flag className="h-4 w-4 text-green-600" />, 
          label: "Low", 
          color: "text-green-600" 
        };
      default:
        return { 
          icon: <Flag className="h-4 w-4 text-yellow-600" />, 
          label: "Medium", 
          color: "text-yellow-600" 
        };
    }
  };

  // Get status details
  const getStatusDetails = (status: TaskStatus) => {
    switch (status) {
      case 'open':
        return { 
          icon: <Clock className="h-4 w-4 text-blue-600" />, 
          label: "Open", 
          color: "text-blue-600" 
        };
      case 'in_progress':
        return { 
          icon: <Clock className="h-4 w-4 text-yellow-600" />, 
          label: "In Progress", 
          color: "text-yellow-600" 
        };
      case 'completed':
        return { 
          icon: <CheckCircle className="h-4 w-4 text-green-600" />, 
          label: "Completed", 
          color: "text-green-600" 
        };
      case 'cancelled':
        return { 
          icon: <X className="h-4 w-4 text-gray-600" />, 
          label: "Cancelled", 
          color: "text-gray-600" 
        };
      default:
        return { 
          icon: <Clock className="h-4 w-4 text-blue-600" />, 
          label: "Open", 
          color: "text-blue-600" 
        };
    }
  };

  // Filtered clients for search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Save button component for the header
  const SaveButton = (
    <button
      onClick={handleSubmit}
      disabled={saving}
      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
    >
      {saving ? "Saving..." : "Save"}
    </button>
  );

  return (
    <AppLayout hideBottomNav>
      <PageHeader 
        title="New Task" 
        onBackClick={() => navigate(-1)}
        rightElement={SaveButton}
      />

      <div className="px-4 pt-3 pb-24 flex-1 overflow-y-auto bg-white">
        {/* Title and Description Fields */}
        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Title"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
          />
          
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Description"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            rows={3}
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Status</label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
                className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 block mb-1">Priority</label>
            <div className="relative">
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as TaskPriority)}
                className="w-full p-4 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-2 bg-gray-100 -mx-4 px-4 mb-3"></div>
        
        {/* Client Section */}
        <div className="flex items-center justify-between py-3 mb-2">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-base font-medium text-gray-800">Client</h3>
          </div>
          
          <Sheet open={showClientSelector} onOpenChange={setShowClientSelector}>
            <SheetTrigger asChild>
              <button className="text-blue-600">
                {selectedClient ? (
                  <span className="text-gray-800">{selectedClient.name}</span>
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Select Client</SheetTitle>
              </SheetHeader>
              
              <div className="py-4">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-5 w-5" />
                </div>
                
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="font-medium">{client.name}</div>
                        {client.email && <div className="text-sm text-gray-600">{client.email}</div>}
                        {client.phone && <div className="text-sm text-gray-600">{client.phone}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No clients found
                    </div>
                  )}
                </div>
              </div>
              
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Separator */}
        <div className="w-full h-2 bg-gray-100 -mx-4 px-4 mb-3"></div>

        {/* Schedule Section */}
        <h2 className="text-base text-gray-700 font-medium mb-3">Schedule</h2>
        
        {/* Due Date Selection */}
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <div className="border border-gray-300 rounded-lg p-3 flex items-center cursor-pointer">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-800">Due Date</h3>
                  <p className="text-base text-gray-800">
                    {formatDueDate(formData.due_date)}
                  </p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                <h4 className="font-medium">Select Due Date</h4>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const today = new Date();
                      handleInputChange('due_date', format(today, 'yyyy-MM-dd'));
                    }}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const tomorrow = addDays(new Date(), 1);
                      handleInputChange('due_date', format(tomorrow, 'yyyy-MM-dd'));
                    }}
                  >
                    Tomorrow
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const nextWeek = addDays(new Date(), 7);
                      handleInputChange('due_date', format(nextWeek, 'yyyy-MM-dd'));
                    }}
                  >
                    Next Week
                  </Button>
                  <input
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <Button 
                    variant="ghost"
                    onClick={() => handleInputChange('due_date', '')}
                  >
                    No Due Date
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Team Section */}
        <div className="flex items-center justify-between py-3 mb-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-base font-medium text-gray-800">Assignee</h3>
              <p className="text-base text-gray-800">
                {selectedTeamMember?.name || "Unassigned"}
              </p>
            </div>
          </div>
          
          <Sheet open={showTeamSelector} onOpenChange={setShowTeamSelector}>
            <SheetTrigger asChild>
              <button className="text-blue-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Assign To Team Member</SheetTitle>
              </SheetHeader>
              
              <div className="py-4 space-y-3">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => handleTeamMemberSelect(member.id)}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.role}</div>
                    </div>
                    {formData.assignee_id === member.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                <div
                  onClick={() => handleTeamMemberSelect("")}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="font-medium">Unassigned</div>
                  {formData.assignee_id === "" && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Done
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTask; 