import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";


const EventSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock event data
  const mockEvents = [
    {
      id: 1,
      name: "Community Garden Clean-up",
      location: "Central Park Gardens",
      date: "2025-03-15",
      time: "09:00 AM - 12:00 PM",
      slots: 15,
      slotsRemaining: 8,
      description: "Help maintain our community garden. Tools and refreshments provided.",
      category: "Environment"
    },
    {
      id: 2,
      name: "Senior Center Tech Support",
      location: "Golden Years Center",
      date: "2025-03-20",
      time: "02:00 PM - 04:00 PM",
      slots: 10,
      slotsRemaining: 5,
      description: "Assist seniors with basic computer and smartphone skills.",
      category: "Education"
    },
    {
      id: 3,
      name: "Food Bank Distribution",
      location: "Downtown Food Bank",
      date: "2025-03-18",
      time: "10:00 AM - 02:00 PM",
      slots: 20,
      slotsRemaining: 12,
      description: "Help sort and distribute food to families in need.",
      category: "Community Service"
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockEvents);
      setLoading(false);
    }, 1000);
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


      {/* Transparent Navbar */}
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

      {/* Main Content */}
      <Container style={{ marginLeft: "250px", padding: "100px" }}>
        <Row className="mb-4">
          <Col>
            <h2 className="text-white mb-4">Search Events</h2>
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
                          <option value="name">Event Name</option>
                          <option value="location">Location</option>
                          <option value="category">Category</option>
                          <option value="date">Date</option>
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
                    style={{
                      backgroundColor: "#2575fc",
                      border: "none"
                    }}
                  >
                    {loading ? 'Searching...' : 'Search Events'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {searchResults && (
          <Row>
            {searchResults.map((event) => (
              <Col md={4} key={event.id} className="mb-4">
                <Card className="shadow-lg h-100">
                  <Card.Body>
                    <Card.Title className="mb-3">{event.name}</Card.Title>
                    <Card.Text>
                      <p className="mb-2">
                        <span className="me-2">📍</span>
                        {event.location}
                      </p>
                      <p className="mb-2">
                        <span className="me-2">📅</span>
                        {event.date}
                      </p>
                      <p className="mb-2">
                        <span className="me-2">⏰</span>
                        {event.time}
                      </p>
                      <p className="mb-2">
                        <span className="me-2">🏷️</span>
                        {event.category}
                      </p>
                      <p className="mb-3">{event.description}</p>
                      <p className="mb-2">
                        <strong>Available Slots: </strong>
                        <span className={`text-${event.slotsRemaining > 0 ? 'success' : 'danger'}`}>
                          {event.slotsRemaining} / {event.slots}
                        </span>
                      </p>
                    </Card.Text>
                    <Button 
                      variant="success" 
                      className="w-100"
                      disabled={event.slotsRemaining === 0}
                    >
                      {event.slotsRemaining > 0 ? 'Sign Up' : 'Full'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default EventSearch;