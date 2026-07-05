import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const LandingView = () => import('../views/LandingView.vue')
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

function adminPage(path, name, component) {
  return {
    path,
    component: AdminLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name,
        component
      }
    ]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
      meta: {
        public: true
      }
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        public: true
      }
    },

    adminPage('/dashboard', 'dashboard', DashboardView),
    adminPage('/books', 'books', BooksView),
    adminPage('/copies', 'copies', CopiesView),
    adminPage('/categories', 'categories', CategoryView),
    adminPage('/authors', 'authors', AuthorView),
    adminPage('/publishers', 'publishers', PublisherView),
    adminPage('/users', 'users', UsersView),
    adminPage('/readers', 'readers', ReadersView),
    adminPage('/roles', 'roles', RolesView),
    adminPage('/reports', 'reports', ReportsView),
    adminPage('/logs', 'logs', LogsView),
    adminPage('/settings', 'settings', SettingsView),
    adminPage('/profile', 'profile', ProfileView),

    {
      path: '/books/new',
      component: AdminLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'books-new',
          component: AddBookView
        }
      ]
    },

    {
      path: '/books/:id',
      component: AdminLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'books-detail',
          component: BookDetailView
        }
      ]
    },

    {
      path: '/users/new',
      component: AdminLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'users-new',
          component: AddUserView
        }
      ]
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

function normalizeRole(role) {
  return String(role || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

function getRole(user = {}) {
  return (
    user.role ||
    user.roleName ||
    user.Role ||
    user.RoleName ||
    user.userRole ||
    user.accountType ||
    user.type ||
    ''
  )
}

function isAdminPortalRole(role) {
  const value = normalizeRole(role)

  return (
    value.includes('admin') ||
    value.includes('quan ly') ||
    value.includes('quan tri') ||
    value.includes('administrator') ||
    value.includes('bao cao')
  )
}

router.beforeEach((to) => {
  const auth = useAuthStore()

  const isPublicPage = to.matched.some((record) => record.meta.public)
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (isPublicPage) {
    return true
  }

  if (requiresAuth && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (requiresAuth && auth.isAuthenticated && auth.user) {
    if (!isAdminPortalRole(getRole(auth.user))) {
      auth.logout()
      return '/login'
    }
  }

  if (to.name === 'login' && auth.isAuthenticated && auth.user) {
    if (isAdminPortalRole(getRole(auth.user))) {
      return '/dashboard'
    }

    auth.logout()
    return true
  }

  return true
})

export default router