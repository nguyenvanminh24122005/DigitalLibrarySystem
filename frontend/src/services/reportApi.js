import api from './api'

export const reportApi = {
  getDashboard() {
    return api.get('/reports/dashboard')
  },
  getBorrowingReport(params) {
    return api.get('/reports/borrowing', { params })
  },
  getBooksReport(params) {
    return api.get('/reports/books', { params })
  },
  getFinesReport(params) {
    return api.get('/reports/fines', { params })
  },
  // Readers (identity service)
  getReaders() {
    return api.get('/identity/readers')
  },
  getReader(id) {
    return api.get(`/identity/readers/${id}`)
  },
  createReader(data) {
    return api.post('/identity/readers', data)
  },
  updateReader(id, data) {
    return api.put(`/identity/readers/${id}`, data)
  },
  deleteReader(id) {
    return api.delete(`/identity/readers/${id}`)
  },
  // Library Cards
  getCards() {
    return api.get('/identity/cards')
  },
  createCard(data) {
    return api.post('/identity/cards', data)
  },
  lockCard(id) {
    return api.put(`/identity/cards/${id}/lock`)
  },
  renewCard(id) {
    return api.put(`/identity/cards/${id}/renew`)
  },
  // Users
  getUsers() {
    return api.get('/identity/users')
  },
}
