const express = require('express');
const router = express.Router();
const volunteersData = require('./volunteersMatchData');
const volunteerHistoryRecords = require('./volunteerHistoryData');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

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
 * @route   GET /pages/match-volunteers/volunteers/search
 * @desc    Search for volunteers by different criteria
 * @access  Admin only
 */
router.get('/volunteers/search', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const { type, term } = req.query;
    
    if (!type || !term) {
      return res.status(400).json({ error: 'Search type and term are required' });
    }

    let volunteer;
    
    // Find volunteer based on search type
    switch (type) {
      case 'username':
        volunteer = volunteersData.find(v => v.username === term);
        break;
      case 'email':
        volunteer = volunteersData.find(v => v.email === term);
        break;
      case 'phone':
        volunteer = volunteersData.find(v => v.phone_number === term);
        break;
      case 'name':
        // Search by either first or last name (case insensitive)
        volunteer = volunteersData.find(v => 
          v.first_name.toLowerCase().includes(term.toLowerCase()) || 
          v.last_name.toLowerCase().includes(term.toLowerCase())
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid search type' });
    }

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (error) {
    console.error('Error searching for volunteer:', error);
    res.status(500).json({ error: 'Server error while searching for volunteer' });
  }
});

/**
 * @route   GET /pages/match-volunteers/volunteers/:username/history
 * @desc    Get volunteering history for a specific volunteer
 * @access  Admin only
 */
router.get('/volunteers/:username/history', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const { username } = req.params;
    
    // Find the volunteer
    const volunteer = volunteersData.find(v => v.username === username);
    
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    // Find history records for this volunteer by matching volunteerName
    const history = volunteerHistoryRecords
      .filter(record => record.volunteerName === `${volunteer.first_name} ${volunteer.last_name}`)
      .map(record => ({
        eventName: record.eventName,
        eventDate: record.eventDate,
        checkin: record.status === 'Checked In' // Convert status to boolean for frontend
      }))
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)); // Sort newest first
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ error: 'Server error while fetching volunteer history' });
  }
});

/**
 * @route   GET /pages/match-volunteers/events
 * @desc    Get list of available events for volunteer matching
 * @access  Admin only
 */
router.get('/events', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    // Extract unique events from the history records
    const events = [...new Set(volunteerHistoryRecords.map(record => record.eventName))]
      .map(eventName => {
        const eventRecord = volunteerHistoryRecords.find(r => r.eventName === eventName);
        return {
          name: eventName,
          date: eventRecord.eventDate,
          description: eventRecord.description,
          maxVolunteers: eventRecord.maxVolunteers
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error while fetching events' });
  }
});

/**
 * @route   POST /pages/match-volunteers/match
 * @desc    Match a volunteer to an event
 * @access  Admin only
 */
router.post('/match', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const { username, eventName } = req.body;
    
    if (!username || !eventName) {
      return res.status(400).json({ error: 'Username and event name are required' });
    }
    
    // Verify volunteer exists
    const volunteer = volunteersData.find(v => v.username === username);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    // Verify event exists
    const event = volunteerHistoryRecords.find(r => r.eventName === eventName);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if volunteer is already assigned to this event
    const existingMatch = volunteerHistoryRecords.find(
      r => r.volunteerName === `${volunteer.first_name} ${volunteer.last_name}` && r.eventName === eventName
    );
    
    if (existingMatch) {
      return res.status(400).json({ error: 'Volunteer is already matched to this event' });
    }
    
    // Create new record
    const newId = Math.max(...volunteerHistoryRecords.map(r => r.id)) + 1;
    
    const newRecord = {
      id: newId,
      volunteerName: `${volunteer.first_name} ${volunteer.last_name}`,
      eventName: eventName,
      eventDate: event.eventDate,
      status: 'Pending', // Initial status is pending
      hoursServed: 0,
      description: `Matched to ${eventName}`,
      maxVolunteers: event.maxVolunteers
    };
    
    volunteerHistoryRecords.push(newRecord);
    
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error matching volunteer to event:', error);
    res.status(500).json({ error: 'Server error while matching volunteer to event' });
  }
});

/**
 * @route   PUT /pages/match-volunteers/status/:id
 * @desc    Update volunteer event status (check-in/out)
 * @access  Admin only
 */
router.put('/status/:id', authenticateToken, verifyAdminAccess, (req, res) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const { status, hoursServed } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Find the record
    const recordIndex = volunteerHistoryRecords.findIndex(r => r.id === recordId);
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Update the record
    volunteerHistoryRecords[recordIndex] = {
      ...volunteerHistoryRecords[recordIndex],
      status: status,
      hoursServed: hoursServed || volunteerHistoryRecords[recordIndex].hoursServed
    };
    
    res.json(volunteerHistoryRecords[recordIndex]);
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    res.status(500).json({ error: 'Server error while updating volunteer status' });
  }
});

module.exports = router;