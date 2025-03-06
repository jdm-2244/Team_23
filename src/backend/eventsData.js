// eventsData.js
const eventsData = [
    {
      id: 1,
      eventName: "Community Cleanup",
      eventDescription: "Help clean up local parks and streets",
      location: "Central Park",
      requiredSkills: ["Event Setup", "Organization"],
      urgency: "Medium",
      eventDate: "2025-04-15",
      maxVolunteers: 30,
      contactPerson: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "123-456-7890",
      startTime: "09:00",
      endTime: "15:00",
      visibility: "Public",
      createdAt: "2025-03-01T00:00:00.000Z",
      createdBy: "admin",
      volunteersAssigned: 12,
      status: "Active"
    },
    {
      id: 2,
      eventName: "Homeless Shelter Support",
      eventDescription: "Provide assistance at local homeless shelter",
      location: "Downtown Shelter",
      requiredSkills: ["First Aid Support", "Public Speaking"],
      urgency: "High",
      eventDate: "2025-03-20",
      maxVolunteers: 15,
      contactPerson: "Jane Smith",
      contactEmail: "jane@example.com",
      contactPhone: "987-654-3210",
      startTime: "18:00",
      endTime: "22:00",
      visibility: "Private",
      createdAt: "2025-02-15T00:00:00.000Z",
      createdBy: "admin",
      volunteersAssigned: 8,
      status: "Active"
    },
    {
      id: 3,
      eventName: "Tutoring Session",
      eventDescription: "Help students with homework and academic support",
      location: "Main Library",
      requiredSkills: ["Tutoring", "Time Management"],
      urgency: "Low",
      eventDate: "2025-03-25",
      maxVolunteers: 10,
      contactPerson: "Robert Johnson",
      contactEmail: "robert@example.com",
      contactPhone: "555-123-4567",
      startTime: "16:00",
      endTime: "19:00",
      visibility: "Public",
      createdAt: "2025-02-20T00:00:00.000Z",
      createdBy: "admin",
      volunteersAssigned: 5,
      status: "Active"
    }
  ];
  
  module.exports = eventsData;
  
  // volunteersData.js (sample based on the file mentioned in your second code snippet)
  const volunteersData = [
    {
      id: 1,
      username: "jsmith",
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@example.com",
      phone_number: "123-456-7890",
      skills: ["Tutoring", "Public Speaking", "Event Setup"],
      availability: ["Weekends", "Evenings"],
      hours_served: 45,
      location_preference: "Downtown",
      joined_date: "2024-01-15"
    },
    {
      id: 2,
      username: "mjohnson",
      first_name: "Mary",
      last_name: "Johnson",
      email: "mary.johnson@example.com",
      phone_number: "987-654-3210",
      skills: ["First Aid Support", "Time Management", "Organization"],
      availability: ["Weekdays"],
      hours_served: 32,
      location_preference: "Suburbs",
      joined_date: "2024-02-03"
    },
    {
      id: 3,
      username: "dwilliams",
      first_name: "David",
      last_name: "Williams",
      email: "david.williams@example.com",
      phone_number: "555-123-4567",
      skills: ["Website Development", "Database Management", "Event Setup"],
      availability: ["Anytime"],
      hours_served: 28,
      location_preference: "Remote",
      joined_date: "2024-02-20"
    }
  ];
  
  module.exports = volunteersData;
  
  // volunteerHistoryData.js (sample based on the file mentioned in your second code snippet)
  const volunteerHistoryRecords = [
    {
      id: 1,
      volunteerName: "John Smith",
      eventName: "Community Cleanup",
      eventDate: "2025-02-15",
      status: "Checked In",
      hoursServed: 6,
      description: "Park cleanup and organization",
      maxVolunteers: 30
    },
    {
      id: 2,
      volunteerName: "Mary Johnson",
      eventName: "Homeless Shelter Support",
      eventDate: "2025-02-20",
      status: "Completed",
      hoursServed: 4,
      description: "Food service and organization",
      maxVolunteers: 15
    },
    {
      id: 3,
      volunteerName: "John Smith",
      eventName: "Tutoring Session",
      eventDate: "2025-03-01",
      status: "Pending",
      hoursServed: 0,
      description: "Math and science tutoring",
      maxVolunteers: 10
    },
    {
      id: 4,
      volunteerName: "David Williams",
      eventName: "Community Cleanup",
      eventDate: "2025-02-15",
      status: "Checked In",
      hoursServed: 5,
      description: "Park cleanup and organization",
      maxVolunteers: 30
    }
  ];
  
  module.exports = volunteerHistoryRecords;