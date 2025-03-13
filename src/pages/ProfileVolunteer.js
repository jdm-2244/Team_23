import React, { useState } from "react";
import { Container, Row, Col, Form, Button, ListGroup, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";

const ProfileVolunteer = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    address: "1234 Elm Street",
    city: "Houston",
    state: "Texas",
    zip: "77001",
    skills: "Teaching, Writing, Coding",
    timeAvailability: "Weekends and Evenings",
    email: "johndoe@example.com",
    password: "Password123!",
    role: "Volunteer"
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = () => {
    alert("Profile updated successfully");
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <Container
      fluid
      className="p-0"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex"
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
          padding: "20px"
        }}
      >
        <ListGroup variant="flush" className="w-100 text-center">
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/dashboard" className="text-decoration-none text-white fs-6">🏠 Dashboard</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/profile-volunteer" className="text-decoration-none text-white fs-6">👤 Profile</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/eventsearch" className="text-decoration-none text-white fs-6">🔍 Event Search</Link>
          </ListGroup.Item>
          <ListGroup.Item className="bg-dark text-white border-0 py-2">
            <Link to="/history" className="text-decoration-none text-white fs-6">📜 History</Link>
          </ListGroup.Item>
        </ListGroup>
        <Button
          variant="danger"
          className="w-100 mt-3"
          onClick={handleLogout}
          style={{
            border: "none",
            padding: "10px 0",
            fontSize: "16px"
          }}
        >
          🚪 Log Out
        </Button>
      </div>
      <Container style={{ marginLeft: "220px", padding: "40px" }}>
        <NavigationBar />
        <Row className="mt-5">
          <Col>
            <h2 className="text-white">Your Profile</h2>
            <p className="text-white">Edit your information below.</p>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-4">
            <Card className="shadow-lg">
              <Card.Body>
                <Form onSubmit={e => e.preventDefault()}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Zip Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip"
                      value={profileData.zip}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Skills</Form.Label>
                    <Form.Control
                      type="text"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Availability</Form.Label>
                    <Form.Control
                      type="text"
                      name="timeAvailability"
                      value={profileData.timeAvailability}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={profileData.password}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                      type="text"
                      name="role"
                      value={profileData.role}
                      readOnly
                    />
                  </Form.Group>
                  <Button variant="success" onClick={handleSave} className="w-100">Save Profile</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ProfileVolunteer;
