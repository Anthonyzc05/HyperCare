const express = require("express");
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);

app.use("/api/reportes", reportesRoutes);


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});