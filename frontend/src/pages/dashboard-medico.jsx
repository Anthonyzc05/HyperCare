import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
  Legend,
} from "recharts";

import DashboardLayout from "../components/DashboardLayout";
import {
  IconUsers,
  IconClipboard,
  IconTrendUp,
  IconPill,
  IconFileText,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconCheckCircle,
  IconAlertTriangle,
  IconDownload,
  IconDroplet,
} from "../components/icons";
import {
  DOCTOR_MOCK,
  PACIENTES_MOCK,
  CATALOGO_MEDICAMENTOS,
  FRECUENCIAS,
  TIPOS_REPORTE,
} from "../Data/mockDataMedico";
import { ESTADO_LABEL, formatearFechaHora } from "../utils/presion";

import "../styles/paciente.css";
import "../styles/medico.css";

/* ============================================
   dashboard-medico.jsx — Portal HTA
   Panel del doctor: listado de pacientes, historial
   clínico, gráficos de evolución, prescripción de
   medicamentos y generación de reportes.

   No existen aún en la BD las tablas `medicamentos`,
   `prescripciones` ni una relación médico-paciente,
   así que esta pantalla trabaja con datos mock
   (ver src/Data/mockDataMedico.js) y deja comentarios
   TODO backend en cada punto de integración futura.
   ============================================ */

const NAV_ITEMS = [
  { id: "pacientes", label: "Mis Pacientes", icon: <IconUsers /> },
  { id: "historial", label: "Historial Clínico", icon: <IconClipboard /> },
  { id: "graficos", label: "Gráficos de Evolución", icon: <IconTrendUp /> },
  { id: "medicamentos", label: "Prescribir Medicamentos", icon: <IconPill /> },
  { id: "reportes", label: "Generar Reportes", icon: <IconFileText /> },
];

const FILTROS_GRAFICO = [
  { id: "7", label: "Últimos 7 días" },
  { id: "90", label: "Últimos 3 meses" },
  { id: "180", label: "Últimos 6 meses" },
];

function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function edadDesde(fechaNacimiento) {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function DashboardMedico() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState(PACIENTES_MOCK);
  const [activeId, setActiveId] = useState("pacientes");
  const [selectedPacienteId, setSelectedPacienteId] = useState(PACIENTES_MOCK[0]?.id);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [filtroDias, setFiltroDias] = useState("90");
  const [busquedaReporte, setBusquedaReporte] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [descargando, setDescargando] = useState(false);

  const [formMed, setFormMed] = useState({
    medicamento: CATALOGO_MEDICAMENTOS[0]?.nombre ?? "",
    dosis: CATALOGO_MEDICAMENTOS[0]?.dosis[0] ?? "",
    frecuencia: FRECUENCIAS[0],
    indicaciones: "",
    fechaInicio: new Date().toISOString().slice(0, 10),
  });

  const pacienteIndex = pacientes.findIndex((p) => p.id === selectedPacienteId);
  const pacienteActual = pacientes[pacienteIndex] ?? pacientes[0];

  const irAPaciente = (id, tab = "historial") => {
    setSelectedPacienteId(id);
    setActiveId(tab);
  };

  const irAlSiguientePaciente = (direccion) => {
    if (pacientes.length === 0) return;
    const nuevoIndex = (pacienteIndex + direccion + pacientes.length) % pacientes.length;
    setSelectedPacienteId(pacientes[nuevoIndex].id);
  };

  const pacientesFiltrados = useMemo(() => {
    const q = busquedaPaciente.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.dni.includes(q)
    );
  }, [pacientes, busquedaPaciente]);

  const reportesFiltrados = useMemo(() => {
    const q = busquedaReporte.trim().toLowerCase();
    if (!q) return TIPOS_REPORTE;
    return TIPOS_REPORTE.filter(
      (r) => r.nombre.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q)
    );
  }, [busquedaReporte]);

  const medicionesFiltradas = useMemo(() => {
    if (!pacienteActual) return [];
    const dias = Number(filtroDias);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    return pacienteActual.mediciones.filter((m) => new Date(m.fecha) >= limite);
  }, [pacienteActual, filtroDias]);

  const datosGrafico = useMemo(
    () =>
      [...medicionesFiltradas]
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map((m) => ({
          fecha: new Date(m.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }),
          Sistólica: m.sistolica,
          Diastólica: m.diastolica,
        })),
    [medicionesFiltradas]
  );

  const estadisticasPeriodo = useMemo(() => {
    if (medicionesFiltradas.length === 0) return null;
    const sistolicas = medicionesFiltradas.map((m) => m.sistolica);
    return { maximo: Math.max(...sistolicas), minimo: Math.min(...sistolicas) };
  }, [medicionesFiltradas]);

  const catalogoActual = CATALOGO_MEDICAMENTOS.find((c) => c.nombre === formMed.medicamento);

  const handleGuardarMedicamento = (e) => {
    e.preventDefault();
    if (!pacienteActual) return;

    const nuevo = {
      id: `medi-${Date.now()}`,
      nombre: formMed.medicamento,
      dosis: formMed.dosis,
      frecuencia: formMed.frecuencia,
      fechaInicio: formMed.fechaInicio,
      alerta: false,
    };

    // TODO backend: POST /api/pacientes/:id/medicamentos
    // body: { medicamento, dosis, frecuencia, indicaciones, fecha_inicio }
    setPacientes((prev) =>
      prev.map((p) =>
        p.id === pacienteActual.id ? { ...p, medicamentos: [...p.medicamentos, nuevo] } : p
      )
    );

    setMensaje(`Medicamento "${nuevo.nombre}" agregado a ${pacienteActual.nombre}.`);
    setFormMed((f) => ({ ...f, indicaciones: "" }));
  };

  const handleDescargarReporte = async (tipoReporte) => {
    if (!pacienteActual) return;

    if (tipoReporte.id !== "general") {
      setMensaje(`El reporte "${tipoReporte.nombre}" estará disponible próximamente.`);
      return;
    }

    if (!pacienteActual.firebaseUid) {
      // TODO backend: vincular cada paciente mock a su firebase_uid real
      // una vez exista la relación médico-paciente en la BD.
      setMensaje(
        `No se pudo generar el PDF: "${pacienteActual.nombre}" aún no tiene una cuenta vinculada en el backend (modo demo).`
      );
      return;
    }

    setDescargando(true);
    try {
      const dias = filtroDias === "all" ? 3650 : filtroDias;
      const response = await fetch(
        `http://localhost:3000/api/reportes/paciente/${pacienteActual.firebaseUid}?dias=${dias}`
      );
      if (!response.ok) throw new Error("No se pudo generar el reporte");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-hta-${pacienteActual.dni}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo descargar el reporte. Verifica que el backend esté corriendo en el puerto 3000.");
    } finally {
      setDescargando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("firebase_uid");
    navigate("/");
  };

  const headerTitles = {
    pacientes: "Mis Pacientes",
    historial: "Historial Clínico",
    graficos: "Gráficos de Evolución",
    medicamentos: "Prescribir Medicamentos",
    reportes: "Generar Reportes",
  };

  return (
    <DashboardLayout
      roleLabel="Doctor"
      navItems={NAV_ITEMS}
      activeId={activeId}
      onNavItemClick={setActiveId}
      userName={DOCTOR_MOCK.nombre}
      userSubtitle={DOCTOR_MOCK.especialidad}
      onLogout={handleLogout}
      headerTitle={headerTitles[activeId]}
      headerSubtitle={`Bienvenido, ${DOCTOR_MOCK.nombre}. ${DOCTOR_MOCK.centroSalud}.`}
    >
      {mensaje && (
        <div className="dash-card" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{mensaje}</span>
          <button type="button" className="medico-link-btn" onClick={() => setMensaje("")}>
            Cerrar
          </button>
        </div>
      )}

      {/* ───────── MIS PACIENTES ───────── */}
      {activeId === "pacientes" && (
        <div className="dash-card">
          <div className="medico-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar paciente por nombre o DNI..."
              value={busquedaPaciente}
              onChange={(e) => setBusquedaPaciente(e.target.value)}
            />
          </div>

          <div className="medico-patient-list">
            {pacientesFiltrados.length === 0 && (
              <div className="dash-empty">No se encontraron pacientes.</div>
            )}
            {pacientesFiltrados.map((p) => (
              <button
                key={p.id}
                type="button"
                className="medico-patient-card"
                onClick={() => irAPaciente(p.id)}
              >
                <span className="medico-patient-avatar">{iniciales(p.nombre)}</span>
                <div className="medico-patient-info">
                  <div className="medico-patient-info-name">{p.nombre}</div>
                  <div className="medico-patient-info-meta">
                    DNI {p.dni} · {edadDesde(p.fechaNacimiento)} años
                  </div>
                </div>
                <div className="medico-patient-card-right">
                  <span className={`dash-stat-tag tag-${p.estadoGeneral === "Estable" ? "normal" : p.estadoGeneral === "En observación" ? "elevado" : "critico"}`}>
                    {p.estadoGeneral}
                  </span>
                  <IconChevronRight style={{ width: 16, height: 16, color: "var(--slate)" }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ───────── HISTORIAL CLÍNICO ───────── */}
      {activeId === "historial" && pacienteActual && (
        <>
          <div className="medico-patient-header">
            <div>
              <div className="medico-patient-heading">
                <button type="button" className="medico-nav-arrow" onClick={() => irAlSiguientePaciente(-1)} aria-label="Paciente anterior">
                  <IconChevronLeft />
                </button>
                <h2 className="medico-section-title">Historial Clínico</h2>
                <button type="button" className="medico-nav-arrow" onClick={() => irAlSiguientePaciente(1)} aria-label="Siguiente paciente">
                  <IconChevronRight />
                </button>
              </div>
              <div className="medico-patient-name">{pacienteActual.nombre}</div>
            </div>
            <span className="medico-patient-photo">{iniciales(pacienteActual.nombre)}</span>
          </div>

          <div className="dash-stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label"><IconCalendar /> Fecha de nacimiento</span>
              <span className="dash-stat-value" style={{ fontSize: 18 }}>
                {new Date(pacienteActual.fechaNacimiento).toLocaleDateString("es-PE")}
              </span>
            </div>
            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label"><IconClipboard /> Última cita</span>
              <span className="dash-stat-value" style={{ fontSize: 18 }}>
                {pacienteActual.ultimaCita ? new Date(pacienteActual.ultimaCita).toLocaleDateString("es-PE") : "—"}
              </span>
            </div>
            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label"><IconDroplet /> Estado general</span>
              <span className={`dash-stat-tag tag-${pacienteActual.estadoGeneral === "Estable" ? "normal" : pacienteActual.estadoGeneral === "En observación" ? "elevado" : "critico"}`} style={{ fontSize: 14 }}>
                {pacienteActual.estadoGeneral}
              </span>
            </div>
          </div>

          <div className="dash-section-row">
            <div className="dash-card">
              <div className="dash-section-title">Línea de tiempo de eventos</div>
              <div className="medico-timeline">
                {pacienteActual.eventos.slice(0, 8).map((e) => (
                  <div key={e.id} className="medico-timeline-item">
                    <span className={`medico-timeline-dot ${e.estado}`}>
                      {e.estado === "normal" ? <IconCheckCircle /> : <IconAlertTriangle />}
                    </span>
                    <div className="medico-timeline-body">
                      <div className="medico-timeline-top">
                        {e.tipo === "medicion" ? "Medición" : "Medicamento"}
                        <span className={`dash-stat-tag tag-${e.estado}`} style={{ fontSize: 10.5 }}>
                          {ESTADO_LABEL[e.estado] ?? e.estado}
                        </span>
                      </div>
                      <div className="medico-timeline-meta">Realizado: {formatearFechaHora(e.fecha)}</div>
                      <div className="medico-timeline-detail">{e.detalle}</div>
                      {e.detalle2 && <div className="medico-timeline-detail">{e.detalle2}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-section-title">Registro de mediciones</div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Sistólica</th>
                      <th>Pulso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacienteActual.mediciones.slice(0, 6).map((m) => (
                      <tr key={m.id}>
                        <td>{new Date(m.fecha).toLocaleDateString("es-PE")}</td>
                        <td>{m.hora}</td>
                        <td className="ink">{m.sistolica} mmHg</td>
                        <td>{m.pulso} lpm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ───────── GRÁFICOS DE EVOLUCIÓN ───────── */}
      {activeId === "graficos" && pacienteActual && (
        <>
          <div className="medico-patient-header">
            <div>
              <div className="medico-patient-heading">
                <button type="button" className="medico-nav-arrow" onClick={() => irAlSiguientePaciente(-1)} aria-label="Paciente anterior">
                  <IconChevronLeft />
                </button>
                <h2 className="medico-section-title">Gráficos de Evolución</h2>
                <button type="button" className="medico-nav-arrow" onClick={() => irAlSiguientePaciente(1)} aria-label="Siguiente paciente">
                  <IconChevronRight />
                </button>
              </div>
              <div className="medico-patient-name">{pacienteActual.nombre}</div>
            </div>
            <span className="medico-patient-photo">{iniciales(pacienteActual.nombre)}</span>
          </div>

          <div className="dash-card">
            <div className="dash-section-title">
              <div style={{ display: "flex", gap: 6 }}>
                {FILTROS_GRAFICO.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFiltroDias(f.id)}
                    className="dash-btn-secondary"
                    style={
                      filtroDias === f.id
                        ? { background: "var(--ink)", color: "var(--white)", borderColor: "var(--ink)" }
                        : { padding: "6px 12px", fontSize: 12 }
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="hint">Sistólica · Diastólica</span>
            </div>

            {datosGrafico.length === 0 ? (
              <div className="dash-empty">No hay mediciones en este período.</div>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={datosGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#DCD2BC" strokeDasharray="3 3" />
                    <ReferenceArea y1={180} y2={220} fill="#AC4736" fillOpacity={0.06} />
                    <ReferenceArea y1={120} y2={179} fill="#C08A2E" fillOpacity={0.06} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#647183" }} axisLine={{ stroke: "#DCD2BC" }} />
                    <YAxis domain={[40, 220]} tick={{ fontSize: 11, fill: "#647183" }} axisLine={{ stroke: "#DCD2BC" }} />
                    <Tooltip
                      contentStyle={{
                        background: "#FFFFFF",
                        border: "1px solid #DCD2BC",
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Sistólica" stroke="#AC4736" strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Diastólica" stroke="#16304A" strokeWidth={2.2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {estadisticasPeriodo && (
            <div className="dash-card" style={{ marginTop: "1.25rem", maxWidth: 420 }}>
              <div className="dash-section-title">Estadísticas del período</div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Máximo</th>
                      <th>Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="ink">Sistólica</td>
                      <td>{estadisticasPeriodo.maximo} mmHg</td>
                      <td>{estadisticasPeriodo.minimo} mmHg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="dash-btn-primary"
                style={{ marginTop: "1rem" }}
                disabled={descargando}
                onClick={() => handleDescargarReporte({ id: "general", nombre: "Reporte General" })}
              >
                <IconDownload /> {descargando ? "Generando..." : "Generar reporte PDF"}
              </button>
            </div>
          )}
        </>
      )}

      {/* ───────── PRESCRIBIR MEDICAMENTOS ───────── */}
      {activeId === "medicamentos" && pacienteActual && (
        <>
          <div className="dash-card medico-form-card">
            <div className="dash-section-title">Prescribir Medicamentos</div>
            <p className="hint" style={{ marginBottom: "1rem" }}>
              Última medición: {pacienteActual.mediciones[0] ? new Date(pacienteActual.mediciones[0].fecha).toLocaleDateString("es-PE") : "—"}
            </p>

            <form onSubmit={handleGuardarMedicamento}>
              <div className="dash-field">
                <label>Paciente</label>
                <input type="text" value={pacienteActual.nombre} disabled />
              </div>

              <div className="dash-field">
                <label>Medicamento</label>
                <select
                  value={formMed.medicamento}
                  onChange={(e) => {
                    const nuevoCatalogo = CATALOGO_MEDICAMENTOS.find((c) => c.nombre === e.target.value);
                    setFormMed((f) => ({ ...f, medicamento: e.target.value, dosis: nuevoCatalogo?.dosis[0] ?? "" }));
                  }}
                >
                  {CATALOGO_MEDICAMENTOS.map((c) => (
                    <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="dash-field">
                <label>Dosis</label>
                <select
                  value={formMed.dosis}
                  onChange={(e) => setFormMed((f) => ({ ...f, dosis: e.target.value }))}
                >
                  {catalogoActual?.dosis.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="dash-field">
                <label>Frecuencia</label>
                <select
                  value={formMed.frecuencia}
                  onChange={(e) => setFormMed((f) => ({ ...f, frecuencia: e.target.value }))}
                >
                  {FRECUENCIAS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="dash-field">
                <label>Indicaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Tomar con alimentos"
                  value={formMed.indicaciones}
                  onChange={(e) => setFormMed((f) => ({ ...f, indicaciones: e.target.value }))}
                />
              </div>

              <div className="dash-field">
                <label>Fecha inicio</label>
                <input
                  type="date"
                  value={formMed.fechaInicio}
                  onChange={(e) => setFormMed((f) => ({ ...f, fechaInicio: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="dash-btn-primary">
                  <IconPill /> Guardar
                </button>
                <button
                  type="button"
                  className="dash-btn-secondary"
                  onClick={() => setActiveId("historial")}
                >
                  Ver historial
                </button>
              </div>
            </form>
          </div>

          <div className="medico-active-meds-title">
            Medicamentos activos de {pacienteActual.nombre.split(" ")[0]}
          </div>
          <div className="dash-card">
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                    <th>Fecha inicio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacienteActual.medicamentos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="dash-empty">Sin medicamentos activos.</td>
                    </tr>
                  )}
                  {pacienteActual.medicamentos.map((m) => (
                    <tr key={m.id}>
                      <td className="ink">{m.nombre}</td>
                      <td>{m.dosis}</td>
                      <td>{m.frecuencia}</td>
                      <td>{new Date(m.fechaInicio).toLocaleDateString("es-PE")}</td>
                      <td>
                        <button type="button" className="medico-link-btn" onClick={() => setActiveId("historial")}>
                          Ver historial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ───────── GENERAR REPORTES ───────── */}
      {activeId === "reportes" && pacienteActual && (
        <div className="dash-card" style={{ maxWidth: 620 }}>
          <p className="hint" style={{ marginBottom: "1rem" }}>
            Reportes para <strong style={{ color: "var(--ink)" }}>{pacienteActual.nombre}</strong>. Cambia de paciente desde "Mis Pacientes".
          </p>

          <div className="medico-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar por nombre de reporte..."
              value={busquedaReporte}
              onChange={(e) => setBusquedaReporte(e.target.value)}
            />
          </div>

          <div className="medico-report-list">
            {reportesFiltrados.length === 0 && (
              <div className="dash-empty">No se encontraron reportes.</div>
            )}
            {reportesFiltrados.map((r) => (
              <button
                key={r.id}
                type="button"
                className="medico-report-card"
                onClick={() => handleDescargarReporte(r)}
                disabled={descargando}
              >
                <div>
                  <div className="medico-report-card-title">{r.nombre}</div>
                  <div className="medico-report-card-desc">{r.descripcion}</div>
                </div>
                <span className="medico-report-arrow"><IconChevronRight /></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardMedico;
