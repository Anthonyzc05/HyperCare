const usuarioService = require("../services/usuarioService");

const registrarUsuario = (req, res) => {

  console.log("DATOS RECIBIDOS:");
  console.log(req.body);

  usuarioService.registrarUsuario(req.body, (error, resultado) => {

    if (error) {
      console.error("ERROR MYSQL:", error);
      return res.status(500).json(error);
    }

    console.log("USUARIO REGISTRADO");

    res.status(201).json({
      mensaje: "Usuario registrado correctamente"
    });

  });
};

const actualizarRol = (req, res) => {

  usuarioService.actualizarRol(req.body, (error, resultado) => {

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      mensaje: "Rol actualizado correctamente"
    });

  });

};

module.exports = {
  registrarUsuario,
  actualizarRol
};