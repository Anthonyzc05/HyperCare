const reportesModel = require("../models/reportesModel");

const obtenerDatosReporte = (firebase_uid, dias, callback) => {

  reportesModel.obtenerUsuarioConPaciente(
    firebase_uid,
    (error, usuarios) => {

      if (error) {
        return callback(error);
      }

      if (usuarios.length === 0) {
        return callback({ mensaje: "Usuario no encontrado" });
      }

      const usuario = usuarios[0];

      reportesModel.obtenerMedicionesPorUsuario(
        usuario.id,
        dias,
        (error, mediciones) => {

          if (error) {
            return callback(error);
          }

          callback(null, { usuario, mediciones });

        }
      );

    }
  );

};

module.exports = {
  obtenerDatosReporte
};