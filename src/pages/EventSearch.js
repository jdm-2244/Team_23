import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Row, Col, Button, Card, Form, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios"; // Make sure axios is installed

const LeftSidebar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch real notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/notifications');
        if (response.data) {
          setNotifications(response.data);
          setNotificationCount(response.data.length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to mock data if API fails
        setNotifications([
          { id: 1, message: "New event added in your area", time: "2 min ago" },
          { id: 2, message: "Profile update successful", time: "1 hour ago" },
          { id: 3, message: "New message from admin", time: "3 hours ago" }
        ]);
        setNotificationCount(3);
      }
    };

    fetchNotifications();
  }, []);

  return (
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
      {/* Notification Bell */}
      <div className="position-relative w-100 mb-3">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-dark border-0 text-white p-2 w-100 d-flex align-items-center justify-content-center position-relative"
          style={{ cursor: 'pointer' }}
        >
          🔔
          <span 
            className="position-absolute bg-danger rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: '20px', 
              height: '20px', 
              top: '0', 
              right: '40px',
              fontSize: '12px'
            }}
          >
            {notificationCount}
          </span>
        </button>
        {showNotifications && (
          <div 
            className="position-absolute bg-dark rounded shadow-lg"
            style={{
              width: '175px',
              left: '0',
              top: '100%',
              zIndex: 1000
            }}
          >
            {notifications.map(notification => (
              <div 
                key={notification.id || notification.Noti_id} 
                className="p-3 border-bottom border-secondary"
                style={{ cursor: 'pointer' }}
              >
                <p className="mb-1 fs-6">{notification.message}</p>
                <small className="text-muted">{notification.time || notification.sent_at}</small>
              </div>
            ))}
          </div>
        )}
      </div>
      <ListGroup variant="flush" className="w-100 text-center">
        <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
          <Link to="/dashboard" className="text-decoration-none text-white fs-6">🏠 Dashboard</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
          <Link to="/newuser" className="text-decoration-none text-white fs-6">👤 Profile</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
          <Link to="/eventsearch" className="text-decoration-none text-white fs-6">🔍 Event Search</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
          <Link to="/history" className="text-decoration-none text-white fs-6">📜 History</Link>
        </ListGroup.Item>
      </ListGroup>
      <Button
        variant="danger"
        className="w-100 mt-3"
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
  );
};

const EventSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For pagination
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Fetch all events on initial load
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:3001/api/event-search?page=${page}&limit=6`);
        if (response.data && response.data.events) {
          setSearchResults(response.data.events);
          setHasNextPage(response.data.pagination.hasNextPage);
          setHasPrevPage(response.data.pagination.hasPrevPage);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:3001/api/event-search/search', {
        params: {
          searchType,
          searchTerm
        }
      });
      
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching events:', err);
      setError('Error searching events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (eventId) => {
    try {
      // Get the current user - this should come from your auth system
      // For now, we'll just use a placeholder
      const username = localStorage.getItem('username') || 'john_doe'; // Replace with actual auth
      
      const response = await axios.post('http://localhost:3001/api/event-search/signup', {
        eventId,
        username
      });
      
      // Update the event in the list to reflect the signup
      if (response.data && searchResults) {
        const updatedResults = searchResults.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              slotsRemaining: event.slotsRemaining - 1
            };
          }
          return event;
        });
        
        setSearchResults(updatedResults);
        
        // Show success message (you could use a toast/alert component)
        alert('Successfully signed up for event!');
      }
    } catch (err) {
      console.error('Error signing up:', err);
      alert(err.response?.data?.error || 'Failed to sign up for event');
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
      <LeftSidebar />
      {/* Transparent Navbar */}
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
                          <option value="skill">Required Skill</option>
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

        {error && (
          <Row className="mb-4">
            <Col>
              <div className="alert alert-danger">{error}</div>
            </Col>
          </Row>
        )}

        {searchResults && (
          <>
            <Row>
              {searchResults.length === 0 ? (
                <Col>
                  <div className="alert alert-info">No events found matching your search criteria.</div>
                </Col>
              ) : (
                searchResults.map((event) => (
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
                          {event.skills && event.skills.length > 0 && (
                            <p className="mb-2">
                              <span className="me-2">🔧</span>
                              {event.skills.join(', ')}
                            </p>
                          )}
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
                          onClick={() => handleSignUp(event.id)}
                        >
                          {event.slotsRemaining > 0 ? 'Sign Up' : 'Full'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
            
            {/* Pagination controls */}
            {(hasPrevPage || hasNextPage) && (
              <Row className="mt-4 mb-5">
                <Col className="d-flex justify-content-center">
                  <Button 
                    variant="outline-light" 
                    className="me-2"
                    disabled={!hasPrevPage}
                    onClick={() => setPage(prev => prev - 1)}
                  >
                    &laquo; Previous
                  </Button>
                  <Button 
                    variant="outline-light"
                    disabled={!hasNextPage}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next &raquo;
                  </Button>
                </Col>
              </Row>
            )}
          </>
        )}
      </Container>
    </Container>
  );
};

export default EventSearch;