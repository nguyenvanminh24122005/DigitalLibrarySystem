import { defineStore } from 'pinia'
import { authApi } from '../services/api'

function normalizeUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.fullName || user.name || user.username || user.email || 'Admin',
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.roleName || user.role || '',
    status: user.status,
    avatar: user.avatar || user.avatarUrl || ''
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('digilib_token') || '',
    user: JSON.parse(localStorage.getItem('digilib_user') || 'null')
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => ['Admin', 'Quản lý Catalog', 'Báo cáo viên'].includes(state.user?.role),
    isLibrarian: (state) => state.user?.role === 'Thủ thư',
    isReader: (state) => state.user?.role === 'Độc giả',
    initials: (state) => {
      const name = state.user?.name || state.user?.username || 'A'
      return name
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((x) => x[0])
        .join('')
        .toUpperCase()
    }
  },
  actions: {
    async login(username, password) {
      if (!username || !password) throw new Error('Vui lòng nhập đầy đủ tài khoản và mật khẩu')
      const { data } = await authApi.login({ usernameOrEmail: username, password })
      const payload = data?.data || data || {}
      const token = payload.token || payload.accessToken || payload.jwtToken || data?.token || data?.accessToken || data?.jwtToken
      const user = payload.user || data?.user || payload
      if (!token) throw new Error('API không trả về token đăng nhập')
      this.token = token
      this.user = normalizeUser(user)
      localStorage.setItem('digilib_token', this.token)
      localStorage.setItem('digilib_user', JSON.stringify(this.user))
      return this.user
    },
    async register(payload) {
      const { data } = await authApi.register(payload)
      const responsePayload = data?.data || data || {}
      const token = responsePayload.token || responsePayload.accessToken || responsePayload.jwtToken || data?.token || data?.accessToken || data?.jwtToken
      const user = responsePayload.user || data?.user || responsePayload
      if (!token) return normalizeUser(user)
      this.token = token
      this.user = normalizeUser(user)
      localStorage.setItem('digilib_token', this.token)
      localStorage.setItem('digilib_user', JSON.stringify(this.user))
      return this.user
    },
    async refreshMe() {
      if (!this.token) return null
      const { data } = await authApi.me()
      this.user = normalizeUser(data)
      localStorage.setItem('digilib_user', JSON.stringify(this.user))
      return this.user
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('digilib_token')
      localStorage.removeItem('digilib_user')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
