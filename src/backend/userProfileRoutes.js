const express = require("express");
const router = express.Router();
const pool = require("./config/database");

// Get all of the profiles
router.get("/profiles", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM User_Profile");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// Get a profile by username
router.get("/profiles/:username", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM User_Profile WHERE user_id = ?", [req.params.username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// POST used for new profile
router.post("/profiles", async (req, res) => {
  const { username, firstName, lastName, location } = req.body;
  if (!username || !firstName || !lastName || !location) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  try {
    const [existing] = await pool.query("SELECT * FROM User_Profile WHERE user_id = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Profile already exists." });
    }
    await pool.query(
      "INSERT INTO User_Profile (user_id, first_name, last_name, location) VALUES (?, ?, ?, ?)",
      [username, firstName, lastName, location]
    );
    res.status(201).json({
      message: "Profile created successfully.",
      profile: { username, firstName, lastName, location }
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// PUT to update the profile
router.put("/profiles/:username", async (req, res) => {
  const { firstName, lastName, location } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE User_Profile SET first_name = ?, last_name = ?, location = ? WHERE user_id = ?",
      [firstName, lastName, location, req.params.username]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json({
      message: "Profile updated successfully.",
      profile: { username: req.params.username, firstName, lastName, location }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Database error." });
  }
});

// Delete the profile
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
