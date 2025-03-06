// Import the necessary testing utilities
import '@testing-library/jest-dom';

// Mock data for testing
const mockEvents = [
  {
    id: 1,
    eventName: "Community Garden Cleanup",
    eventDescription: "Help clean up community gardens for spring planting",
    location: "Central Park, New York, NY",
    requiredSkills: ["Event Setup", "Gardening"],
    urgency: "Medium",
    eventDate: "2024-04-15",
    maxVolunteers: 25,
    contactPerson: "Jane Doe",
    contactEmail: "jane.doe@example.com",
    contactPhone: "555-123-4567",
    startTime: "09:00",
    endTime: "14:00",
    visibility: "Public",
    createdAt: "2024-02-15T00:00:00.000Z",
    createdBy: "admin",
    volunteersAssigned: 10,
    status: "Active"
  },
  {
    id: 2,
    eventName: "Food Bank Distribution",
    eventDescription: "Help distribute food to families in need",
    location: "Downtown Food Bank, 123 Main St",
    requiredSkills: ["Organization", "First Aid Support"],
    urgency: "High",
    eventDate: "2024-03-20",
    maxVolunteers: 15,
    contactPerson: "John Smith",
    contactEmail: "john.smith@example.com",
    contactPhone: "555-987-6543",
    startTime: "13:00",
    endTime: "18:00",
    visibility: "Public",
    createdAt: "2024-02-01T00:00:00.000Z",
    createdBy: "admin",
    volunteersAssigned: 8,
    status: "Active"
  },
  {
    id: 3,
    eventName: "Tutoring Session",
    eventDescription: "Help students with homework and academic support",
    location: "Main Library, Education Room",
    requiredSkills: ["Tutoring", "Time Management"],
    urgency: "Low",
    eventDate: "2024-03-25",
    maxVolunteers: 10,
    contactPerson: "Robert Johnson",
    contactEmail: "robert@example.com",
    contactPhone: "555-456-7890",
    startTime: "16:00",
    endTime: "19:00",
    visibility: "Private",
    createdAt: "2024-02-20T00:00:00.000Z",
    createdBy: "admin",
    volunteersAssigned: 5,
    status: "Active"
  }
];

// Simple functions to test event management functionality
const eventFunctions = {
  // Get all events
  getAllEvents: () => {
    return { statusCode: 200, body: mockEvents };
  },
  
  // Get a single event by ID
  getEventById: (id) => {
    const numId = parseInt(id, 10);
    
    if (isNaN(numId)) {
      return { error: 'Invalid event ID', statusCode: 400 };
    }
    
    const event = mockEvents.find(event => event.id === numId);
    
    if (!event) {
      return { error: 'Event not found', statusCode: 404 };
    }
    
    return { statusCode: 200, body: event };
  },
  
  // Create a new event
  createEvent: (eventData) => {
    const {
      eventName,
      eventDescription,
      location,
      requiredSkills,
      urgency,
      eventDate,
      maxVolunteers
    } = eventData;
    
    // Validate required fields
    if (!eventName || !eventDescription || !location || !requiredSkills || 
        !urgency || !eventDate || !maxVolunteers) {
      return { error: 'Required fields are missing', statusCode: 400 };
    }
    
    // Create a new event with a unique ID
    const newId = Math.max(...mockEvents.map(e => e.id)) + 1;
    
    const newEvent = {
      id: newId,
      ...eventData,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      maxVolunteers: parseInt(maxVolunteers, 10),
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      volunteersAssigned: 0,
      status: 'Active'
    };
    
    // In a real implementation, we would add this to our database
    // For testing, we'll just return the new event
    
    return { statusCode: 201, body: newEvent };
  },
  
  // Update an existing event
  updateEvent: (id, eventData) => {
    const numId = parseInt(id, 10);
    
    if (isNaN(numId)) {
      return { error: 'Invalid event ID', statusCode: 400 };
    }
    
    const eventIndex = mockEvents.findIndex(event => event.id === numId);
    
    if (eventIndex === -1) {
      return { error: 'Event not found', statusCode: 404 };
    }
    
    // Get current event data
    const currentEvent = mockEvents[eventIndex];
    
    // Update with new data, keeping old data for any missing fields
    const updatedEvent = {
      ...currentEvent,
      ...eventData,
      requiredSkills: eventData.requiredSkills 
        ? (Array.isArray(eventData.requiredSkills) ? eventData.requiredSkills : [eventData.requiredSkills])
        : currentEvent.requiredSkills,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    };
    
    // In a real implementation, we would update our database
    // For testing, we'll just return the updated event
    
    return { statusCode: 200, body: updatedEvent };
  },
  
  // Delete an event
  deleteEvent: (id) => {
    const numId = parseInt(id, 10);
    
    if (isNaN(numId)) {
      return { error: 'Invalid event ID', statusCode: 400 };
    }
    
    const eventIndex = mockEvents.findIndex(event => event.id === numId);
    
    if (eventIndex === -1) {
      return { error: 'Event not found', statusCode: 404 };
    }
    
    // In a real implementation, we would remove this from our database
    // For testing, we'll just return a success message
    
    return { statusCode: 200, body: { message: 'Event deleted successfully' } };
  },
  
  // Search events by skills
  searchEventsBySkills: (skills) => {
    if (!skills) {
      return { error: 'Skills parameter is required', statusCode: 400 };
    }
    
    const searchSkills = skills.split(',').map(skill => skill.trim().toLowerCase());
    
    const matchedEvents = mockEvents.filter(event => 
      event.requiredSkills.some(skill => 
        searchSkills.includes(skill.toLowerCase())
      )
    );
    
    return { statusCode: 200, body: matchedEvents };
  },
  
  // Search events by location
  searchEventsByLocation: (term) => {
    if (!term) {
      return { error: 'Location search term is required', statusCode: 400 };
    }
    
    const matchedEvents = mockEvents.filter(event => 
      event.location.toLowerCase().includes(term.toLowerCase())
    );
    
    return { statusCode: 200, body: matchedEvents };
  },
  
  // Filter events by urgency level
  filterEventsByUrgency: (level) => {
    if (!level) {
      return { error: 'Urgency level is required', statusCode: 400 };
    }
    
    const matchedEvents = mockEvents.filter(event => 
      event.urgency.toLowerCase() === level.toLowerCase()
    );
    
    return { statusCode: 200, body: matchedEvents };
  },
  
  // Get upcoming events
  getUpcomingEvents: () => {
    const today = new Date();
    
    const upcomingEvents = mockEvents
      .filter(event => new Date(event.eventDate) > today)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    
    return { statusCode: 200, body: upcomingEvents };
  }
};

// Test get events functionality
describe('Get Events', () => {
  it('should return all events', () => {
    const result = eventFunctions.getAllEvents();
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBe(mockEvents.length);
  });
  
  it('should return a specific event by ID', () => {
    const result = eventFunctions.getEventById(1);
    expect(result.statusCode).toBe(200);
    expect(result.body.id).toBe(1);
    expect(result.body.eventName).toBe('Community Garden Cleanup');
  });
  
  it('should return 404 for non-existent event ID', () => {
    const result = eventFunctions.getEventById(999);
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Event not found');
  });
  
  it('should return 400 for invalid event ID', () => {
    const result = eventFunctions.getEventById('invalid');
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Invalid event ID');
  });
});

// Test create event functionality
describe('Create Event', () => {
  it('should create a new event with valid data', () => {
    const newEvent = {
      eventName: "Beach Cleanup",
      eventDescription: "Help clean up beach litter and plastics",
      location: "Sunny Beach",
      requiredSkills: ["Event Setup", "Environmental"],
      urgency: "Medium",
      eventDate: "2024-05-01",
      maxVolunteers: 30,
      contactPerson: "Sarah Johnson",
      contactEmail: "sarah@example.com",
      contactPhone: "555-111-2222",
      startTime: "10:00",
      endTime: "15:00",
      visibility: "Public"
    };
    
    const result = eventFunctions.createEvent(newEvent);
    expect(result.statusCode).toBe(201);
    expect(result.body.eventName).toBe('Beach Cleanup');
    expect(result.body.maxVolunteers).toBe(30);
    expect(result.body.status).toBe('Active');
    expect(result.body.volunteersAssigned).toBe(0);
  });
  
  it('should handle string skill as array when creating event', () => {
    const newEvent = {
      eventName: "Single Skill Event",
      eventDescription: "Test event with single skill",
      location: "Test Location",
      requiredSkills: "Tutoring", // Single string instead of array
      urgency: "Low",
      eventDate: "2024-05-15",
      maxVolunteers: 5
    };
    
    const result = eventFunctions.createEvent(newEvent);
    expect(result.statusCode).toBe(201);
    expect(Array.isArray(result.body.requiredSkills)).toBe(true);
    expect(result.body.requiredSkills).toContain('Tutoring');
  });
  
  it('should return 400 when required fields are missing', () => {
    const incompleteEvent = {
      eventName: "Incomplete Event",
      location: "Nowhere"
      // Missing other required fields
    };
    
    const result = eventFunctions.createEvent(incompleteEvent);
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Required fields are missing');
  });
});

// Test update event functionality
describe('Update Event', () => {
  it('should update an existing event', () => {
    const updateData = {
      eventDescription: "Updated description",
      maxVolunteers: 40
    };
    
    const result = eventFunctions.updateEvent(1, updateData);
    expect(result.statusCode).toBe(200);
    expect(result.body.id).toBe(1);
    expect(result.body.eventDescription).toBe('Updated description');
    expect(result.body.maxVolunteers).toBe(40);
    expect(result.body.eventName).toBe('Community Garden Cleanup'); // Unchanged field
  });
  
  it('should return 404 when updating non-existent event', () => {
    const result = eventFunctions.updateEvent(999, { eventName: "New Name" });
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Event not found');
  });
  
  it('should return 400 for invalid event ID', () => {
    const result = eventFunctions.updateEvent('invalid', { eventName: "New Name" });
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Invalid event ID');
  });
});

// Test delete event functionality
describe('Delete Event', () => {
  it('should delete an existing event', () => {
    const result = eventFunctions.deleteEvent(2);
    expect(result.statusCode).toBe(200);
    expect(result.body.message).toBe('Event deleted successfully');
  });
  
  it('should return 404 when deleting non-existent event', () => {
    const result = eventFunctions.deleteEvent(999);
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Event not found');
  });
  
  it('should return 400 for invalid event ID', () => {
    const result = eventFunctions.deleteEvent('invalid');
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Invalid event ID');
  });
});

// Test search and filter functionality
describe('Search and Filter Events', () => {
  it('should search events by skills', () => {
    const result = eventFunctions.searchEventsBySkills('Tutoring,Organization');
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBeGreaterThan(0);
    expect(result.body.some(event => event.requiredSkills.includes('Tutoring'))).toBe(true);
  });
  
  it('should return 400 when skills parameter is missing', () => {
    const result = eventFunctions.searchEventsBySkills();
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Skills parameter is required');
  });
  
  it('should search events by location', () => {
    const result = eventFunctions.searchEventsByLocation('library');
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBeGreaterThan(0);
    expect(result.body[0].location).toContain('Library');
  });
  
  it('should return 400 when location term is missing', () => {
    const result = eventFunctions.searchEventsByLocation();
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Location search term is required');
  });
  
  it('should filter events by urgency level', () => {
    const result = eventFunctions.filterEventsByUrgency('High');
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBeGreaterThan(0);
    expect(result.body[0].urgency).toBe('High');
  });
  
  it('should return 400 when urgency level is missing', () => {
    const result = eventFunctions.filterEventsByUrgency();
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Urgency level is required');
  });
});

// Test upcoming events functionality
describe('Upcoming Events', () => {
  it('should get upcoming events', () => {
    const result = eventFunctions.getUpcomingEvents();
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    
    // If there are upcoming events, verify they're sorted by date
    if (result.body.length > 1) {
      const firstDate = new Date(result.body[0].eventDate);
      const secondDate = new Date(result.body[1].eventDate);
      expect(firstDate <= secondDate).toBe(true);
    }
  });
});