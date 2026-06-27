import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 20000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('digilib_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('digilib_token')
      localStorage.removeItem('digilib_user')
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (payload) => api.post('/api/auth/login', payload),
  register: (payload) => api.post('/api/auth/register', payload),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout')
}

export const catalogApi = {
  books: (params) => api.get('/api/books', { params }),
  book: (id) => api.get(`/api/books/${id}`),
  bookCopies: (id) => api.get(`/api/books/${id}/copies`),
  bookHistory: (id) => api.get(`/api/books/${id}/history`),
  bookAvailability: (id) => api.get(`/api/books/${id}/availability`),
  adjustBookCopies: (id, payload) => api.post(`/api/books/${id}/copies/adjust`, payload),
  searchBooks: (params) => api.get('/api/books/search', { params }),
  createBook: (payload) => api.post('/api/books', payload),
  updateBook: (id, payload) => api.put(`/api/books/${id}`, payload),
  deleteBook: (id) => api.delete(`/api/books/${id}`),

  copies: (params) => api.get('/api/copies', { params }),
  copy: (id) => api.get(`/api/copies/${id}`),
  createCopy: (payload) => api.post('/api/copies', payload),
  updateCopy: (id, payload) => api.put(`/api/copies/${id}`, payload),
  deleteCopy: (id) => api.delete(`/api/copies/${id}`),

  categories: () => api.get('/api/categories'),
  createCategory: (payload) => api.post('/api/categories', payload),
  updateCategory: (id, payload) => api.put(`/api/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/api/categories/${id}`),

  authors: () => api.get('/api/authors'),
  createAuthor: (payload) => api.post('/api/authors', payload),
  updateAuthor: (id, payload) => api.put(`/api/authors/${id}`, payload),
  deleteAuthor: (id) => api.delete(`/api/authors/${id}`),

  publishers: () => api.get('/api/publishers'),
  createPublisher: (payload) => api.post('/api/publishers', payload),
  updatePublisher: (id, payload) => api.put(`/api/publishers/${id}`, payload),
  deletePublisher: (id) => api.delete(`/api/publishers/${id}`),

  events: (params) => api.get('/api/catalog-events', { params })
}

export const circulationApi = {
  borrowTickets: (params) => api.get('/api/borrow-tickets', { params }),
  borrowTicket: (id) => api.get(`/api/borrow-tickets/${id}`),
  createBorrowTicket: (payload) => api.post('/api/borrow-tickets', payload),
  returnBorrowTicket: (id, payload) => api.post(`/api/borrow-tickets/${id}/return`, payload),
  overdue: () => api.get('/api/overdue'),
  fines: (params) => api.get('/api/fines', { params }),
  fine: (id) => api.get(`/api/fines/${id}`),
  payFine: (id, payload) => api.post(`/api/fines/${id}/pay`, payload),
  history: () => api.get('/api/circulation/history'),
  summary: () => api.get('/api/circulation/reports/summary')
}

export const identityApi = {
  users: (params) => api.get('/api/users', { params }),
  user: (id) => api.get(`/api/users/${id}`),
  createUser: (payload) => api.post('/api/users', payload),
  updateUser: (id, payload) => api.put(`/api/users/${id}`, payload),
  lockUser: (id) => api.put(`/api/users/${id}/lock`),
  unlockUser: (id) => api.put(`/api/users/${id}/unlock`),

  readers: (params) => api.get('/api/readers', { params }),
  reader: (id) => api.get(`/api/readers/${id}`),
  createReader: (payload) => api.post('/api/readers', payload),
  updateReader: (id, payload) => api.put(`/api/readers/${id}`, payload),
  lockReader: (id, payload = {}) => api.put(`/api/readers/${id}/lock`, payload),
  unlockReader: (id) => api.put(`/api/readers/${id}/unlock`),
  readerCard: (id) => api.get(`/api/readers/${id}/card`),
  issueReaderCard: (id, payload) => api.post(`/api/readers/${id}/card/issue`, payload),
  renewReaderCard: (id, payload) => api.put(`/api/readers/${id}/card/renew`, payload),
  lockReaderCard: (id, payload = {}) => api.put(`/api/readers/${id}/card/lock`, payload),
  unlockReaderCard: (id) => api.put(`/api/readers/${id}/card/unlock`),
  validateCard: (readerCode) => api.get(`/api/cards/validate/${encodeURIComponent(readerCode)}`),

  roles: () => api.get('/api/roles'),
  createRole: (payload) => api.post('/api/roles', payload),
  permissions: () => api.get('/api/permissions'),
  updateRolePermissions: (id, payload) => api.put(`/api/roles/${id}/permissions`, payload),

  reports: (params) => api.get('/api/reports/overview', { params }),
  booksReport: () => api.get('/api/reports/books'),
  readersReport: () => api.get('/api/reports/readers'),
  circulationReport: () => api.get('/api/reports/circulation'),
  finesReport: (params) => api.get('/api/reports/fines', { params }),
  revenueReport: (params) => api.get('/api/reports/revenue', { params }),
  statistics: () => api.get('/api/statistics'),
  statisticsRevenue: (params) => api.get('/api/statistics/revenue', { params }),
  syncReportEvents: () => api.post('/api/reports/sync-events'),
  consumedEvents: (params) => api.get('/api/reports/events', { params }),
  logs: (params) => api.get('/api/system-logs', { params }),
  settings: () => api.get('/api/settings'),
  updateSettings: (payload) => api.put('/api/settings', payload),
  profile: () => api.get('/api/profile'),
  updateProfile: (payload) => api.put('/api/profile', payload),
  changePassword: (payload) => api.put('/api/profile/change-password', payload)
}

export function unwrap(response) {
  return response?.data ?? response
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.title) return data.title
  if (data?.message) return data.message
  if (error?.message) return error.message
  return fallback
}

export default api
