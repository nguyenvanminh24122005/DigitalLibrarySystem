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
  'admin_token',
  'digilib_admin_token',
  'librarian_token',
  'reader_token',
  'token',
  'accessToken',
  'authToken',
  'auth_token',
  'user_token'
]

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  sessionStorage.clear()
}

function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key)

    if (value) return value
  }

  return ''
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 20000
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage()
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

  logout() {
    return api.post('/api/auth/logout')
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
  // Backend hiện tại đang có:
  // GET    /api/books/{bookId}/copies
  // POST   /api/books/{bookId}/copies
  // PUT    /api/books/{bookId}/copies/{copyId}
  // DELETE /api/books/{bookId}/copies/{copyId}
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
  // Giữ lại để tránh lỗi các màn hình cũ đang gọi /api/copies
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

  borrowRecords(params) {
    return api.get('/api/borrow-records', { params })
  },

  borrowTicket(id) {
    return api.get(`/api/borrow-tickets/${id}`)
  },

  borrowRecord(id) {
    return api.get(`/api/borrow-records/${id}`)
  },

  createBorrowTicket(payload) {
    return api.post('/api/borrow-tickets', payload)
  },

  createBorrowRecord(payload) {
    return api.post('/api/borrow-records', payload)
  },

  returnBorrowTicket(id, payload) {
    return api.post(`/api/borrow-tickets/${id}/return`, payload)
  },

  returnBorrowRecord(id, payload) {
    return api.post(`/api/borrow-records/${id}/return`, payload)
  },

  // =========================
  // OVERDUE
  // =========================
  overdue() {
    return api.get('/api/overdue')
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
  history() {
    return api.get('/api/circulation/history')
  },

  summary() {
    return api.get('/api/circulation/reports/summary')
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

  lockUser(id) {
    return api.put(`/api/users/${id}/lock`)
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
  roles() {
    return api.get('/api/roles')
  },

  createRole(payload) {
    return api.post('/api/roles', payload)
  },

  permissions() {
    return api.get('/api/permissions')
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

  booksReport() {
    return api.get('/api/reports/books')
  },

  readersReport() {
    return api.get('/api/reports/readers')
  },

  circulationReport() {
    return api.get('/api/reports/circulation')
  },

  finesReport(params) {
    return api.get('/api/reports/fines', { params })
  },

  revenueReport(params) {
    return api.get('/api/reports/revenue', { params })
  },

  statistics() {
    return api.get('/api/statistics')
  },

  statisticsRevenue(params) {
    return api.get('/api/statistics/revenue', { params })
  },

  syncReportEvents() {
    return api.post('/api/reports/sync-events')
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
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data

  if (typeof data === 'string') return data

  if (data?.errors) {
    const firstError = Object.values(data.errors)?.[0]
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0]
    }

    const allErrors = Object.values(data.errors)
      .flat()
      .filter(Boolean)

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