// NavigationBar.js
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <Navbar expand="lg" fixed="top" className="bg-transparent py-3">
      <Container className="d-flex justify-content-center">
        <Navbar.Brand className="text-white fw-bold fs-2">
          ImpactNow
        </Navbar.Brand>
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
  );
};

export default NavigationBar;

