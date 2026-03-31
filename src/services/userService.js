import api from './api';

export const userService = {
  getUsers: () => api.get('/users'),
  getCurrentUser: () => api.get('/users/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getSuggestions: () => api.get('/users/suggestions'),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  followUser: (username) => api.post(`/users/${username}/follow`),
  unfollowUser: (username) => api.post(`/users/${username}/unfollow`),
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (username, userData) => api.put(`/users/${username}`, userData),
};

export default userService;
