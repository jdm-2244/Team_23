const express = require("express");
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const { users, addUser, findUserByUsername, getAllUsers, verifyUser } = require("./loginData");
const { findProfileByUsername } = require("./userProfileData"); 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/users", (req, res) => {
    res.json(getAllUsers());
});

router.post("/register", async (req, res) => {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = findUserByUsername(username);
    if (existingUser) {
        return res.status(400).json({ error: "Username already exists." });
    }

    const verificationToken = Math.random().toString(36).substring(2); 
    const newUser = {
        id: users.length + 1,
        username,
        password,
        email,
        role,
        isVerified: false,
        verificationToken
    };

    addUser(newUser);

    // Send verification email
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
    } catch (error) {
        console.error("SendGrid error:", error);
        res.status(500).json({ error: "Failed to send verification email." });
    }
});

// Verification endpoint
router.get("/verify", (req, res) => {
    const { token } = req.query;
    const user = verifyUser(token);

    if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    res.status(200).json({ message: "Email verified successfully. Please log in." });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    const user = findUserByUsername(username);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    if (!user.isVerified) {
        return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const profile = findProfileByUsername(username); 
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
        profileCompleted: !!profile 
    });
});

module.exports = router;