// Enhanced PDF Generator
const PDFDocument = require('pdfkit');

const generateVolunteerHistoryPDF = (volunteerHistory, events, res) => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Set up some document properties
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .text('Volunteer Activity Report', { align: 'center' });
    
    doc.moveDown();
    
    // Add the generation date
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    
    doc.moveDown(2);
    
    // For each volunteer record
    volunteerHistory.forEach((record, index) => {
      // If not the first record, add a page break
      if (index > 0) {
        doc.addPage();
      }
      
      // Add volunteer information
      doc.font('Helvetica-Bold').fontSize(16)
         .text('Volunteer Information');
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Name:');
      doc.font('Helvetica').text(record.volunteerName);
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Role:');
      doc.font('Helvetica').text(record.role || 'N/A');
      
      if (record.skills && record.skills.length > 0) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Skills:');
        const skillsText = Array.isArray(record.skills) 
          ? record.skills.join(', ') 
          : record.skills;
        doc.font('Helvetica').text(skillsText);
      }
      
      // Add event information
      doc.moveDown(1.5);
      doc.font('Helvetica-Bold').fontSize(16)
         .text('Event Information');
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Event:');
      doc.font('Helvetica').text(record.eventName);
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Date:');
      doc.font('Helvetica').text(record.eventDate);
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Location:');
      doc.font('Helvetica').text(record.location || 'N/A');
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Description:');
      doc.font('Helvetica').text(record.description || 'N/A');
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Urgency:');
      doc.font('Helvetica').text(record.urgency || 'N/A');
      
      // Add participation details
      doc.moveDown(1.5);
      doc.font('Helvetica-Bold').fontSize(16)
         .text('Participation Details');
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Status:');
      doc.font('Helvetica').text(record.status);
      
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Hours:');
      doc.font('Helvetica').text(record.hoursServed?.toString() || 'N/A');
    });
    
    // Finalize PDF file
    doc.end();
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Function to generate PDF as a buffer (for the combined export)
const generateVolunteerHistoryPDFBuffer = (volunteerHistory, events) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Collect PDF data chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
      
      // Set up some document properties
      doc.font('Helvetica-Bold')
         .fontSize(20)
         .text('Volunteer Activity Report', { align: 'center' });
      
      doc.moveDown();
      
      // Add the generation date
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
      
      doc.moveDown(2);
      
      // For each volunteer record
      volunteerHistory.forEach((record, index) => {
        // If not the first record, add a page break
        if (index > 0) {
          doc.addPage();
        }
        
        // Add volunteer information
        doc.font('Helvetica-Bold').fontSize(16)
           .text('Volunteer Information');
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Name:');
        doc.font('Helvetica').text(record.volunteerName);
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Role:');
        doc.font('Helvetica').text(record.role || 'N/A');
        
        if (record.skills && record.skills.length > 0) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(12).text('Skills:');
          const skillsText = Array.isArray(record.skills) 
            ? record.skills.join(', ') 
            : record.skills;
          doc.font('Helvetica').text(skillsText);
        }
        
        // Add event information
        doc.moveDown(1.5);
        doc.font('Helvetica-Bold').fontSize(16)
           .text('Event Information');
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Event:');
        doc.font('Helvetica').text(record.eventName);
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Date:');
        doc.font('Helvetica').text(record.eventDate);
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Location:');
        doc.font('Helvetica').text(record.location || 'N/A');
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Description:');
        doc.font('Helvetica').text(record.description || 'N/A');
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Urgency:');
        doc.font('Helvetica').text(record.urgency || 'N/A');
        
        // Add participation details
        doc.moveDown(1.5);
        doc.font('Helvetica-Bold').fontSize(16)
           .text('Participation Details');
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Status:');
        doc.font('Helvetica').text(record.status);
        
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text('Hours:');
        doc.font('Helvetica').text(record.hoursServed?.toString() || 'N/A');
      });
      
      // Finalize PDF file
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { 
  generateVolunteerHistoryPDF,
  generateVolunteerHistoryPDFBuffer
};