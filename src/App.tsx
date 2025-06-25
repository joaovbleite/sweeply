import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/ui/PageTransition";
import Index from "./pages/Index";
import About from "./pages/About";
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
import Schedule from "./pages/Schedule";
import Finance from "./pages/Finance";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import EditInvoice from "./pages/EditInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetail from "./pages/EmployeeDetail";
import EditEmployee from "./pages/EditEmployee";
import PerformanceReviews from "./pages/PerformanceReviews";
import CreatePerformanceReview from "./pages/CreatePerformanceReview";
import TeamAnalytics from "./pages/TeamAnalytics";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MobileSettings from "./pages/MobileSettings";
import More from "./pages/More";
import Support from "./pages/Support";
import Company from "./pages/Company";
import Preferences from "./pages/Preferences";
import Team from "./pages/Team";
import AddTeamMember from "./pages/AddTeamMember";
import TeamMemberDetail from "./pages/TeamMemberDetail";
import Profile from "./pages/Profile";
import PricingAssistant from "./pages/PricingAssistant";
import NewQuote from "./pages/NewQuote";
import Notifications from "./pages/Notifications";
import InstallPrompt from "@/components/ui/InstallPrompt";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import Refer from "./pages/Refer";
import Subscription from "./pages/Subscription";
import AddTestClient from "./pages/AddTestClient";
import AddTestJob from "./pages/AddTestJob";
import AIChatPage from "./pages/AIChatPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create a wrapper component to handle the page transitions
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes location={location}>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/add-test-client" element={<AddTestClient />} />
      <Route path="/add-test-job" element={<AddTestJob />} />
      <Route 
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <AIChatPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clients" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Clients />
            </PageTransition>
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
            <PageTransition>
              <Jobs />
            </PageTransition>
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
            <PageTransition>
              <Calendar />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schedule" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Schedule />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/finance" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Finance />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/invoices" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Invoices />
            </PageTransition>
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
        path="/invoices/:id" 
        element={
          <ProtectedRoute>
            <InvoiceDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/invoices/:id/edit" 
        element={
          <ProtectedRoute>
            <EditInvoice />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employees" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Employees />
            </PageTransition>
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
            <PageTransition>
              <EmployeeDetail />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employees/:id/edit" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <EditEmployee />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/performance" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <PerformanceReviews />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/performance/new" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <CreatePerformanceReview />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team/analytics" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <TeamAnalytics />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payroll" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Payroll />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Reports />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Settings />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Notifications />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pricing" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <PricingAssistant />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quotes/new" 
        element={
          <ProtectedRoute>
            <NewQuote />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mobile-settings" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <MobileSettings />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/more" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <More />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscription" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Subscription />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/support" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Support />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Company />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Preferences />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Team />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team/add" 
        element={
          <ProtectedRoute>
            <AddTeamMember />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team/member/:memberId" 
        element={
          <ProtectedRoute>
            <TeamMemberDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Profile />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Tasks />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/add-task" 
        element={
          <ProtectedRoute>
            <AddTask />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/refer" 
        element={
          <ProtectedRoute>
            <PageTransition>
              <Refer />
            </PageTransition>
          </ProtectedRoute>
        } 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <InstallPrompt />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
