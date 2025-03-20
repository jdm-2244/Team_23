import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card, Form, Tab, Tabs, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const EventManagement = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('existing');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showFutureOnly, setShowFutureOnly] = useState(true);
  const [apiStatus, setApiStatus] = useState('idle');

  // Test data for debugging
  const testEvents = [
    {
      id: 999,
      name: "Test Event 1",
      location: "Community Center, 123 Main St, Seattle, WA",
      date: "2025-04-01",
      description: "This is a test event to verify rendering",
      volunteersNeeded: 5,
      volunteersRegistered: 2,
      volunteersConfirmed: 1,
      skills: ["First Aid", "Organizing"],
      urgency: "Medium",
      time: "14:00"
    },
    {
      id: 998,
      name: "Test Event 2",
      location: "City Park, 456 Park Ave, Portland, OR",
      date: "2025-04-15",
      description: "Another test event",
      volunteersNeeded: 10,
      volunteersRegistered: 4,
      volunteersConfirmed: 3,
      skills: ["Gardening", "Teaching"],
      urgency: "High",
      time: "09:30"
    }
  ];

  // New event form state
  const [eventForm, setEventForm] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    description: "",
    volunteersNeeded: 0,
    skills: [],
    urgency: "Medium"
  });

  // Selected event for editing
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Use absolute URL for API endpoint
  const API_BASE_URL = "http://localhost:3001/api/events";

  // Fetch events, locations, and skills on component mount
  useEffect(() => {
    fetchEvents();
    fetchLocations();
    fetchSkills();
  }, [showFutureOnly]);

  // Debug log for current events state
  useEffect(() => {
    console.log("Current events state:", events);
    console.log("Is events an array?", Array.isArray(events));
    console.log("Number of events:", Array.isArray(events) ? events.length : 0);
  }, [events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setApiStatus('loading');
      console.log("Fetching events with future =", showFutureOnly);
      
      try {
        // Set a timeout of 10 seconds for the fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_BASE_URL}?future=${showFutureOnly}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log("Response status:", response.status);
        console.log("Response OK?", response.ok);
        
        if (!response.ok) {
          console.error(`HTTP error: ${response.status} ${response.statusText}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);
        
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Response is not JSON");
          throw new Error("Response is not JSON");
        }
        
        const text = await response.text();
        console.log("Raw response text:", text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          throw new Error("Failed to parse JSON response");
        }
        
        console.log("Received data:", data);
        console.log("Type of data:", typeof data);
        console.log("Is data an array?", Array.isArray(data));
        
        // Ensure we're always setting events to an array
        if (Array.isArray(data)) {
          setEvents(data);
          setApiStatus('success');
        } else {
          console.error("API did not return an array:", data);
          console.log("Using test data instead");
          setEvents(testEvents); // Use test data
          setError("Using test data - API did not return an array. Please check server logs.");
          setApiStatus('error');
        }
      } catch (err) {
        console.error("Error in API call:", err);
        console.log("Using test data due to API error");
        setEvents(testEvents); // Use test data in case of any error
        setError(`Using test data - API error: ${err.message}. Check network tab and server console.`);
        setApiStatus('error');
      }
    } catch (err) {
      console.error("Unexpected error in fetchEvents:", err);
      setError(`Unexpected error: ${err.message}`);
      setEvents([]); // Reset to empty array on unexpected error
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available locations
  const fetchLocations = async () => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error("Locations API did not return an array:", data);
          // Use test locations data
          setAvailableLocations([
            { id: 1, name: "Community Center, 123 Main St, Seattle, WA" },
            { id: 2, name: "City Park, 456 Park Ave, Portland, OR" },
            { id: 3, name: "Beach Cleanup Site, 789 Ocean Blvd, San Francisco, CA" }
          ]);
          return;
        }
        
        console.log("Locations data:", data);
        setAvailableLocations(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
        // Use test locations data on error
        setAvailableLocations([
          { id: 1, name: "Community Center, 123 Main St, Seattle, WA" },
          { id: 2, name: "City Park, 456 Park Ave, Portland, OR" },
          { id: 3, name: "Beach Cleanup Site, 789 Ocean Blvd, San Francisco, CA" }
        ]);
      }
    } catch (err) {
      console.error("Unexpected error in fetchLocations:", err);
    }
  };

  // Fetch available skills
  const fetchSkills = async () => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/skills`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error("Skills API did not return an array:", data);
          // Use test skills data
          setAvailableSkills([
            { id: 1, name: "First Aid", description: "Basic first aid and CPR certification" },
            { id: 2, name: "Teaching", description: "Experience with teaching or tutoring" },
            { id: 3, name: "Gardening", description: "Knowledge of plants and gardening techniques" }
          ]);
          return;
        }
        
        console.log("Skills data:", data);
        setAvailableSkills(data);
      } catch (err) {
        console.error("Error fetching skills:", err);
        // Use test skills data on error
        setAvailableSkills([
          { id: 1, name: "First Aid", description: "Basic first aid and CPR certification" },
          { id: 2, name: "Teaching", description: "Experience with teaching or tutoring" },
          { id: 3, name: "Gardening", description: "Knowledge of plants and gardening techniques" }
        ]);
      }
    } catch (err) {
      console.error("Unexpected error in fetchSkills:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for skills (multi-select)
    if (name === "skills") {
      // Convert selected options to array of values
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          [name]: selectedOptions
        });
      } else {
        setEventForm({
          ...eventForm,
          [name]: selectedOptions
        });
      }
      return;
    }
    
    // Handle other inputs
    if (selectedEvent) {
      setSelectedEvent({
        ...selectedEvent,
        [name]: value
      });
    } else {
      setEventForm({
        ...eventForm,
        [name]: value
      });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for API
      const newEventData = {
        ...eventForm,
        // Ensure date is in YYYY-MM-DD format for MySQL
        date: eventForm.date ? new Date(eventForm.date).toISOString().split('T')[0] : '',
        volunteersNeeded: parseInt(eventForm.volunteersNeeded, 10)
      };
      
      console.log("Submitting new event:", newEventData); // Debug log
      
      // Send to backend
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If you're using token auth
        },
        body: JSON.stringify(newEventData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      // Fetch the updated events list
      await fetchEvents();
      
      // Reset form
      setEventForm({
        name: "",
        location: "",
        date: "",
        time: "",
        description: "",
        volunteersNeeded: 0,
        skills: [],
        urgency: "Medium"
      });
      
      // Switch to the existing events tab
      setKey('existing');
      
      alert("Event created successfully!");
    } catch (err) {
      console.error("Error creating event:", err);
      alert(`Failed to create event: ${err.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for API
      const updatedEventData = {
        name: selectedEvent.name,
        location: selectedEvent.location,
        date: selectedEvent.date ? new Date(selectedEvent.date).toISOString().split('T')[0] : '',
        time: selectedEvent.time,
        description: selectedEvent.description,
        volunteersNeeded: parseInt(selectedEvent.volunteersNeeded, 10),
        skills: selectedEvent.skills,
        urgency: selectedEvent.urgency || "Medium"
      };
      
      console.log("Submitting updated event:", updatedEventData); // Debug log
      
      // Send to backend
      const response = await fetch(`${API_BASE_URL}/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If you're using token auth
        },
        body: JSON.stringify(updatedEventData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      // Refresh the events list
      await fetchEvents();
      
      // Clear selected event
      setSelectedEvent(null);
      
      alert("Event updated successfully!");
    } catch (err) {
      console.error("Error updating event:", err);
      alert(`Failed to update event: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // If you're using token auth
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete event');
        }
        
        // Refresh the events list
        await fetchEvents();
        setSelectedEvent(null);
        
        alert("Event deleted successfully!");
      } catch (err) {
        console.error("Error deleting event:", err);
        alert(`Failed to delete event: ${err.message}`);
      }
    }
  };

  const handleLogout = () => {
    // Clear auth token if using JWT
    localStorage.removeItem('token');
    console.log("Admin logged out");
    navigate("/login");
  };

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/events/test-connection');
      const data = await response.json();
      alert(`Database connection test: ${data.success ? 'Success' : 'Failed'}\n${data.message}`);
    } catch (err) {
      alert(`Connection test failed: ${err.message}`);
    }
  };

  // A function to use test data directly
  const useTestData = () => {
    setEvents(testEvents);
    setError("Using test data for demonstration");
  };

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
      {/* Sidebar */}
      <div
        className="bg-dark text-white d-flex flex-column justify-content-between align-items-center rounded shadow-lg"
        style={{
          width: "220px",
          minHeight: "360px",
          position: "fixed",
          left: "20px",
          top: "120px",
          padding: "20px",
        }}
      >
        <ListGroup variant="flush" className="w-100 text-center">
        <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/admin-dashboard" className="text-decoration-none text-white fs-6">🏠 Dashboard</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/profile-admin" className="text-decoration-none text-white fs-6">👤 Profile</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/event-management" className="text-decoration-none text-white fs-6">
              📅 Event Management
            </Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/match-volunteers" className="text-decoration-none text-white fs-6">🤝 Match Volunteers</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/notifications" className="text-decoration-none text-white fs-6">📢 Notify Volunteers</Link>  
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/volunteer-history" className="text-decoration-none text-white fs-6">📜 View Volunteer History</Link>
          </ListGroup.Item>
        </ListGroup>

        <Button
          variant="danger"
          className="w-100 mt-3"
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            border: "none",
            padding: "10px 0",
            fontSize: "16px",
          }}
        >
          🚪 Log Out
        </Button>
      </div>

      {/* Main Content */}
      <Container style={{ marginLeft: "250px", padding: "40px" }}>
        {/* Navbar */}
        <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
        <Container className="d-flex justify-content-center">
          <Navbar.Brand className="text-white fw-bold fs-2" style={{ textShadow: "2px 2px 4px rgba(9, 7, 3, 2)" }}> ImpactNow </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
            <Nav className="fs-5 d-flex gap-3">
              <Nav.Link as={Link} to="/" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/faq" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                FAQ
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                About Us
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                Contact Us
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

        <Row className="mt-5">
          <Col>
            <h2 className="text-white">Event Management</h2>
            <p className="text-white">Create new volunteer events or manage existing ones.</p>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="shadow-lg">
              <Card.Body>
                {/* Debug tools for development */}
                <div className="mb-3 p-2 bg-light rounded">
                  <h6>Debug Tools</h6>
                  <div className="d-flex">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={fetchEvents} 
                      className="me-2"
                    >
                      Refresh API Data
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={useTestData} 
                      className="me-2"
                    >
                      Use Test Data
                    </Button>
                    <Button 
                      variant="outline-info" 
                      size="sm" 
                      onClick={testConnection}
                    >
                      Test DB Connection
                    </Button>
                  </div>
                  <div className="mt-2 small">
                    <strong>API Status:</strong> {apiStatus} | 
                    <strong> Events Count:</strong> {Array.isArray(events) ? events.length : 'Not an array'}
                  </div>
                </div>

                <Tabs
                  id="event-management-tabs"
                  activeKey={key}
                  onSelect={(k) => {
                    setKey(k);
                    setSelectedEvent(null);
                  }}
                  className="mb-4"
                >
                  <Tab eventKey="existing" title="Manage Existing Events">
                    {/* Filter controls for existing events */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="switch"
                        id="future-events-switch"
                        label="Show only future events"
                        checked={showFutureOnly}
                        onChange={() => setShowFutureOnly(!showFutureOnly)}
                      />
                    </div>
                    
                    {/* Error display */}
                    {error && (
                      <Alert variant="warning" onClose={() => setError('')} dismissible>
                        {error}
                      </Alert>
                    )}
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <p>Loading events...</p>
                      </div>
                    ) : selectedEvent ? (
                      <Form onSubmit={handleEditSubmit}>
                        <h4 className="mb-4">Edit Event</h4>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Event Name</Form.Label>
                              <Form.Control 
                                type="text" 
                                name="name" 
                                value={selectedEvent.name}
                                onChange={handleInputChange}
                                required 
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Location</Form.Label>
                              <Form.Select
                                name="location"
                                value={selectedEvent.location}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Select a location...</option>
                                {availableLocations.map(loc => (
                                  <option key={loc.id} value={loc.name}>
                                    {loc.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Date</Form.Label>
                              <Form.Control 
                                type="date" 
                                name="date" 
                                value={selectedEvent.date}
                                onChange={handleInputChange}
                                required 
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Time</Form.Label>
                              <Form.Control 
                                type="time" 
                                name="time" 
                                value={selectedEvent.time || ""}
                                onChange={handleInputChange}
                                required 
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            name="description" 
                            value={selectedEvent.description}
                            onChange={handleInputChange}
                            rows={4} 
                            required 
                          />
                        </Form.Group>

                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Number of Volunteers Needed</Form.Label>
                              <Form.Control 
                                type="number" 
                                name="volunteersNeeded" 
                                value={selectedEvent.volunteersNeeded}
                                onChange={handleInputChange}
                                min={selectedEvent.volunteersRegistered || 0} 
                                required 
                              />
                              <Form.Text className="text-muted">
                                Currently {selectedEvent.volunteersRegistered || 0} volunteers registered
                                {selectedEvent.volunteersConfirmed !== undefined && 
                                 ` (${selectedEvent.volunteersConfirmed} confirmed)`}
                              </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Urgency</Form.Label>
                              <Form.Select
                                name="urgency"
                                value={selectedEvent.urgency || "Medium"}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Skills Required (Optional)</Form.Label>
                              <Form.Select
                                name="skills"
                                onChange={handleInputChange}
                                multiple
                                value={selectedEvent.skills || []}
                              >
                                {availableSkills.map(skill => (
                                  <option key={skill.id} value={skill.name} title={skill.description}>
                                    {skill.name}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Text className="text-muted">
                                Hold Ctrl (or Cmd) to select multiple skills
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                          <Button 
                            variant="outline-secondary" 
                            className="me-2"
                            onClick={() => setSelectedEvent(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="danger" 
                            className="me-2"
                            onClick={() => handleDeleteEvent(selectedEvent.id)}
                          >
                            Delete Event
                          </Button>
                          <Button 
                            variant="primary" 
                            type="submit" 
                            style={{
                              background: "linear-gradient(to right, #6a11cb, #2575fc)",
                              border: "none"
                            }}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        {!Array.isArray(events) && (
                          <Alert variant="warning">
                            Data format issue detected. Please refresh the page or try using test data.
                          </Alert>
                        )}
                        
                        {Array.isArray(events) && events.length === 0 ? (
                          <div className="text-center py-5">
                            <p className="mb-3">No events found.</p>
                            <Button 
                              variant="primary" 
                              onClick={() => setKey('create')}
                              style={{
                                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                                border: "none"
                              }}
                            >
                              Create New Event
                            </Button>
                          </div>
                        ) : (
                          <Row>
                            {Array.isArray(events) && events.map((event) => (
                              <Col md={6} lg={4} key={event.id} className="mb-4">
                                <Card className="h-100 shadow-sm">
                                  <Card.Body>
                                    <Card.Title>{event.name}</Card.Title>
                                    <Card.Text>
                                      <strong>📍 Location:</strong> {event.location}<br />
                                      <strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}<br />
                                      <strong>⏰ Time:</strong> {event.time || "Not specified"}<br />
                                      <strong>👥 Volunteers:</strong> {event.volunteersRegistered || 0}/{event.volunteersNeeded}
                                      {event.volunteersConfirmed !== undefined && 
                                       ` (${event.volunteersConfirmed} confirmed)`}
                                      <br />
                                      <strong>🔥 Urgency:</strong> {event.urgency || 'Medium'}
                                    </Card.Text>
                                    <div className="d-grid">
                                      <Button 
                                        variant="outline-primary" 
                                        onClick={() => setSelectedEvent(event)}
                                      >
                                        Manage Event
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </>
                    )}
                  </Tab>
                  <Tab eventKey="create" title="Create New Event">
                    <Row>
                      <Col lg={8}>
                        <Form onSubmit={handleCreateSubmit}>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Event Name</Form.Label>
                                <Form.Control 
                                  type="text" 
                                  name="name" 
                                  value={eventForm.name}
                                  onChange={handleInputChange}
                                  required 
                                  placeholder="Enter event name" 
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Select
                                  name="location"
                                  value={eventForm.location}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select a location...</option>
                                  {availableLocations.map(loc => (
                                    <option key={loc.id} value={loc.name}>
                                      {loc.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control 
                                  type="date" 
                                  name="date" 
                                  value={eventForm.date}
                                  onChange={handleInputChange}
                                  required 
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control 
                                  type="time" 
                                  name="time" 
                                  value={eventForm.time}
                                  onChange={handleInputChange}
                                  required 
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                              as="textarea" 
                              name="description" 
                              value={eventForm.description}
                              onChange={handleInputChange}
                              rows={4} 
                              placeholder="Describe the event and what volunteers will be doing" 
                              required 
                            />
                          </Form.Group>

                          <Row>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Number of Volunteers Needed</Form.Label>
                                <Form.Control 
                                  type="number" 
                                  name="volunteersNeeded" 
                                  value={eventForm.volunteersNeeded}
                                  onChange={handleInputChange}
                                  min="1" 
                                  required 
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Urgency</Form.Label>
                                <Form.Select
                                  name="urgency"
                                  value={eventForm.urgency}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Skills Required (Optional)</Form.Label>
                                <Form.Select
                                  name="skills"
                                  onChange={handleInputChange}
                                  multiple
                                  value={eventForm.skills}
                                >
                                  {availableSkills.map(skill => (
                                    <option key={skill.id} value={skill.name} title={skill.description}>
                                      {skill.name}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                  Hold Ctrl (or Cmd) to select multiple skills
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>

                          <div className="d-flex justify-content-end mt-4">
                            <Button 
                              variant="outline-secondary" 
                              className="me-2"
                              onClick={() => setKey('existing')}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="primary" 
                              type="submit" 
                              style={{
                                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                                border: "none"
                              }}
                            >
                              Create Event
                            </Button>
                          </div>
                        </Form>
                      </Col>

                      <Col lg={4}>
                        <Card className="shadow-lg">
                          <Card.Body>
                            <Card.Title>Tips for Creating Effective Events</Card.Title>
                            <ListGroup variant="flush">
                              <ListGroup.Item>Be clear about volunteer responsibilities</ListGroup.Item>
                              <ListGroup.Item>Specify the skills needed for the event</ListGroup.Item>
                              <ListGroup.Item>Provide detailed location information</ListGroup.Item>
                              <ListGroup.Item>Include any special instructions or requirements</ListGroup.Item>
                              <ListGroup.Item>Make the description engaging and motivating</ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default EventManagement;