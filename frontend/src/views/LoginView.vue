<template>
  <div class="auth-page">
    <section class="auth-card">
      <div class="visual">
        <div class="brand">
          <v-icon size="34">mdi-library</v-icon>
          <strong>Thư viện số</strong>
        </div>
        <h1>Quản lý tri thức rõ ràng, hiện đại và dễ dùng.</h1>
        <p>
          Một tài khoản cho độc giả tra cứu, đặt mượn sách; một không gian riêng cho quản trị
          vận hành kho sách, thẻ thư viện và mượn trả.
        </p>
        <div class="demo-box">
          <span>Demo nhanh</span>
          <b>Admin:</b> admin@thuvien.com / 123456
          <b>User:</b> user@thuvien.com / 123456
        </div>
      </div>

      <div class="form-side">
        <div class="form-head">
          <span>{{ isRegisterMode ? 'Tạo tài khoản' : 'Chào mừng trở lại' }}</span>
          <h2>{{ isRegisterMode ? 'Đăng ký độc giả' : 'Đăng nhập' }}</h2>
          <p>{{ isRegisterMode ? 'Tạo hồ sơ và thẻ thư viện mới.' : 'Nhập thông tin để vào hệ thống.' }}</p>
        </div>

        <div v-if="errorMsg" class="alert error">
          <v-icon size="20">mdi-alert-circle-outline</v-icon>
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="alert success">
          <v-icon size="20">mdi-check-circle-outline</v-icon>
          {{ successMsg }}
        </div>

        <form v-if="!isRegisterMode" @submit.prevent="handleLogin">
          <label>
            Email
            <span>
              <v-icon size="20">mdi-email-outline</v-icon>
              <input v-model="email" type="email" placeholder="admin@thuvien.com" required />
            </span>
          </label>

          <label>
            Mật khẩu
            <span>
              <v-icon size="20">mdi-lock-outline</v-icon>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
              <button type="button" @click="showPassword = !showPassword">
                <v-icon size="20">{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
            </span>
          </label>

          <button class="submit" type="submit" :disabled="isLoading">
            <v-progress-circular v-if="isLoading" indeterminate size="19" width="3" color="white" />
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>

          <p class="switch">
            Chưa có tài khoản?
            <button type="button" @click="goRegister">Đăng ký ngay</button>
          </p>
        </form>

        <form v-else @submit.prevent="handleRegister">
          <label>
            Họ và tên
            <span>
              <v-icon size="20">mdi-account-outline</v-icon>
              <input v-model="registerForm.fullName" placeholder="Nguyễn Văn A" required />
            </span>
          </label>

          <label>
            Email
            <span>
              <v-icon size="20">mdi-email-outline</v-icon>
              <input v-model="registerForm.email" type="email" placeholder="reader@email.com" required />
            </span>
          </label>

          <label>
            Số điện thoại
            <span>
              <v-icon size="20">mdi-phone-outline</v-icon>
              <input v-model="registerForm.phone" placeholder="0901 234 567" required />
            </span>
          </label>

          <label>
            Mật khẩu
            <span>
              <v-icon size="20">mdi-lock-outline</v-icon>
              <input v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'" placeholder="••••••••" required />
              <button type="button" @click="showRegisterPassword = !showRegisterPassword">
                <v-icon size="20">{{ showRegisterPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
            </span>
          </label>

          <label>
            Xác nhận mật khẩu
            <span>
              <v-icon size="20">mdi-lock-check-outline</v-icon>
              <input v-model="registerForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" required />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword">
                <v-icon size="20">{{ showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
            </span>
          </label>

          <button class="submit" type="submit" :disabled="isLoading">
            <v-progress-circular v-if="isLoading" indeterminate size="19" width="3" color="white" />
            {{ isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
          </button>

          <p class="switch">
            Đã có tài khoản?
            <button type="button" @click="goLogin">Đăng nhập</button>
          </p>
        </form>
      </div>
    </section>
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

const today = () => new Date().toISOString().slice(0, 10)

const expireDate = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().slice(0, 10)
}

const readUsers = () => JSON.parse(localStorage.getItem('library_registered_users') || '[]')
const saveUsers = (users) => localStorage.setItem('library_registered_users', JSON.stringify(users))

const resetMessages = () => {
  errorMsg.value = ''
  successMsg.value = ''
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

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  isLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const users = readUsers()
    const emailValue = registerForm.email.trim().toLowerCase()

    if (users.some((user) => user.email?.toLowerCase() === emailValue)) {
      throw new Error('Email này đã được đăng ký.')
    }

    const year = new Date().getFullYear()
    const user = {
      id: `R${Date.now()}`,
      name: registerForm.fullName.trim(),
      fullName: registerForm.fullName.trim(),
      email: emailValue,
      phone: registerForm.phone.trim(),
      password: registerForm.password,
      role: 'user',
      cardId: `LIB-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
      cardStatus: 'Hoạt động',
      issueDate: today(),
      expireDate: expireDate()
    }

    users.unshift(user)
    saveUsers(users)

    successMsg.value = `Đăng ký thành công. Mã thẻ của bạn là ${user.cardId}.`
    email.value = user.email
    password.value = ''

    setTimeout(() => router.push('/login'), 700)
  } catch (error) {
    errorMsg.value = error.message || 'Đăng ký thất bại.'
  } finally {
    isLoading.value = false
  }
}

const handleLogin = async () => {
  resetMessages()
  isLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const emailValue = email.value.trim().toLowerCase()
    const passwordValue = password.value
    let response = null

    if (emailValue === 'admin@thuvien.com' && passwordValue === '123456') {
      response = {
        token: 'demo-admin-token',
        role: 'admin',
        user: { name: 'Admin Thư viện', email: 'admin@thuvien.com' }
      }
    } else if (emailValue === 'user@thuvien.com' && passwordValue === '123456') {
      response = {
        token: 'demo-user-token',
        role: 'user',
        user: {
          id: 'R001',
          name: 'Nguyễn Độc Giả',
          email: 'user@thuvien.com',
          phone: '0901 234 567',
          cardId: 'LIB-2026-0001',
          cardStatus: 'Hoạt động',
          issueDate: '2026-01-08',
          expireDate: '2027-01-08'
        }
      }
    } else {
      const user = readUsers().find((item) => item.email?.toLowerCase() === emailValue && item.password === passwordValue)
      if (!user) throw new Error('Email hoặc mật khẩu không chính xác.')
      response = { token: 'demo-reader-token', role: 'user', user }
    }

    authStore.login(response.token, response.role, response.user)
    router.push(response.role === 'admin' ? '/admin/dashboard' : '/')
  } catch (error) {
    errorMsg.value = error.message || 'Không thể đăng nhập.'
  } finally {
    isLoading.value = false
  }
}

watch(() => route.path, resetMessages)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-page {
  min-height: 100vh;
  padding: 24px;
  background: #eef4f8;
  color: #172033;
  display: grid;
  place-items: center;
  font-family: Inter, Segoe UI, sans-serif;
}

.auth-card {
  width: min(1080px, 100%);
  min-height: 680px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 24px 65px rgba(23, 32, 51, 0.14);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 0.92fr;
}

.visual {
  padding: 48px;
  color: white;
  background:
    linear-gradient(135deg, rgba(13, 56, 51, 0.88), rgba(15, 118, 110, 0.82)),
    url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop') center/cover;
  display: grid;
  align-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ccfbf1;
  font-size: 22px;
}

.visual h1 {
  margin: 28px 0 16px;
  font-size: 44px;
  line-height: 1.08;
  letter-spacing: 0;
}

.visual p {
  max-width: 520px;
  color: #e0fdfa;
  line-height: 1.7;
}

.demo-box {
  width: min(100%, 430px);
  margin-top: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  padding: 16px;
  display: grid;
  gap: 5px;
}

.demo-box span {
  color: #ccfbf1;
  font-weight: 900;
}

.form-side {
  padding: 44px;
  display: grid;
  align-content: center;
}

.form-head span {
  color: #0f766e;
  font-weight: 950;
}

.form-head h2 {
  margin: 4px 0 8px;
  font-size: 34px;
}

.form-head p {
  margin: 0 0 24px;
  color: #64748b;
}

form {
  display: grid;
  gap: 15px;
}

label {
  color: #334155;
  font-weight: 850;
}

label span {
  min-height: 50px;
  margin-top: 7px;
  border: 1px solid #d7e0ec;
  border-radius: 13px;
  background: white;
  padding: 0 13px;
  display: grid;
  grid-template-columns: 24px 1fr 28px;
  align-items: center;
  gap: 8px;
}

input {
  width: 100%;
  height: 46px;
  border: 0;
  outline: 0;
  color: #172033;
}

label button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
}

.submit {
  min-height: 50px;
  border: 0;
  border-radius: 13px;
  background: #0f766e;
  color: white;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}

.submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.switch {
  margin: 4px 0 0;
  text-align: center;
  color: #64748b;
}

.switch button {
  border: 0;
  background: transparent;
  color: #0f766e;
  font-weight: 950;
  cursor: pointer;
}

.alert {
  min-height: 44px;
  margin-bottom: 14px;
  border-radius: 13px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 850;
}

.alert.error {
  background: #fee2e2;
  color: #dc2626;
}

.alert.success {
  background: #dcfce7;
  color: #15803d;
}

@media (max-width: 860px) {
  .auth-card {
    grid-template-columns: 1fr;
  }

  .visual {
    min-height: 360px;
  }
}

@media (max-width: 560px) {
  .auth-page {
    padding: 0;
  }

  .auth-card {
    min-height: 100vh;
    border-radius: 0;
  }

  .visual,
  .form-side {
    padding: 28px;
  }

  .visual h1 {
    font-size: 34px;
  }
}
</style>
