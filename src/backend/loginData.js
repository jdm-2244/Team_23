/// Mock user data
const users = [
    {
        id: 1,
        username: "john_doe",
        password: "pass123", 
        email: "john.doe@email.com",
        role: "volunteer"
    },
    {
        id: 2,
        username: "admin_user",
        password: "admin123",
        email: "admin@email.com",
        role: "admin"
    }
];

// Function to add a new user (for registration)
const addUser = (newUser) => {
    users.push(newUser);
    console.log("New user added:", newUser);
    console.log("Updated users list:", users);
};

// Function to find a user by username
const findUserByUsername = (username) => {
    const user = users.find(user => user.username === username);
    console.log(`Checking for existing user with username: ${username}`, user);
    return user;
};

// Function to get all users
const getAllUsers = () => {
    return users;
};

module.exports = { users, addUser, findUserByUsername, getAllUsers };