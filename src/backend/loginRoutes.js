const express = require("express");
const router = express.Router();
const { users, addUser, findUserByUsername, getAllUsers } = require("./loginData");

// GET all users (for testing purposes)
router.get("/users", (req, res) => {
    res.json(getAllUsers());
});

// POST: Register a new user
router.post("/register", (req, res) => {
    const { username, password, email, role } = req.body;

    // Validation for required fields
    if (!username || !password || !email || !role) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = findUserByUsername(username);
    if (existingUser) {
        return res.status(400).json({ error: "Username already exists." });
    }

    // Create new user object
    const newUser = {
        id: users.length + 1,
        username,
        password,
        email,
        role
    };

    addUser(newUser);
    res.status(201).json({ message: "User registered successfully.", user: newUser });
});

// POST: User login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    const user = findUserByUsername(username);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
});

module.exports = router;