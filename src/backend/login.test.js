const request = require("supertest");
const express = require("express");
const loginRoutes = require("./loginRoutes");

const app = express();
app.use(express.json());
app.use("/api", loginRoutes);

describe("Login Module API Tests", () => {

    // Test: GET all users
    it("GET /api/users - should return all users", async () => {
        const response = await request(app).get("/api/users");
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test: Successful registration
    it("POST /api/register - should register a new user", async () => {
        const newUser = {
            username: "new_user",
            password: "newpass123",
            email: "newuser@email.com",
            role: "volunteer"
        };
        const response = await request(app)
            .post("/api/register")
            .send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully.");
    });

    // Test: Registration with missing fields
    it("POST /api/register - should fail with missing fields", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({ username: "incomplete_user" });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("All fields are required.");
    });

    // Test: Successful login
    it("POST /api/login - should login a user with valid credentials", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({ username: "john_doe", password: "pass123" });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Login successful");
    });

    // Test: Failed login with wrong credentials
    it("POST /api/login - should fail with invalid credentials", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({ username: "john_doe", password: "wrongpass" });
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Invalid username or password.");
    });

});