const PDFDocument = require("pdfkit");
const reportesService = require("../services/reportesService");

function getEstado(sistolica, diastolica) {
  if (sistolica >= 180 || diastolica >= 120) return "Crítico";
  if (sistolica >= 120 || diastolica >= 80) return "Elevado";
  return "Normal";
}

const generarReportePaciente = (req, res) => {

  const { firebase_uid } = req.params;
  const dias = Number(req.query.dias) || 30;

  reportesService.obtenerDatosReporte(
    firebase_uid,
    dias,
    (error, datos) => {

      if (error) {
        console.error("ERROR REPORTE:", error);
        return res.status(500).json(error);
      }

      const { usuario, mediciones } = datos;

      const doc = new PDFDocument({ margin: 50, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="reporte-hta-${usuario.dni || usuario.id}.pdf"`
      );

      doc.pipe(res);

      // ── Encabezado ──
      doc.fillColor("#16304A").fontSize(20).text("Portal HTA", { continued: false });
      doc.fillColor("#AC4736").fontSize(12).text("Reporte de presión arterial");
      doc.moveDown(0.3);
      doc.fillColor("#647183").fontSize(9)
        .text(`Generado el ${new Date().toLocaleString("es-PE")}`);
      doc.moveDown(1);

      // ── Datos del paciente ──
      doc.fillColor("#16304A").fontSize(13).text("Datos del paciente", { underline: true });
      doc.moveDown(0.3);
      doc.fillColor("#3E5066").fontSize(10.5);
      doc.text(`Nombre: ${usuario.nombre}`);
      doc.text(`DNI: ${usuario.dni || "—"}`);
      doc.text(`Centro de salud: ${usuario.centro_salud || "—"}`);
      doc.text(`Período del reporte: últimos ${dias} días`);
      doc.moveDown(1);

      // ── Resumen ──
      if (mediciones.length > 0) {
        const promSist = Math.round(
          mediciones.reduce((s, m) => s + m.presion_sistolica, 0) / mediciones.length
        );
        const promDias = Math.round(
          mediciones.reduce((s, m) => s + m.presion_diastolica, 0) / mediciones.length
        );
        const criticas = mediciones.filter(
          (m) => getEstado(m.presion_sistolica, m.presion_diastolica) === "Crítico"
        ).length;

        doc.fillColor("#16304A").fontSize(13).text("Resumen del período", { underline: true });
        doc.moveDown(0.3);
        doc.fillColor("#3E5066").fontSize(10.5);
        doc.text(`Total de mediciones registradas: ${mediciones.length}`);
        doc.text(`Promedio: ${promSist}/${promDias} mmHg`);
        doc.text(`Mediciones en rango crítico: ${criticas}`);
        doc.moveDown(1);
      }

      // ── Tabla de mediciones ──
      doc.fillColor("#16304A").fontSize(13).text("Historial de mediciones", { underline: true });
      doc.moveDown(0.5);

      if (mediciones.length === 0) {
        doc.fillColor("#647183").fontSize(10.5)
          .text("No se registraron mediciones en el período seleccionado.");
      } else {
        dibujarTabla(doc, mediciones);
      }

      doc.end();

    }
  );

};

function dibujarTabla(doc, mediciones) {

  const startX = 50;
  const colWidths = [95, 65, 70, 55, 60, 150];
  const headers = ["Fecha", "Sistólica", "Diastólica", "Frec.", "Estado", "Observaciones"];

  let y = doc.y;

  const dibujarEncabezado = () => {
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill("#16304A");
    doc.fillColor("#FFFFFF").fontSize(8.5);
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x + 5, y + 6, { width: colWidths[i] - 8 });
      x += colWidths[i];
    });
    y += 20;
  };

  dibujarEncabezado();

  mediciones.forEach((m, idx) => {

    if (y > 760) {
      doc.addPage();
      y = 50;
      dibujarEncabezado();
    }

    const estado = getEstado(m.presion_sistolica, m.presion_diastolica);
    const colorEstado =
      estado === "Crítico" ? "#AC4736" : estado === "Elevado" ? "#C08A2E" : "#3A8B5C";
    const rowColor = idx % 2 === 0 ? "#F6F3EC" : "#FFFFFF";

    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 18).fill(rowColor);

    const fecha = new Date(m.fecha_medicion).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let x = startX;
    doc.fillColor("#16304A").fontSize(8);
    doc.text(fecha, x + 5, y + 5, { width: colWidths[0] - 8 });
    x += colWidths[0];
    doc.text(`${m.presion_sistolica} mmHg`, x + 5, y + 5, { width: colWidths[1] - 8 });
    x += colWidths[1];
    doc.text(`${m.presion_diastolica} mmHg`, x + 5, y + 5, { width: colWidths[2] - 8 });
    x += colWidths[2];
    doc.text(m.frecuencia_cardiaca ? `${m.frecuencia_cardiaca} lpm` : "—", x + 5, y + 5, {
      width: colWidths[3] - 8,
    });
    x += colWidths[3];
    doc.fillColor(colorEstado).text(estado, x + 5, y + 5, { width: colWidths[4] - 8 });
    x += colWidths[4];
    doc.fillColor("#3E5066").text(m.observaciones || "—", x + 5, y + 5, {
      width: colWidths[5] - 8,
    });

    y += 18;

  });

}

module.exports = {
  generarReportePaciente
};