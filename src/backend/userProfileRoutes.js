const express = require("express");
const router = express.Router();
const pool = require("./config/database"); // Added MySQL connection pool

// Get to grab all profiles from database. 
router.get("/profiles", async (req, res) => {
  try
  {
    const[rows] = await pool.query("SELECT * FROM User_Profile");
    res.json(rows);
  }
  catch(error)
  {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Database error."});
  }
});

// Get to grab a profile by username
router.get("/profiles/:username", async (req, res) => {
  try{
    const [rows] = await pool.query("SELECT * FROM User_Profile WHERE user_id = ?", [req.params.username]);
    if (rows.length === 0)
    {
      return res.status(404).json({ error: "Profile not found. "});
    }
    res.json(rows[0]);
  } catch (error)
  {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Database error. "});
  }
});

// Use post to post a new profile
router.post("/profiles", async (req, res) => {
  const { username, fullName, location } = req.body;
  // Check required fields
  if (!username || !fullName || !location) {
    return res.status(400).json({ error: "All required fields are missing or invalid." });
  }

  try {
    // Now check if the profile already exists. 
    const [existing] = await pool.query("SELECT * FROM User_Profile WHERE user_id = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Profile already exists." });
    }
    // Next insert new profile 
    await pool.query(
      "INSERT INTO User_Profile (user_id, Name, location) VALUES (?, ?, ?)",
      [username, fullName, location]
    );

    res.status(201).json({
      message: "Profile created successfully.",
      profile: { username, fullName, location }
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// Use put to update an existing profile
router.put("/profiles/:username", async (req, res) => {
  const { fullName, location } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE User_Profile SET Name = ?, location = ? WHERE user_id = ?",
      [fullName, location, req.params.username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json({
      message: "Profile updated successfully.",
      profile: { username: req.params.username, fullName, location }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// DELETE a profile
router.delete("/profiles/:username", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM User_Profile WHERE user_id = ?",
      [req.params.username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json({
      message: "Profile deleted successfully.",
      profile: { username: req.params.username }
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;