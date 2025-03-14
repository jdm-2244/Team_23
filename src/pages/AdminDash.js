import React, { useState } from "react";
import { Container, Navbar, Nav, Row, Col, ListGroup, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from './NavigationBar';
import Sidebar from './Admin_sidebar';
const AdminDash = () => {
  const firstName = "Admin"; 
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const handleCreateEvent = () => {
    const newEvent = {
      name: `Event ${events.length + 1}`,
      location: "TBD",
      date: "TBD",
    };
    setEvents([...events, newEvent]); 
  };

  const handleLogout = () => {
    console.log("Admin logged out"); 
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
       <Sidebar />

      <NavigationBar />
      
        <Row className="mt-5">
          <Col>
            <h2 className="text-white">Welcome back, {firstName}!</h2>

            {events.length === 0 ? (
              <p className="text-white">
                You haven't created any events yet. To get started, select <strong>"Create a New Event"</strong> from the sidebar.
              </p>
            ) : (
              <p className="text-white">Here are the events you have created:</p>
            )}
          </Col>
        </Row>

        <Row>
          {events.map((event, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>{event.name}</Card.Title>
                  <Card.Text>
                    📍 {event.location} <br />
                    📅 {event.date}
                  </Card.Text>
                  <Button variant="success" className="w-100">Edit Event</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    
  );
};

export default AdminDash;