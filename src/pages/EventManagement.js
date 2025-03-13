import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card, Form, Tab, Tabs } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const EventManagement = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('existing');
  
  // Mock data for existing events - in a real app, this would come from your API/database
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Community Garden Cleanup",
      location: "Central Park",
      date: "2025-03-20",
      time: "09:00",
      description: "Help us clean up the community garden and prepare for spring planting.",
      volunteersNeeded: 12,
      volunteersRegistered: 5,
      skills: ["gardening", "physical work"]
    },
    {
      id: 2,
      name: "Food Bank Distribution",
      location: "Downtown Community Center",
      date: "2025-03-25",
      time: "14:00",
      description: "Help distribute food to families in need at our monthly food bank event.",
      volunteersNeeded: 20,
      volunteersRegistered: 8,
      skills: ["communication", "organization"]
    }
  ]);

  // New event form state
  const [eventForm, setEventForm] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    description: "",
    volunteersNeeded: 0,
    skills: []
  });

  // Selected event for editing
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    console.log("Event created:", eventForm);
    
    // Add new event to the list
    const newEvent = {
      ...eventForm,
      id: events.length + 1,
      volunteersRegistered: 0
    };
    
    setEvents([...events, newEvent]);
    
    // Reset form
    setEventForm({
      name: "",
      location: "",
      date: "",
      time: "",
      description: "",
      volunteersNeeded: 0,
      skills: []
    });
    
    // Switch to the existing events tab
    setKey('existing');
    
    alert("Event created successfully!");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    console.log("Event updated:", selectedEvent);
    
    // Update event in the list
    const updatedEvents = events.map(event => 
      event.id === selectedEvent.id ? selectedEvent : event
    );
    
    setEvents(updatedEvents);
    setSelectedEvent(null);
    
    alert("Event updated successfully!");
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
      setSelectedEvent(null);
    }
  };

  const handleLogout = () => {
    console.log("Admin logged out");
    navigate("/login");
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
                    {selectedEvent ? (
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
                              <Form.Control 
                                type="text" 
                                name="location" 
                                value={selectedEvent.location}
                                onChange={handleInputChange}
                                required 
                              />
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
                                value={selectedEvent.time}
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
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Number of Volunteers Needed</Form.Label>
                              <Form.Control 
                                type="number" 
                                name="volunteersNeeded" 
                                value={selectedEvent.volunteersNeeded}
                                onChange={handleInputChange}
                                min={selectedEvent.volunteersRegistered} 
                                required 
                              />
                              <Form.Text className="text-muted">
                                Currently {selectedEvent.volunteersRegistered} volunteers registered
                              </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Skills Required (Optional)</Form.Label>
                              <Form.Select 
                                name="skills" 
                                onChange={handleInputChange}
                                multiple
                                value={selectedEvent.skills}
                              >
                                <option value="communication">Communication</option>
                                <option value="teamwork">Teamwork</option>
                                <option value="languages">Foreign Languages</option>
                                <option value="medical">Medical Training</option>
                                <option value="teaching">Teaching</option>
                                <option value="technical">Technical Skills</option>
                                <option value="gardening">Gardening</option>
                                <option value="physical work">Physical Work</option>
                                <option value="organization">Organization</option>
                              </Form.Select>
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
                        {events.length === 0 ? (
                          <div className="text-center py-5">
                            <p className="mb-3">No events have been created yet.</p>
                            <Button 
                              variant="primary" 
                              onClick={() => setKey('create')}
                              style={{
                                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                                border: "none"
                              }}
                            >
                              Create Your First Event
                            </Button>
                          </div>
                        ) : (
                          <Row>
                            {events.map((event) => (
                              <Col md={6} lg={4} key={event.id} className="mb-4">
                                <Card className="h-100 shadow-sm">
                                  <Card.Body>
                                    <Card.Title>{event.name}</Card.Title>
                                    <Card.Text>
                                      <strong>📍 Location:</strong> {event.location}<br />
                                      <strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}<br />
                                      <strong>⏰ Time:</strong> {event.time}<br />
                                      <strong>👥 Volunteers:</strong> {event.volunteersRegistered}/{event.volunteersNeeded}
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
                                <Form.Control 
                                  type="text" 
                                  name="location" 
                                  value={eventForm.location}
                                  onChange={handleInputChange}
                                  required 
                                  placeholder="Enter event location" 
                                />
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
                            <Col md={6}>
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
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Skills Required (Optional)</Form.Label>
                                <Form.Select 
                                  name="skills" 
                                  onChange={handleInputChange}
                                  multiple
                                >
                                  <option value="communication">Communication</option>
                                  <option value="teamwork">Teamwork</option>
                                  <option value="languages">Foreign Languages</option>
                                  <option value="medical">Medical Training</option>
                                  <option value="teaching">Teaching</option>
                                  <option value="technical">Technical Skills</option>
                                  <option value="gardening">Gardening</option>
                                  <option value="physical work">Physical Work</option>
                                  <option value="organization">Organization</option>
                                </Form.Select>
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