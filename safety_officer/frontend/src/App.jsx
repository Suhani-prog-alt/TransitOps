import { Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Drivers } from "./pages/Drivers"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
      </Route>
    </Routes>
  )
}

export default App
