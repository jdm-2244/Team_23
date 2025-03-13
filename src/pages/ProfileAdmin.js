import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ProfileAdmin = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    fullName: "Alice Johnson",
    organizationName: "ACME Nonprofit",
    organizationWebsite: "https://www.acmenonprofit.org",
    phoneNumber: "123-456-7890",
    address: "4567 Pine Street",
    city: "Austin",
    state: "Texas",
    zip: "73301",
    eventTypes: "Community Outreach, Training Seminars",
    email: "admin@example.com",
    password: "AdminPassword!",
    role: "Admin"
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = () => {
    alert("Profile updated successfully");
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <Container
      fluid
      className="p-0"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex"
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
          padding: "20px"
        }}
      >
        <ListGroup variant="flush" className="w-100 text-center">
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/admin-dashboard" className="text-decoration-none text-white fs-6">🏠 Dashboard</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/admin-profile" className="text-decoration-none text-white fs-6">👤 Profile</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/event-management" className="text-decoration-none text-white fs-6">📅 Create a New Event</Link>
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
            fontSize: "16px"
          }}
        >
          🚪 Log Out
        </Button>
      </div>
      <Container style={{ marginLeft: "250px", padding: "40px" }}>
        <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
          <Container className="d-flex justify-content-center">
            <Navbar.Brand className="text-white fw-bold fs-2" style={{ textShadow: "2px 2px 4px rgba(9, 7, 3, 2)" }}>
              ImpactNow
            </Navbar.Brand>
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
            <h2 className="text-white">Admin Profile</h2>
            <p className="text-white">Edit your information below.</p>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-4">
            <Card className="shadow-lg">
              <Card.Body>
                <Form onSubmit={e => e.preventDefault()}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Organization Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="organizationName"
                      value={profileData.organizationName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Organization Website</Form.Label>
                    <Form.Control
                      type="text"
                      name="organizationWebsite"
                      value={profileData.organizationWebsite}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Zip Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip"
                      value={profileData.zip}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Event Types</Form.Label>
                    <Form.Control
                      type="text"
                      name="eventTypes"
                      value={profileData.eventTypes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={profileData.password}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                      type="text"
                      name="role"
                      value={profileData.role}
                      readOnly
                    />
                  </Form.Group>
                  <Button variant="success" onClick={handleSave} className="w-100">Save Profile</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ProfileAdmin;
