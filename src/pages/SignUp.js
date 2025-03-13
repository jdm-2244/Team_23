import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.role === "") {
      alert("Please select if you are signing up as a Volunteer or Admin.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Form submitted:", formData);
    
    // Navigate based on role
    if (formData.role === "admin") {
      navigate('/admin-dashboard');
    } else if (formData.role === "volunteer") {
      navigate('/dashboard');
    }
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
      <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
        <Container className="d-flex justify-content-center">
          <Navbar.Brand className="text-white fw-bold fs-2" style={{ textShadow: "2px 2px 4px rgba(9, 7, 3, 2)" }}> ImpactNow </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
            <Nav className="fs-5 d-flex gap-3">
              <Nav.Link as={Link} to="/" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/faq" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                FAQ
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                About Us
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                Contact Us
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", paddingTop: "100px" }}>
        <Row className="shadow-lg rounded bg-white p-4 w-75" style={{ maxWidth: "500px" }}>
          <Col>
            <h2 className="text-center fw-bold mb-4">Create an Account</h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control type="email" name="email" placeholder="Enter email" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control type="password" name="password" placeholder="Enter password" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password *</Form.Label>
                <Form.Control type="password" name="confirmPassword" placeholder="Confirm password" required onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Are you registering as a Volunteer or an Admin? *</Form.Label>
                <Form.Select name="role" required onChange={handleChange}>
                  <option value="">Select an option</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              <p className="text-center text-muted">
                After verifying your email, you will be able to complete your profile registration.
              </p>

              <Button variant="primary" type="submit" className="w-100">Sign Up</Button>
            </Form>

            <p className="mt-3 text-center">Already have an account? <a href="/login" className="text-decoration-none">Log in</a></p>
            <p className="text-center text-muted">Fields marked with * are required.</p>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="text-center p-3 text-white" style={{ background: "transparent" }}>
        <p>&copy; 2025 ImpactNow. All Rights Reserved.</p>
        <p>Contact us: support@impactnow.com</p>
      </footer>
    </Container>
  );
};


export default SignUp;