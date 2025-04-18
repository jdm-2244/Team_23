const request = require('supertest');
const app = require('../server');

describe('Report routes', () => {
  it('returns CSV', async () => {
    const res = await request(app).get('/api/reports/csv');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
  });

  it('returns PDF', async () => {
    const res = await request(app).get('/api/reports/pdf');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });
});
