<template>
  <div class="d-flex" style="min-height: 100vh;">
    <!-- Left: Login Form -->
    <div class="flex-grow-1 d-flex flex-column justify-center py-12 px-4 px-sm-6 px-lg-16 px-xl-24" style="max-width: 600px;">
      <div style="max-width: 400px; width: 100%; margin: 0 auto;">
        <div class="d-flex align-center mb-2">
          <v-icon color="primary" size="40" class="mr-3">mdi-book-open-page-variant</v-icon>
          <span class="text-h4 font-weight-black text-grey-darken-4">DigiLib</span>
        </div>
        <h3 class="text-h5 font-weight-bold text-grey-darken-4 mt-6">Đăng nhập hệ thống</h3>
        <p class="text-body-2 text-grey mt-2">Nhập email và mật khẩu để tiếp tục</p>

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4" closable @click:close="error = ''">
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="handleLogin" class="mt-8">
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium text-grey-darken-3 mb-1 d-block">Email / Tài khoản</label>
            <v-text-field
              v-model="email"
              placeholder="admin@smartlib.local"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              required
              hide-details
            />
          </div>

          <div class="mb-4">
            <label class="text-body-2 font-weight-medium text-grey-darken-3 mb-1 d-block">Mật khẩu</label>
            <v-text-field
              v-model="password"
              placeholder="••••••••"
              :type="showPass ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPass = !showPass"
              required
              hide-details
            />
          </div>

          <div class="d-flex align-center justify-space-between mb-6">
            <v-checkbox v-model="remember" label="Ghi nhớ đăng nhập" density="compact" hide-details color="primary" />
            <a href="#" class="text-primary text-body-2 font-weight-medium text-decoration-none">Quên mật khẩu?</a>
          </div>

          <v-btn type="submit" color="primary" size="x-large" block :loading="loading">
            Đăng nhập
          </v-btn>

          <p class="text-center text-body-2 text-grey mt-6">
            Chưa có tài khoản?
            <router-link to="/register" class="text-primary font-weight-medium text-decoration-none">Đăng ký ngay</router-link>
          </p>
        </v-form>
      </div>
    </div>

    <!-- Right: Hero Image -->
    <div class="d-none d-lg-block flex-grow-1 position-relative" style="background: #1976D2; min-width: 50%;">
      <img
        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        alt="Thư viện"
        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.7; mix-blend-mode: multiply;"
      />
      <div style="position: absolute; inset: 0; background: linear-gradient(to top, #1976D2, transparent, transparent); opacity: 0.9;" />
      <div style="position: absolute; bottom: 48px; left: 48px; max-width: 480px;">
        <h1 class="text-h3 font-weight-bold text-white mb-4">Khám phá tri thức vô tận</h1>
        <p class="text-subtitle-1 text-blue-lighten-3">
          Hệ thống quản lý thư viện số hiện đại, giúp bạn dễ dàng tìm kiếm, mượn trả và theo dõi kho tàng kiến thức.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../services/authApi'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await authApi.login(email.value, password.value)
    auth.setAuth(data.accessToken || data.token, data.user)
    router.push({ name: 'Dashboard' })
  } catch (e) {
    error.value = e.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.'
  } finally {
    loading.value = false
  }
}
</script>
