const express = require('express');
const router = express.Router();

const volunteerHistoryRecords = require('./volunteerHistoryData');

function validateRecord(record) {
  const errors = [];

  if (!record.volunteerName) errors.push("Volunteer name is required");
  if (!record.eventName) errors.push("Event name is required");
  if (!record.eventDate) errors.push("Event date is required");
  if (!record.status) errors.push("Status is required");

  if (record.volunteerName && record.volunteerName.length > 100) {
    errors.push("Volunteer name must be < 100 characters");
  }
  if (record.eventName && record.eventName.length > 100) {
    errors.push("Event name must be < 100 characters");
  }
  if (record.description && record.description.length > 500) {
    errors.push("Description must be < 500 characters");
  }

  if (record.hoursServed && isNaN(record.hoursServed)) {
    errors.push("Hours served must be a number");
  }
  if (record.maxVolunteers && isNaN(record.maxVolunteers)) {
    errors.push("Max volunteers must be a number");
  }

  if (record.eventDate && isNaN(new Date(record.eventDate).valueOf())) {
    errors.push("Invalid event date");
  }

  return errors;
}

router.get('/', (req, res) => {
  res.json(volunteerHistoryRecords);
});

router.get('/:id', (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const record = volunteerHistoryRecords.find((r) => r.id === recordId);

  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.json(record);
});

router.post('/', (req, res) => {
  const newRecord = req.body;
  const errors = validateRecord(newRecord);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newId =
    volunteerHistoryRecords.length > 0
      ? Math.max(...volunteerHistoryRecords.map((r) => r.id)) + 1
      : 1;

  newRecord.id = newId;
  volunteerHistoryRecords.push(newRecord);

  res.status(201).json(newRecord);
});

router.put('/:id', (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const recordIndex = volunteerHistoryRecords.findIndex((r) => r.id === recordId);

  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const updatedRecord = req.body;
  const errors = validateRecord(updatedRecord);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  updatedRecord.id = recordId; 
  volunteerHistoryRecords[recordIndex] = updatedRecord;
  res.json(updatedRecord);
});

router.delete('/:id', (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const recordIndex = volunteerHistoryRecords.findIndex((r) => r.id === recordId);

  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  volunteerHistoryRecords.splice(recordIndex, 1);
  res.json({ message: 'Record deleted successfully' });
});

module.exports = router;
