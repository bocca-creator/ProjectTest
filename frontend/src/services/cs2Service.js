import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance for CS2 API
const cs2Api = axios.create({
  baseURL: `${API_URL}/api/cs2`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
cs2Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// CS2 Statistics Service
export const cs2Service = {
  // Get current user's CS2 statistics
  async getMyStats() {
    try {
      const response = await cs2Api.get('/stats/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching CS2 stats:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch CS2 statistics' 
      };
    }
  },

  // Get CS2 statistics for a specific user
  async getUserStats(userId) {
    try {
      const response = await cs2Api.get(`/stats/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user CS2 stats:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch user CS2 statistics' 
      };
    }
  },

  // Update current user's CS2 statistics
  async updateMyStats(statsUpdate) {
    try {
      const response = await cs2Api.put('/stats/me', statsUpdate);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating CS2 stats:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update CS2 statistics' 
      };
    }
  },

  // Add a new CS2 match
  async addMatch(matchData) {
    try {
      const response = await cs2Api.post('/matches', matchData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding CS2 match:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to add match' 
      };
    }
  },

  // Get recent matches
  async getMyMatches(limit = 10) {
    try {
      const response = await cs2Api.get(`/matches/me?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch matches' 
      };
    }
  },

  // Get leaderboard
  async getLeaderboard(statType = 'kd_ratio', limit = 100) {
    try {
      const response = await cs2Api.get(`/leaderboard?stat_type=${statType}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch leaderboard' 
      };
    }
  },

  // Get CS2 ranks
  async getRanks() {
    try {
      const response = await cs2Api.get('/ranks');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching CS2 ranks:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch CS2 ranks' 
      };
    }
  },

  // Get CS2 maps
  async getMaps() {
    try {
      const response = await cs2Api.get('/maps');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching CS2 maps:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch CS2 maps' 
      };
    }
  },
};

export default cs2Service;