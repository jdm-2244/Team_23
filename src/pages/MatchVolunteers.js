import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import Sidebar from './Admin_sidebar';
import NavigationBar from './NavigationBar';
const MatchVolunteers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('username');
  const [searchResults, setSearchResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
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

  // Debounce function to limit API calls while typing
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Live search function with validation
  const performLiveSearch = useCallback(async (term, type) => {
    if (!term || term.length < 1) {
      setSuggestions([]);
      return;
    }

    // Format the search term based on search type
    let formattedTerm = term.trim();
    
    // Basic validation based on search type
    switch(type) {
      case 'email':
        // For email, require at least '@' to start searching
        if (!formattedTerm.includes('@')) {
          return;
        }
        break;
        
      case 'phone':
        // For phone, ensure there's at least one digit
        if (!/\d/.test(formattedTerm)) {
          return;
        }
        formattedTerm = formattedTerm.replace(/\D/g, '');
        break;
    }

    try {
      const response = await fetch(
        `/pages/match-volunteers/volunteers/suggestions?type=${type}&term=${encodeURIComponent(formattedTerm)}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Create debounced version of the search
  const debouncedSearch = useCallback(
    debounce((term, type) => performLiveSearch(term, type), 300),
    [performLiveSearch]
  );

  // Effect to trigger live search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm, searchType);
  }, [searchTerm, searchType, debouncedSearch]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    // Live search is triggered by the useEffect above
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.displayValue);
    setSuggestions([]);
    handleSearch(null, suggestion.username);
  };

  const handleSearch = async (e, selectedUsername = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions([]);
    
    // If no search term and no selected username, show error
    if (!selectedUsername && !searchTerm.trim()) {
      setError("Please enter a search term");
      setLoading(false);
      return;
    }
    
    // Format the search term based on search type
    let formattedTerm = selectedUsername || searchTerm.trim();
    let searchTypeToUse = selectedUsername ? 'username' : searchType;
    
    // Validate and format based on search type (only if not using a selected username)
    if (!selectedUsername) {
      switch(searchType) {
        case 'email':
          // Simple email validation
          if (!formattedTerm.includes('@') || !formattedTerm.includes('.')) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
          }
          break;
          
        case 'phone':
          // Remove non-numeric characters for phone
          formattedTerm = formattedTerm.replace(/\D/g, '');
          if (formattedTerm.length < 10) {
            setError("Please enter a valid phone number");
            setLoading(false);
            return;
          }
          break;
          
        case 'name':
          // Ensure name is properly formatted (at least 2 characters)
          if (formattedTerm.length < 2) {
            setError("Name must be at least 2 characters");
            setLoading(false);
            return;
          }
          break;
          
        case 'username':
          // Ensure username has no spaces
          if (formattedTerm.includes(' ')) {
            setError("Username should not contain spaces");
            setLoading(false);
            return;
          }
          break;
      }
    }
    
    console.log(`Searching with type: ${searchTypeToUse}, term: ${formattedTerm}`);
  
    try {
      // First search for the volunteer
      const volunteerResponse = await fetch(
        `/pages/match-volunteers/volunteers/search?type=${searchTypeToUse}&term=${encodeURIComponent(formattedTerm)}`, 
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
      handleSearch(null, searchResults.username);
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
      <NavigationBar />

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
                          <option value="name">Name</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Search Term</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type="text"
                            placeholder="Enter search term..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            autoComplete="off"
                          />
                          {suggestions.length > 0 && (
                            <div className="position-absolute w-100 mt-1 shadow-lg" style={{ zIndex: 1000 }}>
                              <Card>
                                <Card.Body className="p-0">
                                  <ul className="list-group list-group-flush">
                                    {suggestions.map((suggestion, index) => (
                                      <li 
                                        key={index} 
                                        className="list-group-item list-group-item-action" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                      >
                                        {suggestion.displayValue}
                                      </li>
                                    ))}
                                  </ul>
                                </Card.Body>
                              </Card>
                            </div>
                          )}
                        </div>
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