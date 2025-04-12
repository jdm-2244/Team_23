const express = require('express');
const router = express.Router();
const pool = require('./config/database'); // Assuming your database config is here

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

// Helper function to get volunteer history for a specific user
async function getUserVolunteerHistory(username) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        vh.HID as id,
        CONCAT(up.first_name, ' ', up.last_name) as volunteerName,
        e.Name as eventName,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as eventDate,
        IF(vh.checkin = 1, 'Completed', 'Pending') as status,
        l.venue_name as location,
        l.address as address,
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
      WHERE vh.UID = ?
      ORDER BY e.Date DESC
    `, [username]);
    
    // Process skills into arrays and add additional fields
    return rows.map(row => ({
      ...row,
      checkedIn: row.status === 'Completed',
      skills: row.skills ? row.skills.split(',') : [],
      location: `${row.location}, ${row.address}`,
      checkInTime: "09:00", // Example static data
      checkOutTime: "12:00", // Example static data
      hoursServed: 3 // Example static data
    }));
  } catch (error) {
    console.error('Error fetching user volunteer history:', error);
    throw error;
  }
}

// GET the current user's volunteer history
// Uses the username from the session or token
router.get('/my-history', async (req, res) => {
  try {
    // In a real app, get username from session/token
    // For testing, you can get it from query parameter or header
    const username = req.user?.username || req.query.username || req.headers['x-username'];
    
    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const records = await getUserVolunteerHistory(username);
    res.json(records);
  } catch (error) {
    console.error('Error fetching your volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch your volunteer history' });
  }
});

// GET volunteer history for a specific user (by username)
router.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    // Verify user exists
    const [userRows] = await pool.query('SELECT username FROM Users WHERE username = ?', [username]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const records = await getUserVolunteerHistory(username);
    res.json(records);
  } catch (error) {
    console.error('Error fetching user volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history for this user' });
  }
});

// GET all volunteer history records (admin only)
router.get('/', async (req, res) => {
  try {
    // In a real app, check if user is admin first
    const { search, date } = req.query;
    
    let query = `
      SELECT 
        vh.HID as id,
        CONCAT(up.first_name, ' ', up.last_name) as volunteerName,
        e.Name as eventName,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as eventDate,
        IF(vh.checkin = 1, 'Completed', 'Pending') as status,
        l.venue_name as location,
        l.address as address,
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
    `;
    
    // Add filters if provided
    const params = [];
    const whereClauses = [];
    
    if (search) {
      whereClauses.push(`(CONCAT(up.first_name, ' ', up.last_name) LIKE ? OR e.Name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (date) {
      whereClauses.push(`DATE_FORMAT(e.Date, '%Y-%m') = ?`);
      params.push(date);
    }
    
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    query += ` ORDER BY e.Date DESC`;
    
    const [rows] = await pool.query(query, params);
    
    // Process records
    const records = rows.map(row => ({
      ...row,
      checkedIn: row.status === 'Completed',
      skills: row.skills ? row.skills.split(',') : [],
      location: `${row.location}, ${row.address}`,
      checkInTime: "09:00", // Example static data
      checkOutTime: "12:00", // Example static data
      hoursServed: 3 // Example static data
    }));
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching all volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history records' });
  }
});

// GET a single volunteer history record
router.get('/:id', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    
    const [rows] = await pool.query(`
      SELECT 
        vh.HID as id,
        CONCAT(up.first_name, ' ', up.last_name) as volunteerName,
        e.Name as eventName,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as eventDate,
        IF(vh.checkin = 1, 'Completed', 'Pending') as status,
        l.venue_name as location,
        l.address as address,
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
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Process skills into array
    const record = {
      ...rows[0],
      checkedIn: rows[0].status === 'Completed',
      skills: rows[0].skills ? rows[0].skills.split(',') : [],
      location: `${rows[0].location}, ${rows[0].address}`,
      checkInTime: "09:00", // Example static data
      checkOutTime: "12:00", // Example static data
      hoursServed: 3 // Example static data
    };
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching volunteer history record:', error);
    res.status(500).json({ error: 'Failed to fetch the volunteer history record' });
  }
});

// Export a single record (mock function)
router.get('/export/:id', async (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    
    // Get the record first
    const [rows] = await pool.query(`
      SELECT 
        vh.HID as id,
        CONCAT(up.first_name, ' ', up.last_name) as volunteerName,
        e.Name as eventName,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as eventDate,
        IF(vh.checkin = 1, 'Completed', 'Pending') as status,
        l.venue_name as location,
        l.address as address,
        e.max_volunteers as maxVolunteers,
        e.Description as description,
        u.role,
        e.Urgency as urgency
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Locations l ON e.Location_id = l.LocID
      JOIN Users u ON vh.UID = u.username
      JOIN User_Profile up ON vh.UID = up.user_id
      WHERE vh.HID = ?
    `, [recordId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // In a real implementation, you'd generate a PDF/CSV file
    res.json({
      message: 'Record exported successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error exporting record:', error);
    res.status(500).json({ error: 'Failed to export record' });
  }
});

module.exports = router;