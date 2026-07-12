import { Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext, AuthProvider } from "./context/AuthContext"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Drivers } from "./pages/Drivers"
import { LicenseMonitoring } from "./pages/LicenseMonitoring"
import { DriverEligibility } from "./pages/DriverEligibility"
import { SafetyReports } from "./pages/SafetyReports"
import { Login } from "./pages/Login"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
