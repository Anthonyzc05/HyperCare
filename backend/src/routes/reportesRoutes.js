const express = require("express");
const router = express.Router();

const { generarReportePaciente } = require("../controllers/reportesController");

// GET /api/reportes/paciente/:firebase_uid?dias=30
router.get("/paciente/:firebase_uid", generarReportePaciente);

module.exports = router;