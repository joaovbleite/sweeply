import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  DollarSign, 
  Clock,
  Settings, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Filter,
  Search,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesApi } from '@/lib/api/invoices';

interface Transaction {
  id: string;
  type: 'invoice' | 'expense' | 'payment';
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  client?: { id: string; name: string };
}

const Finance = () => {
  const { t } = useTranslation(['finance', 'common']);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Dummy data - in a real app this would come from the API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        
        // Mock data for demonstration
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'invoice',
            description: 'Window Cleaning Service',
            amount: 175.00,
            date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
            status: 'paid',
            client: { id: '101', name: 'John Smith' }
          },
          {
            id: '2',
            type: 'expense',
            description: 'Cleaning Supplies',
            amount: -45.50,
            date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
            status: 'paid'
          },
          {
            id: '3',
            type: 'payment',
            description: 'Invoice Payment #1005',
            amount: 250.00,
            date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
            status: 'paid',
            client: { id: '102', name: 'Sarah Johnson' }
          },
          {
            id: '4',
            type: 'invoice',
            description: 'Monthly House Cleaning',
            amount: 200.00,
            date: format(new Date(), 'yyyy-MM-dd'),
            status: 'pending',
            client: { id: '103', name: 'Michael Brown' }
          },
          {
            id: '5',
            type: 'expense',
            description: 'Gas for Company Vehicle',
            amount: -65.00,
            date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
            status: 'paid'
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, []);
  
  // Calculate summary stats
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netIncome = totalIncome + totalExpenses;
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  // Get transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'expense':
        return <DollarSign className="w-5 h-5 text-red-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-gray-50 pt-12">
        {/* Header with title and time period selector */}
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-2xl font-bold text-gray-800">Finance</h1>
          <div className="flex items-center gap-5">
            <button className="p-2">
              <CalendarIcon className="w-6 h-6 text-gray-800" />
            </button>
            <button className="p-2">
              <Settings className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
        
        {/* Time period selector */}
        <div className="bg-gray-100 rounded-lg mx-4 p-1.5 flex">
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${selectedPeriod === 'day' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setSelectedPeriod('day')}
          >
            Day
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${selectedPeriod === 'week' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${selectedPeriod === 'month' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`flex-1 py-3 rounded-md text-center font-medium ${selectedPeriod === 'year' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}`}
            onClick={() => setSelectedPeriod('year')}
          >
            Year
          </button>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Income</p>
            <p className="text-xl font-bold text-pulse-500">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Expenses</p>
            <p className="text-xl font-bold text-red-500">${Math.abs(totalExpenses).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Net</p>
            <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${netIncome.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="px-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 bg-white"
            />
          </div>
        </div>
        
        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto pb-20 mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="px-4 space-y-3">
              {transactions.map(transaction => (
                <div key={transaction.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 flex items-center">
                    <div className="mr-3">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                        <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </span>
                          <div className="flex items-center">
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 text-xs capitalize text-gray-500">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                        {transaction.client && (
                          <span className="text-gray-500">
                            {transaction.client.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-dark-900 mb-4">
                <DollarSign className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-700 text-lg mb-2 font-medium">No transactions found</p>
              <div className="flex gap-3">
                <Link
                  to="/invoices/new"
                  className="text-pulse-500 font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Invoice
                </Link>
                <Link
                  to="/expenses/new"
                  className="text-pulse-500 font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Expense
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Finance; 