import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const LoginView = () => import('../views/LoginView.vue')
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const BooksView = () => import('../views/BooksView.vue')
const AddBookView = () => import('../views/AddBookView.vue')
const BookDetailView = () => import('../views/BookDetailView.vue')
const CopiesView = () => import('../views/CopiesView.vue')
const CategoryView = () => import('../views/CategoryView.vue')
const AuthorView = () => import('../views/AuthorView.vue')
const PublisherView = () => import('../views/PublisherView.vue')
const UsersView = () => import('../views/UsersView.vue')
const AddUserView = () => import('../views/AddUserView.vue')
const ReadersView = () => import('../views/ReadersView.vue')
const RolesView = () => import('../views/RolesView.vue')
const ReportsView = () => import('../views/ReportsView.vue')
const LogsView = () => import('../views/LogsView.vue')
const SettingsView = () => import('../views/SettingsView.vue')
const ProfileView = () => import('../views/ProfileView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'books', name: 'books', component: BooksView },
        { path: 'books/new', name: 'books-new', component: AddBookView },
        { path: 'books/:id', name: 'books-detail', component: BookDetailView },
        { path: 'copies', name: 'copies', component: CopiesView },
        { path: 'categories', name: 'categories', component: CategoryView },
        { path: 'authors', name: 'authors', component: AuthorView },
        { path: 'publishers', name: 'publishers', component: PublisherView },
        { path: 'users', name: 'users', component: UsersView },
        { path: 'users/new', name: 'users-new', component: AddUserView },
        { path: 'readers', name: 'readers', component: ReadersView },
        { path: 'roles', name: 'roles', component: RolesView },
        { path: 'reports', name: 'reports', component: ReportsView },
        { path: 'logs', name: 'logs', component: LogsView },
        { path: 'settings', name: 'settings', component: SettingsView },
        { path: 'profile', name: 'profile', component: ProfileView }
      ]
    }
  ]
})

function isAdminPortalRole(role) {
  const value = String(role || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return value.includes('admin') || value.includes('quan ly') || value.includes('quan tri') || value.includes('bao cao')
}

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name === 'login' && auth.isAuthenticated && auth.user && !isAdminPortalRole(auth.user.role)) {
    auth.logout()
    return true
  }
  if (!to.meta.public && !auth.isAuthenticated) return '/login'
  if (!to.meta.public && auth.isAuthenticated && auth.user && !isAdminPortalRole(auth.user.role)) {
    auth.logout()
    return '/login'
  }
  if (to.name === 'login' && auth.isAuthenticated) return '/dashboard'
})

export default router
