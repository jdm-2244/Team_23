// Import the necessary testing utilities
import request from 'supertest';
import express from 'express';
import eventManagementRoutes from './eventManagementRoutes';

// Mock required modules that the routes will use
jest.mock('./eventsData', () => [
  {
    id: 1,
    eventName: "Community Garden Cleanup",
    name: "Community Garden Cleanup",
    eventDescription: "Help clean up community gardens for spring planting",
    description: "Help clean up community gardens for spring planting",
    location: "Central Park, New York, NY",
    requiredSkills: ["Event Setup", "Gardening"],
    skills: ["Event Setup", "Gardening"],
    urgency: "Medium",
    eventDate: "2024-04-15",
    date: "2024-04-15",
    maxVolunteers: 25,
    volunteersNeeded: 25,
    contactPerson: "Jane Doe",
    contactEmail: "jane.doe@example.com",
    contactPhone: "555-123-4567",
    startTime: "09:00",
    time: "09:00",
    endTime: "14:00",
    visibility: "Public",
    createdAt: "2024-02-15T00:00:00.000Z",
    createdBy: "admin",
    volunteersAssigned: 10,
    volunteersRegistered: 10,
    status: "Active"
  },
  {
    id: 2,
    eventName: "Food Bank Distribution",
    name: "Food Bank Distribution",
    eventDescription: "Help distribute food to families in need",
    description: "Help distribute food to families in need",
    location: "Downtown Food Bank, 123 Main St",
    requiredSkills: ["Organization", "First Aid Support"],
    skills: ["Organization", "First Aid Support"],
    urgency: "High",
    eventDate: "2024-03-20",
    date: "2024-03-20",
    maxVolunteers: 15,
    volunteersNeeded: 15,
    contactPerson: "John Smith",
    contactEmail: "john.smith@example.com",
    contactPhone: "555-987-6543",
    startTime: "13:00",
    time: "13:00",
    endTime: "18:00",
    visibility: "Public",
    createdAt: "2024-02-01T00:00:00.000Z",
    createdBy: "admin",
    volunteersAssigned: 8,
    volunteersRegistered: 8,
    status: "Active"
  },
  {
    id: 3,
    eventName: "Tutoring Session",
    name: "Tutoring Session",
    eventDescription: "Help students with homework and academic support",
    description: "Help students with homework and academic support",
    location: "Main Library, Education Room",
    requiredSkills: ["Tutoring", "Time Management"],
    skills: ["Tutoring", "Time Management"],
    urgency: "Low",
    eventDate: "2024-03-25",
    date: "2024-03-25",
    maxVolunteers: 10,
    volunteersNeeded: 10,
    contactPerson: "Robert Johnson",
    contactEmail: "robert@example.com",
    contactPhone: "555-456-7890",
    startTime: "16:00",
    time: "16:00",
    endTime: "19:00",
    visibility: "Private",
    createdAt: "2024-02-20T00:00:00.000Z",
    createdBy: "admin",
    volunteersAssigned: 5,
    volunteersRegistered: 5,
    status: "Active"
  }
]);

// Create the Express app
const app = express();
app.use(express.json());
app.use('/api/events', eventManagementRoutes);

// Mock authentication middleware for testing
// This adds authentication token to all requests
const addAuthHeader = (request) => {
  return request.set('Authorization', 'Bearer test-token');
};

// Test get events functionality
describe('Get Events API', () => {
  it('should return all events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    
    // Check that the events have been formatted correctly
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('location');
    expect(res.body[0]).toHaveProperty('volunteersNeeded');
  });
  
  it('should return a specific event by ID', async () => {
    const res = await request(app).get('/api/events/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe('Community Garden Cleanup');
  });
  
  it('should return 404 for non-existent event ID', async () => {
    const res = await request(app).get('/api/events/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });
});

// Test create event functionality
describe('Create Event API', () => {
  it('should create a new event with valid data when authenticated', async () => {
    const newEvent = {
      name: "Beach Cleanup",
      description: "Help clean up beach litter and plastics",
      location: "Sunny Beach",
      skills: ["Event Setup", "Environmental"],
      date: "2024-05-01",
      time: "10:00",
      volunteersNeeded: 30
    };
    
    const res = await addAuthHeader(
      request(app)
        .post('/api/events')
        .send(newEvent)
    );
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Beach Cleanup');
    expect(res.body.volunteersNeeded).toBe(30);
    expect(res.body.volunteersRegistered).toBe(0);
  });
  
  it('should return 400 when required fields are missing', async () => {
    const incompleteEvent = {
      name: "Incomplete Event",
      location: "Nowhere"
      // Missing other required fields
    };
    
    const res = await addAuthHeader(
      request(app)
        .post('/api/events')
        .send(incompleteEvent)
    );
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Required fields are missing');
  });
  
  it('should return 401 when not authenticated', async () => {
    const newEvent = {
      name: "Beach Cleanup",
      description: "Help clean up beach litter and plastics",
      location: "Sunny Beach",
      skills: ["Event Setup", "Environmental"],
      date: "2024-05-01",
      time: "10:00",
      volunteersNeeded: 30
    };
    
    const res = await request(app)
      .post('/api/events')
      .send(newEvent);
      
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});

// Test update event functionality
describe('Update Event API', () => {
  it('should update an existing event when authenticated', async () => {
    const updateData = {
      description: "Updated description",
      volunteersNeeded: 40
    };
    
    const res = await addAuthHeader(
      request(app)
        .put('/api/events/1')
        .send(updateData)
    );
    
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.description).toBe('Updated description');
    expect(res.body.volunteersNeeded).toBe(40);
    expect(res.body.name).toBe('Community Garden Cleanup'); // Unchanged field
  });
  
  it('should return 404 when updating non-existent event', async () => {
    const res = await addAuthHeader(
      request(app)
        .put('/api/events/999')
        .send({ name: "New Name" })
    );
    
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });
  
  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .put('/api/events/1')
      .send({ description: "Unauthorized update" });
      
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});

// Test delete event functionality
describe('Delete Event API', () => {
  it('should delete an existing event when authenticated', async () => {
    const res = await addAuthHeader(
      request(app).delete('/api/events/2')
    );
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Event deleted successfully');
    expect(res.body.deletedEvent).toBeDefined();
    expect(res.body.deletedEvent.id).toBe(2);
  });
  
  it('should return 404 when deleting non-existent event', async () => {
    const res = await addAuthHeader(
      request(app).delete('/api/events/999')
    );
    
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });
  
  it('should return 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/events/1');
      
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});

// Test search by skills functionality
describe('Search Events by Skills API', () => {
  it('should search events by skills', async () => {
    const res = await request(app).get('/api/events/search/skills?skills=Tutoring,Organization');
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Check that at least one of the returned events has the requested skill
    const hasRequestedSkill = res.body.some(event => 
      event.skills.some(skill => 
        ['tutoring', 'organization'].includes(skill.toLowerCase())
      )
    );
    expect(hasRequestedSkill).toBe(true);
  });
  
  it('should return 400 when skills parameter is missing', async () => {
    const res = await request(app).get('/api/events/search/skills');
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Skills parameter is required');
  });
});