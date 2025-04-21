const express = require('express');
const router = express.Router();
const pool = require('./config/database'); 

/**
 * Validates a volunteer history record
 * @param {Object} record - The record to validate
 * @returns {Array} Array of validation errors
 */
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

/**
 * Formats a volunteer record for the frontend
 * @param {Object} row - Database row
 * @returns {Object} Formatted record
 */
function formatRecord(row) {
  return {
    ...row,
    checkedIn: row.status === 'Completed',
    skills: row.skills ? row.skills.split(',') : [],
    fullLocation: row.address ? `${row.location}, ${row.address}` : row.location,
    checkInTime: row.status === 'Completed' ? "09:00" : "", 
    checkOutTime: row.status === 'Completed' ? "12:00" : "",
    hoursServed: row.status === 'Completed' ? 3 : 0,
    // Also add this for backward compatibility with older frontend code
    location: row.address ? `${row.location}, ${row.address}` : row.location
  };
}

/**
 * Middleware to check if the user has admin privileges
 */
const checkAdminRole = async (req, res, next) => {
  try {
    const username = req.user?.username || req.headers['x-username'];
    
    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if the user has admin role
    const [userRows] = await pool.query('SELECT role FROM Users WHERE username = ?', [username]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userRows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Middleware to validate ID parameters
 */
const validateIdParam = (req, res, next) => {
  const id = req.params.id;
  if (id && isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  next();
};

// Apply ID validation middleware to all routes with id params
router.param('id', (req, res, next, id) => {
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  req.params.id = parseInt(id, 10);
  next();
});

// GET the current user's volunteer history
router.get('/my-history', async (req, res) => {
  try {
    const username = req.headers['x-username'] || req.user?.username;
    
    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get optional filters from query params
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
      WHERE vh.UID = ?
    `;
    
    const params = [username];
    
    // Add filters if provided
    if (search) {
      query += ` AND (e.Name LIKE ? OR e.Description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (date) {
      query += ` AND DATE_FORMAT(e.Date, '%Y-%m') = ?`;
      params.push(date);
    }
    
    // Add sorting
    query += ` ORDER BY e.Date DESC`;
    
    const [rows] = await pool.query(query, params);
    
    // Format the records
    const records = rows.map(formatRecord);
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history' });
  }
});

// GET volunteer history for a specific user (admin only)
router.get('/user/:username', checkAdminRole, async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' });
    }
    
    // Verify user exists
    const [userRows] = await pool.query('SELECT username FROM Users WHERE username = ?', [username]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get optional filters from query params
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
      WHERE vh.UID = ?
    `;
    
    const params = [username];
    
    // Add filters if provided
    if (search) {
      query += ` AND (e.Name LIKE ? OR e.Description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (date) {
      query += ` AND DATE_FORMAT(e.Date, '%Y-%m') = ?`;
      params.push(date);
    }
    
    // Add sorting
    query += ` ORDER BY e.Date DESC`;
    
    const [rows] = await pool.query(query, params);
    
    // Format the records
    const records = rows.map(formatRecord);
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching user volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history' });
  }
});

// GET all volunteer history records (admin only)
router.get('/', checkAdminRole, async (req, res) => {
  try {
    // Get filters from query parameters
    const { search, date, status, urgency, limit = 100, offset = 0 } = req.query;
    
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
      whereClauses.push(`(CONCAT(up.first_name, ' ', up.last_name) LIKE ? OR e.Name LIKE ? OR e.Description LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (date) {
      whereClauses.push(`DATE_FORMAT(e.Date, '%Y-%m') = ?`);
      params.push(date);
    }
    
    if (status) {
      whereClauses.push(`vh.checkin = ?`);
      params.push(status === 'Completed' ? 1 : 0);
    }
    
    if (urgency) {
      whereClauses.push(`e.Urgency = ?`);
      params.push(urgency);
    }
    
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    // Add sorting
    query += ` ORDER BY e.Date DESC`;
    
    // Add pagination
    const limitValue = parseInt(limit, 10) || 100;
    const offsetValue = parseInt(offset, 10) || 0;
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limitValue, offsetValue);
    
    const [rows] = await pool.query(query, params);
    
    // Format records
    const records = rows.map(formatRecord);
    
    // Add pagination metadata
    const response = {
      records,
      pagination: {
        count: records.length,
        limit: limitValue,
        offset: offsetValue
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching all volunteer history:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer history records' });
  }
});

// GET a single volunteer history record
router.get('/record/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
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
        ) as skills,
        vh.UID as username
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Locations l ON e.Location_id = l.LocID
      JOIN Users u ON vh.UID = u.username
      JOIN User_Profile up ON vh.UID = up.user_id
      WHERE vh.HID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Check if the current user is the owner of this record or an admin
    const currentUsername = req.user?.username || req.headers['x-username'];
    const recordUsername = rows[0].username;
    
    if (currentUsername && currentUsername !== recordUsername) {
      // Check if the current user is an admin
      const [userRows] = await pool.query('SELECT role FROM Users WHERE username = ?', [currentUsername]);
      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to access this record' });
      }
    }
    
    // Format the record
    const record = formatRecord(rows[0]);
    
    // Remove the username field from the response
    delete record.username;
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching volunteer history record:', error);
    res.status(500).json({ error: 'Failed to fetch the volunteer history record' });
  }
});

// Export a volunteer record as certificate
router.get('/export/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
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
        e.Description as description,
        vh.UID as username
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Locations l ON e.Location_id = l.LocID
      JOIN User_Profile up ON vh.UID = up.user_id
      WHERE vh.HID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Check if status is 'Completed', otherwise can't generate certificate
    if (rows[0].status !== 'Completed') {
      return res.status(400).json({ error: 'Cannot generate certificate for a pending volunteer record' });
    }
    
    // Check if the current user is the owner of this record or an admin
    const currentUsername = req.user?.username || req.headers['x-username'];
    const recordUsername = rows[0].username;
    
    if (currentUsername && currentUsername !== recordUsername) {
      // Check if the current user is an admin
      const [userRows] = await pool.query('SELECT role FROM Users WHERE username = ?', [currentUsername]);
      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to export this record' });
      }
    }
    
    // Generate certificate data
    const certificateData = {
      id: rows[0].id,
      volunteerName: rows[0].volunteerName,
      eventName: rows[0].eventName,
      eventDate: rows[0].eventDate,
      location: rows[0].address ? `${rows[0].location}, ${rows[0].address}` : rows[0].location,
      description: rows[0].description,
      hoursServed: 3, // Example static data
      certificateNumber: `CERT-${Date.now().toString().slice(-6)}-${id}`,
      issueDate: new Date().toISOString().split('T')[0],
      verificationUrl: `https://example.com/verify/${id}`
    };
    
    res.json({
      message: 'Certificate generated successfully',
      certificate: certificateData
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// GET aggregated statistics for a volunteer
router.get('/stats', async (req, res) => {
  try {
    const username = req.user?.username || req.headers['x-username'];
    
    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get all stats in parallel
    const [basicStats, urgencyStats, recentEvents, skillsUsed] = await Promise.all([
      // Basic stats
      pool.query(`
        SELECT 
          COUNT(*) as totalEvents,
          SUM(IF(vh.checkin = 1, 1, 0)) as completedEvents,
          COUNT(DISTINCT e.EID) as uniqueEvents
        FROM Volunteering_History vh
        JOIN Events e ON vh.EID = e.EID
        WHERE vh.UID = ?
      `, [username]),
      
      // Urgency stats
      pool.query(`
        SELECT 
          e.Urgency as urgency,
          COUNT(*) as count
        FROM Volunteering_History vh
        JOIN Events e ON vh.EID = e.EID
        WHERE vh.UID = ?
        GROUP BY e.Urgency
      `, [username]),
      
      // Recent events
      pool.query(`
        SELECT 
          e.Name as eventName,
          DATE_FORMAT(e.Date, '%Y-%m-%d') as eventDate,
          IF(vh.checkin = 1, 'Completed', 'Pending') as status
        FROM Volunteering_History vh
        JOIN Events e ON vh.EID = e.EID
        WHERE vh.UID = ?
        ORDER BY e.Date DESC
        LIMIT 5
      `, [username]),
      
      // Skills used
      pool.query(`
        SELECT 
          s.skill_name as skillName,
          COUNT(*) as timesUsed
        FROM Volunteering_History vh
        JOIN User_Skills us ON vh.UID = us.user_id
        JOIN Skills s ON us.skill_id = s.skill_id
        JOIN Events e ON vh.EID = e.EID
        JOIN Event_Skills es ON e.EID = es.event_id AND s.skill_id = es.skill_id
        WHERE vh.UID = ?
        GROUP BY s.skill_name
        ORDER BY COUNT(*) DESC
      `, [username])
    ]);
    
    // Combine all stats
    const stats = {
      summary: basicStats[0][0] || { totalEvents: 0, completedEvents: 0, uniqueEvents: 0 },
      byUrgency: urgencyStats[0] || [],
      recentEvents: recentEvents[0] || [],
      skillsUsed: skillsUsed[0] || []
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching volunteer statistics:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer statistics' });
  }
});

module.exports = router;