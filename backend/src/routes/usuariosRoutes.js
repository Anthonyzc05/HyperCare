const express = require("express");
const router = express.Router();

const {
  registrarUsuario
} = require("../controllers/usuariosController");

router.post("/", registrarUsuario);

module.exports = router;