import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './NavigationBar';

const VolunteerHistory = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [volunteerRecords, setVolunteerRecords] = useState([]);

  const validateRecord = (record) => {
    const errors = [];
    
    if (!record.volunteerName) errors.push("Volunteer name is required");
    if (!record.eventName) errors.push("Event name is required");
    if (!record.eventDate) errors.push("Event date is required");
    if (!record.status) errors.push("Status is required");
    
    if (record.volunteerName?.length > 100) {
      errors.push("Volunteer name must be less than 100 characters");
    }
    if (record.eventName?.length > 100) {
      errors.push("Event name must be less than 100 characters");
    }
    if (record.description?.length > 500) {
      errors.push("Description must be less than 500 characters");
    }
    
    if (record.hoursServed && isNaN(record.hoursServed)) {
      errors.push("Hours served must be a number");
    }
    if (record.maxVolunteers && isNaN(record.maxVolunteers)) {
      errors.push("Max volunteers must be a number");
    }
    
    if (record.eventDate && !isValidDate(record.eventDate)) {
      errors.push("Invalid event date");
    }
    
    return errors;
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/volunteer-history');
        if (!response.ok) {
          throw new Error('Failed to fetch volunteer history');
        }
        const data = await response.json();
        setVolunteerRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = volunteerRecords.filter((record) => {
    const matchesSearch =
      searchTerm === '' ||
      record.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.eventName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      dateFilter === '' || record.eventDate.startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const exportRecord = (recordId) => {
    const record = volunteerRecords.find((r) => r.id === recordId);
    if (!record) {
      setError('Record not found');
      return;
    }

    const validationErrors = validateRecord(record);
    if (validationErrors.length > 0) {
      setError(`Cannot export invalid record: ${validationErrors.join(', ')}`);
      return;
    }

    console.log('Exporting record:', record);
  };

  const handleDownload = async (type) => {
    const endpoint = type === 'csv' ? '/api/reports/csv' : '/api/reports/pdf';
    const response = await axios.get(`http://localhost:3001${endpoint}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report.${type}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  if (loading) {
    return <div>Loading Volunteer History...</div>;
  }

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
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search volunteers or events..."
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
          onClick={() => navigate('/admin-dashboard')}
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
                <h2 className="mb-0">Volunteer History</h2>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-light" size="sm">
                    Export All Records
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleDownload('csv')}>
                      Download CSV
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDownload('pdf')}>
                      Download PDF
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => { handleDownload('csv'); handleDownload('pdf'); }}>
                      Download All
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Volunteer Name</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Check In/Out</th>
                      <th>Hours</th>
                      <th>Skills Used</th>
                      <th>Status</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.volunteerName}</td>
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
                          <span
                            className={`badge ${
                              record.status === 'Completed' ? 'bg-success' : 'bg-warning'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td>{record.role}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/volunteer-details/${record.id}`)}
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default VolunteerHistory;
