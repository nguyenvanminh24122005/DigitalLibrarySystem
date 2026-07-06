import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Grid2X2,
  History,
  Home,
  Info,
  KeyRound,
  LibraryBig,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Monitor,
  MoreVertical,
  Phone,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5173'
const LIBRARIAN_PORTAL_URL = import.meta.env.VITE_LIBRARIAN_PORTAL_URL || 'http://localhost:5174'
const TOKEN_KEYS = [
  'digilib_token',
  'reader_token',
  'user_token',
  'admin_token',
  'digilib_admin_token',
  'librarian_token',
  'token',
  'auth_token',
  'accessToken',
]
const USER_KEYS = [
  'digilib_user',
  'digilib_reader_user',
  'reader_user',
  'admin_user',
  'digilib_admin_user',
  'librarian_user',
  'user',
  'auth_user',
]
const USER_KEY = 'digilib_user'
const READER_USER_KEY = 'digilib_reader_user'
const SETTINGS_KEY = 'digilib_reader_settings'

const PAGE = {
  HOME: 'home',
  FEATURED: 'featured',
  BORROWED: 'borrowed',
  HISTORY: 'history',
  PROFILE: 'profile',
  CARD: 'card',
  SETTINGS: 'settings',
  SEARCH: 'search',
}

const NAV_GROUPS = [
  {
    title: 'TRANG CHỦ',
    items: [{ key: PAGE.HOME, label: 'Trang chủ', icon: Home }],
  },
  {
    title: 'THƯ VIỆN',
    items: [
      { key: PAGE.FEATURED, label: 'Sách nổi bật', icon: Star },
      { key: PAGE.BORROWED, label: 'Sách đang mượn', icon: BookOpen },
      { key: PAGE.HISTORY, label: 'Lịch sử mượn trả', icon: History },
    ],
  },
  {
    title: 'TÀI KHOẢN',
    items: [
      { key: PAGE.PROFILE, label: 'Hồ sơ cá nhân', icon: UserRound },
      { key: PAGE.CARD, label: 'Thẻ thư viện', icon: WalletCards },
      { key: PAGE.SETTINGS, label: 'Cài đặt', icon: Settings },
    ],
  },
]

function getToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key)
    if (value) return value
  }
  return ''
}

function saveToken(token) {
  if (!token) return
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))

  // Dùng chung token với Admin/Thủ thư.
  // Admin frontend đang đọc digilib_token, vì vậy Reader cũng lưu cùng key này.
  localStorage.setItem('digilib_token', token)

  // Giữ thêm alias để các màn hình cũ hoặc service cũ vẫn đọc được.
  localStorage.setItem('reader_token', token)
  localStorage.setItem('user_token', token)
  localStorage.setItem('token', token)
}

function clearAuth() {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
  USER_KEYS.forEach((key) => localStorage.removeItem(key))
}

function getSavedUser() {
  for (const key of USER_KEYS) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null')
      if (value) return value
    } catch {
      // bỏ qua dữ liệu localStorage lỗi định dạng
    }
  }
  return null
}

function saveUser(user) {
  if (!user) return
  const value = JSON.stringify(user)

  // Dùng chung user với Admin/Thủ thư.
  localStorage.setItem(USER_KEY, value)

  // Alias riêng cho Reader để không phá các đoạn code cũ.
  localStorage.setItem(READER_USER_KEY, value)
  localStorage.setItem('reader_user', value)
  localStorage.setItem('user', value)
}

function getSavedSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSettings(value) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(value))
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

function firstValue(obj, keys, fallback = undefined) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return fallback
}

function cleanText(value, fallback = '') {
  if (value === undefined || value === null) return fallback
  const text = String(value).trim()
  return text || fallback
}

function removeVietnamese(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function statusText(value) {
  const raw = String(value ?? '').trim()
  const lower = raw.toLowerCase()
  if (raw === '1' || lower === 'active') return 'Đang hoạt động'
  if (raw === '2' || lower === 'locked') return 'Tạm khóa'
  if (raw === '3' || lower === 'inactive') return 'Ngưng hoạt động'
  if (lower === 'borrowed') return 'Đang mượn'
  if (lower === 'returned') return 'Đã trả'
  if (lower === 'pendingapproval') return 'Chờ duyệt'
  if (lower === 'overduereturned') return 'Quá hạn'
  return raw || 'Đang hoạt động'
}

function isActiveStatus(value) {
  const raw = String(value ?? '').toLowerCase()
  return raw === '1' || raw === 'active' || raw.includes('hoạt') || raw.includes('active')
}

function isAvailableStatus(value, condition) {
  const status = removeVietnamese(value)
  const cond = removeVietnamese(condition)
  return (
    (status === 'available' || status.includes('co the') || status.includes('available')) &&
    !cond.includes('hong') &&
    !cond.includes('mat')
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('vi-VN')
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('vi-VN')
}

function currency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function daysBetween(dateValue) {
  if (!dateValue) return null
  const end = new Date(dateValue)
  if (Number.isNaN(end.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - today.getTime()) / 86400000)
}

function isBorrowedRecord(record) {
  const value = String(record?.status || '').toLowerCase()
  return value.includes('borrow') || value === 'đang mượn'
}

function isReturnedRecord(record) {
  const value = String(record?.status || '').toLowerCase()
  return value.includes('return') || value.includes('trả')
}

function isOverdueRecord(record) {
  if (!record || isReturnedRecord(record)) return false
  const days = daysBetween(record.dueDate)
  return days !== null && days < 0
}

function getErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.data || error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  if (data?.title) return data.title
  if (data?.error) return data.error
  if (data?.errors) return Object.values(data.errors).flat().join('\n')
  if (error?.message) return error.message
  return fallback
}

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })
  return url.toString()
}

async function apiRequest(path, options = {}) {
  const token = getToken()
  const res = await fetch(buildUrl(path, options.params), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    const err = new Error(getErrorMessage({ data }, `API lỗi ${res.status}`))
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

function normalizeBook(item = {}) {
  const copies = toArray(item.copies ?? item.Copies)
  const availableCopies = copies.filter((copy) =>
    isAvailableStatus(copy.status ?? copy.Status ?? copy.borrowStatus ?? copy.BorrowStatus, copy.condition ?? copy.Condition),
  ).length

  const title = firstValue(item, ['title', 'Title', 'name', 'Name'], 'Chưa rõ tên sách')
  const author = firstValue(item, ['author', 'Author', 'authorName', 'AuthorName'], 'Chưa rõ tác giả')
  return {
    id: firstValue(item, ['id', 'Id', 'bookId', 'BookId']),
    title: cleanText(title, 'Chưa rõ tên sách'),
    author: cleanText(author, 'Chưa rõ tác giả'),
    category: cleanText(firstValue(item, ['category', 'Category', 'categoryName', 'CategoryName'], 'Chưa phân loại'), 'Chưa phân loại'),
    publisher: cleanText(firstValue(item, ['publisher', 'Publisher', 'publisherName', 'PublisherName'], 'Đang cập nhật'), 'Đang cập nhật'),
    isbn: cleanText(firstValue(item, ['isbn', 'ISBN', 'Isbn'], ''), ''),
    publishedYear: firstValue(item, ['publishedYear', 'PublishedYear', 'publishYear', 'year', 'Year'], ''),
    description: cleanText(firstValue(item, ['description', 'Description', 'summary', 'Summary'], ''), ''),
    coverImage: cleanText(firstValue(item, ['coverImage', 'CoverImage', 'coverUrl', 'CoverUrl', 'imageUrl', 'ImageUrl'], ''), ''),
    copies,
    totalCopies: copies.length || Number(firstValue(item, ['totalCopies', 'TotalCopies'], 0)),
    availableCopies: availableCopies || Number(firstValue(item, ['availableCopies', 'AvailableCopies', 'available', 'Available'], 0)),
    rating: Number(firstValue(item, ['rating', 'Rating'], 4.8)),
    borrowCount: Number(firstValue(item, ['borrowCount', 'BorrowCount', 'totalBorrow', 'TotalBorrow'], 0)),
  }
}

function normalizeCopy(item = {}) {
  return {
    id: firstValue(item, ['id', 'copyId', 'Id', 'CopyId']),
    copyId: firstValue(item, ['copyId', 'id', 'CopyId', 'Id']),
    bookId: firstValue(item, ['bookId', 'BookId']),
    bookTitle: cleanText(firstValue(item, ['bookTitle', 'BookTitle', 'title', 'Title', 'book.Title'], ''), ''),
    copyCode: cleanText(firstValue(item, ['copyCode', 'CopyCode', 'barcode', 'Barcode'], ''), ''),
    barcode: cleanText(firstValue(item, ['barcode', 'Barcode', 'copyCode', 'CopyCode'], ''), ''),
    status: cleanText(firstValue(item, ['status', 'Status', 'borrowStatus', 'BorrowStatus'], 'Available'), 'Available'),
    condition: cleanText(firstValue(item, ['condition', 'Condition'], 'Mới'), 'Mới'),
    location: cleanText(firstValue(item, ['location', 'Location', 'shelfLocation', 'ShelfLocation'], ''), ''),
    note: cleanText(firstValue(item, ['note', 'Note'], ''), ''),
  }
}

function normalizeReader(item = {}, index = 0) {
  const rawId = firstValue(item, ['id', 'Id', 'readerId', 'ReaderId'])
  const numericId = Number(rawId)
  const readerCode = cleanText(firstValue(item, ['readerCode', 'ReaderCode'], ''), '')
  const cardNumber = cleanText(firstValue(item, ['cardNumber', 'CardNumber'], readerCode), readerCode)
  const digits = Number(String(readerCode || cardNumber || '').replace(/\D/g, ''))
  return {
    id: rawId,
    userId: firstValue(item, ['userId', 'UserId']),
    numericId: Number.isFinite(numericId) && numericId > 0 ? numericId : Number.isFinite(digits) && digits > 0 ? digits : index + 1,
    readerCode,
    cardNumber,
    fullName: cleanText(firstValue(item, ['fullName', 'FullName', 'name', 'Name'], ''), 'Độc giả'),
    email: cleanText(firstValue(item, ['email', 'Email'], ''), ''),
    phone: cleanText(firstValue(item, ['phone', 'Phone', 'phoneNumber', 'PhoneNumber'], ''), ''),
    dateOfBirth: firstValue(item, ['dateOfBirth', 'DateOfBirth', 'birthDate', 'BirthDate']),
    gender: cleanText(firstValue(item, ['gender', 'Gender'], ''), ''),
    address: cleanText(firstValue(item, ['address', 'Address'], ''), ''),
    memberType: cleanText(firstValue(item, ['memberType', 'MemberType'], 'Độc giả'), 'Độc giả'),
    status: firstValue(item, ['status', 'Status'], 1),
    createdAt: firstValue(item, ['createdAt', 'CreatedAt', 'joinedAt', 'JoinedAt']),
    cardIssuedAt: firstValue(item, ['cardIssuedAt', 'CardIssuedAt', 'issuedAt', 'IssuedAt']),
    cardExpiredAt: firstValue(item, ['cardExpiredAt', 'CardExpiredAt', 'expiredAt', 'ExpiredAt']),
    cardStatus: firstValue(item, ['cardStatus', 'CardStatus', 'status', 'Status'], 1),
    borrowLimit: Number(firstValue(item, ['borrowLimit', 'BorrowLimit'], 5)),
    hasValidCard: Boolean(firstValue(item, ['hasValidCard', 'HasValidCard'], true)),
  }
}

function normalizeCard(item = {}, reader = {}) {
  return {
    id: firstValue(item, ['id', 'Id'], reader.cardId),
    readerId: firstValue(item, ['readerId', 'ReaderId'], reader.id),
    readerCode: cleanText(firstValue(item, ['readerCode', 'ReaderCode'], reader.readerCode), reader.readerCode || ''),
    cardNumber: cleanText(firstValue(item, ['cardNumber', 'CardNumber'], reader.cardNumber), reader.cardNumber || reader.readerCode || ''),
    issuedAt: firstValue(item, ['issuedAt', 'IssuedAt'], reader.cardIssuedAt),
    expiredAt: firstValue(item, ['expiredAt', 'ExpiredAt'], reader.cardExpiredAt),
    status: firstValue(item, ['status', 'Status'], reader.cardStatus || 1),
    borrowLimit: Number(firstValue(item, ['borrowLimit', 'BorrowLimit'], reader.borrowLimit || 5)),
    lockedReason: cleanText(firstValue(item, ['lockedReason', 'LockedReason'], ''), ''),
    isExpired: Boolean(firstValue(item, ['isExpired', 'IsExpired'], reader.cardExpiredAt ? new Date(reader.cardExpiredAt) < new Date() : false)),
    canBorrow: Boolean(firstValue(item, ['canBorrow', 'CanBorrow'], true)),
  }
}

function normalizeRecord(item = {}) {
  return {
    id: firstValue(item, ['id', 'Id', 'loanId', 'LoanId']),
    readerId: firstValue(item, ['readerId', 'ReaderId']),
    readerName: cleanText(firstValue(item, ['readerName', 'ReaderName'], ''), ''),
    cardNumber: cleanText(firstValue(item, ['cardNumber', 'CardNumber'], ''), ''),
    copyCode: cleanText(firstValue(item, ['copyCode', 'CopyCode', 'barcode', 'Barcode'], ''), ''),
    bookId: firstValue(item, ['bookId', 'BookId']),
    bookTitle: cleanText(firstValue(item, ['bookTitle', 'BookTitle', 'title', 'Title', 'book.title', 'bookTitle'], ''), ''),
    borrowDate: firstValue(item, ['borrowDate', 'BorrowDate', 'borrowedAt', 'BorrowedAt']),
    dueDate: firstValue(item, ['dueDate', 'DueDate']),
    returnDate: firstValue(item, ['returnDate', 'ReturnDate', 'returnedAt', 'ReturnedAt']),
    status: cleanText(firstValue(item, ['status', 'Status'], 'Borrowed'), 'Borrowed'),
    fine: Number(firstValue(item, ['fine', 'Fine', 'fineAmount', 'FineAmount'], 0)),
    estimatedFine: Number(firstValue(item, ['estimatedFine', 'EstimatedFine'], 0)),
    currentOverdueDays: Number(firstValue(item, ['currentOverdueDays', 'CurrentOverdueDays'], 0)),
    renewCount: Number(firstValue(item, ['renewCount', 'RenewCount'], 0)),
    book: normalizeBook(firstValue(item, ['book', 'Book'], {})),
  }
}

function normalizeFine(item = {}) {
  return {
    id: firstValue(item, ['id', 'Id']),
    readerId: firstValue(item, ['readerId', 'ReaderId']),
    readerName: cleanText(firstValue(item, ['readerName', 'ReaderName'], ''), ''),
    cardNumber: cleanText(firstValue(item, ['cardNumber', 'CardNumber'], ''), ''),
    amount: Number(firstValue(item, ['amount', 'Amount', 'totalAmount', 'TotalAmount'], 0)),
    status: cleanText(firstValue(item, ['status', 'Status'], 'Unpaid'), 'Unpaid'),
    updatedAt: firstValue(item, ['updatedAt', 'UpdatedAt', 'createdAt', 'CreatedAt']),
  }
}

function normalizeNotification(item = {}) {
  return {
    id: firstValue(item, ['id', 'Id']),
    type: cleanText(firstValue(item, ['type', 'Type'], 'system'), 'system'),
    title: cleanText(firstValue(item, ['title', 'Title'], 'Thông báo'), 'Thông báo'),
    message: cleanText(firstValue(item, ['message', 'Message'], ''), ''),
    createdAt: firstValue(item, ['createdAt', 'CreatedAt']),
    isRead: Boolean(firstValue(item, ['isRead', 'IsRead'], false)),
    relatedBookId: firstValue(item, ['relatedBookId', 'RelatedBookId']),
  }
}


const api = {
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload }),
  me: () => apiRequest('/api/auth/me'),
  profile: () => apiRequest('/api/profile'),
  updateProfile: (payload) => apiRequest('/api/readers/me', { method: 'PUT', body: payload }),
  changePassword: (payload) => apiRequest('/api/profile/change-password', { method: 'PUT', body: payload }),
  readerMe: () => apiRequest('/api/readers/me'),
  readerCard: () => apiRequest('/api/readers/me/card'),
  books: () => apiRequest('/api/books'),
  searchBooks: (params) => apiRequest('/api/books/search', { params }),
  book: (id) => apiRequest(`/api/books/${id}`),
  bookAvailability: (id) => apiRequest(`/api/books/${id}/availability`),
  bookCopies: (id) => apiRequest(`/api/books/${id}/copies`),
  categories: () => apiRequest('/api/categories'),
  copies: (params) => apiRequest('/api/copies', { params }),
  catalogBorrowingsCurrent: (userId) => apiRequest(`/api/users/${encodeURIComponent(userId)}/borrowings/current`),
  catalogBorrowingsHistory: (userId) => apiRequest(`/api/users/${encodeURIComponent(userId)}/borrowings/history`),
  catalogBorrow: (userId, payload) => apiRequest(`/api/users/${encodeURIComponent(userId)}/borrowings`, { method: 'POST', body: payload }),
  catalogRenew: (userId, loanId) => apiRequest(`/api/users/${encodeURIComponent(userId)}/borrowings/${loanId}/renew`, { method: 'PUT', body: {} }),
  catalogReturn: (userId, loanId) => apiRequest(`/api/users/${encodeURIComponent(userId)}/borrowings/${loanId}/return`, { method: 'PUT', body: {} }),
  notifications: (userId) => apiRequest(`/api/users/${encodeURIComponent(userId)}/notifications`),
  markNotification: (userId, id) => apiRequest(`/api/users/${encodeURIComponent(userId)}/notifications/${id}/read`, { method: 'PUT', body: {} }),
  markAllNotifications: (userId) => apiRequest(`/api/users/${encodeURIComponent(userId)}/notifications/read-all`, { method: 'PUT', body: {} }),
  records: (params) => apiRequest('/api/borrow-records', { params }),
  createRecord: (payload) => apiRequest('/api/borrow-records', { method: 'POST', body: payload }),
  renewRecord: (id, payload = { days: 7 }) => apiRequest(`/api/borrow-records/${id}/renew`, { method: 'POST', body: payload }),
  returnRecord: (id, payload = {}) => apiRequest(`/api/borrow-records/${id}/return`, { method: 'POST', body: payload }),
  fines: (params) => apiRequest('/api/fines', { params }),
  debt: (readerId) => apiRequest(`/api/fines/reader/${readerId}/debt`),
}

function getPortalUserId({ user, reader, card }) {
  return cleanText(
    user?.id || user?.Id || reader?.userId || reader?.id || reader?.readerCode || card?.cardNumber || reader?.cardNumber,
    'demo-user',
  )
}

function getReaderNumber(reader, card) {
  const fromReader = Number(reader?.numericId)
  if (Number.isFinite(fromReader) && fromReader > 0) return fromReader
  const digits = Number(String(reader?.readerCode || card?.cardNumber || reader?.cardNumber || '').replace(/\D/g, ''))
  return Number.isFinite(digits) && digits > 0 ? digits : 1
}

function matchRecordForReader(record, reader, card) {
  const cardNo = String(card?.cardNumber || reader?.cardNumber || reader?.readerCode || '').toLowerCase()
  const readerName = removeVietnamese(reader?.fullName || '')
  const recordCard = String(record?.cardNumber || '').toLowerCase()
  const recordName = removeVietnamese(record?.readerName || '')
  if (cardNo && recordCard && recordCard === cardNo) return true
  if (readerName && recordName && recordName === readerName) return true
  return false
}

function buildQrSvg(text) {
  const safe = encodeURIComponent(text || 'DIGILIB')
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${safe}`
}

function BookCover({ book, size = 'normal' }) {
  const [failed, setFailed] = useState(false)
  const title = cleanText(book?.title || book?.bookTitle, 'Sách')
  const url = cleanText(book?.coverImage || book?.coverUrl, '')
  return (
    <div className={`book-cover ${size}`}>
      {url && !failed ? (
        <img src={url} alt={title} onError={() => setFailed(true)} />
      ) : (
        <span>{title.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}

function IconBadge({ children, tone = 'blue' }) {
  return <span className={`icon-badge ${tone}`}>{children}</span>
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

function EmptyState({ title = 'Chưa có dữ liệu', message = 'Dữ liệu sẽ hiển thị khi API trả về kết quả.' }) {
  return (
    <div className="empty-state">
      <BookOpen size={30} />
      <b>{title}</b>
      <span>{message}</span>
    </div>
  )
}

function ToastStack({ toasts, onClose }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type || 'success'}`} key={toast.id}>
          <b>{toast.title}</b>
          <span>{toast.message}</span>
          <button onClick={() => onClose(toast.id)}><X size={16} /></button>
        </div>
      ))}
    </div>
  )
}

function getAuthPayload(data) {
  return data?.data || data?.result || data?.payload || data || {}
}

function extractAuthToken(data) {
  const payload = getAuthPayload(data)
  return (
    payload?.token ||
    payload?.Token ||
    payload?.accessToken ||
    payload?.AccessToken ||
    payload?.jwtToken ||
    payload?.JwtToken ||
    data?.token ||
    data?.accessToken ||
    data?.jwtToken
  )
}

function extractAuthUser(data) {
  const payload = getAuthPayload(data)
  return payload?.user || payload?.User || data?.user || data?.User || payload
}

function normalizeAuthUser(user = {}) {
  return {
    ...user,
    id: user.id || user.Id || user.userId || user.UserId,
    fullName: user.fullName || user.FullName || user.name || user.Name || user.username || user.Username || user.email || user.Email || 'Người dùng',
    name: user.name || user.Name || user.fullName || user.FullName || user.username || user.Username || user.email || user.Email || 'Người dùng',
    username: user.username || user.Username || '',
    email: user.email || user.Email || '',
    phone: user.phone || user.Phone || user.phoneNumber || user.PhoneNumber || '',
    role: user.roleName || user.RoleName || user.role || user.Role || user.memberType || user.MemberType || '',
    status: user.status || user.Status,
    avatar: user.avatar || user.avatarUrl || user.Avatar || user.AvatarUrl || '',
  }
}

function getRoleName(user = {}) {
  return removeVietnamese(user.role || user.roleName || user.Role || user.RoleName || '').trim()
}

function redirectByRole(user) {
  const role = getRoleName(user)

  // Dùng chung đăng nhập: tài khoản Admin/Thủ thư vào đúng portal của họ,
  // tài khoản Độc giả ở lại Reader Portal.
  if (role.includes('admin') || role.includes('quan ly') || role.includes('bao cao')) {
    window.location.href = ADMIN_PORTAL_URL
    return true
  }

  if (role.includes('thu thu') || role.includes('librarian')) {
    window.location.href = LIBRARIAN_PORTAL_URL
    return true
  }

  return false
}

function getReaderReturnUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('session')
  return url.toString()
}

function getSharedLoginUrl() {
  const loginUrl = new URL('/login', ADMIN_PORTAL_URL)
  loginUrl.searchParams.set('redirect', getReaderReturnUrl())
  return loginUrl.toString()
}

function redirectToSharedLogin() {
  window.location.replace(getSharedLoginUrl())
}

function decodeSessionPayload(raw) {
  try {
    const base64 = String(raw).replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

    return JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split('')
          .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      ),
    )
  } catch {
    return null
  }
}

function readSharedSessionFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const rawSession = params.get('session')

  if (!rawSession) return null

  const session = decodeSessionPayload(rawSession)

  if (!session?.token) return null

  return {
    token: session.token,
    user: normalizeAuthUser(session.user || {}),
  }
}

function removeSessionFromUrl() {
  const url = new URL(window.location.href)

  if (!url.searchParams.has('session')) return

  url.searchParams.delete('session')
  window.history.replaceState({}, document.title, url.toString())
}

function SharedLoginRedirect() {
  useEffect(() => {
    redirectToSharedLogin()
  }, [])

  return (
    <div className="loading-screen">
      <BookOpen size={42} />
      <b>Đang chuyển đến trang đăng nhập chung DIGILIB...</b>
    </div>
  )
}

function AppShell({
  page,
  setPage,
  user,
  reader,
  card,
  searchText,
  setSearchText,
  onSearch,
  notifications,
  onMarkNotification,
  onMarkAllNotifications,
  onRefresh,
  onLogout,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [openNoti, setOpenNoti] = useState(false)
  const searchRef = useRef(null)
  const unread = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    function handler(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function submitSearch(e) {
    e.preventDefault()
    onSearch(searchText)
  }

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BookOpen className="brand-icon" size={46} />
          <div><b>DIGILIB</b></div>
        </div>
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.key} className={page === item.key ? 'active' : ''} onClick={() => setPage(item.key)}>
                    <Icon size={21} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <button className="collapse-btn" onClick={() => setCollapsed((v) => !v)}>
          <ChevronRight size={20} className={collapsed ? '' : 'rotated'} />
          <span>Thu gọn</span>
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setCollapsed((v) => !v)}><Menu size={24} /></button>
          <form className="top-search" onSubmit={submitSearch}>
            <Search size={21} />
            <input ref={searchRef} value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Tìm sách, tác giả, thể loại..." />
            <kbd>Ctrl + K</kbd>
          </form>
          <div className="top-actions">
            <button className="refresh-btn" onClick={onRefresh} title="Tải lại dữ liệu"><RefreshCcw size={19} /></button>
            <div className="noti-wrap">
              <button className="bell-btn" onClick={() => setOpenNoti((v) => !v)}>
                <Bell size={22} />
                {unread > 0 && <em>{unread}</em>}
              </button>
              {openNoti && (
                <div className="noti-panel">
                  <div className="noti-head"><b>Thông báo</b><button onClick={onMarkAllNotifications}>Đánh dấu đã đọc</button></div>
                  {notifications.length === 0 ? (
                    <div className="noti-empty">Chưa có thông báo mới.</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <button className={`noti-item ${n.isRead ? '' : 'unread'}`} key={n.id} onClick={() => onMarkNotification(n.id)}>
                        <span className="noti-dot" />
                        <div><b>{n.title}</b><p>{n.message}</p><small>{formatDateTime(n.createdAt)}</small></div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-menu">
              <div className="user-avatar">{cleanText(reader?.fullName || user?.fullName || user?.FullName, 'N').slice(0, 1).toUpperCase()}</div>
              <div><b>{reader?.fullName || user?.fullName || user?.FullName || 'Nguyễn Văn A'}</b><span>Độc giả</span></div>
              <ChevronDown size={18} />
              <button className="logout-overlay" onClick={onLogout} title="Đăng xuất" />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

function BookCard({ book, onBorrow, onDetail }) {
  return (
    <article className="book-tile">
      <BookCover book={book} />
      <div className="book-tile-info">
        <b>{book.title}</b>
        <span>{book.author}</span>
        <div className="book-rating"><Star size={15} fill="currentColor" /> {book.rating.toFixed ? book.rating.toFixed(1) : book.rating}</div>
        <small className={book.availableCopies > 0 ? 'green-text' : 'red-text'}>{book.availableCopies > 0 ? `Còn ${book.availableCopies} bản` : 'Đang được mượn'}</small>
      </div>
      <div className="book-actions">
        <button className="primary-mini" onClick={() => onBorrow(book)} disabled={book.availableCopies <= 0}>Mượn ngay</button>
        <button className="outline-mini" onClick={() => onDetail(book)}>Chi tiết</button>
      </div>
    </article>
  )
}

function BookListCard({ book, onBorrow, onDetail }) {
  return (
    <article className="book-list-card">
      <BookCover book={book} size="small" />
      <div>
        <b>{book.title}</b>
        <span>{book.author}</span>
        <Badge tone={book.availableCopies > 0 ? 'green' : 'red'}>{book.availableCopies > 0 ? 'Còn sách' : 'Đang được mượn'}</Badge>
      </div>
      <button className="outline-mini" onClick={() => onDetail(book)}>Xem chi tiết</button>
      <button className="primary-mini" onClick={() => onBorrow(book)} disabled={book.availableCopies <= 0}>Mượn</button>
    </article>
  )
}

function RecentBorrowItem({ record }) {
  const days = daysBetween(record.dueDate)
  return (
    <div className="recent-borrow-item">
      <BookCover book={record.book?.id ? record.book : { title: record.bookTitle }} size="tiny" />
      <div>
        <b>{record.bookTitle || record.book?.title || 'Sách'}</b>
        <span>{record.book?.author || record.copyCode}</span>
        <small>Hạn trả: {formatDate(record.dueDate)}</small>
      </div>
      <Badge tone={days !== null && days < 0 ? 'red' : days !== null && days <= 3 ? 'orange' : 'green'}>
        {days !== null && days < 0 ? 'Quá hạn' : days !== null && days <= 3 ? 'Sắp đến hạn' : 'Đúng hạn'}
      </Badge>
    </div>
  )
}

function HomePage({ reader, featuredBooks, books, currentRecords, categories, onPage, onBorrow, onDetail, onCategory }) {
  return (
    <div className="page-content">
      <PageTitle title="Trang chủ" desc="Khám phá sách, theo dõi mượn sách và tìm tài liệu phù hợp cho bạn" />
      <div className="home-grid">
        <section className="hero-card">
          <div>
            <h2>Chào mừng bạn quay lại,<br />{reader?.fullName || 'Độc giả'} 👋</h2>
            <p>Khám phá hàng ngàn đầu sách hay, nhận gợi ý phù hợp với sở thích và tìm kiếm tài liệu nhanh chóng trong thư viện.</p>
            <button className="primary-btn compact" onClick={() => onPage(PAGE.FEATURED)}>Khám phá sách <ChevronRight size={18} /></button>
          </div>
          <div className="hero-features">
            <div><IconBadge><Search size={18} /></IconBadge><span><b>Tìm kiếm thông minh</b><small>Tìm sách nhanh theo tiêu đề, tác giả, chủ đề...</small></span></div>
            <div><IconBadge><Star size={18} /></IconBadge><span><b>Gợi ý cá nhân hóa</b><small>Đề xuất sách phù hợp với thói quen đọc của bạn</small></span></div>
            <div><IconBadge><BookOpen size={18} /></IconBadge><span><b>Đọc mọi lúc, mọi nơi</b><small>Truy cập sách điện tử và tài liệu số dễ dàng</small></span></div>
          </div>
          <div className="hero-illustration"><LibraryBig size={110} /><span /></div>
        </section>

        <aside className="panel right-panel">
          <div className="panel-title"><h3>Đang mượn gần đây</h3><button onClick={() => onPage(PAGE.BORROWED)}>Xem tất cả</button></div>
          {currentRecords.length ? currentRecords.slice(0, 4).map((record) => <RecentBorrowItem key={record.id} record={record} />) : <EmptyState title="Chưa mượn sách" message="Bạn chưa có sách đang mượn." />}
        </aside>
      </div>

      <section className="panel">
        <div className="panel-title"><h3>Sách nổi bật</h3><button onClick={() => onPage(PAGE.FEATURED)}>Xem tất cả</button></div>
        {featuredBooks.length ? <div className="featured-row">{featuredBooks.slice(0, 6).map((book) => <BookCard key={book.id} book={book} onBorrow={onBorrow} onDetail={onDetail} />)}</div> : <EmptyState title="Chưa có sách nổi bật" />}
      </section>

      <div className="home-grid lower">
        <section className="panel">
          <div className="panel-title"><h3>Sách mới cập nhật</h3><button onClick={() => onPage(PAGE.SEARCH)}>Xem tất cả</button></div>
          {books.length ? <div className="book-list-grid">{books.slice(0, 6).map((book) => <BookListCard key={book.id} book={book} onBorrow={onBorrow} onDetail={onDetail} />)}</div> : <EmptyState title="Chưa có sách" />}
        </section>
        <aside className="panel right-panel category-panel">
          <h3>Thể loại phổ biến</h3>
          <div className="category-grid">
            {(categories.length ? categories : ['Văn học', 'Kỹ năng', 'Kinh tế', 'Công nghệ', 'Tâm lý', 'Lịch sử']).slice(0, 6).map((cat) => {
              const name = typeof cat === 'string' ? cat : cat.name || cat.categoryName || cat.Name
              return <button key={name} onClick={() => onCategory(name)}><BookOpen size={20} />{name}</button>
            })}
          </div>
          <button className="outline-btn full" onClick={() => onPage(PAGE.SEARCH)}>Xem tất cả thể loại <ChevronRight size={18} /></button>
        </aside>
      </div>
    </div>
  )
}

function PageTitle({ title, desc }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  )
}

function FeaturedPage({ books, onBorrow, onDetail, onCategory }) {
  const [category, setCategory] = useState('Tất cả')
  const [sort, setSort] = useState('popular')
  const categories = useMemo(() => ['Tất cả', ...Array.from(new Set(books.map((b) => b.category).filter(Boolean))).slice(0, 6)], [books])
  const filtered = useMemo(() => {
    let next = category === 'Tất cả' ? [...books] : books.filter((b) => b.category === category)
    if (sort === 'available') next.sort((a, b) => b.availableCopies - a.availableCopies)
    if (sort === 'newest') next.sort((a, b) => Number(b.publishedYear || 0) - Number(a.publishedYear || 0))
    if (sort === 'popular') next.sort((a, b) => (b.borrowCount || b.availableCopies || 0) - (a.borrowCount || a.availableCopies || 0))
    return next
  }, [books, category, sort])
  const top = filtered.slice(0, 4)

  return (
    <div className="page-content">
      <PageTitle title="Sách nổi bật" desc="Khám phá những đầu sách nổi bật, được yêu thích và đề xuất dành cho bạn" />
      <div className="filter-bar">
        {categories.map((c, index) => <button className={category === c ? 'active' : ''} key={c} onClick={() => { setCategory(c); onCategory?.(c === 'Tất cả' ? '' : c) }}>{index === 0 && <Grid2X2 size={18} />}{c}</button>)}
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="popular">Phổ biến nhất</option>
          <option value="available">Còn nhiều bản</option>
          <option value="newest">Mới nhất</option>
        </select>
      </div>
      <div className="featured-layout">
        <main>
          <section className="collection-banner">
            <div><h2>Bộ sưu tập nổi bật trong tuần</h2><p>Những cuốn sách có lượt mượn cao, đánh giá tốt và được độc giả quan tâm nhiều nhất</p><button className="primary-btn compact">Xem chi tiết</button></div>
            <LibraryBig size={150} />
          </section>
          <section className="panel">
            <h3>Danh sách sách nổi bật</h3>
            {filtered.length ? <div className="book-card-grid">{filtered.map((book) => <BookCard key={book.id} book={book} onBorrow={onBorrow} onDetail={onDetail} />)}</div> : <EmptyState title="Không có sách phù hợp" />}
          </section>
        </main>
        <aside>
          <section className="panel rank-panel">
            <h3>Top được mượn nhiều</h3>
            {top.map((book, index) => <div className="rank-item" key={book.id}><b>{index + 1}</b><BookCover book={book} size="tiny" /><span><strong>{book.title}</strong><small>{book.author}</small><em>{book.borrowCount || book.availableCopies || 0} lượt mượn</em></span></div>)}
          </section>
          <section className="panel category-panel">
            <h3>Gợi ý theo thể loại</h3>
            <div className="category-grid slim">{categories.filter((c) => c !== 'Tất cả').slice(0, 6).map((c) => <button key={c} onClick={() => setCategory(c)}><BookOpen size={18} />{c}</button>)}</div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function StatStrip({ items }) {
  return <div className="stat-strip">{items.map((item) => <div className="stat-box" key={item.label}><IconBadge tone={item.tone}>{item.icon}</IconBadge><div><span>{item.label}</span><b className={`${item.tone || 'blue'}-text`}>{item.value}</b><small>{item.hint}</small></div></div>)}</div>
}

function BorrowedPage({ records, onRenew, onReturn, loadingAction }) {
  const current = records.filter(isBorrowedRecord)
  const dueSoon = current.filter((r) => { const d = daysBetween(r.dueDate); return d !== null && d >= 0 && d <= 3 })
  const overdue = current.filter(isOverdueRecord)
  const canRenew = current.filter((r) => !isOverdueRecord(r)).length
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('due')
  const filtered = useMemo(() => {
    let next = current.filter((r) => {
      if (filter === 'due') { const d = daysBetween(r.dueDate); return d !== null && d >= 0 && d <= 3 }
      if (filter === 'overdue') return isOverdueRecord(r)
      if (filter === 'renew') return !isOverdueRecord(r)
      return true
    })
    if (sort === 'due') next.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    if (sort === 'newest') next.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    return next
  }, [current, filter, sort])

  return (
    <div className="page-content">
      <PageTitle title="Sách đang mượn" desc="Theo dõi danh sách sách bạn đang mượn, hạn trả và thao tác gia hạn hoặc trả sách" />
      <div className="borrowed-layout">
        <main>
          <StatStrip items={[
            { label: 'Đang mượn', value: current.length, hint: 'Sách đang mượn', tone: 'blue', icon: <BookOpen size={26} /> },
            { label: 'Sắp đến hạn', value: dueSoon.length, hint: 'Sách sắp đến hạn', tone: 'orange', icon: <Clock3 size={26} /> },
            { label: 'Quá hạn', value: overdue.length, hint: 'Sách quá hạn', tone: 'red', icon: <AlertTriangle size={26} /> },
            { label: 'Có thể gia hạn', value: canRenew, hint: 'Sách có thể gia hạn', tone: 'green', icon: <RotateCcw size={26} /> },
          ]} />
          <section className="panel table-panel">
            <div className="table-head"><h3>Danh sách sách đang mượn</h3><div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="due">Sắp đến hạn</option><option value="overdue">Quá hạn</option><option value="renew">Có thể gia hạn</option></select><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="due">Sắp đến hạn</option><option value="newest">Mới mượn</option></select><button className="primary-mini"><Download size={16} /> Xuất danh sách</button></div></div>
            {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Trạng thái</th><th>Gia hạn</th><th>Phí phạt</th><th>Thao tác</th></tr></thead><tbody>{filtered.map((r) => {
              const days = daysBetween(r.dueDate)
              const overdueRow = isOverdueRecord(r)
              return <tr key={r.id}><td><div className="book-cell"><BookCover book={r.book?.id ? r.book : { title: r.bookTitle }} size="tiny" /><span><b>{r.bookTitle}</b><small>{r.copyCode}</small></span></div></td><td>{formatDate(r.borrowDate)}</td><td>{formatDate(r.dueDate)}<small className={overdueRow ? 'red-text block' : 'muted block'}>{days !== null ? days < 0 ? `Quá ${Math.abs(days)} ngày` : `Còn ${days} ngày` : ''}</small></td><td><Badge tone={overdueRow ? 'red' : days !== null && days <= 3 ? 'orange' : 'green'}>{overdueRow ? 'Quá hạn' : days !== null && days <= 3 ? 'Sắp đến hạn' : 'Đúng hạn'}</Badge></td><td>{r.renewCount || 0}/2</td><td className={Number(r.estimatedFine || r.fine) > 0 ? 'red-text strong' : ''}>{currency(r.estimatedFine || r.fine)}</td><td><div className="action-row"><button onClick={() => onRenew(r)} disabled={overdueRow || loadingAction === r.id}><RotateCcw size={16} />Gia hạn</button><button onClick={() => onReturn(r)} disabled={loadingAction === r.id}><WalletCards size={16} />Trả sách</button></div></td></tr>
            })}</tbody></table></div> : <EmptyState title="Không có sách đang mượn" />}
          </section>
        </main>
        <aside>
          <section className="panel reminder-panel"><h3>Nhắc nhở hạn trả</h3>{dueSoon.length || overdue.length ? [...dueSoon, ...overdue].slice(0, 3).map((r) => <div className="reminder-item" key={r.id}><IconBadge tone={isOverdueRecord(r) ? 'red' : 'orange'}>{isOverdueRecord(r) ? <AlertTriangle size={22} /> : <Clock3 size={22} />}</IconBadge><span><b>{isOverdueRecord(r) ? 'Sách quá hạn' : 'Sách sắp đến hạn'}</b><small>{r.bookTitle}</small><em>{isOverdueRecord(r) ? 'Trả sách ngay' : `Hạn trả: ${formatDate(r.dueDate)}`}</em></span><ChevronRight size={18} /></div>) : <EmptyState title="Không có nhắc nhở" message="Tất cả sách đang trong hạn." />}</section>
          <section className="panel rule-panel"><h3>Quy định mượn sách</h3><p><Calendar size={20} />Thời gian mượn sách là 14 ngày kể từ ngày mượn.</p><p><RefreshCcw size={20} />Mỗi sách được gia hạn tối đa 2 lần nếu không có người khác đặt mượn.</p><p><AlertTriangle size={20} />Quá hạn sẽ bị tính phí theo quy định của thư viện.</p><p><ShieldCheck size={20} />Vui lòng trả sách đúng hạn để tránh bị khóa quyền mượn.</p></section>
        </aside>
      </div>
    </div>
  )
}

function HistoryPage({ records, fines }) {
  const total = records.length
  const returned = records.filter(isReturnedRecord).length
  const renewed = records.filter((r) => Number(r.renewCount) > 0 || String(r.status).toLowerCase().includes('renew')).length
  const everOverdue = records.filter((r) => isOverdueRecord(r) || Number(r.fine || r.estimatedFine) > 0).length
  const [filter, setFilter] = useState('all')
  const [range, setRange] = useState('30')
  const filtered = useMemo(() => {
    const now = Date.now()
    return records.filter((r) => {
      if (filter === 'returned' && !isReturnedRecord(r)) return false
      if (filter === 'overdue' && !(Number(r.fine || r.estimatedFine) > 0 || isOverdueRecord(r))) return false
      if (filter === 'renewed' && !(Number(r.renewCount) > 0 || String(r.status).toLowerCase().includes('renew'))) return false
      if (range !== 'all') {
        const date = new Date(r.borrowDate || r.returnDate)
        if (!Number.isNaN(date.getTime()) && now - date.getTime() > Number(range) * 86400000) return false
      }
      return true
    })
  }, [records, filter, range])
  const fineTotal = fines.reduce((sum, fine) => sum + Number(fine.amount || 0), 0)

  return (
    <div className="page-content">
      <PageTitle title="Lịch sử mượn trả" desc="Theo dõi toàn bộ lịch sử mượn, trả sách, gia hạn và tình trạng hoàn tất" />
      <div className="borrowed-layout">
        <main>
          <StatStrip items={[
            { label: 'Tổng lượt mượn', value: total, hint: 'Tất cả phiếu mượn', tone: 'blue', icon: <BookOpen size={26} /> },
            { label: 'Đã trả', value: returned, hint: 'Sách đã hoàn tất', tone: 'green', icon: <CheckCircle2 size={26} /> },
            { label: 'Đã gia hạn', value: renewed, hint: 'Lượt gia hạn', tone: 'orange', icon: <RotateCcw size={26} /> },
            { label: 'Phiếu từng quá hạn', value: everOverdue, hint: 'Đã phát sinh quá hạn', tone: 'red', icon: <AlertTriangle size={26} /> },
          ]} />
          <section className="panel table-panel"><div className="table-head"><h3>Lịch sử giao dịch</h3><div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="returned">Đã trả</option><option value="renewed">Đã gia hạn</option><option value="overdue">Có phí/quá hạn</option></select><select value={range} onChange={(e) => setRange(e.target.value)}><option value="30">30 ngày gần đây</option><option value="90">90 ngày gần đây</option><option value="365">1 năm gần đây</option><option value="all">Tất cả</option></select><button className="primary-mini"><FileDown size={16} /> Xuất lịch sử</button></div></div>{filtered.length ? <div className="table-wrap"><table><thead><tr><th>Sách</th><th>Ngày mượn</th><th>Ngày trả</th><th>Trạng thái</th><th>Gia hạn</th><th>Phí phạt</th><th>Ghi chú</th></tr></thead><tbody>{filtered.map((r) => <tr key={r.id}><td><div className="book-cell"><BookCover book={r.book?.id ? r.book : { title: r.bookTitle }} size="tiny" /><span><b>{r.bookTitle}</b><small>{r.copyCode}</small></span></div></td><td>{formatDate(r.borrowDate)}</td><td>{formatDate(r.returnDate || r.dueDate)}</td><td><Badge tone={isReturnedRecord(r) ? 'green' : isOverdueRecord(r) ? 'red' : 'orange'}>{isReturnedRecord(r) ? 'Đã trả' : isOverdueRecord(r) ? 'Quá hạn' : statusText(r.status)}</Badge></td><td>{r.renewCount || 0}/2</td><td className={Number(r.fine || r.estimatedFine) > 0 ? 'red-text strong' : ''}>{currency(r.fine || r.estimatedFine)}</td><td>{isReturnedRecord(r) ? 'Hoàn tất' : isOverdueRecord(r) ? 'Trả trễ' : 'Đang xử lý'}</td></tr>)}</tbody></table></div> : <EmptyState title="Chưa có lịch sử" />}</section>
        </main>
        <aside><section className="panel quick-stats"><h3>Thống kê nhanh</h3><p><BookOpen size={22} />Mượn trong tháng: <b>{records.filter((r) => new Date(r.borrowDate).getMonth() === new Date().getMonth()).length}</b></p><p><CheckCircle2 size={22} />Trả trong tháng: <b>{records.filter((r) => r.returnDate && new Date(r.returnDate).getMonth() === new Date().getMonth()).length}</b></p><p><RotateCcw size={22} />Gia hạn gần đây: <b>{renewed}</b></p><p><AlertTriangle size={22} />Tổng tiền phạt đã phát sinh: <b className="red-text">{currency(fineTotal)}</b></p></section><section className="panel rule-panel"><h3>Lưu ý lịch sử</h3><p><Info size={20} />Lịch sử được lưu cho mọi giao dịch mượn trả.</p><p><AlertTriangle size={20} />Phiếu quá hạn sẽ hiển thị phí phạt tương ứng.</p><p><RefreshCcw size={20} />Mỗi sách được gia hạn tối đa 2 lần.</p><p><Download size={20} />Bạn có thể xuất lịch sử để theo dõi cá nhân.</p></section></aside>
      </div>
    </div>
  )
}

function ProfilePage({ reader, card, records, fines, onSaveProfile }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(reader || {})
  useEffect(() => setForm(reader || {}), [reader])
  const total = records.length
  const returned = records.filter(isReturnedRecord).length
  const overdue = records.filter((r) => isOverdueRecord(r) || Number(r.fine || r.estimatedFine) > 0).length
  const fineTotal = fines.reduce((sum, fine) => sum + Number(fine.amount || 0), 0)

  function update(name, value) { setForm((prev) => ({ ...prev, [name]: value })) }
  async function save() { await onSaveProfile(form); setEditing(false) }

  return (
    <div className="page-content">
      <div className="breadcrumb">Trang chủ <ChevronRight size={16} /> Hồ sơ cá nhân</div>
      <PageTitle title="Hồ sơ cá nhân" desc="Quản lý thông tin cá nhân và tài khoản của bạn" />
      <div className="profile-grid-only">
        <section className="panel profile-info-panel">
          <div className="panel-title"><h3>Thông tin cá nhân</h3><button className="outline-mini" onClick={() => (editing ? save() : setEditing(true))}>{editing ? <Save size={16} /> : <Camera size={16} />}{editing ? 'Lưu' : 'Chỉnh sửa'}</button></div>
          <InfoRow label="Họ và tên" value={form.fullName} editing={editing} onChange={(v) => update('fullName', v)} />
          <InfoRow label="Ngày sinh" value={formatDate(form.dateOfBirth)} editing={editing} type="date" rawValue={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().slice(0,10) : ''} onChange={(v) => update('dateOfBirth', v)} />
          <InfoRow label="Giới tính" value={form.gender || '-'} editing={editing} onChange={(v) => update('gender', v)} />
          <InfoRow label="Email" value={form.email} editing={editing} onChange={(v) => update('email', v)} />
          <InfoRow label="Số điện thoại" value={form.phone || '-'} editing={editing} onChange={(v) => update('phone', v)} />
          <InfoRow label="Địa chỉ" value={form.address || '-'} editing={editing} onChange={(v) => update('address', v)} />
          <InfoRow label="Ngày đăng ký" value={formatDate(form.createdAt)} />
          <div className="info-row"><span>Trạng thái tài khoản</span><b><Badge tone={isActiveStatus(form.status) ? 'green' : 'red'}>{statusText(form.status)}</Badge></b></div>
        </section>
        <section className="panel profile-card-side"><div className="big-avatar">{cleanText(reader?.fullName, 'N').slice(0,1).toUpperCase()}<button><Camera size={17} /></button></div><h2>{reader?.fullName || 'Độc giả'}</h2><Badge>Độc giả</Badge><hr /><div><span>Ngày hết hạn thẻ</span><b>{formatDate(card?.expiredAt || reader?.cardExpiredAt)}</b></div><div><span>Mã độc giả</span><b className="blue-text">{reader?.readerCode || card?.readerCode || '-'}</b></div></section>
        <section className="panel contact-panel"><h3>Thông tin liên hệ</h3><p><Mail size={20} />{reader?.email || '-'}</p><p><Phone size={20} />{reader?.phone || '-'}</p><p><UserRound size={20} />{reader?.address || '-'}</p></section>
        <section className="panel personal-stats"><h3>Thống kê cá nhân</h3><div className="inline-stats"><div><IconBadge><BookOpen size={26} /></IconBadge><b>{total}</b><span>Tổng lượt mượn</span></div><div><IconBadge tone="green"><CheckCircle2 size={26} /></IconBadge><b>{returned}</b><span>Sách đã trả</span></div><div><IconBadge tone="orange"><Clock3 size={26} /></IconBadge><b>{overdue}</b><span>Sách quá hạn</span></div><div><IconBadge tone="red"><AlertTriangle size={26} /></IconBadge><b>{currency(fineTotal)}</b><span>Tổng tiền phạt</span></div></div></section>
      </div>
    </div>
  )
}

function InfoRow({ label, value, rawValue, editing, onChange, type = 'text' }) {
  return <div className="info-row"><span>{label}</span><b>{editing && onChange ? <input type={type} value={rawValue ?? value ?? ''} onChange={(e) => onChange(e.target.value)} /> : value || '-'}</b></div>
}

function LibraryCardPage({ reader, card, records }) {
  const usage = records.slice(0, 5)
  return (
    <div className="page-content">
      <PageTitle title="Thẻ thư viện" desc="Quản lý thông tin thẻ và quyền sử dụng thư viện của bạn" />
      <div className="card-page-grid">
        <main>
          <section className="panel library-card-holder">
            <Badge tone={card?.canBorrow === false || card?.isExpired ? 'red' : 'green'}>{card?.canBorrow === false || card?.isExpired ? 'Không khả dụng' : 'Đang hoạt động'}</Badge>
            <div className="library-card-art">
              <div className="card-logo"><BookOpen size={40} /><span><b>DIGILIB</b><small>THƯ VIỆN SỐ</small></span></div>
              <div className="card-name"><small>HỌ VÀ TÊN</small><b>{reader?.fullName || '-'}</b></div>
              <div className="card-fields"><div><small>MÃ ĐỘC GIẢ</small><b>{card?.readerCode || reader?.readerCode || '-'}</b></div><div><small>LOẠI THẺ</small><b>{reader?.memberType || 'Độc giả'}</b></div></div>
              <div className="card-fields bottom"><div><small>NGÀY CẤP</small><b>{formatDate(card?.issuedAt)}</b></div><div><small>NGÀY HẾT HẠN</small><b>{formatDate(card?.expiredAt)}</b></div></div>
              <img className="qr-img" src={buildQrSvg(card?.cardNumber || reader?.readerCode || 'DIGILIB')} alt="QR thẻ thư viện" />
              <small className="qr-note">Quét mã để xác thực</small>
            </div>
            <div className="card-buttons"><button className="primary-mini"><Download size={17} />Tải thẻ</button><button className="outline-mini" onClick={() => window.print()}><Printer size={17} />In thẻ</button></div>
          </section>
          <section className="panel table-panel"><h3>Lịch sử sử dụng thẻ</h3>{usage.length ? <div className="table-wrap compact"><table><thead><tr><th>Ngày giờ</th><th>Hoạt động</th><th>Kết quả</th><th>Ghi chú</th></tr></thead><tbody>{usage.map((r) => <tr key={r.id}><td>{formatDateTime(r.borrowDate)}</td><td>{isReturnedRecord(r) ? 'Trả sách' : 'Mượn sách'}</td><td><Badge tone="green">Thành công</Badge></td><td>{r.bookTitle}</td></tr>)}</tbody></table></div> : <EmptyState title="Chưa có lịch sử sử dụng" />}</section>
        </main>
        <aside>
          <section className="panel card-info"><h3>Thông tin thẻ</h3><InfoLine icon={<WalletCards size={20} />} label="Mã độc giả" value={card?.readerCode || reader?.readerCode || '-'} /><InfoLine icon={<Calendar size={20} />} label="Ngày cấp" value={formatDate(card?.issuedAt)} /><InfoLine icon={<Calendar size={20} />} label="Ngày hết hạn" value={formatDate(card?.expiredAt)} /><InfoLine icon={<CheckCircle2 size={20} />} label="Trạng thái" value={<Badge tone={card?.canBorrow === false || card?.isExpired ? 'red' : 'green'}>{statusText(card?.status)}</Badge>} /><InfoLine icon={<UserRound size={20} />} label="Hạng thành viên" value={reader?.memberType || 'Độc giả'} /><InfoLine icon={<Star size={20} />} label="Điểm tích lũy" value="120 điểm" /></section>
          <section className="panel rule-panel"><h3>Quyền lợi sử dụng</h3><p><BookOpen size={20} />Mượn tối đa {card?.borrowLimit || 5} sách</p><p><History size={20} />Gia hạn tối đa 2 lần</p><p><Search size={20} />Tra cứu và đặt chỗ tài liệu</p><p><Monitor size={20} />Sử dụng thư viện số</p></section>
          <section className="panel rule-panel"><h3>Lưu ý</h3><p><Info size={20} />Vui lòng mang theo thẻ khi đến thư viện.</p><p><AlertTriangle size={20} />Thẻ hết hạn vui lòng gia hạn để tiếp tục sử dụng.</p><p><AlertTriangle size={20} />Không cho mượn thẻ. Bạn chịu trách nhiệm với mọi hoạt động.</p></section>
        </aside>
      </div>
    </div>
  )
}

function InfoLine({ icon, label, value }) {
  return <div className="info-line"><span>{icon}{label}</span><b>{value}</b></div>
}

function SettingsPage({ reader, card, onSaveProfile, onChangePassword, settings, setSettings }) {
  const [tab, setTab] = useState('account')
  const [form, setForm] = useState(reader || {})
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  useEffect(() => setForm(reader || {}), [reader])
  function updateSetting(name, value) {
    const next = { ...settings, [name]: value }
    setSettings(next)
    saveSettings(next)
  }

  async function saveAccount() { await onSaveProfile(form) }
  async function submitPassword(e) {
    e.preventDefault()
    if (password.newPassword !== password.confirmPassword) { alert('Mật khẩu xác nhận không khớp.'); return }
    await onChangePassword(password)
    setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="page-content">
      <div className="breadcrumb">Trang chủ <ChevronRight size={16} /> Cài đặt</div>
      <PageTitle title="Cài đặt" desc="Quản lý tài khoản và tùy chọn cá nhân của bạn" />
      <div className="tabs"><button className={tab === 'account' ? 'active' : ''} onClick={() => setTab('account')}>Tài khoản</button><button className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>Bảo mật</button><button className={tab === 'notify' ? 'active' : ''} onClick={() => setTab('notify')}>Thông báo</button><button className={tab === 'ui' ? 'active' : ''} onClick={() => setTab('ui')}>Giao diện</button></div>
      {tab === 'account' && <div className="settings-grid"><section className="panel settings-form"><div className="panel-title"><h3>Thông tin tài khoản</h3><button className="outline-mini"><Camera size={16} />Chỉnh sửa</button></div><div className="form-grid"><label>Họ và tên<input value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label><label>Địa chỉ<input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label><label>Email<input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Ngày đăng ký<input value={formatDate(form.createdAt)} disabled /></label><label>Số điện thoại<input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>Mã độc giả<input value={card?.readerCode || form.readerCode || ''} disabled /></label><label>Ngày sinh<input type="date" value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().slice(0,10) : ''} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></label><label>Trạng thái tài khoản<span className="input-like"><Badge tone="green">Đang hoạt động</Badge></span></label></div><div className="radio-row"><span>Giới tính</span>{['Nam','Nữ','Khác'].map((g) => <label key={g}><input type="radio" checked={(form.gender || 'Nam') === g} onChange={() => setForm({ ...form, gender: g })} />{g}</label>)}</div><button className="primary-mini save-settings" onClick={saveAccount}><Save size={16} />Lưu thay đổi</button></section><section className="side-stack"><form className="panel password-panel" onSubmit={submitPassword}><h3><LockKeyhole size={18} />Đổi mật khẩu</h3><label>Mật khẩu hiện tại<input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /></label><label>Mật khẩu mới<input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /></label><label>Xác nhận mật khẩu mới<input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} /></label><button className="primary-mini full">Đổi mật khẩu</button></form><section className="panel danger-zone"><h3>Xóa tài khoản</h3><p>Khi xóa tài khoản, dữ liệu sẽ do Admin xử lý theo quy định hệ thống.</p><button className="danger-outline" onClick={() => alert('Chức năng xóa tài khoản cần Admin/Thủ thư xác nhận.')}>Xóa tài khoản</button></section></section></div>}
      {tab === 'security' && <section className="panel settings-card"><h3>Bảo mật</h3><SettingSwitch label="Yêu cầu xác nhận khi trả sách" checked={settings.confirmReturn !== false} onChange={(v) => updateSetting('confirmReturn', v)} /><SettingSwitch label="Tự động khóa màn hình sau 30 phút" checked={settings.autoLock === true} onChange={(v) => updateSetting('autoLock', v)} /><button className="outline-mini"><LogOut size={16} />Đăng xuất tất cả thiết bị</button></section>}
      {tab === 'notify' && <section className="panel settings-card"><h3>Thông báo</h3><SettingSwitch label="Nhắc hạn trả sách" checked={settings.dueNotify !== false} onChange={(v) => updateSetting('dueNotify', v)} /><SettingSwitch label="Thông báo sách mới" checked={settings.newBookNotify !== false} onChange={(v) => updateSetting('newBookNotify', v)} /><SettingSwitch label="Thông báo phí phạt" checked={settings.fineNotify !== false} onChange={(v) => updateSetting('fineNotify', v)} /></section>}
      {tab === 'ui' && <section className="panel settings-card"><h3>Giao diện</h3><SettingSwitch label="Thu gọn sidebar mặc định" checked={settings.sidebarCollapsed === true} onChange={(v) => updateSetting('sidebarCollapsed', v)} /><SettingSwitch label="Hiển thị ảnh bìa sách" checked={settings.showCovers !== false} onChange={(v) => updateSetting('showCovers', v)} /><button className="outline-mini" onClick={() => { localStorage.removeItem(SETTINGS_KEY); setSettings({}) }}>Khôi phục mặc định</button></section>}
      <section className="panel other-options"><h3>Tùy chọn khác</h3><div><IconBadge><Download size={26} /></IconBadge><span><b>Xuất dữ liệu cá nhân</b><small>Tải về bản sao dữ liệu cá nhân của bạn từ hệ thống.</small><button className="outline-mini">Xuất dữ liệu</button></span></div><div><IconBadge tone="red"><LogOut size={26} /></IconBadge><span><b>Đăng xuất thiết bị khác</b><small>Đăng xuất khỏi tất cả thiết bị khác đang đăng nhập.</small><button className="outline-mini">Đăng xuất tất cả</button></span></div><div><IconBadge tone="orange"><Info size={26} /></IconBadge><span><b>Trợ giúp & Hỗ trợ</b><small>Xem câu hỏi thường gặp hoặc liên hệ hỗ trợ khi cần thiết.</small><button className="outline-mini">Xem hỗ trợ</button></span></div></section>
    </div>
  )
}

function SettingSwitch({ label, checked, onChange }) {
  return <label className="setting-switch"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /></label>
}

function SearchPage({ query, books, onBorrow, onDetail }) {
  return (
    <div className="page-content">
      <PageTitle title="Kết quả tìm kiếm" desc={query ? `Kết quả cho từ khóa “${query}”` : 'Nhập từ khóa ở thanh tìm kiếm phía trên để tra cứu sách'} />
      <section className="panel"><div className="panel-title"><h3>Danh sách sách</h3><span>{books.length} kết quả</span></div>{books.length ? <div className="search-results-grid">{books.map((book) => <BookListCard key={book.id} book={book} onBorrow={onBorrow} onDetail={onDetail} />)}</div> : <EmptyState title="Không tìm thấy sách" message="Thử tìm theo tên sách, tác giả, ISBN hoặc thể loại khác." />}</section>
    </div>
  )
}

function BookDetailModal({ book, copies, onClose, onBorrow }) {
  if (!book) return null
  const available = copies.filter((c) => isAvailableStatus(c.status, c.condition))
  return (
    <div className="modal-backdrop"><section className="book-modal"><button className="modal-close" onClick={onClose}><X size={22} /></button><div className="modal-left"><BookCover book={book} size="large" /><button className="primary-btn compact" onClick={() => onBorrow(book)} disabled={!available.length}>Mượn ngay</button></div><div className="modal-body"><h2>{book.title}</h2><p>{book.description || 'Thông tin mô tả sách đang được cập nhật.'}</p><div className="detail-grid"><div><span>Tác giả</span><b>{book.author}</b></div><div><span>Thể loại</span><b>{book.category}</b></div><div><span>ISBN</span><b>{book.isbn || '-'}</b></div><div><span>Nhà xuất bản</span><b>{book.publisher}</b></div><div><span>Năm xuất bản</span><b>{book.publishedYear || '-'}</b></div><div><span>Tình trạng</span><b>{available.length ? `Còn ${available.length} bản` : 'Hết sách'}</b></div></div><h3>Danh sách bản sao</h3>{copies.length ? <div className="copy-list">{copies.map((copy) => <div key={copy.id}><span><b>{copy.copyCode}</b><small>{copy.location || 'Chưa cập nhật vị trí'}</small></span><Badge tone={isAvailableStatus(copy.status, copy.condition) ? 'green' : 'red'}>{isAvailableStatus(copy.status, copy.condition) ? 'Có thể mượn' : statusText(copy.status)}</Badge></div>)}</div> : <EmptyState title="Chưa có bản sao" />}</div></section></div>
  )
}

function ConfirmModal({ open, title, message, confirmText = 'Xác nhận', onClose, onConfirm, danger }) {
  if (!open) return null
  return <div className="modal-backdrop"><section className="confirm-modal"><h3>{title}</h3><p>{message}</p><div><button className="outline-mini" onClick={onClose}>Hủy</button><button className={danger ? 'danger-btn' : 'primary-mini'} onClick={onConfirm}>{confirmText}</button></div></section></div>
}

export default function App() {
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState(getSavedUser())
  const [reader, setReader] = useState(null)
  const [card, setCard] = useState(null)
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [records, setRecords] = useState([])
  const [catalogLoans, setCatalogLoans] = useState([])
  const [fines, setFines] = useState([])
  const [notifications, setNotifications] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [page, setPage] = useState(PAGE.HOME)
  const [toasts, setToasts] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedCopies, setSelectedCopies] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [settings, setSettings] = useState(getSavedSettings())

  const portalUserId = useMemo(() => getPortalUserId({ user, reader, card }), [user, reader, card])
  const readerNumber = useMemo(() => getReaderNumber(reader, card), [reader, card])

  const addToast = useCallback((title, message = '', type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, message, type }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200)
  }, [])

  const currentRecords = useMemo(() => records.filter(isBorrowedRecord), [records])
  const historyRecords = useMemo(() => [...records].sort((a, b) => new Date(b.borrowDate || 0) - new Date(a.borrowDate || 0)), [records])
  const featuredBooks = useMemo(() => [...books].sort((a, b) => (b.borrowCount || b.availableCopies || 0) - (a.borrowCount || a.availableCopies || 0)).slice(0, 12), [books])

  const loadIdentity = useCallback(async () => {
    let nextUser = user
    try {
      const me = await api.me()
      nextUser = me
      setUser(me)
      saveUser(me)
    } catch (err) {
      if (err.status === 401) throw err
    }

    let nextReader = null
    try {
      nextReader = normalizeReader(await api.readerMe())
      setReader(nextReader)
    } catch (err) {
      try {
        const profile = await api.profile()
        nextReader = normalizeReader(profile)
        setReader(nextReader)
      } catch {
        nextReader = normalizeReader(nextUser || getSavedUser() || {})
        setReader(nextReader)
      }
    }

    try {
      const nextCard = normalizeCard(await api.readerCard(), nextReader)
      setCard(nextCard)
      return { nextUser, nextReader, nextCard }
    } catch {
      const fallbackCard = normalizeCard({}, nextReader)
      setCard(fallbackCard)
      return { nextUser, nextReader, nextCard: fallbackCard }
    }
  }, [user])

  const loadCatalog = useCallback(async () => {
    const [bookRes, categoryRes] = await Promise.allSettled([api.books(), api.categories()])
    if (bookRes.status === 'fulfilled') setBooks(toArray(bookRes.value).map(normalizeBook))
    if (categoryRes.status === 'fulfilled') setCategories(toArray(categoryRes.value))
  }, [])

  const loadReaderActivity = useCallback(async (nextReader = reader, nextCard = card, nextUser = user) => {
    const nextPortalUserId = getPortalUserId({ user: nextUser, reader: nextReader, card: nextCard })
    const nextReaderNumber = getReaderNumber(nextReader, nextCard)
    const cardNumber = nextCard?.cardNumber || nextReader?.cardNumber || nextReader?.readerCode

    const [recordRes, fineRes, notiRes, catCurrentRes, catHistoryRes] = await Promise.allSettled([
      api.records(cardNumber ? { cardNumber } : { readerId: nextReaderNumber }),
      api.fines(cardNumber ? { cardNumber } : { readerId: nextReaderNumber }),
      api.notifications(nextPortalUserId),
      api.catalogBorrowingsCurrent(nextPortalUserId),
      api.catalogBorrowingsHistory(nextPortalUserId),
    ])

    if (recordRes.status === 'fulfilled') {
      let items = toArray(recordRes.value).map(normalizeRecord)
      if (!cardNumber && nextReader?.fullName) items = items.filter((r) => matchRecordForReader(r, nextReader, nextCard))
      setRecords(items)
    }
    if (fineRes.status === 'fulfilled') setFines(toArray(fineRes.value).map(normalizeFine))
    if (notiRes.status === 'fulfilled') setNotifications(toArray(notiRes.value).map(normalizeNotification))
    const catalogItems = []
    if (catCurrentRes.status === 'fulfilled') catalogItems.push(...toArray(catCurrentRes.value).map(normalizeRecord))
    if (catHistoryRes.status === 'fulfilled') catalogItems.push(...toArray(catHistoryRes.value).map(normalizeRecord))
    setCatalogLoans(catalogItems)
  }, [reader, card, user])

  const loadAll = useCallback(async () => {
    if (!getToken()) {
      setAuthReady(true)
      return
    }
    setLoading(true)
    try {
      const identity = await loadIdentity()
      await Promise.all([loadCatalog(), loadReaderActivity(identity.nextReader, identity.nextCard, identity.nextUser)])
    } catch (err) {
      if (err.status === 401) {
        clearAuth()
        setUser(null)
        addToast('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại.', 'error')
      } else {
        addToast('Không tải được dữ liệu', getErrorMessage(err), 'error')
      }
    } finally {
      setLoading(false)
      setAuthReady(true)
    }
  }, [addToast, loadCatalog, loadIdentity, loadReaderActivity])

  useEffect(() => {
    const sharedSession = readSharedSessionFromUrl()

    if (sharedSession?.token) {
      saveToken(sharedSession.token)
      saveUser(sharedSession.user)
      setUser(sharedSession.user)
      removeSessionFromUrl()
    }

    loadAll()
  }, [])

  async function handleLogin(nextUser) {
    setUser(nextUser)
    setAuthReady(false)
    await loadAll()
    addToast('Đăng nhập thành công', 'Chào mừng bạn quay lại DIGILIB Reader.')
  }

  async function handleSearch(query) {
    const q = cleanText(query, '')
    setSearchQuery(q)
    setPage(PAGE.SEARCH)
    if (!q) {
      setSearchResults(books)
      return
    }
    setLoading(true)
    try {
      const result = await api.searchBooks({ keyword: q, title: q, author: q, category: q, isbn: q })
      const list = toArray(result).map(normalizeBook)
      setSearchResults(list)
      if (!list.length) addToast('Không tìm thấy sách', `Không có kết quả phù hợp với “${q}”.`, 'warning')
    } catch (err) {
      const fallback = books.filter((b) => removeVietnamese([b.title, b.author, b.category, b.isbn].join(' ')).includes(removeVietnamese(q)))
      setSearchResults(fallback)
      addToast('Tìm kiếm qua API không thành công', 'Đã lọc tạm trên dữ liệu sách đã tải.', 'warning')
    } finally {
      setLoading(false)
    }
  }

  async function handleCategory(name) {
    if (!name) return
    setSearchText(name)
    await handleSearch(name)
  }

  async function openBookDetail(book) {
    setLoadingAction(book.id)
    try {
      const [detailRes, copyRes, availabilityRes] = await Promise.allSettled([
        api.book(book.id),
        api.bookCopies(book.id),
        api.bookAvailability(book.id),
      ])
      let detail = book
      if (detailRes.status === 'fulfilled') detail = normalizeBook(detailRes.value)
      let copies = []
      if (copyRes.status === 'fulfilled') copies = toArray(copyRes.value).map(normalizeCopy)
      if (!copies.length && availabilityRes.status === 'fulfilled') copies = toArray(availabilityRes.value?.copies).map(normalizeCopy)
      if (availabilityRes.status === 'fulfilled') {
        const a = availabilityRes.value || {}
        detail = { ...detail, availableCopies: Number(a.availableCopies ?? detail.availableCopies), totalCopies: Number(a.totalCopies ?? detail.totalCopies) }
      }
      setSelectedBook(detail)
      setSelectedCopies(copies)
    } catch (err) {
      addToast('Không mở được chi tiết sách', getErrorMessage(err), 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleBorrow(book) {
    if (!reader) {
      addToast('Chưa có hồ sơ độc giả', 'Vui lòng đăng nhập bằng tài khoản độc giả.', 'error')
      return
    }
    setLoadingAction(book.id)
    try {
      const copyRes = await api.bookCopies(book.id).catch(() => [])
      const copies = toArray(copyRes).map(normalizeCopy)
      const copy = copies.find((c) => isAvailableStatus(c.status, c.condition))
      if (!copy) throw new Error('Sách hiện không còn bản sao khả dụng để mượn.')

      // Gửi yêu cầu vào Catalog để tạo thông báo cho độc giả.
      await api.catalogBorrow(portalUserId, { bookId: Number(book.id), copyId: Number(copy.copyId || copy.id), days: 14, note: 'Độc giả gửi yêu cầu mượn từ DIGILIB Reader.' }).catch(() => null)

      // Đồng bộ nghiệp vụ sang Circulation để Thủ thư/Admin nhìn thấy trên màn quản lý mượn trả.
      await api.createRecord({
        readerId: readerNumber,
        readerName: reader.fullName || user?.fullName || 'Độc giả',
        cardNumber: card?.cardNumber || reader.cardNumber || reader.readerCode || '',
        copyCode: copy.copyCode || copy.barcode,
        bookId: Number(book.id),
        bookTitle: book.title,
        borrowDate: new Date().toISOString(),
      })

      addToast('Mượn sách thành công', `Sách “${book.title}” đã được ghi nhận trong Circulation Service.`)
      setSelectedBook(null)
      await Promise.all([loadCatalog(), loadReaderActivity()])
    } catch (err) {
      addToast('Không mượn được sách', getErrorMessage(err), 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  function confirmRenew(record) {
    setConfirm({ title: 'Gia hạn sách', message: `Bạn muốn gia hạn sách “${record.bookTitle}” thêm 7 ngày?`, confirmText: 'Gia hạn', action: () => handleRenew(record) })
  }

  async function handleRenew(record) {
    setConfirm(null)
    setLoadingAction(record.id)
    try {
      await api.renewRecord(record.id, { days: 7 })
      await api.catalogRenew(portalUserId, record.id).catch(() => null)
      addToast('Gia hạn thành công', `Đã gia hạn sách “${record.bookTitle}”.`)
      await loadReaderActivity()
    } catch (err) {
      addToast('Không gia hạn được', getErrorMessage(err), 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  function confirmReturn(record) {
    setConfirm({ title: 'Trả sách', message: `Xác nhận trả sách “${record.bookTitle}”?`, confirmText: 'Trả sách', danger: true, action: () => handleReturn(record) })
  }

  async function handleReturn(record) {
    setConfirm(null)
    setLoadingAction(record.id)
    try {
      await api.returnRecord(record.id, { returnDate: new Date().toISOString() })
      await api.catalogReturn(portalUserId, record.id).catch(() => null)
      addToast('Trả sách thành công', `Đã ghi nhận trả sách “${record.bookTitle}”.`)
      await Promise.all([loadCatalog(), loadReaderActivity()])
    } catch (err) {
      addToast('Không trả được sách', getErrorMessage(err), 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleSaveProfile(form) {
    try {
      await api.updateProfile({ fullName: form.fullName, email: form.email, phone: form.phone, dateOfBirth: form.dateOfBirth || null, gender: form.gender, address: form.address })
      addToast('Đã lưu hồ sơ', 'Thông tin cá nhân đã được cập nhật.')
      const nextReader = normalizeReader(await api.readerMe())
      setReader(nextReader)
    } catch (err) {
      addToast('Không lưu được hồ sơ', getErrorMessage(err), 'error')
    }
  }

  async function handleChangePassword(payload) {
    try {
      await api.changePassword(payload)
      addToast('Đã đổi mật khẩu', 'Mật khẩu tài khoản đã được cập nhật.')
    } catch (err) {
      addToast('Không đổi được mật khẩu', getErrorMessage(err), 'error')
    }
  }

  async function markNotification(id) {
    try {
      await api.markNotification(portalUserId, id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      addToast('Không cập nhật được thông báo', getErrorMessage(err), 'error')
    }
  }

  async function markAllNotifications() {
    try {
      await api.markAllNotifications(portalUserId)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      addToast('Không cập nhật được thông báo', getErrorMessage(err), 'error')
    }
  }

  function logout() {
    clearAuth()
    setUser(null)
    setReader(null)
    setCard(null)
    setRecords([])
    setNotifications([])
    setPage(PAGE.HOME)
  }

  if (!authReady) {
    return (
      <div className="loading-screen">
        <BookOpen size={42} />
        <b>Đang tải DIGILIB Reader...</b>
      </div>
    )
  }

  if (!getToken()) {
    return <SharedLoginRedirect />
  }

  return (
    <>
      <AppShell page={page} setPage={setPage} user={user} reader={reader} card={card} searchText={searchText} setSearchText={setSearchText} onSearch={handleSearch} notifications={notifications} onMarkNotification={markNotification} onMarkAllNotifications={markAllNotifications} onRefresh={loadAll} onLogout={logout}>
        {loading && <div className="top-loading" />}
        {page === PAGE.HOME && <HomePage reader={reader} featuredBooks={featuredBooks} books={books} currentRecords={currentRecords} categories={categories} onPage={setPage} onBorrow={handleBorrow} onDetail={openBookDetail} onCategory={handleCategory} />}
        {page === PAGE.FEATURED && <FeaturedPage books={featuredBooks.length ? featuredBooks : books} onBorrow={handleBorrow} onDetail={openBookDetail} onCategory={handleCategory} />}
        {page === PAGE.BORROWED && <BorrowedPage records={records} onRenew={confirmRenew} onReturn={confirmReturn} loadingAction={loadingAction} />}
        {page === PAGE.HISTORY && <HistoryPage records={historyRecords} fines={fines} />}
        {page === PAGE.PROFILE && <ProfilePage reader={reader} card={card} records={historyRecords} fines={fines} onSaveProfile={handleSaveProfile} />}
        {page === PAGE.CARD && <LibraryCardPage reader={reader} card={card} records={historyRecords} />}
        {page === PAGE.SETTINGS && <SettingsPage reader={reader} card={card} onSaveProfile={handleSaveProfile} onChangePassword={handleChangePassword} settings={settings} setSettings={setSettings} />}
        {page === PAGE.SEARCH && <SearchPage query={searchQuery} books={searchQuery ? searchResults : books} onBorrow={handleBorrow} onDetail={openBookDetail} />}
      </AppShell>
      <BookDetailModal book={selectedBook} copies={selectedCopies} onClose={() => setSelectedBook(null)} onBorrow={handleBorrow} />
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} confirmText={confirm?.confirmText} danger={confirm?.danger} onClose={() => setConfirm(null)} onConfirm={confirm?.action} />
      <ToastStack toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  )
}
