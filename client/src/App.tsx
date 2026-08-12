import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ContractDetail from "./pages/ContractDetail";
import CoverageMatrix from "./pages/CoverageMatrix";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ColorfulBar } from "@/components/ColorfulBar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ColorfulBar />
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ProtectedRoute>
          <BrowserRouter basename={window.location.pathname.includes('/contracts/') ? '/contracts' : '/'}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/contract/:id" element={<ContractDetail />} />
              <Route path="/coverage-matrix" element={<CoverageMatrix />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProtectedRoute>
      </AuthProvider>
      <ScrollToTop />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
