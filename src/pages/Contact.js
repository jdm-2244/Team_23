import React from 'react';
import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
     <Container
          fluid
          className="p-0"
          style={{
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            minHeight: "100vh",
            display: "flex",
          }}
        >
      <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
        <Container className="d-flex justify-content-center">
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

      <div className="d-flex flex-grow-1 align-items-center justify-content-center">
        <Row className="shadow-lg rounded w-75 bg-white p-5 text-center" style={{ maxWidth: '800px' }}>
          <Col>
            <h2 className="mb-4 fw-bold text-black">Contact Us</h2>
            <p className="text-black">
              We’d love to hear from you! You can reach us through the following methods:
            </p>
            <p className="text-black">
              📧 <strong>Email:</strong> <a href="mailto:support@impactnow.com" className="text-decoration-none">support@impactnow.com</a>
            </p>
            <p className="text-black">
              📞 <strong>Phone:</strong> <a href="tel:1234567890" className="text-decoration-none">123-456-7890</a>
            </p>
            <p className="text-black">
              📍 <strong>Mailing Address:</strong> <br />
              12345 Main Street <br />
              Houston, TX 77077
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

export default Contact;