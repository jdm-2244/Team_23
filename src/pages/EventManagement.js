// Start with pulling react and useState for state management
import React, { useState } from "react"; 
// Importing Bootstrap components for our UI
import { Container, Form, Button, Row, Col, Navbar, Nav, Dropdown, DropdownButton } from "react-bootstrap"; 
// Data picker used for selecting event date
import DatePicker from "react-multi-date-picker";
// Import link for nagivation hook and link for navigation
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const EventManagement = () => {
  const navigate = useNavigate();
  const [charCount, setCharCount] = useState(100); // This will be used to track the character count in event name
  // This will be used for managing the form inputs 
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

  // List of the avaiable skills for selection
  const skillsList = [
    "Tutoring",
    "Career Coaching",
    "Event Setup",
    "Public Speaking",
    "First Aid Support",
    "Blood Drive Assistance",
    "Time Management",
    "Organization",
    "Multitasking",
    "Logistics Coordination",
    "Website Development",
    "Animal Care",
    "Carpentry & Building",
    "Database Management",
  ];

  // This will handle in form input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // This will handle multi-select dropdown selections
  const handleSkillSelect = (skill) => {
    let updatedSkills = [...formData.requiredSkills];

    if (updatedSkills.includes(skill)) {
      updatedSkills = updatedSkills.filter((s) => s !== skill);
    } else {
      updatedSkills.push(skill);
    }

    setFormData({ ...formData, requiredSkills: updatedSkills });
  };

  // Used to handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault(); //Prevent the page reload on form

    // Validation check for the required fields on event form
    if (!formData.eventName || 
        !formData.eventDescription || 
        !formData.location || 
        !formData.urgency || 
        !formData.eventDate || 
        formData.requiredSkills.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }
    // Display success message on completion of event 
    alert("Event successfully created!");

    // Reset the form after submission of event.
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
  };

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh", background: "linear-gradient(to right, #6a11cb, #2575fc)" }}>
      {/* Navgationbar Section*/}
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

      {/* The Event Form */}
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", paddingTop: "100px" }}>
        <Row className="shadow-lg rounded bg-white p-4 w-75" style={{ maxWidth: "500px" }}>
          <Col>
            <h2 className="text-center fw-bold mb-4">Create a New Event</h2>

            <Form onSubmit={handleSubmit}>
              {/* Event Name */}
              <Form.Group className="mb-3">
                <Form.Label>Event Name * <span>({charCount} characters left)</span></Form.Label>
                <Form.Control type="text" name="eventName" placeholder="Enter event name" maxLength="100" required onChange={(e) => {
                  handleChange(e);
                  setCharCount(100 - e.target.value.length);
                }} />
              </Form.Group>
              {/*Used to type in the events description */}
              <Form.Group className="mb-3">
                <Form.Label>Event Description *</Form.Label>
                <Form.Control as="textarea" name="eventDescription" placeholder="Describe the event" rows={3} required onChange={handleChange} />
              </Form.Group>
              {/*Used to enter the location of event*/}
              <Form.Group className="mb-3">
                <Form.Label>Location *</Form.Label>
                <Form.Control as="textarea" name="location" placeholder="Enter event location" rows={2} required onChange={handleChange} />
              </Form.Group>

              {/* Used for required skills dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Required Skills *</Form.Label>
                <DropdownButton id="skills-dropdown" title="Select Skills">
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {skillsList.map((skill, index) => (
                      <Dropdown.Item key={index} onClick={() => handleSkillSelect(skill)}>
                        <Form.Check 
                          type="checkbox"
                          label={skill}
                          checked={formData.requiredSkills.includes(skill)}
                          onChange={() => {}}
                        />
                      </Dropdown.Item>
                    ))}
                  </div>
                </DropdownButton>

                {/* Display the selected skills */}
                <div className="mt-2">
                  <strong>Selected Skills:</strong> {formData.requiredSkills.length > 0 ? formData.requiredSkills.join(", ") : "None selected"}
                </div>
              </Form.Group>
              {/*Input for urgency level */}
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
              {/*Input for maximum volunteers */}
              <Form.Group className="mb-3">
                <Form.Label>Max Volunteers *</Form.Label>
                <Form.Control type="number" name="maxVolunteers" min="1" max="500" required onChange={handleChange} />
              </Form.Group>
              {/* Button used for submission*/}
              <Button variant="primary" type="submit" className="w-100">Create Event</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default EventManagement;