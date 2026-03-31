import api from './api';

export const postService = {
  getFeed: (page = 0, size = 10) => api.get(`/posts/feed?page=${page}&size=${size}`),
  getUserPosts: (username, page = 0, size = 10) => api.get(`/posts/user/${username}?page=${page}&size=${size}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export default postService;

