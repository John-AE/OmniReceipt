import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import CreateQuotation from "./pages/CreateQuotation";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import CustomersPage from "./pages/CustomersPage";
import NotFound from "./pages/NotFound";
import PaymentCallback from "./pages/PaymentCallback";
import ResetPassword from "./pages/ResetPassword";
import TermsAndConditions from "./pages/TermsAndConditions";
import PriceListPreview from "./pages/PriceListPreview";
import PriceListManagement from "./pages/PriceListManagement";
import PriceListView from "./pages/PriceListView";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/create-invoice" element={<CreateInvoice />} />
              <Route path="/create-quotation" element={<CreateQuotation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/pricelist-preview" element={<PriceListPreview />} />
              <Route path="/price-list" element={<PriceListManagement />} />
              <Route path="/pricelist/:slug" element={<PriceListView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;


