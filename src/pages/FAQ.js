import React from "react";
import { Container, Row, Col, Accordion, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const FAQ = () => {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-between p-0"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
      }}
    >
      {/* Navbar - Same Style as Contact.js & AboutUs.js */}
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

      {/* FAQ Section - Centered Content */}
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", paddingTop: "100px" }}>
        <Row className="shadow-lg rounded bg-white p-4 w-75" style={{ maxWidth: "800px" }}>
          <Col>
            <h2 className="text-center fw-bold mb-4">Frequently Asked Questions</h2>

            {/* Volunteers FAQ */}
            <h3 className="fw-bold text-center mt-4">For Volunteers</h3>
            <Accordion className="mb-4">
              {[
                "How do I sign up as a volunteer?",
                "Do I need to verify my email before I can start volunteering?",
                "How do I find volunteer opportunities near me?",
                "Can I volunteer for multiple events?",
                "How do I update my profile if my skills or availability change?",
                "Will I get notified about upcoming events?",
                "What if I can no longer attend an event I signed up for?",
                "Can I volunteer remotely?",
                "Will my past volunteer work be recorded?",
                "How do I contact event organizers if I have questions?",
              ].map((question, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>{question}</Accordion.Header>
                  <Accordion.Body>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            {/* Admins FAQ */}
            <h3 className="fw-bold text-center mt-4">For Admins</h3>
            <Accordion>
              {[
                "How do I register as an admin?",
                "How do I create an event?",
                "Can I specify the skills needed for an event?",
                "How do I manage volunteer assignments?",
                "Can I send notifications to volunteers?",
                "What happens if an event is full?",
                "Can I edit or cancel an event after posting it?",
                "How do I track volunteer participation?",
                "Can I post private events for a specific group?",
                "How do I contact a volunteer?",
              ].map((question, index) => (
                <Accordion.Item eventKey={(index + 10).toString()} key={index}>
                  <Accordion.Header>{question}</Accordion.Header>
                  <Accordion.Body>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>

      {/* Footer - Same as Other Pages */}
      <footer className="text-center p-3 text-white mt-auto" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
        <p>&copy; 2025 ImpactNow. All Rights Reserved.</p>
        <p>Contact us: support@impactnow.com</p>
      </footer>
    </Container>
  );
};

export default FAQ;