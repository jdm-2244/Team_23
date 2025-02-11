import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const AdminDash = () => {
  const firstName = "Admin"; 
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  
  const handleCreateEvent = () => {
    const newEvent = {
      name: `Event ${events.length + 1}`,
      location: "TBD",
      date: "TBD",
    };
    setEvents([...events, newEvent]); 
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
            <Button variant="link" className="text-decoration-none text-white fs-6" onClick={handleCreateEvent}>
              📅 Create a New Event
            </Button>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/match-volunteers" className="text-decoration-none text-white fs-6">🤝 Match Volunteers</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/notify-volunteers" className="text-decoration-none text-white fs-6">📢 Notify Volunteers</Link>
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

      <Container style={{ marginLeft: "250px", padding: "40px" }}>

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
            <h2 className="text-white">Welcome back, {firstName}!</h2>

            {events.length === 0 ? (
              <p className="text-white">
                You haven't created any events yet. To get started, select <strong>"Create a New Event"</strong> from the sidebar.
              </p>
            ) : (
              <p className="text-white">Here are the events you have created:</p>
            )}
          </Col>
        </Row>

        <Row>
          {events.map((event, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>{event.name}</Card.Title>
                  <Card.Text>
                    📍 {event.location} <br />
                    📅 {event.date}
                  </Card.Text>
                  <Button variant="success" className="w-100">Edit Event</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const VolunteerLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock function to simulate database search
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // This would be replaced with actual API call to your backend
    // Example API endpoint structure based on your database:
    // GET /api/volunteers?searchType=${searchType}&term=${searchTerm}
    
    // Simulating API delay
    setTimeout(() => {
      // Mock data structure matching your database schema
      const mockResult = {
        username: "volunteer123",
        email: "volunteer@example.com",
        phone_number: "123-456-7890",
        role: "volunteer",
        profile: {
          Name: "John Doe",
          location: "New York",
          last_update: "2025-02-10"
        },
        history: [
          {
            EID: 1,
            checkin: true,
            event_name: "Community Cleanup",
            event_date: "2025-01-15"
          }
        ]
      };
      
      setSearchResults(mockResult);
      setLoading(false);
    }, 1000);
  };

  return (
    <Container style={{ marginLeft: "250px", padding: "40px" }}>
      <Row className="mb-4">
        <Col>
          <h2 className="text-white mb-4">Volunteer Lookup</h2>
          <Card className="shadow-lg">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Search By</Form.Label>
                      <Form.Select 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option value="username">Username</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Number</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Search Term</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter search term..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search Volunteer'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {searchResults && (
        <Row>
          <Col>
            <Card className="shadow-lg">
              <Card.Body>
                <h3 className="mb-4">Volunteer Information</h3>
                <Row>
                  <Col md={6}>
                    <h5>Personal Details</h5>
                    <p><strong>Name:</strong> {searchResults.profile.Name}</p>
                    <p><strong>Username:</strong> {searchResults.username}</p>
                    <p><strong>Email:</strong> {searchResults.email}</p>
                    <p><strong>Phone:</strong> {searchResults.phone_number}</p>
                    <p><strong>Location:</strong> {searchResults.profile.location}</p>
                    <p><strong>Role:</strong> {searchResults.role}</p>
                  </Col>
                  <Col md={6}>
                    <h5>Volunteering History</h5>
                    {searchResults.history.map((record, index) => (
                      <Card key={index} className="mb-2">
                        <Card.Body>
                          <p className="mb-1"><strong>Event:</strong> {record.event_name}</p>
                          <p className="mb-1"><strong>Date:</strong> {record.event_date}</p>
                          <p className="mb-0">
                            <strong>Status:</strong> 
                            <span className={`text-${record.checkin ? 'success' : 'danger'}`}>
                              {record.checkin ? ' Checked In' : ' No Show'}
                            </span>
                          </p>
                        </Card.Body>
                      </Card>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VolunteerLookup;