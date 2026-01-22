const API_URL = 'http://localhost:8080/api'

const getToken = () => localStorage.getItem('token')

export const api = {
  async request(endpoint, options = {}) {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка запроса')
    }
    
    return data
  },

  // Auth
  login: (email, password) => 
    api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password) =>
    api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  // Menu
  getMenu: () => api.request('/menu'),

  // Payments
  createPayment: (amount, type, meal_type) =>
    api.request('/payments', {
      method: 'POST',
      body: JSON.stringify({ amount, type, meal_type })
    }),

  getPaymentHistory: () => api.request('/payments/history'),

  // Reviews
  createReview: (menu_item_id, rating, comment) =>
    api.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ menu_item_id, rating, comment })
    }),

  getMyReviews: () => api.request('/reviews/my'),

  // Orders
  getOrders: () => api.request('/orders'),
  
  completeOrder: (id) =>
    api.request(`/orders/${id}/complete`, { method: 'PATCH' }),

  // Inventory
  getInventory: () => api.request('/inventory'),

  updateInventory: (id, quantity) =>
    api.request(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    }),

  // Purchase Requests
  getRequests: () => api.request('/requests'),

  createRequest: (product_name, quantity, unit) =>
    api.request('/requests', {
      method: 'POST',
      body: JSON.stringify({ product_name, quantity, unit })
    }),

  updateRequestStatus: (id, status) =>
    api.request(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Stats
  getStats: () => api.request('/stats')
}
