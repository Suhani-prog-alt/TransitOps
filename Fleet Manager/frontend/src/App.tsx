import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import { VehicleRegistry } from './pages/VehicleRegistry';
import { VehicleDetails } from './pages/VehicleDetails';
import { Maintenance } from './pages/Maintenance';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';

const ProtectedRoute = () => {
  return <Outlet />;
};

// Main Layout Component
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full bg-[#0B0F19] overflow-hidden">
      {/* Background ambient glows */}
      <div className="ambient-glow-blue" />
      <div className="ambient-glow-purple" />

      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-h-screen">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FilterProvider>
          <Routes>
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vehicles" element={<VehicleRegistry />} />
                <Route path="/vehicles/:id" element={<VehicleDetails />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
