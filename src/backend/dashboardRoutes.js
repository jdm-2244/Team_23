const express = require('express');
const router = express.Router();
const pool = require('./config/database');

/**
 * @route   GET /api/dashboard/:username
 * @desc    Get all dashboard data for a user in one request
 * @access  Private
 */

router.get('/test', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ success: true, result });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`[GET /dashboard/:username] Fetching dashboard data for user: ${username}`);
    
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' });
    }
    
    // Check if user exists and get user profile first
    const [profileRows] = await pool.query(`
      SELECT 
        p.profile_id,
        p.user_id as username,
        p.location,
        CONCAT(p.first_name, ' ', p.last_name) as fullName,
        p.first_name,
        p.last_name,
        u.email,
        u.phone_number,
        u.role
      FROM User_Profile p
      JOIN Users u ON p.user_id = u.username
      WHERE p.user_id = ?
    `, [username]);
    
    if (profileRows.length === 0) {
      console.log(`[GET /dashboard/:username] User profile not found: ${username}`);
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Extract location from profile for event suggestions
    const userLocation = profileRows[0].location || '';
    const locationPattern = userLocation ? `%${userLocation.split(',')[0].trim()}%` : '%';
    
    console.log(`[GET /dashboard/:username] Using location pattern: ${locationPattern}`);
    
    // Get notifications and events in parallel
    const [notificationsResult, eventsResult] = await Promise.all([
      // 1. Get user notifications
      pool.query(`
        SELECT 
          n.Noti_id as id,
          n.message,
          CASE
            WHEN TIMESTAMPDIFF(MINUTE, n.sent_at, NOW()) < 60 
              THEN CONCAT(TIMESTAMPDIFF(MINUTE, n.sent_at, NOW()), ' min ago')
            WHEN TIMESTAMPDIFF(HOUR, n.sent_at, NOW()) < 24 
              THEN CONCAT(TIMESTAMPDIFF(HOUR, n.sent_at, NOW()), ' hour', IF(TIMESTAMPDIFF(HOUR, n.sent_at, NOW()) = 1, '', 's'), ' ago')
            ELSE CONCAT(TIMESTAMPDIFF(DAY, n.sent_at, NOW()), ' day', IF(TIMESTAMPDIFF(DAY, n.sent_at, NOW()) = 1, '', 's'), ' ago')
          END as time,
          e.Name as eventName
        FROM Notifications n
        JOIN Events e ON n.event_id = e.EID
        WHERE n.user_id = ?
        ORDER BY n.sent_at DESC
        LIMIT 5
      `, [username]),
      
      // 2. Get event suggestions based on user location and skills
      pool.query(`
        SELECT 
          e.EID as id,
          e.Name as name,
          l.venue_name as location,
          DATE_FORMAT(e.Date, '%b %d, %Y') as date,
          e.Description as description
        FROM Events e
        JOIN Locations l ON e.Location_id = l.LocID
        WHERE e.Date >= CURDATE()
        AND (
          l.address LIKE ? 
          OR EXISTS (
            SELECT 1 FROM User_Skills us
            JOIN Event_Skills es ON us.skill_id = es.skill_id
            WHERE us.user_id = ? AND es.event_id = e.EID
          )
        )
        ORDER BY e.Date ASC
        LIMIT 3
      `, [locationPattern, username])
    ]);
    
    // Format the response
    const dashboardData = {
      profile: profileRows[0],
      notifications: notificationsResult[0] || [],
      eventSuggestions: eventsResult[0] || []
    };
    
    console.log(`[GET /dashboard/:username] Successfully fetched dashboard data for user: ${username}`);
    console.log(`[GET /dashboard/:username] Notifications: ${dashboardData.notifications.length}, Events: ${dashboardData.eventSuggestions.length}`);
    
    res.json(dashboardData);
  } catch (error) {
    console.error('[GET /dashboard/:username] Error fetching dashboard data:', error);
    // Include error details in development mode
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

module.exports = router;