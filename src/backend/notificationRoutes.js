const express = require('express');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();

function validateNotification(data) {
  const errors = [];
  if (!data.toEmail) {
    errors.push("Recipient email is required.");
  }
  if (!data.notificationType) {
    errors.push("Notification type is required.");
  }
  if (!data.message || data.message.trim() === '') {
    errors.push("Notification message cannot be empty.");
  }
  return errors;
}

router.post('/send', async (req, res) => {
  const { toEmail, notificationType, message } = req.body;

  const errors = validateNotification({ toEmail, notificationType, message });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const msg = {
      to: toEmail,
      from: 'aridi.marwan01@gmail.com', 
      subject: `New ${notificationType} Notification`,
      text: message,
    };

    await sgMail.send(msg);

    res.json({
      success: true,
      message: `Notification (${notificationType}) sent successfully to ${toEmail}.`,
    });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({
      error: "Failed to send notification.",
      details: error.message,
    });
  }
});

module.exports = router;
