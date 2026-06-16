import { defineStore } from 'pinia'

const TOKEN_KEY = 'token'
const ROLE_KEY = 'role'
const USER_KEY = 'user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    role: localStorage.getItem(ROLE_KEY) || '',
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  }),

  getters: {
    isAuthenticated: (state) => {
      return !!state.token
    },

    isAdmin: (state) => {
      return state.role === 'admin'
    },

    currentUser: (state) => {
      return state.user
    }
  },

  actions: {
    login(token, role, user) {
      this.token = token
      this.role = role
      this.user = user

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(ROLE_KEY, role)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      // Các key này để LandingPage/Header cũ của bạn vẫn đọc được
      if (role === 'admin') {
        localStorage.setItem('isAdmin', 'true')
        localStorage.setItem('library_auth_user', JSON.stringify(user))
      } else {
        localStorage.setItem('isAdmin', 'false')
        localStorage.setItem('library_current_user', JSON.stringify(user))
        localStorage.setItem('library_auth_user', JSON.stringify(user))
      }

      localStorage.setItem('accessToken', token)
    },

    logout() {
      this.token = ''
      this.role = ''
      this.user = null

      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('library_current_user')
      localStorage.removeItem('library_auth_user')
    }
  }
})
