const express = require('express');
const cors = require('cors');

const volunteerHistoryRouter = require('./volunteerHistoryRoutes');
const notificationRouter = require('./notificationRoutes');
const loginRouter = require('./loginRoutes');
const userProfileRouter = require('./userProfileRoutes');
const volunteerSearchRouter = require('./VolunteerMatchRoutes');
const eventRouter = require('./eventManagementRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/volunteer-history', volunteerHistoryRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/login', loginRouter);
app.use('/api/user-profiles', userProfileRouter);
app.use('/api/match-volunteers', volunteerSearchRouter);
app.use('/api/event-management', eventRouter);

// Setting the server port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});