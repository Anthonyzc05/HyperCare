import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import {
  IconHome,
  IconUsers,
  IconStethoscope,
  IconShield,
  IconAlertTriangle,
  IconSearch,
  IconRefresh,
  IconCalendar,
} from "../components/icons";

import "../styles/paciente.css"; // sistema base del dashboard (dash-shell, dash-card, dash-table, etc.)
import "../styles/admin.css"; // extensión: badges de rol, buscador, banner de error

/* ============================================
   dashboard-admin.jsx — Portal HTA
   Panel del Administrador: resumen general y listado
   de Pacientes / Médicos / Administradores / Perfiles
   pendientes, leídos directamente de MySQL vía:

     GET /api/usuarios              -> listado completo (JOIN con
                                        pacientes, medicos, administradores)
     GET /api/usuarios/stats/resumen -> contadores para las tarjetas

   Antes de estos cambios, elegir "Médico" o "Administrador" en el
   registro no guardaba nada en `medicos` ni en `administradores`
   (ver registro.jsx y usuarioService.js), así que este dashboard
   solo tendrá datos completos de médicos/admins una vez que ese
   fix esté desplegado y la gente vuelva a completar su perfil.
   ============================================ */

const API_URL = "http://localhost:3000/api/usuarios";

const NAV_ITEMS = [
  { id: "resumen", label: "Resumen", icon: <IconHome /> },
  { id: "pacientes", label: "Pacientes", icon: <IconUsers /> },
  { id: "medicos", label: "Médicos", icon: <IconStethoscope /> },
  { id: "administradores", label: "Administradores", icon: <IconShield /> },
  { id: "pendientes", label: "Perfiles pendientes", icon: <IconAlertTriangle /> },
];

function DashboardAdmin() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [stats, setStats] = useState(null);
  const [adminActual, setAdminActual] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [activeId, setActiveId] = useState("resumen");
  const [busqueda, setBusqueda] = useState("");

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const [resUsuarios, resStats] = await Promise.all([
        fetch(API_URL),
        fetch(`${API_URL}/stats/resumen`),
      ]);

      if (!resUsuarios.ok || !resStats.ok) {
        throw new Error("Respuesta no válida del servidor");
      }

      const usuariosData = await resUsuarios.json();
      const statsData = await resStats.json();

      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo conectar con el backend. Verifica que el servidor esté corriendo en http://localhost:3000."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const firebase_uid = localStorage.getItem("firebase_uid");
    if (!firebase_uid) return;

    fetch(`${API_URL}/${firebase_uid}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setAdminActual(data))
      .catch(() => {});
  }, []);

  const pacientes = useMemo(() => usuarios.filter((u) => u.rol === "PACIENTE"), [usuarios]);
  const medicos = useMemo(() => usuarios.filter((u) => u.rol === "MEDICO"), [usuarios]);
  const administradores = useMemo(() => usuarios.filter((u) => u.rol === "ADMIN"), [usuarios]);
  const pendientes = useMemo(
    () => usuarios.filter((u) => !u.rol || !u.perfil_completo),
    [usuarios]
  );

  const filtrarPorTexto = (lista) => {
    if (!busqueda.trim()) return lista;
    const q = busqueda.trim().toLowerCase();
    return lista.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(q) ||
        u.correo?.toLowerCase().includes(q)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("firebase_uid");
    navigate("/");
  };

  const tituloActivo = NAV_ITEMS.find((n) => n.id === activeId)?.label ?? "Resumen";

  return (
    <DashboardLayout
      roleLabel="Administrador"
      navItems={NAV_ITEMS.map((item) =>
        item.id === "pendientes" && pendientes.length > 0
          ? { ...item, badge: pendientes.length }
          : item
      )}
      activeId={activeId}
      onNavItemClick={setActiveId}
      userName={adminActual?.nombre ?? "Administrador"}
      userSubtitle={adminActual?.correo ?? "Portal HTA"}
      onLogout={handleLogout}
      headerTitle={tituloActivo}
      headerSubtitle="Gestión de usuarios registrados en Portal HTA (pacientes, médicos y administradores)."
    >
      {error && <div className="dash-error-banner">{error}</div>}

      {/* ───────── RESUMEN ───────── */}
      {activeId === "resumen" && (
        <>
          <div className="dash-toolbar">
            <span className="hint" style={{ fontSize: 12.5, color: "var(--slate)" }}>
              {cargando ? "Cargando datos..." : `Última actualización: ${new Date().toLocaleTimeString("es-PE")}`}
            </span>
            <button type="button" className="dash-refresh-btn" onClick={cargarDatos} disabled={cargando}>
              <IconRefresh /> {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <div className="dash-stat-grid">
            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconUsers /> Usuarios totales
              </span>
              <span className="dash-stat-value">{stats?.total ?? usuarios.length}</span>
              <span className="dash-stat-tag" style={{ color: "var(--slate)", background: "var(--bg)" }}>
                registrados en la plataforma
              </span>
            </div>

            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconUsers /> Pacientes
              </span>
              <span className="dash-stat-value">{stats?.pacientes ?? pacientes.length}</span>
              <span className="dash-stat-tag tag-normal">con perfil clínico</span>
            </div>

            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconStethoscope /> Médicos
              </span>
              <span className="dash-stat-value">{stats?.medicos ?? medicos.length}</span>
              <span className="dash-stat-tag" style={{ color: "var(--ink)", background: "var(--bg)" }}>
                registrados
              </span>
            </div>

            <div
              className={`dash-card dash-stat-card ${(stats?.perfiles_incompletos ?? pendientes.length) > 0 ? "warn" : ""}`}
            >
              <span className="dash-stat-label">
                <IconAlertTriangle /> Perfiles incompletos
              </span>
              <span className="dash-stat-value">{stats?.perfiles_incompletos ?? pendientes.length}</span>
              <span
                className="dash-stat-tag"
                style={{
                  color: (stats?.perfiles_incompletos ?? pendientes.length) > 0 ? "var(--critico)" : "var(--normal)",
                  background:
                    (stats?.perfiles_incompletos ?? pendientes.length) > 0
                      ? "rgba(172,71,54,0.12)"
                      : "rgba(58,139,92,0.12)",
                }}
              >
                {(stats?.perfiles_incompletos ?? pendientes.length) > 0 ? "requieren seguimiento" : "todo al día"}
              </span>
            </div>
          </div>

          <div className="dash-section-row">
            <div className="dash-card">
              <div className="dash-section-title">
                Últimos usuarios registrados
                <span className="hint">Los 5 más recientes</span>
              </div>
              <TablaUsuariosResumen usuarios={usuarios.slice(0, 5)} />
            </div>

            <div className="dash-card">
              <div className="dash-section-title">
                Distribución por rol
                <IconCalendar style={{ width: 15, height: 15, color: "var(--slate)" }} />
              </div>
              <DistribucionRoles
                pacientes={stats?.pacientes ?? pacientes.length}
                medicos={stats?.medicos ?? medicos.length}
                admins={stats?.admins ?? administradores.length}
                sinRol={stats?.sin_rol ?? pendientes.length}
              />
            </div>
          </div>
        </>
      )}

      {/* ───────── PACIENTES ───────── */}
      {activeId === "pacientes" && (
        <div className="dash-card">
          <Buscador busqueda={busqueda} setBusqueda={setBusqueda} placeholder="Buscar paciente por nombre o correo..." />
          <TablaPacientes lista={filtrarPorTexto(pacientes)} cargando={cargando} />
        </div>
      )}

      {/* ───────── MÉDICOS ───────── */}
      {activeId === "medicos" && (
        <div className="dash-card">
          <Buscador busqueda={busqueda} setBusqueda={setBusqueda} placeholder="Buscar médico por nombre o correo..." />
          <TablaMedicos lista={filtrarPorTexto(medicos)} cargando={cargando} />
        </div>
      )}

      {/* ───────── ADMINISTRADORES ───────── */}
      {activeId === "administradores" && (
        <div className="dash-card">
          <Buscador
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            placeholder="Buscar administrador por nombre o correo..."
          />
          <TablaAdministradores lista={filtrarPorTexto(administradores)} cargando={cargando} />
        </div>
      )}

      {/* ───────── PERFILES PENDIENTES ───────── */}
      {activeId === "pendientes" && (
        <div className="dash-card">
          <div className="dash-section-title">
            Perfiles pendientes
            <span className="hint">Usuarios sin rol o sin perfil completo</span>
          </div>
          <TablaPendientes lista={filtrarPorTexto(pendientes)} cargando={cargando} />
        </div>
      )}
    </DashboardLayout>
  );
}

/* ────────────── Subcomponentes ────────────── */

function Buscador({ busqueda, setBusqueda, placeholder }) {
  return (
    <div className="dash-toolbar">
      <div className="dash-search">
        <IconSearch />
        <input
          type="text"
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
    </div>
  );
}

function RoleBadge({ rol }) {
  const clave = rol || "SINROL";
  const etiquetas = {
    PACIENTE: "Paciente",
    MEDICO: "Médico",
    ADMIN: "Administrador",
    SINROL: "Sin rol",
  };
  return <span className={`role-badge role-${clave}`}>{etiquetas[clave]}</span>;
}

function formatearFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TablaUsuariosResumen({ usuarios }) {
  if (usuarios.length === 0) {
    return <div className="dash-empty">Aún no hay usuarios registrados.</div>;
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td className="ink">{u.nombre}</td>
              <td>
                <RoleBadge rol={u.rol} />
              </td>
              <td>{formatearFecha(u.fecha_registro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistribucionRoles({ pacientes, medicos, admins, sinRol }) {
  const total = pacientes + medicos + admins + sinRol || 1;
  const filas = [
    { label: "Pacientes", valor: pacientes, color: "var(--normal)" },
    { label: "Médicos", valor: medicos, color: "var(--ink)" },
    { label: "Administradores", valor: admins, color: "var(--accent)" },
    { label: "Sin rol asignado", valor: sinRol, color: "var(--elevado)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {filas.map((f) => (
        <div key={f.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
            <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>{f.label}</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{f.valor}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "var(--bg)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round((f.valor / total) * 100)}%`,
                background: f.color,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TablaPacientes({ lista, cargando }) {
  if (cargando) return <div className="dash-empty">Cargando pacientes...</div>;
  if (lista.length === 0) return <div className="dash-empty">No se encontraron pacientes.</div>;

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Centro de salud</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td className="ink">{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.paciente_dni || "—"}</td>
              <td>{u.paciente_telefono || "—"}</td>
              <td>{u.paciente_centro_salud || "—"}</td>
              <td>{formatearFecha(u.fecha_registro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaMedicos({ lista, cargando }) {
  if (cargando) return <div className="dash-empty">Cargando médicos...</div>;

  if (lista.length === 0) {
    return (
      <div className="dash-empty">
        No se encontraron médicos.
        <br />
        <span style={{ fontSize: 11.5 }}>
          Si un médico ya inició sesión pero no aparece aquí, pídele que vuelva a completar su
          perfil: antes del fix del registro, elegir "Médico" no guardaba sus datos.
        </span>
      </div>
    );
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>CMP</th>
            <th>Especialidad</th>
            <th>Centro de salud</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td className="ink">{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.medico_cmp || "—"}</td>
              <td>{u.medico_especialidad || "—"}</td>
              <td>{u.medico_centro_salud || "—"}</td>
              <td>{u.medico_telefono || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaAdministradores({ lista, cargando }) {
  if (cargando) return <div className="dash-empty">Cargando administradores...</div>;
  if (lista.length === 0) return <div className="dash-empty">No se encontraron administradores.</div>;

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Cargo</th>
            <th>Área</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td className="ink">{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.admin_cargo || "—"}</td>
              <td>{u.admin_area || "—"}</td>
              <td>{u.admin_telefono || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaPendientes({ lista, cargando }) {
  if (cargando) return <div className="dash-empty">Cargando...</div>;
  if (lista.length === 0) return <div className="dash-empty">No hay perfiles pendientes. Todo al día.</div>;

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((u) => (
            <tr key={u.id}>
              <td className="ink">{u.nombre}</td>
              <td>{u.correo}</td>
              <td>
                <RoleBadge rol={u.rol} />
              </td>
              <td>{formatearFecha(u.fecha_registro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardAdmin;
