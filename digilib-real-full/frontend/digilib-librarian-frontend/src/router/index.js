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

router.beforeEach((to) => {
  const token = localStorage.getItem('librarian_token') || localStorage.getItem('digilib_token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'
  return true
})

export default router
