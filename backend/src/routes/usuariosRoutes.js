const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  actualizarPerfil,
  obtenerUsuario,
  listarUsuarios,
  obtenerEstadisticas
} = require("../controllers/usuariosController");

router.post("/", registrarUsuario);

// NUEVO: GET /api/usuarios -> lista completa (Dashboard Admin)
router.get("/", listarUsuarios);

// NUEVO: GET /api/usuarios/stats/resumen -> contadores para las tarjetas
router.get("/stats/resumen", obtenerEstadisticas);

router.put("/perfil", actualizarPerfil);

// Obtener usuario por Firebase UID
// (va al final porque "/:firebase_uid" coincide con cualquier cosa de un
// solo segmento; las rutas más específicas de arriba deben ir primero)
router.get("/:firebase_uid", obtenerUsuario);

module.exports = router;