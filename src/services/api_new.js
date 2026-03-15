const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://imported-proteins-prostores-hottest.trycloudflare.com/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Dashboard API
export const dashboardApi = {
  getStats: () => apiCall('/dashboard/stats'),
};

// Students API
export const studentsApi = {
  getAll: (params) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/students${queryString}`);
  },
  getById: (id) => apiCall(`/students/${id}`),
  create: (data) => apiCall('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/students/${id}`, { method: 'DELETE' }),
  getByClassAndSection: (classId, sectionId) => apiCall(`/students/class/${classId}/section/${sectionId}`),
  getStats: () => apiCall('/students/stats'),
};

// Attendance API
export const attendanceApi = {
  getAll: (params) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/attendance${queryString}`);
  },
  mark: (data) => apiCall('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  markBulk: (records) => apiCall('/attendance', { method: 'POST', body: JSON.stringify({ records }) }),
  update: (id, data) => apiCall(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/attendance/${id}`, { method: 'DELETE' }),
  getStats: (date) => apiCall(`/attendance/stats/${date}`),
  getStudentHistory: (studentId, params) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/attendance/student/${studentId}${queryString}`);
  },
};

// Classes API
export const classesApi = {
  getAll: () => apiCall('/classes'),
  getById: (id) => apiCall(`/classes/${id}`),
  create: (data) => apiCall('/classes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/classes/${id}`, { method: 'DELETE' }),
  createSection: (classId, data) => apiCall(`/classes/${classId}/sections`, { method: 'POST', body: JSON.stringify(data) }),
};

// Exams API
export const examsApi = {
  getAll: () => apiCall('/exams'),
  getById: (id) => apiCall(`/exams/${id}`),
  create: (data) => apiCall('/exams', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/exams/${id}`, { method: 'DELETE' }),
  getResults: (examId) => apiCall(`/exams/${examId}/results`),
  addResult: (examId, data) => apiCall(`/exams/${examId}/results`, { method: 'POST', body: JSON.stringify(data) }),
  updateResult: (id, data) => apiCall(`/exams/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Fees API
export const feesApi = {
  getAll: (params) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/fees${queryString}`);
  },
  getById: (id) => apiCall(`/fees/${id}`),
  create: (data) => apiCall('/fees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/fees/${id}`, { method: 'DELETE' }),
  getOutstanding: () => apiCall('/fees/summary/outstanding'),
  getStats: () => apiCall('/fees/stats'),
};

// Staff API
export const staffApi = {
  getAll: () => apiCall('/staff'),
  getById: (id) => apiCall(`/staff/${id}`),
  getByRole: (role) => apiCall(`/staff/role/${role}`),
  create: (data) => apiCall('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/staff/${id}`, { method: 'DELETE' }),
  getStats: () => apiCall('/staff/stats'),
};

// Transport API
export const transportApi = {
  getAll: () => apiCall('/transport'),
  getById: (id) => apiCall(`/transport/${id}`),
  create: (data) => apiCall('/transport', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/transport/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/transport/${id}`, { method: 'DELETE' }),
  getStats: () => apiCall('/transport/stats'),
};

// Health check
export const healthCheck = () => apiCall('/health');
