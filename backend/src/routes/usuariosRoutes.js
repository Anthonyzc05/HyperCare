const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  actualizarPerfil,
  obtenerUsuario
} = require("../controllers/usuariosController");

router.post("/", registrarUsuario);

router.put("/perfil", actualizarPerfil);

// Obtener usuario por Firebase UID
router.get("/:firebase_uid", obtenerUsuario);

module.exports = router;