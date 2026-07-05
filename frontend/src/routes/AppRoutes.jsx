import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login"; 
import Registro from "../pages/Registro"; 
import DashboardPaciente from "../pages/dashboard-paciente";
import DashboardMedico from "../pages/dashboard-medico";
import DashboardAdmin from "../pages/dashboard-admin";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/registro" element={<Registro />} />

        <Route
          path="/dashboardPaciente"
          element={<DashboardPaciente />}
        />

        <Route
          path="/dashboardMedico"
          element={<DashboardMedico />}
        />

        <Route
          path="/dashboardAdmin"
          element={<DashboardAdmin />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;