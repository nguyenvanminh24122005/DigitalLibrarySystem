import api from './api'

export const circulationApi = {
  getBorrowings(params) {
    return api.get('/circulation/borrowings', { params })
  },
  getBorrowing(id) {
    return api.get(`/circulation/borrowings/${id}`)
  },
  createBorrowing(data) {
    return api.post('/circulation/borrowings', data)
  },
  returnBorrowing(id) {
    return api.put(`/circulation/borrowings/${id}/return`)
  },
  cancelBorrowing(id) {
    return api.put(`/circulation/borrowings/${id}/cancel`)
  },
  getOverdue() {
    return api.get('/circulation/overdue')
  },
  getFines() {
    return api.get('/circulation/fines')
  },
  payFine(id) {
    return api.put(`/circulation/fines/${id}/pay`)
  },
  getPolicies() {
    return api.get('/circulation/policies')
  },
  updatePolicy(id, data) {
    return api.put(`/circulation/policies/${id}`, data)
  },
  getStats() {
    return api.get('/circulation/stats')
  },
}
