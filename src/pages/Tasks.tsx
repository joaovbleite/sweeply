import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Search, Calendar, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { tasksApi } from "@/lib/api/tasks";
import { Task, TaskStatus, TaskPriority, TaskFilters } from "@/types/task";
import { format, isToday, isPast, addDays, isTomorrow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const Tasks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    due_date_from: '',
    due_date_to: '',
  });

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await tasksApi.getAll();
        setTasks(data);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Handle search and filtering
  const filteredTasks = tasks.filter(task => {
    // Search term filter
    const matchesSearch = 
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.client?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      filters.status?.length === 0 || 
      (filters.status?.includes(task.status));
    
    // Priority filter
    const matchesPriority = 
      filters.priority?.length === 0 || 
      (filters.priority?.includes(task.priority));
    
    // Due date filter
    const matchesDueDate = 
      (!filters.due_date_from || !task.due_date || task.due_date >= filters.due_date_from) &&
      (!filters.due_date_to || !task.due_date || task.due_date <= filters.due_date_to);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
  });

  // Apply filters
  const applyFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      due_date_from: '',
      due_date_to: '',
    });
  };

  // Get status icon and color
  const getStatusDetails = (status: TaskStatus) => {
    switch (status) {
      case 'open':
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { icon: <X className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' };
    }
  };

  // Get priority icon and color
  const getPriorityDetails = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-100 text-red-800' };
      case 'high':
        return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' };
      case 'medium':
        return { icon: null, color: 'bg-yellow-100 text-yellow-800' };
      case 'low':
        return { icon: null, color: 'bg-green-100 text-green-800' };
      default:
        return { icon: null, color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isPast(date)) {
      return `Overdue: ${format(date, 'MMM d')}`;
    } else {
      return format(date, 'MMM d');
    }
  };

  // Get due date color
  const getDueDateColor = (dateString?: string) => {
    if (!dateString) return 'text-gray-500';
    
    const date = new Date(dateString);
    
    if (isPast(date)) {
      return 'text-red-600 font-medium';
    } else if (isToday(date)) {
      return 'text-orange-600 font-medium';
    } else if (isTomorrow(date)) {
      return 'text-yellow-600';
    } else {
      return 'text-gray-600';
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus } 
          : task
      ));
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 min-h-screen bg-gray-50">
        {/* Header with Title and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <button
            onClick={() => navigate("/add-task")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <button className="bg-white border border-gray-300 p-3 rounded-xl flex items-center justify-center">
                <Filter className="h-6 w-6 text-gray-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filter Tasks</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down your tasks
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-6">
                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="space-y-2">
                    {(['open', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => (
                      <div key={status} className="flex items-center">
                        <Checkbox 
                          id={`status-${status}`}
                          checked={filters.status?.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              status: checked 
                                ? [...(prev.status || []), status]
                                : (prev.status || []).filter(s => s !== status)
                            }));
                          }}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="ml-2 text-sm font-medium text-gray-700"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Priority Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                  <div className="space-y-2">
                    {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                      <div key={priority} className="flex items-center">
                        <Checkbox 
                          id={`priority-${priority}`}
                          checked={filters.priority?.includes(priority)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              priority: checked 
                                ? [...(prev.priority || []), priority]
                                : (prev.priority || []).filter(p => p !== priority)
                            }));
                          }}
                        />
                        <label 
                          htmlFor={`priority-${priority}`}
                          className="ml-2 text-sm font-medium text-gray-700"
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Due Date Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">From</label>
                      <input 
                        type="date"
                        value={filters.due_date_from || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          due_date_from: e.target.value
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">To</label>
                      <input 
                        type="date"
                        value={filters.due_date_to || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          due_date_to: e.target.value
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <SheetFooter>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button 
                      className="flex-1"
                      onClick={() => applyFilters(filters)}
                    >
                      Apply Filters
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {(filters.status?.length > 0 || filters.priority?.length > 0 || filters.due_date_from || filters.due_date_to) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.status?.map(status => (
              <Badge key={status} variant="secondary" className="px-2 py-1">
                Status: {status.replace('_', ' ')}
                <button 
                  className="ml-1 hover:text-gray-700"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    status: prev.status?.filter(s => s !== status)
                  }))}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {filters.priority?.map(priority => (
              <Badge key={priority} variant="secondary" className="px-2 py-1">
                Priority: {priority}
                <button 
                  className="ml-1 hover:text-gray-700"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    priority: prev.priority?.filter(p => p !== priority)
                  }))}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {filters.due_date_from && (
              <Badge variant="secondary" className="px-2 py-1">
                From: {filters.due_date_from}
                <button 
                  className="ml-1 hover:text-gray-700"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    due_date_from: ''
                  }))}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.due_date_to && (
              <Badge variant="secondary" className="px-2 py-1">
                To: {filters.due_date_to}
                <button 
                  className="ml-1 hover:text-gray-700"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    due_date_to: ''
                  }))}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            <button 
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <div className="mt-2 flex justify-between items-center">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const statusDetails = getStatusDetails(task.status);
              const priorityDetails = getPriorityDetails(task.priority);
              
              return (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl shadow-sm cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                      <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                    </div>
                    
                    <span className={`text-sm ${getDueDateColor(task.due_date)} flex items-center`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDueDate(task.due_date)}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-2" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                      {task.description.length > 100 
                        ? `${task.description.substring(0, 100)}...` 
                        : task.description}
                    </p>
                  )}
                  
                  {task.client && (
                    <p className="text-gray-600 text-sm mb-2" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                      Client: {task.client.name}
                    </p>
                  )}
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusDetails.color}`}>
                        {statusDetails.icon}
                        {task.status.replace('_', ' ')}
                      </span>
                      
                      {task.priority !== 'medium' && (
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${priorityDetails.color}`}>
                          {priorityDetails.icon}
                          {task.priority}
                        </span>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-500 hover:text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        {task.status !== 'completed' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'in_progress' && task.status !== 'completed' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in_progress')}>
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'open' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'open')}>
                            Mark as Open
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'cancelled' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'cancelled')}>
                            Cancel Task
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No tasks found. Create your first task by clicking the + button.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tasks; 