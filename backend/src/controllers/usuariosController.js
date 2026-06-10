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

module.exports = {
  registrarUsuario
};