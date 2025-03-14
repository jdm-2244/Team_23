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

router.get("/profiles", (req, res) => {
  res.json(getAllUserProfiles());
});

router.get("/profiles/:username", (req, res) => {
  const profile = findProfileByUsername(req.params.username);
  if (!profile) {
    return res.status(404).json({ error: "Profile not found." });
  }
  res.json(profile);
});

router.post("/profiles", (req, res) => {
  const {
    username,
    fullName,
    address1,
    address2,
    city,
    state,
    zip,
    skills,
    preferences,
    availability
  } = req.body;

  if (
    !username ||
    !fullName ||
    !address1 ||
    !city ||
    !state ||
    !zip ||
    !skills ||
    !availability
  ) {
    return res.status(400).json({ error: "All required fields are missing or invalid." });
  }

  if (findProfileByUsername(username)) {
    return res.status(400).json({ error: "Profile already exists." });
  }

  const newProfile = {
    id: userProfiles.length + 1,
    username,
    fullName,
    address1,
    address2,
    city,
    state,
    zip,
    skills,
    preferences,
    availability
  };

  addUserProfile(newProfile);
  res.status(201).json({
    message: "Profile created successfully.",
    profile: newProfile
  });
});

router.put("/profiles/:username", (req, res) => {
  const updatedData = req.body;
  const updatedProfile = updateUserProfile(req.params.username, updatedData);

  if (!updatedProfile) {
    return res.status(404).json({ error: "Profile not found." });
  }

  res.json({
    message: "Profile updated successfully.",
    profile: updatedProfile
  });
});

router.delete("/profiles/:username", (req, res) => {
  const deletedProfile = deleteUserProfile(req.params.username);

  if (!deletedProfile) {
    return res.status(404).json({ error: "Profile not found." });
  }

  res.json({
    message: "Profile deleted successfully.",
    profile: deletedProfile
  });
});

module.exports = router;
