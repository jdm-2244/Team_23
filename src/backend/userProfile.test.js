const request = require('supertest');
const express = require('express');
const userProfileRouter = require('./userProfileRoutes');
const pool = require('./config/database');

const app = express();
app.use(express.json());
app.use('/api/user', userProfileRouter);

describe('User Profile Routes (DB)', () => {
  const testUser = {
    username: 'test_user_coverage',
    firstName: 'Test',
    lastName: 'Coverage',
    location: 'Nowhere'
  };

  beforeAll(async () => {
    await pool.query("DELETE FROM User_Profile WHERE user_id = ?", [testUser.username]);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM User_Profile WHERE user_id = ?", [testUser.username]);
    await pool.end();
  });

  // Create
  test('POST - create profile', async () => {
    const res = await request(app)
      .post('/api/user/profiles')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.profile.username).toBe(testUser.username);
  });

  test('POST - fail due to missing fields', async () => {
    const res = await request(app)
      .post('/api/user/profiles')
      .send({ username: testUser.username });
    expect(res.statusCode).toBe(400);
  });

  test('POST - fail because profile already exists', async () => {
    const res = await request(app)
      .post('/api/user/profiles')
      .send(testUser);
    expect(res.statusCode).toBe(400);
  });

  // Read
  test('GET - fetch all profiles', async () => {
    const res = await request(app).get('/api/user/profiles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET - fetch profile by username', async () => {
    const res = await request(app).get(`/api/user/profiles/${testUser.username}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user_id).toBe(testUser.username);
  });

  test('GET - 404 for non-existent profile', async () => {
    const res = await request(app).get('/api/user/profiles/fake_user_xyz');
    expect(res.statusCode).toBe(404);
  });

  // Update
  test('PUT - update existing profile', async () => {
    const res = await request(app)
      .put(`/api/user/profiles/${testUser.username}`)
      .send({
        firstName: 'Updated',
        lastName: 'Coverage',
        location: 'Texas'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.profile.location).toBe('Texas');
  });

  test('PUT - 404 updating non-existent profile', async () => {
    const res = await request(app)
      .put('/api/user/profiles/fake_user_xyz')
      .send({
        firstName: 'Nope',
        lastName: 'User',
        location: 'Nowhere'
      });
    expect(res.statusCode).toBe(404);
  });

  // Delete
  test('DELETE - delete profile', async () => {
    const res = await request(app).delete(`/api/user/profiles/${testUser.username}`);
    expect(res.statusCode).toBe(200);
  });

  test('DELETE - 404 deleting non-existent profile', async () => {
    const res = await request(app).delete('/api/user/profiles/fake_user_xyz');
    expect(res.statusCode).toBe(404);
  });

  test('GET - simulate DB error on all profiles', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => { throw new Error("DB crash"); });

    const res = await request(app).get('/api/user/profiles');
    expect(res.statusCode).toBe(500);

    pool.query = originalQuery;
  });

  test('GET - simulate DB error on profile by username', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => { throw new Error("DB crash"); });

    const res = await request(app).get(`/api/user/profiles/${testUser.username}`);
    expect(res.statusCode).toBe(500);

    pool.query = originalQuery;
  });

  test('POST - simulate DB error on insert', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn((sql) => {
      if (sql.startsWith("SELECT")) return Promise.resolve([[]]);
      throw new Error("DB crash");
    });

    const res = await request(app).post('/api/user/profiles').send({
      username: 'crash_user',
      firstName: 'Crash',
      lastName: 'Dummy',
      location: 'Testland'
    });
    expect(res.statusCode).toBe(500);

    pool.query = originalQuery;
  });

  test('PUT - simulate DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => { throw new Error("DB crash"); });

    const res = await request(app)
      .put(`/api/user/profiles/${testUser.username}`)
      .send({
        firstName: 'Crash',
        lastName: 'Dummy',
        location: 'Nowhere'
      });
    expect(res.statusCode).toBe(500);

    pool.query = originalQuery;
  });

  test('DELETE - simulate DB error', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => { throw new Error("DB crash"); });

    const res = await request(app).delete(`/api/user/profiles/${testUser.username}`);
    expect(res.statusCode).toBe(500);

    pool.query = originalQuery;
  });
});
