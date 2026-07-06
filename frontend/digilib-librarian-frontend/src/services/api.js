import axios from 'axios'

function getPublicUrl(port) {
  return `${window.location.protocol}//${window.location.hostname}:${port}`
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || getPublicUrl(8080),
  timeout: 25000
})

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('librarian_token') ||
    localStorage.getItem('digilib_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

export function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data

  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.title) return data.title
  if (data?.error) return data.error
  if (data?.errors) return Object.values(data.errors).flat().join('\n')
  if (error?.message) return error.message

  return fallback
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

export function normalizeBook(item = {}) {
  const copies = toArray(item.copies ?? item.Copies)

  const available = copies.filter((copy) => {
    const status = String(copy.status ?? copy.Status ?? '').toLowerCase()
    return status.includes('available') || status.includes('có thể mượn')
  }).length

  return {
    id: item.id ?? item.Id,
    title: item.title ?? item.Title ?? 'Chưa rõ tên sách',
    isbn: item.isbn ?? item.ISBN ?? item.Isbn ?? '',
    author: item.author ?? item.Author ?? 'Chưa rõ',
    category: item.category ?? item.Category ?? 'Chưa phân loại',
    publisher: item.publisher ?? item.Publisher ?? 'Chưa rõ',
    publishedYear: item.publishedYear ?? item.PublishedYear ?? '',
    description: item.description ?? item.Description ?? '',
    coverImage: item.coverImage ?? item.CoverImage ?? '',
    copies,
    totalCopies: copies.length,
    availableCopies: available
  }
}

export function normalizeCopy(item = {}) {
  return {
    id: item.id ?? item.copyId ?? item.Id ?? item.CopyId,
    copyId: item.copyId ?? item.id ?? item.CopyId ?? item.Id,
    bookId: item.bookId ?? item.BookId,
    bookTitle:
      item.bookTitle ??
      item.BookTitle ??
      item.title ??
      item.Title ??
      item.book?.title ??
      item.Book?.Title ??
      'Chưa rõ sách',
    isbn: item.isbn ?? item.ISBN ?? item.book?.isbn ?? item.Book?.ISBN ?? '',
    copyCode: item.copyCode ?? item.CopyCode ?? item.barcode ?? item.Barcode ?? '',
    barcode: item.barcode ?? item.Barcode ?? item.copyCode ?? item.CopyCode ?? '',
    status: item.status ?? item.Status ?? 'Available',
    condition: item.condition ?? item.Condition ?? 'Mới',
    location: item.location ?? item.Location ?? item.shelfLocation ?? item.ShelfLocation ?? '',
    note: item.note ?? item.Note ?? ''
  }
}

export function normalizeReader(item = {}, index = 0) {
  const rawId = item.id ?? item.readerId ?? item.Id ?? item.ReaderId
  const numericId = Number(rawId)

  return {
    id: rawId,
    numericId: Number.isFinite(numericId) && numericId > 0 ? numericId : index + 1,
    readerCode: item.readerCode ?? item.ReaderCode ?? '',
    fullName: item.fullName ?? item.FullName ?? item.name ?? item.Name ?? 'Chưa rõ',
    email: item.email ?? item.Email ?? '',
    phone: item.phone ?? item.Phone ?? '',
    gender: item.gender ?? item.Gender ?? '',
    address: item.address ?? item.Address ?? '',
    memberType: item.memberType ?? item.MemberType ?? 'Thành viên',
    status: item.status ?? item.Status ?? 1,
    cardNumber:
      item.cardNumber ??
      item.CardNumber ??
      item.readerCode ??
      item.ReaderCode ??
      `LIB${String(index + 1).padStart(3, '0')}`
  }
}

export function normalizeRecord(item = {}) {
  return {
    id: item.id ?? item.Id,
    readerId: item.readerId ?? item.ReaderId,
    readerName: item.readerName ?? item.ReaderName ?? '',
    cardNumber: item.cardNumber ?? item.CardNumber ?? '',
    copyCode: item.copyCode ?? item.CopyCode ?? '',
    bookId: item.bookId ?? item.BookId,
    bookTitle: item.bookTitle ?? item.BookTitle ?? '',
    borrowDate: item.borrowDate ?? item.BorrowDate,
    dueDate: item.dueDate ?? item.DueDate,
    returnDate: item.returnDate ?? item.ReturnDate,
    status: item.status ?? item.Status ?? 'Borrowed',
    fine: item.fine ?? item.Fine ?? 0,
    currentOverdueDays: item.currentOverdueDays ?? item.CurrentOverdueDays ?? 0,
    estimatedFine: item.estimatedFine ?? item.EstimatedFine ?? 0
  }
}

export function isAvailableStatus(status) {
  const value = String(status || '').toLowerCase()
  return value.includes('available') || value.includes('có thể mượn')
}

export function isBorrowedStatus(status) {
  const value = String(status || '').toLowerCase()
  return value.includes('borrow')
}

export function isReturnedStatus(status) {
  const value = String(status || '').toLowerCase()
  return value.includes('return')
}

export const authApi = {
  login: (payload) => api.post('/api/auth/login', payload),
  profile: () => api.get('/api/profile'),
  me: () => api.get('/api/auth/me'),
  updateProfile: (payload) => api.put('/api/profile', payload),
  changePassword: (payload) => api.put('/api/profile/change-password', payload),
  logout: () => Promise.resolve()
}

export function isLibrarianRole(user) {
  const role =
    user?.role ??
    user?.Role ??
    user?.userRole ??
    user?.UserRole ??
    user?.roleName ??
    user?.RoleName ??
    user?.roles?.[0] ??
    user?.Roles?.[0] ??
    user?.role?.name ??
    user?.Role?.Name ??
    ''

  const value = String(role).toLowerCase()

  return (
    value.includes('librarian') ||
    value.includes('thủ thư') ||
    value.includes('thu thu') ||
    value.includes('admin')
  )
}

export const catalogApi = {
  books: (params) => api.get('/api/books', { params }),
  searchBooks: (params) => api.get('/api/books/search', { params }),
  book: (id) => api.get(`/api/books/${id}`),
  categories: (params) => api.get('/api/categories', { params }),
  copies: (params) => api.get('/api/copies', { params }),
  bookCopies: (bookId) => api.get(`/api/books/${bookId}/copies`),
  copy: (id) => api.get(`/api/copies/${id}`),
  updateCopy: (id, payload) => api.put(`/api/copies/${id}`, payload),
  borrowCopy: (id) => api.put(`/api/copies/${id}/borrow`),
  returnCopy: (id) => api.put(`/api/copies/${id}/return`),
  borrowCopyByCode: (copyCode) => api.put(`/api/copies/by-code/${copyCode}/borrow`),
  returnCopyByCode: (copyCode) => api.put(`/api/copies/by-code/${copyCode}/return`)
}

export const identityApi = {
  readers: (params) => api.get('/api/readers', { params }),
  reader: (id) => api.get(`/api/readers/${id}`),
  createReader: (payload) => api.post('/api/readers', payload),
  updateReader: (id, payload) => api.put(`/api/readers/${id}`, payload),
  cards: (params) => api.get('/api/cards', { params }),
  readerCard: (id) => api.get(`/api/readers/${id}/card`),
  issueReaderCard: (id, payload = {}) => api.post(`/api/readers/${id}/card/issue`, payload),
  renewReaderCard: (id, payload = {}) => api.put(`/api/readers/${id}/card/renew`, payload),
  lockReaderCard: (id, payload = {}) => api.put(`/api/readers/${id}/card/lock`, payload),
  unlockReaderCard: (id, payload = {}) => api.put(`/api/readers/${id}/card/unlock`, payload),
  profile: () => api.get('/api/profile')
}

export const circulationApi = {
  records: (params) => api.get('/api/borrow-records', { params }),
  tickets: (params) => api.get('/api/borrow-records', { params }),
  record: (id) => api.get(`/api/borrow-records/${id}`),
  createRecord: (payload) => api.post('/api/borrow-records', payload),
  approveRecord: (id) => api.post(`/api/borrow-records/${id}/approve`, {}),
  rejectRecord: (id, payload = {}) => api.post(`/api/borrow-records/${id}/reject`, payload),
  returnRecord: (id, payload = {}) => api.post(`/api/borrow-records/${id}/return`, payload),
  renewRecord: (id, payload = {}) => api.post(`/api/borrow-records/${id}/renew`, payload),
  overdue: () => api.get('/api/borrow-records/overdue'),
  history: () => api.get('/api/circulation/history'),
  summary: () => api.get('/api/circulation/reports/summary'),
  fines: (params) => api.get('/api/fines', { params }),
  payFine: (id, payload = {}) => api.post(`/api/fines/${id}/pay`, payload)
}

export const reportApi = {
  overview: () => api.get('/api/reports/overview'),
  statistics: () => api.get('/api/statistics')
}

export const fineApi = {
  fines: (params) => api.get('/api/fines', { params }),
  payFine: (id, payload = {}) => api.post(`/api/fines/${id}/pay`, payload)
}

// ===== Compatibility helpers for librarian frontend =====
// These exports are used by existing Vue views. Keep them here so the
// librarian frontend can build and call the real API Gateway endpoints.
export function dataOf(responseOrData) {
  const data = responseOrData?.data ?? responseOrData
  return toArray(data)
}

export function formatMoney(value) {
  const amount = Number(value || 0)
  return amount.toLocaleString('vi-VN') + 'đ'
}

export const statusMaps = {
  copy: {
    0: 'Không xác định',
    1: 'Có thể mượn',
    2: 'Đang mượn',
    3: 'Đặt trước',
    4: 'Hư hỏng',
    5: 'Mất',
    Available: 'Có thể mượn',
    Borrowed: 'Đang mượn',
    Reserved: 'Đặt trước',
    Damaged: 'Hư hỏng',
    Lost: 'Mất'
  },
  ticket: {
    1: 'Đang mượn',
    2: 'Đã trả',
    3: 'Quá hạn',
    Borrowed: 'Đang mượn',
    Returned: 'Đã trả',
    Overdue: 'Quá hạn'
  },
  fine: {
    1: 'Chưa thu',
    2: 'Một phần',
    3: 'Đã thu',
    Unpaid: 'Chưa thu',
    Partial: 'Một phần',
    Paid: 'Đã thu'
  }
}

export function enumText(value, map = {}) {
  if (value === undefined || value === null || value === '') return '-'
  return map[value] ?? map[String(value)] ?? String(value)
}

export function getUser() {
  const keys = ['librarian_user', 'digilib_user', 'user']
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore invalid localStorage JSON
    }
  }
  return {}
}

export default api
