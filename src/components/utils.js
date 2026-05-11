import { jsPDF } from "jspdf";

export function getRank(wpm) {
  if (wpm >= 80)
    return { rank: "S", label: "Esperto Assoluto", color: "#f59e0b" };
  if (wpm >= 60) return { rank: "A", label: "Velocista", color: "#7c6ef5" };
  if (wpm >= 40) return { rank: "B", label: "Intermedio", color: "#34d399" };
  return { rank: "C", label: "Principiante", color: "#6b6b85" };
}

export function generateCertificatePDF(name, wpm, accuracy, time, rank, date) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297,
    H = 210;

  // Background
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, W, H, "F");

  // Border outer
  doc.setDrawColor(124, 110, 245);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.5);
  doc.rect(11, 11, W - 22, H - 22);

  // Corner decorations
  const corners = [
    [14, 14],
    [W - 14, 14],
    [14, H - 14],
    [W - 14, H - 14],
  ];
  corners.forEach(([x, y]) => {
    doc.setFillColor(124, 110, 245);
    doc.circle(x, y, 2, "F");
  });

  // Header decoration line
  doc.setDrawColor(124, 110, 245);
  doc.setLineWidth(0.3);
  doc.line(30, 35, W - 30, 35);
  doc.line(30, 37, W - 30, 37);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(124, 110, 245);
  doc.text("TYPEMASTER — CERTIFICATO UFFICIALE", W / 2, 28, {
    align: "center",
  });

  // Main title
  doc.setFontSize(32);
  doc.setTextColor(232, 232, 240);
  doc.text("Certificato di", W / 2, 55, { align: "center" });
  doc.setFontSize(38);
  doc.setTextColor(124, 110, 245);
  doc.text("Velocità di Digitazione", W / 2, 70, { align: "center" });

  // Subtitle line
  doc.setDrawColor(60, 60, 80);
  doc.setLineWidth(0.3);
  doc.line(30, 77, W - 30, 77);

  // Name section
  doc.setFontSize(12);
  doc.setTextColor(107, 107, 133);
  doc.setFont("helvetica", "normal");
  doc.text("Si certifica che", W / 2, 90, { align: "center" });

  doc.setFontSize(26);
  doc.setTextColor(232, 232, 240);
  doc.setFont("helvetica", "bold");
  doc.text(name || "Candidato", W / 2, 103, { align: "center" });

  // Underline name
  const nameWidth = doc.getStringUnitWidth(name || "Candidato") * 26 * 0.352778;
  doc.setDrawColor(124, 110, 245);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - nameWidth / 2, 105, W / 2 + nameWidth / 2, 105);

  doc.setFontSize(11);
  doc.setTextColor(107, 107, 133);
  doc.setFont("helvetica", "normal");
  doc.text(
    "ha completato con successo il test di velocità di digitazione",
    W / 2,
    115,
    { align: "center" },
  );

  // Stats boxes
  const stats = [
    { label: "Velocità", value: `${wpm}`, unit: "WPM" },
    { label: "Accuratezza", value: `${accuracy}`, unit: "%" },
    { label: "Tempo", value: `${time}`, unit: "sec" },
    { label: "Grado", value: rank, unit: "" },
  ];

  const boxW = 48,
    boxH = 28,
    startX = 30,
    boxY = 125,
    gap = (W - 60 - boxW * 4) / 3;

  stats.forEach((s, i) => {
    const x = startX + i * (boxW + gap);
    doc.setFillColor(28, 28, 39);
    doc.setDrawColor(42, 42, 61);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, boxY, boxW, boxH, 3, 3, "FD");

    doc.setFontSize(7);
    doc.setTextColor(107, 107, 133);
    doc.setFont("helvetica", "bold");
    doc.text(s.label.toUpperCase(), x + boxW / 2, boxY + 7, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setTextColor(232, 232, 240);
    doc.setFont("helvetica", "bold");
    doc.text(s.value, x + boxW / 2, boxY + 17, { align: "center" });

    if (s.unit) {
      doc.setFontSize(7);
      doc.setTextColor(124, 110, 245);
      doc.text(s.unit, x + boxW / 2, boxY + 23, { align: "center" });
    }
  });

  // Bottom decoration
  doc.setDrawColor(42, 42, 61);
  doc.setLineWidth(0.3);
  doc.line(30, 162, W - 30, 162);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(107, 107, 133);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${date}`, 40, 172);
  doc.text("TypeMaster — Test di Velocità di Digitazione", W / 2, 172, {
    align: "center",
  });
  doc.text("Documento generato automaticamente", W - 40, 172, {
    align: "right",
  });

  // Seal circle
  doc.setDrawColor(124, 110, 245);
  doc.setLineWidth(1);
  doc.circle(W - 45, 145, 18);
  doc.setLineWidth(0.4);
  doc.circle(W - 45, 145, 15);
  doc.setFontSize(7);
  doc.setTextColor(124, 110, 245);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIF.", W - 45, 143, { align: "center" });
  doc.text("UFFICIALE", W - 45, 149, { align: "center" });

  doc.save(
    `TypeMaster_Certificato_${(name || "candidato").replace(/\s+/g, "_")}.pdf`,
  );
}
