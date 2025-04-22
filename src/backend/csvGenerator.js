// Corrected CSV Generator
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const generateVolunteerHistoryCSV = (volunteerHistory) => {
  try {
    // Define CSV header
    const csvStringifier = createCsvStringifier({
      header: [
        { id: 'volunteerName', title: 'Volunteer' },
        { id: 'eventName', title: 'Event' },
        { id: 'eventDate', title: 'Date' },
        { id: 'location', title: 'Location' },
        { id: 'status', title: 'Status' },
        { id: 'hoursServed', title: 'Hours' },
        { id: 'skills', title: 'Skills' },
        { id: 'role', title: 'Role' },
        { id: 'urgency', title: 'Urgency' }, // Added urgency field
        { id: 'description', title: 'Description' }, // Added description field
      ]
    });

    // Process records for CSV
    const records = volunteerHistory.map(record => {
      // Format skills array as comma-separated string if it exists
      const skillsString = Array.isArray(record.skills) 
        ? record.skills.join(', ') 
        : record.skills || '';
        
      return {
        volunteerName: record.volunteerName,
        eventName: record.eventName,
        eventDate: record.eventDate,
        location: record.location,
        status: record.status,
        hoursServed: record.hoursServed || 0, // Default to 0 if not provided
        skills: skillsString,
        role: record.role,
        urgency: record.urgency,
        description: record.description
      };
    });

    // Generate CSV string
    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

module.exports = { generateVolunteerHistoryCSV };