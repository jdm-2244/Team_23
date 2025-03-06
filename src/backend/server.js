require('dotenv').config();


const express = require('express');
const cors = require('cors');

const volunteerHistoryRouter = require('./volunteerHistoryRoutes');
const notificationRouter = require('./notificationRoutes'); 
const volunteerSearchRouter = require('./volunteerSearchRoutes');
const eventRouter = require('./eventManagementRoutes');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/volunteer-history', volunteerHistoryRouter);

app.use('/api/notifications', notificationRouter);

app.use('/api/match-volunteers', volunteerSearchRouter);
app.use('/api/event-management', eventRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
