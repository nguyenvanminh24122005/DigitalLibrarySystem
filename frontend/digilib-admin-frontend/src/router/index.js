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
  ],
  scrollBehavior() {
    return {
      top: 0
    }
  }
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

const TOKEN_STORAGE_KEYS = [
  'digilib_token',
  'admin_token',
  'digilib_admin_token',
  'librarian_token',
  'reader_token',
  'token',
  'accessToken',
  'authToken',
  'auth_token',
  'user_token'
]

const USER_STORAGE_KEYS = [
  'digilib_user',
  'admin_user',
  'digilib_admin_user',
  'librarian_user',
  'reader_user',
  'user'
]

function readStoredUser() {
  for (const key of USER_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key)

      if (!raw) continue

      const user = JSON.parse(raw)

      if (user && typeof user === 'object') {
        return user
      }
    } catch {
      localStorage.removeItem(key)
    }
  }

  return null
}

function hasStoredToken() {
  return TOKEN_STORAGE_KEYS.some((key) => Boolean(localStorage.getItem(key)))
}

function clearWrongPortalSession(auth) {
  try {
    auth.logout()
  } catch {
    ;[
      ...TOKEN_STORAGE_KEYS,
      ...USER_STORAGE_KEYS
    ].forEach((key) => localStorage.removeItem(key))
    sessionStorage.clear()
  }
}

router.beforeEach((to) => {
  const auth = useAuthStore()

  const isPublicPage = to.matched.some((record) => record.meta.public)
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  const storeUser = auth.user || null
  const storedUser = readStoredUser()
  const currentUser = storeUser || storedUser

  const authenticated =
    auth.isAuthenticated ||
    hasStoredToken()

  if (to.name === 'login') {
    if (!authenticated || !currentUser) {
      return true
    }

    if (isAdminPortalRole(getRole(currentUser))) {
      return {
        path: '/dashboard'
      }
    }

    clearWrongPortalSession(auth)

    return true
  }

  if (isPublicPage) {
    return true
  }

  if (requiresAuth && !authenticated) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (requiresAuth && authenticated && currentUser) {
    if (!isAdminPortalRole(getRole(currentUser))) {
      clearWrongPortalSession(auth)

      return {
        path: '/login'
      }
    }
  }

  return true
})

export default router