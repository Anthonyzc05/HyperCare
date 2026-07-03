/* ============================================
   presion.js — Reglas clínicas de Portal HTA
   Basado en la sección 11.1 (Evidencia1) del proyecto
   Usar en src/utils/presion.js
   ============================================ */

// Rango aceptable para el formulario (RF04)
export const RANGO_VALIDO = {
  sistolica: { min: 60, max: 250 },
  diastolica: { min: 40, max: 150 },
};

// Umbrales clínicos (11.1 Reglas de Validación)
export const UMBRALES = {
  sistolica: { normalMax: 119, elevadoMax: 179 }, // >=180 crítico
  diastolica: { normalMax: 79, elevadoMax: 119 }, // >=120 crítico
};

export const ESTADO_LABEL = {
  normal: "Normal",
  elevado: "Elevado",
  critico: "Crítico",
};

export const ESTADO_COLOR = {
  normal: "#3A8B5C",
  elevado: "#C08A2E",
  critico: "#AC4736",
};

/**
 * Determina el estado clínico de una medición según sistólica/diastólica.
 * Regla: si cualquiera de las dos entra en un rango mayor, gana el rango mayor.
 */
export function getEstadoPresion(sistolica, diastolica) {
  if (sistolica >= 180 || diastolica >= 120) return "critico";
  if (sistolica >= 120 || diastolica >= 80) return "elevado";
  return "normal";
}

/** Valida que los valores estén dentro del rango clínico aceptable (RF04). */
export function validarRangoPresion(sistolica, diastolica) {
  const errores = [];

  if (
    Number.isNaN(sistolica) ||
    sistolica < RANGO_VALIDO.sistolica.min ||
    sistolica > RANGO_VALIDO.sistolica.max
  ) {
    errores.push(
      `La presión sistólica debe estar entre ${RANGO_VALIDO.sistolica.min} y ${RANGO_VALIDO.sistolica.max} mmHg.`
    );
  }

  if (
    Number.isNaN(diastolica) ||
    diastolica < RANGO_VALIDO.diastolica.min ||
    diastolica > RANGO_VALIDO.diastolica.max
  ) {
    errores.push(
      `La presión diastólica debe estar entre ${RANGO_VALIDO.diastolica.min} y ${RANGO_VALIDO.diastolica.max} mmHg.`
    );
  }

  return { valido: errores.length === 0, errores };
}

/** Formatea una fecha ISO a "dd/mm/yyyy · hh:mm" en es-PE. */
export function formatearFechaHora(fechaIso) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
