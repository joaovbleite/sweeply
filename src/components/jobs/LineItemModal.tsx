import React, { useState } from "react";
import { X, Plus, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";

interface LineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: { description: string; price: number }) => void;
}

const LineItemModal: React.FC<LineItemModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const { formatCurrency } = useLocale();

  // Predefined items - in a real implementation, these would come from an API
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

  // Handle custom item creation
  const handleAddCustomItem = () => {
    if (!customName.trim()) {
      return; // Don't allow empty names
    }
    
    const price = parseFloat(customPrice) || 0;
    onAddItem({ description: customName, price });
    onClose();
  };

  // Toggle custom form visibility
  const handleToggleCustomForm = () => {
    setShowCustomForm(!showCustomForm);
  };

  // Create the Add button for the header
  const AddButton = showCustomForm ? (
    <button 
      onClick={handleAddCustomItem}
      className="text-blue-600 font-medium"
      disabled={!customName.trim()}
    >
      Add
    </button>
  ) : (
    <button 
      onClick={handleToggleCustomForm}
      className="text-blue-600"
    >
      <Plus className="w-6 h-6" />
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* PageHeader component instead of custom header */}
      <PageHeader
        title={showCustomForm ? "Add custom item" : "Add line item"}
        onBackClick={showCustomForm ? () => setShowCustomForm(false) : onClose}
        rightElement={AddButton}
      />
      
      {showCustomForm ? (
        // Custom item form
        <div className="p-4 flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter item name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Item list */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div 
                  key={item.id}
                  className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => handleItemSelect(item)}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.description}</h3>
                    <p className="text-gray-500">{item.description === "Free Assessment" ? 
                      "Our experts will come to assess your property" : 
                      "Click to add this service"}</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No items found. Try a different search or add a custom item.
              </div>
            )}
            
            {/* Add custom item button at the bottom */}
            <div 
              className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={handleToggleCustomForm}
            >
              <div>
                <h3 className="text-lg font-medium text-blue-600">Add custom item</h3>
                <p className="text-gray-500">Create a new line item</p>
              </div>
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LineItemModal; 