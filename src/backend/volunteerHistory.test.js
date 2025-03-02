const request = require('supertest');
const express = require('express');
const volunteerHistoryRoutes = require('./volunteerHistoryRoutes');

const app = express();
app.use(express.json());
app.use('/api/volunteer-history', volunteerHistoryRoutes);

describe('Volunteer History Routes', () => {
  let createdRecordId;

  it('GET /api/volunteer-history should return an array of records', async () => {
    const res = await request(app).get('/api/volunteer-history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/volunteer-history should add a record when data is valid', async () => {
    const newRecord = {
      volunteerName: "Tester",
      eventName: "Test Event",
      eventDate: "2025-05-01",
      status: "Completed"
    };
    const res = await request(app).post('/api/volunteer-history').send(newRecord);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.volunteerName).toBe("Tester");
    createdRecordId = res.body.id;
  });

  it('GET /api/volunteer-history/:id should return a record when found', async () => {
    const res = await request(app).get(`/api/volunteer-history/${createdRecordId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdRecordId);
  });

  it('GET /api/volunteer-history/:id should return 404 when record is not found', async () => {
    const res = await request(app).get('/api/volunteer-history/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Record not found');
  });

  it('POST /api/volunteer-history should fail when data is invalid', async () => {
    const badRecord = {
      volunteerName: "",
      eventName: "",
      eventDate: "not-a-date",
      status: ""
    };
    const res = await request(app).post('/api/volunteer-history').send(badRecord);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/volunteer-history should fail when volunteerName exceeds 100 characters', async () => {
    const longName = 'a'.repeat(101);
    const badRecord = {
      volunteerName: longName,
      eventName: "Test Event",
      eventDate: "2025-05-01",
      status: "Completed"
    };
    const res = await request(app).post('/api/volunteer-history').send(badRecord);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Volunteer name must be less than 100 characters");
  });

  it('PUT /api/volunteer-history/:id should update an existing record when data is valid', async () => {
    const updatedRecord = {
      volunteerName: "Tester Updated",
      eventName: "Test Event Updated",
      eventDate: "2025-05-02",
      checkInTime: "08:00",
      checkOutTime: "11:00",
      hoursServed: 3,
      status: "Completed",
      location: "Test Location",
      skills: ["Skill1"],
      maxVolunteers: 10,
      description: "Updated description",
      checkedIn: true,
      feedback: "Updated feedback",
      role: "Tester Role"
    };
    const res = await request(app)
      .put(`/api/volunteer-history/${createdRecordId}`)
      .send(updatedRecord);
    expect(res.statusCode).toBe(200);
    expect(res.body.volunteerName).toBe("Tester Updated");
  });

  it('PUT /api/volunteer-history/:id should return 404 for non-existent record', async () => {
    const updatedRecord = {
      volunteerName: "Non-existent",
      eventName: "No Event",
      eventDate: "2025-01-01",
      status: "Completed"
    };
    const res = await request(app)
      .put('/api/volunteer-history/9999')
      .send(updatedRecord);
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/volunteer-history/:id should delete an existing record', async () => {
    const res = await request(app).delete(`/api/volunteer-history/${createdRecordId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Record deleted successfully");
  });

  it('DELETE /api/volunteer-history/:id should return 404 when record does not exist', async () => {
    const res = await request(app).delete('/api/volunteer-history/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Record not found");
  });
});
