import React from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const firstName = "John"; 
  const navigate = useNavigate();

  const eventSuggestions = [
    { name: "Park Cleanup", location: "Downtown Park", date: "Feb 10, 2025" },
    { name: "Food Bank Assistance", location: "Houston Food Bank", date: "Feb 15, 2025" },
    { name: "Community Tutoring", location: "Local Library", date: "Feb 20, 2025" },
  ];

  const handleLogout = () => {
    console.log("User logged out"); 
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
          width: "200px",
          minHeight: "250px",
          position: "fixed",
          left: "20px",
          top: "120px",
          padding: "20px",
        }}
      >
        <ListGroup variant="flush" className="w-100 text-center">
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/newuser" className="text-decoration-none text-white fs-6">👤 Profile</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/event-search" className="text-decoration-none text-white fs-6">🔍 Event Search</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/history" className="text-decoration-none text-white fs-6">📜 History</Link>
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

      <Container style={{ marginLeft: "220px", padding: "40px" }}>
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
            <p className="text-white">Here are some events near you:</p>
          </Col>
        </Row>

        <Row>
          {eventSuggestions.map((event, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>{event.name}</Card.Title>
                  <Card.Text>
                    📍 {event.location} <br />
                    📅 {event.date}
                  </Card.Text>
                  <Button variant="success" className="w-100">View Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default VolunteerDashboard;