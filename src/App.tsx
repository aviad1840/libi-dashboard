import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { ScrollToTop } from "@/components/system/ScrollToTop";
import { RouteFallback } from "@/components/system/RouteFallback";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const Clients = lazy(() => import("./pages/Clients.tsx"));
const ClientDetail = lazy(() => import("./pages/ClientDetail.tsx"));
const Actions = lazy(() => import("./pages/Actions.tsx"));
const Alerts = lazy(() => import("./pages/Alerts.tsx"));
const Bookings = lazy(() => import("./pages/Bookings.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));

// Inter-ministerial prototype routes (national view)
const PolicyIntelligence = lazy(() => import("./pages/prototype/PolicyIntelligence.tsx"));
const Architecture = lazy(() => import("./pages/prototype/Architecture.tsx"));
const EarlyWarning = lazy(() => import("./pages/prototype/EarlyWarning.tsx"));
const AIIntake = lazy(() => import("./pages/prototype/AIIntake.tsx"));
const Matching = lazy(() => import("./pages/prototype/Matching.tsx"));
const Outcomes = lazy(() => import("./pages/prototype/Outcomes.tsx"));
const Assistant = lazy(() => import("./pages/prototype/Assistant.tsx"));
const Partners = lazy(() => import("./pages/prototype/Partners.tsx"));
const Proposal = lazy(() => import("./pages/prototype/Proposal.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Coordinator view (Branch A pages) */}
              <Route path="/" element={<Index />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/actions" element={<Actions />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />

              {/* National / inter-ministerial prototype */}
              <Route path="/national" element={<PolicyIntelligence />} />
              <Route path="/national/architecture" element={<Architecture />} />
              <Route path="/national/early-warning" element={<EarlyWarning />} />
              <Route path="/national/intake" element={<AIIntake />} />
              <Route path="/national/matching" element={<Matching />} />
              <Route path="/national/outcomes" element={<Outcomes />} />
              <Route path="/national/assistant" element={<Assistant />} />
              <Route path="/national/partners" element={<Partners />} />
              <Route path="/national/proposal" element={<Proposal />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
