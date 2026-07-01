const usuarioModel = require("../models/usuarioModel");

const registrarUsuario = (usuario, callback) => {

  usuarioModel.buscarPorCorreo(
    usuario.email,
    (error, resultado) => {

      if (error) {
        return callback(error);
      }

      if (resultado.length > 0) {
        return callback(null, {
          mensaje: "Usuario ya existe"
        });
      }

      usuarioModel.crearUsuario(
        usuario,
        callback
      );

    }
  );

};

const actualizarPerfil = (datos, callback) => {

  // Actualiza el rol y marca el perfil como completo
  usuarioModel.actualizarPerfil(
    datos,
    (error) => {

      if (error) {
        return callback(error);
      }

      // Busca el usuario para obtener su ID
      usuarioModel.buscarPorFirebaseUID(
        datos.firebase_uid,
        (error, resultado) => {

          if (error) {
            return callback(error);
          }

          if (resultado.length === 0) {
            return callback({
              mensaje: "Usuario no encontrado"
            });
          }

          const usuario = resultado[0];

          // Guarda los datos en la tabla pacientes
          if (datos.rol === "PACIENTE") {

            usuarioModel.guardarPaciente(
              usuario.id,
              datos,
              callback
            );

          } else {

            callback(null);

          }

        }
      );

    }
  );

};

const obtenerUsuario = (firebase_uid, callback) => {

  usuarioModel.buscarPorFirebaseUID(
    firebase_uid,
    callback
  );

};

module.exports = {
  registrarUsuario,
  actualizarPerfil,
  obtenerUsuario
};