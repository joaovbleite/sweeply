import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, X } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";

const AddExpense = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useLocale();
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    description: "",
    receipt: null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.amount) {
      toast.error("Please enter a title and amount");
      return;
    }

    // Mock submission - would be replaced with API call
    toast.success("Expense added successfully!");
    navigate("/finance?tab=expenses");
  };

  // Save button component for the header
  const SaveButton = (
    <button
      onClick={handleSubmit}
      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
    >
      Save
    </button>
  );

  return (
    <AppLayout>
      <PageHeader 
        title="New expense" 
        onBackClick={() => navigate(-1)}
        rightElement={SaveButton}
        compact
      />

      <div className="px-4 pt-3 pb-24 flex-1 overflow-y-auto bg-white">
        {/* Amount and Title Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What's this expense for?"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-2 bg-gray-100 -mx-4 px-4 mb-4"></div>
        
        {/* Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Category Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
          >
            <option value="">Select a category</option>
            <option value="supplies">Supplies</option>
            <option value="transportation">Transportation</option>
            <option value="equipment">Equipment</option>
            <option value="marketing">Marketing</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add any details about this expense"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-base"
            rows={3}
          />
        </div>

        {/* Receipt Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-2">Drag and drop a file or</p>
            <button className="text-blue-600 font-medium">Browse files</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddExpense; 