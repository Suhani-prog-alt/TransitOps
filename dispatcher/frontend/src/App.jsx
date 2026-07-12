import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Reports from './pages/Reports';

const MainAppContent = () => {
  const { isAuthenticated, loading, apiFetch } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b132b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0be]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard apiFetch={apiFetch} />;
      case 'trips':
        return <Trips apiFetch={apiFetch} />;
      case 'vehicles':
        return <Vehicles apiFetch={apiFetch} />;
      case 'drivers':
        return <Drivers apiFetch={apiFetch} />;
      case 'maintenance':
        return <Maintenance apiFetch={apiFetch} />;
      case 'expenses':
        return <FuelExpenses apiFetch={apiFetch} />;
      case 'reports':
        return <Reports apiFetch={apiFetch} />;
      default:
        return <Dashboard apiFetch={apiFetch} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard KPI Overview';
      case 'trips': return 'Dispatcher Workspace';
      case 'vehicles': return 'Vehicles Registry';
      case 'drivers': return 'Drivers Directory';
      case 'maintenance': return 'Maintenance & Garage';
      case 'expenses': return 'Fuel & Expenses';
      case 'reports': return 'Reports & Analytics';
      default: return 'TransitOps';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b132b] text-[#f3f4f6]">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar title={getPageTitle()} apiFetch={apiFetch} />
        
        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-[#0b132b]">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
