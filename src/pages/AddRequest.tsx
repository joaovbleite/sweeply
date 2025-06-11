import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Download, Search, User, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";

const AddRequest = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  
  const [formData, setFormData] = useState({
    title: "",
    requestType: "",
    clientId: "",
    dueDate: new Date().toISOString().split('T')[0],
    description: "",
    priority: "medium"
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title) {
      toast.error("Request title is required");
      return;
    }

    // Mock submission - would be replaced with API call
    toast.success("Request created successfully!");
    navigate("/requests");
  };

  // Save button component for the header
  const SaveButton = (
    <button
      onClick={handleSubmit}
      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
    >
      Submit
    </button>
  );

  return (
    <AppLayout>
      <PageHeader 
        title="New request" 
        onBackClick={() => navigate(-1)}
        rightElement={SaveButton}
        compact
      />

      <div className="px-4 pt-3 pb-24 flex-1 overflow-y-auto bg-white">
        {/* Title Field */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What are you requesting?"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Client Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients"
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-2 bg-gray-100 -mx-4 px-4 mb-4"></div>

        {/* Request Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
          <select
            value={formData.requestType}
            onChange={(e) => handleInputChange('requestType', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
          >
            <option value="">Select a type</option>
            <option value="information">Information Request</option>
            <option value="quote">Quote Request</option>
            <option value="schedule">Schedule Change</option>
            <option value="complaint">Complaint</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Due Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Priority Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('priority', 'low')}
              className={`p-3 rounded-lg border ${
                formData.priority === 'low'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              Low
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('priority', 'medium')}
              className={`p-3 rounded-lg border ${
                formData.priority === 'medium'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('priority', 'high')}
              className={`p-3 rounded-lg border ${
                formData.priority === 'high'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              High
            </button>
          </div>
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide details about your request"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            rows={5}
          />
        </div>

        {/* Attachments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Download className="mx-auto w-10 h-10 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-2">Drag and drop files here or</p>
            <button className="text-blue-600 font-medium">Browse files</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddRequest; 