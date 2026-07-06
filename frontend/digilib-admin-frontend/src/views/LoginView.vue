<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="hero-panel">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Đăng nhập hệ thống
        </div>

        <div class="hero-content">
          <h1>Thư viện số DIGILIB</h1>
          <p>
            Chào mừng bạn đến với kho sách DIGILIB.
          </p>
        </div>

        <div class="hero-features">
          <div class="feature-card">
            <strong>JWT</strong>
            <span>Xác thực</span>
          </div>

          <div class="feature-card">
            <strong>Role</strong>
            <span>Phân quyền</span>
          </div>

          <div class="feature-card">
            <strong>API</strong>
            <span>Dữ liệu thật</span>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <div class="panel-header">
          <div class="brand">
            <div class="brand-icon">
              <span>📘</span>
            </div>

            <div>
              <div class="brand-title">DIGILIB <span>SYSTEM</span></div>
              <div class="brand-subtitle">Đăng nhập chung hệ thống thư viện số</div>
            </div>
          </div>
        </div>

        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'login' }"
            type="button"
            @click="switchTab('login')"
          >
            Đăng nhập
          </button>

          <button
            class="tab-btn"
            :class="{ active: activeTab === 'register' }"
            type="button"
            @click="switchTab('register')"
          >
            Đăng ký độc giả
          </button>
        </div>

        <div v-if="activeTab === 'login'" class="tab-content">
          <h2>Đăng nhập hệ thống</h2>

          <p class="intro-text">
            Dùng chung cho Admin, Thủ thư và Độc giả. Sau khi đăng nhập thành công,
            hệ thống tự chuyển đến đúng giao diện.
          </p>

          <div v-if="loginError" class="alert alert-error">
            {{ loginError }}
          </div>

          <div v-if="loginSuccess" class="alert alert-success">
            {{ loginSuccess }}
          </div>

          <form class="auth-form" @submit.prevent="submitLogin">
            <div class="field">
              <label>Email hoặc tài khoản</label>

              <div class="input-wrap">
                <span class="input-icon">👤</span>

                <input
                  v-model.trim="loginForm.identifier"
                  type="text"
                  placeholder="Nhập email hoặc tài khoản"
                  autocomplete="username"
                />
              </div>

              <small v-if="loginFieldErrors.identifier" class="field-error">
                {{ loginFieldErrors.identifier }}
              </small>
            </div>

            <div class="field">
              <label>Mật khẩu</label>

              <div class="input-wrap">
                <span class="input-icon">🔒</span>

                <input
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu"
                  autocomplete="current-password"
                />

                <button
                  type="button"
                  class="toggle-password"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  {{ showLoginPassword ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>

              <small v-if="loginFieldErrors.password" class="field-error">
                {{ loginFieldErrors.password }}
              </small>
            </div>

            <div class="row-between">
              <label class="checkbox-wrap">
                <input v-model="loginForm.rememberMe" type="checkbox" />
                <span>Ghi nhớ tài khoản</span>
              </label>

              <a href="javascript:void(0)" class="link-btn">Quên mật khẩu?</a>
            </div>

            <button class="primary-btn full-btn" type="submit" :disabled="loginLoading">
              {{ loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>

          <div class="divider">
            <span>hoặc</span>
          </div>

          <div class="social-block">
            <button class="social-btn google" type="button" @click="handleGoogleAuth">
              <span>G</span>
              Đăng nhập / đăng ký với Google
            </button>
          </div>

          <div v-if="oauthMessage" class="oauth-note">
            {{ oauthMessage }}
          </div>
        </div>

        <div v-else class="tab-content">
          <h2>Đăng ký độc giả</h2>

          <p class="intro-text">
            Tạo tài khoản độc giả mới. Sau khi đăng ký thành công, hệ thống sẽ tự
            đưa bạn về tab đăng nhập để đăng nhập ngay.
          </p>

          <div v-if="registerError" class="alert alert-error">
            {{ registerError }}
          </div>

          <div v-if="registerSuccess" class="alert alert-success">
            {{ registerSuccess }}
          </div>

          <form class="auth-form" @submit.prevent="submitRegister">
            <div class="field">
              <label>Họ và tên</label>

              <div class="input-wrap">
                <span class="input-icon">👤</span>

                <input
                  v-model.trim="registerForm.fullName"
                  type="text"
                  placeholder="Nhập họ và tên"
                  autocomplete="name"
                />
              </div>

              <small v-if="registerFieldErrors.fullName" class="field-error">
                {{ registerFieldErrors.fullName }}
              </small>
            </div>

            <div class="grid-2">
              <div class="field">
                <label>Email</label>

                <div class="input-wrap">
                  <span class="input-icon">✉</span>

                  <input
                    v-model.trim="registerForm.email"
                    type="email"
                    placeholder="you@email.com"
                    autocomplete="email"
                  />
                </div>

                <small v-if="registerFieldErrors.email" class="field-error">
                  {{ registerFieldErrors.email }}
                </small>
              </div>

              <div class="field">
                <label>Số điện thoại</label>

                <div class="input-wrap">
                  <span class="input-icon">📞</span>

                  <input
                    v-model.trim="registerForm.phoneNumber"
                    type="text"
                    placeholder="09xxxxxxxx"
                    autocomplete="tel"
                  />
                </div>

                <small v-if="registerFieldErrors.phoneNumber" class="field-error">
                  {{ registerFieldErrors.phoneNumber }}
                </small>
              </div>
            </div>

            <div class="field">
              <label>Mật khẩu</label>

              <div class="input-wrap">
                <span class="input-icon">🔒</span>

                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  placeholder="Ví dụ: Aa123@"
                  autocomplete="new-password"
                />

                <button
                  type="button"
                  class="toggle-password"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  {{ showRegisterPassword ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>

              <small v-if="registerFieldErrors.password" class="field-error">
                {{ registerFieldErrors.password }}
              </small>

              <div class="password-strength">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrengthPercent + '%' }"
                  ></div>
                </div>

                <div class="strength-label">
                  Độ mạnh: <b>{{ passwordStrengthText }}</b>
                </div>
              </div>

              <ul class="password-checklist">
                <li :class="{ ok: passwordChecks.minLength }">Tối thiểu 6 ký tự</li>
                <li :class="{ ok: passwordChecks.hasUppercase }">Có ít nhất 1 chữ hoa</li>
                <li :class="{ ok: passwordChecks.hasNumber }">Có ít nhất 1 chữ số</li>
                <li :class="{ ok: passwordChecks.hasSpecial }">Có ít nhất 1 ký tự đặc biệt</li>
              </ul>
            </div>

            <div class="field">
              <label>Xác nhận mật khẩu</label>

              <div class="input-wrap">
                <span class="input-icon">🔐</span>

                <input
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Nhập lại mật khẩu"
                  autocomplete="new-password"
                />

                <button
                  type="button"
                  class="toggle-password"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>

              <small v-if="registerFieldErrors.confirmPassword" class="field-error">
                {{ registerFieldErrors.confirmPassword }}
              </small>
            </div>

            <label class="checkbox-wrap agree-box">
              <input v-model="registerForm.accepted" type="checkbox" />
              <span>Tôi xác nhận thông tin đăng ký là đúng.</span>
            </label>

            <small v-if="registerFieldErrors.accepted" class="field-error">
              {{ registerFieldErrors.accepted }}
            </small>

            <button class="success-btn full-btn" type="submit" :disabled="registerLoading">
              {{ registerLoading ? 'Đang đăng ký...' : 'Đăng ký độc giả' }}
            </button>
          </form>

          <div class="divider">
            <span>hoặc</span>
          </div>

          <div class="social-block">
            <button class="social-btn google" type="button" @click="handleGoogleAuth">
              <span>G</span>
              Đăng ký với Google
            </button>
          </div>

          <div v-if="oauthMessage" class="oauth-note">
            {{ oauthMessage }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function getPublicUrl(port) {
  return `${window.location.protocol}//${window.location.hostname}:${port}`
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getPublicUrl(8080)
const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_PORTAL_URL || getPublicUrl(5173)
const LIBRARIAN_PORTAL_URL = import.meta.env.VITE_LIBRARIAN_PORTAL_URL || getPublicUrl(5174)
const READER_PORTAL_URL = import.meta.env.VITE_READER_PORTAL_URL || getPublicUrl(5175)
const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL || ''

const TOKEN_KEYS = [
  'digilib_token',
  'admin_token',
  'digilib_admin_token',
  'librarian_token',
  'reader_token',
  'user_token',
  'token',
  'auth_token',
  'accessToken'
]

const USER_KEYS = [
  'digilib_user',
  'admin_user',
  'digilib_admin_user',
  'librarian_user',
  'reader_user',
  'digilib_reader_user',
  'user',
  'auth_user'
]

const activeTab = ref(route.query.tab === 'register' ? 'register' : 'login')

const loginLoading = ref(false)
const registerLoading = ref(false)

const loginError = ref('')
const loginSuccess = ref('')
const registerError = ref('')
const registerSuccess = ref('')
const oauthMessage = ref('')

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

const loginForm = reactive({
  identifier: '',
  password: '',
  rememberMe: true
})

const registerForm = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  accepted: false
})

const loginFieldErrors = reactive({
  identifier: '',
  password: ''
})

const registerFieldErrors = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  accepted: ''
})

watch(
  () => route.query.tab,
  (value) => {
    activeTab.value = value === 'register' ? 'register' : 'login'
  }
)

function switchTab(tab) {
  activeTab.value = tab
  oauthMessage.value = ''
  loginError.value = ''
  loginSuccess.value = ''
  registerError.value = ''
  registerSuccess.value = ''

  router.replace({
    path: '/login',
    query: tab === 'register' ? { tab: 'register' } : {}
  })
}

function clearLoginErrors() {
  loginError.value = ''
  loginSuccess.value = ''
  loginFieldErrors.identifier = ''
  loginFieldErrors.password = ''
}

function clearRegisterErrors() {
  registerError.value = ''
  registerSuccess.value = ''
  registerFieldErrors.fullName = ''
  registerFieldErrors.email = ''
  registerFieldErrors.phoneNumber = ''
  registerFieldErrors.password = ''
  registerFieldErrors.confirmPassword = ''
  registerFieldErrors.accepted = ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone) {
  return /^(0|\+84)\d{9,10}$/.test(String(phone || '').replace(/\s+/g, ''))
}

const passwordChecks = computed(() => ({
  minLength: registerForm.password.length >= 6,
  hasUppercase: /[A-Z]/.test(registerForm.password),
  hasNumber: /\d/.test(registerForm.password),
  hasSpecial: /[^A-Za-z0-9]/.test(registerForm.password)
}))

const passwordScore = computed(() => {
  return Object.values(passwordChecks.value).filter(Boolean).length
})

const passwordStrengthPercent = computed(() => {
  return passwordScore.value * 25
})

const passwordStrengthText = computed(() => {
  if (passwordScore.value <= 1) return 'Yếu'
  if (passwordScore.value === 2) return 'Trung bình'
  if (passwordScore.value === 3) return 'Khá'
  return 'Mạnh'
})

const passwordStrengthClass = computed(() => {
  if (passwordScore.value <= 1) return 'weak'
  if (passwordScore.value === 2) return 'medium'
  if (passwordScore.value === 3) return 'good'
  return 'strong'
})

function validateLogin() {
  clearLoginErrors()

  let ok = true

  if (!loginForm.identifier) {
    loginFieldErrors.identifier = 'Vui lòng nhập email hoặc tài khoản.'
    ok = false
  }

  if (!loginForm.password) {
    loginFieldErrors.password = 'Vui lòng nhập mật khẩu.'
    ok = false
  }

  return ok
}

function validateRegister() {
  clearRegisterErrors()

  let ok = true

  if (!registerForm.fullName) {
    registerFieldErrors.fullName = 'Vui lòng nhập họ và tên.'
    ok = false
  }

  if (!registerForm.email) {
    registerFieldErrors.email = 'Vui lòng nhập email.'
    ok = false
  } else if (!isValidEmail(registerForm.email)) {
    registerFieldErrors.email = 'Email không đúng định dạng.'
    ok = false
  }

  if (!registerForm.phoneNumber) {
    registerFieldErrors.phoneNumber = 'Vui lòng nhập số điện thoại.'
    ok = false
  } else if (!isValidPhone(registerForm.phoneNumber)) {
    registerFieldErrors.phoneNumber = 'Số điện thoại không hợp lệ.'
    ok = false
  }

  if (!registerForm.password) {
    registerFieldErrors.password = 'Vui lòng nhập mật khẩu.'
    ok = false
  } else if (!Object.values(passwordChecks.value).every(Boolean)) {
    registerFieldErrors.password = 'Mật khẩu chưa đủ mạnh.'
    ok = false
  }

  if (!registerForm.confirmPassword) {
    registerFieldErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
    ok = false
  } else if (registerForm.confirmPassword !== registerForm.password) {
    registerFieldErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    ok = false
  }

  if (!registerForm.accepted) {
    registerFieldErrors.accepted = 'Bạn cần xác nhận thông tin trước khi đăng ký.'
    ok = false
  }

  return ok
}

function normalizeRole(role) {
  return String(role || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

function base64UrlEncode(value) {
  const json = typeof value === 'string' ? value : JSON.stringify(value)
  const bytes = new TextEncoder().encode(json)

  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const base64 = String(value)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  )
}

function saveAuthSession(token, user) {
  const safeUser = user || {}

  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key))
  USER_KEYS.forEach((key) => localStorage.removeItem(key))

  localStorage.setItem('digilib_token', token || '')
  localStorage.setItem('digilib_user', JSON.stringify(safeUser))

  localStorage.setItem('admin_token', token || '')
  localStorage.setItem('digilib_admin_token', token || '')
  localStorage.setItem('admin_user', JSON.stringify(safeUser))
  localStorage.setItem('digilib_admin_user', JSON.stringify(safeUser))

  localStorage.setItem('librarian_token', token || '')
  localStorage.setItem('librarian_user', JSON.stringify(safeUser))

  localStorage.setItem('reader_token', token || '')
  localStorage.setItem('reader_user', JSON.stringify(safeUser))
  localStorage.setItem('digilib_reader_user', JSON.stringify(safeUser))
  localStorage.setItem('user_token', token || '')
  localStorage.setItem('user', JSON.stringify(safeUser))

  if (loginForm.rememberMe) {
    localStorage.setItem('remember_identifier', loginForm.identifier || '')
  } else {
    localStorage.removeItem('remember_identifier')
  }
}

function getRedirectUrlByRole(role, token = '', user = {}, expiresAt = null) {
  const value = normalizeRole(role)

  const session = base64UrlEncode({
    token,
    expiresAt,
    user
  })

  if (
    value.includes('admin') ||
    value.includes('quan tri') ||
    value.includes('quan ly') ||
    value.includes('administrator') ||
    value.includes('bao cao')
  ) {
    return `${ADMIN_PORTAL_URL}/dashboard`
  }

  if (
    value.includes('thu thu') ||
    value.includes('librarian')
  ) {
    return `${LIBRARIAN_PORTAL_URL}/dashboard?session=${encodeURIComponent(session)}`
  }

  return `${READER_PORTAL_URL}/?session=${encodeURIComponent(session)}`
}

async function parseApiResponse(response) {
  const text = await response.text()

  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.title ||
      data?.detail ||
      (typeof data === 'string' ? data : '') ||
      'Có lỗi xảy ra từ máy chủ.'

    const error = new Error(message)
    error.status = response.status
    error.payload = data
    throw error
  }

  return data
}

async function apiPost(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseApiResponse(response)
}

async function submitLogin() {
  if (!validateLogin()) return

  loginLoading.value = true
  clearLoginErrors()
  oauthMessage.value = ''

  try {
    const payload = {
      UsernameOrEmail: loginForm.identifier.trim(),
      Password: loginForm.password
    }

    const data = await apiPost('/api/auth/login', payload)

    const token =
      data?.token ||
      data?.Token ||
      data?.accessToken ||
      data?.AccessToken ||
      data?.data?.token ||
      data?.data?.Token ||
      data?.data?.accessToken ||
      data?.data?.AccessToken

    const user =
      data?.user ||
      data?.User ||
      data?.data?.user ||
      data?.data?.User ||
      data?.userDto ||
      data?.UserDto ||
      data?.data

    const expiresAt =
      data?.expiresAt ||
      data?.ExpiresAt ||
      data?.data?.expiresAt ||
      data?.data?.ExpiresAt ||
      null

    if (!token) {
      throw new Error('API đăng nhập chưa trả về token.')
    }

    if (!user) {
      throw new Error('API đăng nhập chưa trả về thông tin người dùng.')
    }

    saveAuthSession(token, user)

    loginSuccess.value = 'Đăng nhập thành công. Đang chuyển trang...'

    const role =
      user.role ||
      user.roleName ||
      user.Role ||
      user.RoleName ||
      user.userRole ||
      user.UserRole ||
      ''

    const redirectUrl = getRedirectUrlByRole(role, token, user, expiresAt)

    setTimeout(() => {
      window.location.href = redirectUrl
    }, 600)
  } catch (error) {
    if (error.status === 401) {
      loginError.value = 'Tài khoản hoặc mật khẩu không đúng.'
    } else if (error.status === 403) {
      loginError.value = 'Tài khoản đang bị khóa hoặc ngưng hoạt động.'
    } else {
      loginError.value = error.message || 'Đăng nhập thất bại.'
    }
  } finally {
    loginLoading.value = false
  }
}

async function submitRegister() {
  if (!validateRegister()) return

  registerLoading.value = true
  clearRegisterErrors()
  oauthMessage.value = ''

  try {
    const email = registerForm.email.trim().toLowerCase()

    const payload = {
      FullName: registerForm.fullName.trim(),
      Email: email,
      Username: email,
      Phone: registerForm.phoneNumber.trim(),
      Password: registerForm.password,
      ConfirmPassword: registerForm.confirmPassword
    }

    await apiPost('/api/auth/register', payload)

    registerSuccess.value = 'Đăng ký độc giả thành công. Vui lòng đăng nhập.'

    loginForm.identifier = email
    loginForm.password = ''

    registerForm.fullName = ''
    registerForm.email = ''
    registerForm.phoneNumber = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.accepted = false

    setTimeout(() => {
      switchTab('login')
    }, 900)
  } catch (error) {
    if (error.status === 409) {
      registerError.value = 'Email hoặc tài khoản đã tồn tại.'
    } else if (error.status === 403) {
      registerError.value = 'Hệ thống đang tạm khóa chức năng đăng ký độc giả mới.'
    } else {
      registerError.value = error.message || 'Đăng ký thất bại.'
    }
  } finally {
    registerLoading.value = false
  }
}

function handleGoogleAuth() {
  oauthMessage.value = ''

  if (!GOOGLE_AUTH_URL) {
    oauthMessage.value = 'Chức năng đăng ký / đăng nhập bằng Google chưa được cấu hình trong file .env.'
    return
  }

  window.location.href = GOOGLE_AUTH_URL
}

function consumeOAuthSession() {
  const oauth = route.query.oauth
  const session = route.query.session
  const message = route.query.message

  if (oauth === 'error') {
    oauthMessage.value = message || 'Đăng nhập Google thất bại.'
    return
  }

  if (oauth !== 'success' || !session) return

  try {
    const decoded = JSON.parse(base64UrlDecode(session))

    const token = decoded.token || decoded.Token
    const user = decoded.user || decoded.User
    const expiresAt = decoded.expiresAt || decoded.ExpiresAt || null

    if (!token || !user) {
      throw new Error('OAuth session không hợp lệ.')
    }

    saveAuthSession(token, user)

    const role =
      user.role ||
      user.roleName ||
      user.Role ||
      user.RoleName ||
      user.userRole ||
      user.UserRole ||
      ''

    const redirectUrl = getRedirectUrlByRole(role, token, user, expiresAt)

    window.location.href = redirectUrl
  } catch (e) {
    oauthMessage.value = e.message || 'Không đọc được phiên đăng nhập Google.'
  }
}

const rememberedIdentifier = localStorage.getItem('remember_identifier')

if (rememberedIdentifier) {
  loginForm.identifier = rememberedIdentifier
}

onMounted(() => {
  consumeOAuthSession()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 24%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.09), transparent 26%),
    linear-gradient(135deg, #eef4ff 0%, #f8fbff 45%, #eef3ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.auth-shell {
  width: 100%;
  max-width: 1200px;
  min-height: 720px;
  display: grid;
  grid-template-columns: 0.95fr 1fr;
  gap: 26px;
  align-items: stretch;
}

.hero-panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 36px;
  color: #ffffff;
  background: linear-gradient(180deg, #10245f 0%, #2144b7 48%, #3263f1 100%);
  box-shadow: 0 24px 50px rgba(37, 99, 235, 0.22);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-panel::before,
.hero-panel::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.11);
}

.hero-panel::before {
  width: 260px;
  height: 260px;
  top: -70px;
  right: -70px;
}

.hero-panel::after {
  width: 220px;
  height: 220px;
  left: -90px;
  bottom: -90px;
}

.hero-badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.17);
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
}

.badge-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dbeafe;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 470px;
}

.hero-content h1 {
  margin: 0 0 18px;
  font-size: 58px;
  line-height: 1.05;
  font-weight: 900;
}

.hero-content p {
  margin: 0;
  font-size: 22px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
}

.hero-features {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.17);
  padding: 18px;
  border-radius: 20px;
}

.feature-card strong {
  display: block;
  font-size: 32px;
  margin-bottom: 8px;
}

.feature-card span {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.92);
}

.form-panel {
  background: #ffffff;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.07);
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.brand-title {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: #0f172a;
}

.brand-title span {
  color: #2563eb;
}

.brand-subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 6px;
  border-radius: 18px;
  background: #f1f5f9;
  margin-bottom: 22px;
}

.tab-btn {
  height: 54px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  font-size: 18px;
  font-weight: 800;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.tab-content h2 {
  margin: 0 0 8px;
  font-size: 42px;
  color: #0f172a;
  font-weight: 900;
}

.intro-text {
  margin: 0 0 18px;
  color: #64748b;
  line-height: 1.7;
  font-size: 18px;
}

.alert {
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
}

.alert-error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.alert-success {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 16px;
  font-weight: 800;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  border: 1px solid #dbe2ea;
  border-radius: 16px;
  padding: 0 14px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.input-wrap:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.input-icon {
  font-size: 18px;
  color: #64748b;
  min-width: 20px;
  text-align: center;
}

.input-wrap input {
  border: 0;
  outline: none;
  width: 100%;
  height: 100%;
  font-size: 17px;
  color: #0f172a;
  background: transparent;
}

.toggle-password {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 800;
  cursor: pointer;
  font-size: 14px;
}

.field-error {
  display: block;
  margin-top: 6px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.checkbox-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 15px;
  font-weight: 700;
}

.checkbox-wrap input {
  width: 17px;
  height: 17px;
  accent-color: #2563eb;
}

.agree-box {
  margin-top: 2px;
}

.link-btn {
  color: #2563eb;
  text-decoration: none;
  font-size: 15px;
  font-weight: 800;
}

.full-btn {
  width: 100%;
  height: 58px;
  border: 0;
  border-radius: 16px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
}

.success-btn {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.success-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.22);
}

.primary-btn:disabled,
.success-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.divider {
  position: relative;
  margin: 22px 0 18px;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 1px solid #e2e8f0;
}

.divider span {
  position: relative;
  padding: 0 14px;
  background: #ffffff;
  color: #64748b;
  font-size: 14px;
  font-weight: 800;
}

.social-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-btn {
  width: 100%;
  height: 54px;
  border: 1px solid #dbe2ea;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.social-btn:hover {
  border-color: #2563eb;
  transform: translateY(-1px);
}

.social-btn span {
  font-size: 20px;
  font-weight: 900;
}

.oauth-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 14px;
  font-weight: 700;
}

.password-strength {
  margin-top: 10px;
}

.strength-bar {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: #e2e8f0;
}

.strength-fill {
  height: 100%;
  transition: all 0.25s ease;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.good {
  background: #3b82f6;
}

.strength-fill.strong {
  background: #16a34a;
}

.strength-label {
  margin-top: 6px;
  color: #475569;
  font-size: 14px;
}

.password-checklist {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.password-checklist li.ok {
  color: #15803d;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .hero-content h1 {
    font-size: 46px;
  }
}

@media (max-width: 720px) {
  .auth-page {
    padding: 18px;
  }

  .form-panel,
  .hero-panel {
    padding: 20px;
    border-radius: 22px;
  }

  .hero-content h1 {
    font-size: 38px;
  }

  .hero-content p {
    font-size: 18px;
  }

  .brand-title {
    font-size: 28px;
  }

  .tab-content h2 {
    font-size: 32px;
  }

  .grid-2,
  .hero-features,
  .tabs {
    grid-template-columns: 1fr;
  }

  .row-between {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
