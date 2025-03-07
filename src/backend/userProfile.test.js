const request = require('supertest');
const express = require('express');
const userProfileRouter = require('./userProfileRoutes');
const { addUserProfile, userProfiles } = require('./userProfileData');

const app = express();
app.use(express.json());
app.use('/api/user', userProfileRouter);

beforeEach(() => {
    userProfiles.length = 0; // Clear the mock data before each test
    addUserProfile({
        id: 1,
        username: 'test_user',
        location: 'Houston',
        skills: ['coding', 'design'],
        preferences: ['remote'],
        availability: ['weekends']
    });
});

describe('User Profile Routes', () => {
    test('GET /api/user/profiles - should return all profiles', async () => {
        const response = await request(app).get('/api/user/profiles');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    });

    test('GET /api/user/profiles/:username - should return a specific profile', async () => {
        const response = await request(app).get('/api/user/profiles/test_user');
        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe('test_user');
    });

    test('GET /api/user/profiles/:username - should return 404 for unknown profile', async () => {
        const response = await request(app).get('/api/user/profiles/unknown_user');
        expect(response.statusCode).toBe(404);
    });

    test('POST /api/user/profiles - should create a new profile', async () => {
        const newProfile = {
            username: 'new_user',
            location: 'New York',
            skills: ['writing'],
            preferences: ['in-person'],
            availability: ['weekdays']
        };
        const response = await request(app).post('/api/user/profiles').send(newProfile);
        expect(response.statusCode).toBe(201);
        expect(response.body.profile.username).toBe('new_user');
    });

    test('POST /api/user/profiles - should not create a profile with missing fields', async () => {
        const response = await request(app).post('/api/user/profiles').send({ username: 'incomplete_user' });
        expect(response.statusCode).toBe(400);
    });

    test('PUT /api/user/profiles/:username - should update a profile', async () => {
        const updatedData = { location: 'Austin' };
        const response = await request(app).put('/api/user/profiles/test_user').send(updatedData);
        expect(response.statusCode).toBe(200);
        expect(response.body.profile.location).toBe('Austin');
    });

    test('PUT /api/user/profiles/:username - should return 404 for non-existing profile', async () => {
        const response = await request(app).put('/api/user/profiles/non_existing_user').send({ location: 'Dallas' });
        expect(response.statusCode).toBe(404);
    });

    test('DELETE /api/user/profiles/:username - should delete a profile', async () => {
        const response = await request(app).delete('/api/user/profiles/test_user');
        expect(response.statusCode).toBe(200);
    });

    test('DELETE /api/user/profiles/:username - should return 404 for non-existing profile', async () => {
        const response = await request(app).delete('/api/user/profiles/non_existing_user');
        expect(response.statusCode).toBe(404);
    });
});
