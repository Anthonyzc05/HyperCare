const usuarioService = require("../services/usuarioService");

const registrarUsuario = (req, res) => {

  console.log("DATOS RECIBIDOS:");
  console.log(req.body);

  usuarioService.registrarUsuario(req.body, (error, resultado) => {

    if (error) {
      console.error("ERROR MYSQL:", error);
      return res.status(500).json(error);
    }

    res.status(201).json({
      mensaje: "Usuario registrado correctamente"
    });

  });

};

const actualizarPerfil = (req, res) => {

  usuarioService.actualizarPerfil(req.body, (error, resultado) => {

    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }

    res.json({
      mensaje: "Perfil actualizado correctamente"
    });

  });

};

const obtenerUsuario = (req, res) => {

  const firebase_uid = req.params.firebase_uid;

  usuarioService.obtenerUsuario(
    firebase_uid,
    (error, resultado) => {

      if (error) {
        console.error(error);
        return res.status(500).json(error);
      }

      if (resultado.length === 0) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado"
        });
      }

      res.json(resultado[0]);

    }
  );

};

// NUEVO: lista completa de usuarios (con datos de paciente/medico/admin
// ya unidos) para alimentar el Dashboard Admin.
const listarUsuarios = (req, res) => {

  usuarioService.listarUsuarios((error, resultado) => {

    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }

    res.json(resultado);

  });

};

// NUEVO: contadores para las tarjetas de resumen del Dashboard Admin.
const obtenerEstadisticas = (req, res) => {

  usuarioService.obtenerEstadisticas((error, resultado) => {

    if (error) {
      console.error(error);
      return res.status(500).json(error);
    }

    res.json(resultado);

  });

};

module.exports = {
  registrarUsuario,
  actualizarPerfil,
  obtenerUsuario,
  listarUsuarios,
  obtenerEstadisticas
};