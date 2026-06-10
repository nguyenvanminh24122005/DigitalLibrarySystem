import api from './api'

export const authApi = {
  login(email, password) {
    return api.post('/identity/auth/login', { email, password })
  },
  register(data) {
    return api.post('/identity/auth/register', data)
  },
  getMe() {
    return api.get('/identity/users/me')
  },
}
