const express = require("express");
const router = express.Router();
const {
    userProfiles,
    addUserProfile,
    findProfileByUsername,
    updateUserProfile,
    deleteUserProfile,
    getAllUserProfiles
} = require("./userProfileData");

// GET all user profiles
router.get("/profiles", (req, res) => {
    res.json(getAllUserProfiles());
});

// GET a specific user profile by username
router.get("/profiles/:username", (req, res) => {
    const profile = findProfileByUsername(req.params.username);
    if (!profile) {
        return res.status(404).json({ error: "Profile not found." });
    }
    res.json(profile);
});

// POST: Create a new user profile
router.post("/profiles", (req, res) => {
    const { username, location, skills, preferences, availability } = req.body;

    // Validation
    if (!username || !location || !skills || !preferences || !availability) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Check if profile already exists
    if (findProfileByUsername(username)) {
        return res.status(400).json({ error: "Profile already exists." });
    }

    const newProfile = {
        id: userProfiles.length + 1,
        username,
        location,
        skills,
        preferences,
        availability
    };

    addUserProfile(newProfile);
    res.status(201).json({ message: "Profile created successfully.", profile: newProfile });
});


router.put("/profiles/:username", (req, res) => {
    const updatedData = req.body;
    const updatedProfile = updateUserProfile(req.params.username, updatedData);

    if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found." });
    }

    res.json({ message: "Profile updated successfully.", profile: updatedProfile });
});


router.delete("/profiles/:username", (req, res) => {
    const deletedProfile = deleteUserProfile(req.params.username);

    if (!deletedProfile) {
        return res.status(404).json({ error: "Profile not found." });
    }

    res.json({ message: "Profile deleted successfully.", profile: deletedProfile });
});

module.exports = router;
