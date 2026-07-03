<template>
  <main class="auth-page">
    <section class="auth-shell">
      <aside class="hero-panel">
        <div class="hero-badge">
          <i class="mdi mdi-shield-account-outline"></i>
          Đăng nhập hệ thống
        </div>

        <div>
          <h1>Thư viện số DIGILIB dùng chung một tài khoản</h1>

          <p>
            Admin, Thủ thư và Độc giả đăng nhập tại cùng một màn hình.
            Sau khi xác thực thành công, hệ thống tự động chuyển đến giao diện
            phù hợp theo vai trò tài khoản.
          </p>

          <div class="hero-stats">
            <div>
              <strong>JWT</strong>
              <span>Xác thực</span>
            </div>

            <div>
              <strong>Role</strong>
              <span>Phân quyền</span>
            </div>

            <div>
              <strong>API</strong>
              <span>Dữ liệu thật</span>
            </div>
          </div>
        </div>
      </aside>

      <section class="auth-card">
        <div class="brand">
          <div class="logo">
            <i class="mdi mdi-book-open-page-variant-outline"></i>
          </div>

          <div>
            <h2>DIGILIB <span>SYSTEM</span></h2>
            <p>Đăng nhập chung hệ thống thư viện số</p>
          </div>
        </div>

        <div class="tabs">
          <button
            type="button"
            :class="{ active: mode === 'login' }"
            @click="switchMode('login')"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            :class="{ active: mode === 'register' }"
            @click="switchMode('register')"
          >
            Đăng ký độc giả
          </button>
        </div>

        <!-- LOGIN -->
        <form
          v-if="mode === 'login'"
          class="auth-form"
          @submit.prevent="handleLogin"
        >
          <div class="form-title">
            <h3>Đăng nhập hệ thống</h3>
            <p>
              Dùng chung cho Admin, Thủ thư và Độc giả. Hệ thống sẽ tự chuyển
              đến trang phù hợp sau khi đăng nhập.
            </p>
          </div>

          <label class="field">
            <span>Email hoặc tài khoản</span>

            <div class="input-wrap">
              <i class="mdi mdi-account-outline"></i>

              <input
                v-model.trim="loginForm.email"
                type="text"
                placeholder="you@digilib.edu.vn"
                autocomplete="username"
                required
              />
            </div>
          </label>

          <label class="field">
            <span>Mật khẩu</span>

            <div class="input-wrap">
              <i class="mdi mdi-lock-outline"></i>

              <input
                v-model="loginForm.password"
                :type="showLoginPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu"
                autocomplete="current-password"
                required
              />

              <button
                type="button"
                class="icon-btn"
                @click="showLoginPassword = !showLoginPassword"
              >
                <i
                  :class="
                    showLoginPassword
                      ? 'mdi mdi-eye-off-outline'
                      : 'mdi mdi-eye-outline'
                  "
                ></i>
              </button>
            </div>
          </label>

          <div class="form-row">
            <label class="check">
              <input v-model="rememberMe" type="checkbox" />
              <span>Ghi nhớ tài khoản</span>
            </label>

            <button type="button" class="link-btn" @click="forgotPassword">
              Quên mật khẩu?
            </button>
          </div>

          <div v-if="errorMessage" class="alert error">
            <i class="mdi mdi-alert-circle-outline"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="alert success">
            <i class="mdi mdi-check-circle-outline"></i>
            <span>{{ successMessage }}</span>
          </div>

          <button class="submit-btn" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <i v-else class="mdi mdi-login"></i>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <!-- REGISTER -->
        <form
          v-else
          class="auth-form"
          @submit.prevent="handleRegister"
        >
          <div class="form-title">
            <h3>Đăng ký độc giả</h3>
            <p>
              Tạo tài khoản độc giả mới. Sau khi đăng ký thành công, hệ thống
              tự tạo hồ sơ độc giả và thẻ thư viện mặc định.
            </p>
          </div>

          <label class="field">
            <span>Họ và tên</span>

            <div class="input-wrap">
              <i class="mdi mdi-account-outline"></i>

              <input
                v-model.trim="registerForm.fullName"
                type="text"
                placeholder="Nhập họ và tên"
                required
              />
            </div>
          </label>

          <div class="two-cols">
            <label class="field">
              <span>Email</span>

              <div class="input-wrap">
                <i class="mdi mdi-email-outline"></i>

                <input
                  v-model.trim="registerForm.email"
                  type="email"
                  placeholder="you@email.com"
                  autocomplete="email"
                  required
                />
              </div>
            </label>

            <label class="field">
              <span>Số điện thoại</span>

              <div class="input-wrap">
                <i class="mdi mdi-phone-outline"></i>

                <input
                  v-model.trim="registerForm.phone"
                  type="tel"
                  placeholder="09xxxxxxxx"
                />
              </div>
            </label>
          </div>

          <label class="field">
            <span>Mật khẩu</span>

            <div class="input-wrap">
              <i class="mdi mdi-lock-outline"></i>

              <input
                v-model="registerForm.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                placeholder="Tối thiểu 6 ký tự"
                autocomplete="new-password"
                minlength="6"
                required
              />

              <button
                type="button"
                class="icon-btn"
                @click="showRegisterPassword = !showRegisterPassword"
              >
                <i
                  :class="
                    showRegisterPassword
                      ? 'mdi mdi-eye-off-outline'
                      : 'mdi mdi-eye-outline'
                  "
                ></i>
              </button>
            </div>

            <div class="strength">
              <span :style="{ width: passwordStrength.percent + '%' }"></span>
            </div>

            <small>{{ passwordStrength.text }}</small>
          </label>

          <label class="field">
            <span>Xác nhận mật khẩu</span>

            <div class="input-wrap">
              <i class="mdi mdi-lock-check-outline"></i>

              <input
                v-model="registerForm.confirmPassword"
                :type="showRegisterPassword ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu"
                autocomplete="new-password"
                minlength="6"
                required
              />
            </div>
          </label>

          <label class="check terms">
            <input v-model="agreeTerms" type="checkbox" />
            <span>Tôi xác nhận thông tin đăng ký là đúng.</span>
          </label>

          <div v-if="errorMessage" class="alert error">
            <i class="mdi mdi-alert-circle-outline"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="alert success">
            <i class="mdi mdi-check-circle-outline"></i>
            <span>{{ successMessage }}</span>
          </div>

          <button class="submit-btn register" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <i v-else class="mdi mdi-account-plus-outline"></i>
            {{ loading ? 'Đang đăng ký...' : 'Đăng ký độc giả' }}
          </button>
        </form>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi, getErrorMessage } from '../services/api'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const rememberMe = ref(false)
const agreeTerms = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  const remembered = localStorage.getItem('digilib_remember_email')

  if (remembered) {
    loginForm.email = remembered
    rememberMe.value = true
  }

  const redirectMode = new URLSearchParams(window.location.search).get('mode')

  if (redirectMode === 'register') {
    mode.value = 'register'
  }
})

const passwordStrength = computed(() => {
  const value = registerForm.password || ''
  let score = 0

  if (value.length >= 6) score++
  if (/[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  if (!value) {
    return {
      percent: 0,
      text: 'Mật khẩu nên có chữ hoa, số và ký tự đặc biệt.'
    }
  }

  if (score <= 1) {
    return {
      percent: 30,
      text: 'Mật khẩu yếu.'
    }
  }

  if (score <= 3) {
    return {
      percent: 65,
      text: 'Mật khẩu trung bình.'
    }
  }

  return {
    percent: 100,
    text: 'Mật khẩu mạnh.'
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

function getRole(user) {
  return (
    user?.role ||
    user?.roleName ||
    user?.userRole ||
    user?.accountType ||
    user?.type ||
    ''
  )
}

function isAdminRole(user) {
  const role = normalizeRole(getRole(user))

  return (
    role === 'admin' ||
    role.includes('admin') ||
    role.includes('quan tri') ||
    role.includes('quan ly') ||
    role.includes('administrator')
  )
}

function isLibrarianRole(user) {
  const role = normalizeRole(getRole(user))

  return (
    role === 'librarian' ||
    role.includes('librarian') ||
    role.includes('thu thu') ||
    role.includes('staff')
  )
}

function isReaderRole(user) {
  const role = normalizeRole(getRole(user))

  return (
    role === 'reader' ||
    role === 'user' ||
    role.includes('reader') ||
    role.includes('doc gia') ||
    role.includes('sinh vien') ||
    role.includes('student') ||
    role.includes('patron')
  )
}

function portalUrl(port, path = '/') {
  const url = new URL(window.location.href)
  url.port = String(port)
  url.pathname = path
  url.search = ''
  url.hash = ''

  return url.toString().replace(/\/$/, '')
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('redirect') || params.get('returnUrl') || ''
}

function getTokenFromStorage() {
  return (
    auth.token ||
    localStorage.getItem('digilib_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    ''
  )
}

function saveSharedSession(user) {
  const token = getTokenFromStorage()

  if (token) {
    localStorage.setItem('digilib_token', token)
  }

  if (user) {
    localStorage.setItem('digilib_user', JSON.stringify(user))
  }
}

function encodeSession(user) {
  const payload = {
    token: getTokenFromStorage(),
    user: user || auth.user || null
  }

  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

function sendSessionToUrl(rawUrl, user) {
  try {
    const url = new URL(rawUrl)
    url.searchParams.set('session', encodeSession(user))
    window.location.href = url.toString()
  } catch {
    routeByRole(user)
  }
}

function sendSessionToPortal(port, path, user) {
  const target = `${portalUrl(port, path)}?session=${encodeURIComponent(
    encodeSession(user)
  )}`

  window.location.href = target
}

function saveRemember() {
  if (rememberMe.value) {
    localStorage.setItem('digilib_remember_email', loginForm.email)
  } else {
    localStorage.removeItem('digilib_remember_email')
  }
}

function switchMode(nextMode) {
  mode.value = nextMode
  showLoginPassword.value = false
  showRegisterPassword.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

function forgotPassword() {
  errorMessage.value = ''
  successMessage.value =
    'Chức năng quên mật khẩu có thể tích hợp email SMTP. Hiện hãy liên hệ Admin để đặt lại mật khẩu.'
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  if (!phone) return true

  return /^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''))
}

function redirectMatchesRole(redirectUrl, user) {
  if (!redirectUrl) return false

  try {
    const url = new URL(redirectUrl)

    if (isAdminRole(user)) {
      return url.port === '5173'
    }

    if (isLibrarianRole(user)) {
      return url.port === '5174'
    }

    if (isReaderRole(user)) {
      return url.port === '5175'
    }

    return false
  } catch {
    return false
  }
}

function routeByRole(user) {
  if (isAdminRole(user)) {
    router.push('/dashboard')
    return
  }

  if (isLibrarianRole(user)) {
    sendSessionToPortal(5174, '/dashboard', user)
    return
  }

  if (isReaderRole(user)) {
    sendSessionToPortal(5175, '/', user)
    return
  }

  auth.logout()
  localStorage.removeItem('digilib_token')
  localStorage.removeItem('digilib_user')

  throw new Error(
    `Tài khoản role "${getRole(user) || 'không xác định'}" chưa được gán giao diện phù hợp.`
  )
}

function routeAfterLogin(user) {
  saveSharedSession(user)

  const redirectUrl = getRedirectUrl()

  if (redirectMatchesRole(redirectUrl, user)) {
    if (isAdminRole(user)) {
      router.push('/dashboard')
      return
    }

    sendSessionToUrl(redirectUrl, user)
    return
  }

  routeByRole(user)
}

async function handleLogin() {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const user = await auth.login(loginForm.email, loginForm.password)

    saveRemember()
    routeAfterLogin(user)
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      error?.message || 'Đăng nhập thất bại'
    )
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!registerForm.fullName.trim()) {
    errorMessage.value = 'Vui lòng nhập họ và tên.'
    return
  }

  if (!validateEmail(registerForm.email)) {
    errorMessage.value = 'Email không hợp lệ.'
    return
  }

  if (!validatePhone(registerForm.phone)) {
    errorMessage.value = 'Số điện thoại không hợp lệ. Ví dụ đúng: 0912345678.'
    return
  }

  if (registerForm.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự.'
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  if (!agreeTerms.value) {
    errorMessage.value = 'Bạn cần xác nhận thông tin đăng ký trước khi tạo tài khoản.'
    return
  }

  try {
    loading.value = true

    await authApi.register({
      fullName: registerForm.fullName,
      email: registerForm.email,
      username: registerForm.email,
      phone: registerForm.phone,
      phoneNumber: registerForm.phone,
      password: registerForm.password,
      role: 'Reader'
    })

    loginForm.email = registerForm.email
    loginForm.password = ''

    Object.assign(registerForm, {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })

    agreeTerms.value = false
    mode.value = 'login'
    successMessage.value =
      'Đăng ký độc giả thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.'
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Đăng ký thất bại')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 88% 10%, rgba(37, 99, 235, 0.16), transparent 26%),
    radial-gradient(circle at 4% 84%, rgba(37, 99, 235, 0.13), transparent 28%),
    linear-gradient(135deg, #f8fbff, #eef5ff 55%, #f8fbff);
  color: #0f172a;
}

.auth-shell {
  width: min(1180px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 24px;
}

.hero-panel,
.auth-card {
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(255, 255, 255, 0.94);
  border-radius: 32px;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 680px;
  background: linear-gradient(145deg, #0f172a, #1d4ed8 48%, #2563eb);
}

.hero-panel::before {
  content: '';
  position: absolute;
  right: -90px;
  top: -90px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.hero-panel::after {
  content: '';
  position: absolute;
  left: -80px;
  bottom: -110px;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.hero-panel > * {
  position: relative;
  z-index: 1;
}

.hero-badge {
  width: max-content;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #dbeafe;
  font-weight: 900;
  display: flex;
  gap: 8px;
  align-items: center;
}

.hero-panel h1 {
  margin: 42px 0 18px;
  color: #fff;
  font-size: 48px;
  line-height: 1.05;
  letter-spacing: -1.5px;
}

.hero-panel p {
  margin: 0;
  color: #dbeafe;
  font-size: 17px;
  line-height: 1.7;
  max-width: 560px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 44px;
}

.hero-stats div {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
}

.hero-stats strong {
  display: block;
  font-size: 24px;
}

.hero-stats span {
  display: block;
  margin-top: 5px;
  color: #dbeafe;
  font-weight: 700;
}

.auth-card {
  padding: 42px 46px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.logo {
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}

.brand h2 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 3px;
  font-weight: 950;
}

.brand h2 span {
  color: #2563eb;
}

.brand p {
  margin: 5px 0 0;
  color: #64748b;
  font-weight: 700;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 5px;
  border-radius: 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  margin-bottom: 28px;
}

.tabs button {
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-weight: 950;
  color: #64748b;
  cursor: pointer;
}

.tabs button.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.form-title {
  margin-bottom: 22px;
}

.form-title h3 {
  font-size: 30px;
  margin: 0;
  font-weight: 950;
}

.form-title p {
  margin: 8px 0 0;
  color: #64748b;
}

.field {
  display: block;
  margin-bottom: 16px;
}

.field > span {
  display: block;
  margin-bottom: 8px;
  font-weight: 900;
  color: #334155;
}

.input-wrap {
  height: 54px;
  border: 1px solid #cbd5e1;
  border-radius: 15px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 15px;
  transition: 0.18s;
}

.input-wrap:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.input-wrap i {
  font-size: 22px;
  color: #64748b;
}

.input-wrap input {
  border: 0;
  outline: 0;
  background: transparent;
  flex: 1;
  font-size: 15px;
  color: #0f172a;
  min-width: 0;
}

.icon-btn {
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2px 0 18px;
}

.check {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: #64748b;
  font-weight: 700;
  font-size: 14px;
}

.check input {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  flex: 0 0 auto;
}

.terms {
  margin: 2px 0 18px;
}

.link-btn {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 900;
  cursor: pointer;
}

.alert {
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-weight: 800;
  font-size: 14px;
}

.alert.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert.success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.submit-btn {
  width: 100%;
  height: 58px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-size: 17px;
  font-weight: 950;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.28);
}

.submit-btn.register {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 18px 35px rgba(22, 163, 74, 0.22);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 999px;
  animation: spin 0.85s linear infinite;
}

.strength {
  height: 7px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
  margin-top: 9px;
}

.strength span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f97316, #16a34a);
  transition: 0.2s;
}

.field small {
  display: block;
  margin-top: 7px;
  color: #64748b;
  font-weight: 700;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    min-height: auto;
  }

  .hero-panel h1 {
    font-size: 38px;
  }

  .hero-stats {
    margin-bottom: 28px;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 16px;
  }

  .auth-card,
  .hero-panel {
    padding: 26px;
    border-radius: 24px;
  }

  .two-cols,
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .form-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .brand h2 {
    font-size: 24px;
  }
}
</style>