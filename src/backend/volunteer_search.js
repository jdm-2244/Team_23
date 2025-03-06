const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // We'd use mysql2 for async/await support

/**
 * Volunteer Search Routes
 * Contains all API endpoints related to volunteer search operations
 */

// Database connection configuration
// In a real application, this would be in a separate config file
const dbConfig = {
  host: 'localhost',
  user: 'app_user',
  password: 'password',
  database: 'Volunteer_Org_Database'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Middleware to verify authentication
const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // In a real app, you would validate the token here
  // For now, we just pass through
  next();
};

/**
 * Search for a volunteer by different criteria
 * GET /volunteers/search?type=username&term=johndoe
 */
/**
 * Search for a volunteer by different criteria including name
 * GET /volunteers/search?type=name&term=John Doe
 */
router.get('/volunteers/search', verifyAuth, async (req, res) => {
  const { type, term } = req.query;
  
  if (!type || !term) {
    return res.status(400).json({ error: 'Search type and term are required' });
  }
  
  try {
    let query;
    let params;
    
    // Build query based on search type
    switch (type) {
      case 'username':
        query = `
          SELECT u.*, up.*
          FROM Users u
          JOIN User_Profile up ON u.username = up.user_id
          WHERE u.username = ?
        `;
        params = [term];
        break;
      case 'email':
        query = `
          SELECT u.*, up.*
          FROM Users u
          JOIN User_Profile up ON u.username = up.user_id
          WHERE u.email = ?
        `;
        params = [term];
        break;
      case 'phone':
        query = `
          SELECT u.*, up.*
          FROM Users u
          JOIN User_Profile up ON u.username = up.user_id
          WHERE u.phone_number = ?
        `;
        params = [term];
        break;
      case 'name':
        // Split the term into first and last name
        const nameParts = term.split(' ');
        let firstName = '';
        let lastName = '';
        
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          if (nameParts.length > 1) {
            // Combine all remaining parts as the last name
            lastName = nameParts.slice(1).join(' ');
          }
        }
        
        // Search by both first and last name
        query = `
          SELECT u.*, up.*
          FROM Users u
          JOIN User_Profile up ON u.username = up.user_id
          WHERE up.first_name LIKE ? AND up.last_name LIKE ?
        `;
        params = [`%${firstName}%`, `%${lastName}%`];
        break;
      default:
        return res.status(400).json({ error: 'Invalid search type' });
    }
    
    // Execute query
    const [rows] = await pool.execute(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    // If searching by name, we might get multiple results
    if (type === 'name') {
      res.status(200).json(rows);
    } else {
      res.status(200).json(rows[0]);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get a volunteer's history
 * GET /volunteers/:username/history
 */
router.get('/volunteers/:username/history', verifyAuth, async (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const query = `
      SELECT vh.HID, e.EID, e.Name AS eventName, e.Date AS eventDate, 
             e.Description, vh.checkin, l.venue_name, l.address
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Locations l ON e.Location_id = l.LocID
      WHERE vh.UID = ?
      ORDER BY e.Date DESC
    `;
    
    const [rows] = await pool.execute(query, [username]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get a volunteer's skills
 * GET /volunteers/:username/skills
 */
router.get('/volunteers/:username/skills', verifyAuth, async (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const query = `
      SELECT s.skill_id, s.skill_name, s.skill_description, 
             us.proficiency_level, us.date_acquired
      FROM User_Skills us
      JOIN Skills s ON us.skill_id = s.skill_id
      WHERE us.user_id = ?
    `;
    
    const [rows] = await pool.execute(query, [username]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper function to get complete volunteer details
 * This isn't exposed as an endpoint but shows the implementation strategy
 */
const getCompleteVolunteerDetails = async (type, term) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Determine the field to search by
    let searchField;
    switch (type) {
      case 'username':
        searchField = 'u.username';
        break;
      case 'email':
        searchField = 'u.email';
        break;
      case 'phone':
        searchField = 'u.phone_number';
        break;
      default:
        throw new Error('Invalid search type');
    }
    
    // Get volunteer data
    const userQuery = `
      SELECT u.username, u.phone_number, u.email, u.role, 
             up.first_name, up.last_name, up.location, up.last_update
      FROM Users u
      JOIN User_Profile up ON u.username = up.user_id
      WHERE ${searchField} = ?
    `;
    
    const [userRows] = await connection.execute(userQuery, [term]);
    
    if (userRows.length === 0) {
      throw new Error('Volunteer not found');
    }
    
    const username = userRows[0].username;
    
    // Get volunteer history
    const historyQuery = `
      SELECT vh.HID, e.EID, e.Name AS eventName, e.Date AS eventDate, 
             e.Description, vh.checkin, l.venue_name, l.address
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Locations l ON e.Location_id = l.LocID
      WHERE vh.UID = ?
      ORDER BY e.Date DESC
    `;
    
    const [historyRows] = await connection.execute(historyQuery, [username]);
    
    // Get volunteer skills
    const skillsQuery = `
      SELECT s.skill_id, s.skill_name, s.skill_description, 
             us.proficiency_level, us.date_acquired
      FROM User_Skills us
      JOIN Skills s ON us.skill_id = s.skill_id
      WHERE us.user_id = ?
    `;
    
    const [skillsRows] = await connection.execute(skillsQuery, [username]);
    
    await connection.commit();
    
    return {
      ...userRows[0],
      history: historyRows,
      skills: skillsRows
    };
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Fallback route for handling combined data requests
router.get('/volunteers/complete-details', verifyAuth, async (req, res) => {
  const { type, term } = req.query;
  
  if (!type || !term) {
    return res.status(400).json({ error: 'Search type and term are required' });
  }
  
  try {
    const volunteerDetails = await getCompleteVolunteerDetails(type, term);
    res.status(200).json(volunteerDetails);
  } catch (error) {
    console.error('Error getting complete volunteer details:', error);
    if (error.message === 'Volunteer not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Invalid search type') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;