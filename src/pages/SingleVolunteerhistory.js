import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import axios from 'axios';

const VolunteerHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [volunteerRecords, setVolunteerRecords] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, message: "New event added in your area", time: "2 min ago" },
    { id: 2, message: "Profile update successful", time: "1 hour ago" },
    { id: 3, message: "New message from admin", time: "3 hours ago" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    console.log("User logged out");
    navigate("/login");
  };

  // Get current username from localStorage or session
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
        const response = await axios.get('http://localhost:3001/api/single-volunteer-history/my-history', {
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

  // Handle search filtering - client-side approach for simplicity
  const filteredRecords = volunteerRecords.filter(record => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      record.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply date filter (by month and year)
    const matchesDate = !dateFilter || 
      (record.eventDate && record.eventDate.startsWith(dateFilter));
    
    return matchesSearch && matchesDate;
  });

  // Export a record
  const exportRecord = async (recordId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/single-volunteer-history/export/${recordId}`);
      
      // For a real app, you'd handle the file download here
      // For now, just show the data in an alert
      alert(`Record exported successfully!\nCertificate: ${response.data.certificate?.certificateNumber || 'Not available'}`);
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

      {/* Combined Sidebar */}
      <div
        className="bg-dark text-white d-flex flex-column justify-content-between align-items-center rounded shadow-lg"
        style={{
          width: "220px",
          position: "fixed",
          left: "20px",
          top: "120px",
          padding: "20px",
        }}
      >
        {/* Notification Bell */}
        <div className="position-relative w-100 mb-4">
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
              {notifications.length}
            </span>
          </button>

          {/* Dropdown list of notifications */}
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
                  key={notification.id}
                  className="p-3 border-bottom border-secondary"
                  style={{ cursor: 'pointer' }}
                >
                  <p className="mb-1 fs-6">{notification.message}</p>
                  <small className="text-muted">{notification.time}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <ListGroup variant="flush" className="w-100 text-center mb-4">
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/dashboard" className="text-decoration-none text-white fs-6">🏠 Dashboard</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/profile-volunteer" className="text-decoration-none text-white fs-6">👤 Profile</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/eventsearch" className="text-decoration-none text-white fs-6">🔍 Event Search</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2" style={{ whiteSpace: "nowrap" }}>
            <Link to="/history" className="text-decoration-none text-white fs-6">📜 History</Link>
          </ListGroup.Item>
        </ListGroup>

        {/* Filters */}
        <div className="w-100 mb-4">
          <h5 className="text-center mb-3">Filters</h5>
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

        {/* Logout Button */}
        <Button
          variant="danger"
          className="w-100 mt-auto"
          onClick={handleLogout}
        >
          🚪 Log Out
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
                
                {!loading && filteredRecords.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="lead">
                      {volunteerRecords.length === 0 
                        ? "You don't have any volunteer history records yet." 
                        : "No records match your search criteria."}
                    </p>
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/eventsearch')}
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
                          <th>Status</th>
                          <th>Skills</th>
                          <th>Urgency</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.id}>
                            <td>
                              <div className="fw-bold">{record.eventName}</div>
                              <small className="text-muted">{record.description}</small>
                            </td>
                            <td>{record.eventDate}</td>
                            <td>{record.location}</td>
                            <td>
                              <span className={`badge ${record.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                                {record.status}
                              </span>
                            </td>
                            <td>
                              {record.skills && record.skills.map((skill, index) => (
                                <span key={index} className="badge bg-info me-1 mb-1">
                                  {skill}
                                </span>
                              ))}
                            </td>
                            <td>
                              <span className={`badge ${
                                record.urgency === 'High' ? 'bg-danger' : 
                                record.urgency === 'Medium' ? 'bg-warning' : 'bg-secondary'
                              }`}>
                                {record.urgency}
                              </span>
                            </td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-2 mb-1"
                                onClick={() => navigate(`/event-details/${record.id}`)}
                              >
                                Details
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