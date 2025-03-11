const request = require('supertest');
const express = require('express');

// Fixed the import name to match the correct file name
jest.mock('./volunteersMatchData', () => {
  // Use the actual data structure from volunteersMatchData.js
  return [
    {
      id: 1,
      username: "jdoe",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone_number: "(555) 123-4567",
      location: "New York, NY",
      role: "General Volunteer",
      skills: ["teaching", "organizing", "first aid"],
      availability: ["weekends", "evenings"],
      active: true
    },
    {
      id: 2,
      username: "jsmith",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone_number: "(555) 987-6543",
      location: "Los Angeles, CA",
      role: "Team Leader",
      skills: ["leadership", "communication", "event planning"],
      availability: ["weekdays", "afternoons"],
      active: true
    },
    {
      id: 3,
      username: "mjohnson",
      first_name: "Michael",
      last_name: "Johnson",
      email: "michael.j@example.com",
      phone_number: "(555) 345-6789",
      location: "Chicago, IL",
      role: "Technical Support",
      skills: ["IT", "audio/visual", "photography"],
      availability: ["weekends"],
      active: true
    }
  ];
});

// Mock the volunteerHistoryData module
jest.mock('./volunteerHistoryData', () => {
  return [
    {
      id: 1,
      volunteerName: "John Doe",
      eventName: "Community Food Drive",
      eventDate: "2025-02-15",
      status: "Checked In",
      hoursServed: 4,
      description: "Help collect and distribute food packages",
      maxVolunteers: 20
    },
    {
      id: 2,
      volunteerName: "Jane Smith",
      eventName: "Tech Workshop for Seniors",
      eventDate: "2025-02-20",
      status: "Pending",
      hoursServed: 0,
      description: "Teach basic computer skills",
      maxVolunteers: 15
    },
    {
      id: 3,
      volunteerName: "Michael Johnson",
      eventName: "Community Food Drive",
      eventDate: "2025-02-15",
      status: "Completed",
      hoursServed: 5,
      description: "Help collect and distribute food packages",
      maxVolunteers: 20
    }
  ];
});

// Import the routes AFTER mocking the dependencies
const volunteerMatchRoutes = require('./VolunteerMatchRoutes');

const app = express();
app.use(express.json());
app.use('/pages/match-volunteers', volunteerMatchRoutes);

// Mock authorization headers
const adminAuthHeader = { Authorization: 'Bearer test-admin-token' };
const userAuthHeader = { Authorization: 'Bearer test-user-token' };

// Create test app for error testing
const testApp = express();
testApp.use(express.json());
testApp.use((req, res, next) => {
  // Create a spy on res.json to simulate errors
  const originalJson = res.json;
  res.json = function(...args) {
    if (req.query.triggerError === 'true') {
      throw new Error('Simulated server error');
    }
    return originalJson.apply(this, args);
  };
  next();
});
testApp.use('/pages/match-volunteers', volunteerMatchRoutes);

// Create test app for non-admin testing
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
nonAdminApp.use('/pages/match-volunteers', volunteerMatchRoutes);

describe('Volunteer Match Routes', () => {
  // Test volunteer search functionality
  describe('Volunteer Search', () => {
    it('GET /volunteers/search should find a volunteer by username when user is admin', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=username&term=jdoe')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('jdoe');
      expect(res.body.first_name).toBe('John');
    });

    it('GET /volunteers/search should return 401 when user is not authenticated', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=username&term=jdoe');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('GET /volunteers/search should return 403 when user is not admin', async () => {
      const res = await request(nonAdminApp)
        .get('/pages/match-volunteers/volunteers/search?type=username&term=jdoe')
        .set(userAuthHeader);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });

    it('GET /volunteers/search should return 400 when search parameters are missing', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Search type and term are required');
    });

    it('GET /volunteers/search should find a volunteer by email', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=email&term=john.doe@example.com')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('jdoe');
    });

    it('GET /volunteers/search should find a volunteer by phone', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=phone&term=(555) 123-4567')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('jdoe');
    });

    it('GET /volunteers/search should find a volunteer by name (partial match)', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=name&term=john')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('jdoe');
    });

    it('GET /volunteers/search should return 400 for invalid search type', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=invalid&term=test')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid search type');
    });

    it('GET /volunteers/search should return 404 when volunteer is not found', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/search?type=username&term=nonexistent')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Volunteer not found');
    });

    it('GET /volunteers/search should handle server errors', async () => {
      const res = await request(testApp)
        .get('/pages/match-volunteers/volunteers/search?type=username&term=jdoe&triggerError=true')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toContain('Server error');
    });
  });

  // Test volunteer history functionality
  describe('Volunteer History', () => {
    it('GET /volunteers/:username/history should return volunteer history when user is admin', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/jdoe/history')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /volunteers/:username/history should return 401 when user is not authenticated', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/jdoe/history');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('GET /volunteers/:username/history should return 403 when user is not admin', async () => {
      const res = await request(nonAdminApp)
        .get('/pages/match-volunteers/volunteers/jdoe/history')
        .set(userAuthHeader);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });

    it('GET /volunteers/:username/history should return 404 when volunteer is not found', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/volunteers/nonexistent/history')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Volunteer not found');
    });

    it('GET /volunteers/:username/history should handle server errors', async () => {
      const res = await request(testApp)
        .get('/pages/match-volunteers/volunteers/jdoe/history?triggerError=true')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toContain('Server error');
    });
  });

  // Test events listing functionality
  describe('Events Listing', () => {
    it('GET /events should return events list when user is admin', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/events')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /events should return 401 when user is not authenticated', async () => {
      const res = await request(app)
        .get('/pages/match-volunteers/events');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('GET /events should return 403 when user is not admin', async () => {
      const res = await request(nonAdminApp)
        .get('/pages/match-volunteers/events')
        .set(userAuthHeader);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });

    it('GET /events should handle server errors', async () => {
      const res = await request(testApp)
        .get('/pages/match-volunteers/events?triggerError=true')
        .set(adminAuthHeader);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toContain('Server error');
    });
  });

  // Test volunteer matching functionality
  describe('Volunteer Matching', () => {
    it('POST /match should match a volunteer to an event when user is admin', async () => {
      const matchData = {
        username: "jdoe",
        eventName: "Tech Workshop for Seniors"
      };
      
      const res = await request(app)
        .post('/pages/match-volunteers/match')
        .set(adminAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.volunteerName).toBe('John Doe');
      expect(res.body.eventName).toBe('Tech Workshop for Seniors');
    });

    it('POST /match should return 401 when user is not authenticated', async () => {
      const matchData = {
        username: "jdoe",
        eventName: "Tech Workshop for Seniors"
      };
      
      const res = await request(app)
        .post('/pages/match-volunteers/match')
        .send(matchData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('POST /match should return 403 when user is not admin', async () => {
      const matchData = {
        username: "jdoe",
        eventName: "Tech Workshop for Seniors"
      };
      
      const res = await request(nonAdminApp)
        .post('/pages/match-volunteers/match')
        .set(userAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });

    it('POST /match should return 400 when required fields are missing', async () => {
      const matchData = {
        username: "jdoe"
        // Missing eventName
      };
      
      const res = await request(app)
        .post('/pages/match-volunteers/match')
        .set(adminAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Username and event name are required');
    });

    it('POST /match should return 404 when volunteer is not found', async () => {
      const matchData = {
        username: "nonexistent",
        eventName: "Community Food Drive"
      };
      
      const res = await request(app)
        .post('/pages/match-volunteers/match')
        .set(adminAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Volunteer not found');
    });

    it('POST /match should return 404 when event is not found', async () => {
      const matchData = {
        username: "jdoe",
        eventName: "Nonexistent Event"
      };
      
      const res = await request(app)
        .post('/pages/match-volunteers/match')
        .set(adminAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });

    it('POST /match should return 400 when volunteer is already matched to the event', async () => {
      // First match attempt
      const matchData = {
        username: "jdoe",
        eventName: "Community Food Drive"
      };
      
      // First try to match
      await request(app)
        .post('/pages/match-volunteers/match')
        .set(adminAuthHeader)
        .send(matchData);
      
      // Second attempt should fail
      const res = await request(app)
        .post('/pages/match-volunteers/match')
        .set(adminAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Volunteer is already matched to this event');
    });

    it('POST /match should handle server errors', async () => {
      const matchData = {
        username: "jdoe",
        eventName: "Community Food Drive"
      };
      
      const res = await request(testApp)
        .post('/pages/match-volunteers/match?triggerError=true')
        .set(adminAuthHeader)
        .send(matchData);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toContain('Server error');
    });
  });

  // Test status update functionality
  describe('Status Updates', () => {
    it('PUT /status/:id should update volunteer status when user is admin', async () => {
      const updateData = {
        status: "Checked In",
        hoursServed: 4
      };
      
      const res = await request(app)
        .put('/pages/match-volunteers/status/1')
        .set(adminAuthHeader)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Checked In');
      expect(res.body.hoursServed).toBe(4);
    });

    it('PUT /status/:id should return 401 when user is not authenticated', async () => {
      const updateData = {
        status: "Checked In"
      };
      
      const res = await request(app)
        .put('/pages/match-volunteers/status/1')
        .send(updateData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('PUT /status/:id should return 403 when user is not admin', async () => {
      const updateData = {
        status: "Checked In"
      };
      
      const res = await request(nonAdminApp)
        .put('/pages/match-volunteers/status/1')
        .set(userAuthHeader)
        .send(updateData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Admin privileges required');
    });

    it('PUT /status/:id should return 400 when status is missing', async () => {
      const updateData = {
        hoursServed: 4
        // Missing status
      };
      
      const res = await request(app)
        .put('/pages/match-volunteers/status/1')
        .set(adminAuthHeader)
        .send(updateData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Status is required');
    });

    it('PUT /status/:id should return 404 when record is not found', async () => {
      const updateData = {
        status: "Checked In"
      };
      
      const res = await request(app)
        .put('/pages/match-volunteers/status/999')
        .set(adminAuthHeader)
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Record not found');
    });

    it('PUT /status/:id should handle server errors', async () => {
      const updateData = {
        status: "Checked In"
      };
      
      const res = await request(testApp)
        .put('/pages/match-volunteers/status/1?triggerError=true')
        .set(adminAuthHeader)
        .send(updateData);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toContain('Server error');
    });

    it('PUT /status/:id should update status without changing hours if not provided', async () => {
      // First set initial values
      await request(app)
        .put('/pages/match-volunteers/status/1')
        .set(adminAuthHeader)
        .send({
          status: "Pending",
          hoursServed: 2
        });
      
      // Then update only status
      const updateData = {
        status: "Checked In"
        // No hoursServed
      };
      
      const res = await request(app)
        .put('/pages/match-volunteers/status/1')
        .set(adminAuthHeader)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Checked In');
      expect(res.body.hoursServed).toBe(2); // Should keep original value
    });

    it('PUT /status/:id should handle invalid ID format', async () => {
      const updateData = {
        status: "Checked In"
      };
      
      const res = await request(app)
        .put('/pages/match-volunteers/status/not-a-number')
        .set(adminAuthHeader)
        .send(updateData);
      
      // This might return 404 or 500 depending on implementation
      expect([404, 500].includes(res.statusCode)).toBe(true);
    });
  });
});