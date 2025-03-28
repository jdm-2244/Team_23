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
const volunteerHistoryRoutes = require('./volunteerHistoryRoutes');

const app = express();
app.use(express.json());
app.use('/api/volunteer-history', volunteerHistoryRoutes);

describe('Volunteer History Routes', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /', () => {
    it('should return all volunteer history records', async () => {
      // Mock the database response for getVolunteerHistory
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            volunteerName: "John Doe",
            eventName: "Community Garden Clean-up",
            eventDate: "2025-01-15",
            status: "Completed",
            location: "Community Garden",
            maxVolunteers: 20,
            description: "Annual community garden maintenance",
            role: "General Volunteer",
            urgency: "Medium",
            skills: "Gardening,Physical Labor"
          },
          {
            id: 2,
            volunteerName: "Jane Smith",
            eventName: "Tech Workshop",
            eventDate: "2025-01-20",
            status: "Pending",
            location: "Community Center",
            maxVolunteers: 15,
            description: "Tech skills workshop",
            role: "Technical Support",
            urgency: "Low",
            skills: "Teaching,Technology"
          }
        ]
      ]);

      const res = await request(app).get('/api/volunteer-history');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].volunteerName).toBe("John Doe");
      expect(res.body[0].skills).toEqual(["Gardening", "Physical Labor"]);
      expect(res.body[0].checkedIn).toBe(true);
      expect(res.body[1].checkedIn).toBe(false);
    });

    it('should handle database errors', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/volunteer-history');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch volunteer history records');
    });
  });

  describe('GET /:id', () => {
    it('should return a single volunteer history record when found', async () => {
      // Mock the database response for the record query
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            volunteerName: "John Doe",
            eventName: "Community Garden Clean-up",
            eventDate: "2025-01-15",
            status: "Completed",
            location: "Community Garden",
            maxVolunteers: 20,
            description: "Annual community garden maintenance",
            role: "General Volunteer",
            urgency: "Medium",
            skills: "Gardening,Physical Labor"
          }
        ]
      ]);

      const res = await request(app).get('/api/volunteer-history/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.volunteerName).toBe("John Doe");
      expect(res.body.skills).toEqual(["Gardening", "Physical Labor"]);
      expect(res.body.checkedIn).toBe(true);
    });

    it('should return 404 when record is not found', async () => {
      // Mock an empty result
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app).get('/api/volunteer-history/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Record not found');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).get('/api/volunteer-history/1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch the volunteer history record');
    });
  });

  describe('POST /', () => {
    it('should create a new volunteer history record when data is valid', async () => {
      const newRecord = {
        volunteerName: "John Doe",
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      // Mock the database responses for the create operation
      // 1. Find event ID
      pool.query.mockResolvedValueOnce([[{ EID: 1 }]]);
      
      // 2. Find user ID
      pool.query.mockResolvedValueOnce([[{ username: 'jdoe' }]]);
      
      // 3. Insert record
      pool.query.mockResolvedValueOnce([{ insertId: 5 }]);
      
      // 4. Get the created record
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 5,
            volunteerName: "John Doe",
            eventName: "Community Event",
            eventDate: "2025-02-15",
            status: "Completed",
            location: "Community Center",
            maxVolunteers: 20,
            description: "Community event description",
            role: "General Volunteer",
            urgency: "Medium",
            skills: "Communication,Organizing"
          }
        ]
      ]);

      const res = await request(app)
        .post('/api/volunteer-history')
        .send(newRecord);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBe(5);
      expect(res.body.volunteerName).toBe("John Doe");
      expect(res.body.eventName).toBe("Community Event");
      expect(res.body.skills).toEqual(["Communication", "Organizing"]);
    });

    it('should return 400 when validation fails', async () => {
      const invalidRecord = {
        // Missing required fields
        eventDate: "2025-02-15"
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Volunteer name is required");
      expect(res.body.errors).toContain("Event name is required");
      expect(res.body.errors).toContain("Status is required");
    });

    // New tests for targeting uncovered validation lines
    
    // Target line 17 - volunteer name length validation
    it('should validate volunteer name length (line 17)', async () => {
      const invalidRecord = {
        volunteerName: 'A'.repeat(101), // More than 100 characters
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Volunteer name must be < 100 characters");
    });
    
    // Target line 20 - event name length validation
    it('should validate event name length (line 20)', async () => {
      const invalidRecord = {
        volunteerName: "John Doe",
        eventName: 'A'.repeat(101), // More than 100 characters
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Event name must be < 100 characters");
    });
    
    // Target line 24 - description length validation
    it('should validate description length (line 24)', async () => {
      const invalidRecord = {
        volunteerName: "John Doe",
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed",
        description: 'A'.repeat(501) // More than 500 characters
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Description must be < 500 characters");
    });
    
    // Target line 27 - hours served validation
    it('should validate hours served is a number (line 27)', async () => {
      const invalidRecord = {
        volunteerName: "John Doe",
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed",
        hoursServed: "not-a-number" // Not a valid number
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Hours served must be a number");
    });
    
    // Target line 31 - event date validation
    it('should validate event date format (line 31)', async () => {
      const invalidRecord = {
        volunteerName: "John Doe",
        eventName: "Community Event",
        eventDate: "invalid-date", // Invalid date format
        status: "Completed"
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Invalid event date");
    });

    it('should return 400 when event is not found', async () => {
      const newRecord = {
        volunteerName: "John Doe",
        eventName: "Non-existent Event",
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      // Mock empty result for event query
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(newRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Event not found');
    });

    it('should return 400 when volunteer is not found', async () => {
      const newRecord = {
        volunteerName: "Non-existent User",
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      // Mock successful event query
      pool.query.mockResolvedValueOnce([[{ EID: 1 }]]);
      
      // Mock empty result for user query
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(newRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Volunteer not found');
    });

    it('should validate field length limits', async () => {
      const longName = 'a'.repeat(101);
      const invalidRecord = {
        volunteerName: longName,
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Volunteer name must be < 100 characters");
    });

    it('should handle database errors', async () => {
      const newRecord = {
        volunteerName: "John Doe",
        eventName: "Community Event",
        eventDate: "2025-02-15",
        status: "Completed"
      };
      
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .post('/api/volunteer-history')
        .send(newRecord);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to create volunteer history record');
    });
  });

  describe('PUT /:id', () => {
    it('should update an existing volunteer history record when data is valid', async () => {
      const updatedRecord = {
        volunteerName: "Jane Smith",
        eventName: "Updated Event",
        eventDate: "2025-03-15",
        status: "Completed"
      };
      
      // Mock the database responses for the update operation
      // 1. Check if record exists
      pool.query.mockResolvedValueOnce([[{ HID: 1 }]]);
      
      // 2. Find event ID
      pool.query.mockResolvedValueOnce([[{ EID: 2 }]]);
      
      // 3. Find user ID
      pool.query.mockResolvedValueOnce([[{ username: 'jsmith' }]]);
      
      // 4. Update record (no result needed)
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // 5. Get the updated record
      pool.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            volunteerName: "Jane Smith",
            eventName: "Updated Event",
            eventDate: "2025-03-15",
            status: "Completed",
            location: "Updated Location",
            maxVolunteers: 15,
            description: "Updated description",
            role: "Team Leader",
            urgency: "High",
            skills: "Leadership,Management"
          }
        ]
      ]);

      const res = await request(app)
        .put('/api/volunteer-history/1')
        .send(updatedRecord);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.volunteerName).toBe("Jane Smith");
      expect(res.body.eventName).toBe("Updated Event");
      expect(res.body.checkedIn).toBe(true);
    });

    it('should return 404 when record is not found', async () => {
      const updatedRecord = {
        volunteerName: "Jane Smith",
        eventName: "Updated Event",
        eventDate: "2025-03-15",
        status: "Completed"
      };
      
      // Mock empty result for record existence check
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .put('/api/volunteer-history/999')
        .send(updatedRecord);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Record not found');
    });

    it('should return 400 when validation fails', async () => {
      const invalidRecord = {
        // Missing required fields
        eventDate: "2025-03-15"
      };
      
      const res = await request(app)
        .put('/api/volunteer-history/1')
        .send(invalidRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toContain("Volunteer name is required");
      expect(res.body.errors).toContain("Event name is required");
      expect(res.body.errors).toContain("Status is required");
    });

    it('should return 400 when event is not found', async () => {
      const updatedRecord = {
        volunteerName: "Jane Smith",
        eventName: "Non-existent Event",
        eventDate: "2025-03-15",
        status: "Completed"
      };
      
      // Mock record exists
      pool.query.mockResolvedValueOnce([[{ HID: 1 }]]);
      
      // Mock empty result for event query
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .put('/api/volunteer-history/1')
        .send(updatedRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Event not found');
    });

    it('should return 400 when volunteer is not found', async () => {
      const updatedRecord = {
        volunteerName: "Non-existent User",
        eventName: "Community Event",
        eventDate: "2025-03-15",
        status: "Completed"
      };
      
      // Mock record exists
      pool.query.mockResolvedValueOnce([[{ HID: 1 }]]);
      
      // Mock event found
      pool.query.mockResolvedValueOnce([[{ EID: 1 }]]);
      
      // Mock empty result for user query
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app)
        .put('/api/volunteer-history/1')
        .send(updatedRecord);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Volunteer not found');
    });

    it('should handle database errors', async () => {
      const updatedRecord = {
        volunteerName: "Jane Smith",
        eventName: "Updated Event",
        eventDate: "2025-03-15",
        status: "Completed"
      };
      
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app)
        .put('/api/volunteer-history/1')
        .send(updatedRecord);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to update volunteer history record');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an existing volunteer history record', async () => {
      // Mock the database responses for the delete operation
      // 1. Check if record exists
      pool.query.mockResolvedValueOnce([[{ HID: 1 }]]);
      
      // 2. Delete record (no result needed)
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete('/api/volunteer-history/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Record deleted successfully');
    });

    it('should return 404 when record is not found', async () => {
      // Mock empty result for record existence check
      pool.query.mockResolvedValueOnce([[]]);
      
      const res = await request(app).delete('/api/volunteer-history/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Record not found');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const res = await request(app).delete('/api/volunteer-history/1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to delete volunteer history record');
    });
  });
  
});