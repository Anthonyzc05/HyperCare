/* ============================================
   mockDataPaciente.js — Datos de ejemplo
   Alineado al esquema MySQL real de HyperCare:
     - mediciones(usuario_id, presion_sistolica, presion_diastolica,
       frecuencia_cardiaca, observaciones, fecha_medicion)
     - recordatorios(usuario_id, medicamento, hora, activo)
   No existe tabla `alertas`: las alertas se calculan a partir
   de `mediciones`, no se almacenan.

   TODO backend: reemplazar por fetch cuando existan los
   endpoints /api/mediciones y /api/recordatorios (aún no
   implementados — solo existe /api/usuarios).
   Al conectar la API real, mapear así:
     presion_sistolica   -> sistolica
     presion_diastolica  -> diastolica
     frecuencia_cardiaca -> frecuenciaCardiaca
     fecha_medicion      -> fecha
   Usar en src/data/mockDataPaciente.js
   ============================================ */

import { getEstadoPresion } from "../utils/presion";

function crearMedicion(diasAtras, sistolica, diastolica, hora = "08:15", observaciones = "") {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  const [h, m] = hora.split(":");
  fecha.setHours(Number(h), Number(m), 0, 0);

  return {
    id: `med-${diasAtras}-${sistolica}-${diastolica}`,
    fecha: fecha.toISOString(), // ← fecha_medicion
    sistolica, // ← presion_sistolica
    diastolica, // ← presion_diastolica
    frecuenciaCardiaca: 70 + Math.round(Math.random() * 15), // ← frecuencia_cardiaca
    observaciones, // ← observaciones
    estado: getEstadoPresion(sistolica, diastolica), // calculado, no se guarda en BD
  };
}

export const MEDICIONES_MOCK = [
  crearMedicion(0, 128, 84, "07:40"),
  crearMedicion(1, 132, 88, "08:10"),
  crearMedicion(3, 118, 76, "07:55"),
  crearMedicion(5, 145, 92, "20:30", "Dolor de cabeza leve."),
  crearMedicion(8, 121, 79, "08:00"),
  crearMedicion(10, 184, 122, "13:20", "Mareo, se registró en reposo."),
  crearMedicion(13, 130, 85, "08:05"),
  crearMedicion(16, 124, 80, "07:50"),
  crearMedicion(19, 119, 78, "08:15"),
  crearMedicion(22, 138, 90, "19:45"),
].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

// Corresponde 1:1 a la tabla `recordatorios` (medicamento, hora, activo)
export const RECORDATORIOS_MOCK = [
  { id: "rec-1", medicamento: "Losartán 50 mg", hora: "07:00", activo: true },
  { id: "rec-2", medicamento: "Amlodipino 5 mg", hora: "21:00", activo: true },
  { id: "rec-3", medicamento: "Hidroclorotiazida 25 mg", hora: "08:00", activo: false },
];

// No hay tabla `alertas` en la BD: se derivan de las mediciones críticas/elevadas.
export const ALERTAS_MOCK = MEDICIONES_MOCK.filter((m) => m.estado !== "normal")
  .slice(-3)
  .reverse()
  .map((m, i) => ({
    id: `alerta-${m.id}`,
    fecha: m.fecha,
    tipo: m.estado,
    mensaje: `Presión ${m.estado === "critico" ? "crítica" : "elevada"} registrada: ${m.sistolica}/${m.diastolica} mmHg.`,
    notificado: true,
    estado: i === 0 ? "activo" : "resuelto",
  }));

export const PACIENTE_MOCK = {
  nombre: "Carlos Mendoza",
  dni: "45123678",
  centroSalud: "Hospital Nacional Dos de Mayo",
  medicoAsignado: "Dr. Sergio García",
  proximaCita: (() => {
    const f = new Date();
    f.setDate(f.getDate() + 9);
    return f.toISOString();
  })(),
};
