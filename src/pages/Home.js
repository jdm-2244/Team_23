import React from 'react';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex flex-column p-0"
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

      <div className="d-flex flex-grow-1 align-items-center justify-content-center text-center text-white" 
        style={{
          backgroundImage: "url('/images/Garden-Volunteer-scaled (1).jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Dark Overlay */}
        <div className="position-absolute w-100 h-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>

        <Col md={8} className="position-relative">
          <h1 className="fw-bold display-4">Make a difference in your community today.</h1>
          <p className="lead">Join now or log back in to see events near you!</p>
          <Button variant="success" onClick={() => navigate('/signup')} className="m-2 px-4 py-2">
            Join Now
          </Button>
          <Button variant="success" onClick={() => navigate('/login')} className="m-2 px-4 py-2">
            Log In
          </Button>
        </Col>
      </div>

      {/* Centered Footer */}
      <footer className="text-center p-3 text-white mt-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <p>&copy; 2025 ImpactNow. All Rights Reserved.</p>
        <p>Contact us: support@impactnow.com</p>
      </footer>
    </Container>
  );
};

export default Home;