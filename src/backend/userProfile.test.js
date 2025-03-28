// userProfile.enhanced.test.js

const request = require('supertest');
const express = require('express');
const pool = require('./config/database');

// Make sure we're importing the actual router file being measured for coverage
const userProfileRouter = require('./userProfileRoutes');

// Mock the database pool
jest.mock('./config/database', () => {
  return {
    query: jest.fn(),
    end: jest.fn().mockResolvedValue(true)
  };
});

const app = express();
app.use(express.json());
app.use('/api/user', userProfileRouter);

describe('User Profile Routes with Mocked DB', () => {
  const testUser = {
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User',
    location: 'Test City'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET all profiles
  describe('GET /profiles', () => {
    it('should return all profiles', async () => {
      // Mock the database response
      const mockProfiles = [
        { user_id: 'user1', first_name: 'First1', last_name: 'Last1', location: 'Location1' },
        { user_id: 'user2', first_name: 'First2', last_name: 'Last2', location: 'Location2' }
      ];
      pool.query.mockResolvedValueOnce([mockProfiles]);

      const res = await request(app).get('/api/user/profiles');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProfiles);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM User_Profile');
    });

    it('should handle database errors when getting all profiles', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/user/profiles');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error.');
    });
  });

  // GET profile by username
  describe('GET /profiles/:username', () => {
    it('should return a profile by username', async () => {
      const mockProfile = { 
        user_id: testUser.username, 
        first_name: testUser.firstName, 
        last_name: testUser.lastName, 
        location: testUser.location 
      };
      pool.query.mockResolvedValueOnce([[mockProfile]]);

      const res = await request(app).get(`/api/user/profiles/${testUser.username}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProfile);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM User_Profile WHERE user_id = ?', 
        [testUser.username]
      );
    });

    it('should return 404 if profile not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/user/profiles/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found.');
    });

    it('should handle database errors when getting profile by username', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get(`/api/user/profiles/${testUser.username}`);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error.');
    });
  });

  // POST new profile
  describe('POST /profiles', () => {
    it('should create a new profile', async () => {
      // Mock empty result for existing check
      pool.query.mockResolvedValueOnce([[]]);
      // Mock successful insert
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post('/api/user/profiles')
        .send(testUser);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Profile created successfully.');
      expect(res.body.profile).toEqual(testUser);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/user/profiles')
        .send({ username: 'incomplete' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields.');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return 400 if profile already exists', async () => {
      // Mock existing profile
      pool.query.mockResolvedValueOnce([[{ user_id: testUser.username }]]);

      const res = await request(app)
        .post('/api/user/profiles')
        .send(testUser);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Profile already exists.');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle database error during profile creation', async () => {
      // Mock empty result for existing check
      pool.query.mockResolvedValueOnce([[]]);
      // Mock database error during insert
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/user/profiles')
        .send(testUser);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error.');
    });

    it('should handle database error during existing profile check', async () => {
      // Mock database error during existing check
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/user/profiles')
        .send(testUser);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error.');
    });
  });

  // PUT update profile
  describe('PUT /profiles/:username', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
      location: 'New Location'
    };

    it('should update an existing profile', async () => {
      // Mock successful update
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put(`/api/user/profiles/${testUser.username}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully.');
      expect(res.body.profile).toEqual({
        username: testUser.username,
        ...updateData
      });
    });

    it('should return 404 if profile not found during update', async () => {
      // Mock no rows affected (profile not found)
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put('/api/user/profiles/nonexistent')
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found.');
    });

    it('should handle database error during update', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .put(`/api/user/profiles/${testUser.username}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error.');
    });
  });

  // DELETE profile
  describe('DELETE /profiles/:username', () => {
    it('should delete an existing profile', async () => {
      // Mock successful delete
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .delete(`/api/user/profiles/${testUser.username}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile deleted successfully.');
      expect(res.body.profile).toEqual({
        username: testUser.username
      });
    });

    it('should return 404 if profile not found during delete', async () => {
      // Mock no rows affected (profile not found)
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .delete('/api/user/profiles/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Profile not found.');
    });

    it('should handle database error during delete', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .delete(`/api/user/profiles/${testUser.username}`);
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error.');
    });
  });

  // Additional edge cases
  describe('Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      // This is testing Express's error handling
      const res = await request(app)
        .post('/api/user/profiles')
        .set('Content-Type', 'application/json')
        .send('{"malformed json');
      
      expect(res.statusCode).toBe(400);
    });

    it('should handle empty request body', async () => {
      const res = await request(app)
        .post('/api/user/profiles')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields.');
    });
  });
});