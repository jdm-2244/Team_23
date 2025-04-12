const express = require('express');
const router = express.Router();
const pool = require('./config/database'); // Assuming your database config is here

// Helper function to build dynamic WHERE clauses based on search parameters
function buildSearchQuery(searchType, searchTerm) {
  let whereClause = '';
  let params = [];

  if (searchTerm && searchTerm.trim() !== '') {
    switch (searchType) {
      case 'name':
        whereClause = 'WHERE e.Name LIKE ?';
        params.push(`%${searchTerm}%`);
        break;
      case 'location':
        whereClause = 'WHERE l.venue_name LIKE ? OR l.address LIKE ?';
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        break;
      case 'category': // Using Urgency as a category
        whereClause = 'WHERE e.Urgency LIKE ?';
        params.push(`%${searchTerm}%`);
        break;
      case 'date':
        whereClause = 'WHERE e.Date = ?';
        params.push(searchTerm);
        break;
      case 'skill':
        whereClause = 'WHERE s.skill_name LIKE ?';
        params.push(`%${searchTerm}%`);
        break;
      default:
        // Default to searching by name if no valid search type is provided
        whereClause = 'WHERE e.Name LIKE ?';
        params.push(`%${searchTerm}%`);
    }
  }

  return { whereClause, params };
}

// Helper function to count available slots for an event
async function getAvailableSlots(eventId) {
  try {
    // Count how many volunteers have signed up for this event
    const [signupCount] = await pool.query(
      'SELECT COUNT(*) as count FROM Volunteering_History WHERE EID = ?',
      [eventId]
    );

    // Get the maximum number of volunteers for this event
    const [eventInfo] = await pool.query(
      'SELECT max_volunteers FROM Events WHERE EID = ?',
      [eventId]
    );

    if (eventInfo.length === 0) {
      return 0;
    }

    const maxVolunteers = eventInfo[0].max_volunteers;
    const signedUp = signupCount[0].count;

    return maxVolunteers - signedUp;
  } catch (error) {
    console.error('Error calculating available slots:', error);
    return 0;
  }
}

// GET events based on search criteria
router.get('/search', async (req, res) => {
  try {
    const { searchType, searchTerm } = req.query;
    const { whereClause, params } = buildSearchQuery(searchType, searchTerm);

    // Prepare the base query with proper LEFT JOIN to search by skill if needed
    let baseQuery = `
      SELECT 
        e.EID as id,
        e.Name as name,
        l.venue_name as venue,
        l.address as address,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
        e.Description as description,
        e.max_volunteers as slots,
        e.Urgency as category,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM Event_Skills es
          JOIN Skills s ON es.skill_id = s.skill_id
          WHERE es.event_id = e.EID
        ) as skills
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
    `;

    // If searching by skill, we need a different query approach with INNER JOIN
    if (searchType === 'skill') {
      baseQuery = `
        SELECT 
          e.EID as id,
          e.Name as name,
          l.venue_name as venue,
          l.address as address,
          DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
          e.Description as description,
          e.max_volunteers as slots,
          e.Urgency as category,
          (
            SELECT GROUP_CONCAT(s.skill_name)
            FROM Event_Skills es
            JOIN Skills s ON es.skill_id = s.skill_id
            WHERE es.event_id = e.EID
          ) as skills
        FROM Events e
        JOIN Locations l ON e.Location_id = l.LocID
        JOIN Event_Skills es ON e.EID = es.event_id
        JOIN Skills s ON es.skill_id = s.skill_id
      `;
    }

    // Combine base query with where clause
    const query = `${baseQuery} ${whereClause} ORDER BY e.Date`;
    
    // Execute the query
    const [rows] = await pool.query(query, params);

    // Process each event to add available slots and format skills
    const events = await Promise.all(rows.map(async (event) => {
      const availableSlots = await getAvailableSlots(event.id);
      
      return {
        ...event,
        slotsRemaining: availableSlots,
        time: '09:00 AM - 05:00 PM', // Example time, you might want to add this to your database schema
        skills: event.skills ? event.skills.split(',') : [],
        location: `${event.venue}, ${event.address}`
      };
    }));

    res.json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// GET all available events (with pagination support)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM Events');
    const totalEvents = countResult[0].total;
    
    // Get events with pagination
    const [rows] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as name,
        l.venue_name as venue,
        l.address as address,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
        e.Description as description,
        e.max_volunteers as slots,
        e.Urgency as category,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM Event_Skills es
          JOIN Skills s ON es.skill_id = s.skill_id
          WHERE es.event_id = e.EID
        ) as skills
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      ORDER BY e.Date
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Process each event to add available slots and format skills
    const events = await Promise.all(rows.map(async (event) => {
      const availableSlots = await getAvailableSlots(event.id);
      
      return {
        ...event,
        slotsRemaining: availableSlots,
        time: '09:00 AM - 05:00 PM', // Example time
        skills: event.skills ? event.skills.split(',') : [],
        location: `${event.venue}, ${event.address}`
      };
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalEvents / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      events,
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    
    const [rows] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as name,
        l.venue_name as venue,
        l.address as address,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
        e.Description as description,
        e.max_volunteers as slots,
        e.Urgency as category,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM Event_Skills es
          JOIN Skills s ON es.skill_id = s.skill_id
          WHERE es.event_id = e.EID
        ) as skills
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      WHERE e.EID = ?
    `, [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Calculate available slots
    const availableSlots = await getAvailableSlots(eventId);
    
    // Format the event data
    const event = {
      ...rows[0],
      slotsRemaining: availableSlots,
      time: '09:00 AM - 05:00 PM', // Example time
      skills: rows[0].skills ? rows[0].skills.split(',') : [],
      location: `${rows[0].venue}, ${rows[0].address}`
    };
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// GET events by category/urgency
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    const [rows] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as name,
        l.venue_name as venue,
        l.address as address,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
        e.Description as description,
        e.max_volunteers as slots,
        e.Urgency as category,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM Event_Skills es
          JOIN Skills s ON es.skill_id = s.skill_id
          WHERE es.event_id = e.EID
        ) as skills
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      WHERE e.Urgency = ?
      ORDER BY e.Date
    `, [category]);

    // Process each event to add available slots and format skills
    const events = await Promise.all(rows.map(async (event) => {
      const availableSlots = await getAvailableSlots(event.id);
      
      return {
        ...event,
        slotsRemaining: availableSlots,
        time: '09:00 AM - 05:00 PM', // Example time
        skills: event.skills ? event.skills.split(',') : [],
        location: `${event.venue}, ${event.address}`
      };
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({ error: 'Failed to fetch events by category' });
  }
});

// POST to sign up for an event
router.post('/signup', async (req, res) => {
  try {
    const { eventId, username } = req.body;
    
    if (!eventId || !username) {
      return res.status(400).json({ error: 'Event ID and username are required' });
    }
    
    // Check if event exists
    const [eventRows] = await pool.query('SELECT EID, max_volunteers FROM Events WHERE EID = ?', [eventId]);
    
    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user exists
    const [userRows] = await pool.query('SELECT username FROM Users WHERE username = ?', [username]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already signed up for this event
    const [existingSignup] = await pool.query(
      'SELECT HID FROM Volunteering_History WHERE EID = ? AND UID = ?',
      [eventId, username]
    );
    
    if (existingSignup.length > 0) {
      return res.status(400).json({ error: 'User already signed up for this event' });
    }
    
    // Check if there are available slots
    const availableSlots = await getAvailableSlots(eventId);
    
    if (availableSlots <= 0) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Create new volunteer history record (signup)
    const [result] = await pool.query(
      'INSERT INTO Volunteering_History (EID, UID, checkin) VALUES (?, ?, 0)',
      [eventId, username]
    );
    
    // Send confirmation notification
    const [eventInfo] = await pool.query('SELECT Name FROM Events WHERE EID = ?', [eventId]);
    const eventName = eventInfo[0].Name;
    
    await pool.query(
      'INSERT INTO Notifications (event_id, user_id, message) VALUES (?, ?, ?)',
      [eventId, username, `You have successfully signed up for ${eventName}. Thank you!`]
    );
    
    res.status(201).json({ 
      message: 'Successfully signed up for event',
      historyId: result.insertId
    });
  } catch (error) {
    console.error('Error signing up for event:', error);
    res.status(500).json({ error: 'Failed to sign up for event' });
  }
});

// GET events for a specific user
router.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    const [rows] = await pool.query(`
      SELECT 
        e.EID as id,
        e.Name as name,
        l.venue_name as venue,
        l.address as address,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
        e.Description as description,
        e.max_volunteers as slots,
        e.Urgency as category,
        vh.checkin as checkedIn,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM Event_Skills es
          JOIN Skills s ON es.skill_id = s.skill_id
          WHERE es.event_id = e.EID
        ) as skills
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
      JOIN Volunteering_History vh ON e.EID = vh.EID
      WHERE vh.UID = ?
      ORDER BY e.Date
    `, [username]);

    // Process events to format skills
    const events = rows.map(event => ({
      ...event,
      time: '09:00 AM - 05:00 PM', // Example time
      skills: event.skills ? event.skills.split(',') : [],
      location: `${event.venue}, ${event.address}`,
      status: event.checkedIn ? 'Completed' : 'Pending'
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

module.exports = router;