import { createRouter, createWebHistory } from 'vue-router'

import UserLayout from '../layouts/UserLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

import LandingPage from '../views/LandingPage.vue'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const readJson = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const getToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('library_token') ||
    ''
  )
}

const getCurrentUser = () => {
  return (
    readJson('library_current_user') ||
    readJson('library_auth_user') ||
    readJson('user') ||
    null
  )
}

const getRole = () => {
  const user = getCurrentUser()

  return String(
    localStorage.getItem('role') ||
      user?.role ||
      user?.userRole ||
      ''
  ).toLowerCase()
}

const isLoggedIn = () => {
  return Boolean(getToken() || getCurrentUser())
}

const isAdminUser = () => {
  const role = getRole()

  return (
    role === 'admin' ||
    role === 'administrator' ||
    role === 'librarian' ||
    role === 'thu-thu' ||
    role === 'thủ thư' ||
    role.includes('admin')
  )
}

const routes = [
  {
    path: '/',
    component: UserLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: LandingPage,
        meta: {
          title: 'Trang chủ',
          requiresAuth: true,
          role: 'user'
        }
      },

      // Không dùng trang Catalog riêng nữa.
      // Các link cũ sẽ quay về LandingPage và cuộn tới đúng khu vực.
      {
        path: 'catalog',
        name: 'catalog-redirect',
        redirect: {
          name: 'home',
          hash: '#books'
        }
      },
      {
        path: 'books',
        name: 'books-redirect',
        redirect: {
          name: 'home',
          hash: '#books'
        }
      },
      {
        path: 'books/:id',
        name: 'book-detail-redirect',
        redirect: {
          name: 'home',
          hash: '#books'
        }
      },
      {
        path: 'profile',
        name: 'profile-redirect',
        redirect: {
          name: 'home',
          hash: '#card'
        }
      },
      {
        path: 'card',
        name: 'card-redirect',
        redirect: {
          name: 'home',
          hash: '#card'
        }
      },
      {
        path: 'history',
        name: 'history-redirect',
        redirect: {
          name: 'home',
          hash: '#history'
        }
      }
    ]
  },

  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        alias: ['/auth/login'],
        name: 'login',
        component: LoginView,
        meta: {
          title: 'Đăng nhập',
          guestOnly: true,
          authMode: 'login'
        }
      },
      {
        path: 'register',
        alias: ['/auth/register'],
        name: 'register',
        component: LoginView,
        meta: {
          title: 'Đăng ký',
          guestOnly: true,
          authMode: 'register'
        }
      }
    ]
  },

  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: {
          title: 'Admin Dashboard',
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 90
      }
    }

    return {
      top: 0,
      behavior: 'smooth'
    }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title
    ? `${to.meta.title} | Thư viện số`
    : 'Thư viện số'

  const loggedIn = isLoggedIn()
  const admin = isAdminUser()

  if (to.meta?.guestOnly && loggedIn) {
    if (admin) {
      next('/admin/dashboard')
      return
    }

    next('/')
    return
  }

  if (to.meta?.requiresAuth && !loggedIn) {
    next('/login')
    return
  }

  if (to.meta?.requiresAdmin && !admin) {
    next('/')
    return
  }

  if (to.name === 'home' && loggedIn && admin) {
    next('/admin/dashboard')
    return
  }

  next()
})

export default router