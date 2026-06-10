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

module.exports = {
  crearUsuario
};