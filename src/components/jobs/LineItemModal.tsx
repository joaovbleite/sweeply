import React, { useState } from "react";
import { X, Plus, Search } from "lucide-react";

interface LineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: { description: string; price: number }) => void;
}

const LineItemModal: React.FC<LineItemModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock predefined items
  const predefinedItems = [
    { id: 1, description: "Free Assessment", price: 0.00 },
    { id: 2, description: "Standard Cleaning", price: 150.00 },
    { id: 3, description: "Deep Cleaning", price: 250.00 },
    { id: 4, description: "Move-in/Move-out Cleaning", price: 300.00 },
    { id: 5, description: "Window Cleaning", price: 120.00 },
    { id: 6, description: "Carpet Cleaning", price: 180.00 },
  ];

  // Filter items based on search term
  const filteredItems = predefinedItems.filter(item => 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle item selection
  const handleItemSelect = (item: { id: number; description: string; price: number }) => {
    onAddItem({ description: item.description, price: item.price });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="p-2 mr-2 text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Add line item</h2>
        </div>
        <button className="text-green-600">
          <Plus className="w-6 h-6" />
        </button>
      </div>
      
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search line items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Item list */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="p-4 border-b border-gray-100 flex justify-between items-center"
            onClick={() => handleItemSelect(item)}
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900">{item.description}</h3>
              <p className="text-gray-500">{item.description === "Free Assessment" ? 
                "Our experts will come to assess your property" : 
                "Click to add this service"}</p>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineItemModal; 