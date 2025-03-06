// Import the necessary testing utilities
import '@testing-library/jest-dom';

// Mock data for testing
const mockVolunteers = [
  {
    username: "jsmith",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    phone_number: "555-123-4567",
    location: "New York, NY",
    role: "volunteer"
  },
  {
    username: "mjohnson",
    first_name: "Maria",
    last_name: "Johnson",
    email: "maria.johnson@example.com",
    phone_number: "555-234-5678",
    location: "Los Angeles, CA",
    role: "volunteer"
  }
];

const mockVolunteerHistory = [
  {
    id: 1,
    volunteerName: "John Smith",
    eventName: "Community Garden Cleanup",
    eventDate: "2024-02-15",
    status: "Checked In",
    hoursServed: 4,
    description: "Helped with clearing debris and preparing garden beds for spring planting.",
    maxVolunteers: 20
  },
  {
    id: 2,
    volunteerName: "Maria Johnson",
    eventName: "Food Bank Distribution",
    eventDate: "2024-01-20",
    status: "No Show",
    hoursServed: 0,
    description: "Scheduled but did not attend.",
    maxVolunteers: 15
  }
];

// Simple functions to test volunteer matching functionality
const volunteerFunctions = {
  // Search for a volunteer
  searchVolunteer: (type, term) => {
    if (!type || !term) {
      return { error: 'Search type and term are required', statusCode: 400 };
    }
    
    let volunteer = null;
    
    switch (type) {
      case 'username':
        volunteer = mockVolunteers.find(v => v.username === term);
        break;
      case 'email':
        volunteer = mockVolunteers.find(v => v.email === term);
        break;
      case 'phone':
        volunteer = mockVolunteers.find(v => v.phone_number === term);
        break;
      case 'name':
        volunteer = mockVolunteers.find(v => 
          v.first_name.toLowerCase().includes(term.toLowerCase()) || 
          v.last_name.toLowerCase().includes(term.toLowerCase())
        );
        break;
      default:
        return { error: 'Invalid search type', statusCode: 400 };
    }
    
    if (!volunteer) {
      return { error: 'Volunteer not found', statusCode: 404 };
    }
    
    return { statusCode: 200, body: volunteer };
  },
  
  // Get volunteer history
  getVolunteerHistory: (username) => {
    const volunteer = mockVolunteers.find(v => v.username === username);
    
    if (!volunteer) {
      return { error: 'Volunteer not found', statusCode: 404 };
    }
    
    const history = mockVolunteerHistory
      .filter(record => record.volunteerName === `${volunteer.first_name} ${volunteer.last_name}`)
      .map(record => ({
        eventName: record.eventName,
        eventDate: record.eventDate,
        checkin: record.status === 'Checked In'
      }));
    
    return { statusCode: 200, body: history };
  },
  
  // Match volunteer to event
  matchVolunteer: (username, eventName) => {
    if (!username || !eventName) {
      return { error: 'Username and event name are required', statusCode: 400 };
    }
    
    const volunteer = mockVolunteers.find(v => v.username === username);
    if (!volunteer) {
      return { error: 'Volunteer not found', statusCode: 404 };
    }
    
    const event = mockVolunteerHistory.find(r => r.eventName === eventName);
    if (!event) {
      return { error: 'Event not found', statusCode: 404 };
    }
    
    const volunteerFullName = `${volunteer.first_name} ${volunteer.last_name}`;
    
    const existingMatch = mockVolunteerHistory.find(
      r => r.volunteerName === volunteerFullName && r.eventName === eventName
    );
    
    if (existingMatch) {
      return { error: 'Volunteer is already matched to this event', statusCode: 400 };
    }
    
    const newId = Math.max(...mockVolunteerHistory.map(r => r.id)) + 1;
    
    const newRecord = {
      id: newId,
      volunteerName: volunteerFullName,
      eventName: eventName,
      eventDate: event.eventDate,
      status: 'Pending',
      hoursServed: 0,
      description: `Matched to ${eventName}`,
      maxVolunteers: event.maxVolunteers
    };
    
    // In a real implementation, we would add this to our database
    // For testing, we'll just return the record
    
    return { statusCode: 201, body: newRecord };
  },
  
  // Update volunteer status
  updateVolunteerStatus: (id, status, hoursServed) => {
    if (!status) {
      return { error: 'Status is required', statusCode: 400 };
    }
    
    const recordIndex = mockVolunteerHistory.findIndex(r => r.id === id);
    
    if (recordIndex === -1) {
      return { error: 'Record not found', statusCode: 404 };
    }
    
    const updatedRecord = {
      ...mockVolunteerHistory[recordIndex],
      status: status,
      hoursServed: hoursServed || mockVolunteerHistory[recordIndex].hoursServed
    };
    
    // In a real implementation, we would update our database
    // For testing, we'll just return the updated record
    
    return { statusCode: 200, body: updatedRecord };
  }
};

// Test volunteer search functionality
describe('Volunteer Search', () => {
  it('should return volunteer when found by username', () => {
    const result = volunteerFunctions.searchVolunteer('username', 'jsmith');
    expect(result.statusCode).toBe(200);
    expect(result.body.username).toBe('jsmith');
    expect(result.body.first_name).toBe('John');
    expect(result.body.last_name).toBe('Smith');
  });
  
  it('should return volunteer when found by email', () => {
    const result = volunteerFunctions.searchVolunteer('email', 'john.smith@example.com');
    expect(result.statusCode).toBe(200);
    expect(result.body.username).toBe('jsmith');
  });
  
  it('should return volunteer when found by phone', () => {
    const result = volunteerFunctions.searchVolunteer('phone', '555-123-4567');
    expect(result.statusCode).toBe(200);
    expect(result.body.username).toBe('jsmith');
  });
  
  it('should return volunteer when found by name', () => {
    const result = volunteerFunctions.searchVolunteer('name', 'john');
    expect(result.statusCode).toBe(200);
    expect(result.body.first_name).toBe('John');
    expect(result.body.last_name).toBe('Smith');
  });
  
  it('should return 404 when volunteer is not found', () => {
    const result = volunteerFunctions.searchVolunteer('username', 'nonexistent');
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Volunteer not found');
  });
  
  it('should return 400 when search type is invalid', () => {
    const result = volunteerFunctions.searchVolunteer('invalid', 'jsmith');
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Invalid search type');
  });
  
  it('should return 400 when search type or term is missing', () => {
    const result = volunteerFunctions.searchVolunteer();
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Search type and term are required');
  });
});

// Test volunteer history functionality
describe('Volunteer History', () => {
  it('should return history for a volunteer', () => {
    const result = volunteerFunctions.getVolunteerHistory('jsmith');
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBe(1);
    expect(result.body[0].eventName).toBe('Community Garden Cleanup');
    expect(result.body[0].checkin).toBe(true);
  });
  
  it('should return empty array if volunteer has no history', () => {
    // Add a volunteer with no history for this test
    mockVolunteers.push({
      username: "nohistory",
      first_name: "No",
      last_name: "History",
      email: "no.history@example.com",
      phone_number: "555-000-0000",
      location: "Nowhere",
      role: "volunteer"
    });
    
    const result = volunteerFunctions.getVolunteerHistory('nohistory');
    expect(result.statusCode).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBe(0);
  });
  
  it('should return 404 for non-existent volunteer', () => {
    const result = volunteerFunctions.getVolunteerHistory('nonexistent');
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Volunteer not found');
  });
});

// Test volunteer matching functionality
describe('Volunteer Matching', () => {
  it('should match a volunteer to an event', () => {
    const result = volunteerFunctions.matchVolunteer('jsmith', 'Food Bank Distribution');
    expect(result.statusCode).toBe(201);
    expect(result.body.volunteerName).toBe('John Smith');
    expect(result.body.eventName).toBe('Food Bank Distribution');
    expect(result.body.status).toBe('Pending');
  });
  
  it('should return 400 when matching a volunteer to an event they are already matched to', () => {
    const result = volunteerFunctions.matchVolunteer('jsmith', 'Community Garden Cleanup');
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Volunteer is already matched to this event');
  });
  
  it('should return 404 when volunteer does not exist', () => {
    const result = volunteerFunctions.matchVolunteer('nonexistent', 'Community Garden Cleanup');
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Volunteer not found');
  });
  
  it('should return 404 when event does not exist', () => {
    const result = volunteerFunctions.matchVolunteer('jsmith', 'Nonexistent Event');
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Event not found');
  });
});

// Test volunteer status update functionality
describe('Volunteer Status Update', () => {
  it('should update a volunteer status', () => {
    const result = volunteerFunctions.updateVolunteerStatus(1, 'Checked In', 4);
    expect(result.statusCode).toBe(200);
    expect(result.body.status).toBe('Checked In');
    expect(result.body.hoursServed).toBe(4);
  });
  
  it('should return 404 for non-existent record', () => {
    const result = volunteerFunctions.updateVolunteerStatus(9999, 'Checked In', 3);
    expect(result.statusCode).toBe(404);
    expect(result.error).toBe('Record not found');
  });
  
  it('should return 400 when status is missing', () => {
    const result = volunteerFunctions.updateVolunteerStatus(1, null, 3);
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Status is required');
  });
});