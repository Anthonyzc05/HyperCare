/* ============================================
   mockDataMedico.js — Datos de ejemplo
   Alineado al esquema MySQL real de HyperCare:
     - usuarios(nombre, email, rol, centro_salud, ...)
     - mediciones(usuario_id, presion_sistolica, presion_diastolica,
       frecuencia_cardiaca, observaciones, fecha_medicion)
   No existen tablas `medicamentos` ni `prescripciones` en la BD
   actual: se mockean aquí para poder maquetar la pantalla y se
   marcan con TODO backend en cada punto de integración futura.

   TODO backend: reemplazar por fetch cuando existan endpoints:
     - GET  /api/medico/:firebase_uid/pacientes
     - GET  /api/pacientes/:id/mediciones
     - GET  /api/pacientes/:id/medicamentos
     - POST /api/pacientes/:id/medicamentos
   Usar en src/Data/mockDataMedico.js
   ============================================ */

import { getEstadoPresion } from "../utils/presion";

export const DOCTOR_MOCK = {
  nombre: "Dr. Ramírez",
  especialidad: "Cardiología",
  centroSalud: "Hospital Nacional Dos de Mayo",
};

function crearMedicion(diasAtras, sistolica, diastolica, hora = "08:15") {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  const [h, m] = hora.split(":");
  fecha.setHours(Number(h), Number(m), 0, 0);

  return {
    id: `med-${diasAtras}-${sistolica}-${diastolica}`,
    fecha: fecha.toISOString(), // ← fecha_medicion
    hora,
    sistolica, // ← presion_sistolica
    diastolica, // ← presion_diastolica
    pulso: 60 + Math.round(Math.random() * 40), // ← frecuencia_cardiaca
    estado: getEstadoPresion(sistolica, diastolica),
  };
}

function crearPaciente({ id, nombre, dni, fechaNacimiento, medicamentos, mediciones }) {
  const medicionesOrdenadas = [...mediciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultima = medicionesOrdenadas[0];

  // Línea de tiempo: combina mediciones + eventos de medicación (RF sugerido, no hay tabla `eventos`)
  const eventos = [
    ...medicionesOrdenadas.map((m) => ({
      id: `evt-${m.id}`,
      tipo: "medicion",
      fecha: m.fecha,
      estado: m.estado,
      detalle: `presión sistólica:${m.sistolica}`,
      detalle2: `presión diastólica:${m.diastolica}`,
    })),
    ...medicamentos.map((med) => ({
      id: `evt-${med.id}`,
      tipo: "medicamento",
      fecha: med.fechaInicio,
      estado: med.alerta ? "elevado" : "normal",
      detalle: med.nombre,
      detalle2: `${med.dosis} · ${med.frecuencia}`,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return {
    id,
    nombre,
    dni,
    fechaNacimiento,
    estadoGeneral: ultima ? (ultima.estado === "normal" ? "Estable" : ultima.estado === "elevado" ? "En observación" : "Crítico") : "Sin datos",
    ultimaCita: ultima?.fecha ?? null,
    mediciones: medicionesOrdenadas,
    medicamentos,
    eventos,
    // TODO backend: reemplazar por el firebase_uid real del paciente cuando
    // el doctor pueda ver pacientes conectados a su propia cuenta en BD.
    firebaseUid: null,
  };
}

export const PACIENTES_MOCK = [
  crearPaciente({
    id: "pac-1",
    nombre: "Ana Lucía Fernández",
    dni: "72918345",
    fechaNacimiento: "2003-03-15",
    mediciones: [
      crearMedicion(0, 193, 110, "06:10"),
      crearMedicion(4, 190, 108, "06:27"),
      crearMedicion(9, 190, 107, "06:40"),
      crearMedicion(12, 180, 100, "06:31"),
      crearMedicion(20, 129, 82, "07:05"),
      crearMedicion(30, 128, 79, "07:12"),
    ],
    medicamentos: [
      { id: "medi-1", nombre: "Enalapril", dosis: "10 mg", frecuencia: "1 vez al día", fechaInicio: "2023-08-21", alerta: true },
      { id: "medi-2", nombre: "Sintrace", dosis: "5 mg", frecuencia: "2 veces al día", fechaInicio: "2023-08-28", alerta: false },
      { id: "medi-3", nombre: "Tiamodol", dosis: "20 mg", frecuencia: "1 vez al día", fechaInicio: "2024-09-01", alerta: false },
    ],
  }),
  crearPaciente({
    id: "pac-2",
    nombre: "Jorge Salazar Vidal",
    dni: "45123678",
    fechaNacimiento: "1968-11-02",
    mediciones: [
      crearMedicion(1, 138, 88, "07:20"),
      crearMedicion(6, 142, 91, "07:15"),
      crearMedicion(14, 121, 79, "07:30"),
      crearMedicion(25, 118, 76, "07:10"),
    ],
    medicamentos: [
      { id: "medi-4", nombre: "Losartán", dosis: "50 mg", frecuencia: "1 vez al día", fechaInicio: "2023-05-10", alerta: false },
    ],
  }),
  crearPaciente({
    id: "pac-3",
    nombre: "Rosa Huamán Torres",
    dni: "10456789",
    fechaNacimiento: "1975-06-27",
    mediciones: [
      crearMedicion(2, 165, 98, "08:00"),
      crearMedicion(8, 170, 101, "08:05"),
      crearMedicion(18, 150, 94, "08:00"),
    ],
    medicamentos: [
      { id: "medi-5", nombre: "Amlodipino", dosis: "5 mg", frecuencia: "1 vez al día", fechaInicio: "2024-01-14", alerta: true },
      { id: "medi-6", nombre: "Hidroclorotiazida", dosis: "25 mg", frecuencia: "1 vez al día", fechaInicio: "2024-01-14", alerta: false },
    ],
  }),
];

// Catálogo simple para el formulario de prescripción (no existe tabla `medicamentos_catalogo`)
export const CATALOGO_MEDICAMENTOS = [
  { nombre: "Enalapril", dosis: ["5 mg", "10 mg", "20 mg"] },
  { nombre: "Losartán", dosis: ["25 mg", "50 mg", "100 mg"] },
  { nombre: "Amlodipino", dosis: ["5 mg", "10 mg"] },
  { nombre: "Hidroclorotiazida", dosis: ["12.5 mg", "25 mg"] },
  { nombre: "Tiamodol", dosis: ["20 mg", "50 mg"] },
];

export const FRECUENCIAS = ["1 vez al día", "2 veces al día", "3 veces al día", "Cada 12 horas", "Cada 8 horas"];

export const TIPOS_REPORTE = [
  { id: "general", nombre: "Reporte General", descripcion: "Informe detallado de resumen de salud del paciente" },
  { id: "mediciones", nombre: "Nuevas Mediciones", descripcion: "Reporte de los eventos y registro de mediciones" },
  { id: "historial", nombre: "Historial Clínico", descripcion: "Resumen de las últimas tomas registradas" },
  { id: "prescripciones", nombre: "Prescripciones Activas", descripcion: "Listado de los medicamentos y datos relevantes" },
  { id: "perfil", nombre: "Perfil Demográfico", descripcion: "Listado de información de contacto del paciente" },
  { id: "graficos", nombre: "Gráficos de Evolución", descripcion: "Análisis gráfico y tendencias de PA" },
  { id: "alertas", nombre: "Registro de Alertas", descripcion: "Eventos gráficos y notificaciones de sistema" },
];
