import React, { useState, useEffect } from "react";
import { X, Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLocale } from "@/hooks/useLocale";
import { serviceTypesApi, ServiceType } from "@/lib/api/service-types";

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
  const [selectedItem, setSelectedItem] = useState<{ id: string; description: string; price: number } | null>(null);
  const [customizedPrice, setCustomizedPrice] = useState("");
  const { formatCurrency } = useLocale();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch service types from API
  useEffect(() => {
    const fetchServiceTypes = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const types = await serviceTypesApi.getServiceTypes();
          setServiceTypes(types);
        } catch (error) {
          console.error('Error loading service types:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServiceTypes();
  }, [isOpen]);

  // Filter items based on search term
  const filteredItems = serviceTypes.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle item selection
  const handleItemSelect = (item: ServiceType) => {
    setSelectedItem({
      id: item.id,
      description: item.name,
      price: item.default_price
    });
    setCustomizedPrice(item.default_price.toString());
  };

  // Handle adding selected item with customized price
  const handleAddSelectedItem = () => {
    if (selectedItem) {
      const price = parseFloat(customizedPrice) || selectedItem.price;
      onAddItem({ description: selectedItem.description, price });
      onClose();
      // Reset state
      setSelectedItem(null);
      setCustomizedPrice("");
    }
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
    setSelectedItem(null); // Clear selected item when toggling forms
  };

  // Handle discarding a service
  const handleDiscardService = () => {
    setSelectedItem(null);
    setCustomizedPrice("");
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
  ) : selectedItem ? (
    <button 
      onClick={handleAddSelectedItem}
      className="text-blue-600 font-medium"
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
      {/* Fixed header at the top */}
      <div className="sticky top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button 
              onClick={() => {
                if (selectedItem) {
                  setSelectedItem(null);
                  setCustomizedPrice("");
                } else if (showCustomForm) {
                  setShowCustomForm(false);
                } else {
                  onClose();
                }
              }}
              className="p-2 mr-2 text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {showCustomForm ? "Add custom item" : selectedItem ? "Customize service" : "Services"}
            </h1>
          </div>
          {AddButton}
        </div>
      </div>
      
      {showCustomForm ? (
        // Custom item form
        <div className="p-4 flex-1 overflow-y-auto pt-2 pb-safe" style={{ maxHeight: 'calc(100vh - 70px)' }}>
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
      ) : selectedItem ? (
        // Customize service form for selected item
        <div className="p-4 flex-1 overflow-y-auto pt-2 pb-safe" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item name
              </label>
              <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedItem.description}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-900 font-medium">$</span>
                </div>
                <input
                  type="number"
                  value={customizedPrice}
                  onChange={(e) => setCustomizedPrice(e.target.value)}
                  placeholder={selectedItem.price.toString()}
                  step="0.01"
                  min="0"
                  className="w-full p-4 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium text-gray-900"
                />
              </div>
            </div>
            
            <button
              onClick={handleDiscardService}
              className="w-full mt-4 p-4 border border-red-500 text-red-500 rounded-lg flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Service
            </button>
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
                placeholder="Search services"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Item list - with fixed height and proper scrolling */}
          <div className="flex-1 overflow-y-auto pb-safe" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div 
                  key={item.id}
                  className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => handleItemSelect(item)}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="text-gray-500">Click to add this service</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 mr-2">
                      {formatCurrency(item.default_price)}
                    </span>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No services found. Try a different search or add a custom item.
              </div>
            )}
            
            {/* Add custom item button at the bottom */}
            <div 
              className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={handleToggleCustomForm}
            >
              <div>
                <h3 className="text-lg font-medium text-blue-600">Add custom item</h3>
                <p className="text-gray-500">Create a new service</p>
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