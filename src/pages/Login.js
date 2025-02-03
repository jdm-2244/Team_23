import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

// This component will display a login form along with an image on the left side
const Login = () => {
  return (
    /* This Container will center our content both vertically and horizontally. 
       The `fluid` prop ensures it takes up the full width. */
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        // This line will set the background to a gradient
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
      }}
    >
      {/* This Row will hold both the image on the left and the form on the right. 
          It has a shadow, rounded corners, and a white background. */}
      <Row 
        className="shadow-lg rounded w-75 bg-white overflow-hidden" 
        style={{ maxWidth: '1000px' }}
      >
        
        {/* This section will show the image on the left side. 
            It's hidden on smaller screens (`d-none d-md-block`). */}
        <Col md={6} className="d-none d-md-block position-relative p-0">
          {/* This div will set the background image, covering the entire column. */}
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
          
          {/* This section will create a dark overlay at the bottom with some text. */}
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

        {/* This section will display the login form on the right side. */}
        <Col md={6} className="p-5 bg-white">
          <h2 className="mb-3 text-center fw-bold">Welcome Back</h2>
          <p className="text-center text-muted">Please sign in to your account</p>
          
          {/* This Form will contain fields for email and password. */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter your password" />
            </Form.Group>

            {/* This section will allow the user to check "Remember me" or reset their password. */}
            <Form.Group className="d-flex justify-content-between mb-3">
              <Form.Check type="checkbox" label="Remember me" />
              <a href="#" className="text-decoration-none">Forgot password?</a>
            </Form.Group>

            {/* This line will create the Sign In button that covers the full width */}
            <Button variant="primary" className="w-100">Sign In</Button>
          </Form>

          <p className="mt-3 text-center">
            Don't have an account? <a href="#" className="text-decoration-none">Sign up now</a>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
