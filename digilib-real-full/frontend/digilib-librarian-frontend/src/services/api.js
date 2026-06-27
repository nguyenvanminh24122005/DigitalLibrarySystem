import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 25000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('digilib_token') || localStorage.getItem('librarian_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('digilib_token')
      localStorage.removeItem('librarian_token')
      localStorage.removeItem('digilib_user')
      localStorage.removeItem('librarian_user')
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (payload) => api.post('/api/auth/login', payload),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  profile: () => api.get('/api/profile'),
  updateProfile: (payload) => api.put('/api/profile', payload),
  changePassword: (payload) => api.put('/api/profile/change-password', payload)
}

export const catalogApi = {
  books: (params) => api.get('/api/books', { params }),
  searchBooks: (params) => api.get('/api/books/search', { params }),
  book: (id) => api.get(`/api/books/${id}`),
  availability: (id) => api.get(`/api/books/${id}/availability`),
  copies: (params) => api.get('/api/copies', { params }),
  copy: (id) => api.get(`/api/copies/${id}`),
  copyByCode: (copyCode) => api.get(`/api/copies/code/${encodeURIComponent(copyCode)}`),
  categories: () => api.get('/api/categories'),
  authors: () => api.get('/api/authors'),
  publishers: () => api.get('/api/publishers')
}

export const identityApi = {
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
  validateCard: (readerCode) => api.get(`/api/cards/validate/${encodeURIComponent(readerCode)}`)
}

export const circulationApi = {
  tickets: (params) => api.get('/api/borrow-tickets', { params }),
  ticket: (id) => api.get(`/api/borrow-tickets/${id}`),
  createTicket: (payload) => api.post('/api/borrow-tickets', payload),
  returnTicket: (id, payload) => api.post(`/api/borrow-tickets/${id}/return`, payload),
  renewTicket: (id, payload) => api.post(`/api/borrow-tickets/${id}/renew`, payload),
  overdue: () => api.get('/api/overdue'),
  fines: (params) => api.get('/api/fines', { params }),
  fine: (id) => api.get(`/api/fines/${id}`),
  payFine: (id, payload) => api.post(`/api/fines/${id}/pay`, payload),
  history: () => api.get('/api/circulation/history'),
  summary: () => api.get('/api/circulation/reports/summary')
}

export function dataOf(response) {
  return response?.data ?? response ?? []
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.title) return data.title
  if (error?.message) return error.message
  return fallback
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('librarian_user') || localStorage.getItem('digilib_user') || '{}')
  } catch {
    return {}
  }
}

export function isLibrarianRole(role) {
  const value = String(role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return value.includes('thu thu') || value.includes('librarian') || value.includes('admin')
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('vi-VN')
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('vi-VN')
}

export function formatMoney(value) {
  const n = Number(value || 0)
  return n.toLocaleString('vi-VN') + ' đ'
}

export function enumText(value, map = {}) {
  if (value && typeof value === 'object') return String(value.name || value.value || value)
  return map[value] || map[String(value)] || String(value ?? '-')
}

export const statusMaps = {
  ticket: { 1: 'Đang mượn', 2: 'Đã trả', 3: 'Quá hạn', 4: 'Đã hủy', Borrowing: 'Đang mượn', Returned: 'Đã trả', Overdue: 'Quá hạn', Cancelled: 'Đã hủy' },
  fine: { 1: 'Chưa thu', 2: 'Một phần', 3: 'Đã thu', 4: 'Đã hủy', Unpaid: 'Chưa thu', PartiallyPaid: 'Một phần', Paid: 'Đã thu', Cancelled: 'Đã hủy' },
  copy: { 1: 'Sẵn sàng', 2: 'Đang mượn', 3: 'Không sẵn sàng', Available: 'Sẵn sàng', Borrowed: 'Đang mượn', Unavailable: 'Không sẵn sàng' },
  condition: { 1: 'Tốt', 2: 'Hư hỏng', 3: 'Mất', 4: 'Bảo trì', Good: 'Tốt', Damaged: 'Hư hỏng', Lost: 'Mất', Maintenance: 'Bảo trì' }
}

export default api
