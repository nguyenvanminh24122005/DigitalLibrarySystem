<template>
  <div class="d-flex justify-center align-center" style="min-height: 100vh; background: #F3F4F6;">
    <v-card max-width="480" width="100%" class="pa-8 mx-4" elevation="2" rounded="xl">
      <div class="d-flex align-center mb-2">
        <v-icon color="primary" size="36" class="mr-2">mdi-book-open-page-variant</v-icon>
        <span class="text-h5 font-weight-bold text-primary">DigiLib</span>
      </div>
      <h3 class="text-h6 font-weight-bold text-grey-darken-4 mt-4">Đăng ký tài khoản</h3>
      <p class="text-body-2 text-grey mt-1 mb-6">Tạo tài khoản độc giả mới</p>

      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" closable>{{ error }}</v-alert>
      <v-alert v-if="success" type="success" variant="tonal" density="compact" class="mb-4">{{ success }}</v-alert>

      <v-form @submit.prevent="handleRegister">
        <v-text-field v-model="form.fullName" label="Họ và tên" prepend-inner-icon="mdi-account" class="mb-3" />
        <v-text-field v-model="form.email" label="Email" type="email" prepend-inner-icon="mdi-email" class="mb-3" />
        <v-text-field v-model="form.password" label="Mật khẩu" type="password" prepend-inner-icon="mdi-lock" class="mb-3" />
        <v-text-field v-model="form.confirmPassword" label="Xác nhận mật khẩu" type="password" prepend-inner-icon="mdi-lock-check" class="mb-4" />

        <v-btn type="submit" color="primary" size="large" block :loading="loading">Đăng ký</v-btn>

        <p class="text-center text-body-2 text-grey mt-4">
          Đã có tài khoản?
          <router-link to="/login" class="text-primary font-weight-medium text-decoration-none">Đăng nhập</router-link>
        </p>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { authApi } from '../../services/authApi'

const form = reactive({ fullName: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')
const success = ref('')

async function handleRegister() {
  error.value = ''
  success.value = ''
  if (form.password !== form.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }
  loading.value = true
  try {
    await authApi.register({ fullName: form.fullName, email: form.email, password: form.password, role: 'Reader' })
    success.value = 'Đăng ký thành công! Bạn có thể đăng nhập ngay.'
  } catch (e) {
    error.value = e.response?.data?.message || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}
</script>
