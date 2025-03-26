import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Card, Form, Badge, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from './Admin_sidebar';
import NavigationBar from './NavigationBar';

// Define a consistent API base URL
const API_BASE_URL = 'http://localhost:3001/api/volunteer-matcher';


// Helper function for authenticated API calls
const fetchWithAuth = async (endpoint, options = {}) => {
  // Get auth token from localStorage or wherever you store it
  const token = localStorage.getItem('authToken') || 'your-auth-token';
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });
};

const VolunteerEventMatcher = () => {
  const navigate = useNavigate();
  // State for volunteers and events
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");

  // Fetch volunteers and events on component mount
  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
  }, []);

  // Function to fetch volunteers from API
  const fetchVolunteers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/volunteers');
      if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
      }
      const data = await response.json();
      
      // Map the API response to match our component state structure
      const formattedVolunteers = data.map(volunteer => ({
        id: volunteer.username, // Using username as ID
        name: volunteer.username,
        phone: volunteer.phone_number,
        email: volunteer.email,
        fullName: `${volunteer.first_name} ${volunteer.last_name}`,
        role: 'volunteer',
        skills: volunteer.skills || []
      }));
      
      setVolunteers(formattedVolunteers);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setMatchMessage('Failed to load volunteers. Please try again.');
      
      // Fallback to sample data if API fails
      const sampleVolunteers = [
        { id: 'emma_brown', name: "emma_brown", phone: "+1-555-0204", email: "emma.brown@email.com", fullName: "Emma Brown", role: "volunteer", skills: ["teaching", "organizing", "computer skills"] },
        { id: 'james_wilson', name: "james_wilson", phone: "+1-555-0203", email: "james.wilson@email.com", fullName: "James Wilson", role: "volunteer", skills: ["photography", "social media", "design"] },
        { id: 'john_doe', name: "john_doe", phone: "+1-555-0201", email: "john.doe@email.com", fullName: "John Doe", role: "volunteer", skills: ["teaching", "patience", "first aid"] }
      ];
      setVolunteers(sampleVolunteers);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setMatchMessage('Failed to load events. Please try again.');
      
      // Fallback to sample data if API fails
      const sampleEvents = [
        {
          id: 1,
          eventName: "Beach Cleanup",
          name: "Beach Cleanup",
          location: "Sunset Beach, 123 Coastal Road",
          eventDate: "2025-03-15T09:00:00Z",
          date: "2025-03-15T09:00:00Z",
          startTime: "9:00 AM",
          time: "9:00 AM",
          endTime: "1:00 PM",
          eventDescription: "Help clean up the beach and protect marine life.",
          description: "Help clean up the beach and protect marine life.",
          maxVolunteers: 20,
          volunteersNeeded: 20,
          volunteersAssigned: 5,
          volunteersRegistered: 5,
          requiredSkills: ["physical work", "environmental awareness"],
          skills: ["physical work", "environmental awareness"],
          urgency: "Low",
          contactPerson: "Sarah Jones",
          contactEmail: "sarah.j@impactnow.org",
          contactPhone: "555-123-4567",
          status: "Active",
          visibility: "Public",
          createdAt: "2025-01-05T10:30:00Z",
          createdBy: "admin"
        },
        {
          id: 2,
          eventName: "Tech Workshop for Seniors",
          name: "Tech Workshop for Seniors",
          location: "Downtown Library, 456 Oak Avenue",
          eventDate: "2025-02-20T13:00:00Z",
          date: "2025-02-20T13:00:00Z",
          startTime: "1:00 PM",
          time: "1:00 PM",
          endTime: "4:00 PM",
          eventDescription: "Teach basic computer and smartphone skills to senior citizens.",
          description: "Teach basic computer and smartphone skills to senior citizens.",
          maxVolunteers: 10,
          volunteersNeeded: 10,
          volunteersAssigned: 2,
          volunteersRegistered: 2,
          requiredSkills: ["teaching", "patience", "computer skills"],
          skills: ["teaching", "patience", "computer skills"],
          urgency: "Medium",
          contactPerson: "James Wilson",
          contactEmail: "james.w@impactnow.org",
          contactPhone: "555-456-7890",
          status: "Active",
          visibility: "Public",
          createdAt: "2025-01-10T14:30:00Z",
          createdBy: "admin"
        },
        {
          id: 3,
          eventName: "Food Drive",
          name: "Food Drive",
          location: "Community Center, 789 Pine Street",
          eventDate: "2025-03-05T10:00:00Z",
          date: "2025-03-05T10:00:00Z",
          startTime: "10:00 AM",
          time: "10:00 AM",
          endTime: "3:00 PM",
          eventDescription: "Collect and sort food donations for local food banks.",
          description: "Collect and sort food donations for local food banks.",
          maxVolunteers: 15,
          volunteersNeeded: 15,
          volunteersAssigned: 8,
          volunteersRegistered: 8,
          requiredSkills: ["organizing", "physical work"],
          skills: ["organizing", "physical work"],
          urgency: "High",
          contactPerson: "Michael Brown",
          contactEmail: "michael.b@impactnow.org",
          contactPhone: "555-789-0123",
          status: "Active",
          visibility: "Public",
          createdAt: "2025-01-15T09:45:00Z",
          createdBy: "admin"
        }
      ];
      setEvents(sampleEvents);
      setFilteredEvents(sampleEvents);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle volunteer search
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) {
      // If search term is longer than 2 characters, search via API
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`/volunteers/search?term=${encodeURIComponent(term)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        
        // Map the API response to match our component state structure
        const formattedVolunteers = data.map(volunteer => ({
          id: volunteer.username,
          name: volunteer.username,
          phone: volunteer.phone_number,
          email: volunteer.email,
          fullName: `${volunteer.first_name} ${volunteer.last_name}`,
          role: 'volunteer',
          skills: volunteer.skills || []
        }));
        
        setVolunteers(formattedVolunteers);
      } catch (error) {
        console.error('Error searching volunteers:', error);
        // Fall back to client-side filtering if API search fails
        const filtered = volunteers.filter(volunteer =>
          volunteer.name.toLowerCase().includes(term.toLowerCase()) ||
          volunteer.email.toLowerCase().includes(term.toLowerCase())
        );
        setVolunteers(filtered);
      } finally {
        setIsLoading(false);
      }
    } else if (term.length === 0) {
      // If search term is cleared, refresh the full list
      fetchVolunteers();
    }
  };

  // Handle event search
  const handleEventSearch = async (e) => {
    const term = e.target.value;
    setEventSearchTerm(term);
    
    if (term.length > 2) {
      // If search term is longer than 2 characters, search via API
      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`/events/search?term=${encodeURIComponent(term)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setFilteredEvents(data);
      } catch (error) {
        console.error('Error searching events:', error);
        // Fall back to client-side filtering if API search fails
        const filtered = events.filter(event => 
          event.eventName.toLowerCase().includes(term.toLowerCase()) ||
          event.description.toLowerCase().includes(term.toLowerCase()) ||
          event.location.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredEvents(filtered);
      } finally {
        setIsLoading(false);
      }
    } else if (term.length === 0) {
      // If search term is cleared, show all events
      setFilteredEvents(events);
    }
  };

  // Handle volunteer selection
  const selectVolunteer = async (volunteer) => {
    setSelectedVolunteer(volunteer);
    
    // Find matching events based on volunteer skills via API
    if (volunteer.skills && volunteer.skills.length > 0) {
      setIsLoading(true);
      try {
        // For simplicity, we'll use the first skill to find matching events
        const skill = volunteer.skills[0];
        const response = await fetchWithAuth(`/events/skills/${encodeURIComponent(skill)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch matching events');
        }
        
        const matchingEvents = await response.json();
        
        if (matchingEvents.length > 0) {
          setFilteredEvents(matchingEvents);
        } else {
          // If no matches found, show all events
          setFilteredEvents(events);
        }
      } catch (error) {
        console.error('Error finding matching events:', error);
        
        // Fall back to client-side filtering if API fails
        const matches = events.filter(event => 
          event.requiredSkills.some(skill => 
            volunteer.skills.includes(skill)
          )
        );
        
        if (matches.length > 0) {
          setFilteredEvents(matches);
        } else {
          setFilteredEvents(events);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredEvents(events);
    }
  };

  // Handle matching volunteer to event
  const matchVolunteerToEvent = async (eventId) => {
    if (!selectedVolunteer) {
      setMatchMessage("Please select a volunteer first");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/match', {
        method: 'POST',
        body: JSON.stringify({
          username: selectedVolunteer.id, // Using username as ID
          eventId: eventId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match volunteer to event');
      }
      
      const result = await response.json();
      setMatchMessage(result.message || `Successfully matched ${selectedVolunteer.name} to event #${eventId}`);
      
      // Refresh events data to update counts
      fetchEvents();
    } catch (error) {
      console.error('Error matching volunteer to event:', error);
      setMatchMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      
      // Clear message after a delay
      setTimeout(() => {
        setMatchMessage("");
      }, 5000);
    }
  };
  
  // Filter volunteers based on search term
  const filteredVolunteers = volunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container
      fluid
      className="p-0"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <NavigationBar />
      <Sidebar />
      
      {/* Main content */}
      <Container style={{ marginLeft: "250px", padding: "40px", marginTop: "80px" }}>
        <h1 className="mb-4 text-white">Volunteer-Event Matcher</h1>
        
        {matchMessage && (
          <Alert variant="success" dismissible>
            {matchMessage}
          </Alert>
        )}
        
        <Row>
          {/* Volunteer Search Section */}
          <Col md={5}>
            <Card className="shadow-lg mb-4">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Find Volunteers</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Control 
                    type="text" 
                    placeholder="Search volunteers by name or email" 
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </Form.Group>
                
                {isLoading ? (
                  <p>Loading volunteers...</p>
                ) : (
                  <div className="volunteer-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredVolunteers.length === 0 ? (
                      <p>No volunteers found</p>
                    ) : (
                      filteredVolunteers.map(volunteer => (
                        <Card 
                          key={volunteer.id} 
                          className={`mb-2 ${selectedVolunteer && selectedVolunteer.id === volunteer.id ? 'border-primary' : ''}`}
                          onClick={() => selectVolunteer(volunteer)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <div>
                                <h6>{volunteer.fullName || volunteer.name}</h6>
                                <p className="mb-1 small">{volunteer.email}</p>
                                <p className="mb-1 small">{volunteer.phone}</p>
                              </div>
                              <div>
                                {volunteer.skills && volunteer.skills.map(skill => (
                                  <Badge key={skill} bg="info" className="me-1 mb-1">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </Card.Body>
              <Card.Footer>
                <div className="d-flex justify-content-between">
                  <small>Total: {filteredVolunteers.length} volunteer(s)</small>
                  {selectedVolunteer && (
                    <Button size="sm" variant="outline-secondary" onClick={() => setSelectedVolunteer(null)}>
                      Clear Selection
                    </Button>
                  )}
                </div>
              </Card.Footer>
            </Card>
            
            {selectedVolunteer && (
              <Card className="shadow-lg mb-4">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Selected Volunteer</h5>
                </Card.Header>
                <Card.Body>
                  <h4>{selectedVolunteer.name}</h4>
                  <p><strong>Email:</strong> {selectedVolunteer.email}</p>
                  <p><strong>Phone:</strong> {selectedVolunteer.phone}</p>
                  <p><strong>Skills:</strong></p>
                  <div>
                    {selectedVolunteer.skills && selectedVolunteer.skills.map(skill => (
                      <Badge key={skill} bg="info" className="me-1 mb-1">{skill}</Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
          
          {/* Event Section */}
          <Col md={7}>
            <Card className="shadow-lg">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Available Events</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Control 
                    type="text" 
                    placeholder="Search events by name, description or location" 
                    value={eventSearchTerm}
                    onChange={handleEventSearch}
                  />
                </Form.Group>
                
                {selectedVolunteer && (
                  <div className="alert alert-info">
                    Showing events matching {selectedVolunteer.name}'s skills
                  </div>
                )}
                
                {isLoading ? (
                  <p>Loading events...</p>
                ) : (
                  <div className="event-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {filteredEvents.length === 0 ? (
                      <p>No matching events found</p>
                    ) : (
                      filteredEvents.map(event => (
                        <Card key={event.id} className="mb-3">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{event.eventName}</h6>
                            <Badge bg={event.urgency === "High" ? "danger" : event.urgency === "Medium" ? "warning" : "success"}>
                              {event.urgency} Priority
                            </Badge>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={8}>
                                <p className="mb-1"><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                                <p className="mb-1"><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                                <p className="mb-1"><strong>Location:</strong> {event.location}</p>
                                <p className="mb-2"><strong>Description:</strong> {event.eventDescription}</p>
                                <p className="mb-1">
                                  <strong>Required Skills:</strong>{" "}
                                  {event.requiredSkills.map(skill => (
                                    <Badge 
                                      key={skill} 
                                      bg={selectedVolunteer && selectedVolunteer.skills && selectedVolunteer.skills.includes(skill) ? "success" : "secondary"} 
                                      className="me-1"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </p>
                              </Col>
                              <Col md={4}>
                                <div className="text-center mb-3">
                                  <div className="h5 mb-0">{event.volunteersAssigned}/{event.maxVolunteers}</div>
                                  <small>Volunteers Assigned</small>
                                </div>
                                
                                <Button 
                                  variant="primary" 
                                  className="w-100"
                                  disabled={!selectedVolunteer}
                                  onClick={() => matchVolunteerToEvent(event.id)}
                                >
                                  Assign Volunteer
                                </Button>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </Card.Body>
              <Card.Footer>
                <small>Showing {filteredEvents.length} of {events.length} events</small>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default VolunteerEventMatcher;