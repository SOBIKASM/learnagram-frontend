import api from './api';

export const classroomAPI = {
  // Get all classrooms user is in
  getClassrooms: () => api.get('/classrooms'),
  
  // Get single classroom details
  getClassroom: (classId) => api.get(`/classrooms/${classId}`),
  
  // Create new classroom
  createClassroom: (data) => api.post('/classrooms', data),
  
  // Join a classroom
  joinClassroom: (classId) => api.post(`/classrooms/${classId}/join`),
  
  // Get messages
  getMessages: (classId) => api.get(`/classrooms/${classId}/messages`),
  
  // Send message
  sendMessage: (classId, text) => api.post(`/classrooms/${classId}/messages`, { text }),
  
  // Toggle hand raise
  toggleHand: (classId) => api.post(`/classrooms/${classId}/hand`),
  
  // Mute all (host only)
  muteAll: (classId) => api.post(`/classrooms/${classId}/mute-all`)
};