// Save this as backend/loginRoutes.test.js
const request = require("supertest");
const express = require("express");

// Mock dependencies
jest.mock('./config/database', () => ({
  query: jest.fn()
}));
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue({})
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mocked-hash'),
  compare: jest.fn().mockResolvedValue(true)
}));
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-token')
  })
}));

// Get the mocked modules
const pool = require('./config/database');
const loginRoutes = require("./loginRoutes");

// Create Express app with routes
const app = express();
app.use(express.json());
app.use("/api", loginRoutes);

// Test suite
describe("Login Routes Basic Tests", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test GET /api/users
  test("GET /api/users - success case", async () => {
    // Mock the database response
    const mockUsers = [
      { username: "user1", email: "user1@example.com" },
      { username: "user2", email: "user2@example.com" }
    ];
    pool.query.mockResolvedValueOnce([mockUsers]);

    // Make the request
    const response = await request(app).get("/api/users");
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM Users");
  });

  // Test GET /api/users database error
  test("GET /api/users - database error", async () => {
    // Mock database error
    pool.query.mockRejectedValueOnce(new Error("Database connection error"));

    // Make the request
    const response = await request(app).get("/api/users");
    
    // Assertions
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Database error");
  });

  // Test POST /api/login with valid credentials
  test("POST /api/login - valid credentials", async () => {
    // Mock database responses
    const mockUser = {
      username: "testuser", 
      passwords: "$2b$10$hashedpassword", 
      email: "test@example.com",
      role: "user",
      isVerified: 1
    };
    pool.query.mockResolvedValueOnce([[mockUser]]);  // User found
    pool.query.mockResolvedValueOnce([[{ user_id: "testuser" }]]);  // Profile found

    // Make login request
    const response = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "password123" });
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.user.username).toBe("testuser");
    expect(response.body.profileCompleted).toBe(true);
  });

  // Test POST /api/login with invalid credentials
  test("POST /api/login - invalid credentials", async () => {
    // Mock database response - user found
    pool.query.mockResolvedValueOnce([[{ 
      username: "testuser", 
      passwords: "$2b$10$hashedpassword" 
    }]]);
    
    // Mock password comparison - returns false (invalid password)
    require('bcrypt').compare.mockResolvedValueOnce(false);

    // Make login request
    const response = await request(app)
      .post("/api/login")
      .send({ username: "testuser", password: "wrongpassword" });
    
    // Assertions
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid username or password.");
  });
  // Add these specific tests to your existing test file to improve coverage

// For the register route (lines 20-64)
test("POST /api/register - test email verification flow", async () => {
    // Mock checks for existing user - return empty array (user doesn't exist)
    pool.query.mockResolvedValueOnce([[]]);
    
    // Mock successful DB insert
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    
    // Test the full registration flow with all fields
    const response = await request(app)
      .post("/api/register")
      .send({
        username: "testuser123",
        password: "password123",
        email: "test@example.com",
        role: "volunteer"
      });
    
    // Check that the response is as expected
    expect(response.status).toBe(201);
    expect(response.body.message).toContain("Registration successful");
    
    // Verify correct interactions with dependencies
    expect(crypto.randomBytes).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(sgMail.send).toHaveBeenCalled();
    
    // Check the email was formatted correctly with verification link
    const emailCall = sgMail.send.mock.calls[0][0];
    expect(emailCall.to).toBe("test@example.com");
    expect(emailCall.subject).toContain("Verify");
    expect(emailCall.html).toContain("verification");
  });
  
  // For the email verification route (lines 69-93)
  test("GET /api/verify - complete verification flow", async () => {
    // Mock finding a user with the given verification token
    pool.query.mockResolvedValueOnce([[{
      username: "testuser123",
      email: "test@example.com",
      verificationToken: "test-token-123"
    }]]);
    
    // Mock successful update
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    // Make the verify request
    const response = await request(app)
      .get("/api/verify?token=test-token-123");
    
    // Verify the responses
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("verified");
    
    // Verify the database was queried and updated correctly
    expect(pool.query).toHaveBeenCalledTimes(2);
    const updateQuery = pool.query.mock.calls[1][0];
    expect(updateQuery).toContain("UPDATE Users SET isVerified = 1");
  });
  
  // For password reset request (first part of reset flow)
  test("POST /api/reset-password-request - complete flow", async () => {
    // Mock finding a user with the given email
    pool.query.mockResolvedValueOnce([[{
      username: "testuser123",
      email: "test@example.com"
    }]]);
    
    // Mock successful token update
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    // Make the reset password request
    const response = await request(app)
      .post("/api/reset-password-request")
      .send({ email: "test@example.com" });
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("If your email exists");
    
    // Check that token was generated and DB was updated
    expect(crypto.randomBytes).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledTimes(2);
    
    // Verify email was sent with reset link
    expect(sgMail.send).toHaveBeenCalled();
    const emailCall = sgMail.send.mock.calls[0][0];
    expect(emailCall.to).toBe("test@example.com");
    expect(emailCall.subject).toContain("Reset");
    expect(emailCall.html).toContain("reset");
  });
  
  // For password reset completion (second part of flow)
  test("POST /api/reset-password - complete flow", async () => {
    // Set the current date for token expiry checking
    const originalDate = global.Date;
    global.Date = class extends Date {
      constructor() {
        return new originalDate('2023-01-01T12:00:00Z');
      }
    };
    
    // Mock finding a user with the given reset token
    pool.query.mockResolvedValueOnce([[{
      username: "testuser123",
      email: "test@example.com",
      resetToken: "reset-token-123",
      resetTokenExpiry: new Date('2023-01-01T13:00:00Z') // 1 hour in the future
    }]]);
    
    // Mock successful password update
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    // Make the reset password completion request
    const response = await request(app)
      .post("/api/reset-password")
      .send({ 
        token: "reset-token-123",
        newPassword: "new-secure-password123"
      });
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("reset successfully");
    
    // Check that password was hashed and DB was updated
    expect(bcrypt.hash).toHaveBeenCalledWith("new-secure-password123", 10);
    expect(pool.query).toHaveBeenCalledTimes(2);
    
    // Reset the global Date
    global.Date = originalDate;
  });
  
  // Test plaintext password login path
  test("POST /api/login - with plaintext password", async () => {
    // Mock finding a user with plaintext password (not starting with $2b$)
    pool.query.mockResolvedValueOnce([[{
      username: "legacyuser",
      passwords: "plain-password-123", // Not a bcrypt hash
      email: "legacy@example.com",
      role: "user",
      isVerified: 1
    }]]);
    
    // Mock profile check
    pool.query.mockResolvedValueOnce([[]]);
    
    // Make the login request with matching plaintext password
    const response = await request(app)
      .post("/api/login")
      .send({ 
        username: "legacyuser", 
        password: "plain-password-123"
      });
    
    // Verify successful login
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    
    // Verify bcrypt.compare was NOT called (direct comparison used)
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
  // Add these tests to your existing login.test.js file to target the remaining uncovered lines

// Target line 23 - Database error during username check in registration
test("POST /api/register - database error during user check", async () => {
    // Mock database error during the check for existing username
    pool.query.mockRejectedValueOnce(new Error("Database connection failed during user check"));
    
    const response = await request(app)
      .post("/api/register")
      .send({
        username: "newuser",
        password: "password123",
        email: "newuser@example.com",
        role: "volunteer"
      });
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Database error.");
  });
  
  // Target line 29 - SendGrid failed to send but user still created
  test("POST /api/register - email sending fails but user created", async () => {
    // Mock empty result for existing user check
    pool.query.mockResolvedValueOnce([[]]);
    
    // Mock successful user insert
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    
    // Mock SendGrid failing to send email
    sgMail.send.mockRejectedValueOnce(new Error("Email sending failed"));
    
    const response = await request(app)
      .post("/api/register")
      .send({
        username: "emailfailuser",
        password: "password123",
        email: "invalid@example.com",
        role: "volunteer"
      });
    
    expect(response.status).toBe(201);
    expect(response.body.message).toContain("Registration successful but verification email could not be sent");
    expect(response.body.username).toBe("emailfailuser");
  });
  
  // Target line 71 - Verification with no token
  test("GET /api/verify - no token provided", async () => {
    const response = await request(app).get("/api/verify");
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No token provided.");
  });
  
  // Target line 81 - Invalid verification token
  test("GET /api/verify - invalid token", async () => {
    // Mock empty result (no user found with token)
    pool.query.mockResolvedValueOnce([[]]);
    
    const response = await request(app).get("/api/verify?token=invalid-token");
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid or expired verification token.");
  });
  
  // Target line 101 - Database error during verification
  test("GET /api/verify - database error during verification", async () => {
    // Mock finding user with token
    pool.query.mockResolvedValueOnce([[{
      username: "testuser123",
      email: "test@example.com",
      verificationToken: "valid-token"
    }]]);
    
    // Mock database error during update
    pool.query.mockRejectedValueOnce(new Error("Database update failed"));
    
    const response = await request(app).get("/api/verify?token=valid-token");
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Database error.");
  });
  
  // Target line 110 - Missing login credentials
  test("POST /api/login - missing credentials", async () => {
    // Try login without password
    const response = await request(app)
      .post("/api/login")
      .send({ username: "user123" });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Username and password are required.");
  });
  
  // Target line 136 - Database error during profile check
  test("POST /api/login - database error during profile check", async () => {
    // Mock finding user with credentials
    pool.query.mockResolvedValueOnce([[{
      username: "profileerror",
      passwords: "$2b$10$hashedpw",
      email: "profile@example.com",
      role: "volunteer",
      isVerified: 1
    }]]);
    
    // Mock database error during profile check
    pool.query.mockRejectedValueOnce(new Error("Database error during profile check"));
    
    const response = await request(app)
      .post("/api/login")
      .send({ 
        username: "profileerror", 
        password: "password123" 
      });
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Database error.");
  });
  
  // Target lines 169, 178 - Password reset request with missing email
  test("POST /api/reset-password-request - missing email", async () => {
    const response = await request(app)
      .post("/api/reset-password-request")
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Email is required.");
  });
  
  // Target line 203 - Database error during password reset request
  test("POST /api/reset-password-request - database error", async () => {
    // Mock database error
    pool.query.mockRejectedValueOnce(new Error("Database error during reset request"));
    
    const response = await request(app)
      .post("/api/reset-password-request")
      .send({ email: "reset@example.com" });
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("An error occurred. Please try again later.");
  });
  
  // Target line 221 - Reset password with missing fields
  test("POST /api/reset-password - missing fields", async () => {
    // Missing new password
    const response = await request(app)
      .post("/api/reset-password")
      .send({ token: "reset-token" });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Token and new password are required.");
  });
  
  // Target line 232 - Invalid or expired reset token
  test("POST /api/reset-password - invalid token", async () => {
    // Mock empty result (no user found with token or token expired)
    pool.query.mockResolvedValueOnce([[]]);
    
    const response = await request(app)
      .post("/api/reset-password")
      .send({ 
        token: "invalid-token", 
        newPassword: "newpass123" 
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid or expired reset token.");
  });
});