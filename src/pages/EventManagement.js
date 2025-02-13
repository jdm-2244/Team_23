import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Navbar, Nav } from "react-bootstrap";
import DatePicker from "react-multi-date-picker";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const EventManagement = () => {
  const navigate = useNavigate();
  const [charCount, setCharCount] = useState(100);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    location: "",
    requiredSkills: [],
    urgency: "",
    eventDate: null,
    maxVolunteers: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    startTime: "",
    endTime: "",
    visibility: "",
  });

// Handle input field changes
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
};

// Handle multi-select dropdown for Required Skills
const handleSkillsChange = (e) => {
  const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
  setFormData({ ...formData, requiredSkills: selectedSkills });
};

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Basic validation
  if (!formData.eventName || 
      !formData.eventDescription || 
      !formData.location || 
      !formData.urgency || 
      !formData.eventDate || 
      formData.requiredSkills.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    // Make the API call
    const response = await fetch('/api/events', {  // Replace with your actual API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert("Event successfully created!");
      setFormData({
        eventName: "",
        eventDescription: "",
        location: "",
        requiredSkills: [],
        urgency: "",
        eventDate: null,
        maxVolunteers: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        startTime: "",
        endTime: "",
        visibility: "",
      });
    } else {
      alert("Failed to create event.");
    }
  } catch (error) {
    console.error("Error submitting event:", error);
    alert("An error occurred while creating the event.");
  }
};

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh", background: "linear-gradient(to right, #6a11cb, #2575fc)" }}>
      {/* Navbar */}
      <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
        <Container>
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

      {/* Event Form */}
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", paddingTop: "100px" }}>
        <Row className="shadow-lg rounded bg-white p-4 w-75" style={{ maxWidth: "500px" }}>
          <Col>
            <h2 className="text-center fw-bold mb-4">Create a New Event</h2>

            <Form onSubmit={handleSubmit}>
              {/* Event Name with Character Counter */}
              <Form.Group className="mb-3">
                <Form.Label>Event Name * <span>({charCount} characters left)</span></Form.Label>
                <Form.Control type="text" name="eventName" placeholder="Enter event name" maxLength="100" required onChange={(e) => {
                  handleChange(e);
                  setCharCount(100 - e.target.value.length);
                }} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Description *</Form.Label>
                <Form.Control as="textarea" name="eventDescription" placeholder="Describe the event" rows={3} required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location *</Form.Label>
                <Form.Control as="textarea" name="location" placeholder="Enter event location" rows={2} required onChange={handleChange} />
              </Form.Group>

              {/* Required Skills with Categories */}
              <Form.Group className="mb-3">
                <Form.Label>Required Skills *</Form.Label>
                <Form.Select multiple name="requiredSkills" required onChange={handleSkillsChange}>
                  <optgroup label="Education">
                    <option value="Tutoring">Tutoring</option>
                    <option value="Career Coaching">Career Coaching</option>
                  </optgroup>
                  <optgroup label="Event Logistics">
                    <option value="Event Setup">Event Setup</option>
                    <option value="Public Speaking">Public Speaking</option>
                  </optgroup>
                  <optgroup label="Healthcare">
                    <option value="First Aid Support">First Aid Support</option>
                    <option value="Blood Drive Assistance">Blood Drive Assistance</option>
                  </optgroup>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Urgency *</Form.Label>
                <Form.Select name="urgency" required onChange={handleChange}>
                  <option value="">Select Urgency</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Date *</Form.Label>
                <DatePicker value={formData.eventDate} onChange={(date) => setFormData({ ...formData, eventDate: date })} format="MM/DD/YYYY" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Maximum Volunteers Needed *</Form.Label>
                <Form.Control type="number" name="maxVolunteers" min="1" max="500" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Start Time *</Form.Label>
                <Form.Control type="time" name="startTime" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Time *</Form.Label>
                <Form.Control type="time" name="endTime" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Visibility *</Form.Label>
                <Form.Select name="visibility" required onChange={handleChange}>
                  <option value="Public">Public (Visible to all volunteers)</option>
                  <option value="Private">Private (Admins must assign volunteers)</option>
                </Form.Select>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">Create Event</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default EventManagement;
