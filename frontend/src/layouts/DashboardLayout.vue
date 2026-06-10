<template>
  <div class="d-flex" style="min-height: 100vh;">
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="sidebarOpen"
      :rail="rail"
      permanent
      color="white"
      width="260"
      border="e"
    >
      <div class="d-flex align-center pa-4" style="height: 64px;">
        <v-icon color="primary" size="32" class="mr-3">mdi-book-open-page-variant</v-icon>
        <span v-if="!rail" class="text-h6 font-weight-bold text-primary">DigiLib</span>
      </div>

      <v-divider />

      <v-list nav density="compact" class="pa-3">
        <template v-for="item in menuItems" :key="item.to">
          <v-list-item
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            rounded="lg"
            class="mb-1"
            color="primary"
          />
        </template>
      </v-list>

      <template #append>
        <v-divider />
        <div class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" size="36" class="mr-3">
              <span class="text-white text-body-2 font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
            <div v-if="!rail">
              <p class="text-body-2 font-weight-medium text-grey-darken-3 mb-0">{{ auth.user?.fullName || auth.user?.username || 'User' }}</p>
              <p class="text-caption text-grey">{{ auth.role }}</p>
            </div>
          </div>
          <v-btn
            block
            variant="text"
            color="error"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            <span v-if="!rail">Đăng xuất</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main content -->
    <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
      <!-- Header -->
      <v-app-bar color="white" elevation="0" density="comfortable" border="b">
        <v-app-bar-nav-icon @click="rail = !rail" class="d-none d-lg-flex" />
        <v-app-bar-nav-icon @click="sidebarOpen = !sidebarOpen" class="d-lg-none" />
        <v-app-bar-title class="text-subtitle-1 font-weight-medium text-grey-darken-2">
          Hệ thống Quản lý Thư viện Số
        </v-app-bar-title>
        <v-spacer />
        <v-btn icon variant="text" color="grey">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main class="bg-grey-lighten-4">
        <v-container fluid class="pa-6 pa-md-8">
          <router-view />
        </v-container>
      </v-main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(true)
const rail = ref(false)

const userInitials = computed(() => {
  const name = auth.user?.fullName || auth.user?.username || 'U'
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
})

const menuItems = computed(() => {
  const role = auth.role
  const items = [
    { icon: 'mdi-view-dashboard', title: 'Dashboard', to: '/dashboard', roles: ['Admin', 'Librarian', 'Reader'] },
    { icon: 'mdi-bookshelf', title: 'Quản lý sách', to: '/dashboard/books', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-shape', title: 'Thể loại', to: '/dashboard/categories', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-book-multiple', title: 'Bản sao sách', to: '/dashboard/copies', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-account-group', title: 'Quản lý độc giả', to: '/dashboard/readers', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-card-account-details', title: 'Thẻ thư viện', to: '/dashboard/cards', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-book-plus', title: 'Mượn sách', to: '/dashboard/borrow', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-book-arrow-left', title: 'Trả sách', to: '/dashboard/return', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-clipboard-list', title: 'Phiếu mượn', to: '/dashboard/borrow-records', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-alert-circle', title: 'Sách quá hạn', to: '/dashboard/overdue', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-cash', title: 'Phí phạt / Công nợ', to: '/dashboard/fines', roles: ['Admin', 'Librarian'] },
    { icon: 'mdi-chart-bar', title: 'Báo cáo thống kê', to: '/dashboard/reports', roles: ['Admin'] },
  ]
  return items.filter(i => i.roles.includes(role))
})

function handleLogout() {
  auth.logout()
  router.push({ name: 'Login' })
}
</script>
