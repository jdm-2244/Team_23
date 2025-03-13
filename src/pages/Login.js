import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-between p-0"
      style={{
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        minHeight: '100vh',
      }}
    >
      {/* Navbar */}
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

      {/* Login Form Section */}
      <div className="d-flex flex-grow-1 align-items-center justify-content-center">
        <Row 
          className="shadow-lg rounded w-75 bg-white overflow-hidden" 
          style={{ maxWidth: '1000px' }}
        >
          {/* Image Section */}
          <Col md={6} className="d-none d-md-block position-relative p-0">
            <div
              style={{
                backgroundImage: "url('/images/1654793377068.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            ></div>
            
            <div
              className="position-absolute text-white text-center p-4"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: '100%',
                bottom: '0',
              }}
            >
              <h3 className="fw-bold">Make a Difference</h3>
              <p>Join our community of volunteers and create positive change.</p>
            </div>
          </Col>

          {/* Login Form Section */}
          <Col md={6} className="p-5 bg-white">
            <h2 className="mb-3 text-center fw-bold">Welcome Back</h2>
            <p className="text-center text-muted">Please sign in to your account</p>
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter your password" />
              </Form.Group>

              <Form.Group className="d-flex justify-content-between mb-3">
                <Form.Check type="checkbox" label="Remember me" />
                <a href="#" className="text-decoration-none">Forgot password?</a>
              </Form.Group>

              <Button variant="primary" className="w-100">Sign In</Button>
            </Form>

            <p className="mt-3 text-center">
              Don't have an account?{' '}
              <span 
                onClick={() => navigate('/signup')} 
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              >
                Sign up now
              </span>
            </p>
          </Col>
        </Row>
      </div>

      {/* Centered Footer */}
      <footer className="text-center p-3 text-white mt-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <p>&copy; 2025 ImpactNow. All Rights Reserved.</p>
        <p>Contact us: support@impactnow.com</p>
      </footer>
    </Container>
  );
};

export default Login;