import axios from "axios";

// API base URL - replace with your actual API endpoint
const API_BASE_URL = '/pages/match-volunteers';
// Helper to get auth headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

/**
 * Volunteer Search API Service
 * Contains all API calls related to volunteer search operations
 */
const volunteer_search = {
  /**
   * Search for a volunteer by different criteria
   * @param {string} type - The search type (username, email, phone)
   * @param {string} term - The search term
   * @returns {Promise} - The API response
   */
  searchVolunteer: async (type, term) => {
    return axios.get(`${API_BASE_URL}/volunteers/search`, {
      params: { type, term },
      ...getAuthHeaders()
    });
  },

  /**
   * Get a volunteer's history
   * @param {string} username - The volunteer's username
   * @returns {Promise} - The API response
   */
  getVolunteerHistory: async (username) => {
    return axios.get(
      `${API_BASE_URL}/volunteers/${username}/history`,
      getAuthHeaders()
    );
  },

  /**
   * Get a volunteer's skills
   * @param {string} username - The volunteer's username
   * @returns {Promise} - The API response
   */
  getVolunteerSkills: async (username) => {
    return axios.get(
      `${API_BASE_URL}/volunteers/${username}/skills`,
      getAuthHeaders()
    );
  },

  /**
   * Get complete volunteer details including profile, history, and skills
   * @param {string} type - The search type (username, email, phone)
   * @param {string} term - The search term
   * @returns {Promise} - Object containing volunteer data, history, and skills
   */
  getCompleteVolunteerDetails: async (type, term) => {
    try {
      // First search for the volunteer
      const volunteerResponse = await volunteer_search.searchVolunteer(type, term);
      const volunteerData = volunteerResponse.data;
      
      // Then get their history
      const historyResponse = await volunteer_search.getVolunteerHistory(volunteerData.username);
      
      // Optionally get their skills (uncomment if needed)
      // const skillsResponse = await volunteer_search.getVolunteerSkills(volunteerData.username);
      
      // Return the combined data
      return {
        ...volunteerData,
        history: historyResponse.data,
        // skills: skillsResponse.data // Uncomment if getting skills
      };
    } catch (error) {
      // Rethrow to be handled by the component
      throw error;
    }
  }
};

export default volunteer_search;