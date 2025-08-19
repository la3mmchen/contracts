import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "@/pages/Index";
import ContractDetail from "@/pages/ContractDetail";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <ConnectionStatus />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/:id" element={<ContractDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
