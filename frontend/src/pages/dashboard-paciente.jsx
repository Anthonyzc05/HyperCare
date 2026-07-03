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
  IconHome,
  IconPlus,
  IconHistory,
  IconPill,
  IconBell,
  IconFileText,
  IconDownload,
  IconTrendUp,
  IconCalendar,
  IconAlertTriangle,
  IconCheckCircle,
  IconDroplet,
} from "../components/icons";
import {
  MEDICIONES_MOCK,
  RECORDATORIOS_MOCK,
  ALERTAS_MOCK,
  PACIENTE_MOCK,
} from "../data/mockDataPaciente";
import {
  RANGO_VALIDO,
  ESTADO_LABEL,
  getEstadoPresion,
  validarRangoPresion,
  formatearFechaHora,
} from "../utils/presion";

import "../styles/paciente.css";

/* ============================================
   dashboard-paciente.jsx — Portal HTA
   Cubre RF03-RF12 y RF15 (registro, historial,
   gráficos, recordatorios, alertas y reporte)

   Alineado al esquema MySQL real:
     - mediciones(presion_sistolica, presion_diastolica,
       frecuencia_cardiaca, observaciones, fecha_medicion)
     - recordatorios(medicamento, hora, activo)
   No existe tabla `alertas`: se calculan desde `mediciones`.

   TODO backend: reemplazar mediciones/recordatorios mock por
   fetch a /api/mediciones y /api/recordatorios cuando esos
   endpoints existan (hoy solo existe /api/usuarios).
   ============================================ */

const NAV_ITEMS = [
  { id: "inicio", label: "Inicio", icon: <IconHome /> },
  { id: "registrar", label: "Registrar medición", icon: <IconPlus /> },
  { id: "historial", label: "Historial", icon: <IconHistory /> },
  { id: "recordatorios", label: "Recordatorios", icon: <IconPill /> },
  { id: "alertas", label: "Alertas", icon: <IconBell /> },
  { id: "reportes", label: "Reportes", icon: <IconFileText /> },
];

const FILTROS_FECHA = [
  { id: "7", label: "7 días" },
  { id: "30", label: "30 días" },
  { id: "90", label: "3 meses" },
  { id: "all", label: "Todo" },
];

function DashboardPaciente() {
  const navigate = useNavigate();

  const [mediciones, setMediciones] = useState(MEDICIONES_MOCK);
  const [recordatorios, setRecordatorios] = useState(RECORDATORIOS_MOCK);
  const [activeId, setActiveId] = useState("inicio");
  const [filtroDias, setFiltroDias] = useState("30");

  const [form, setForm] = useState({ sistolica: "", diastolica: "", frecuencia: "", observaciones: "" });
  const [errores, setErrores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");

  const alertasActivas = ALERTAS_MOCK.filter((a) => a.estado === "activo");

  const medicionesFiltradas = useMemo(() => {
    if (filtroDias === "all") return mediciones;
    const dias = Number(filtroDias);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    return mediciones.filter((m) => new Date(m.fecha) >= limite);
  }, [mediciones, filtroDias]);

  const datosGrafico = useMemo(
    () =>
      medicionesFiltradas.map((m) => ({
        fecha: new Date(m.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }),
        Sistólica: m.sistolica,
        Diastólica: m.diastolica,
      })),
    [medicionesFiltradas]
  );

  const ultimaMedicion = mediciones[mediciones.length - 1];

  const promedio7Dias = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 7);
    const recientes = mediciones.filter((m) => new Date(m.fecha) >= limite);
    if (recientes.length === 0) return null;
    const sist = Math.round(recientes.reduce((s, m) => s + m.sistolica, 0) / recientes.length);
    const dias = Math.round(recientes.reduce((s, m) => s + m.diastolica, 0) / recientes.length);
    return { sist, dias };
  }, [mediciones]);

  const estadoEnVivo =
    form.sistolica && form.diastolica
      ? getEstadoPresion(Number(form.sistolica), Number(form.diastolica))
      : null;

  const handleSubmitMedicion = (e) => {
    e.preventDefault();
    setMensajeExito("");

    const sistolica = Number(form.sistolica);
    const diastolica = Number(form.diastolica);
    const { valido, errores: erroresValidacion } = validarRangoPresion(sistolica, diastolica);

    if (!valido) {
      setErrores(erroresValidacion);
      return;
    }

    setErrores([]);

    const nueva = {
      id: `med-${Date.now()}`,
      fecha: new Date().toISOString(),
      sistolica,
      diastolica,
      frecuenciaCardiaca: form.frecuencia ? Number(form.frecuencia) : null,
      observaciones: form.observaciones,
      estado: getEstadoPresion(sistolica, diastolica),
    };

    // TODO backend: POST /api/mediciones
    // body: { firebase_uid, presion_sistolica, presion_diastolica, frecuencia_cardiaca, observaciones }
    setMediciones((prev) => [...prev, nueva]);
    setForm({ sistolica: "", diastolica: "", frecuencia: "", observaciones: "" });
    setMensajeExito(
      nueva.estado === "critico"
        ? "Medición registrada. Se generó una alerta crítica y se notificó a tu médico."
        : "Medición registrada correctamente."
    );
    setActiveId("inicio");
  };

  const handleToggleRecordatorio = (id) => {
    // TODO backend: PUT /api/recordatorios/:id { activo }
    setRecordatorios((prev) =>
      prev.map((r) => (r.id === id ? { ...r, activo: !r.activo } : r))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("firebase_uid");
    navigate("/");
  };

  return (
    <DashboardLayout
      roleLabel="Paciente"
      navItems={NAV_ITEMS}
      activeId={activeId}
      onNavItemClick={setActiveId}
      userName={PACIENTE_MOCK.nombre}
      userSubtitle={PACIENTE_MOCK.centroSalud}
      onLogout={handleLogout}
      headerTitle={NAV_ITEMS.find((n) => n.id === activeId)?.label ?? "Inicio"}
      headerSubtitle={`Bienvenido, ${PACIENTE_MOCK.nombre.split(" ")[0]}. Aquí está el resumen de tu control de presión.`}
    >
      {mensajeExito && (
        <div className="dash-card" style={{ marginBottom: "1.25rem", borderColor: "var(--normal)" }}>
          <span className="estado-normal" style={{ fontWeight: 600, fontSize: 13 }}>
            ✓ {mensajeExito}
          </span>
        </div>
      )}

      {/* ───────── INICIO ───────── */}
      {activeId === "inicio" && (
        <>
          <div className="dash-stat-grid">
            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconDroplet /> Última medición
              </span>
              <span className="dash-stat-value">
                {ultimaMedicion.sistolica}/{ultimaMedicion.diastolica} <small>mmHg</small>
              </span>
              <span className={`dash-stat-tag tag-${ultimaMedicion.estado}`}>
                {ESTADO_LABEL[ultimaMedicion.estado]}
              </span>
            </div>

            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconTrendUp /> Promedio 7 días
              </span>
              <span className="dash-stat-value">
                {promedio7Dias ? `${promedio7Dias.sist}/${promedio7Dias.dias}` : "—"} <small>mmHg</small>
              </span>
              <span className="dash-stat-tag" style={{ color: "var(--slate)", background: "var(--bg)" }}>
                {medicionesFiltradas.length} registros en el período
              </span>
            </div>

            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconCalendar /> Próxima cita
              </span>
              <span className="dash-stat-value" style={{ fontSize: 19 }}>
                {new Date(PACIENTE_MOCK.proximaCita).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <span className="dash-stat-tag" style={{ color: "var(--slate)", background: "var(--bg)" }}>
                {PACIENTE_MOCK.medicoAsignado}
              </span>
            </div>

            <div className="dash-card dash-stat-card">
              <span className="dash-stat-label">
                <IconBell /> Alertas activas
              </span>
              <span className="dash-stat-value">{alertasActivas.length}</span>
              <span
                className="dash-stat-tag"
                style={{
                  color: alertasActivas.length ? "var(--critico)" : "var(--normal)",
                  background: alertasActivas.length ? "rgba(172,71,54,0.12)" : "rgba(58,139,92,0.12)",
                }}
              >
                {alertasActivas.length ? "Requiere atención" : "Todo en orden"}
              </span>
            </div>
          </div>

          <div className="dash-card" style={{ marginBottom: "1.25rem" }}>
            <div className="dash-section-title">
              Evolución de presión arterial
              <span className="hint">Sistólica / Diastólica (mmHg)</span>
            </div>
            <GraficoPresion datos={datosGrafico} />
          </div>

          <div className="dash-section-row">
            <div className="dash-card">
              <div className="dash-section-title">Últimas mediciones</div>
              <TablaMediciones mediciones={mediciones.slice(-5).reverse()} />
            </div>

            <div className="dash-card">
              <div className="dash-section-title">Alertas recientes</div>
              <ListaAlertas alertas={ALERTAS_MOCK} compacto />
            </div>
          </div>
        </>
      )}

      {/* ───────── REGISTRAR MEDICIÓN ───────── */}
      {activeId === "registrar" && (
        <div className="dash-card" style={{ maxWidth: 460 }}>
          <div className="dash-section-title">Nueva medición</div>

          <form onSubmit={handleSubmitMedicion}>
            <div className="dash-form-grid">
              <div className="dash-field">
                <label>Presión sistólica (mmHg)</label>
                <input
                  type="number"
                  placeholder="Ej. 120"
                  value={form.sistolica}
                  onChange={(e) => setForm((f) => ({ ...f, sistolica: e.target.value }))}
                  min={RANGO_VALIDO.sistolica.min}
                  max={RANGO_VALIDO.sistolica.max}
                  required
                />
              </div>

              <div className="dash-field">
                <label>Presión diastólica (mmHg)</label>
                <input
                  type="number"
                  placeholder="Ej. 80"
                  value={form.diastolica}
                  onChange={(e) => setForm((f) => ({ ...f, diastolica: e.target.value }))}
                  min={RANGO_VALIDO.diastolica.min}
                  max={RANGO_VALIDO.diastolica.max}
                  required
                />
              </div>
            </div>

            <div className="dash-field">
              <label>Frecuencia cardíaca (lpm) — opcional</label>
              <input
                type="number"
                placeholder="Ej. 72"
                value={form.frecuencia}
                onChange={(e) => setForm((f) => ({ ...f, frecuencia: e.target.value }))}
              />
            </div>

            <div className="dash-field">
              <label>Observaciones — opcional</label>
              <input
                type="text"
                placeholder="Ej. Mareo leve, medido en reposo"
                value={form.observaciones}
                onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
              />
            </div>

            {estadoEnVivo && (
              <span className={`dash-preview-badge tag-${estadoEnVivo}`}>
                {estadoEnVivo === "critico" ? <IconAlertTriangle /> : <IconCheckCircle />}
                Estado estimado: {ESTADO_LABEL[estadoEnVivo]}
              </span>
            )}

            {errores.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                {errores.map((err) => (
                  <div key={err} className="dash-field-error">
                    {err}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="dash-btn-primary">
              <IconPlus /> Guardar medición
            </button>
          </form>
        </div>
      )}

      {/* ───────── HISTORIAL ───────── */}
      {activeId === "historial" && (
        <div className="dash-card">
          <div className="dash-section-title">
            Historial completo
            <FiltroFechas value={filtroDias} onChange={setFiltroDias} />
          </div>
          <TablaMediciones mediciones={[...medicionesFiltradas].reverse()} mostrarFrecuencia />
        </div>
      )}

      {/* ───────── RECORDATORIOS ───────── */}
      {activeId === "recordatorios" && (
        <div className="dash-card" style={{ maxWidth: 520 }}>
          <div className="dash-section-title">
            Recordatorios de medicación
            <span className="hint">Actívalos o desactívalos según tu tratamiento actual</span>
          </div>
          <div className="dash-med-list">
            {recordatorios.map((rec) => (
              <div key={rec.id} className={`dash-med-item ${rec.activo ? "" : "inactivo"}`}>
                <span className="dash-med-icon">
                  <IconPill />
                </span>
                <div className="dash-med-info">
                  <div className="dash-med-name">{rec.medicamento}</div>
                  <div className="dash-med-meta">Recordatorio diario a las {rec.hora}</div>
                </div>
                <button
                  type="button"
                  className="dash-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
                  onClick={() => handleToggleRecordatorio(rec.id)}
                >
                  {rec.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────── ALERTAS ───────── */}
      {activeId === "alertas" && (
        <div className="dash-card" style={{ maxWidth: 640 }}>
          <div className="dash-section-title">
            Alertas
            <span className="hint">Valores fuera del rango normal (RF07/RF08)</span>
          </div>
          <ListaAlertas alertas={ALERTAS_MOCK} />
        </div>
      )}

      {/* ───────── REPORTES ───────── */}
      {activeId === "reportes" && (
        <div className="dash-card" style={{ maxWidth: 480 }}>
          <div className="dash-section-title">Reporte para tu médico</div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: "1.1rem" }}>
            Genera un PDF con tu historial de mediciones, gráfico de evolución y medicamentos
            activos del período seleccionado, listo para llevar a tu próxima consulta.
          </p>
          <button
            type="button"
            className="dash-btn-primary"
            onClick={() =>
              alert(
                "TODO: conectar con /api/reportes (PDFKit) — ver Evidencia1 §11.3 y Evidencia2 §6.2."
              )
            }
          >
            <IconDownload /> Descargar reporte PDF
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ────────────── Subcomponentes ────────────── */

function FiltroFechas({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {FILTROS_FECHA.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className="dash-btn-secondary"
          style={
            value === f.id
              ? { background: "var(--ink)", color: "var(--white)", borderColor: "var(--ink)" }
              : { padding: "6px 12px", fontSize: 12 }
          }
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function GraficoPresion({ datos }) {
  if (datos.length === 0) {
    return <div className="dash-empty">No hay mediciones en este período.</div>;
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={datos} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
  );
}

function TablaMediciones({ mediciones, mostrarFrecuencia = false }) {
  if (mediciones.length === 0) {
    return <div className="dash-empty">Aún no registras mediciones.</div>;
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Sistólica</th>
            <th>Diastólica</th>
            {mostrarFrecuencia && <th>Frec. cardíaca</th>}
            {mostrarFrecuencia && <th>Observaciones</th>}
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {mediciones.map((m) => (
            <tr key={m.id}>
              <td>{formatearFechaHora(m.fecha)}</td>
              <td className="ink">{m.sistolica} mmHg</td>
              <td className="ink">{m.diastolica} mmHg</td>
              {mostrarFrecuencia && <td>{m.frecuenciaCardiaca ? `${m.frecuenciaCardiaca} lpm` : "—"}</td>}
              {mostrarFrecuencia && <td>{m.observaciones || "—"}</td>}
              <td>
                <span className={`dash-stat-tag tag-${m.estado}`}>{ESTADO_LABEL[m.estado]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListaAlertas({ alertas, compacto = false }) {
  const lista = compacto ? alertas.slice(0, 3) : alertas;

  if (lista.length === 0) {
    return <div className="dash-empty">No tienes alertas registradas.</div>;
  }

  return (
    <div>
      {lista.map((a) => (
        <div key={a.id} className={`dash-alert-item ${a.tipo}`}>
          <span className={`dash-alert-icon ${a.tipo}`}>
            <IconAlertTriangle />
          </span>
          <div>
            <div className="dash-alert-text">{a.mensaje}</div>
            <div className="dash-alert-meta">
              {formatearFechaHora(a.fecha)} · {a.estado === "activo" ? "Sin resolver" : "Resuelta"}
              {a.notificado ? " · Médico notificado" : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardPaciente;
