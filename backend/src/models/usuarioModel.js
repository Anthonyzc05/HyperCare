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

module.exports = {
  crearUsuario,
  buscarPorCorreo,
  buscarPorFirebaseUID,
  actualizarPerfil,
  guardarPaciente
};