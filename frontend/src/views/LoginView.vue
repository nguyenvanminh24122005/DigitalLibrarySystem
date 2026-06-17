<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Cột trái: Hình ảnh/Branding -->
      <div class="login-banner d-none d-md-flex">
        <div class="banner-overlay">
          <div class="d-flex align-center mb-6">
            <v-icon size="36" color="white" class="mr-2">mdi-book-open-page-variant</v-icon>
            <h2 class="text-white font-weight-black m-0" style="font-size: 24px;">Thư viện số</h2>
          </div>

          <h1 class="text-white font-weight-black mb-4" style="font-size: 32px; line-height: 1.2;">
            Tri thức mở ra<br />tương lai
          </h1>

          <p class="text-teal-lighten-4 text-body-2">
            Hệ thống quản lý thư viện số toàn diện, hỗ trợ định danh,
            phân quyền và tra cứu tài liệu thông minh.
          </p>
        </div>
      </div>

      <!-- Cột phải: Form Đăng nhập / Đăng ký -->
      <div class="login-form-wrapper">
        <div class="form-content">
          <h2 class="text-h4 font-weight-black text-grey-darken-4 mb-2">
            {{ isRegisterMode ? 'Đăng ký' : 'Đăng nhập' }}
          </h2>

          <p class="text-body-2 text-grey-darken-1 mb-8">
            {{
              isRegisterMode
                ? 'Tạo tài khoản độc giả và thẻ thư viện mới.'
                : 'Vui lòng nhập thông tin tài khoản của bạn.'
            }}
          </p>

          <!-- Báo lỗi nếu có -->
          <div v-if="errorMsg" class="error-alert mb-4">
            <v-icon size="20" color="#dc2626" class="mr-2">mdi-alert-circle</v-icon>
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Báo thành công nếu có -->
          <div v-if="successMsg" class="success-alert mb-4">
            <v-icon size="20" color="#0d9488" class="mr-2">mdi-check-circle</v-icon>
            <span>{{ successMsg }}</span>
          </div>

          <!-- FORM ĐĂNG NHẬP -->
          <form v-if="!isRegisterMode" @submit.prevent="handleLogin">
            <!-- Email -->
            <div class="input-group mb-5">
              <label>Email đăng nhập</label>
              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-email-outline</v-icon>
                <input
                  type="email"
                  v-model="email"
                  placeholder="admin@thuvien.com hoặc email độc giả"
                  required
                />
              </div>
            </div>

            <!-- Mật khẩu -->
            <div class="input-group mb-6">
              <div class="d-flex justify-space-between w-100">
                <label>Mật khẩu</label>
                <a href="#" class="text-teal text-caption font-weight-bold text-decoration-none">
                  Quên mật khẩu?
                </a>
              </div>

              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-lock-outline</v-icon>

                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="••••••••"
                  required
                />

                <v-icon
                  size="20"
                  color="#94a3b8"
                  class="input-icon-right cursor-pointer"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </div>
            </div>

            <!-- Nút submit -->
            <button type="submit" class="btn-submit" :disabled="isLoading">
              <v-progress-circular
                v-if="isLoading"
                indeterminate
                size="20"
                width="3"
                color="white"
                class="mr-2"
              />

              <span>{{ isLoading ? 'Đang xử lý...' : 'Đăng nhập vào hệ thống' }}</span>
            </button>

            <p class="text-center text-caption text-grey-darken-1 mt-6">
              Chưa có tài khoản?
              <a href="#" class="text-teal font-weight-bold text-decoration-none" @click.prevent="goRegister">
                Đăng ký ngay
              </a>
            </p>

            <div class="demo-note mt-5">
              <b>Tài khoản demo:</b><br />
              Admin: admin@thuvien.com / 123456<br />
              User mẫu: user@thuvien.com / 123456
            </div>
          </form>

          <!-- FORM ĐĂNG KÝ -->
          <form v-else @submit.prevent="handleRegister">
            <div class="input-group mb-4">
              <label>Họ và tên</label>
              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-account-outline</v-icon>
                <input
                  type="text"
                  v-model="registerForm.fullName"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            <div class="input-group mb-4">
              <label>Email</label>
              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-email-outline</v-icon>
                <input
                  type="email"
                  v-model="registerForm.email"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div class="input-group mb-4">
              <label>Số điện thoại</label>
              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-phone-outline</v-icon>
                <input
                  type="tel"
                  v-model="registerForm.phone"
                  placeholder="0123 456 789"
                  required
                />
              </div>
            </div>

            <div class="input-group mb-4">
              <label>Mật khẩu</label>
              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-lock-outline</v-icon>

                <input
                  :type="showRegisterPassword ? 'text' : 'password'"
                  v-model="registerForm.password"
                  placeholder="••••••••"
                  required
                />

                <v-icon
                  size="20"
                  color="#94a3b8"
                  class="input-icon-right cursor-pointer"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  {{ showRegisterPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </div>
            </div>

            <div class="input-group mb-6">
              <label>Xác nhận mật khẩu</label>
              <div class="input-wrapper">
                <v-icon size="20" color="#94a3b8" class="input-icon">mdi-lock-check-outline</v-icon>

                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="registerForm.confirmPassword"
                  placeholder="••••••••"
                  required
                />

                <v-icon
                  size="20"
                  color="#94a3b8"
                  class="input-icon-right cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="isLoading">
              <v-progress-circular
                v-if="isLoading"
                indeterminate
                size="20"
                width="3"
                color="white"
                class="mr-2"
              />

              <span>{{ isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản' }}</span>
            </button>

            <p class="text-center text-caption text-grey-darken-1 mt-6">
              Đã có tài khoản?
              <a href="#" class="text-teal font-weight-bold text-decoration-none" @click.prevent="goLogin">
                Đăng nhập ngay
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const registerForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const isRegisterMode = computed(() => route.path.includes('register'))

const getToday = () => {
  return new Date().toLocaleDateString('vi-VN')
}

const getExpireDate = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toLocaleDateString('vi-VN')
}

const createLibraryCard = () => {
  const year = new Date().getFullYear()
  const random = String(Math.floor(Math.random() * 9000) + 1000)

  return {
    cardId: `LIB-${year}-${random}`,
    issueDate: getToday(),
    expireDate: getExpireDate(),
    status: 'Đang hoạt động',
    locked: false
  }
}

const getRegisteredUsers = () => {
  return JSON.parse(localStorage.getItem('library_registered_users') || '[]')
}

const saveRegisteredUsers = (users) => {
  localStorage.setItem('library_registered_users', JSON.stringify(users))
}

const saveReaderProfileForAdmin = (user) => {
  const profiles = JSON.parse(localStorage.getItem('library_reader_profiles') || '[]')
  const cards = JSON.parse(localStorage.getItem('library_library_cards') || '[]')

  const profile = {
    id: user.id,
    readerId: user.cardId,
    name: user.name,
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    role: 'Độc giả',
    status: 'Đang hoạt động',
    cardId: user.cardId,
    cardStatus: user.cardStatus,
    issueDate: user.issueDate,
    expireDate: user.expireDate,
    createdAt: new Date().toISOString()
  }

  const card = {
    id: user.cardId,
    cardId: user.cardId,
    readerId: user.id,
    readerName: user.name,
    issueDate: user.issueDate,
    expireDate: user.expireDate,
    status: user.cardStatus,
    locked: false
  }

  const profileIndex = profiles.findIndex(item => item.email === user.email)

  if (profileIndex >= 0) {
    profiles[profileIndex] = profile
  } else {
    profiles.unshift(profile)
  }

  const cardIndex = cards.findIndex(item => item.cardId === user.cardId)

  if (cardIndex >= 0) {
    cards[cardIndex] = card
  } else {
    cards.unshift(card)
  }

  localStorage.setItem('library_reader_profiles', JSON.stringify(profiles))
  localStorage.setItem('library_library_cards', JSON.stringify(cards))
}

const resetMessages = () => {
  errorMsg.value = ''
  successMsg.value = ''
}

const resetRegisterForm = () => {
  registerForm.fullName = ''
  registerForm.email = ''
  registerForm.phone = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

const goRegister = () => {
  resetMessages()
  router.push('/register')
}

const goLogin = () => {
  resetMessages()
  router.push('/login')
}

const handleRegister = async () => {
  resetMessages()

  if (
    !registerForm.fullName ||
    !registerForm.email ||
    !registerForm.phone ||
    !registerForm.password ||
    !registerForm.confirmPassword
  ) {
    errorMsg.value = 'Vui lòng nhập đầy đủ thông tin đăng ký!'
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp!'
    return
  }

  isLoading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 700))

    const users = getRegisteredUsers()
    const emailValue = registerForm.email.trim().toLowerCase()

    const existed = users.some(user => user.email?.toLowerCase() === emailValue)

    if (existed) {
      throw new Error('Email này đã được đăng ký. Vui lòng đăng nhập.')
    }

    const card = createLibraryCard()

    const newUser = {
      id: `USER-${Date.now()}`,
      name: registerForm.fullName.trim(),
      fullName: registerForm.fullName.trim(),
      email: emailValue,
      phone: registerForm.phone.trim(),
      password: registerForm.password,
      role: 'user',
      cardId: card.cardId,
      cardStatus: card.status,
      issueDate: card.issueDate,
      expireDate: card.expireDate,
      libraryCard: card
    }

    users.unshift(newUser)
    saveRegisteredUsers(users)

    localStorage.setItem('library_registered_user', JSON.stringify(newUser))
    saveReaderProfileForAdmin(newUser)

    successMsg.value = `Đăng ký thành công! Hệ thống đã tạo thẻ thư viện ${newUser.cardId}. Vui lòng đăng nhập.`

    email.value = newUser.email
    password.value = ''
    resetRegisterForm()

    setTimeout(() => {
      router.push('/login')
    }, 900)
  } catch (error) {
    errorMsg.value = error.message || 'Đăng ký thất bại!'
  } finally {
    isLoading.value = false
  }
}

const findRegisteredUser = (emailValue, passwordValue) => {
  const users = getRegisteredUsers()
  const legacyUser = JSON.parse(localStorage.getItem('library_registered_user') || 'null')

  let foundUser = users.find(user => {
    return user.email?.toLowerCase() === emailValue && user.password === passwordValue
  })

  if (!foundUser && legacyUser) {
    const matchedLegacy =
      legacyUser.email?.toLowerCase() === emailValue &&
      legacyUser.password === passwordValue

    if (matchedLegacy) {
      foundUser = legacyUser
    }
  }

  return foundUser
}

const handleLogin = async () => {
  isLoading.value = true
  resetMessages()

  try {
    await new Promise(resolve => setTimeout(resolve, 700))

    const emailValue = email.value.trim().toLowerCase()
    const passwordValue = password.value

    let mockResponse = null

    if (emailValue === 'admin@thuvien.com' && passwordValue === '123456') {
      mockResponse = {
        token: 'demo-admin-token',
        role: 'admin',
        user: {
          name: 'Admin Thư Viện',
          email: 'admin@thuvien.com'
        }
      }
    } else if (emailValue === 'user@thuvien.com' && passwordValue === '123456') {
      mockResponse = {
        token: 'demo-user-token',
        role: 'user',
        user: {
          name: 'Nguyễn Độc Giả',
          email: 'user@thuvien.com',
          cardId: 'LIB-2026-0001',
          cardStatus: 'Đang hoạt động',
          issueDate: getToday(),
          expireDate: getExpireDate()
        }
      }
    } else {
      const registeredUser = findRegisteredUser(emailValue, passwordValue)

      if (!registeredUser) {
        throw new Error('Email hoặc mật khẩu không chính xác!')
      }

      mockResponse = {
        token: 'demo-reader-token',
        role: 'user',
        user: registeredUser
      }
    }

    authStore.login(mockResponse.token, mockResponse.role, mockResponse.user)

    if (mockResponse.role === 'admin' || authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  } catch (error) {
    errorMsg.value = error.message || 'Lỗi kết nối đến máy chủ!'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.path,
  () => {
    resetMessages()
  }
)
</script>

<style scoped>
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.text-teal {
  color: #0d9488 !important;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1);
  display: flex;
  overflow: hidden;
  min-height: 600px;
}

/* CỘT TRÁI */
.login-banner {
  flex: 1;
  background: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000&auto=format&fit=crop') center/cover;
  position: relative;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(2, 44, 34, 0.9) 0%, rgba(13, 148, 136, 0.8) 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* CỘT PHẢI */
.login-form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-content {
  width: 100%;
  max-width: 380px;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
  width: 100%;
  height: 48px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.input-icon-right {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.input-wrapper input {
  width: 100%;
  height: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 40px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.btn-submit {
  width: 100%;
  height: 48px;
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #0f766e;
}

.btn-submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.error-alert {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.success-alert {
  background: #ccfbf1;
  border: 1px solid #99f6e4;
  color: #0f766e;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.demo-note {
  border: 1px dashed #99f6e4;
  background: #f0fdfa;
  color: #0f766e;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .login-card {
    min-height: auto;
  }
}
</style>
