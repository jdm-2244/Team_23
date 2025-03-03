require('dotenv').config();


const express = require('express');
const cors = require('cors');

const volunteerHistoryRouter = require('./volunteerHistoryRoutes');
const notificationRouter = require('./notificationRoutes'); 

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/volunteer-history', volunteerHistoryRouter);

app.use('/api/notifications', notificationRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
