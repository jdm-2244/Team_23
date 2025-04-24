const express = require('express');
const router = express.Router();
const pool = require('./config/database');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateNotificationInput = [
  body('toEmail').isEmail().withMessage('Invalid email address'),
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 200 }).withMessage('Message must be less than 200 characters'),
  body('eventId').optional().isInt().withMessage('Invalid event ID')
];

// Search for volunteer by different criteria
router.get('/searchVolunteer', async (req, res) => {
  try {
    const { searchType, searchTerm } = req.query;
    
    if (!searchTerm || !searchType) {
      return res.status(400).json({ error: 'Search type and search term are required' });
    }

    let query;
    
    switch (searchType) {
      case 'username':
        query = `
          SELECT u.username, u.email, u.phone_number, u.role, 
                 CONCAT(p.first_name, ' ', p.last_name) AS Name, 
                 p.location, p.last_update
          FROM Users u
          JOIN User_Profile p ON u.username = p.user_id
          WHERE u.username LIKE ? AND u.role = 'volunteer'`;
        break;
      case 'email':
        query = `
          SELECT u.username, u.email, u.phone_number, u.role, 
                 CONCAT(p.first_name, ' ', p.last_name) AS Name, 
                 p.location, p.last_update
          FROM Users u
          JOIN User_Profile p ON u.username = p.user_id
          WHERE u.email LIKE ? AND u.role = 'volunteer'`;
        break;
      case 'phone':
        query = `
          SELECT u.username, u.email, u.phone_number, u.role, 
                 CONCAT(p.first_name, ' ', p.last_name) AS Name, 
                 p.location, p.last_update
          FROM Users u
          JOIN User_Profile p ON u.username = p.user_id
          WHERE u.phone_number LIKE ? AND u.role = 'volunteer'`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid search type' });
    }

    const [results] = await pool.query(query, [`%${searchTerm}%`]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'No volunteers found' });
    }

    // Format the result
    const volunteer = results[0];
    
    res.json({
      username: volunteer.username,
      email: volunteer.email,
      phone_number: volunteer.phone_number,
      role: volunteer.role,
      profile: {
        Name: volunteer.Name,
        location: volunteer.location,
        last_update: volunteer.last_update
      }
    });
  } catch (error) {
    console.error('Error searching for volunteer:', error);
    res.status(500).json({ error: 'Failed to search for volunteer', details: error.message });
  }
});

// Send notification to volunteer
router.post('/send', validateNotificationInput, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }

  const { toEmail, message, eventId } = req.body;
  
  try {
    // Get user info from email and verify they are a volunteer
    const [userResults] = await pool.query(
      'SELECT username, role FROM Users WHERE email = ?', 
      [toEmail]
    );
    
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found with this email' });
    }
    
    if (userResults[0].role !== 'volunteer') {
      return res.status(403).json({ error: 'Notifications can only be sent to volunteers' });
    }
    
    const userId = userResults[0].username;
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // If eventId is provided, add to Notifications table
      if (eventId) {
        // First check if event exists
        const [eventCheck] = await connection.query(
          'SELECT EID FROM Events WHERE EID = ?',
          [eventId]
        );
        
        if (eventCheck.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'Event not found' });
        }
        
        // Insert notification into database
        await connection.query(
          'INSERT INTO Notifications (event_id, user_id, message) VALUES (?, ?, ?)',
          [eventId, userId, message]
        );
      } else {
        // For notifications without an event, we need to provide a default event
        // This is because the Notifications table requires an event_id
        try {
          const [firstEvent] = await connection.query('SELECT EID FROM Events LIMIT 1');
          if (firstEvent.length > 0) {
            await connection.query(
              'INSERT INTO Notifications (event_id, user_id, message) VALUES (?, ?, ?)',
              [firstEvent[0].EID, userId, message]
            );
          } else {
            console.warn('No events found in database, notification cannot be sent');
            await connection.rollback();
            return res.status(404).json({ error: 'No events found in the system to associate with the notification' });
          }
        } catch (err) {
          console.warn('Error finding default event:', err.message);
          await connection.rollback();
          return res.status(500).json({ error: 'Error finding an event to associate with the notification' });
        }
      }
      
      await connection.commit();
      
      res.json({ 
        message: 'Notification added to database successfully', 
        success: true 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

// Send notification to all volunteers
router.post('/send-to-all', [
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 200 }).withMessage('Message must be less than 200 characters'),
  body('eventId').optional().isInt().withMessage('Invalid event ID')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }

  const { message, eventId } = req.body;
  
  try {
    // Get all volunteers
    const [volunteers] = await pool.query(
      'SELECT username, email FROM Users WHERE role = ?',
      ['volunteer']
    );
    
    if (volunteers.length === 0) {
      return res.status(404).json({ error: 'No volunteers found in the system' });
    }
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if event exists when eventId is provided
      if (eventId) {
        const [eventCheck] = await connection.query(
          'SELECT EID FROM Events WHERE EID = ?',
          [eventId]
        );
        
        if (eventCheck.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'Event not found' });
        }
      }
      
      // Use either the provided event ID or find a default one
      let actualEventId = eventId;
      if (!actualEventId) {
        const [firstEvent] = await connection.query('SELECT EID FROM Events LIMIT 1');
        if (firstEvent.length > 0) {
          actualEventId = firstEvent[0].EID;
        } else {
          await connection.rollback();
          return res.status(404).json({ error: 'No events found in the system to associate with the notification' });
        }
      }
      
      // Insert notifications for all volunteers
      const successCount = {
        database: 0
      };
      
      const failedNotifications = [];
      
      for (const volunteer of volunteers) {
        try {
          // Insert notification into database
          await connection.query(
            'INSERT INTO Notifications (event_id, user_id, message) VALUES (?, ?, ?)',
            [actualEventId, volunteer.username, message]
          );
          successCount.database++;
        } catch (err) {
          failedNotifications.push({
            username: volunteer.username,
            email: volunteer.email,
            error: err.message
          });
          console.error(`Error sending notification to volunteer ${volunteer.username}:`, err);
        }
      }
      
      await connection.commit();
      
      // Prepare response based on success/failure counts
      if (successCount.database === volunteers.length) {
        res.json({
          message: `Notification successfully added to database for all ${volunteers.length} volunteers.`,
          success: true,
          count: volunteers.length
        });
      } else {
        res.status(207).json({
          message: 'Notification sent with some failures',
          success: true,
          successCount: { database: successCount.database },
          totalVolunteers: volunteers.length,
          failedNotifications
        });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error sending notification to all volunteers:', error);
    res.status(500).json({ error: 'Failed to send notification to all volunteers', details: error.message });
  }
});

// Get notifications for a specific volunteer
router.get('/volunteer/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // First check if the user is a volunteer
    const [userCheck] = await pool.query(
      'SELECT role FROM Users WHERE username = ?',
      [username]
    );
    
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userCheck[0].role !== 'volunteer') {
      return res.status(403).json({ error: 'This endpoint is only for volunteer notifications' });
    }
    
    const [notifications] = await pool.query(
      `SELECT n.Noti_id, n.message, n.sent_at, e.Name as event_name, e.Date as event_date
       FROM Notifications n
       JOIN Events e ON n.event_id = e.EID
       WHERE n.user_id = ?
       ORDER BY n.sent_at DESC`,
      [username]
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching volunteer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
});

// Get all volunteer notifications (admin only)
router.get('/all', async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT n.Noti_id, n.message, n.sent_at, 
              e.Name as event_name, e.Date as event_date,
              CONCAT(p.first_name, ' ', p.last_name) as recipient_name,
              u.email as recipient_email,
              u.username as volunteer_id
       FROM Notifications n
       JOIN Events e ON n.event_id = e.EID
       JOIN Users u ON n.user_id = u.username
       JOIN User_Profile p ON u.username = p.user_id
       WHERE u.role = 'volunteer'
       ORDER BY n.sent_at DESC`
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching all volunteer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM Notifications WHERE Noti_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification', details: error.message });
  }
});

module.exports = router;