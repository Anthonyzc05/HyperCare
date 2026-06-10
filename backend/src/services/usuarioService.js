const usuarioModel = require("../models/usuarioModel");

const registrarUsuario = (usuario, callback) => {
  usuarioModel.crearUsuario(usuario, callback);
};

module.exports = {
  registrarUsuario
};