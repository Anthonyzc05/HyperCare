require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./src/config/db");

const usuariosRoutes = require("./src/routes/usuariosRoutes");
const reportesRoutes = require("./src/routes/reportesRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/reportes", reportesRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend funcionando correctamente"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});