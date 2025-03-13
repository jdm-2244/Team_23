import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, Button, Card, Form, InputGroup, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import Sidebar from './Admin_sidebar';

const Notification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [searchResults, setSearchResults] = useState(null);
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('Event Assignment');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const mockResult = {
        username: "volunteer123",
        email: "volunteer@example.com",
        phone_number: "123-456-7890",
        role: "volunteer",
        profile: {
          Name: "John Doe",
          location: "New York",
          last_update: "2025-02-10"
        }
      };

      setSearchResults(mockResult);
      setLoading(false);
    }, 1000);
  };

  const handleSendNotification = async () => {
    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }
    if (!searchResults || !searchResults.email) {
      alert("No valid volunteer record found to send a notification.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: searchResults.email,
          notificationType: notificationType,
          message: message
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        if (errData.errors) {
          alert(`Error sending notification: ${errData.errors.join(', ')}`);
        } else {
          alert(`Error sending notification: ${errData.error || 'Unknown error'}`);
        }
        return;
      }

      const data = await response.json();
      alert(data.message);
      setMessage("");

    } catch (err) {
      alert("Failed to send notification. " + err.message);
    }
  };

  return (
    <Container fluid className="p-0 d-flex" style={{ minHeight: "100vh", background: "linear-gradient(to right, #6a11cb, #2575fc)" }}>
      <Sidebar />
      <Container style={{ marginLeft: "250px", padding: "80px 20px" }}>
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
        <h2 className="text-white mb-4 text-center">📢 Send Notifications</h2>
        <Card className="shadow-lg p-4" style={{ borderRadius: "15px" }}>
          <Form onSubmit={handleSearch}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Search By</Form.Label>
                  <Form.Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="username">Username</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Number</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Search Term</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Enter search term..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "🔍"}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card>

        {searchResults && (
          <Card className="shadow-lg mt-4 p-4" style={{ borderRadius: "15px" }}>
            <h3 className="mb-3 text-center">👤 Volunteer Information</h3>
            <Row className="mb-3">
              <Col md={6}><strong>Name:</strong> {searchResults.profile.Name}</Col>
              <Col md={6}><strong>Username:</strong> {searchResults.username}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}><strong>Email:</strong> {searchResults.email}</Col>
              <Col md={6}><strong>Phone:</strong> {searchResults.phone_number}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}><strong>Location:</strong> {searchResults.profile.location}</Col>
              <Col md={6}><strong>Role:</strong> {searchResults.role}</Col>
            </Row>

            <h5 className="mt-4">✉️ Send Notification</h5>
            <Form.Group className="mb-3">
              <Form.Label>Notification Type</Form.Label>
              <Form.Select value={notificationType} onChange={(e) => setNotificationType(e.target.value)}>
                <option value="Event Assignment">Event Assignment</option>
                <option value="Update">Update</option>
                <option value="Reminder">Reminder</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Button variant="success" className="w-100" onClick={handleSendNotification}>
              🚀 Send Notification
            </Button>
          </Card>
        )}
      </Container>
    </Container>
  );
};

export default Notification;
