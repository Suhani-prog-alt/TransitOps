import { Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Drivers } from "./pages/Drivers"
import { LicenseMonitoring } from "./pages/LicenseMonitoring"
import { DriverEligibility } from "./pages/DriverEligibility"
import { SafetyReports } from "./pages/SafetyReports"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="licenses" element={<LicenseMonitoring />} />
        <Route path="eligibility" element={<DriverEligibility />} />
        <Route path="reports" element={<SafetyReports />} />
      </Route>
    </Routes>
  )
}

export default App
