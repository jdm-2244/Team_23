import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const EventManagement = () => {
  const navigate = useNavigate();
  const [eventForm, setEventForm] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    description: "",
    volunteersNeeded: 0,
    skills: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm({
      ...eventForm,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Event created:", eventForm);
    // Here you would typically make an API call to create the event
    alert("Event created successfully!");
    setEventForm({
      name: "",
      location: "",
      date: "",
      time: "",
      description: "",
      volunteersNeeded: 0,
      skills: []
    });
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
            <Link to="/admin-profile" className="text-decoration-none text-white fs-6">👤 Profile</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/event-management" className="text-decoration-none text-white fs-6">
              📅 Create a New Event
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
            <Navbar.Brand className="text-white fw-bold fs-2">ImpactNow</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
              <Nav className="fs-5">
                <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
                <Nav.Link as={Link} to="/faq" className="text-white">FAQ</Nav.Link>
                <Nav.Link as={Link} to="/about" className="text-white">About Us</Nav.Link>
                <Nav.Link as={Link} to="/contact" className="text-white">Contact Us</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Row className="mt-5">
          <Col>
            <h2 className="text-white">Create a New Event</h2>
            <p className="text-white">Fill out the form below to create a new volunteer event.</p>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="shadow-lg p-4">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
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
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-4">
                    <Button 
                      variant="secondary" 
                      className="me-2"
                      onClick={() => navigate("/admin-dashboard")}
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
              </Card.Body>
            </Card>
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
      </Container>
    </Container>
  );
};

export default EventManagement;