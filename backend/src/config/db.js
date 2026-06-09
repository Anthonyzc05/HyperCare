const mysql = require("mysql2");

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "hypercare"
});

conexion.connect((error) => {
  if (error) {
    console.error("Error de conexión a MySQL:", error);
    return;
  }

  console.log(" MySQL conectado");
});

module.exports = conexion;