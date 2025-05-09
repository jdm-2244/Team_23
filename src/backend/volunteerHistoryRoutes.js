const express = require('express');
const router = express.Router();
const pool = require('./config/database'); // Assuming your database config is here
const { generateVolunteerHistoryCSV } = require('./csvGenerator');

// Shared validation function - could be moved to a separate utils file
function validateRecord(record) {
  const errors = [];

  if (!record.volunteerName) errors.push("Volunteer name is required");
  if (!record.eventName) errors.push("Event name is required");
  if (!record.eventDate) errors.push("Event date is required");
  if (!record.status) errors.push("Status is required");

  if (record.volunteerName && record.volunteerName.length > 100) {
    errors.push("Volunteer name must be < 100 characters");
  }
  if (record.eventName && record.eventName.length > 100) {
    errors.push("Event name must be < 100 characters");
  }
  if (record.description && record.description.length > 500) {
    errors.push("Description must be < 500 characters");
  }

  if (record.hoursServed && isNaN(record.hoursServed)) {
    errors.push("Hours served must be a number");
  }
  if (record.maxVolunteers && isNaN(record.maxVolunteers)) {
    errors.push("Max volunteers must be a number");
  }

  if (record.eventDate && isNaN(new Date(record.eventDate).valueOf())) {
    errors.push("Invalid event date");
  }

  return errors;
}

// Helper function to get all volunteer history with proper joins
async function getVolunteerHistory() {
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
      skills: row.skills ? row.skills.split(',') : []
    }));
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    throw error;
  }
}

// Helper function to get a single volunteer history record
async function getVolunteerRecord(recordId) {
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
      WHERE vh.HID = ?
    `, [recordId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Process skills into array
    return {
      ...rows[0],
      checkedIn: rows[0].status === 'Completed',
      skills: rows[0].skills ? rows[0].skills.split(',') : []
    };
  } catch (error) {
    console.error('Error fetching volunteer history record:', error);
    throw error;
  }
}

// GET all volunteer history records
router.get('/', async (req, res) => {
  try {
    const records = await getVolunteerHistory();
    res.json(records);
  } catch (error) {
    console.error('Error fetching volunteer records:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history records' });
  }
});

// GET a single volunteer history record
router.get('/:id', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const record = await getVolunteerRecord(recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching volunteer record:', error);
    res.status(500).json({ error: 'Failed to fetch the volunteer history record' });
  }
});

// NEW: Export a single volunteer record as CSV
router.get('/:id/export', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const record = await getVolunteerRecord(recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const csvData = generateVolunteerHistoryCSV([record]);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=volunteer-record-${recordId}.csv`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting record:', error);
    res.status(500).json({ error: 'Failed to export record' });
  }
});

// POST a new volunteer history record
router.post('/', async (req, res) => {
  try {
    const newRecord = req.body;
    const errors = validateRecord(newRecord);
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Find the event ID based on event name
    const [eventRows] = await pool.query('SELECT EID FROM Events WHERE Name = ?', [newRecord.eventName]);
    if (eventRows.length === 0) {
      return res.status(400).json({ error: 'Event not found' });
    }
    const eventId = eventRows[0].EID;
    
    // Find the user ID based on volunteer name
    const nameParts = newRecord.volunteerName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const [userRows] = await pool.query(
      'SELECT u.username FROM Users u JOIN User_Profile up ON u.username = up.user_id WHERE up.first_name = ? AND up.last_name = ?',
      [firstName, lastName]
    );
    
    if (userRows.length === 0) {
      return res.status(400).json({ error: 'Volunteer not found' });
    }
    const userId = userRows[0].username;
    
    // Insert the new record using parameterized query
    const [result] = await pool.query(
      'INSERT INTO Volunteering_History (EID, UID, checkin) VALUES (?, ?, ?)',
      [eventId, userId, newRecord.status === 'Completed' ? 1 : 0]
    );
    
    const newId = result.insertId;
    const createdRecord = await getVolunteerRecord(newId);
    
    res.status(201).json(createdRecord);
  } catch (error) {
    console.error('Error creating volunteer history record:', error);
    res.status(500).json({ error: 'Failed to create volunteer history record' });
  }
});

// PUT (update) a volunteer history record
router.put('/:id', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const updatedRecord = req.body;
    const errors = validateRecord(updatedRecord);
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Check if record exists
    const existingRecord = await getVolunteerRecord(recordId);
    
    if (!existingRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Find the event ID based on event name
    const [eventRows] = await pool.query('SELECT EID FROM Events WHERE Name = ?', [updatedRecord.eventName]);
    if (eventRows.length === 0) {
      return res.status(400).json({ error: 'Event not found' });
    }
    const eventId = eventRows[0].EID;
    
    // Find the user ID based on volunteer name
    const nameParts = updatedRecord.volunteerName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const [userRows] = await pool.query(
      'SELECT u.username FROM Users u JOIN User_Profile up ON u.username = up.user_id WHERE up.first_name = ? AND up.last_name = ?',
      [firstName, lastName]
    );
    
    if (userRows.length === 0) {
      return res.status(400).json({ error: 'Volunteer not found' });
    }
    const userId = userRows[0].username;
    
    // Update the record using parameterized query
    await pool.query(
      'UPDATE Volunteering_History SET EID = ?, UID = ?, checkin = ? WHERE HID = ?',
      [eventId, userId, updatedRecord.status === 'Completed' ? 1 : 0, recordId]
    );
    
    const result = await getVolunteerRecord(recordId);
    res.json(result);
  } catch (error) {
    console.error('Error updating volunteer history record:', error);
    res.status(500).json({ error: 'Failed to update volunteer history record' });
  }
});

// DELETE a volunteer history record
router.delete('/:id', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    
    // Check if record exists
    const existingRecord = await getVolunteerRecord(recordId);
    
    if (!existingRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Delete the record using parameterized query
    await pool.query('DELETE FROM Volunteering_History WHERE HID = ?', [recordId]);
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer history record:', error);
    res.status(500).json({ error: 'Failed to delete volunteer history record' });
  }
});

module.exports = router;