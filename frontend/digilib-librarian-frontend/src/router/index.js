import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import LibrarianLayout from '../layouts/LibrarianLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import BorrowView from '../views/BorrowView.vue'
import ReturnView from '../views/ReturnView.vue'
import RenewView from '../views/RenewView.vue'
import ReadersView from '../views/ReadersView.vue'
import BookSearchView from '../views/BookSearchView.vue'
import OverdueView from '../views/OverdueView.vue'
import FinesView from '../views/FinesView.vue'
import HistoryView from '../views/HistoryView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    component: LibrarianLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'borrow', name: 'borrow', component: BorrowView },
      { path: 'return', name: 'return', component: ReturnView },
      { path: 'renew', name: 'renew', component: RenewView },
      { path: 'readers', name: 'readers', component: ReadersView },
      { path: 'books', name: 'books', component: BookSearchView },
      { path: 'overdue', name: 'overdue', component: OverdueView },
      { path: 'fines', name: 'fines', component: FinesView },
      { path: 'history', name: 'history', component: HistoryView },
      { path: 'profile', name: 'profile', component: ProfileView }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({ history: createWebHistory(), routes })

function acceptSessionFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('session')
  if (!encoded) return false

  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(encoded))))
    if (!payload?.token) return false
    localStorage.setItem('librarian_token', payload.token)
    localStorage.setItem('digilib_token', payload.token)
    if (payload.user) {
      localStorage.setItem('librarian_user', JSON.stringify(payload.user))
      localStorage.setItem('digilib_user', JSON.stringify(payload.user))
    }
    window.history.replaceState({}, document.title, window.location.pathname || '/dashboard')
    return true
  } catch {
    return false
  }
}

router.beforeEach((to) => {
  acceptSessionFromUrl()
  const token = localStorage.getItem('librarian_token') || localStorage.getItem('digilib_token')
  if (!token && (to.meta.requiresAuth || to.path === '/login')) {
    const login = new URL(window.location.href)
    login.port = '5173'
    login.pathname = '/login'
    login.search = ''
    login.hash = ''
    window.location.href = login.toString()
    return false
  }
  if (to.path === '/login' && token) return '/dashboard'
  return true
})

export default router
