const express = require('express');
const router = express.Router();
const pool = require('./config/database');


// Add this to the top of your eventManagementRoutes.js file
router.get('/test-connection', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      result
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message
    });
  }
});


// Authentication middleware (reusing from volunteer routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // In a real implementation, you would verify the token
  // For now, we'll just assume it's valid and add a mock user object to the request
  req.user = { role: 'admin' }; // Mock user data
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

// Validate event data (similar to validateRecord in volunteerHistoryRoutes.js)
function validateEvent(event) {
  const errors = [];

  if (!event.name) errors.push("Event name is required");
  if (!event.location) errors.push("Location is required");
  if (!event.date) errors.push("Date is required");
  if (!event.description) errors.push("Description is required");
  if (!event.volunteersNeeded) errors.push("Number of volunteers needed is required");

  if (event.name && event.name.length > 100) {
    errors.push("Event name must be less than 100 characters");
  }
  if (event.description && event.description.length > 200) {
    errors.push("Description must be less than 200 characters");
  }

  if (event.volunteersNeeded && isNaN(parseInt(event.volunteersNeeded))) {
    errors.push("Volunteers needed must be a number");
  }

  if (event.date && isNaN(new Date(event.date).valueOf())) {
    errors.push("Invalid event date");
  }

  return errors;
}

/**
 * Helper function to get all events with details in a single query
 */
async function getEventsWithDetails(futureOnly = false) {
  try {
    console.log(`[getEventsWithDetails] Fetching events with futureOnly=${futureOnly}`);
    
    let query = `
      SELECT 
        e.EID as id, 
        e.Name as name, 
        e.Description as description,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date, 
        e.max_volunteers as volunteersNeeded,
        e.Urgency as urgency, 
        l.venue_name as venue, 
        l.address as address,
        (
          SELECT COUNT(*) 
          FROM Volunteering_History 
          WHERE EID = e.EID
        ) as volunteersRegistered,
        (
          SELECT COUNT(*) 
          FROM Volunteering_History 
          WHERE EID = e.EID AND checkin = 1
        ) as volunteersConfirmed,
        (
          SELECT GROUP_CONCAT(s.skill_name)
          FROM Event_Skills es
          JOIN Skills s ON es.skill_id = s.skill_id
          WHERE es.event_id = e.EID
        ) as skills
      FROM Events e
      JOIN Locations l ON e.Location_id = l.LocID
    `;
    
    if (futureOnly) {
      query += ` WHERE e.Date >= CURDATE()`;
    }
    
    query += ` ORDER BY e.Date`;
    
    const [rows] = await pool.query(query);
    console.log(`[getEventsWithDetails] Query returned ${rows.length} rows`);
    
    if (!Array.isArray(rows)) {
      console.error('[getEventsWithDetails] Expected rows to be an array, got:', typeof rows);
      return [];
    }
    
    const mappedEvents = rows.map(row => ({
      id: row.id,
      name: row.name,
      location: `${row.venue}, ${row.address}`,
      date: row.date,
      description: row.description,
      volunteersNeeded: row.volunteersNeeded,
      volunteersRegistered: parseInt(row.volunteersRegistered) || 0,
      volunteersConfirmed: parseInt(row.volunteersConfirmed) || 0,
      skills: row.skills ? row.skills.split(',') : [],
      urgency: row.urgency
    }));
    
    console.log(`[getEventsWithDetails] Mapped ${mappedEvents.length} events`);
    
    // Ensure we're returning an array
    return Array.isArray(mappedEvents) ? mappedEvents : [];
  } catch (error) {
    console.error('[getEventsWithDetails] Error fetching events:', error);
    return []; // Return empty array on error
  }
}

/**
 * Helper function to get a single event with details
 */
async function getEventById(eventId) {
  try {
    console.log(`[getEventById] Fetching event with ID: ${eventId}`);
    
    if (!eventId || isNaN(parseInt(eventId))) {
      console.error(`[getEventById] Invalid event ID: ${eventId}`);
      return null;
    }
    
    const [rows] = await pool.query(`
      SELECT 
        e.EID as id, 
        e.Name as name, 
        e.Description as description,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date, 
        e.max_volunteers as volunteersNeeded,
        e.Urgency as urgency, 
        l.venue_name as venue, 
        l.address as address,
        (
          SELECT COUNT(*) 
          FROM Volunteering_History 
          WHERE EID = e.EID
        ) as volunteersRegistered,
        (
          SELECT COUNT(*) 
          FROM Volunteering_History 
          WHERE EID = e.EID AND checkin = 1
        ) as volunteersConfirmed,
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
    
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`[getEventById] No event found with ID: ${eventId}`);
      return null;
    }
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      location: `${rows[0].venue}, ${rows[0].address}`,
      date: rows[0].date,
      description: rows[0].description,
      volunteersNeeded: rows[0].volunteersNeeded,
      volunteersRegistered: parseInt(rows[0].volunteersRegistered) || 0,
      volunteersConfirmed: parseInt(rows[0].volunteersConfirmed) || 0,
      skills: rows[0].skills ? rows[0].skills.split(',') : [],
      urgency: rows[0].urgency
    };
  } catch (error) {
    console.error(`[getEventById] Error fetching event by ID ${eventId}:`, error);
    return null;
  }
}

/**
 * Helper function to find location by name or venue
 */
async function findLocationId(locationString) {
  try {
    console.log(`[findLocationId] Looking for location: "${locationString}"`);
    
    if (!locationString) {
      console.error('[findLocationId] Empty location string provided');
      return null;
    }
    
    // Extract venue name from the location string
    let venueName = locationString;
    if (locationString.includes(',')) {
      venueName = locationString.split(',')[0].trim();
    }
    
    // Try exact match first
    const [locations] = await pool.query(
      'SELECT LocID FROM Locations WHERE venue_name = ?',
      [venueName]
    );
    
    if (Array.isArray(locations) && locations.length > 0) {
      console.log(`[findLocationId] Found exact match: ${locations[0].LocID}`);
      return locations[0].LocID;
    }
    
    // Try partial match
    const [similarLocations] = await pool.query(
      'SELECT LocID FROM Locations WHERE venue_name LIKE ?',
      [`%${venueName}%`]
    );
    
    if (Array.isArray(similarLocations) && similarLocations.length > 0) {
      console.log(`[findLocationId] Found partial match: ${similarLocations[0].LocID}`);
      return similarLocations[0].LocID;
    }
    
    console.log(`[findLocationId] No location found for: "${locationString}"`);
    return null;
  } catch (error) {
    console.error('[findLocationId] Error finding location:', error);
    return null;
  }
}

/**
 * @route   GET /api/events/locations
 * @desc    Get all available locations
 * @access  Public
 */
router.get('/locations', async (req, res) => {
  try {
    console.log('[GET /locations] Fetching all locations');
    
    const [locations] = await pool.query(
      'SELECT LocID as id, venue_name as venue, address FROM Locations'
    );
    
    if (!Array.isArray(locations)) {
      console.error('[GET /locations] Expected locations to be an array, got:', typeof locations);
      return res.status(500).json({ error: 'Invalid data format from database' });
    }
    
    const formattedLocations = locations.map(loc => ({
      id: loc.id,
      name: `${loc.venue}, ${loc.address}`,
      venue: loc.venue,
      address: loc.address
    }));
    
    console.log(`[GET /locations] Returning ${formattedLocations.length} locations`);
    res.json(formattedLocations);
  } catch (error) {
    console.error('[GET /locations] Error fetching locations:', error);
    res.status(500).json({ error: 'Server error while fetching locations' });
  }
});

/**
 * @route   GET /api/events/skills
 * @desc    Get all available skills
 * @access  Public
 */
router.get('/skills', async (req, res) => {
  try {
    console.log('[GET /skills] Fetching all skills');
    
    const [skills] = await pool.query(
      'SELECT skill_id as id, skill_name as name, skill_description as description FROM Skills'
    );
    
    if (!Array.isArray(skills)) {
      console.error('[GET /skills] Expected skills to be an array, got:', typeof skills);
      return res.status(500).json({ error: 'Invalid data format from database' });
    }
    
    console.log(`[GET /skills] Returning ${skills.length} skills`);
    res.json(skills);
  } catch (error) {
    console.error('[GET /skills] Error fetching skills:', error);
    res.status(500).json({ error: 'Server error while fetching skills' });
  }
});

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('[GET /] Request received for events, query params:', req.query);
    const futureOnly = req.query.future === 'true';
    
    const events = await getEventsWithDetails(futureOnly);
    
    // Ensure we're sending an array
    if (!Array.isArray(events)) {
      console.error('[GET /] getEventsWithDetails did not return an array:', typeof events);
      return res.status(500).json({ error: 'Server error while fetching events' });
    }
    
    console.log(`[GET /] Returning ${events.length} events`);
    console.log('[GET /] Type of events:', typeof events);
    console.log('[GET /] Is array?', Array.isArray(events));
    
    // Return an empty array if no events found
    return res.json(events);
  } catch (error) {
    console.error('[GET /] Error fetching events:', error);
    return res.status(500).json({ error: 'Server error while fetching events' });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    console.log(`[GET /:id] Request received for event ID: ${req.params.id}`);
    
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      console.error(`[GET /:id] Invalid event ID: ${req.params.id}`);
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const event = await getEventById(eventId);
    
    if (!event) {
      console.log(`[GET /:id] Event not found with ID: ${eventId}`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log(`[GET /:id] Found event: ${event.name}`);
    res.json(event);
  } catch (error) {
    console.error(`[GET /:id] Error fetching event by ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Server error while fetching event' });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Admin only
 */
router.post('/', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    console.log('[POST /] Request to create new event:', req.body);
    
    const newEvent = req.body;
    const errors = validateEvent(newEvent);
    
    if (errors.length > 0) {
      console.log('[POST /] Validation errors:', errors);
      return res.status(400).json({ errors });
    }
    
    // Find location ID
    const locationId = await findLocationId(newEvent.location);
    
    if (!locationId) {
      console.log('[POST /] No matching location found:', newEvent.location);
      return res.status(400).json({ 
        error: 'No matching location found. Please select a location from the provided list.'
      });
    }
    
    // Ensure date is in YYYY-MM-DD format for MySQL
    const eventDate = new Date(newEvent.date).toISOString().split('T')[0];
    
    // Start a transaction for data consistency
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert new event
      const [result] = await connection.query(
        `INSERT INTO Events (Name, Description, Date, max_volunteers, Location_id, Urgency)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newEvent.name, 
          newEvent.description, 
          eventDate, 
          parseInt(newEvent.volunteersNeeded, 10), 
          locationId,
          newEvent.urgency || 'Medium'
        ]
      );
      
      const newEventId = result.insertId;
      console.log(`[POST /] Created new event with ID: ${newEventId}`);
      
      // If skills are provided, associate them with the event
      if (Array.isArray(newEvent.skills) && newEvent.skills.length > 0) {
        console.log(`[POST /] Adding ${newEvent.skills.length} skills to event`);
        
        for (const skillName of newEvent.skills) {
          const [foundSkills] = await connection.query(
            'SELECT skill_id FROM Skills WHERE skill_name = ?',
            [skillName]
          );
          
          if (foundSkills.length > 0) {
            const skillId = foundSkills[0].skill_id;
            // Insert into junction table
            await connection.query(
              'INSERT INTO Event_Skills (event_id, skill_id) VALUES (?, ?)',
              [newEventId, skillId]
            );
          }
        }
      }
      
      await connection.commit();
      
      // Get the complete event data to return
      const createdEvent = await getEventById(newEventId);
      
      // Add the time to the response
      if (newEvent.time) {
        createdEvent.time = newEvent.time;
      }
      
      console.log('[POST /] Successfully created event');
      res.status(201).json(createdEvent);
    } catch (error) {
      console.error('[POST /] Transaction error:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[POST /] Error creating event:', error);
    res.status(500).json({ error: 'Server error while creating event' });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Admin only
 */
router.put('/:id', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    console.log(`[PUT /:id] Request to update event ${eventId}:`, req.body);
    
    // Check if event exists
    const existingEvent = await getEventById(eventId);
    
    if (!existingEvent) {
      console.log(`[PUT /:id] Event not found with ID: ${eventId}`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const updatedEvent = req.body;
    const errors = validateEvent(updatedEvent);
    
    if (errors.length > 0) {
      console.log('[PUT /:id] Validation errors:', errors);
      return res.status(400).json({ errors });
    }
    
    // Find location ID
    const locationId = await findLocationId(updatedEvent.location);
    
    if (!locationId) {
      console.log('[PUT /:id] No matching location found:', updatedEvent.location);
      return res.status(400).json({ 
        error: 'No matching location found. Please select a location from the provided list.'
      });
    }
    
    // Ensure date is in YYYY-MM-DD format for MySQL
    const eventDate = new Date(updatedEvent.date).toISOString().split('T')[0];
    
    // Start a transaction for data consistency
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update event
      await connection.query(
        `UPDATE Events 
         SET Name = ?, Description = ?, Date = ?, max_volunteers = ?, Location_id = ?, Urgency = ?
         WHERE EID = ?`,
        [
          updatedEvent.name, 
          updatedEvent.description, 
          eventDate, 
          parseInt(updatedEvent.volunteersNeeded, 10), 
          locationId,
          updatedEvent.urgency || 'Medium',
          eventId
        ]
      );
      
      // Update skills if provided
      if (Array.isArray(updatedEvent.skills)) {
        // First, remove all existing skills for this event
        await connection.query('DELETE FROM Event_Skills WHERE event_id = ?', [eventId]);
        
        // Then add the new skills
        if (updatedEvent.skills.length > 0) {
          console.log(`[PUT /:id] Updating with ${updatedEvent.skills.length} skills`);
          
          for (const skillName of updatedEvent.skills) {
            const [foundSkills] = await connection.query(
              'SELECT skill_id FROM Skills WHERE skill_name = ?',
              [skillName]
            );
            
            if (foundSkills.length > 0) {
              const skillId = foundSkills[0].skill_id;
              // Insert into junction table
              await connection.query(
                'INSERT INTO Event_Skills (event_id, skill_id) VALUES (?, ?)',
                [eventId, skillId]
              );
            }
          }
        }
      }
      
      await connection.commit();
      
      // Get the updated event data
      const updatedEventData = await getEventById(eventId);
      
      // Add the time to the response
      if (updatedEvent.time) {
        updatedEventData.time = updatedEvent.time;
      }
      
      console.log(`[PUT /:id] Successfully updated event ${eventId}`);
      res.json(updatedEventData);
    } catch (error) {
      console.error('[PUT /:id] Transaction error:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`[PUT /:id] Error updating event ${req.params.id}:`, error);
    res.status(500).json({ error: 'Server error while updating event' });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Admin only
 */
router.delete('/:id', authenticateToken, verifyAdminAccess, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    console.log(`[DELETE /:id] Request to delete event ${eventId}`);
    
    // Check if event exists
    const existingEvent = await getEventById(eventId);
    
    if (!existingEvent) {
      console.log(`[DELETE /:id] Event not found with ID: ${eventId}`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Start a transaction for data consistency
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete associated records first (respecting foreign key constraints)
      
      // 1. Delete from Event_Skills
      await connection.query('DELETE FROM Event_Skills WHERE event_id = ?', [eventId]);
      
      // 2. Delete from Notifications (if there are any)
      await connection.query('DELETE FROM Notifications WHERE event_id = ?', [eventId]);
      
      // 3. Delete from Volunteering_History (if there are any)
      await connection.query('DELETE FROM Volunteering_History WHERE EID = ?', [eventId]);
      
      // 4. Finally delete the event itself
      await connection.query('DELETE FROM Events WHERE EID = ?', [eventId]);
      
      await connection.commit();
      
      console.log(`[DELETE /:id] Successfully deleted event ${eventId}`);
      res.json({ 
        message: 'Event deleted successfully', 
        deletedEvent: existingEvent
      });
    } catch (error) {
      console.error('[DELETE /:id] Transaction error:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`[DELETE /:id] Error deleting event ${req.params.id}:`, error);
    res.status(500).json({ error: 'Server error while deleting event' });
  }
});

/**
 * @route   GET /api/events/search/skills
 * @desc    Search events by skills
 * @access  Public
 */
router.get('/search/skills', async (req, res) => {
  try {
    console.log('[GET /search/skills] Request received, query params:', req.query);
    const { skills } = req.query;
    
    if (!skills) {
      console.log('[GET /search/skills] No skills parameter provided');
      return res.status(400).json({ error: 'Skills parameter is required' });
    }
    
    const searchSkills = skills.split(',').map(skill => skill.trim());
    console.log(`[GET /search/skills] Searching for events with skills: ${searchSkills.join(', ')}`);
    
    // Use a single query to get events that match any of the requested skills
    const [rows] = await pool.query(`
      SELECT 
        e.EID as id, 
        e.Name as name, 
        e.Description as description,
        DATE_FORMAT(e.Date, '%Y-%m-%d') as date, 
        e.max_volunteers as volunteersNeeded,
        e.Urgency as urgency, 
        l.venue_name as venue, 
        l.address as address,
        (
          SELECT COUNT(*) 
          FROM Volunteering_History 
          WHERE EID = e.EID
        ) as volunteersRegistered,
        (
          SELECT COUNT(*) 
          FROM Volunteering_History 
          WHERE EID = e.EID AND checkin = 1
        ) as volunteersConfirmed,
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
      WHERE s.skill_name IN (?)
      GROUP BY e.EID
    `, [searchSkills]);
    
    if (!Array.isArray(rows)) {
      console.error('[GET /search/skills] Expected rows to be an array, got:', typeof rows);
      return res.status(500).json({ error: 'Invalid data format from database' });
    }
    
    const formattedEvents = rows.map(row => ({
      id: row.id,
      name: row.name,
      location: `${row.venue}, ${row.address}`,
      date: row.date,
      description: row.description,
      volunteersNeeded: row.volunteersNeeded,
      volunteersRegistered: parseInt(row.volunteersRegistered) || 0,
      volunteersConfirmed: parseInt(row.volunteersConfirmed) || 0,
      skills: row.skills ? row.skills.split(',') : [],
      urgency: row.urgency
    }));
    
    console.log(`[GET /search/skills] Found ${formattedEvents.length} matching events`);
    res.json(formattedEvents);
  } catch (error) {
    console.error('[GET /search/skills] Error searching events by skills:', error);
    res.status(500).json({ error: 'Server error while searching events' });
  }
});

module.exports = router;