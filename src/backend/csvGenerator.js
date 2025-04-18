const { createObjectCsvStringifier } = require('csv-writer');

const generateVolunteerHistoryCSV = (volunteerHistory) => {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'volunteer', title: 'Volunteer' },
      { id: 'event', title: 'Event' },
      { id: 'date', title: 'Date' },
      { id: 'status', title: 'Status' },
      { id: 'hours', title: 'Hours' }
    ]
  });
  const records = volunteerHistory.map(r => ({
    volunteer: r.volunteerName,
    event: r.eventName,
    date: r.eventDate,
    status: r.status || (r.checkedIn ? 'Completed' : 'Pending'),
    hours: r.hoursServed
  }));
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};

module.exports = { generateVolunteerHistoryCSV };
