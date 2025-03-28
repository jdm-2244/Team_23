const request = require('supertest');
const express = require('express');
const pool = require('./config/database');

// Mock the database pool
jest.mock('./config/database', () => {
  return {
    query: jest.fn(),
    getConnection: jest.fn().mockReturnValue({
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    })
  };
});

// Import the routes
const eventManagementRoutes = require('./eventManagementRoutes');

// Setup test app
const app = express();
app.use(express.json());
app.use('/api/events', eventManagementRoutes);

// Setup admin auth app
const adminApp = express();
adminApp.use(express.json());
adminApp.use((req, res, next) => {
  req.user = { role: 'admin' };
  next();
});
adminApp.use('/api/events', eventManagementRoutes);

// Setup non-admin auth app
const userApp = express();
userApp.use(express.json());
userApp.use((req, res, next) => {
  req.user = { role: 'user' };
  next();
});
userApp.use('/api/events', eventManagementRoutes);

// Mock headers
const adminHeader = { Authorization: 'Bearer admin-token' };
const userHeader = { Authorization: 'Bearer user-token' };

describe('Event Management Routes', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Database Connection Test', () => {
    it('GET /test-connection should return success when connection works', async () => {
      pool.query.mockResolvedValueOnce([[{ test: 1 }]]);
      
      const res = await request(app).get('/api/events/test-connection');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /test-connection should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Connection failed'));
      
      const res = await request(app).get('/api/events/test-connection');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      // Mock getEventsWithDetails result
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Test Event');
      expect(res.body[0].skills).toEqual(['Organization', 'Communication']);
    });

    it('should handle future-only events', async () => {
      // Mock getEventsWithDetails result with future-only query
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Future Event',
            description: 'Future Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Future Venue',
            address: '456 Future St',
            volunteersRegistered: 0,
            volunteersConfirmed: 0,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events?future=true');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Future Event');
    });
    
    it('should handle empty result from database query', async () => {
      // Mock empty array return
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
    
    it('should handle non-array return from database query', async () => {
      // Mock invalid return type
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should handle empty string in skills field', async () => {
      // Mock event with empty skills string
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 0,
            skills: '' // Empty string
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body[0].skills).toEqual([]);
    });
    
    it('should handle null volunteersRegistered value', async () => {
      // Mock event with null volunteersRegistered
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: null, // Null value
            volunteersConfirmed: 0,
            skills: 'Communication'
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body[0].volunteersRegistered).toBe(0); // Should default to 0
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return an event when found', async () => {
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe('Test Event');
    });

    it('should return 404 when event is not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app).get('/api/events/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/events/invalid-id');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid event ID');
    });
    
    it('should handle null ID parameter', async () => {
      const res = await request(app).get('/api/events/null');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle empty ID parameter', async () => {
      const res = await request(app).get('/api/events/');
      
      // This should route to the main GET / endpoint instead
      pool.query.mockResolvedValueOnce([[]]);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    
    it('should handle event with null skills', async () => {
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event No Skills',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: null // Null skills
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.skills).toEqual([]);
    });
    
    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/events/1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event when data is valid and user is admin', async () => {
      const newEvent = {
        name: 'New Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Organization', 'Communication']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock skill queries
      connection.query.mockResolvedValueOnce([[{ skill_id: 1 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      connection.query.mockResolvedValueOnce([[{ skill_id: 2 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'New Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 0,
            volunteersConfirmed: 0,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('New Test Event');
    });
    
    it('should create an event with time property', async () => {
      const newEvent = {
        name: 'New Test Event with Time',
        location: 'Test Location',
        date: '2025-05-01',
        time: '14:00',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Organization']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock skill queries
      connection.query.mockResolvedValueOnce([[{ skill_id: 1 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'New Test Event with Time',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 0,
            volunteersConfirmed: 0,
            skills: 'Organization'
          }
        ]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.time).toBe('14:00');
    });

    it('should handle empty skills array when creating an event', async () => {
      const newEvent = {
        name: 'New Test Event No Skills',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: []
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'New Test Event No Skills',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 0,
            volunteersConfirmed: 0,
            skills: null
          }
        ]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.skills).toEqual([]);
    });

    it('should handle no skills property when creating an event', async () => {
      const newEvent = {
        name: 'New Test Event No Skills Prop',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
        // No skills property
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'New Test Event No Skills Prop',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 0,
            volunteersConfirmed: 0,
            skills: null
          }
        ]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
    });

    it('should return 401 when user is not authenticated', async () => {
      const newEvent = {
        name: 'New Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .send(newEvent);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should return 403 when user is not admin', async () => {
      const newEvent = {
        name: 'New Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(userApp)
        .post('/api/events')
        .set(userHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });

    it('should return 400 when validation fails', async () => {
      const invalidEvent = {
        // Missing required fields
        date: '2025-05-01'
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when no matching location is found', async () => {
      const newEvent = {
        name: 'New Test Event',
        location: 'Non-existent Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId - no exact match
      pool.query.mockResolvedValueOnce([[]]);
      
      // Mock findLocationId - no partial match
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('No matching location found');
    });

    it('should handle database error during transaction', async () => {
      const newEvent = {
        name: 'New Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Organization']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query with error
      connection.query.mockRejectedValueOnce(new Error('Database transaction error'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle empty location string', async () => {
      const newEvent = {
        name: 'New Test Event',
        location: '',  // Empty location
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an existing event when data is valid and user is admin', async () => {
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership', 'Communication']
      };
      
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      
      // Mock skill queries
      connection.query.mockResolvedValueOnce([[{ skill_id: 3 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      connection.query.mockResolvedValueOnce([[{ skill_id: 2 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Updated Test Event',
            description: 'Updated Description',
            date: '2025-06-01',
            volunteersNeeded: 10,
            urgency: 'Medium',
            venue: 'Updated Venue',
            address: '456 Update St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Leadership,Communication'
          }
        ]
      ]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Test Event');
      expect(res.body.volunteersNeeded).toBe(10);
    });
    
    it('should update an event with time property', async () => {
      const updatedEvent = {
        name: 'Updated Test Event with Time',
        location: 'Updated Location',
        date: '2025-06-01',
        time: '15:30',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership']
      };
      
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock skill queries
      connection.query.mockResolvedValueOnce([[{ skill_id: 3 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Updated Test Event with Time',
            description: 'Updated Description',
            date: '2025-06-01',
            volunteersNeeded: 10,
            urgency: 'Medium',
            venue: 'Updated Venue',
            address: '456 Update St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Leadership'
          }
        ]
      ]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.time).toBe('15:30');
    });
    
    it('should handle removing all skills when updating an event', async () => {
      const updatedEvent = {
        name: 'Updated Test Event No Skills',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: []  // Empty skills array
      };
      
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Updated Test Event No Skills',
            description: 'Updated Description',
            date: '2025-06-01',
            volunteersNeeded: 10,
            urgency: 'Medium',
            venue: 'Updated Venue',
            address: '456 Update St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: null
          }
        ]
      ]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.skills).toEqual([]);
    });
    
    it('should handle custom urgency when updating an event', async () => {
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        urgency: 'Critical', // Custom urgency
        skills: ['Leadership']
      };
      
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock skill queries
      connection.query.mockResolvedValueOnce([[{ skill_id: 3 }]]);
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Updated Test Event',
            description: 'Updated Description',
            date: '2025-06-01',
            volunteersNeeded: 10,
            urgency: 'Critical', // Updated urgency
            venue: 'Updated Venue',
            address: '456 Update St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Leadership'
          }
        ]
      ]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.urgency).toBe('Critical');
    });
    
    it('should handle database error when updating skills', async () => {
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership', 'Communication']
      };
      
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills with error
      connection.query.mockRejectedValueOnce(new Error('Database error when deleting skills'));
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle skill not found when updating', async () => {
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['NonexistentSkill'] // Skill that doesn't exist
      };
      
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock skill queries - skill not found
      connection.query.mockResolvedValueOnce([[]]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Updated Test Event',
            description: 'Updated Description',
            date: '2025-06-01',
            volunteersNeeded: 10,
            urgency: 'Medium',
            venue: 'Updated Venue',
            address: '456 Update St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: null // No skills found
          }
        ]
      ]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.skills).toEqual([]);
    });

    it('should return 404 when event is not found', async () => {
      // Mock getEventById (event not found)
      pool.query.mockResolvedValueOnce([[]]);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10
      };
      
      const res = await request(app)
        .put('/api/events/999')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });
    
    it('should return 400 when validation fails', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const invalidEvent = {
        // Missing required fields
        date: '2025-06-01'
      };
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
    
    it('should return 400 when no matching location is found', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Non-existent Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10
      };
      
      // Mock findLocationId - no exact match
      pool.query.mockResolvedValueOnce([[]]);
      
      // Mock findLocationId - no partial match
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('No matching location found');
    });
    
    it('should handle database error during transaction', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Original Test Event',
            description: 'Original Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership']
      };
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query with error
      connection.query.mockRejectedValueOnce(new Error('Database transaction error'));
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an existing event when user is admin', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock DELETE queries
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Event_Skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Notifications
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Volunteering_History
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Events
      
      const res = await request(app)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Event deleted successfully');
      expect(res.body.deletedEvent).toBeDefined();
      expect(connection.commit).toHaveBeenCalled();
    });

    it('should return 404 when event is not found', async () => {
      // Mock getEventById (event not found)
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .delete('/api/events/999')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/events/invalid-id')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle database error during Event_Skills deletion', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock DELETE query with error
      connection.query.mockRejectedValueOnce(new Error('Database transaction error'));
      
      const res = await request(app)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle database error during Notifications deletion', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock DELETE queries
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Event_Skills
      connection.query.mockRejectedValueOnce(new Error('Database transaction error')); // Notifications error
      
      const res = await request(app)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle database error during Volunteering_History deletion', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock DELETE queries
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Event_Skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Notifications
      connection.query.mockRejectedValueOnce(new Error('Database transaction error')); // Volunteering_History error
      
      const res = await request(app)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle database error during Events deletion', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock DELETE queries
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Event_Skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Notifications
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Volunteering_History
      connection.query.mockRejectedValueOnce(new Error('Database transaction error')); // Events error
      
      const res = await request(app)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle commit error', async () => {
      // Mock getEventById (event exists)
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock DELETE queries
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Event_Skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Notifications
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Volunteering_History
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Events
      
      // Mock commit error
      connection.commit.mockRejectedValueOnce(new Error('Commit error'));
      
      const res = await request(app)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
  });

  describe('GET /api/events/search/skills', () => {
    it('should return events matching the skills', async () => {
      // Mock search query result
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          },
          {
            id: 2,
            name: 'Another Test Event',
            description: 'Another Description',
            date: '2025-06-01',
            volunteersNeeded: 10,
            urgency: 'High',
            venue: 'Another Venue',
            address: '456 Another St',
            volunteersRegistered: 0,
            volunteersConfirmed: 0,
            skills: 'Organization,Leadership'
          }
        ]
      ]);
      
      const res = await request(app).get('/api/events/search/skills?skills=organization,leadership');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].skills).toContain('Organization');
      expect(res.body[1].skills).toContain('Leadership');
    });

    it('should return 400 when skills parameter is missing', async () => {
      const res = await request(app).get('/api/events/search/skills');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Skills parameter is required');
    });
    
    it('should handle non-array return from database query', async () => {
      // Mock invalid return type
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app).get('/api/events/search/skills?skills=organization');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/events/search/skills?skills=organization');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/events/locations', () => {
    it('should return all locations', async () => {
      // Mock locations query result
      pool.query.mockResolvedValueOnce([
        [
          { id: 1, venue: 'Test Venue', address: '123 Test St' },
          { id: 2, venue: 'Another Venue', address: '456 Another St' }
        ]
      ]);
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].venue).toBe('Test Venue');
    });
    
    it('should handle non-array return from database query', async () => {
      // Mock invalid return type
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/events/skills', () => {
    it('should return all skills', async () => {
      // Mock skills query result
      pool.query.mockResolvedValueOnce([
        [
          { id: 1, name: 'Organization', description: 'Organization skills' },
          { id: 2, name: 'Communication', description: 'Communication skills' },
          { id: 3, name: 'Leadership', description: 'Leadership skills' }
        ]
      ]);
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
      expect(res.body[0].name).toBe('Organization');
    });
    
    it('should handle non-array return from database query', async () => {
      // Mock invalid return type
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  describe('Helper Functions', () => {
    // Test findLocationId function through the API
    describe('findLocationId', () => {
      it('should find location by exact match', async () => {
        const newEvent = {
          name: 'Test Event',
          location: 'Exact Match Venue',  // Will be found exactly
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        // Exact match found
        pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
        
        // Mock rest of the create process
        const connection = pool.getConnection();
        connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
        pool.query.mockResolvedValueOnce([
          [
            {
              id: 1,
              name: 'Test Event',
              description: 'Test Description',
              date: '2025-05-01',
              volunteersNeeded: 5,
              urgency: 'Medium',
              venue: 'Exact Match Venue',
              address: '123 Test St',
              volunteersRegistered: 0,
              volunteersConfirmed: 0,
              skills: null
            }
          ]
        ]);
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(201);
      });
      
      it('should find location by partial match', async () => {
        const newEvent = {
          name: 'Test Event',
          location: 'Partial Venue',  // Will be found by partial match
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        // No exact match
        pool.query.mockResolvedValueOnce([[]]);
        
        // Partial match found
        pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
        
        // Mock rest of the create process
        const connection = pool.getConnection();
        connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
        pool.query.mockResolvedValueOnce([
          [
            {
              id: 1,
              name: 'Test Event',
              description: 'Test Description',
              date: '2025-05-01',
              volunteersNeeded: 5,
              urgency: 'Medium',
              venue: 'Partial Match Venue',
              address: '123 Test St',
              volunteersRegistered: 0,
              volunteersConfirmed: 0,
              skills: null
            }
          ]
        ]);
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(201);
      });
      
      it('should handle location with comma', async () => {
        const newEvent = {
          name: 'Test Event',
          location: 'Test Venue, 123 Test St',  // Location with comma
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        // Exact match found for 'Test Venue'
        pool.query.mockResolvedValueOnce([[{ LocID: 3 }]]);
        
        // Mock rest of the create process
        const connection = pool.getConnection();
        connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
        pool.query.mockResolvedValueOnce([
          [
            {
              id: 1,
              name: 'Test Event',
              description: 'Test Description',
              date: '2025-05-01',
              volunteersNeeded: 5,
              urgency: 'Medium',
              venue: 'Test Venue',
              address: '123 Test St',
              volunteersRegistered: 0,
              volunteersConfirmed: 0,
              skills: null
            }
          ]
        ]);
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(201);
      });
      
      it('should handle empty location string', async () => {
        const newEvent = {
          name: 'Test Event',
          location: '',  // Empty location
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(400); // Should fail validation
      });
      
      it('should handle null location', async () => {
        const newEvent = {
          name: 'Test Event',
          location: null,  // Null location
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(400); // Should fail validation
      });
      
      it('should handle database errors in exact match search', async () => {
        const newEvent = {
          name: 'Test Event',
          location: 'Error Venue',
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        // Mock database error
        pool.query.mockRejectedValueOnce(new Error('Database error'));
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBeDefined();
      });
      
      it('should handle database errors in partial match search', async () => {
        const newEvent = {
          name: 'Test Event',
          location: 'Error Venue',
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        };
        
        // No exact match
        pool.query.mockResolvedValueOnce([[]]);
        
        // Mock database error for partial match
        pool.query.mockRejectedValueOnce(new Error('Database error'));
        
        const res = await request(app)
          .post('/api/events')
          .set(adminHeader)
          .send(newEvent);
        
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBeDefined();
      });
    });
    
    // Test getEventsWithDetails and getEventById through direct API calls
    describe('getEventsWithDetails and getEventById', () => {
      it('should handle null skills field in getEventsWithDetails', async () => {
        // Mock getEventsWithDetails result with null skills
        pool.query.mockResolvedValueOnce([
          [
            {
              id: 1,
              name: 'Test Event',
              description: 'Test Description',
              date: '2025-05-01',
              volunteersNeeded: 5,
              urgency: 'Medium',
              venue: 'Test Venue',
              address: '123 Test St',
              volunteersRegistered: 2,
              volunteersConfirmed: 1,
              skills: null // Null skills
            }
          ]
        ]);
        
        const res = await request(app).get('/api/events');
        
        expect(res.statusCode).toBe(200);
        expect(res.body[0].skills).toEqual([]);
      });
      
      it('should handle string volunteersRegistered values', async () => {
        // Mock getEventsWithDetails result with string volunteersRegistered
        pool.query.mockResolvedValueOnce([
          [
            {
              id: 1,
              name: 'Test Event',
              description: 'Test Description',
              date: '2025-05-01',
              volunteersNeeded: 5,
              urgency: 'Medium',
              venue: 'Test Venue',
              address: '123 Test St',
              volunteersRegistered: '3', // String instead of number
              volunteersConfirmed: '2',  // String instead of number
              skills: 'Organization'
            }
          ]
        ]);
        
        const res = await request(app).get('/api/events');
        
        expect(res.statusCode).toBe(200);
        expect(typeof res.body[0].volunteersRegistered).toBe('number');
        expect(res.body[0].volunteersRegistered).toBe(3);
        expect(res.body[0].volunteersConfirmed).toBe(2);
      });
      
      it('should correctly format event dates', async () => {
        // Mock getEventsWithDetails result with MySQL date format
        pool.query.mockResolvedValueOnce([
          [
            {
              id: 1,
              name: 'Test Event',
              description: 'Test Description',
              date: '2025-05-01', // MySQL formatted date
              volunteersNeeded: 5,
              urgency: 'Medium',
              venue: 'Test Venue',
              address: '123 Test St',
              volunteersRegistered: 2,
              volunteersConfirmed: 1,
              skills: 'Organization'
            }
          ]
        ]);
        
        const res = await request(app).get('/api/events');
        
        expect(res.statusCode).toBe(200);
        expect(res.body[0].date).toBe('2025-05-01');
      });
    });
  });
  
  // Test authentication middleware
  describe('Authentication Middleware', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({ name: 'Test Event' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
    
    it('should return 401 when authorization header is malformed', async () => {
      const res = await request(app)
        .post('/api/events')
        .set({ Authorization: 'InvalidFormat' })
        .send({ name: 'Test Event' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
  });

  // Test verifyAdminAccess middleware
  describe('Admin Access Middleware', () => {
    it('should allow access when user has admin role', async () => {
      // Mock event exists
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-05-01',
            volunteersNeeded: 5,
            urgency: 'Medium',
            venue: 'Test Venue',
            address: '123 Test St',
            volunteersRegistered: 2,
            volunteersConfirmed: 1,
            skills: 'Organization,Communication'
          }
        ]
      ]);
      
      const res = await request(adminApp)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).not.toBe(403);
    });

    it('should deny access when user does not have admin role', async () => {
      const res = await request(userApp)
        .delete('/api/events/1')
        .set(userHeader);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });
    
    it('should deny access when user does not exist', async () => {
      const noUserApp = express();
      noUserApp.use(express.json());
      noUserApp.use((req, res, next) => {
        // req.user is undefined
        next();
      });
      noUserApp.use('/api/events', eventManagementRoutes);
      
      const res = await request(noUserApp)
        .delete('/api/events/1')
        .set(adminHeader);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });
  });
  
  describe('Event Validation', () => {
    it('should validate event name length', async () => {
      const invalidEvent = {
        name: 'a'.repeat(101),  // Too long
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Event name must be less than 100 characters');
    });
    
    it('should validate description length', async () => {
      const invalidEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'a'.repeat(201),  // Too long
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Description must be less than 200 characters');
    });
    
    it('should validate that volunteersNeeded is a number', async () => {
      const invalidEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 'not-a-number'
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Volunteers needed must be a number');
    });
    
    it('should validate date format', async () => {
      const invalidEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: 'invalid-date',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Invalid event date');
    });
  });
  describe('formatEventRows Edge Cases', () => {
    it('should directly handle null input to formatEventRows', async () => {
      // This requires exposing the function for testing
      // You may need to modify your module exports to include this function
      // For testing purposes, you could add: module.exports.formatEventRows = formatEventRows;
      
      // We can test this indirectly by ensuring the error is handled in route handlers
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
  
  // 2. Testing validateFields with custom validator (Lines 125-126)
  describe('Field Validation with Custom Validators', () => {
    it('should handle custom validator in field validation', async () => {
      // Create an event with a field that would trigger a custom validator
      // For example, we could add a custom validator to the event creation route
      // that validates the urgency field must be one of Low, Medium, High
      
      const eventWithInvalidUrgency = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        urgency: 'INVALID_URGENCY' // This should trigger validation
      };
      
      // Setup mocks as needed for the route
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(eventWithInvalidUrgency);
      
      // We need to modify the validation to include urgency validation for this test to work
      // Assuming the validation was added, we would expect:
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Urgency must be Low, Medium, or High');
    });
  });
  
  // 3. Testing findLocationId edge cases (Lines 226-227, 233, 243-244, 254-255)
  describe('findLocationId Edge Cases', () => {
    it('should handle empty string in venue name part of location', async () => {
      const newEvent = {
        name: 'Test Event',
        location: ', Some Address', // Empty venue part
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle multiple commas in location string', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Venue Name, Address Line 1, City, State, ZIP', // Multiple commas
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId to find by 'Venue Name'
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock rest of the create process
      const connection = pool.getConnection();
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Venue Name',
          address: 'Address Line 1, City, State, ZIP',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
    });
  });
  
  // 4. Testing GET /skills edge cases (Lines 339-340, 350-351, 380-381)
  describe('GET /skills Edge Cases', () => {
    it('should handle empty array return from database query', async () => {
      // Mock empty array return
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
    
    it('should handle undefined return from database query', async () => {
      // Mock undefined return
      pool.query.mockResolvedValueOnce([undefined]);
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 5. Testing POST / edge cases (Lines 413-479)
  describe('POST / Additional Edge Cases', () => {
    it('should handle invalid date format', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: 'invalid-date-format', // Invalid date
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Invalid event date');
    });
    
    it('should handle skill not found during event creation', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['NonexistentSkill'] // Skill that doesn't exist
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock skill query - skill not found
      connection.query.mockResolvedValueOnce([[]]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.skills).toEqual([]);
    });
    
    it('should handle error during commit', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock commit failure
      connection.commit.mockRejectedValueOnce(new Error('Commit failed'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(connection.rollback).toHaveBeenCalled();
    });
  });
  
  // 6. Testing PUT /:id edge cases (Lines 520-591)
  describe('PUT /:id Additional Edge Cases', () => {
    it('should handle non-array skills during update', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Original Test Event',
          description: 'Original Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: "This should be an array but it's a string" // Non-array skills
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Updated Test Event',
          description: 'Updated Description',
          date: '2025-06-01',
          volunteersNeeded: 10,
          urgency: 'Medium',
          venue: 'Updated Venue',
          address: '456 Update St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication' // Original skills unchanged
        }]
      ]);
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(200);
      // Skills should remain unchanged as the input wasn't an array
      expect(Array.isArray(res.body.skills)).toBe(true);
    });
    
    it('should handle error in getEventById during update', async () => {
      // Mock getEventById error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10
      };
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 7. Testing search/skills edge cases (Lines 617-644)
  describe('GET /search/skills Additional Edge Cases', () => {
    it('should handle empty skills parameter', async () => {
      const res = await request(app).get('/api/events/search/skills?skills=');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle skills with whitespace', async () => {
      // Mock search query with whitespace in skills
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Skills with extra whitespace
      const res = await request(app).get('/api/events/search/skills?skills=  Organization  ,  Communication  ');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
    
    it('should handle database error during skills search', async () => {
      // Mock database error during query execution
      pool.query.mockImplementationOnce(() => {
        throw new Error('Database error during skills search');
      });
      
      const res = await request(app).get('/api/events/search/skills?skills=Organization');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 8. Testing transaction rollback scenarios
  describe('Transaction Rollback Scenarios', () => {
    it('should handle transaction begin error', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods with beginTransaction error
      const connection = pool.getConnection();
      connection.beginTransaction.mockRejectedValueOnce(new Error('Begin transaction failed'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle rollback error', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock query with error to trigger rollback
      connection.query.mockRejectedValueOnce(new Error('Query failed'));
      
      // Mock rollback with error
      connection.rollback.mockRejectedValueOnce(new Error('Rollback failed'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  describe('Authentication Middleware Edge Cases', () => {
    it('should handle malformed authorization header', async () => {
      const res = await request(app)
        .post('/api/events')
        .set({ 'Authorization': 'malformed-format' }) // Not Bearer format
        .send({
          name: 'Test Event',
          location: 'Test Location',
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
    
    it('should handle empty authorization header', async () => {
      const res = await request(app)
        .post('/api/events')
        .set({ 'Authorization': '' }) // Empty header
        .send({
          name: 'Test Event',
          location: 'Test Location',
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
  });
  
  // 2. Testing getEventsWithDetails error handling (Lines 85-86)
  describe('getEventsWithDetails Error Handling', () => {
    it('should handle database error when fetching events', async () => {
      // Simulate a database error during query execution
      pool.query.mockImplementationOnce(() => {
        throw new Error('Database connection lost');
      });
      
      const res = await request(app).get('/api/events');
      
      // The function should handle the error and return an empty array
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 3. Testing validateFields with different types (Lines 135-136) 
  describe('Field Validation for Different Data Types', () => {
    it('should validate number fields correctly', async () => {
      const invalidEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 'five' // Should be a number
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Number of volunteers needed must be a number');
    });
    
    it('should handle event with extra fields', async () => {
      const eventWithExtraFields = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        extraField1: 'This is extra',
        extraField2: 'Another extra field',
        notUsed: true
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(eventWithExtraFields);
      
      // Should still work as the extra fields are ignored
      expect(res.statusCode).toBe(201);
      expect(res.body.extraField1).toBeUndefined();
    });
  });
  
  // 4. Testing the validateEvent function (Lines 166-175)
  describe('Event Validation Edge Cases', () => {
    it('should validate event with missing fields', async () => {
      // Create an object with all required fields missing
      const incompleteEvent = {};
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(incompleteEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Event name is required');
      expect(res.body.errors).toContain('Location is required');
      expect(res.body.errors).toContain('Date is required');
      expect(res.body.errors).toContain('Description is required');
      expect(res.body.errors).toContain('Number of volunteers needed is required');
    });
    
    it('should validate maximum field lengths', async () => {
      const eventWithLongFields = {
        name: 'a'.repeat(101), // Too long (max 100)
        location: 'Test Location',
        date: '2025-05-01',
        description: 'a'.repeat(201), // Too long (max 200)
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(eventWithLongFields);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Event name must be less than 100 characters');
      expect(res.body.errors).toContain('Description must be less than 200 characters');
    });
  });
  
  // 5. Testing findLocationId error handling (Lines 221-223)
  describe('findLocationId Error Handling', () => {
    it('should handle SQL error in partial matching', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Error Location', // Will trigger error
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock exact match query to return empty array
      pool.query.mockResolvedValueOnce([[]]);
      
      // Mock partial match query to throw error
      pool.query.mockImplementationOnce(() => {
        throw new Error('SQL syntax error in LIKE query');
      });
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 6. Testing GET /locations error handling (Lines 275-276)
  describe('GET /locations Error Handling', () => {
    it('should handle invalid response format from database', async () => {
      // Mock non-array response
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle database error during locations fetch', async () => {
      // Simulate a database error during query execution
      pool.query.mockImplementationOnce(() => {
        throw new Error('Database error during locations fetch');
      });
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 7. Testing GET /skills error handling (Lines 303-304)
  describe('GET /skills Error Handling', () => {
    it('should handle database error during skills fetch', async () => {
      // Simulate a database error during query execution
      pool.query.mockImplementationOnce(() => {
        throw new Error('Database error during skills fetch');
      });
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 8. Testing main GET route error handling (Lines 408-409)
  describe('Main GET Route Error Handling', () => {
    it('should handle uncaught exceptions in getEventsWithDetails', async () => {
      // We'll need to mock getEventsWithDetails to throw an error
      // This is tricky as it's an internal function
      // So we'll mock the pool.query that it uses
      pool.query.mockImplementationOnce(() => {
        throw new Error('Unexpected error in getEventsWithDetails');
      });
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 9. Testing GET by ID route error handling (Lines 438-439)
  describe('GET /:id Error Handling', () => {
    it('should handle uncaught exceptions in getEventById', async () => {
      // Mock error in getEventById
      pool.query.mockImplementationOnce(() => {
        throw new Error('Unexpected error in getEventById');
      });
      
      const res = await request(app).get('/api/events/1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 10. Testing POST route edge cases (Lines 476-525)
  describe('POST Route Edge Cases', () => {
    it('should handle floating point volunteersNeeded', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5.5 // Floating point
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5, // Should be converted to integer
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.volunteersNeeded).toBe(5); // Should be converted to integer
    });
    
    it('should handle custom urgency values', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        urgency: 'Critical' // Custom urgency
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Critical', // Custom urgency preserved
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.urgency).toBe('Critical');
    });
  });
  
  // 11. Testing PUT route edge cases (Lines 569-631)
  describe('PUT Route Edge Cases', () => {
    it('should handle invalid ID parameter', async () => {
      const res = await request(app)
        .put('/api/events/invalid-id')
        .set(adminHeader)
        .send({
          name: 'Updated Event',
          location: 'Updated Location',
          date: '2025-06-01',
          description: 'Updated Description',
          volunteersNeeded: 10
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle not found event during update', async () => {
      // Mock getEventById to return null (not found)
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .put('/api/events/999')
        .set(adminHeader)
        .send({
          name: 'Updated Event',
          location: 'Updated Location',
          date: '2025-06-01',
          description: 'Updated Description',
          volunteersNeeded: 10
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });
  });
  
  // 12. Testing search/skills route edge cases (Lines 658-671)
  describe('Search Skills Route Edge Cases', () => {
    it('should handle multiple skills in search', async () => {
      // Mock search query with multiple skills
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication,Leadership'
        }]
      ]);
      
      const res = await request(app).get('/api/events/search/skills?skills=Organization,Leadership');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].skills).toContain('Organization');
      expect(res.body[0].skills).toContain('Leadership');
    });
    
    it('should handle case-insensitive skills search', async () => {
      // Mock search query with case-insensitive skills
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Skills with different case
      const res = await request(app).get('/api/events/search/skills?skills=organization,COMMUNICATION');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });
  describe('authenticateToken Direct Tests', () => {
    it('should handle undefined authorization header', async () => {
      // Create a request with undefined authorization header (not just empty)
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', undefined)
        .send({
          name: 'Test Event',
          location: 'Test Location',
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
    
    // Create a custom Express app that breaks the authenticateToken middleware
    // This is to test the specific error handling in the middleware
    it('should handle token extraction errors', async () => {
      // Create a custom express app where the auth header is problematic
      const customApp = express();
      customApp.use(express.json());
      customApp.use((req, res, next) => {
        // Create a situation where the authorization header throws when accessed
        Object.defineProperty(req.headers, 'authorization', {
          get: function() { throw new Error('Header access error'); }
        });
        next();
      });
      customApp.use('/api/events', eventManagementRoutes);
      
      const res = await request(customApp)
        .post('/api/events')
        .send({
          name: 'Test Event',
          location: 'Test Location',
          date: '2025-05-01',
          description: 'Test Description',
          volunteersNeeded: 5
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
  
  // 2. Direct test for getEventsWithDetails error handling (Lines 85-86)
  describe('getEventsWithDetails Direct Error Tests', () => {
    it('should handle array existence check in getEventsWithDetails', async () => {
      // We need to mock the pool.query to return something that's not an array
      // but still get past previous checks - this is tricky but possible
      pool.query.mockResolvedValueOnce([undefined]);
      
      const res = await request(app).get('/api/events');
      
      // Function should return empty array when rows is not an array
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
    
    it('should handle unexpected query result structure', async () => {
      // Return an unexpected data structure from the database query
      pool.query.mockResolvedValueOnce("not-an-array-or-object");
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 3. Direct test for validateFields with type checks (Lines 135-136)
  describe('validateFields Type Validation', () => {
    it('should validate date fields properly', async () => {
      const invalidEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: {}, // Invalid date format (an object instead of string)
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain('Invalid event date');
    });
    
    it('should run custom validators for fields', async () => {
      // For this test, ideally we would need to modify validateEvent to include 
      // a custom validator for one of the fields. If we can't modify the code,
      // we need to be creative and try to trigger any existing custom validators.
      
      // Let's try with an urgency value that might have validation
      const eventWithInvalidUrgency = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        urgency: {} // Invalid urgency (object instead of string)
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(eventWithInvalidUrgency);
      
      // Check for validation errors related to urgency
      expect(res.statusCode).toBe(400);
    });
  });
  
  // 4. Direct test for validateEvent function (Lines 166-175)
  describe('validateEvent Direct Tests', () => {
    it('should validate all fields in one request', async () => {
      const invalidEvent = {
        // All fields invalid or missing
        name: 'a'.repeat(101), // Too long
        // location missing
        date: 'not-a-date',
        description: 'a'.repeat(201), // Too long
        volunteersNeeded: 'five'
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(invalidEvent);
      
      expect(res.statusCode).toBe(400);
      // Should have multiple validation errors
      expect(res.body.errors.length).toBeGreaterThan(2);
    });
  });
  
  // 5. Direct test for findLocationId error handling (Lines 221-223)
  describe('findLocationId Direct Error Tests', () => {
    it('should handle null response from exact match query', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Null Match Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock exact match query to return null (not just empty array)
      pool.query.mockResolvedValueOnce([null]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle unusual errors during location search', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Unusual Error Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock a weird error that's not a standard Error object
      pool.query.mockImplementationOnce(() => {
        const err = { message: "Not a standard error", weird: true };
        throw err;
      });
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 6. Direct tests for GET routes with unusual database responses (Lines 275-276, 303-304)
  describe('GET Routes with Unusual Database Responses', () => {
    it('should handle boolean instead of array in locations response', async () => {
      // Mock a boolean instead of array
      pool.query.mockResolvedValueOnce([true]);
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle empty response in skills query', async () => {
      // Mock an empty response (not even an empty array)
      pool.query.mockResolvedValueOnce([]);
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 7. Tests for main GET routes with direct error triggering (Lines 408-409, 438-439)
  describe('Main GET Routes with Direct Error Triggering', () => {
    it('should handle getEventsWithDetails throwing string error', async () => {
      // Mock throwing a string instead of Error object
      pool.query.mockImplementationOnce(() => {
        throw "String error instead of Error object";
      });
      
      const res = await request(app).get('/api/events');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle getEventById with non-numeric ID', async () => {
      // Use a strange non-numeric ID that still passes parseInt
      const res = await request(app).get('/api/events/123abc');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid event ID');
    });
  });
  
  // 8. POST route specific edge cases (Lines 476-525)
  describe('POST Route Specific Edge Cases', () => {
    it('should handle error in the final getEventById step', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById to fail in final step
      pool.query.mockRejectedValueOnce(new Error('Error in final getEventById'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle skill query errors when inserting skills', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Skill1', 'Skill2']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock first skill lookup to succeed
      connection.query.mockResolvedValueOnce([[{ skill_id: 1 }]]);
      
      // Mock first skill insert to succeed
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock second skill lookup to fail
      connection.query.mockRejectedValueOnce(new Error('Skill lookup error'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle errors in executeTransaction setup', async () => {
      // This test requires mocking at a lower level to reach specific lines
      // Mock pool.getConnection to fail
      pool.getConnection.mockImplementationOnce(() => {
        throw new Error('Connection pool error');
      });
      
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId to succeed
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // 9. PUT route specific edge cases (Lines 569-631)
  describe('PUT Route Specific Edge Cases', () => {
    it('should handle complex transaction failure during update', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Original Test Event',
          description: 'Original Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership', 'Communication']
      };
      
      // Mock connection.beginTransaction to fail
      const connection = pool.getConnection();
      connection.beginTransaction.mockRejectedValueOnce(new Error('Transaction begin failed'));
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle skill query errors during update', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Original Test Event',
          description: 'Original Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query success
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      
      // Mock first skill lookup
      connection.query.mockRejectedValueOnce(new Error('Skill lookup failed'));
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership', 'Communication']
      };
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
  });
  
  // 10. Search/skills route specific edge cases (Lines 658-671)
  describe('Search/skills Route Specific Edge Cases', () => {
    it('should handle database error in the skills search query', async () => {
      // Mock complex database error in skills search
      pool.query.mockImplementationOnce(() => {
        const err = new Error('Complex error in skills search');
        err.code = 'ER_COMPLEX_ERROR'; // SQL error code
        err.sqlMessage = 'Some SQL error message';
        throw err;
      });
      
      const res = await request(app).get('/api/events/search/skills?skills=Organization');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle edge case with empty skills array', async () => {
      // This is a bit tricky as the route requires skills parameter
      // But we can try with an empty array after splitting
      const res = await request(app).get('/api/events/search/skills?skills=,,');
      
      // Should still work with empty skills array but might return no results
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
  
  // Additional creative tests for hard-to-reach branches
  describe('Hard-to-Reach Branch Tests', () => {
    it('should handle connection that fails both commit and rollback', async () => {
      const newEvent = {
        name: 'Fail Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock transaction to fail
      connection.query.mockRejectedValueOnce(new Error('Transaction failed'));
      
      // Mock both commit and rollback to fail
      connection.rollback.mockRejectedValueOnce(new Error('Rollback failed'));
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle executeTransaction with connection release error', async () => {
      const newEvent = {
        name: 'Release Error Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query to succeed
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock release to fail after successful transaction
      connection.release.mockImplementationOnce(() => {
        throw new Error('Connection release failed');
      });
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      // Should still succeed as release error doesn't affect transaction success
      expect(res.statusCode).toBe(201);
    });
  });
  describe('formatEventRows Direct Line Tests', () => {
    it('should handle object that breaks Array.isArray check', async () => {
      // Create an object that passes initial checks but fails Array.isArray in formatEventRows
      const fakeRows = {
        length: 1,
        map: () => { throw new Error('This should not be called'); },
        // This object will pass typeof check but fail Array.isArray
        0: {
          id: 1,
          name: 'Test Event'
        }
      };
      
      // Mock the query to return our specially crafted object
      pool.query.mockResolvedValueOnce([fakeRows]);
      
      const res = await request(app).get('/api/events');
      
      // Should handle this gracefully
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
  
  // For Lines 226-227, 254-255 in findLocationId
  describe('findLocationId Specific Error Tests', () => {
    it('should handle empty string venue in location with comma', async () => {
      const newEvent = {
        name: 'Test Event',
        location: ', Some Address', // Venue part is empty string
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Since the venue part is empty, make sure both queries are tested
      pool.query.mockResolvedValueOnce([[]]);  // No exact match
      pool.query.mockResolvedValueOnce([[]]);  // No partial match
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle findLocationId returning null for partial match', async () => {
      // Mock the verifyAdminAccess middleware to let us test directly
      jest.mock('./eventManagementRoutes', () => {
        const originalModule = jest.requireActual('./eventManagementRoutes');
        
        // Expose findLocationId for direct testing
        return {
          ...originalModule,
          __findLocationId: findLocationId // Make sure this function is exported for testing
        };
      });
      
      // Directly test findLocationId if possible
      // If function is not exported, test through an API endpoint
      const newEvent = {
        name: 'Test Event',
        location: 'Non-existent Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      // Exact match query returns empty array
      pool.query.mockResolvedValueOnce([[]]);
      
      // Partial match query returns non-array
      pool.query.mockResolvedValueOnce(null);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // For Lines 339-340, 350-351, 380-381 in GET /locations and GET /skills
  describe('GET Routes Database Response Edge Cases', () => {
    it('should handle malformed data from locations query', async () => {
      // Mock database returning something that looks like an array but isn't
      pool.query.mockResolvedValueOnce([[undefined, null, false]]);
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3); // Should have 3 items, though they may be empty
    });
    
    it('should handle locations query database error with specific error code', async () => {
      // Mock a very specific database error with SQL error code
      const dbError = new Error('Table not found');
      dbError.code = 'ER_NO_SUCH_TABLE';
      pool.query.mockRejectedValueOnce(dbError);
      
      const res = await request(app).get('/api/events/locations');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle skills query returning strange data', async () => {
      // Mock database returning something that's an array but with non-object elements
      pool.query.mockResolvedValueOnce([[1, 'string', true]]);
      
      const res = await request(app).get('/api/events/skills');
      
      expect(res.statusCode).toBe(200);
      // Should have attempted to process the strange data
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  
  // For Lines 419-475 in POST /
  describe('POST Route Complex Transaction Tests', () => {
    it('should handle transaction context loss', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Skill1']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success but with unusual result structure
      connection.query.mockResolvedValueOnce([{}]); // No insertId property
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle complex skills insertion errors', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Skill1', 'Skill2', 'Skill3']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // First skill find succeeds but returns empty array
      connection.query.mockResolvedValueOnce([[]]);
      
      // Second skill find succeeds
      connection.query.mockResolvedValueOnce([[{ skill_id: 2 }]]);
      
      // Second skill insert succeeds
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Third skill find fails with specific error
      const skillError = new Error('Deadlock found when trying to get lock');
      skillError.code = 'ER_LOCK_DEADLOCK';
      connection.query.mockRejectedValueOnce(skillError);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle getEventById failure after successful skill insertion', async () => {
      const newEvent = {
        name: 'Test Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: ['Skill1']
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Skill find succeeds
      connection.query.mockResolvedValueOnce([[{ skill_id: 1 }]]);
      
      // Skill insert succeeds
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock getEventById failure at the final step
      pool.query.mockImplementationOnce(() => {
        const error = new Error('Connection terminated unexpectedly');
        error.fatal = true;
        throw error;
      });
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // For Lines 520-591 in PUT /:id
  describe('PUT Route Complex Transaction Tests', () => {
    it('should handle locationId null during update', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Original Test Event',
          description: 'Original Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Mock findLocationId to return null
      pool.query.mockResolvedValueOnce([[]]);  // No exact match
      pool.query.mockResolvedValueOnce([[]]);  // No partial match
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Non-existent Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership']
      };
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('No matching location found');
    });
    
    it('should handle DELETE skills failing with foreign key constraint error', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Original Test Event',
          description: 'Original Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query success
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills with constraint error
      const constraintError = new Error('Cannot delete or update a parent row: a foreign key constraint fails');
      constraintError.code = 'ER_ROW_IS_REFERENCED';
      connection.query.mockRejectedValueOnce(constraintError);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: ['Leadership']
      };
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(connection.rollback).toHaveBeenCalled();
    });
    
    it('should handle getEventById returning empty result after successful update', async () => {
      // Mock getEventById (event exists check)
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Original Test Event',
          description: 'Original Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 2,
          volunteersConfirmed: 1,
          skills: 'Organization,Communication'
        }]
      ]);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 2 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock UPDATE query success
      connection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock DELETE existing skills
      connection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      
      // Mock getEventById to return empty result after update
      pool.query.mockResolvedValueOnce([[]]);
      
      const updatedEvent = {
        name: 'Updated Test Event',
        location: 'Updated Location',
        date: '2025-06-01',
        description: 'Updated Description',
        volunteersNeeded: 10,
        skills: []
      };
      
      const res = await request(app)
        .put('/api/events/1')
        .set(adminHeader)
        .send(updatedEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // For Lines 617-644 in GET /search/skills
  describe('Search Skills Route Edge Cases', () => {
    it('should handle skills search query with invalid SQL syntax', async () => {
      // Force the SQL query to have invalid syntax
      pool.query.mockImplementationOnce(() => {
        const syntaxError = new Error('You have an error in your SQL syntax');
        syntaxError.code = 'ER_PARSE_ERROR';
        throw syntaxError;
      });
      
      const res = await request(app).get('/api/events/search/skills?skills=Organization');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle skills search with extremely long skill names', async () => {
      // Create a very long skill name that might cause SQL issues
      const longSkill = 'a'.repeat(1000);
      
      pool.query.mockImplementationOnce(() => {
        const dataError = new Error('Data too long for column');
        dataError.code = 'ER_DATA_TOO_LONG';
        throw dataError;
      });
      
      const res = await request(app).get(`/api/events/search/skills?skills=${longSkill}`);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should handle empty result in skills search without error', async () => {
      // Mock an empty array result for the skills search
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app).get('/api/events/search/skills?skills=NonexistentSkill');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
  
  // Extreme mock manipulations to reach difficult lines
  describe('Extreme Mock Manipulations', () => {
    it('should test executeTransaction with complex error scenarios', async () => {
      // This tries to target the error handling in the executeTransaction function
      
      // Create a custom connection object with specific behavior
      const customConnection = {
        beginTransaction: jest.fn().mockResolvedValue(true),
        query: jest.fn().mockImplementation(() => {
          // This simulates a connection that works for a while then fails
          customConnection.query.mock.calls.length > 1 
            ? Promise.reject(new Error('Connection lost')) 
            : Promise.resolve([{ insertId: 1 }]);
        }),
        commit: jest.fn().mockRejectedValue(new Error('Commit failed')),
        rollback: jest.fn().mockRejectedValue(new Error('Rollback also failed')),
        release: jest.fn().mockImplementation(() => {
          throw new Error('Release failed');
        })
      };
      
      // Replace the normal connection with our custom one
      pool.getConnection.mockReturnValueOnce(customConnection);
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      const newEvent = {
        name: 'Complex Error Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: 5
      };
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(newEvent);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
    
    it('should test formatEventRows with deeply nested error conditions', async () => {
      // Create a pathological data structure that passes initial checks but fails later
      const pathologicalData = [
        {
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          // Define properties that throw errors when accessed
          get skills() { throw new Error('Skills access error'); },
          get volunteersRegistered() { throw new Error('volunteersRegistered access error'); }
        }
      ];
      
      // Mock the query to return our pathological data
      pool.query.mockResolvedValueOnce([pathologicalData]);
      
      const res = await request(app).get('/api/events');
      
      // Should handle this gracefully
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
  
  // Tests that use JavaScript behavior to reach specific code paths
  describe('JavaScript Behavior Edge Cases', () => {
    it('should handle NaN values in event ID parameter', async () => {
      // Use ID that passes parseInt but becomes NaN
      const res = await request(app).get('/api/events/NaN');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid event ID');
    });
    
    it('should handle Infinity values in volunteersNeeded field', async () => {
      const infinityEvent = {
        name: 'Infinity Event',
        location: 'Test Location',
        date: '2025-05-01',
        description: 'Test Description',
        volunteersNeeded: Infinity // JavaScript Infinity value
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(infinityEvent);
      
      // Should validate this field
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
    
    it('should handle Symbol values in skills array', async () => {
      // Create an event with a Symbol in skills array (will be serialized to undefined)
      const symbolEvent = {
        name: 'Symbol Event',
        location: 'Test Location',
        date: '2025-05-01', 
        description: 'Test Description',
        volunteersNeeded: 5,
        skills: [Symbol('test')] // Will become undefined when stringified
      };
      
      // Mock findLocationId
      pool.query.mockResolvedValueOnce([[{ LocID: 1 }]]);
      
      // Mock connection methods
      const connection = pool.getConnection();
      
      // Mock INSERT query success
      connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
      
      // Mock getEventById for final response
      pool.query.mockResolvedValueOnce([
        [{
          id: 1,
          name: 'Symbol Event',
          description: 'Test Description',
          date: '2025-05-01',
          volunteersNeeded: 5,
          urgency: 'Medium',
          venue: 'Test Venue',
          address: '123 Test St',
          volunteersRegistered: 0,
          volunteersConfirmed: 0,
          skills: null
        }]
      ]);
      
      const res = await request(app)
        .post('/api/events')
        .set(adminHeader)
        .send(symbolEvent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.skills).toEqual([]);
    });
  });
});