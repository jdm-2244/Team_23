import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Row, Col, Button, Card, Form, InputGroup, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Sidebar from './Admin_sidebar';

const Notification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [searchResults, setSearchResults] = useState(null);
  const [message, setMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [broadcastEventId, setBroadcastEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({ show: false, variant: 'info', message: '' });
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to fetch events from the event management API
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await fetch('http://localhost:3001/api/events');
      
      if (!response.ok) {
        throw new Error("Error fetching events");
      }
      
      const data = await response.json();
      
      // Make sure we have valid event data
      if (Array.isArray(data)) {
        console.log("Events loaded:", data); // Debug log
        
        // Map the event data to format needed for the dropdown
        // Using raw database events with EID and Name from the Events table
        const formattedEvents = data.map(event => ({
          EID: event.id,
          Name: event.name
        }));
        
        setEvents(formattedEvents);
      } else {
        throw new Error("Invalid event data format");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err.message);
      setNotificationStatus({
        show: true,
        variant: 'warning',
        message: 'Failed to load events. Notifications will use a default event.'
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const searchUrl = `http://localhost:3001/api/admin/volunteer-notifications/searchVolunteer?searchType=${searchType}&searchTerm=${searchTerm}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert("No volunteer found with the provided information.");
          setLoading(false);
          return;
        }
        throw new Error("Error searching for volunteer");
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      alert("Failed to search for volunteer: " + err.message);
    } finally {
      setLoading(false);
    }
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
      const requestBody = {
        toEmail: searchResults.email,
        message: message
      };
      
      // Add eventId to request body if selected
      if (selectedEventId) {
        requestBody.eventId = parseInt(selectedEventId, 10);
      }
      
      const response = await fetch('http://localhost:3001/api/admin/volunteer-notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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
      
      setNotificationStatus({
        show: true,
        variant: 'success',
        message: data.message || 'Notification saved successfully. The volunteer will see it when they log in.'
      });
      
      setMessage("");
      setSelectedEventId("");
    } catch (err) {
      alert("Failed to save notification. " + err.message);
    }
  };

  const handleSendToAllVolunteers = async () => {
    if (!broadcastMessage.trim()) {
      alert("Please enter a message for the broadcast.");
      return;
    }
    
    setSendingBroadcast(true);
    
    try {
      const requestBody = {
        message: broadcastMessage
      };
      
      // Add eventId to request body if selected
      if (broadcastEventId) {
        requestBody.eventId = parseInt(broadcastEventId, 10);
      }
      
      const response = await fetch('http://localhost:3001/api/admin/volunteer-notifications/send-to-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        if (errData.errors) {
          alert(`Error sending broadcast: ${errData.errors.join(', ')}`);
        } else {
          alert(`Error sending broadcast: ${errData.error || 'Unknown error'}`);
        }
        return;
      }
      
      const data = await response.json();
      
      setNotificationStatus({
        show: true,
        variant: 'success',
        message: data.message || 'Broadcast notifications saved successfully! Volunteers will see them when they log in.'
      });
      
      setBroadcastMessage("");
      setBroadcastEventId("");
    } catch (err) {
      alert("Failed to send notification to all volunteers. " + err.message);
      setNotificationStatus({
        show: true,
        variant: 'danger',
        message: `Error: ${err.message}`
      });
    } finally {
      setSendingBroadcast(false);
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
        
        {/* Notification Status Alert */}
        {notificationStatus.show && (
          <Alert 
            variant={notificationStatus.variant} 
            className="mb-3" 
            dismissible 
            onClose={() => setNotificationStatus({...notificationStatus, show: false})}
          >
            {notificationStatus.message}
          </Alert>
        )}
        
        {/* Search Card */}
        <Card className="shadow-lg p-4" style={{ borderRadius: "15px" }}>
          <h3 className="mb-3 text-center">🔍 Search for a Volunteer</h3>
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
        
        {/* Broadcast Card */}
        <Card className="shadow-lg mt-4 p-4" style={{ borderRadius: "15px" }}>
          <h3 className="mb-3 text-center">📣 Broadcast to All Volunteers</h3>
          <Form.Group className="mb-3">
            <Form.Label>Event (Optional)</Form.Label>
            <Form.Select 
              value={broadcastEventId} 
              onChange={(e) => setBroadcastEventId(e.target.value)}
              disabled={loadingEvents}
            >
              <option value="">Select an event (optional)</option>
              {events.map(event => (
                <option key={event.EID} value={event.EID}>
                  {event.Name}
                </option>
              ))}
            </Form.Select>
            {loadingEvents && <small className="text-muted">Loading events...</small>}
            {!loadingEvents && events.length === 0 && <small className="text-danger">No events available</small>}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <InputGroup>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter your broadcast message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          
          <Button
            variant="info"
            className="w-100"
            onClick={handleSendToAllVolunteers}
            disabled={sendingBroadcast}
          >
            {sendingBroadcast ? <Spinner animation="border" size="sm" /> : "📣"} Send to All Volunteers
          </Button>
        </Card>
        
        {/* Individual Volunteer Card */}
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
              <Form.Label>Event (Optional)</Form.Label>
              <Form.Select 
                value={selectedEventId} 
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={loadingEvents}
              >
                <option value="">Select an event (optional)</option>
                {events.map(event => (
                  <option key={event.EID} value={event.EID}>
                    {event.Name}
                  </option>
                ))}
              </Form.Select>
              {loadingEvents && <small className="text-muted">Loading events...</small>}
              {!loadingEvents && events.length === 0 && <small className="text-danger">No events available</small>}
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

            <Button 
              variant="success" 
              className="w-100" 
              onClick={handleSendNotification}
            >
              🚀 Send Notification
            </Button>
          </Card>
        )}
      </Container>
    </Container>
  );
};

export default Notification;