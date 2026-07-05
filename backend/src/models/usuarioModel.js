const db = require("../config/db");

const crearUsuario = (usuario, callback) => {

  const sql = `
    INSERT INTO usuarios
    (firebase_uid, nombre, correo, foto)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      usuario.firebase_uid,
      usuario.nombre,
      usuario.email,
      usuario.foto
    ],
    callback
  );

};

const buscarPorCorreo = (correo, callback) => {

  const sql = `
    SELECT * FROM usuarios
    WHERE correo = ?
  `;

  db.query(sql, [correo], callback);

};

const buscarPorFirebaseUID = (firebase_uid, callback) => {

  const sql = `
    SELECT *
    FROM usuarios
    WHERE firebase_uid = ?
  `;

  db.query(sql, [firebase_uid], callback);

};

const actualizarPerfil = (datos, callback) => {

  const sql = `
    UPDATE usuarios
    SET
      rol = ?,
      perfil_completo = TRUE
    WHERE firebase_uid = ?
  `;

  db.query(
    sql,
    [
      datos.rol,
      datos.firebase_uid
    ],
    callback
  );

};

const guardarPaciente = (usuario_id, datos, callback) => {

  const sql = `
    INSERT INTO pacientes
    (
      usuario_id,
      dni,
      telefono,
      fecha_nacimiento,
      direccion,
      centro_salud
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE

      dni = VALUES(dni),
      telefono = VALUES(telefono),
      fecha_nacimiento = VALUES(fecha_nacimiento),
      direccion = VALUES(direccion),
      centro_salud = VALUES(centro_salud)

  `;

  db.query(
    sql,
    [
      usuario_id,
      datos.dni,
      datos.telefono,
      datos.fecha_nacimiento,
      datos.direccion,
      datos.centro_salud
    ],
    callback
  );

};

// NUEVO: antes no existía. Sin esto, elegir "MEDICO" en el registro
// actualizaba el rol en `usuarios` pero nunca insertaba nada en `medicos`.
const guardarMedico = (usuario_id, datos, callback) => {

  const sql = `
    INSERT INTO medicos
    (
      usuario_id,
      cmp,
      especialidad,
      centro_salud,
      telefono,
      direccion
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE

      cmp = VALUES(cmp),
      especialidad = VALUES(especialidad),
      centro_salud = VALUES(centro_salud),
      telefono = VALUES(telefono),
      direccion = VALUES(direccion)

  `;

  db.query(
    sql,
    [
      usuario_id,
      datos.cmp,
      datos.especialidad,
      datos.centro_salud,
      datos.telefono || null,
      datos.direccion || null
    ],
    callback
  );

};

// NUEVO: mismo problema que con médicos, pero para administradores.
const guardarAdministrador = (usuario_id, datos, callback) => {

  const sql = `
    INSERT INTO administradores
    (
      usuario_id,
      cargo,
      area,
      telefono
    )
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE

      cargo = VALUES(cargo),
      area = VALUES(area),
      telefono = VALUES(telefono)

  `;

  db.query(
    sql,
    [
      usuario_id,
      datos.cargo,
      datos.area,
      datos.telefono || null
    ],
    callback
  );

};

// NUEVO: listado completo para el Dashboard Admin, con los datos
// propios de cada rol ya unidos (LEFT JOIN) en una sola fila por usuario.
const listarUsuarios = (callback) => {

  const sql = `
    SELECT
      u.id,
      u.firebase_uid,
      u.nombre,
      u.correo,
      u.foto,
      u.rol,
      u.perfil_completo,
      u.fecha_registro,

      p.dni                  AS paciente_dni,
      p.telefono             AS paciente_telefono,
      p.fecha_nacimiento     AS paciente_fecha_nacimiento,
      p.direccion            AS paciente_direccion,
      p.centro_salud         AS paciente_centro_salud,

      m.cmp                  AS medico_cmp,
      m.especialidad         AS medico_especialidad,
      m.centro_salud         AS medico_centro_salud,
      m.telefono             AS medico_telefono,
      m.direccion            AS medico_direccion,

      a.cargo                AS admin_cargo,
      a.area                 AS admin_area,
      a.telefono             AS admin_telefono

    FROM usuarios u
    LEFT JOIN pacientes       p ON p.usuario_id = u.id
    LEFT JOIN medicos         m ON m.usuario_id = u.id
    LEFT JOIN administradores a ON a.usuario_id = u.id
    ORDER BY u.fecha_registro DESC
  `;

  db.query(sql, callback);

};

// NUEVO: contadores para las tarjetas de resumen del Dashboard Admin.
const obtenerEstadisticas = (callback) => {

  const sql = `
    SELECT
      COUNT(*)                                   AS total,
      SUM(rol = 'PACIENTE')                      AS pacientes,
      SUM(rol = 'MEDICO')                        AS medicos,
      SUM(rol = 'ADMIN')                         AS admins,
      SUM(rol IS NULL)                           AS sin_rol,
      SUM(perfil_completo = 0)                   AS perfiles_incompletos
    FROM usuarios
  `;

  db.query(sql, (error, resultado) => {

    if (error) {
      return callback(error);
    }

    callback(null, resultado[0]);

  });

};

module.exports = {
  crearUsuario,
  buscarPorCorreo,
  buscarPorFirebaseUID,
  actualizarPerfil,
  guardarPaciente,
  guardarMedico,
  guardarAdministrador,
  listarUsuarios,
  obtenerEstadisticas
};