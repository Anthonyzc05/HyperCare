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

          // Guarda los datos en la tabla correspondiente según el rol.
          // ANTES: solo existía la rama PACIENTE, así que MEDICO y ADMIN
          // caían en el "else" y nunca se guardaba nada en `medicos`
          // ni en `administradores`.
          if (datos.rol === "PACIENTE") {

            usuarioModel.guardarPaciente(
              usuario.id,
              datos,
              callback
            );

          } else if (datos.rol === "MEDICO") {

            usuarioModel.guardarMedico(
              usuario.id,
              datos,
              callback
            );

          } else if (datos.rol === "ADMIN") {

            usuarioModel.guardarAdministrador(
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

// NUEVO: usados por el Dashboard Admin
const listarUsuarios = (callback) => {

  usuarioModel.listarUsuarios(callback);

};

const obtenerEstadisticas = (callback) => {

  usuarioModel.obtenerEstadisticas(callback);

};

module.exports = {
  registrarUsuario,
  actualizarPerfil,
  obtenerUsuario,
  listarUsuarios,
  obtenerEstadisticas
};