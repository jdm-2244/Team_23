const express = require('express');
const cors = require('cors');
require('dotenv').config();

const volunteerHistoryRouter = require('./volunteerHistoryRoutes');
const notificationRouter = require('./notificationRoutes');
const loginRouter = require('./loginRoutes');
const userProfileRouter = require('./userProfileRoutes');
const volunteerMatchRouter = require('./VolunteerMatchRoutes');
const eventRouter = require('./eventManagementRoutes');
console.log("SendGrid API Key:", process.env.SENDGRID_API_KEY ? "Loaded" : "Not Loaded");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/volunteer-history', volunteerHistoryRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api', loginRouter);
app.use('/api/user', userProfileRouter);
app.use('/api/match-volunteers', volunteerMatchRouter);
app.use('/api/event-management', eventRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});