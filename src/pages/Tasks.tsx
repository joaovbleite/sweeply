import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Search } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const Tasks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dummy task data
  const tasks = [
    { id: 1, title: "Complete website design", client: "ABC Company", dueDate: "2023-07-15", status: "open" },
    { id: 2, title: "Review marketing materials", client: "XYZ Corp", dueDate: "2023-07-18", status: "open" },
    { id: 3, title: "Prepare client presentation", client: "123 Industries", dueDate: "2023-07-20", status: "open" },
  ];

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="bg-white p-4 rounded-xl shadow-sm cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                  <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                </div>
                <p className="text-gray-600">{task.client}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
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