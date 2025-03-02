const request = require('supertest');
const express = require('express');
const sgMail = require('@sendgrid/mail');   
const notificationRouter = require('./notificationRoutes'); 

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRouter);

describe('Notification Routes', () => {
  it('POST /api/notifications/send should send a notification if data is valid', async () => {
    const res = await request(app)
      .post('/api/notifications/send')
      .send({
        toEmail: 'test@example.com',
        notificationType: 'Update',
        message: 'Test notification message',
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sgMail.send).toHaveBeenCalled(); 
  });

  it('POST /api/notifications/send should return 400 if data is invalid', async () => {
    const res = await request(app)
      .post('/api/notifications/send')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(sgMail.send).not.toHaveBeenCalled(); 
  });

  it('POST /api/notifications/send should handle sendgrid errors gracefully', async () => {
    sgMail.send.mockRejectedValueOnce(new Error('SendGrid error example'));
    
    const res = await request(app)
      .post('/api/notifications/send')
      .send({
        toEmail: 'fail@example.com',
        notificationType: 'Reminder',
        message: 'This will fail',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain('Failed to send notification');
  });
});
