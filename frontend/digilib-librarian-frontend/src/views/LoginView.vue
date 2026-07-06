<template>
  <main class="auth-page">
    <section class="auth-shell">
      <aside class="hero-panel">
        <div class="hero-badge"><i class="mdi mdi-account-tie-outline"></i> Cổng thủ thư</div>
        <h1>Xử lý mượn, trả, gia hạn bằng dữ liệu thật</h1>
        <p>
          Tài khoản thủ thư do Admin cấp. Thủ thư đăng nhập để tạo phiếu mượn,
          trả sách, gia hạn sách, xử lý quá hạn và thu phí phạt.
        </p>

        <div class="hero-grid">
          <div><i class="mdi mdi-book-arrow-right-outline"></i><span>Mượn sách</span></div>
          <div><i class="mdi mdi-book-arrow-left-outline"></i><span>Trả sách</span></div>
          <div><i class="mdi mdi-calendar-refresh-outline"></i><span>Gia hạn</span></div>
          <div><i class="mdi mdi-cash-check"></i><span>Thu phí</span></div>
        </div>

        <div class="quick-links">
          <button type="button" @click="openPortal(adminUrl)"><i class="mdi mdi-view-dashboard-outline"></i> Admin</button>
          <button type="button" @click="openPortal(userUrl)"><i class="mdi mdi-account-group-outline"></i> Độc giả</button>
        </div>
      </aside>

      <form class="auth-card" @submit.prevent="login">
        <div class="brand">
          <div class="logo"><i class="mdi mdi-book-open-page-variant-outline"></i></div>
          <div>
            <h2>DIGILIB <span>THỦ THƯ</span></h2>
            <p>Nghiệp vụ mượn trả thư viện số</p>
          </div>
        </div>

        <div class="form-title">
          <h3>Đăng nhập thủ thư</h3>
          <p>Chỉ tài khoản có vai trò Thủ thư hoặc Admin mới được truy cập cổng này.</p>
        </div>

        <label class="field">
          <span>Email hoặc tài khoản</span>
          <div class="input-wrap">
            <i class="mdi mdi-account-outline"></i>
            <input v-model.trim="form.email" placeholder="librarian@digilib.edu.vn" autocomplete="username" required />
          </div>
        </label>

        <label class="field">
          <span>Mật khẩu</span>
          <div class="input-wrap">
            <i class="mdi mdi-lock-outline"></i>
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Nhập mật khẩu" autocomplete="current-password" required />
            <button type="button" class="icon-btn" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'mdi mdi-eye-off-outline' : 'mdi mdi-eye-outline'"></i>
            </button>
          </div>
        </label>

        <div class="form-row">
          <label class="check"><input v-model="rememberMe" type="checkbox" /> <span>Ghi nhớ tài khoản</span></label>
          <button type="button" class="link-btn" @click="forgotPassword">Quên mật khẩu?</button>
        </div>

        <div v-if="error" class="alert error"><i class="mdi mdi-alert-circle-outline"></i>{{ error }}</div>
        <div v-if="success" class="alert success"><i class="mdi mdi-check-circle-outline"></i>{{ success }}</div>

        <button class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <i v-else class="mdi mdi-login"></i>
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>

        <p class="note">Chưa có tài khoản thủ thư? Hãy yêu cầu Admin tạo trong mục <b>Người dùng</b>.</p>
      </form>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, getErrorMessage, isLibrarianRole } from '../services/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const form = reactive({ email: '', password: '' })

function getPublicUrl(port) {
  return `${window.location.protocol}//${window.location.hostname}:${port}`
}

const adminUrl = import.meta.env.VITE_ADMIN_URL || import.meta.env.VITE_ADMIN_PORTAL_URL || getPublicUrl(5173)
const userUrl = import.meta.env.VITE_USER_URL || import.meta.env.VITE_READER_PORTAL_URL || getPublicUrl(5175)

onMounted(() => {
  const remembered = localStorage.getItem('digilib_librarian_remember_email')
  if (remembered) {
    form.email = remembered
    rememberMe.value = true
  }
})

function openPortal(base) {
  window.location.href = String(base).replace(/\/$/, '')
}
function saveRemember() {
  if (rememberMe.value) localStorage.setItem('digilib_librarian_remember_email', form.email)
  else localStorage.removeItem('digilib_librarian_remember_email')
}
function forgotPassword() {
  error.value = ''
  success.value = 'Chức năng quên mật khẩu có thể tích hợp email SMTP. Hiện hãy liên hệ Admin để đặt lại mật khẩu.'
}

async function login() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const { data } = await authApi.login({ usernameOrEmail: form.email, password: form.password })
    const token = data.token || data.accessToken || data.jwtToken || data.data?.token
    const user = data.user || data.data?.user || data
    if (!token) throw new Error('API không trả về token.')
    const role = user.role || user.roleName || data.role || data.roleName
    if (!isLibrarianRole(role)) throw new Error('Tài khoản này không có quyền vào giao diện Thủ thư.')
    localStorage.setItem('librarian_token', token)
    localStorage.setItem('digilib_token', token)
    localStorage.setItem('librarian_user', JSON.stringify(user))
    localStorage.setItem('digilib_user', JSON.stringify(user))
    saveRemember()
    router.push('/dashboard')
  } catch (e) {
    error.value = getErrorMessage(e, 'Đăng nhập thất bại.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page{min-height:100vh;padding:32px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 90% 10%,rgba(37,99,235,.16),transparent 26%),radial-gradient(circle at 2% 86%,rgba(14,165,233,.12),transparent 28%),linear-gradient(135deg,#f8fbff,#eef5ff 55%,#f8fbff);color:#0f172a}.auth-shell{width:min(1120px,100%);display:grid;grid-template-columns:1.05fr .95fr;gap:24px}.hero-panel,.auth-card{border:1px solid rgba(226,232,240,.92);background:rgba(255,255,255,.94);border-radius:32px;box-shadow:0 30px 90px rgba(15,23,42,.12);backdrop-filter:blur(18px)}.hero-panel{position:relative;overflow:hidden;padding:44px;display:flex;flex-direction:column;justify-content:space-between;min-height:620px;background:linear-gradient(145deg,#0f172a,#1d4ed8 50%,#2563eb)}.hero-panel:before{content:"";position:absolute;right:-90px;top:-90px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.12)}.hero-panel:after{content:"";position:absolute;left:-80px;bottom:-110px;width:330px;height:330px;border-radius:50%;background:rgba(255,255,255,.1)}.hero-panel>*{position:relative;z-index:1}.hero-badge{width:max-content;padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);color:#dbeafe;font-weight:900;display:flex;gap:8px;align-items:center}.hero-panel h1{margin:42px 0 18px;color:#fff;font-size:46px;line-height:1.05;letter-spacing:-1.5px}.hero-panel p{margin:0;color:#dbeafe;font-size:17px;line-height:1.7;max-width:560px}.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:42px}.hero-grid div{padding:16px;border-radius:18px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);color:#fff;font-weight:900;display:flex;gap:12px;align-items:center}.hero-grid i{font-size:24px;color:#bfdbfe}.quick-links{display:flex;gap:12px;flex-wrap:wrap}.quick-links button{border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.13);color:#fff;border-radius:14px;padding:12px 16px;font-weight:950;cursor:pointer}.auth-card{padding:42px 46px;align-self:center}.brand{display:flex;align-items:center;gap:16px;margin-bottom:32px}.logo{width:62px;height:62px;border-radius:20px;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:34px}.brand h2{margin:0;font-size:29px;letter-spacing:2px;font-weight:950}.brand h2 span{color:#2563eb}.brand p{margin:5px 0 0;color:#64748b;font-weight:700}.form-title{margin-bottom:24px}.form-title h3{font-size:31px;margin:0;font-weight:950}.form-title p{margin:8px 0 0;color:#64748b;line-height:1.5}.field{display:block;margin-bottom:17px}.field>span{display:block;margin-bottom:8px;font-weight:900;color:#334155}.input-wrap{height:56px;border:1px solid #cbd5e1;border-radius:15px;background:#fff;display:flex;align-items:center;gap:12px;padding:0 15px;transition:.18s}.input-wrap:focus-within{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.1)}.input-wrap i{font-size:22px;color:#64748b}.input-wrap input{border:0;outline:0;background:transparent;flex:1;font-size:15px;color:#0f172a;min-width:0}.icon-btn{border:0;background:transparent;color:#64748b;cursor:pointer;padding:4px}.form-row{display:flex;justify-content:space-between;align-items:center;margin:2px 0 20px}.check{display:flex;align-items:center;gap:9px;color:#64748b;font-weight:800;font-size:14px}.check input{width:18px;height:18px;accent-color:#2563eb}.link-btn{border:0;background:transparent;color:#2563eb;font-weight:950;cursor:pointer}.alert{border-radius:14px;padding:12px 14px;margin-bottom:15px;display:flex;align-items:flex-start;gap:8px;font-weight:800;font-size:14px}.alert.error{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}.alert.success{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}.submit-btn{width:100%;height:58px;border:0;border-radius:16px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:17px;font-weight:950;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 18px 35px rgba(37,99,235,.28)}.submit-btn:disabled{opacity:.7;cursor:not-allowed}.spinner{width:18px;height:18px;border:3px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:999px;animation:spin .85s linear infinite}.note{text-align:center;margin:18px 0 0;color:#64748b;font-size:14px;font-weight:700}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:980px){.auth-shell{grid-template-columns:1fr}.hero-panel{min-height:auto}.hero-panel h1{font-size:38px}.hero-grid{margin-bottom:28px}}@media(max-width:640px){.auth-page{padding:16px}.auth-card,.hero-panel{padding:26px;border-radius:24px}.hero-grid{grid-template-columns:1fr}.form-row{align-items:flex-start;flex-direction:column;gap:10px}.brand h2{font-size:23px}}
</style>
