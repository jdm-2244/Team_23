import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const NewAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    organizationName: "",
    organizationWebsite: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phoneNumber: "",
    eventTypes: [],
    volunteerSkillsNeeded: [],
    eventFrequency: "",
    estimatedVolunteers: "",
    additionalNotes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admin profile submitted:", formData);
  };

  return (
    <Container
      fluid
      className="p-0"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Navbar */}
      <Navbar
        expand="lg"
        fixed="top"
        className="bg-transparent py-3"
        style={{ position: "absolute", zIndex: 1000, width: "100%" }}
      >
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

      {/* New Admin Profile Form */}
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", paddingTop: "100px" }}>
        <Row className="shadow-lg rounded bg-white p-4 w-75" style={{ maxWidth: "600px" }}>
          <Col>
            <h2 className="text-center fw-bold mb-4">Email Verified! Complete Your Admin Profile</h2>

            <Form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control type="text" name="fullName" placeholder="Enter full name" maxLength="50" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Organization Name *</Form.Label>
                <Form.Control type="text" name="organizationName" placeholder="Enter organization name" maxLength="100" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Organization Website (Optional)</Form.Label>
                <Form.Control type="url" name="organizationWebsite" placeholder="Enter website URL" onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number *</Form.Label>
                <Form.Control type="tel" name="phoneNumber" placeholder="Enter phone number" required onChange={handleChange} />
              </Form.Group>

              {/* Address Fields */}
              <Form.Group className="mb-3">
                <Form.Label>Address 1 *</Form.Label>
                <Form.Control type="text" name="address1" placeholder="Enter address" maxLength="100" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address 2 (Optional)</Form.Label>
                <Form.Control type="text" name="address2" placeholder="Enter address" maxLength="100" onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control type="text" name="city" placeholder="Enter city" maxLength="100" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>State *</Form.Label>
                <Form.Select name="state" required onChange={handleChange}>
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Zip Code *</Form.Label>
                <Form.Control type="text" name="zip" placeholder="Enter zip code" maxLength="9" required onChange={handleChange} />
              </Form.Group>

              {/* Event & Volunteer Preferences */}
              <Form.Group className="mb-3">
                <Form.Label>Event Types *</Form.Label>
                <Form.Select multiple name="eventTypes" required onChange={handleChange}>
                  <option value="Tutoring">Tutoring</option>
                  <option value="Environmental Cleanup">Environmental Cleanup</option>
                  <option value="Photography">Photography</option>
                  <option value="Shelter Assistance">Shelter Assistance</option>
                  <option value="Food Bank & Meal Preparation">Food Bank & Meal Preparation</option>
                  <option value="Elderly Assistance">Elderly Assistance</option>
                  <option value="Disaster Relief Support">Disaster Relief Support</option>
                  <option value="Blood Drive">Blood Drive</option>
                  <option value="Clothing & Donation Sorting">Clothing & Donation Sorting</option>
                  <option value="Library & Literacy Assistance">Library & Literacy Assistance</option>
                  <option value="Disability Support">Disability Support</option>
                  <option value="Sports Coaching">Sports Coaching</option>
                  <option value="Language Translation">Language Translation</option>
                </Form.Select>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">Submit Profile</Button>
            </Form>

            <p className="mt-3 text-center text-muted">Fields marked with * are required.</p>
          </Col>
        </Row>
      </Container>

      <footer className="text-center p-3 text-white mt-auto" style={{ background: "transparent" }}>
        <p>&copy; 2025 ImpactNow. All Rights Reserved.</p>
      </footer>
    </Container>
  );
};

export default NewAdmin;