const users = [
    {
        id: 1,
        username: "john_doe",
        password: "pass123",
        email: "john.doe@email.com",
        role: "volunteer",
        isVerified: true, 
        verificationToken: null
    },
    {
        id: 2,
        username: "admin_user",
        password: "admin123",
        email: "admin@email.com",
        role: "admin",
        isVerified: true,
        verificationToken: null
    }
];

const addUser = (newUser) => {
    users.push(newUser);
    console.log("New user added:", newUser);
    console.log("Updated users list:", users);
};

const findUserByUsername = (username) => {
    const user = users.find(user => user.username === username);
    console.log(`Checking for existing user with username: ${username}`, user);
    return user;
};

const getAllUsers = () => {
    return users;
};

const verifyUser = (token) => {
    const user = users.find(user => user.verificationToken === token);
    if (user) {
        user.isVerified = true;
        user.verificationToken = null; 
    }
    return user;
};

module.exports = { users, addUser, findUserByUsername, getAllUsers, verifyUser };