import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const postsAPI = {
  getHomePosts: (userId) => api.get(`/posts/home/${userId}?t=${Date.now()}`),
  getExplorePosts: () => api.get('/posts/explore'),
  likePost: (postId, userId) => api.post('/posts/like', { post_id: postId, user_id: userId }),
  commentOnPost: (postId, userId, text) => api.post('/posts/comment', { post_id: postId, user_id: userId, text }),
  deletePost: (postId, userId) => api.delete(`/posts/${postId}`, { data: { user_id: userId } }),
  deleteComment: (postId, commentId, userId) => api.delete(`/posts/comment/${postId}/${commentId}`, { data: { user_id: userId } }),
};

export const classroomAPI = {
  getClassrooms: (filter = {}) => {
    const params = new URLSearchParams(filter).toString();
    return api.get(`/classrooms?${params}`);
  },
  getClassroom: (classId) => api.get(`/classrooms/${classId}`),
  createClassroom: (data) => api.post('/classrooms/create', data),
  getMessages: (classId) => api.get(`/classrooms/${classId}/messages`),
  sendMessage: (classId, data) => api.post(`/classrooms/${classId}/messages`, data),
  joinClassroom: (classId, userId) => api.post(`/classrooms/${classId}/join`, { user_id: userId }),
  createAssignment: (data) => api.post('/classrooms/assignment', data),
};

export default api;
