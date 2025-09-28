import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Creators from "./pages/Creators";
import Downloads from "./pages/Downloads";
import Auth from "./pages/Auth";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeCapacitor } from "./utils/capacitor-init";
import { useBackgroundPlayback } from "./hooks/useBackgroundPlayback";

const queryClient = new QueryClient();

const App = () => {
  // Initialize background playback globally
  useBackgroundPlayback();

  // Initialize Capacitor after React is ready
  React.useEffect(() => {
    initializeCapacitor();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/creators" element={
              <ProtectedRoute>
                <Layout>
                  <Creators />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/downloads" element={
              <ProtectedRoute>
                <Layout>
                  <Downloads />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/watch/:videoId" element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
