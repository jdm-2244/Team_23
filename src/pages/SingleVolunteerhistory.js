import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import axios from 'axios';

const VolunteerHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [volunteerRecords, setVolunteerRecords] = useState([]);
  
  // Get current username from localStorage or session
  // Replace this with how you currently store the logged-in user
  const getCurrentUsername = () => {
    return localStorage.getItem('username') || sessionStorage.getItem('username'); 
  };
  
  // Initial data loading
  useEffect(() => {
    const fetchUserHistory = async () => {
      setLoading(true);
      try {
        const username = getCurrentUsername();
        
        if (!username) {
          // Redirect to login if no username found
          navigate('/login', { state: { from: '/volunteer-history' } });
          return;
        }
        
        // Use the endpoint that fetches only the current user's history
        // Pass username in header if you don't have proper authentication middleware yet
        const response = await axios.get('http://localhost:3001/api/volunteer-history/my-history', {
          headers: {
            'x-username': username // Remove this once proper auth is implemented
          }
        });
        
        setVolunteerRecords(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching your volunteer history:', err);
        setError('Failed to load your volunteer history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [navigate]);

  // Handle filtering
  useEffect(() => {
    if (!searchTerm && !dateFilter) return; // Skip if no filters
    
    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        const username = getCurrentUsername();
        
        // For this demo, we'll refilter the data client-side
        // In a real app, you might want to send these filters to the server
        const response = await axios.get('http://localhost:3001/api/volunteer-history/my-history', {
          params: {
            search: searchTerm,
            date: dateFilter
          },
          headers: {
            'x-username': username // Remove this once proper auth is implemented
          }
        });
        
        setVolunteerRecords(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching filtered data:', err);
        setError('Failed to apply filters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchFilteredData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, dateFilter]);

  // Export a record
  const exportRecord = async (recordId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/volunteer-history/export/${recordId}`);
      alert('Record exported successfully!');
      // For a real app, you'd handle the file download here
    } catch (err) {
      console.error('Error exporting record:', err);
      setError(err.response?.data?.error || 'Failed to export record');
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
      <NavigationBar />
      
      {/* Sidebar with filters */}
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
        <div className="w-100">
          <h5 className="text-center mb-4">Filters</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Search Events</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date Filter</Form.Label>
              <Form.Control
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Form.Group>
          </Form>
        </div>

        <Button
          variant="danger"
          className="w-100 mt-3"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </div>

      {/* Main content */}
      <Container style={{ marginLeft: "250px", padding: "40px" }}>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        
        <Row className="mt-5">
          <Col>
            <Card className="shadow-lg">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h2 className="mb-0">My Volunteer History</h2>
              </Card.Header>
              <Card.Body>
                {loading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                
                {!loading && volunteerRecords.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="lead">You don't have any volunteer history records yet.</p>
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/events')}
                    >
                      Browse Available Events
                    </Button>
                  </div>
                ) : (
                  !loading && (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Location</th>
                          <th>Check In/Out</th>
                          <th>Hours</th>
                          <th>Skills Used</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteerRecords.map((record) => (
                          <tr key={record.id}>
                            <td>
                              <div>{record.eventName}</div>
                              <small className="text-muted">{record.description}</small>
                            </td>
                            <td>{record.eventDate}</td>
                            <td>{record.location}</td>
                            <td>
                              {record.checkInTime} - {record.checkOutTime}
                            </td>
                            <td>{record.hoursServed}</td>
                            <td>
                              {record.skills.map((skill, index) => (
                                <span key={index} className="badge bg-info me-1">
                                  {skill}
                                </span>
                              ))}
                            </td>
                            <td>
                              <span className={`badge ${record.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                                {record.status}
                              </span>
                            </td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-2"
                                onClick={() => navigate(`/event-details/${record.id}`)}
                              >
                                View Details
                              </Button>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => exportRecord(record.id)}
                              >
                                Export
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default VolunteerHistory;