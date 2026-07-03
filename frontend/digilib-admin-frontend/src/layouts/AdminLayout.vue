<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="sidebar">
      <RouterLink to="/dashboard" class="logo">
        <span class="logo-icon"><v-icon icon="mdi-book-open-page-variant" /></span>
        <span class="logo-text">DIGILIB <span>ADMIN</span></span>
      </RouterLink>

      <div class="nav-scroll">
        <div class="nav-section-title">Tổng quan</div>
        <RouterLink to="/dashboard" class="nav-item"><v-icon icon="mdi-home-outline" /> <span>Tổng quan hệ thống</span></RouterLink>

        <div class="nav-section-title">Catalog Service - Nhóm 1</div>
        <RouterLink to="/books" class="nav-item"><v-icon icon="mdi-book-open-outline" /> <span>Sách</span></RouterLink>
        <RouterLink to="/copies" class="nav-item"><v-icon icon="mdi-package-variant" /> <span>Bản sao & Tồn kho</span></RouterLink>
        <RouterLink to="/categories" class="nav-item"><v-icon icon="mdi-shape-outline" /> <span>Thể loại</span></RouterLink>
        <RouterLink to="/authors" class="nav-item"><v-icon icon="mdi-account-edit-outline" /> <span>Tác giả</span></RouterLink>
        <RouterLink to="/publishers" class="nav-item"><v-icon icon="mdi-bank-outline" /> <span>Nhà xuất bản</span></RouterLink>

        <div class="nav-section-title">Identity & Report - Nhóm 3</div>
        <RouterLink to="/users" class="nav-item"><v-icon icon="mdi-account-group-outline" /> <span>Người dùng</span></RouterLink>
        <RouterLink to="/readers" class="nav-item"><v-icon icon="mdi-account-outline" /> <span>Độc giả</span></RouterLink>
        <RouterLink to="/roles" class="nav-item"><v-icon icon="mdi-shield-key-outline" /> <span>Vai trò & Phân quyền</span></RouterLink>
        <RouterLink to="/reports" class="nav-item"><v-icon icon="mdi-chart-box-outline" /> <span>Báo cáo thống kê</span></RouterLink>
        <RouterLink to="/logs" class="nav-item"><v-icon icon="mdi-text-box-search-outline" /> <span>Nhật ký hệ thống</span></RouterLink>

        <div class="nav-section-title">Hệ thống</div>
        <RouterLink to="/settings" class="nav-item"><v-icon icon="mdi-cog-outline" /> <span>Cài đặt hệ thống</span></RouterLink>
        <RouterLink to="/profile" class="nav-item"><v-icon icon="mdi-account-circle-outline" /> <span>Hồ sơ cá nhân</span></RouterLink>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <v-btn icon="mdi-menu" variant="outlined" rounded="lg" @click="sidebarCollapsed = !sidebarCollapsed" />

        <div class="topbar-right">
          <div class="search-wrap" ref="searchBoxRef">
            <div class="search-box" :class="{ active: searchFocused }">
              <v-icon icon="mdi-magnify" />
              <input
                ref="searchInputRef"
                v-model="searchKeyword"
                placeholder="Tìm kiếm nhanh..."
                @focus="searchFocused = true"
                @keydown.enter.prevent="goFirstSearchResult"
              />
              <span class="shortcut">Ctrl + K</span>
            </div>
            <div v-if="searchFocused && filteredSearchItems.length" class="dropdown-panel search-panel">
              <button v-for="item in filteredSearchItems" :key="item.path" type="button" class="dropdown-item" @click="goTo(item.path)">
                <v-icon :icon="item.icon" />
                <span>{{ item.label }}</span>
              </button>
            </div>
          </div>

          <div class="dropdown-wrap" ref="notificationRef">
            <v-badge :content="unreadCount" color="error" :model-value="unreadCount > 0">
              <v-btn icon="mdi-bell-outline" variant="text" @click="notificationOpen = !notificationOpen" />
            </v-badge>
            <div v-if="notificationOpen" class="dropdown-panel notification-panel">
              <div class="dropdown-head">
                <b>Thông báo</b>
                <button type="button" @click="markNotificationsRead">Đánh dấu đã đọc</button>
              </div>
              <button v-for="item in notifications" :key="item.id" type="button" class="notification-item" @click="openNotification(item)">
                <span class="dot" :class="{ unread: !item.read }"></span>
                <span>
                  <b>{{ item.title }}</b>
                  <small>{{ item.description }}</small>
                </span>
              </button>
            </div>
          </div>

          <div class="dropdown-wrap" ref="profileMenuRef">
            <button class="profile-button" type="button" @click="profileOpen = !profileOpen">
              <img v-if="auth.user?.avatar" class="avatar" :src="auth.user.avatar" alt="Admin" />
              <div v-else class="avatar-fallback">{{ auth.initials || 'A' }}</div>
              <div class="profile-meta">
                <div>{{ auth.user?.name || 'Admin' }}</div>
                <span>{{ auth.user?.role || 'Admin' }}</span>
              </div>
              <v-icon icon="mdi-chevron-down" size="18" />
            </button>
            <div v-if="profileOpen" class="dropdown-panel profile-panel">
              <button type="button" class="dropdown-item" @click="goTo('/profile')"><v-icon icon="mdi-account-circle-outline" /> Hồ sơ cá nhân</button>
              <button type="button" class="dropdown-item" @click="goTo('/settings')"><v-icon icon="mdi-cog-outline" /> Cài đặt hệ thống</button>
              <button type="button" class="dropdown-item" @click="goTo('/logs')"><v-icon icon="mdi-text-box-search-outline" /> Nhật ký hệ thống</button>
              <div class="divider"></div>
              <button type="button" class="dropdown-item danger" @click="logout"><v-icon icon="mdi-logout" /> Đăng xuất</button>
            </div>
          </div>
        </div>
      </header>
      <section class="content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const sidebarCollapsed = ref(false)
const searchKeyword = ref('')
const searchFocused = ref(false)
const notificationOpen = ref(false)
const profileOpen = ref(false)
const searchInputRef = ref(null)
const searchBoxRef = ref(null)
const notificationRef = ref(null)
const profileMenuRef = ref(null)

const quickLinks = [
  { label: 'Tổng quan hệ thống', path: '/dashboard', icon: 'mdi-home-outline' },
  { label: 'Sách', path: '/books', icon: 'mdi-book-open-outline' },
  { label: 'Bản sao & Tồn kho', path: '/copies', icon: 'mdi-package-variant' },
  { label: 'Thể loại', path: '/categories', icon: 'mdi-shape-outline' },
  { label: 'Tác giả', path: '/authors', icon: 'mdi-account-edit-outline' },
  { label: 'Nhà xuất bản', path: '/publishers', icon: 'mdi-bank-outline' },
  { label: 'Người dùng', path: '/users', icon: 'mdi-account-group-outline' },
  { label: 'Độc giả', path: '/readers', icon: 'mdi-account-outline' },
  { label: 'Vai trò & Phân quyền', path: '/roles', icon: 'mdi-shield-key-outline' },
  { label: 'Báo cáo thống kê', path: '/reports', icon: 'mdi-chart-box-outline' },
  { label: 'Nhật ký hệ thống', path: '/logs', icon: 'mdi-text-box-search-outline' },
  { label: 'Cài đặt hệ thống', path: '/settings', icon: 'mdi-cog-outline' },
  { label: 'Hồ sơ cá nhân', path: '/profile', icon: 'mdi-account-circle-outline' }
]

const notifications = ref([
  { id: 1, title: 'Báo cáo', description: 'Có thể đồng bộ báo cáo mới từ events.', path: '/reports', read: false },
  { id: 2, title: 'Nhật ký', description: 'Kiểm tra nhật ký hệ thống gần đây.', path: '/logs', read: false },
  { id: 3, title: 'Hồ sơ', description: 'Cập nhật thông tin tài khoản admin.', path: '/profile', read: false }
])

const unreadCount = computed(() => notifications.value.filter((x) => !x.read).length)
const filteredSearchItems = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return quickLinks.slice(0, 6)
  return quickLinks.filter((x) => x.label.toLowerCase().includes(keyword)).slice(0, 8)
})

function goTo(path) {
  searchFocused.value = false
  notificationOpen.value = false
  profileOpen.value = false
  searchKeyword.value = ''
  router.push(path)
}

function goFirstSearchResult() {
  const first = filteredSearchItems.value[0]
  if (first) goTo(first.path)
}

function markNotificationsRead() {
  notifications.value = notifications.value.map((x) => ({ ...x, read: true }))
}

function openNotification(item) {
  item.read = true
  goTo(item.path)
}

function logout() {
  auth.logout()
  router.push('/login')
}

function handleShortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInputRef.value?.focus()
  }
}

function handleClickOutside(event) {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target)) searchFocused.value = false
  if (notificationRef.value && !notificationRef.value.contains(event.target)) notificationOpen.value = false
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) profileOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', handleShortcut)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-shell.sidebar-collapsed .sidebar {
  width: 88px;
}
.app-shell.sidebar-collapsed .logo-text,
.app-shell.sidebar-collapsed .nav-section-title,
.app-shell.sidebar-collapsed .nav-item span {
  display: none;
}
.app-shell.sidebar-collapsed .main {
  margin-left: 88px;
}
.app-shell.sidebar-collapsed .nav-item {
  justify-content: center;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-wrap,
.dropdown-wrap {
  position: relative;
}
.search-box.active {
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px #eff6ff;
}
.shortcut {
  font-size: 12px;
  background: #f1f5f9;
  border-radius: 7px;
  padding: 3px 7px;
  white-space: nowrap;
}
.dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
  z-index: 40;
  padding: 8px;
}
.search-panel {
  left: 0;
  right: auto;
  width: 460px;
}
.notification-panel {
  width: 340px;
}
.profile-panel {
  width: 240px;
}
.dropdown-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px 12px;
}
.dropdown-head button {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 800;
  cursor: pointer;
}
.dropdown-item,
.notification-item {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  color: #334155;
  font-weight: 700;
}
.dropdown-item:hover,
.notification-item:hover {
  background: #f8fafc;
  color: #2563eb;
}
.dropdown-item.danger {
  color: #ef4444;
}
.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 0;
}
.notification-item small {
  display: block;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #cbd5e1;
  flex: 0 0 auto;
}
.dot.unread {
  background: #ef4444;
}
.profile-button {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 16px;
  padding: 6px 8px;
  color: inherit;
}
.profile-button:hover {
  background: #f8fafc;
}
.profile-meta {
  text-align: left;
}
.profile-meta div {
  font-weight: 800;
}
.profile-meta span {
  font-size: 12px;
  color: #64748b;
}
.avatar,
.avatar-fallback {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}
.avatar {
  object-fit: cover;
}
.avatar-fallback {
  display: grid;
  place-items: center;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 900;
}
@media (max-width: 900px) {
  .search-box {
    width: 260px;
  }
  .profile-meta,
  .shortcut {
    display: none;
  }
}
</style>
