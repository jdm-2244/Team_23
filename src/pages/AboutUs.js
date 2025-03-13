import React from 'react';
import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-between p-0"
      style={{
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        minHeight: '100vh',
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

      <div className="d-flex flex-grow-1 align-items-center justify-content-center">
        <Row className="shadow-lg rounded w-75 bg-white p-5 text-center" style={{ maxWidth: '800px' }}>
          <Col>
            <h2 className="mb-4 fw-bold text-black">Who We Are</h2>
            <p className="text-black">
              We are three passionate developers who believe in the power of community and giving back. 
              Our goal was to create a simple, user-friendly platform that allows volunteers and event organizers 
              to connect effortlessly without the distractions of advertisements or unnecessary complexities.
            </p>
            <p className="text-black">
              ImpactNow was built with one core idea: Making volunteering easier. Whether you're an organization 
              looking for helping hands or an individual eager to make a difference, our platform ensures that 
              opportunities are accessible, clear, and easy to join.
            </p>
            <p className="text-black">
              We designed ImpactNow to be fast, intuitive, and inclusive so that everyone, regardless of technical skills, 
              can navigate and participate effortlessly. With a clean interface, real-time event matching, 
              and direct communication between volunteers and admins, we are dedicated to making the volunteer experience 
              as smooth and impactful as possible.
            </p>
          </Col>
        </Row>
      </div>

      <footer className="text-center p-3 text-white mt-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <p>&copy; 2025 ImpactNow. All Rights Reserved.</p>
        <p>Contact us: <a href="mailto:support@impactnow.com" className="text-decoration-none text-white">support@impactnow.com</a></p>
      </footer>
    </Container>
  );
};

export default AboutUs;
