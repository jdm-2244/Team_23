import axios from 'axios';

const BASE_URL = '/api/volunteer-history';

class VolunteerHistoryService {
    // Fetch all volunteer history with optional filters
    static async getVolunteerHistory(searchTerm = '', dateFilter = '') {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    search: searchTerm,
                    date: dateFilter
                }
            });

            return this.transformVolunteerData(response.data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get a single volunteer history record
    static async getVolunteerHistoryById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return this.transformVolunteerData([response.data])[0];
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Export a volunteer history record
    static async exportRecord(recordId) {
        try {
            const response = await axios.get(`${BASE_URL}/export/${recordId}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Export all volunteer history records
    static async exportAllRecords(filters = {}) {
        try {
            const response = await axios.get(`${BASE_URL}/export`, {
                params: filters,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Transform database data into frontend format
    static transformVolunteerData(data) {
        return data.map(record => ({
            id: record.HID,
            volunteerName: `${record.first_name} ${record.last_name}`,
            eventName: record.Name,
            eventDate: record.Date,
            checkInTime: record.checkin_time || 'N/A',
            checkOutTime: record.checkout_time || 'N/A',
            hoursServed: this.calculateHours(record.checkin_time, record.checkout_time),
            status: record.checkin ? 'Completed' : 'Pending',
            location: record.venue_name,
            skills: record.skills ? record.skills.split(',') : [],
            maxVolunteers: record.max_volunteers,
            description: record.Description,
            checkedIn: Boolean(record.checkin),
            role: record.role,
            feedback: record.feedback || ''
        }));
    }

    // Calculate hours between check-in and check-out
    static calculateHours(checkIn, checkOut) {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(`1970-01-01T${checkIn}`);
        const end = new Date(`1970-01-01T${checkOut}`);
        return Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
    }

    // Standardized error handling
    static handleError(error) {
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
        return new Error(`Volunteer History Service Error: ${errorMessage}`);
    }
}

export default VolunteerHistoryService;