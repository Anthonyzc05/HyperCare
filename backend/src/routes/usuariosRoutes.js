const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  actualizarRol
} = require("../controllers/usuariosController");

router.post("/", registrarUsuario);
router.put("/rol", actualizarRol);

module.exports = router;