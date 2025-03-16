const express = require('express');
const router = express.Router();
const pool = require('./config/database');
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // In a real application, you'd verify the JWT token here
  // For now, we'll assume a valid admin token
  req.user = { role: 'admin' };
  next();
};

// Middleware to verify admin access
const verifyAdminAccess = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

/**
 * @route   GET /api/volunteer-matcher/volunteers
 * @desc    Get all volunteers with their skills
 * @access  Admin only
 */
router.get('/volunteers', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const [volunteers] = await pool.query(`
      SELECT u.username, u.phone_number, u.email, up.first_name, up.last_name
      FROM Users u
      JOIN User_Profile up ON u.username = up.user_id
      WHERE u.role = 'volunteer'
    `);

    // For each volunteer, get their skills
    for (let volunteer of volunteers) {
      const [skills] = await pool.query(`
        SELECT s.skill_name
        FROM User_Skills us
        JOIN Skills s ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
      `, [volunteer.username]);

      volunteer.skills = skills.map(s => s.skill_name);
    }

    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Server error while fetching volunteers' });
  }
});

/**
 * @route   GET /api/volunteer-matcher/volunteers/search
 * @desc    Search for volunteers by name, email, or username
 * @access  Admin only
 */
router.get('/volunteers/search', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const searchTerm = `%${term}%`;

    const [volunteers] = await pool.query(`
      SELECT u.username, u.phone_number, u.email, up.first_name, up.last_name
      FROM Users u
      JOIN User_Profile up ON u.username = up.user_id
      WHERE u.role = 'volunteer'
      AND (
        u.username LIKE ? OR
        u.email LIKE ? OR
        up.first_name LIKE ? OR
        up.last_name LIKE ?
      )
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);

    // For each volunteer, get their skills
    for (let volunteer of volunteers) {
      const [skills] = await pool.query(`
        SELECT s.skill_name
        FROM User_Skills us
        JOIN Skills s ON us.skill_id = s.skill_id
        WHERE us.user_id = ?
      `, [volunteer.username]);

      volunteer.skills = skills.map(s => s.skill_name);
    }

    res.json(volunteers);
  } catch (error) {
    console.error('Error searching for volunteers:', error);
    res.status(500).json({ error: 'Server error while searching for volunteers' });
  }
});

/**
 * @route   GET /api/volunteer-matcher/events
 * @desc    Get all events with required skills and volunteer counts
 * @access  Admin only
 */
router.get('/events', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as eventName,
        e.Name as name,
        CONCAT(l.venue_name, ', ', l.address) as location,
        e.Date as eventDate,
        e.Date as date,
        e.Description as eventDescription,
        e.Description as description,
        e.max_volunteers as maxVolunteers,
        e.max_volunteers as volunteersNeeded,
        e.Urgency as urgency,
        l.venue_name as venue
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      WHERE e.Date >= CURDATE()
      ORDER BY e.Date
    `);

    // For each event, get required skills
    for (let event of events) {
      // Get required skills
      const [skills] = await pool.query(`
        SELECT s.skill_name
        FROM Event_Skills es
        JOIN Skills s ON es.skill_id = s.skill_id
        WHERE es.event_id = ?
      `, [event.id]);

      event.requiredSkills = skills.map(s => s.skill_name);
      event.skills = event.requiredSkills; // Duplicate for frontend compatibility

      // Get volunteer count
      const [volunteerCount] = await pool.query(`
        SELECT COUNT(*) as count
        FROM Volunteering_History
        WHERE EID = ?
      `, [event.id]);

      event.volunteersAssigned = volunteerCount[0].count || 0;
      event.volunteersRegistered = event.volunteersAssigned;
      
      // Format date and add placeholder times
      const eventDate = new Date(event.eventDate);
      event.eventDate = eventDate.toISOString();
      event.date = event.eventDate;
      event.startTime = "9:00 AM"; // Placeholder
      event.time = event.startTime;
      event.endTime = "1:00 PM"; // Placeholder
      
      // Add placeholder contact info
      event.contactPerson = "Event Coordinator";
      event.contactEmail = "coordinator@impactnow.org";
      event.contactPhone = "555-123-4567";
      event.status = "Active";
      event.visibility = "Public";
      event.createdAt = new Date().toISOString();
      event.createdBy = "admin";
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error while fetching events' });
  }
});

/**
 * @route   GET /api/volunteer-matcher/events/search
 * @desc    Search for events by name, description, or location
 * @access  Admin only
 */
router.get('/events/search', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const searchTerm = `%${term}%`;

    const [events] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as eventName,
        e.Name as name,
        CONCAT(l.venue_name, ', ', l.address) as location,
        e.Date as eventDate,
        e.Date as date,
        e.Description as eventDescription,
        e.Description as description,
        e.max_volunteers as maxVolunteers,
        e.max_volunteers as volunteersNeeded,
        e.Urgency as urgency,
        l.venue_name as venue
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      WHERE e.Date >= CURDATE()
      AND (
        e.Name LIKE ? OR
        e.Description LIKE ? OR
        l.venue_name LIKE ? OR
        l.address LIKE ?
      )
      ORDER BY e.Date
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);

    // Process events similar to the '/events' route
    for (let event of events) {
      const [skills] = await pool.query(`
        SELECT s.skill_name
        FROM Event_Skills es
        JOIN Skills s ON es.skill_id = s.skill_id
        WHERE es.event_id = ?
      `, [event.id]);

      event.requiredSkills = skills.map(s => s.skill_name);
      event.skills = event.requiredSkills;

      const [volunteerCount] = await pool.query(`
        SELECT COUNT(*) as count
        FROM Volunteering_History
        WHERE EID = ?
      `, [event.id]);

      event.volunteersAssigned = volunteerCount[0].count || 0;
      event.volunteersRegistered = event.volunteersAssigned;
      
      // Format date and add placeholder times
      const eventDate = new Date(event.eventDate);
      event.eventDate = eventDate.toISOString();
      event.date = event.eventDate;
      event.startTime = "9:00 AM";
      event.time = event.startTime;
      event.endTime = "1:00 PM";
      
      // Add placeholder contact info
      event.contactPerson = "Event Coordinator";
      event.contactEmail = "coordinator@impactnow.org";
      event.contactPhone = "555-123-4567";
      event.status = "Active";
      event.visibility = "Public";
      event.createdAt = new Date().toISOString();
      event.createdBy = "admin";
    }

    res.json(events);
  } catch (error) {
    console.error('Error searching for events:', error);
    res.status(500).json({ error: 'Server error while searching for events' });
  }
});

/**
 * @route   GET /api/volunteer-matcher/events/skills/:skillName
 * @desc    Get events that require a specific skill
 * @access  Admin only
 */
router.get('/events/skills/:skillName', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const { skillName } = req.params;
    
    const [events] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as eventName,
        e.Name as name,
        CONCAT(l.venue_name, ', ', l.address) as location,
        e.Date as eventDate,
        e.Date as date,
        e.Description as eventDescription,
        e.Description as description,
        e.max_volunteers as maxVolunteers,
        e.max_volunteers as volunteersNeeded,
        e.Urgency as urgency
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      JOIN Event_Skills es ON e.EID = es.event_id
      JOIN Skills s ON es.skill_id = s.skill_id
      WHERE s.skill_name = ?
      AND e.Date >= CURDATE()
      ORDER BY e.Date
    `, [skillName]);

    // Process events as in other routes
    for (let event of events) {
      // Get all required skills for this event
      const [skills] = await pool.query(`
        SELECT s.skill_name
        FROM Event_Skills es
        JOIN Skills s ON es.skill_id = s.skill_id
        WHERE es.event_id = ?
      `, [event.id]);

      event.requiredSkills = skills.map(s => s.skill_name);
      event.skills = event.requiredSkills;

      // Get volunteer count
      const [volunteerCount] = await pool.query(`
        SELECT COUNT(*) as count
        FROM Volunteering_History
        WHERE EID = ?
      `, [event.id]);

      event.volunteersAssigned = volunteerCount[0].count || 0;
      event.volunteersRegistered = event.volunteersAssigned;
      
      // Format date and add placeholder times
      const eventDate = new Date(event.eventDate);
      event.eventDate = eventDate.toISOString();
      event.date = event.eventDate;
      event.startTime = "9:00 AM";
      event.time = event.startTime;
      event.endTime = "1:00 PM";
      
      // Add placeholder contact info
      event.contactPerson = "Event Coordinator";
      event.contactEmail = "coordinator@impactnow.org";
      event.contactPhone = "555-123-4567";
      event.status = "Active";
      event.visibility = "Public";
      event.createdAt = new Date().toISOString();
      event.createdBy = "admin";
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching events by skill:', error);
    res.status(500).json({ error: 'Server error while fetching events by skill' });
  }
});

/**
 * @route   POST /api/volunteer-matcher/match
 * @desc    Match a volunteer to an event
 * @access  Admin only
 */
router.post('/match', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const { username, eventId } = req.body;
    
    if (!username || !eventId) {
      return res.status(400).json({ error: 'Username and event ID are required' });
    }
    
    // Check if the user exists
    const [userRows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    // Check if the event exists
    const [eventRows] = await pool.query('SELECT * FROM Events WHERE EID = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if the volunteer is already matched to this event
    const [existingMatch] = await pool.query(
      'SELECT * FROM Volunteering_History WHERE UID = ? AND EID = ?',
      [username, eventId]
    );
    
    if (existingMatch.length > 0) {
      return res.status(400).json({ error: 'Volunteer is already matched to this event' });
    }
    
    // Check if the event has reached maximum volunteers
    const [volunteerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM Volunteering_History WHERE EID = ?',
      [eventId]
    );
    
    const [eventDetails] = await pool.query(
      'SELECT max_volunteers FROM Events WHERE EID = ?',
      [eventId]
    );
    
    if (volunteerCount[0].count >= eventDetails[0].max_volunteers) {
      return res.status(400).json({ error: 'Event has reached maximum volunteer capacity' });
    }
    
    // Create the match
    const [result] = await pool.query(
      'INSERT INTO Volunteering_History (EID, UID, checkin) VALUES (?, ?, 0)',
      [eventId, username]
    );
    
    // Get event and user details for response
    const [event] = await pool.query(
      'SELECT Name, Date FROM Events WHERE EID = ?',
      [eventId]
    );
    
    const [user] = await pool.query(
      'SELECT first_name, last_name FROM User_Profile WHERE user_id = ?',
      [username]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: `Successfully matched ${user[0].first_name} ${user[0].last_name} to ${event[0].Name}`,
      eventId: eventId,
      username: username,
      eventName: event[0].Name,
      eventDate: event[0].Date,
      volunteerName: `${user[0].first_name} ${user[0].last_name}`
    });
    
  } catch (error) {
    console.error('Error matching volunteer to event:', error);
    res.status(500).json({ error: 'Server error while matching volunteer to event' });
  }
});

/**
 * @route   GET /api/volunteer-matcher/matches
 * @desc    Get all volunteer-event matches
 * @access  Admin only
 */
router.get('/matches', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const [matches] = await pool.query(`
      SELECT 
        vh.HID as id,
        vh.UID as username,
        vh.EID as eventId,
        e.Name as eventName,
        e.Date as eventDate,
        CONCAT(up.first_name, ' ', up.last_name) as volunteerName,
        vh.checkin
      FROM Volunteering_History vh
      JOIN Events e ON vh.EID = e.EID
      JOIN Users u ON vh.UID = u.username
      JOIN User_Profile up ON u.username = up.user_id
      ORDER BY e.Date DESC
    `);
    
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Server error while fetching matches' });
  }
});

/**
 * @route   DELETE /api/volunteer-matcher/match/:id
 * @desc    Remove a volunteer-event match
 * @access  Admin only
 */
router.delete('/match/:id', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the match exists
    const [matchRows] = await pool.query('SELECT * FROM Volunteering_History WHERE HID = ?', [id]);
    if (matchRows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Delete the match
    await pool.query('DELETE FROM Volunteering_History WHERE HID = ?', [id]);
    
    res.json({ message: 'Match removed successfully' });
  } catch (error) {
    console.error('Error removing match:', error);
    res.status(500).json({ error: 'Server error while removing match' });
  }
});

module.exports = router;