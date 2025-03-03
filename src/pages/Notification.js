import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, Button, Card, Form } from "react-bootstrap";
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
    <Container
      fluid
      className="p-0"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Sidebar />

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

      <Container style={{ marginLeft: "250px", padding: "100px" }}>
        <Row className="mb-4">
          <Col>
            <h2 className="text-white mb-4">Send Notifications</h2>
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
                    style={{ backgroundColor: "#2575fc", border: "none" }}
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
                  <p><strong>Name:</strong> {searchResults.profile.Name}</p>
                  <p><strong>Username:</strong> {searchResults.username}</p>
                  <p><strong>Email:</strong> {searchResults.email}</p>
                  <p><strong>Phone:</strong> {searchResults.phone_number}</p>
                  <p><strong>Location:</strong> {searchResults.profile.location}</p>
                  <p><strong>Role:</strong> {searchResults.role}</p>

                  <h5 className="mt-4">Send Notification</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Notification Type</Form.Label>
                    <Form.Select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                    >
                      <option value="Event Assignment">Event Assignment</option>
                      <option value="Update">Update</option>
                      <option value="Reminder">Reminder</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </Form.Group>

                  <Button
                    variant="success"
                    className="w-100"
                    onClick={handleSendNotification}
                  >
                    📢 Send Notification
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default Notification;
