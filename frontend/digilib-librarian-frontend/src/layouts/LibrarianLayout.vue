<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <i class="mdi mdi-book-open-page-variant-outline"></i>
        <div>DIGILIB<br><span>THỦ THƯ</span></div>
      </div>

      <div class="nav-title">Tổng quan</div>
      <RouterLink class="nav-link" to="/dashboard"><i class="mdi mdi-home-outline"></i>Tổng quan</RouterLink>

      <div class="nav-title">Nghiệp vụ</div>
      <RouterLink class="nav-link" to="/borrow"><i class="mdi mdi-book-plus-outline"></i>Mượn sách</RouterLink>
      <RouterLink class="nav-link" to="/return"><i class="mdi mdi-book-check-outline"></i>Trả sách</RouterLink>
      <RouterLink class="nav-link" to="/renew"><i class="mdi mdi-calendar-refresh-outline"></i>Gia hạn sách</RouterLink>
      <RouterLink class="nav-link" to="/readers"><i class="mdi mdi-account-group-outline"></i>Bạn đọc</RouterLink>
      <RouterLink class="nav-link" to="/books"><i class="mdi mdi-magnify"></i>Tra cứu sách</RouterLink>
      <RouterLink class="nav-link" to="/overdue"><i class="mdi mdi-clock-alert-outline"></i>Sách quá hạn</RouterLink>
      <RouterLink class="nav-link" to="/fines"><i class="mdi mdi-cash-multiple"></i>Phí phạt</RouterLink>
      <RouterLink class="nav-link" to="/history"><i class="mdi mdi-history"></i>Lịch sử mượn trả</RouterLink>

      <div class="nav-title">Hệ thống</div>
      <RouterLink class="nav-link" to="/profile"><i class="mdi mdi-account-circle-outline"></i>Hồ sơ cá nhân</RouterLink>
      <button class="nav-link" style="width:100%;border:0;background:transparent" @click="logout"><i class="mdi mdi-logout"></i>Đăng xuất</button>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="menu-btn" @click="compact = !compact"><i class="mdi mdi-menu"></i></button>
        <div class="search">
          <i class="mdi mdi-magnify"></i>
          <input v-model="quick" placeholder="Tìm kiếm sách, bạn đọc, mã thẻ..." @keyup.enter="goQuick" />
          <span class="kbd">Ctrl + K</span>
        </div>
        <button class="icon-btn" @click="showNotify = !showNotify"><i class="mdi mdi-bell-outline"></i></button>
        <div class="user">
          <div class="avatar">{{ initials }}</div>
          <button class="btn" @click="showUser = !showUser" style="border:0;background:transparent;padding:0 4px">
            <div style="text-align:left">
              <div class="user-name">{{ user.fullName || user.email || 'Thủ thư' }}</div>
              <div class="user-role">Thủ thư</div>
            </div>
            <i class="mdi mdi-chevron-down"></i>
          </button>
          <div v-if="showUser" class="dropdown">
            <RouterLink to="/profile" @click="showUser=false"><i class="mdi mdi-account-outline"></i>Hồ sơ cá nhân</RouterLink>
            <button @click="logout"><i class="mdi mdi-logout"></i>Đăng xuất</button>
          </div>
        </div>
        <div v-if="showNotify" class="dropdown" style="right:120px;top:62px;width:300px">
          <button><i class="mdi mdi-alert-circle-outline"></i>Kiểm tra sách quá hạn</button>
          <button><i class="mdi mdi-cash-clock"></i>Kiểm tra phí phạt chưa thu</button>
          <button><i class="mdi mdi-book-search-outline"></i>Tra cứu sách còn bản sao</button>
        </div>
      </header>
      <section class="content"><router-view /></section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUser } from '../services/api'

const router = useRouter()
const quick = ref('')
const compact = ref(false)
const showUser = ref(false)
const showNotify = ref(false)
const user = ref(getUser())
const initials = computed(() => (user.value.fullName || user.value.email || 'TT').split(' ').map(x => x[0]).join('').slice(-2).toUpperCase())

function logout() {
  localStorage.removeItem('librarian_token')
  localStorage.removeItem('digilib_token')
  localStorage.removeItem('librarian_user')
  localStorage.removeItem('digilib_user')
  router.push('/login')
}
function goQuick() {
  const q = quick.value.trim()
  if (!q) return
  router.push({ path: '/books', query: { q } })
}
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault(); document.querySelector('.search input')?.focus()
    }
  })
})
</script>
