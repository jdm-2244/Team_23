import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import Sidebar from './Admin_sidebar';

const MatchVolunteers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [matchStatus, setMatchStatus] = useState(null);

  // Get auth headers for fetch
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  });

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/pages/match-volunteers/events', {
          method: 'GET',
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const eventsData = await response.json();
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    
    fetchEvents();
  }, []);

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log(`Searching with type: ${searchType}, term: ${searchTerm}`);
  
    try {
      // First search for the volunteer
      const volunteerResponse = await fetch(
        `/pages/match-volunteers/volunteers/search?type=${searchType}&term=${searchTerm}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      if (!volunteerResponse.ok) {
        const errorData = await volunteerResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${volunteerResponse.status}`);
      }
      
      const volunteerData = await volunteerResponse.json();
      
      // Then get their history
      const historyResponse = await fetch(
        `/pages/match-volunteers/volunteers/${volunteerData.username}/history`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      if (!historyResponse.ok) {
        const errorData = await historyResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${historyResponse.status}`);
      }
      
      const historyData = await historyResponse.json();
      
      // Combine the data
      const combinedData = {
        ...volunteerData,
        history: historyData
      };
      
      setSearchResults(combinedData);
    } catch (error) {
      console.error("Error searching for volunteer:", error);
      setError(error.message || "An error occurred while searching for the volunteer.");
    } finally {
      setLoading(false);
    }
  };

  const matchVolunteerToEvent = async () => {
    if (!searchResults || !selectedEvent) {
      setError("Please select both a volunteer and an event");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/pages/match-volunteers/match', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: searchResults.username,
          eventName: selectedEvent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      setMatchStatus({
        success: true,
        message: `Successfully matched ${searchResults.first_name} to ${selectedEvent}`
      });
      
      // Refresh volunteer history
      handleSearch({ preventDefault: () => {} });
    } catch (error) {
      console.error("Error matching volunteer:", error);
      setMatchStatus({
        success: false,
        message: error.message || "Failed to match volunteer to event"
      });
    } finally {
      setLoading(false);
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
                          <option value="name"> Name </option>
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
                    {loading ? 'Searching...' : 'Search Volunteer'}
                  </Button>
                </Form>
                
                {error && (
                  <div className="alert alert-danger mt-3">
                    {error}
                  </div>
                )}
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
                      <p><strong>Name:</strong> {searchResults.first_name} {searchResults.last_name}</p>
                      <p><strong>Username:</strong> {searchResults.username}</p>
                      <p><strong>Email:</strong> {searchResults.email}</p>
                      <p><strong>Phone:</strong> {searchResults.phone_number}</p>
                      <p><strong>Location:</strong> {searchResults.location}</p>
                      <p><strong>Role:</strong> {searchResults.role}</p>
                    </Col>
                    <Col md={6}>
                      <h5>Volunteering History</h5>
                      {searchResults.history && searchResults.history.length > 0 ? (
                        searchResults.history.map((record, index) => (
                          <Card key={index} className="mb-2">
                            <Card.Body>
                              <p className="mb-1"><strong>Event:</strong> {record.eventName}</p>
                              <p className="mb-1"><strong>Date:</strong> {new Date(record.eventDate).toLocaleDateString()}</p>
                              <p className="mb-0">
                                <strong>Status:</strong> 
                                <span className={`text-${record.checkin ? 'success' : 'danger'}`}>
                                  {record.checkin ? ' Checked In' : ' No Show'}
                                </span>
                              </p>
                            </Card.Body>
                          </Card>
                        ))
                      ) : (
                        <p>No volunteering history found.</p>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {searchResults && (
          <Row className="mt-4">
            <Col>
              <Card className="shadow-lg">
                <Card.Body>
                  <h3 className="mb-4">Match to Event</h3>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Event</Form.Label>
                      <Form.Select 
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                      >
                        <option value="">-- Select an Event --</option>
                        {events.map((event, index) => (
                          <option key={index} value={event.name}>
                            {event.name} - {new Date(event.date).toLocaleDateString()}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      onClick={matchVolunteerToEvent} 
                      disabled={loading || !selectedEvent}
                      style={{
                        backgroundColor: "#2575fc",
                        border: "none"
                      }}
                    >
                      {loading ? 'Processing...' : 'Match Volunteer to Event'}
                    </Button>
                  </Form>
                  
                  {matchStatus && (
                    <div className={`alert alert-${matchStatus.success ? 'success' : 'danger'} mt-3`}>
                      {matchStatus.message}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </Container>
  );
};

export default MatchVolunteers;