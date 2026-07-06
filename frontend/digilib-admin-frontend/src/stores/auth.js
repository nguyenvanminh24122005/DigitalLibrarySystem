import { defineStore } from 'pinia'
import { authApi } from '../services/api'

const TOKEN_KEYS = [
  'digilib_token',
  'digilib_admin_token',
  'admin_token',
  'librarian_token',
  'reader_token',
  'user_token',
  'token',
  'auth_token',
  'accessToken',
  'authToken'
]

const USER_KEYS = [
  'digilib_user',
  'digilib_admin_user',
  'admin_user',
  'librarian_user',
  'reader_user',
  'digilib_reader_user',
  'user',
  'auth_user'
]

const AUTH_STORAGE_KEYS = [...TOKEN_KEYS, ...USER_KEYS]

function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  sessionStorage.clear()
}

function safeJsonParse(value) {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
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

function getStoredUser() {
  for (const key of USER_KEYS) {
    const value = safeJsonParse(localStorage.getItem(key))

    if (value) {
      return normalizeUser(value)
    }
  }

  return null
}

function normalizeRole(role) {
  if (!role) return 'Admin'

  const raw = String(role).trim()
  const lower = raw.toLowerCase()

  if (lower.includes('admin')) return 'Admin'
  if (lower.includes('librarian') || lower.includes('thủ thư') || lower.includes('thu thu')) {
    return 'Thủ thư'
  }
  if (lower.includes('reader') || lower.includes('độc giả') || lower.includes('doc gia')) {
    return 'Độc giả'
  }

  return raw
}

function normalizeUser(user) {
  if (!user) return null

  const source = user?.user || user?.data?.user || user?.profile || user

  const name =
    source.fullName ||
    source.name ||
    source.username ||
    source.email ||
    'Admin'

  return {
    id: source.id || source.userId || source.accountId || '',
    name,
    fullName: source.fullName || name,
    username: source.username || '',
    email: source.email || '',
    phone: source.phone || source.phoneNumber || '',
    role: normalizeRole(source.roleName || source.role || source.userRole || 'Admin'),
    status: source.status || 'Active',
    avatar: source.avatar || source.avatarUrl || ''
  }
}

function extractPayload(data) {
  return data?.data || data?.result || data || {}
}

function extractToken(payload, rawData) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.access_token ||
    payload?.jwtToken ||
    payload?.jwt ||
    rawData?.token ||
    rawData?.accessToken ||
    rawData?.access_token ||
    rawData?.jwtToken ||
    rawData?.jwt ||
    ''
  )
}

function extractUser(payload, rawData) {
  return (
    payload?.user ||
    payload?.account ||
    payload?.profile ||
    rawData?.user ||
    rawData?.account ||
    rawData?.profile ||
    payload
  )
}

function saveAuthStorage(token, user) {
  const normalizedUser = normalizeUser(user)
  const role = String(normalizedUser?.role || '').toLowerCase()

  localStorage.setItem('digilib_token', token)
  localStorage.setItem('token', token)
  localStorage.setItem('digilib_user', JSON.stringify(normalizedUser))
  localStorage.setItem('user', JSON.stringify(normalizedUser))

  if (role.includes('admin')) {
    localStorage.setItem('admin_token', token)
    localStorage.setItem('digilib_admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(normalizedUser))
    localStorage.setItem('digilib_admin_user', JSON.stringify(normalizedUser))
  }

  if (role.includes('thủ thư') || role.includes('librarian')) {
    localStorage.setItem('librarian_token', token)
    localStorage.setItem('librarian_user', JSON.stringify(normalizedUser))
  }

  if (role.includes('độc giả') || role.includes('reader')) {
    localStorage.setItem('reader_token', token)
    localStorage.setItem('reader_user', JSON.stringify(normalizedUser))
  }

  return normalizedUser
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getStoredToken(),
    user: getStoredUser(),
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),

    isAdmin: (state) => {
      const role = String(state.user?.role || '').toLowerCase()

      return (
        role.includes('admin') ||
        role.includes('quản lý') ||
        role.includes('bao cao') ||
        role.includes('báo cáo')
      )
    },

    isLibrarian: (state) => {
      const role = String(state.user?.role || '').toLowerCase()

      return role.includes('thủ thư') || role.includes('librarian')
    },

    isReader: (state) => {
      const role = String(state.user?.role || '').toLowerCase()

      return role.includes('độc giả') || role.includes('reader')
    },

    initials: (state) => {
      const name =
        state.user?.name ||
        state.user?.fullName ||
        state.user?.username ||
        state.user?.email ||
        'A'

      const initials = String(name)
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((item) => item[0])
        .join('')
        .toUpperCase()

      return initials || 'A'
    }
  },

  actions: {
    hydrate() {
      this.token = getStoredToken()
      this.user = getStoredUser()
    },

    setAuth(token, userPayload) {
      if (!token) {
        throw new Error('Không có token đăng nhập')
      }

      const user = saveAuthStorage(token, userPayload)

      this.token = token
      this.user = user

      return user
    },

    async login(usernameOrPayload, password) {
      if (!usernameOrPayload) {
        throw new Error('Vui lòng nhập tài khoản')
      }

      let payload

      if (typeof usernameOrPayload === 'object') {
        payload = usernameOrPayload
      } else {
        if (!password) {
          throw new Error('Vui lòng nhập mật khẩu')
        }

        payload = {
          usernameOrEmail: usernameOrPayload,
          password
        }
      }

      this.loading = true

      try {
        const { data } = await authApi.login(payload)
        const responsePayload = extractPayload(data)
        const token = extractToken(responsePayload, data)
        const userPayload = extractUser(responsePayload, data)

        if (!token) {
          throw new Error('API không trả về token đăng nhập')
        }

        const user = saveAuthStorage(token, userPayload)

        this.token = token
        this.user = user

        return user
      } finally {
        this.loading = false
      }
    },

    async register(payload) {
      const { data } = await authApi.register(payload)
      const responsePayload = extractPayload(data)
      const token = extractToken(responsePayload, data)
      const userPayload = extractUser(responsePayload, data)

      if (!token) {
        return normalizeUser(userPayload)
      }

      const user = saveAuthStorage(token, userPayload)

      this.token = token
      this.user = user

      return user
    },

    async refreshMe() {
      if (!this.token) {
        return null
      }

      const { data } = await authApi.me()
      const responsePayload = extractPayload(data)
      const userPayload = extractUser(responsePayload, data)
      const user = normalizeUser(userPayload)

      this.user = user

      localStorage.setItem('digilib_user', JSON.stringify(user))
      localStorage.setItem('user', JSON.stringify(user))

      const role = String(user?.role || '').toLowerCase()

      if (role.includes('admin')) {
        localStorage.setItem('admin_user', JSON.stringify(user))
        localStorage.setItem('digilib_admin_user', JSON.stringify(user))
      }

      return user
    },

    logout() {
      this.token = ''
      this.user = null
      clearAuthStorage()
    },

    clearAuth() {
      this.logout()
    }
  }
})