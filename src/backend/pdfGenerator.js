const PDFDocument = require('pdfkit');

const generateVolunteerHistoryPDF = (volunteerHistory, events, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(16).text('Volunteer Activity Report', { align: 'center' });
  doc.moveDown();
  volunteerHistory.forEach(rec => {
    doc.fontSize(12).text(`Volunteer: ${rec.volunteerName}`);
    doc.text(`Event: ${rec.eventName}`);
    doc.text(`Date: ${rec.eventDate}`);
    doc.text(`Status: ${rec.status || (rec.checkedIn ? 'Completed' : 'Pending')}`);
    doc.text(`Hours: ${rec.hoursServed}`);
    doc.moveDown();
  });
  doc.end();
};

module.exports = { generateVolunteerHistoryPDF };
