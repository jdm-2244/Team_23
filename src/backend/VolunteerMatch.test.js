const request = require('supertest');
const express = require('express');
const pool = require('./config/database');

// Mock the database pool
jest.mock('./config/database', () => {
  return {
    query: jest.fn()
  };
});

// Import the routes
const volunteerMatchRoutes = require('./VolunteerMatchRoutes');

const app = express();
app.use(express.json());
app.use('/api/volunteer-matcher', volunteerMatchRoutes);

// Mock authorization headers
const adminAuthHeader = { Authorization: 'Bearer test-admin-token' };
const userAuthHeader = { Authorization: 'Bearer test-user-token' };

// Create non-admin app for permission testing
const nonAdminApp = express();
nonAdminApp.use(express.json());
nonAdminApp.use((req, res, next) => {
  // Override the authenticateToken middleware for this app
  if (req.headers['authorization'] === 'Bearer test-user-token') {
    req.user = { role: 'user' }; // Non-admin user
    next();
  } else {
    next();
  }
});
nonAdminApp.use('/api/volunteer-matcher', volunteerMatchRoutes);

describe('Volunteer Match Routes', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Test Query', () => {
    it('GET /test-query should return success and count', async () => {
      // Mock the database response
      pool.query.mockResolvedValueOnce([[{ count: 5 }]]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/test-query');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(5);
      expect(pool.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM Events');
    });

    it('GET /test-query should handle database errors', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .get('/api/volunteer-matcher/test-query');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('Volunteers Endpoint', () => {
    it('GET /volunteers should return all volunteers with skills when user is admin', async () => {
      // Mock the database responses
      pool.query.mockResolvedValueOnce([
        [
          {
            username: 'jdoe',
            phone_number: '123-456-7890',
            email: 'jdoe@example.com',
            first_name: 'John',
            last_name: 'Doe'
          },
          {
            username: 'jsmith',
            phone_number: '987-654-3210',
            email: 'jsmith@example.com',
            first_name: 'Jane',
            last_name: 'Smith'
          }
        ]
      ]);
      
      // Mock the skills query for first volunteer
      pool.query.mockResolvedValueOnce([
        [
          { skill_name: 'teaching' },
          { skill_name: 'organizing' }
        ]
      ]);
      
      // Mock the skills query for second volunteer
      pool.query.mockResolvedValueOnce([
        [
          { skill_name: 'leadership' },
          { skill_name: 'communication' }
        ]
      ]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/volunteers')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].username).toBe('jdoe');
      expect(res.body[0].skills).toEqual(['teaching', 'organizing']);
      expect(res.body[1].username).toBe('jsmith');
      expect(res.body[1].skills).toEqual(['leadership', 'communication']);
    });

    it('GET /volunteers should return 401 when user is not authenticated', async () => {
      const res = await request(app)
        .get('/api/volunteer-matcher/volunteers');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('GET /volunteers/search should search for volunteers by term', async () => {
      // Mock the volunteers search results
      pool.query.mockResolvedValueOnce([
        [
          {
            username: 'jdoe',
            phone_number: '123-456-7890',
            email: 'jdoe@example.com',
            first_name: 'John',
            last_name: 'Doe'
          }
        ]
      ]);
      
      // Mock the skills query
      pool.query.mockResolvedValueOnce([
        [
          { skill_name: 'teaching' },
          { skill_name: 'organizing' }
        ]
      ]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/volunteers/search?term=john')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body[0].username).toBe('jdoe');
      expect(res.body[0].skills).toEqual(['teaching', 'organizing']);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('GET /volunteers/search should return 400 when search term is missing', async () => {
      const res = await request(app)
        .get('/api/volunteer-matcher/volunteers/search')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Search term is required');
    });
  });

  describe('Events Endpoint', () => {
    it('GET /events should return all events with required skills', async () => {
      // Mock the events query result
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            eventName: 'Community Food Drive',
            name: 'Community Food Drive',
            location: 'Community Center, 123 Main St',
            eventDate: '2025-04-15',
            date: '2025-04-15',
            eventDescription: 'Help collect and distribute food',
            description: 'Help collect and distribute food',
            maxVolunteers: 20,
            volunteersNeeded: 20,
            urgency: 'High',
            venue: 'Community Center'
          }
        ]
      ]);
      
      // Mock the skills query
      pool.query.mockResolvedValueOnce([
        [
          { skill_name: 'organizing' },
          { skill_name: 'customer service' }
        ]
      ]);
      
      // Mock the volunteer count query
      pool.query.mockResolvedValueOnce([
        [
          { count: 5 }
        ]
      ]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/events')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe(1);
      expect(res.body[0].eventName).toBe('Community Food Drive');
      expect(res.body[0].requiredSkills).toEqual(['organizing', 'customer service']);
      expect(res.body[0].volunteersAssigned).toBe(5);
    });

    it('GET /events/search should search for events by term', async () => {
      // Mock the events search query
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            eventName: 'Community Food Drive',
            name: 'Community Food Drive',
            location: 'Community Center, 123 Main St',
            eventDate: '2025-04-15',
            date: '2025-04-15',
            eventDescription: 'Help collect and distribute food',
            description: 'Help collect and distribute food',
            maxVolunteers: 20,
            volunteersNeeded: 20,
            urgency: 'High',
            venue: 'Community Center'
          }
        ]
      ]);
      
      // Mock the skills query
      pool.query.mockResolvedValueOnce([
        [
          { skill_name: 'organizing' },
          { skill_name: 'customer service' }
        ]
      ]);
      
      // Mock the volunteer count query
      pool.query.mockResolvedValueOnce([
        [
          { count: 5 }
        ]
      ]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/events/search?term=food')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body[0].eventName).toBe('Community Food Drive');
      expect(pool.query).toHaveBeenCalledTimes(3);
    });

    it('GET /events/search should return 400 when search term is missing', async () => {
      const res = await request(app)
        .get('/api/volunteer-matcher/events/search')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Search term is required');
    });

    it('GET /events/skills/:skillName should filter events by required skill', async () => {
      // Mock the events by skill query
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            eventName: 'Community Food Drive',
            name: 'Community Food Drive',
            location: 'Community Center, 123 Main St',
            eventDate: '2025-04-15',
            date: '2025-04-15',
            eventDescription: 'Help collect and distribute food',
            description: 'Help collect and distribute food',
            maxVolunteers: 20,
            volunteersNeeded: 20,
            urgency: 'High'
          }
        ]
      ]);
      
      // Mock the skills query
      pool.query.mockResolvedValueOnce([
        [
          { skill_name: 'organizing' },
          { skill_name: 'customer service' }
        ]
      ]);
      
      // Mock the volunteer count query
      pool.query.mockResolvedValueOnce([
        [
          { count: 5 }
        ]
      ]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/events/skills/organizing')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body[0].requiredSkills).toContain('organizing');
    });
  });

  describe('Match Endpoint', () => {
    it('POST /match should match a volunteer to an event', async () => {
      // Mock user check
      pool.query.mockResolvedValueOnce([[{ username: 'jdoe', role: 'volunteer' }]]);
      
      // Mock event check
      pool.query.mockResolvedValueOnce([[{ EID: 1, Name: 'Community Food Drive' }]]);
      
      // Mock existing match check (no matches)
      pool.query.mockResolvedValueOnce([[]]);
      
      // Mock volunteer count check
      pool.query.mockResolvedValueOnce([[{ count: 5 }]]);
      
      // Mock event details
      pool.query.mockResolvedValueOnce([[{ max_volunteers: 20 }]]);
      
      // Mock insert result
      pool.query.mockResolvedValueOnce([{ insertId: 10 }]);
      
      // Mock event details for response
      pool.query.mockResolvedValueOnce([[{ Name: 'Community Food Drive', Date: '2025-04-15' }]]);
      
      // Mock user details for response
      pool.query.mockResolvedValueOnce([[{ first_name: 'John', last_name: 'Doe' }]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/match')
        .set(adminAuthHeader)
        .send({
          username: 'jdoe',
          eventId: 1
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toContain('Successfully matched John Doe');
      expect(res.body.eventName).toBe('Community Food Drive');
    });

    it('POST /match should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/volunteer-matcher/match')
        .set(adminAuthHeader)
        .send({
          username: 'jdoe'
          // Missing eventId
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Username and event ID are required');
    });

    it('POST /match should return 404 when volunteer is not found', async () => {
      // Mock user check - not found
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/match')
        .set(adminAuthHeader)
        .send({
          username: 'nonexistent',
          eventId: 1
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Volunteer not found');
    });

    it('POST /match should return 404 when event is not found', async () => {
      // Mock user check - found
      pool.query.mockResolvedValueOnce([[{ username: 'jdoe', role: 'volunteer' }]]);
      
      // Mock event check - not found
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/match')
        .set(adminAuthHeader)
        .send({
          username: 'jdoe',
          eventId: 999
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });

    it('POST /match should return 400 when volunteer is already matched to this event', async () => {
      // Mock user check
      pool.query.mockResolvedValueOnce([[{ username: 'jdoe', role: 'volunteer' }]]);
      
      // Mock event check
      pool.query.mockResolvedValueOnce([[{ EID: 1, Name: 'Community Food Drive' }]]);
      
      // Mock existing match check - found match
      pool.query.mockResolvedValueOnce([[{ HID: 5 }]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/match')
        .set(adminAuthHeader)
        .send({
          username: 'jdoe',
          eventId: 1
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Volunteer is already matched to this event');
    });

    it('POST /match should return 400 when event has reached maximum capacity', async () => {
      // Mock user check
      pool.query.mockResolvedValueOnce([[{ username: 'jdoe', role: 'volunteer' }]]);
      
      // Mock event check
      pool.query.mockResolvedValueOnce([[{ EID: 1, Name: 'Community Food Drive' }]]);
      
      // Mock existing match check - no match
      pool.query.mockResolvedValueOnce([[]]);
      
      // Mock volunteer count check - at capacity
      pool.query.mockResolvedValueOnce([[{ count: 20 }]]);
      
      // Mock event details
      pool.query.mockResolvedValueOnce([[{ max_volunteers: 20 }]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/match')
        .set(adminAuthHeader)
        .send({
          username: 'jdoe',
          eventId: 1
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Event has reached maximum volunteer capacity');
    });
  });

  describe('Matches Endpoint', () => {
    it('GET /matches should return all volunteer-event matches', async () => {
      // Mock matches query
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            username: 'jdoe',
            eventId: 1,
            eventName: 'Community Food Drive',
            eventDate: '2025-04-15',
            volunteerName: 'John Doe',
            checkin: 1
          },
          {
            id: 2,
            username: 'jsmith',
            eventId: 2,
            eventName: 'Tech Workshop',
            eventDate: '2025-04-20',
            volunteerName: 'Jane Smith',
            checkin: 0
          }
        ]
      ]);
      
      const res = await request(app)
        .get('/api/volunteer-matcher/matches')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].username).toBe('jdoe');
      expect(res.body[0].eventName).toBe('Community Food Drive');
    });
  });

  describe('Delete Match Endpoint', () => {
    it('DELETE /match/:id should remove a volunteer-event match', async () => {
      // Mock match check
      pool.query.mockResolvedValueOnce([[{ HID: 1 }]]);
      
      // Mock delete operation
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const res = await request(app)
        .delete('/api/volunteer-matcher/match/1')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Match removed successfully');
    });

    it('DELETE /match/:id should return 404 when match is not found', async () => {
      // Mock match check - not found
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .delete('/api/volunteer-matcher/match/999')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Match not found');
    });
  });

  describe('Auth Token Endpoint', () => {
    it('POST /auth/token should return a token for admin users', async () => {
      // Mock user query
      pool.query.mockResolvedValueOnce([[{ username: 'admin', role: 'admin' }]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/auth/token')
        .send({
          username: 'admin',
          password: 'password'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('POST /auth/token should return 400 when credentials are missing', async () => {
      const res = await request(app)
        .post('/api/volunteer-matcher/auth/token')
        .send({
          username: 'admin'
          // Missing password
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Username and password are required');
    });

    it('POST /auth/token should return 401 when user is not found', async () => {
      // Mock user query - not found
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/auth/token')
        .send({
          username: 'nonexistent',
          password: 'password'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('POST /auth/token should return 403 when user is not an admin', async () => {
      // Mock user query - not admin
      pool.query.mockResolvedValueOnce([[{ username: 'user', role: 'volunteer' }]]);
      
      const res = await request(app)
        .post('/api/volunteer-matcher/auth/token')
        .send({
          username: 'user',
          password: 'password'
        });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Admin privileges required');
    });
  });
});