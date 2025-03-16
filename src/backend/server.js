require('dotenv').config();
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('Current working directory:', process.cwd());


const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const pool = require('./config/database');
require('dotenv').config();

const volunteerHistoryRouter = require('./volunteerHistoryRoutes');
const notificationRouter = require('./notificationRoutes');
const loginRouter = require('./loginRoutes');
const userProfileRouter = require('./userProfileRoutes');
const volunteerMatchRouter = require('./VolunteerMatchRoutes');
const eventRouter = require('./eventManagementRoutes');
console.log("SendGrid API Key:", process.env.SENDGRID_API_KEY ? "Loaded" : "Not Loaded");

const app = express();

// Only set up SendGrid if a valid API key is provided
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.length > 3) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid configured successfully');
} else {
  console.log('Warning: Valid SendGrid API key not found. Email functionality will not work.');
}

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true}
));
app.use(express.json());

// Add this before your routes in server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/volunteer-history', volunteerHistoryRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api', loginRouter);
app.use('/api/user', userProfileRouter);
app.use('/api/volunteer-matcher', volunteerMatchRouter);
app.use('/api/event-management', eventRouter);

app.get('/', (req, res) => {
  res.send('Volunteering Organization API is running');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});


// Setting the server port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`possible connection: ${process.env.DB_DATABASE} at ${process.env.DB_HOST}`)
  console.log(`This is a test to just see if the server can actually connect to the db`)
});

module.exports = app;