// Mock user profile data
const userProfiles = [
    {
        id: 1,
        username: "john_doe",
        location: "New York, NY",
        skills: ["First Aid", "Cooking"],
        preferences: ["Weekends", "Short Events"],
        availability: "Weekends"
    },
    {
        id: 2,
        username: "admin_user",
        location: "San Francisco, CA",
        skills: ["Management", "Event Planning"],
        preferences: ["Weekdays", "Long Events"],
        availability: "Weekdays"
    }
];

// Function to add a new user profile
const addUserProfile = (newProfile) => {
    userProfiles.push(newProfile);
};

// Function to find a profile by username
const findProfileByUsername = (username) => {
    return userProfiles.find(profile => profile.username === username);
};

// Function to update a user profile
const updateUserProfile = (username, updatedData) => {
    const index = userProfiles.findIndex(profile => profile.username === username);
    if (index !== -1) {
        userProfiles[index] = { ...userProfiles[index], ...updatedData };
        return userProfiles[index];
    }
    return null;
};

// Function to delete a user profile
const deleteUserProfile = (username) => {
    const index = userProfiles.findIndex(profile => profile.username === username);
    if (index !== -1) {
        return userProfiles.splice(index, 1)[0];
    }
    return null;
};

// Function to get all user profiles
const getAllUserProfiles = () => {
    return userProfiles;
};

module.exports = { userProfiles, addUserProfile, findProfileByUsername, updateUserProfile, deleteUserProfile, getAllUserProfiles };