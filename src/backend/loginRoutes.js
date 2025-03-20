const express = require("express");
const router = express.Router();
const sgMail = require('@sendgrid/mail');
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

    const verificationToken = Math.random().toString(36).substring(2);

    await pool.query(
      "INSERT INTO Users (username, passwords, email, role) VALUES (?, ?, ?, ?)",
      [username, password, email, role]
    );

    
    await pool.query(
      "UPDATE Users SET isVerified = 0, verificationToken = ? WHERE username = ?",
      [verificationToken, username]
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
      res.status(500).json({ error: "Failed to send verification email." });
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

    if (user.passwords !== password) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    if (user.isVerified === 0) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    
    const [profileRows] = await pool.query(
      "SELECT * FROM User_Profile WHERE user_id = ?",
      [username]
    );
    const profileCompleted = profileRows.length > 0;

    const userWithoutPassword = {
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
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

module.exports = router;
