const express = require("express");
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('./config/database');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Users");
    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, email, role } = req.body;

  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM Users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists." });
    }

    // Generate secure verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO Users (username, passwords, email, role, isVerified, verificationToken) VALUES (?, ?, ?, ?, 0, ?)",
      [username, hashedPassword, email, role, verificationToken]
    );

    const verificationLink = `http://localhost:3001/api/verify?token=${verificationToken}`;
    const msg = {
      to: email,
      from: 'aridi.marwan01@gmail.com',
      subject: 'Verify Your ImpactNow Account',
      html: `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`
    };

    try {
      await sgMail.send(msg);
      res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (sendErr) {
      console.error("SendGrid error:", sendErr);
      // Still return success even if email sending fails
      res.status(201).json({ 
        message: "Registration successful but verification email could not be sent. Please contact support.",
        username: username
      });
    }
  } catch (error) {
    console.error("Database error on register:", error);
    res.status(500).json({ error: "Database error." });
  }
});

router.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "No token provided." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Users WHERE verificationToken = ?",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    const user = rows[0];
    await pool.query(
      "UPDATE Users SET isVerified = 1, verificationToken = NULL WHERE username = ?",
      [user.username]
    );

    res.status(200).json({ message: "Email verified successfully. Please log in." });
  } catch (error) {
    console.error("Database error on verify:", error);
    res.status(500).json({ error: "Database error." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const user = rows[0];

    // Check if password is hashed (bcrypt hashes start with $2b$)
    const isHashed = user.passwords.startsWith('$2b$');
    
    let passwordMatch;
    if (isHashed) {
      // For hashed passwords, use bcrypt compare
      passwordMatch = await bcrypt.compare(password, user.passwords);
    } else {
      // For plaintext passwords (temporary fallback)
      passwordMatch = (user.passwords === password);
      
      if (passwordMatch) {
        console.warn(`User ${username} still has plaintext password. Please run migration script.`);
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Check verification status if the column exists
    if (user.isVerified === 0) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }
    
    // Get profile information
    const [profileRows] = await pool.query(
      "SELECT * FROM User_Profile WHERE user_id = ?",
      [username]
    );
    const profileCompleted = profileRows.length > 0;

    const userWithoutPassword = {
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified || 1 // Default to verified if column doesn't exist
    };

    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      profileCompleted
    });
  } catch (error) {
    console.error("Database error on login:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// Password reset request endpoint
router.post("/reset-password-request", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  
  try {
    // Find user with this email
    const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?", [email]);
    
    if (rows.length === 0) {
      // Don't reveal that the email doesn't exist for security reasons
      return res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link." });
    }
    
    const user = rows[0];
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store the reset token and expiry in the database
    await pool.query(
      "UPDATE Users SET resetToken = ?, resetTokenExpiry = ? WHERE username = ?",
      [resetToken, resetTokenExpiry, user.username]
    );
    
    // Send password reset email
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
    const msg = {
      to: email,
      from: 'aridi.marwan01@gmail.com',
      subject: 'ImpactNow Password Reset',
      html: `Please click this link to reset your password: <a href="${resetLink}">${resetLink}</a>. This link will expire in 1 hour.`
    };
    
    try {
      await sgMail.send(msg);
    } catch (sendErr) {
      console.error("SendGrid error:", sendErr);
      // Continue anyway - don't expose email sending failures
    }
    
    // Always return success to prevent email enumeration attacks
    res.status(200).json({ message: "If your email exists in our system, you will receive a password reset link." });
    
  } catch (error) {
    console.error("Database error on password reset request:", error);
    res.status(500).json({ error: "An error occurred. Please try again later." });
  }
});

// Reset password with token endpoint
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required." });
  }
  
  try {
    // Find user with this reset token
    const [rows] = await pool.query(
      "SELECT * FROM Users WHERE resetToken = ? AND resetTokenExpiry > ?", 
      [token, new Date()]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }
    
    const user = rows[0];
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password and clear the reset token
    await pool.query(
      "UPDATE Users SET passwords = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE username = ?",
      [hashedPassword, user.username]
    );
    
    res.status(200).json({ message: "Password has been reset successfully. You can now log in with your new password." });
    
  } catch (error) {
    console.error("Database error on password reset:", error);
    res.status(500).json({ error: "An error occurred. Please try again later." });
  }
});

module.exports = router;