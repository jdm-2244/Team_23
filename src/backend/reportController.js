const volunteerHistory = require('./volunteerHistoryData');
const events = require('./eventsData');
const { generateVolunteerHistoryCSV } = require('./csvGenerator');
const { generateVolunteerHistoryPDF } = require('./pdfGenerator');

const getCSV = (req, res) => {
  const csvData = generateVolunteerHistoryCSV(volunteerHistory, events);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
  res.send(csvData);
};

const getPDF = (req, res) => {
  generateVolunteerHistoryPDF(volunteerHistory, events, res);
};

module.exports = { getCSV, getPDF };
