// Corrected Report Controller
const pool = require('./config/database');
const { generateVolunteerHistoryCSV } = require('./csvGenerator');
const { 
  generateVolunteerHistoryPDF, 
  generateVolunteerHistoryPDFBuffer 
} = require('./pdfGenerator');

// Helper function to get all volunteer history records with details
const getAllVolunteerHistory = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        vh.HID as id,
        CONCAT(up.first_name, ' ', up.last_name) as volunteerName,
        e.Name as eventName,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as eventDate,
        IF(vh.checkin = 1, 'Completed', 'Pending') as status,
        l.venue_name as location,
        e.max_volunteers as maxVolunteers,
        e.Description as description,
        u.role,
        e.Urgency as urgency,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM User_Skills us
          JOIN Skills s ON us.skill_id = s.skill_id
          WHERE us.user_id = vh.UID
        ) as skills
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Locations l ON e.Location_id = l.LocID
      JOIN Users u ON vh.UID = u.username
      JOIN User_Profile up ON vh.UID = up.user_id
    `);
    
    // Process skills into arrays
    return rows.map(row => ({
      ...row,
      checkedIn: row.status === 'Completed',
      skills: row.skills ? row.skills.split(',') : [],
      // Estimate hours based on check-in status (real app would have actual hours)
      hoursServed: row.status === 'Completed' ? Math.floor(Math.random() * 5) + 1 : 0
    }));
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    throw error;
  }
};

// Controller for CSV report generation
const getCSV = async (req, res) => {
  try {
    const volunteerHistory = await getAllVolunteerHistory();
    const csvData = generateVolunteerHistoryCSV(volunteerHistory);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="volunteer-report.csv"');
    res.send(csvData);
  } catch (error) {
    console.error('Error generating CSV report:', error);
    res.status(500).json({ error: 'Failed to generate CSV report' });
  }
};

// Controller for PDF report generation
const getPDF = async (req, res) => {
  try {
    const volunteerHistory = await getAllVolunteerHistory();
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="volunteer-report.pdf"');
    
    // Generate and pipe PDF
    generateVolunteerHistoryPDF(volunteerHistory, null, res);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};

// Controller for combined report (ZIP file with both CSV and PDF)
const getAll = async (req, res) => {
  try {
    const JSZip = require('jszip');
    
    // Get volunteer history data
    const volunteerHistory = await getAllVolunteerHistory();
    
    // Generate both formats
    const csvData = generateVolunteerHistoryCSV(volunteerHistory);
    const pdfBuffer = await generateVolunteerHistoryPDFBuffer(volunteerHistory, null);
    
    // Create a zip file with both
    const zip = new JSZip();
    zip.file('volunteer-report.csv', csvData);
    zip.file('volunteer-report.pdf', pdfBuffer);
    
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteer-reports.zip');
    res.send(zipContent);
  } catch (error) {
    console.error('Error generating combined reports:', error);
    res.status(500).json({ error: 'Failed to generate combined reports' });
  }
};

module.exports = { getCSV, getPDF, getAll };