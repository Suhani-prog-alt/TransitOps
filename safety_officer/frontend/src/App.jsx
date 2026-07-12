import { Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext, AuthProvider } from "./context/AuthContext"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Drivers } from "./pages/Drivers"
import { LicenseMonitoring } from "./pages/LicenseMonitoring"
import { DriverEligibility } from "./pages/DriverEligibility"
import { SafetyReports } from "./pages/SafetyReports"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>
  if (!user) {
    window.location.href = "http://localhost:8080";
    return null;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="licenses" element={<LicenseMonitoring />} />
        <Route path="eligibility" element={<DriverEligibility />} />
        <Route path="reports" element={<SafetyReports />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
