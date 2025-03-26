import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    message: "",
    isValid: false,
    color: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength when password field changes
    if (name === "password") {
      validatePasswordStrength(value);
    }
  };

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length === 0) {
      setPasswordStrength({
        message: "",
        isValid: false,
        color: "",
      });
    } else if (password.length < minLength) {
      setPasswordStrength({
        message: "Password is too short (minimum 8 characters)",
        isValid: false,
        color: "text-danger",
      });
    } else if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setPasswordStrength({
        message:
          "Password should include uppercase, lowercase, numbers, and special characters",
        isValid: false,
        color: "text-warning",
      });
    } else {
      setPasswordStrength({
        message: "Password strength: Strong",
        isValid: true,
        color: "text-success",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (formData.role === "") {
      setError("Please select if you are signing up as a Volunteer or Admin.");
      return;
    }
    
    if (!passwordStrength.isValid) {
      setError("Please create a stronger password.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please check your email to verify your account.");
        navigate("/login");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container fluid className="p-0" style={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", minHeight: "100vh", position: "relative" }}>
      <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
        <Container className="d-flex justify-content-center">
          <Navbar.Brand className="text-white fw-bold fs-2" style={{ textShadow: "2px 2px 4px rgba(9, 7, 3, 2)" }}>
            ImpactNow
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
            <Nav className="fs-5 d-flex gap-3">
              <Nav.Link as={Link} to="/" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/faq" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                FAQ
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                About Us
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" className="text-white px-4 py-2 rounded-pill border border-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
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

            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username *</Form.Label>
                <Form.Control 
                  type="text" 
                  name="username" 
                  placeholder="Enter username" 
                  required 
                  onChange={handleChange}
                  value={formData.username} 
                />
                <Form.Text className="text-muted">
                  You will use your username to log in.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  placeholder="Enter email" 
                  required 
                  onChange={handleChange}
                  value={formData.email} 
                />
                <Form.Text className="text-muted">
                  We'll send a verification link to this email.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control 
                  type="password" 
                  name="password" 
                  placeholder="Enter password" 
                  required 
                  onChange={handleChange}
                  value={formData.password} 
                />
                {passwordStrength.message && (
                  <Form.Text className={passwordStrength.color}>
                    {passwordStrength.message}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password *</Form.Label>
                <Form.Control 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Confirm password" 
                  required 
                  onChange={handleChange}
                  value={formData.confirmPassword} 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Are you registering as a Volunteer or an Admin? *</Form.Label>
                <Form.Select 
                  name="role" 
                  required 
                  onChange={handleChange}
                  value={formData.role}
                >
                  <option value="">Select an option</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              <p className="text-center text-muted">After verifying your email, you will be able to complete your profile registration.</p>

              <Button variant="primary" type="submit" className="w-100">
                Sign Up
              </Button>
            </Form>

            <p className="mt-3 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none">
                Log in
              </Link>
            </p>
            <p className="text-center text-muted">Fields marked with * are required.</p>
          </Col>
        </Row>
      </Container>

      <footer className="text-center p-3 text-white" style={{ background: "transparent" }}>
        <p>© 2025 ImpactNow. All Rights Reserved.</p>
        <p>Contact us: support@impactnow.com</p>
      </footer>
    </Container>
  );
};

export default SignUp;