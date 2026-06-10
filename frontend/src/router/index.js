import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  // Public pages
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('../pages/public/Home.vue') },
      { path: 'about', name: 'About', component: () => import('../pages/public/About.vue') },
      { path: 'guide', name: 'Guide', component: () => import('../pages/public/Guide.vue') },
      { path: 'contact', name: 'Contact', component: () => import('../pages/public/Contact.vue') },
    ],
  },
  // Auth
  { path: '/login', name: 'Login', component: () => import('../pages/auth/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../pages/auth/Register.vue') },
  // Dashboard (requires auth)
  {
    path: '/dashboard',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/dashboard/Dashboard.vue') },
      // Catalog
      { path: 'books', name: 'Books', component: () => import('../pages/catalog/Books.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'books/new', name: 'BookCreate', component: () => import('../pages/catalog/BookForm.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'books/:id/edit', name: 'BookEdit', component: () => import('../pages/catalog/BookForm.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'categories', name: 'Categories', component: () => import('../pages/catalog/Categories.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'copies', name: 'BookCopies', component: () => import('../pages/catalog/BookCopies.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      // Identity
      { path: 'readers', name: 'Readers', component: () => import('../pages/identity/Readers.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'readers/new', name: 'ReaderCreate', component: () => import('../pages/identity/ReaderForm.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'readers/:id/edit', name: 'ReaderEdit', component: () => import('../pages/identity/ReaderForm.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'cards', name: 'LibraryCards', component: () => import('../pages/identity/LibraryCards.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      // Circulation
      { path: 'borrow', name: 'Borrow', component: () => import('../pages/circulation/Borrow.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'return', name: 'Return', component: () => import('../pages/circulation/Return.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'borrow-records', name: 'BorrowRecords', component: () => import('../pages/circulation/BorrowRecords.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'overdue', name: 'Overdue', component: () => import('../pages/circulation/Overdue.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      { path: 'fines', name: 'Fines', component: () => import('../pages/circulation/Fines.vue'), meta: { roles: ['Admin', 'Librarian'] } },
      // Reports
      { path: 'reports', name: 'Reports', component: () => import('../pages/reports/Reports.vue'), meta: { roles: ['Admin'] } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Login' })
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
