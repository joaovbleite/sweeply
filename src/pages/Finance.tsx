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
  Plus,
  BarChart3,
  ReceiptText,
  CircleDollarSign,
  LayoutDashboard,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesApi } from '@/lib/api/invoices';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLocale } from '@/hooks/useLocale';
import { ChartContainer } from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

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
  const { formatCurrency } = useLocale();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  
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
        {/* Header with title and tabs */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-4">
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
          
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="dashboard" className="flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-1">
                <Receipt className="w-4 h-4" />
                <span>Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Invoices</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab Content */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Time period selector */}
              <div className="bg-gray-100 rounded-lg mx-0 p-1.5 flex">
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
              <div className="grid grid-cols-3 gap-3">
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
              
              {/* Dashboard Widget - Income vs Expenses Chart */}
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Income vs Expenses</h2>
                <div className="h-64">
                  {/* Placeholder for chart */}
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                    Income vs Expenses Chart will be displayed here
                  </div>
                </div>
              </div>
              
              {/* Recent Transactions */}
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Transactions</h2>
                  <Link to="/finance?tab=transactions" className="text-pulse-500 text-sm">View All</Link>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map(transaction => (
                      <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                  <div className="flex flex-col items-center justify-center h-40">
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
            </TabsContent>
            
            {/* Reports Tab Content */}
            <TabsContent value="reports" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Financial Reports</h2>
                  <div className="flex gap-2">
                    <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5">
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="this_quarter">This Quarter</option>
                      <option value="this_year">This Year</option>
                      <option value="last_year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-sm">
                      Export
                    </button>
                  </div>
                </div>
                
                {/* Revenue Trends Chart */}
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-3">Revenue Trends</h3>
                  <div className="h-64 bg-gray-50 rounded-lg p-4">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Revenue chart showing monthly income trends
                    </div>
                  </div>
                </div>
                
                {/* Income Breakdown */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-3">Income Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 h-64">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pie chart showing income by service type
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3">Top Revenue Sources</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm">Regular Cleaning</span>
                          </div>
                          <span className="text-sm font-medium">$2,450.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm">Deep Cleaning</span>
                          </div>
                          <span className="text-sm font-medium">$1,850.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-sm">Window Cleaning</span>
                          </div>
                          <span className="text-sm font-medium">$1,200.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm">Move-in/Move-out</span>
                          </div>
                          <span className="text-sm font-medium">$950.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm">Other Services</span>
                          </div>
                          <span className="text-sm font-medium">$750.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expense Analysis */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-3">Expense Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3">Expense Categories</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                            <span className="text-sm">Supplies</span>
                          </div>
                          <span className="text-sm font-medium">$650.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-sm">Transportation</span>
                          </div>
                          <span className="text-sm font-medium">$450.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                            <span className="text-sm">Equipment</span>
                          </div>
                          <span className="text-sm font-medium">$350.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                            <span className="text-sm">Marketing</span>
                          </div>
                          <span className="text-sm font-medium">$250.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                            <span className="text-sm">Other</span>
                          </div>
                          <span className="text-sm font-medium">$200.00</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 h-64">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Bar chart showing monthly expense trends
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profit Margin Analysis */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-3">Profit Margin Analysis</h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-64">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Line chart showing profit margin trends over time
                    </div>
                  </div>
                </div>
                
                {/* Financial KPIs */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-3">Key Financial Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Gross Profit Margin</p>
                      <p className="text-xl font-bold text-gray-800">68.5%</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+2.3%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Avg. Invoice Value</p>
                      <p className="text-xl font-bold text-gray-800">$175.40</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+5.8%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Monthly Revenue</p>
                      <p className="text-xl font-bold text-gray-800">$7,250</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+12.4%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Overdue Payments</p>
                      <p className="text-xl font-bold text-gray-800">$850</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 text-red-500 mr-1 rotate-180" />
                        <span className="text-xs text-red-500">+15.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Expenses Tab Content */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Expense Management</h2>
                  <button className="px-4 py-2 bg-pulse-500 text-white rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                </div>
                
                {/* Expense Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <p className="text-xl font-bold text-gray-800">$1,950.00</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Top Category</p>
                    <p className="text-xl font-bold text-gray-800">Supplies</p>
                    <p className="text-xs text-gray-500 mt-1">$650.00 (33.3%)</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Expense Trend</p>
                    <p className="text-xl font-bold text-gray-800">-8.5%</p>
                    <p className="text-xs text-gray-500 mt-1">vs last month</p>
                  </div>
                </div>
                
                {/* Expense Categories & Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="px-3 py-1.5 bg-pulse-100 text-pulse-700 rounded-full text-sm font-medium">
                    All Categories
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Supplies
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Transportation
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Equipment
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Marketing
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Other
                  </button>
                </div>
                
                {/* Search and Filter */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 bg-white"
                    />
                  </div>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                  </select>
                </div>
                
                {/* Expense List */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Cleaning Supplies</div>
                          <div className="text-sm text-gray-500">Restocking general cleaning supplies</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Supplies
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 15, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          -$245.50
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Gas for Company Vehicle</div>
                          <div className="text-sm text-gray-500">Weekly refuel for service van</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Transportation
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 12, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          -$85.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">New Vacuum Cleaner</div>
                          <div className="text-sm text-gray-500">Replacement for team 2</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Equipment
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 10, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          -$199.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Facebook Ads</div>
                          <div className="text-sm text-gray-500">Spring cleaning promotion</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Marketing
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 8, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          -$120.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Office Rent</div>
                          <div className="text-sm text-gray-500">Monthly rent payment</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Other
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 1, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          -$850.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">12</span> expenses
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700">
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg bg-pulse-500 text-white">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700">
                      3
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Invoices Tab Content */}
            <TabsContent value="invoices" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Invoice Management</h2>
                  <div className="flex gap-2">
                    <Link
                      to="/invoices"
                      className="px-4 py-2 border border-pulse-500 text-pulse-500 bg-white rounded-lg flex items-center gap-2"
                    >
                      View All Invoices
                    </Link>
                    <Link
                      to="/invoices/new"
                      className="px-4 py-2 bg-pulse-500 text-white rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Invoice
                    </Link>
                  </div>
                </div>
                
                {/* Invoice Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Invoices</p>
                    <p className="text-xl font-bold text-gray-800">24</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Paid</p>
                    <p className="text-xl font-bold text-green-600">$5,250.00</p>
                    <p className="text-xs text-gray-500 mt-1">18 invoices</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-xl font-bold text-blue-600">$1,750.00</p>
                    <p className="text-xs text-gray-500 mt-1">4 invoices</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-xl font-bold text-red-600">$850.00</p>
                    <p className="text-xs text-gray-500 mt-1">2 invoices</p>
                  </div>
                </div>
                
                {/* Recent Invoices */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium">Recent Invoices</h3>
                    <Link to="/invoices" className="text-pulse-500 text-sm">View All</Link>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            INV-2023-0024
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Michael Brown
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            $350.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Sent
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Jun 15, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/invoices/inv-123`} className="text-pulse-600 hover:text-pulse-900">
                              View
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            INV-2023-0023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Sarah Johnson
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            $450.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Paid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Jun 10, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/invoices/inv-456`} className="text-pulse-600 hover:text-pulse-900">
                              View
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            INV-2023-0022
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            John Smith
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            $175.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            May 28, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/invoices/inv-789`} className="text-pulse-600 hover:text-pulse-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Invoice Status Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-3">Invoice Status</h3>
                    <div className="bg-gray-50 rounded-lg p-4 h-64">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pie chart showing invoice status distribution
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-3">Invoice Timeline</h3>
                    <div className="bg-gray-50 rounded-lg p-4 h-64">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Line chart showing invoice creation over time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Settings Tab Content */}
            <TabsContent value="settings" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-6">Finance Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* General Settings */}
                  <div className="col-span-1">
                    <h3 className="text-md font-medium mb-4">General</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500">
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year Start</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500">
                          <option value="january">January</option>
                          <option value="february">February</option>
                          <option value="march">March</option>
                          <option value="april">April</option>
                          <option value="may">May</option>
                          <option value="june">June</option>
                          <option value="july">July</option>
                          <option value="august">August</option>
                          <option value="september">September</option>
                          <option value="october">October</option>
                          <option value="november">November</option>
                          <option value="december">December</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500">
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Invoice Settings */}
                  <div className="col-span-1">
                    <h3 className="text-md font-medium mb-4">Invoices</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500">
                          <option value="7">Due in 7 days</option>
                          <option value="14">Due in 14 days</option>
                          <option value="30">Due in 30 days</option>
                          <option value="60">Due in 60 days</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Numbering</label>
                        <input
                          type="text"
                          placeholder="INV-{YEAR}-{NUMBER}"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Use {"{YEAR}"} for current year and {"{NUMBER}"} for sequential numbering</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="auto-reminder"
                          type="checkbox"
                          className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                        />
                        <label htmlFor="auto-reminder" className="ml-2 block text-sm text-gray-700">
                          Send automatic payment reminders
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tax Settings */}
                  <div className="col-span-1">
                    <h3 className="text-md font-medium mb-4">Taxes</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="tax-inclusive"
                          type="checkbox"
                          className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                        />
                        <label htmlFor="tax-inclusive" className="ml-2 block text-sm text-gray-700">
                          Prices are tax inclusive
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Label</label>
                        <input
                          type="text"
                          placeholder="Tax / VAT / GST"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-4">Payment Methods</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enabled
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Default
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Credit Card
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="radio"
                              name="default-payment"
                              checked
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">Configure</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Bank Transfer
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="radio"
                              name="default-payment"
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">Configure</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Cash
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="radio"
                              name="default-payment"
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">Configure</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Check
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="radio"
                              name="default-payment"
                              className="h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">Configure</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pulse-500">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </button>
                </div>
                
                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Finance; 