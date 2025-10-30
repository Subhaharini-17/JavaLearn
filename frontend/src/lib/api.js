const API_BASE_URL = 'https://javalearn-dac0.onrender.com/api'; // ✅ Backend base URL

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    // ✅ Properly handle JSON body
    if (options.body) {
      // If body is already stringified, parse & re-stringify cleanly
      if (typeof options.body === 'string') {
        try {
          JSON.parse(options.body);
          config.body = options.body;
        } catch {
          config.body = JSON.stringify(options.body);
        }
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    // 🔐 Add token if present
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error(data.msg || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('🚨 API request failed:', error);
      throw error;
    }
  }

  // -------------------- Auth --------------------
  async register(userData) {
    // ✅ Don’t stringify here — handled automatically in request()
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // -------------------- Tutorials --------------------
  async getTutorials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tutorials${queryString ? `?${queryString}` : ''}`);
  }

  async getTutorial(id) {
    return this.request(`/tutorials/${id}`);
  }

  // -------------------- Progress --------------------
  async markTutorialComplete(tutorialId) {
    return this.request('/progress/complete', {
      method: 'POST',
      body: { tutorialId },
    });
  }

  async getProgress() {
    return this.request('/progress');
  }

  // -------------------- Compiler --------------------
  async compileJava(code, save = false) {
    return this.request('/compile/java', {
      method: 'POST',
      body: { code, save },
    });
  }

  // -------------------- Quiz --------------------
  async submitQuiz(quizId, answers) {
    return this.request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: { answers },
    });
  }
}

export const apiClient = new ApiClient();
