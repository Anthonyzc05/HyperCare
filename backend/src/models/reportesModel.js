const db = require("../config/db");

// Trae datos del usuario + su info de paciente (si tiene)
const obtenerUsuarioConPaciente = (firebase_uid, callback) => {

  const sql = `
    SELECT
      u.id,
      u.nombre,
      u.correo,
      p.dni,
      p.centro_salud
    FROM usuarios u
    LEFT JOIN pacientes p ON p.usuario_id = u.id
    WHERE u.firebase_uid = ?
  `;

  db.query(sql, [firebase_uid], callback);

};

// Mediciones del usuario dentro de los últimos N días
const obtenerMedicionesPorUsuario = (usuario_id, dias, callback) => {

  const sql = `
    SELECT
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      observaciones,
      fecha_medicion
    FROM mediciones
    WHERE usuario_id = ?
      AND fecha_medicion >= DATE_SUB(NOW(), INTERVAL ? DAY)
    ORDER BY fecha_medicion ASC
  `;

  db.query(sql, [usuario_id, dias], callback);

};

module.exports = {
  obtenerUsuarioConPaciente,
  obtenerMedicionesPorUsuario
};