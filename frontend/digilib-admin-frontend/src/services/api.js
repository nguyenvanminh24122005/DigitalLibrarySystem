import axios from 'axios'

export const AUTH_STORAGE_KEYS = [
  'digilib_token',
  'digilib_user',
  'digilib_admin_token',
  'digilib_admin_user',
  'admin_token',
  'admin_user',
  'librarian_token',
  'librarian_user',
  'reader_token',
  'reader_user',
  'token',
  'user',
  'accessToken',
  'authToken',
  'auth_token',
  'user_token'
]

const TOKEN_KEYS = [
  'digilib_token',
  'digilib_admin_token',
  'admin_token',
  'librarian_token',
  'reader_token',
  'token',
  'accessToken',
  'authToken',
  'auth_token',
  'user_token'
]

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key)
  })

  sessionStorage.clear()
}

function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key)

    if (value) {
      return value
    }
  }

  return ''
}

function normalizeBaseURL() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  return String(baseURL).replace(/\/+$/, '')
}

const api = axios.create({
  baseURL: normalizeBaseURL(),
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''

    const isLoginRequest =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/google')

    if (status === 401 && !isLoginRequest) {
      clearAuthStorage()

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const authApi = {
  login(payload) {
    return api.post('/api/auth/login', payload)
  },

  register(payload) {
    return api.post('/api/auth/register', payload)
  },

  me() {
    return api.get('/api/auth/me')
  },

  profile() {
    return api.get('/api/profile')
  },

  updateProfile(payload) {
    return api.put('/api/profile', payload)
  },

  changePassword(payload) {
    return api.put('/api/profile/change-password', payload)
  },

  logout() {
    return api.post('/api/auth/logout')
  },

  googleLogin(payload) {
    return api.post('/api/auth/google', payload)
  }
}

export const catalogApi = {
  // =========================
  // BOOKS
  // =========================
  books(params) {
    return api.get('/api/books', { params })
  },

  book(id) {
    return api.get(`/api/books/${id}`)
  },

  createBook(payload) {
    return api.post('/api/books', payload)
  },

  updateBook(id, payload) {
    return api.put(`/api/books/${id}`, payload)
  },

  deleteBook(id) {
    return api.delete(`/api/books/${id}`)
  },

  searchBooks(params) {
    return api.get('/api/books/search', { params })
  },

  bookHistory(id) {
    return api.get(`/api/books/${id}/history`)
  },

  bookAvailability(id) {
    return api.get(`/api/books/${id}/availability`)
  },

  adjustBookCopies(id, payload) {
    return api.post(`/api/books/${id}/copies/adjust`, payload)
  },

  // =========================
  // BOOK COPIES THEO BOOK ID
  // =========================
  bookCopies(bookId) {
    return api.get(`/api/books/${bookId}/copies`)
  },

  createBookCopy(bookId, payload) {
    return api.post(`/api/books/${bookId}/copies`, payload)
  },

  updateBookCopy(bookId, copyId, payload) {
    return api.put(`/api/books/${bookId}/copies/${copyId}`, payload)
  },

  deleteBookCopy(bookId, copyId) {
    return api.delete(`/api/books/${bookId}/copies/${copyId}`)
  },

  borrowBookCopy(bookId, copyId) {
    return api.put(`/api/books/${bookId}/copies/${copyId}/borrow`)
  },

  returnBookCopy(bookId, copyId) {
    return api.put(`/api/books/${bookId}/copies/${copyId}/return`)
  },

  // =========================
  // COPIES RIÊNG
  // =========================
  copies(params) {
    return api.get('/api/copies', { params })
  },

  copy(id) {
    return api.get(`/api/copies/${id}`)
  },

  createCopy(payload) {
    return api.post('/api/copies', payload)
  },

  updateCopy(id, payload) {
    return api.put(`/api/copies/${id}`, payload)
  },

  deleteCopy(id) {
    return api.delete(`/api/copies/${id}`)
  },

  // =========================
  // CATEGORIES
  // =========================
  categories(params) {
    return api.get('/api/categories', { params })
  },

  category(id) {
    return api.get(`/api/categories/${id}`)
  },

  createCategory(payload) {
    return api.post('/api/categories', payload)
  },

  updateCategory(id, payload) {
    return api.put(`/api/categories/${id}`, payload)
  },

  deleteCategory(id) {
    return api.delete(`/api/categories/${id}`)
  },

  // =========================
  // AUTHORS
  // =========================
  authors(params) {
    return api.get('/api/authors', { params })
  },

  author(id) {
    return api.get(`/api/authors/${id}`)
  },

  createAuthor(payload) {
    return api.post('/api/authors', payload)
  },

  updateAuthor(id, payload) {
    return api.put(`/api/authors/${id}`, payload)
  },

  deleteAuthor(id) {
    return api.delete(`/api/authors/${id}`)
  },

  // =========================
  // PUBLISHERS
  // =========================
  publishers(params) {
    return api.get('/api/publishers', { params })
  },

  publisher(id) {
    return api.get(`/api/publishers/${id}`)
  },

  createPublisher(payload) {
    return api.post('/api/publishers', payload)
  },

  updatePublisher(id, payload) {
    return api.put(`/api/publishers/${id}`, payload)
  },

  deletePublisher(id) {
    return api.delete(`/api/publishers/${id}`)
  },

  // =========================
  // CATALOG EVENTS
  // =========================
  events(params) {
    return api.get('/api/catalog-events', { params })
  }
}

export const circulationApi = {
  // =========================
  // BORROW TICKETS
  // =========================
  borrowTickets(params) {
    return api.get('/api/borrow-tickets', { params })
  },

  borrowTicket(id) {
    return api.get(`/api/borrow-tickets/${id}`)
  },

  createBorrowTicket(payload) {
    return api.post('/api/borrow-tickets', payload)
  },

  returnBorrowTicket(id, payload) {
    return api.post(`/api/borrow-tickets/${id}/return`, payload)
  },

  approveBorrowTicket(id, payload = {}) {
    return api.post(`/api/borrow-tickets/${id}/approve`, payload)
  },

  rejectBorrowTicket(id, payload = {}) {
    return api.post(`/api/borrow-tickets/${id}/reject`, payload)
  },

  cancelBorrowTicket(id, payload = {}) {
    return api.post(`/api/borrow-tickets/${id}/cancel`, payload)
  },

  // =========================
  // BORROW RECORDS
  // =========================
  borrowRecords(params) {
    return api.get('/api/borrow-records', { params })
  },

  borrowRecord(id) {
    return api.get(`/api/borrow-records/${id}`)
  },

  createBorrowRecord(payload) {
    return api.post('/api/borrow-records', payload)
  },

  returnBorrowRecord(id, payload) {
    return api.post(`/api/borrow-records/${id}/return`, payload)
  },

  renewBorrowRecord(id, payload = {}) {
    return api.post(`/api/borrow-records/${id}/renew`, payload)
  },

  // =========================
  // OVERDUE
  // =========================
  overdue(params) {
    return api.get('/api/overdue', { params })
  },

  // =========================
  // FINES
  // =========================
  fines(params) {
    return api.get('/api/fines', { params })
  },

  fine(id) {
    return api.get(`/api/fines/${id}`)
  },

  payFine(id, payload) {
    return api.post(`/api/fines/${id}/pay`, payload)
  },

  // =========================
  // REPORT / HISTORY
  // =========================
  history(params) {
    return api.get('/api/circulation/history', { params })
  },

  summary(params) {
    return api.get('/api/circulation/reports/summary', { params })
  }
}

export const identityApi = {
  // =========================
  // USERS
  // =========================
  users(params) {
    return api.get('/api/users', { params })
  },

  user(id) {
    return api.get(`/api/users/${id}`)
  },

  createUser(payload) {
    return api.post('/api/users', payload)
  },

  updateUser(id, payload) {
    return api.put(`/api/users/${id}`, payload)
  },

  deleteUser(id) {
    return api.delete(`/api/users/${id}`)
  },

  lockUser(id, payload = {}) {
    return api.put(`/api/users/${id}/lock`, payload)
  },

  unlockUser(id) {
    return api.put(`/api/users/${id}/unlock`)
  },

  // =========================
  // READERS
  // =========================
  readers(params) {
    return api.get('/api/readers', { params })
  },

  reader(id) {
    return api.get(`/api/readers/${id}`)
  },

  createReader(payload) {
    return api.post('/api/readers', payload)
  },

  updateReader(id, payload) {
    return api.put(`/api/readers/${id}`, payload)
  },

  deleteReader(id) {
    return api.delete(`/api/readers/${id}`)
  },

  lockReader(id, payload = {}) {
    return api.put(`/api/readers/${id}/lock`, payload)
  },

  unlockReader(id) {
    return api.put(`/api/readers/${id}/unlock`)
  },

  // =========================
  // READER CARD
  // =========================
  readerCard(id) {
    return api.get(`/api/readers/${id}/card`)
  },

  issueReaderCard(id, payload) {
    return api.post(`/api/readers/${id}/card/issue`, payload)
  },

  renewReaderCard(id, payload) {
    return api.put(`/api/readers/${id}/card/renew`, payload)
  },

  lockReaderCard(id, payload = {}) {
    return api.put(`/api/readers/${id}/card/lock`, payload)
  },

  unlockReaderCard(id) {
    return api.put(`/api/readers/${id}/card/unlock`)
  },

  validateCard(readerCode) {
    return api.get(`/api/cards/validate/${encodeURIComponent(readerCode)}`)
  },

  // =========================
  // ROLES / PERMISSIONS
  // =========================
  roles(params) {
    return api.get('/api/roles', { params })
  },

  role(id) {
    return api.get(`/api/roles/${id}`)
  },

  createRole(payload) {
    return api.post('/api/roles', payload)
  },

  updateRole(id, payload) {
    return api.put(`/api/roles/${id}`, payload)
  },

  deleteRole(id) {
    return api.delete(`/api/roles/${id}`)
  },

  permissions(params) {
    return api.get('/api/permissions', { params })
  },

  updateRolePermissions(id, payload) {
    return api.put(`/api/roles/${id}/permissions`, payload)
  },

  // =========================
  // REPORTS
  // =========================
  reports(params) {
    return api.get('/api/reports/overview', { params })
  },

  booksReport(params) {
    return api.get('/api/reports/books', { params })
  },

  readersReport(params) {
    return api.get('/api/reports/readers', { params })
  },

  circulationReport(params) {
    return api.get('/api/reports/circulation', { params })
  },

  finesReport(params) {
    return api.get('/api/reports/fines', { params })
  },

  revenueReport(params) {
    return api.get('/api/reports/revenue', { params })
  },

  statistics(params) {
    return api.get('/api/statistics', { params })
  },

  statisticsRevenue(params) {
    return api.get('/api/statistics/revenue', { params })
  },

  syncReportEvents(payload = {}) {
    return api.post('/api/reports/sync-events', payload)
  },

  consumedEvents(params) {
    return api.get('/api/reports/events', { params })
  },

  // =========================
  // SYSTEM
  // =========================
  logs(params) {
    return api.get('/api/system-logs', { params })
  },

  settings() {
    return api.get('/api/settings')
  },

  updateSettings(payload) {
    return api.put('/api/settings', payload)
  },

  // =========================
  // PROFILE
  // =========================
  profile() {
    return api.get('/api/profile')
  },

  updateProfile(payload) {
    return api.put('/api/profile', payload)
  },

  changePassword(payload) {
    return api.put('/api/profile/change-password', payload)
  }
}

export function unwrap(response) {
  return response?.data ?? response
}

export function toArray(data) {
  const value = unwrap(data)

  if (Array.isArray(value)) return value
  if (Array.isArray(value?.value)) return value.value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.result)) return value.result
  if (Array.isArray(value?.records)) return value.records
  if (Array.isArray(value?.$values)) return value.$values

  return []
}

export function toObject(data) {
  const value = unwrap(data)

  if (!value) return {}
  if (value?.data && typeof value.data === 'object' && !Array.isArray(value.data)) {
    return value.data
  }

  if (value?.result && typeof value.result === 'object' && !Array.isArray(value.result)) {
    return value.result
  }

  return value
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data

  if (typeof data === 'string') return data

  if (data?.errors) {
    const firstError = Object.values(data.errors)?.[0]

    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0]
    }

    const allErrors = Object.values(data.errors).flat().filter(Boolean)

    if (allErrors.length > 0) {
      return allErrors.join('\n')
    }
  }

  if (data?.title) return data.title
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (error?.message) return error.message

  return fallback
}

export default api