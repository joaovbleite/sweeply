import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AboutPage from "./pages/About"; // Import the new About page
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import ClientDashboard from "./pages/ClientDashboard";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import Calendar from "./pages/Calendar";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetail from "./pages/EmployeeDetail";
import EditEmployee from "./pages/EditEmployee";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PricingAssistant from "./pages/PricingAssistant";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} /> {/* Add route for About page */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/new" 
              element={
                <ProtectedRoute>
                  <AddClient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditClient />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/:id" 
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs/new" 
              element={
                <ProtectedRoute>
                  <AddJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices/new" 
              element={
                <ProtectedRoute>
                  <CreateInvoice />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute>
                  <Employees />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees/new" 
              element={
                <ProtectedRoute>
                  <AddEmployee />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees/:id" 
              element={
                <ProtectedRoute>
                  <EmployeeDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditEmployee />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payroll" 
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <ProtectedRoute>
                  <PricingAssistant />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
