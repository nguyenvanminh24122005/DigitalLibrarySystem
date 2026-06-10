import api from './api'

export const catalogApi = {
  getBooks(params) {
    return api.get('/catalog/books', { params })
  },
  getBook(id) {
    return api.get(`/catalog/books/${id}`)
  },
  createBook(data) {
    return api.post('/catalog/books', data)
  },
  updateBook(id, data) {
    return api.put(`/catalog/books/${id}`, data)
  },
  deleteBook(id) {
    return api.delete(`/catalog/books/${id}`)
  },
  searchBooks(params) {
    return api.get('/catalog/search', { params })
  },
  // Categories
  getCategories() {
    return api.get('/catalog/categories')
  },
  createCategory(data) {
    return api.post('/catalog/categories', data)
  },
  updateCategory(id, data) {
    return api.put(`/catalog/categories/${id}`, data)
  },
  deleteCategory(id) {
    return api.delete(`/catalog/categories/${id}`)
  },
  // Book Copies
  getCopies(bookId) {
    return api.get(`/catalog/books/${bookId}/copies`)
  },
  createCopy(bookId, data) {
    return api.post(`/catalog/books/${bookId}/copies`, data)
  },
  updateCopy(copyId, data) {
    return api.put(`/catalog/copies/${copyId}`, data)
  },
  deleteCopy(copyId) {
    return api.delete(`/catalog/copies/${copyId}`)
  },
  getCopyAvailability(copyId) {
    return api.get(`/catalog/copies/${copyId}/availability`)
  },
  updateCopyStatus(copyId, data) {
    return api.put(`/catalog/copies/${copyId}/status`, data)
  },
}
