// ProfileVolunteer.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, ListGroup, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";

const ProfileVolunteer = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: "",
    preferences: "",
    availability: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          console.error("No username in localStorage");
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:3001/api/user-profiles/profiles/${username}`
        );
        if (!response.ok) {
          console.error("Failed to fetch profile");
          return;
        }

        const data = await response.json();

        setProfileData({
          username: data.username || "",
          fullName: data.fullName || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills || "",
          preferences: data.preferences || "",
          availability: Array.isArray(data.availability)
            ? data.availability.join(", ")
            : data.availability || ""
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        alert("No username found. Please log in again.");
        return;
      }

      const updatedProfile = {
        ...profileData,
        skills: profileData.skills.split(",").map((s) => s.trim()),
        availability: profileData.availability.split(",").map((a) => a.trim())
      };

      const response = await fetch(
        `http://localhost:3001/api/user-profiles/profiles/${username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        console.error("Failed to update profile");
        alert("Profile update failed. Check the console for more info.");
        return;
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Something went wrong. Please check the console.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
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
      {/* Sidebar */}
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

      {/* Main content */}
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
                <Form onSubmit={(e) => e.preventDefault()}>
                  {/* Full Name */}
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Address 1 */}
                  <Form.Group className="mb-3">
                    <Form.Label>Address 1</Form.Label>
                    <Form.Control
                      type="text"
                      name="address1"
                      value={profileData.address1}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Address 2 */}
                  <Form.Group className="mb-3">
                    <Form.Label>Address 2</Form.Label>
                    <Form.Control
                      type="text"
                      name="address2"
                      value={profileData.address2}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* City */}
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* State */}
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Zip Code */}
                  <Form.Group className="mb-3">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip"
                      value={profileData.zip}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Skills */}
                  <Form.Group className="mb-3">
                    <Form.Label>Skills (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Preferences */}
                  <Form.Group className="mb-3">
                    <Form.Label>Preferences</Form.Label>
                    <Form.Control
                      type="text"
                      name="preferences"
                      value={profileData.preferences}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Availability */}
                  <Form.Group className="mb-3">
                    <Form.Label>Availability (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      name="availability"
                      value={profileData.availability}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Save Button */}
                  <Button variant="success" onClick={handleSave} className="w-100">
                    Save Profile
                  </Button>
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
