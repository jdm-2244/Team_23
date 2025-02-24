import React, { useState } from "react";
import { Container, Row, Col, ListGroup, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";

const VolunteerDashboard = () => {
  const firstName = "John";
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: "New event added in your area", time: "2 min ago" },
    { id: 2, message: "Profile update successful", time: "1 hour ago" },
    { id: 3, message: "New message from admin", time: "3 hours ago" }
  ];

  const eventSuggestions = [
    { name: "Park Cleanup", location: "Downtown Park", date: "Feb 10, 2025" },
    { name: "Food Bank Assistance", location: "Houston Food Bank", date: "Feb 15, 2025" },
    { name: "Community Tutoring", location: "Local Library", date: "Feb 20, 2025" },
  ];

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login");
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
              {notifications.length}
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

        <ListGroup variant="flush" className="w-100 text-center">
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
          onClick={handleLogout}
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

      <Container style={{ marginLeft: "220px", padding: "40px" }}>
        <NavigationBar />
        <Row className="mt-5">
          <Col>
            <h2 className="text-white">Welcome back, {firstName}!</h2>
            <p className="text-white">Here are some events near you:</p>
          </Col>
        </Row>
        <Row>
          {eventSuggestions.map((event, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>{event.name}</Card.Title>
                  <Card.Text>
                    📍 {event.location} <br />
                    📅 {event.date}
                  </Card.Text>
                  <Button variant="success" className="w-100">View Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default VolunteerDashboard;