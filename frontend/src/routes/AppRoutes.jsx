import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login"; // Asegúrate de que en tu carpeta sea Login.jsx con L mayúscula, en tu explorador se ve Login.jsx
import Registro from "../pages/Registro"; // Lo mismo aquí, se ve registro.jsx con minúscula en tu explorador. ¡Ojo ahí!
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