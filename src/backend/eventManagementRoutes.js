const express = require('express');
const router = express.Router();
const eventsData = require('./eventManagementData'); 

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

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    // Transform the events to match the frontend's expected format
    const formattedEvents = eventsData.map(event => ({
      id: event.id,
      name: event.eventName || event.name,
      location: event.location,
      date: event.eventDate || event.date,
      time: event.startTime || event.time,
      description: event.eventDescription || event.description,
      volunteersNeeded: event.maxVolunteers || event.volunteersNeeded,
      volunteersRegistered: event.volunteersAssigned || 0,
      skills: event.requiredSkills || event.skills || []
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error while fetching events' });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const event = eventsData.find(event => event.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Transform to frontend format
    const formattedEvent = {
      id: event.id,
      name: event.eventName || event.name,
      location: event.location,
      date: event.eventDate || event.date,
      time: event.startTime || event.time,
      description: event.eventDescription || event.description,
      volunteersNeeded: event.maxVolunteers || event.volunteersNeeded,
      volunteersRegistered: event.volunteersAssigned || 0,
      skills: event.requiredSkills || event.skills || []
    };
    
    res.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Server error while fetching event' });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Admin only
 */
router.post('/', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const {
      name,
      location,
      date,
      time,
      description,
      volunteersNeeded,
      skills
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !location || !date || !volunteersNeeded) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    // Create a new event with a unique ID
    const newId = eventsData.length > 0 ? Math.max(...eventsData.map(e => e.id)) + 1 : 1;
    
    // Store data in the format the backend expects but with frontend field names
    const newEvent = {
      id: newId,
      eventName: name,
      name: name, // Store both for compatibility
      eventDescription: description,
      description: description, // Store both for compatibility
      location,
      eventDate: date,
      date: date, // Store both for compatibility
      startTime: time,
      time: time, // Store both for compatibility
      requiredSkills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []), // Store both for compatibility
      maxVolunteers: parseInt(volunteersNeeded, 10),
      volunteersNeeded: parseInt(volunteersNeeded, 10), // Store both for compatibility
      volunteersAssigned: 0,
      volunteersRegistered: 0, // For frontend compatibility
      createdAt: new Date().toISOString(),
      createdBy: req.user.id || 'admin',
      status: 'Active',
      // Default values for fields not provided by frontend
      urgency: 'Medium',
      contactPerson: 'Admin',
      contactEmail: 'admin@impactnow.org',
      contactPhone: '555-123-4567',
      endTime: '', // Could calculate based on time + duration
      visibility: 'Public'
    };
    
    eventsData.push(newEvent);
    
    // Return the event in the format the frontend expects
    const formattedEvent = {
      id: newEvent.id,
      name: newEvent.name,
      location: newEvent.location,
      date: newEvent.date,
      time: newEvent.time,
      description: newEvent.description,
      volunteersNeeded: newEvent.volunteersNeeded,
      volunteersRegistered: newEvent.volunteersRegistered,
      skills: newEvent.skills
    };
    
    res.status(201).json(formattedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error while creating event' });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Admin only
 */
router.put('/:id', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const eventIndex = eventsData.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get current event data
    const currentEvent = eventsData[eventIndex];
    
    const {
      name,
      location,
      date,
      time,
      description,
      volunteersNeeded,
      skills
    } = req.body;
    
    // Update with new data, keeping old data for any missing fields
    const updatedEvent = {
      ...currentEvent,
      eventName: name || currentEvent.eventName,
      name: name || currentEvent.name,
      location: location || currentEvent.location,
      eventDate: date || currentEvent.eventDate,
      date: date || currentEvent.date,
      startTime: time || currentEvent.startTime,
      time: time || currentEvent.time,
      eventDescription: description || currentEvent.eventDescription,
      description: description || currentEvent.description,
      requiredSkills: skills ? (Array.isArray(skills) ? skills : [skills]) : currentEvent.requiredSkills,
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : currentEvent.skills,
      maxVolunteers: volunteersNeeded ? parseInt(volunteersNeeded, 10) : currentEvent.maxVolunteers,
      volunteersNeeded: volunteersNeeded ? parseInt(volunteersNeeded, 10) : currentEvent.volunteersNeeded,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id || 'admin'
    };
    
    // Replace the old event with the updated one
    eventsData[eventIndex] = updatedEvent;
    
    // Return the event in the format the frontend expects
    const formattedEvent = {
      id: updatedEvent.id,
      name: updatedEvent.name,
      location: updatedEvent.location,
      date: updatedEvent.date,
      time: updatedEvent.time,
      description: updatedEvent.description,
      volunteersNeeded: updatedEvent.volunteersNeeded,
      volunteersRegistered: updatedEvent.volunteersRegistered || updatedEvent.volunteersAssigned || 0,
      skills: updatedEvent.skills
    };
    
    res.json(formattedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error while updating event' });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Admin only
 */
router.delete('/:id', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const eventIndex = eventsData.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Remove the event
    const deletedEvent = eventsData.splice(eventIndex, 1)[0];
    
    res.json({ message: 'Event deleted successfully', deletedEvent });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error while deleting event' });
  }
});

// The rest of the search/filter routes could remain the same
// or be updated to work with both field naming conventions

/**
 * @route   GET /api/events/search/skills
 * @desc    Search events by skills
 * @access  Public
 */
router.get('/search/skills', (req, res) => {
  try {
    const { skills } = req.query;
    
    if (!skills) {
      return res.status(400).json({ error: 'Skills parameter is required' });
    }
    
    const searchSkills = skills.split(',').map(skill => skill.trim().toLowerCase());
    
    const matchedEvents = eventsData.filter(event => {
      const eventSkills = event.requiredSkills || event.skills || [];
      return eventSkills.some(skill => 
        searchSkills.includes(skill.toLowerCase())
      );
    });
    
    // Format for frontend
    const formattedEvents = matchedEvents.map(event => ({
      id: event.id,
      name: event.eventName || event.name,
      location: event.location,
      date: event.eventDate || event.date,
      time: event.startTime || event.time,
      description: event.eventDescription || event.description,
      volunteersNeeded: event.maxVolunteers || event.volunteersNeeded,
      volunteersRegistered: event.volunteersAssigned || 0,
      skills: event.requiredSkills || event.skills || []
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error('Error searching events by skills:', error);
    res.status(500).json({ error: 'Server error while searching events' });
  }
});

// Keep the remaining routes the same but add similar field compatibility adaptations

module.exports = router;