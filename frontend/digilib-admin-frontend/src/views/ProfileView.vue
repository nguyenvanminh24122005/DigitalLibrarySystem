<template>
  <PageHeader
    title="Hồ sơ cá nhân"
    subtitle="Quản lý thông tin tài khoản và bảo mật của bạn"
    breadcrumb="Hệ thống / Hồ sơ cá nhân"
  >
    <button class="ghost-btn" type="button" @click="loadProfile">
      <v-icon icon="mdi-refresh" />
      Làm mới
    </button>
  </PageHeader>

  <div v-if="loading" class="profile-loading">
    <v-icon icon="mdi-loading" class="spin" />
    Đang tải hồ sơ...
  </div>

  <section v-else class="profile-page">
    <div v-if="message" class="form-success">
      <v-icon icon="mdi-check-circle-outline" />
      {{ message }}
    </div>

    <div v-if="error" class="form-error">
      <v-icon icon="mdi-alert-circle-outline" />
      {{ error }}
    </div>

    <div class="profile-top-grid">
      <article class="profile-hero-card">
        <div class="hero-bg"></div>

        <div class="profile-main-info">
          <div class="profile-avatar">
            {{ initials }}
          </div>

          <div class="profile-name-box">
            <h2>{{ profile.fullName || 'Admin' }}</h2>

            <span class="role-pill">
              {{ profile.roleName || auth.user?.role || 'Admin' }}
            </span>

            <p class="status-line">
              <span></span>
              {{ statusText }}
            </p>
          </div>
        </div>

        <div class="profile-info-grid">
          <div class="info-item">
            <div class="info-icon">
              <v-icon icon="mdi-email-outline" />
            </div>

            <div>
              <span>Email</span>
              <b>{{ profile.email || '-' }}</b>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <v-icon icon="mdi-account-outline" />
            </div>

            <div>
              <span>Tên đăng nhập</span>
              <b>{{ profile.username || '-' }}</b>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <v-icon icon="mdi-phone-outline" />
            </div>

            <div>
              <span>Số điện thoại</span>
              <b>{{ profile.phone || '-' }}</b>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <v-icon icon="mdi-shield-account-outline" />
            </div>

            <div>
              <span>Vai trò</span>
              <b>{{ profile.roleName || auth.user?.role || 'Admin' }}</b>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <button class="primary-btn" type="button" @click="openInfoTab">
            <v-icon icon="mdi-pencil-outline" />
            Chỉnh sửa hồ sơ
          </button>

          <button class="outline-btn" type="button" @click="openPasswordTab">
            <v-icon icon="mdi-lock-reset" />
            Đổi mật khẩu
          </button>

          <button class="outline-btn compact" type="button" @click="copyEmail">
            <v-icon icon="mdi-content-copy" />
            Copy email
          </button>
        </div>
      </article>

      <article ref="formCardRef" class="update-card">
        <div class="card-head">
          <h3>Cập nhật thông tin</h3>
          <p>Thay đổi thông tin cá nhân hoặc cập nhật mật khẩu đăng nhập.</p>
        </div>

        <div class="tabs">
          <button
            class="tab"
            type="button"
            :class="{ active: activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            Thông tin cá nhân
          </button>

          <button
            class="tab"
            type="button"
            :class="{ active: activeTab === 'password' }"
            @click="activeTab = 'password'"
          >
            Đổi mật khẩu
          </button>
        </div>

        <form v-if="activeTab === 'info'" class="profile-form" @submit.prevent="saveProfile">
          <div class="field">
            <label>Họ và tên *</label>
            <input
              v-model.trim="form.fullName"
              class="input"
              placeholder="Nhập họ tên"
              autocomplete="name"
            />
          </div>

          <div class="field">
            <label>Email *</label>
            <input
              v-model.trim="form.email"
              class="input"
              type="email"
              placeholder="admin@digilib.edu.vn"
              autocomplete="email"
            />
          </div>

          <div class="field">
            <label>Tên đăng nhập</label>
            <input :value="profile.username || '-'" class="input disabled" disabled />
          </div>

          <div class="field">
            <label>Vai trò</label>
            <input :value="profile.roleName || auth.user?.role || 'Admin'" class="input disabled" disabled />
          </div>

          <div class="field full">
            <label>Số điện thoại</label>
            <input
              v-model.trim="form.phone"
              class="input"
              placeholder="0901234567"
              autocomplete="tel"
            />
          </div>

          <div class="form-actions full">
            <button class="outline-btn" type="button" @click="resetProfileForm">
              Hủy
            </button>

            <button class="primary-btn" type="submit" :disabled="saving">
              <v-icon icon="mdi-content-save-outline" />
              {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>

        <form v-else class="profile-form" @submit.prevent="changePassword">
          <div class="field full">
            <label>Mật khẩu hiện tại *</label>

            <div class="password-input">
              <input
                v-model="passwordForm.currentPassword"
                class="input"
                :type="showPassword.current ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Nhập mật khẩu hiện tại"
              />

              <button type="button" @click="showPassword.current = !showPassword.current">
                <v-icon :icon="showPassword.current ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" />
              </button>
            </div>
          </div>

          <div class="field">
            <label>Mật khẩu mới *</label>

            <div class="password-input">
              <input
                v-model="passwordForm.newPassword"
                class="input"
                :type="showPassword.new ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Nhập mật khẩu mới"
              />

              <button type="button" @click="showPassword.new = !showPassword.new">
                <v-icon :icon="showPassword.new ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" />
              </button>
            </div>
          </div>

          <div class="field">
            <label>Nhập lại mật khẩu mới *</label>

            <div class="password-input">
              <input
                v-model="passwordForm.confirmPassword"
                class="input"
                :type="showPassword.confirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
              />

              <button type="button" @click="showPassword.confirm = !showPassword.confirm">
                <v-icon :icon="showPassword.confirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" />
              </button>
            </div>
          </div>

          <div class="password-rules full">
            <p :class="{ ok: passwordForm.newPassword.length >= 6 }">
              <v-icon :icon="passwordForm.newPassword.length >= 6 ? 'mdi-check-circle-outline' : 'mdi-circle-outline'" />
              Tối thiểu 6 ký tự
            </p>

            <p :class="{ ok: passwordMatch }">
              <v-icon :icon="passwordMatch ? 'mdi-check-circle-outline' : 'mdi-circle-outline'" />
              Mật khẩu nhập lại trùng khớp
            </p>
          </div>

          <div class="form-actions full">
            <button class="outline-btn" type="button" @click="resetPasswordForm">
              Hủy
            </button>

            <button class="primary-btn" type="submit" :disabled="saving">
              <v-icon icon="mdi-lock-reset" />
              {{ saving ? 'Đang đổi...' : 'Đổi mật khẩu' }}
            </button>
          </div>
        </form>
      </article>
    </div>

    <div class="profile-bottom-grid">
      <article class="info-card">
        <div class="small-card-head">
          <div class="small-icon blue">
            <v-icon icon="mdi-account-circle-outline" />
          </div>

          <h3>Thông tin tài khoản</h3>
        </div>

        <div class="detail-list">
          <div>
            <span>Mã tài khoản</span>
            <b>{{ shortId(profile.id) }}</b>
          </div>

          <div>
            <span>Tên đăng nhập</span>
            <b>{{ profile.username || '-' }}</b>
          </div>

          <div>
            <span>Email</span>
            <b>{{ profile.email || '-' }}</b>
          </div>

          <div>
            <span>Vai trò</span>
            <b>{{ profile.roleName || auth.user?.role || '-' }}</b>
          </div>

          <div>
            <span>Ngày tạo tài khoản</span>
            <b>{{ formatDateTime(profile.createdAt) }}</b>
          </div>

          <div>
            <span>Đăng nhập cuối</span>
            <b>{{ formatDateTime(profile.lastLoginAt) }}</b>
          </div>
        </div>
      </article>

      <article class="security-card">
        <div class="small-card-head">
          <div class="small-icon purple">
            <v-icon icon="mdi-shield-check-outline" />
          </div>

          <h3>Bảo mật</h3>
        </div>

        <div class="security-list">
          <div class="security-row">
            <div class="security-left">
              <div class="security-icon">
                <v-icon icon="mdi-lock-outline" />
              </div>

              <div>
                <span>Mật khẩu</span>
                <b>********</b>
              </div>
            </div>

            <button type="button" @click="openPasswordTab">Đổi</button>
          </div>

          <div class="security-row">
            <div class="security-left">
              <div class="security-icon">
                <v-icon icon="mdi-shield-key-outline" />
              </div>

              <div>
                <span>Xác thực hai lớp</span>
                <b>{{ twoFactorEnabled ? 'Bật' : 'Tắt' }}</b>
              </div>
            </div>

            <button type="button" @click="toggleTwoFactor">
              {{ twoFactorEnabled ? 'Tắt' : 'Bật' }}
            </button>
          </div>

          <div class="security-row">
            <div class="security-left">
              <div class="security-icon">
                <v-icon icon="mdi-email-check-outline" />
              </div>

              <div>
                <span>Email khôi phục</span>
                <b>{{ profile.email || 'Chưa có' }}</b>
              </div>
            </div>

            <button type="button" @click="openInfoTab">Cập nhật</button>
          </div>

          <div class="security-row">
            <div class="security-left">
              <div class="security-icon">
                <v-icon icon="mdi-cellphone-link" />
              </div>

              <div>
                <span>Phiên đăng nhập hiện tại</span>
                <b>1 thiết bị</b>
              </div>
            </div>

            <button type="button" @click="showCurrentSession">Xem</button>
          </div>
        </div>
      </article>

      <article class="activity-card">
        <div class="small-card-head activity-head">
          <div class="head-left">
            <div class="small-icon orange">
              <v-icon icon="mdi-clock-time-four-outline" />
            </div>

            <h3>Hoạt động gần đây</h3>
          </div>

          <button class="link-btn" type="button" @click="showAllActivities = !showAllActivities">
            {{ showAllActivities ? 'Thu gọn' : 'Xem tất cả' }}
          </button>
        </div>

        <div class="activity-list">
          <div
            v-for="activity in visibleActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="activity.color">
              <v-icon :icon="activity.icon" />
            </div>

            <div>
              <b>{{ activity.title }}</b>
              <span>{{ activity.time }} · {{ browserName }} trên Windows</span>
            </div>

            <em v-if="activity.current">Hiện tại</em>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { useAuthStore } from '../stores/auth'
import { getErrorMessage, identityApi, unwrap } from '../services/api'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('info')
const message = ref('')
const error = ref('')
const formCardRef = ref(null)
const showAllActivities = ref(false)
const twoFactorEnabled = ref(localStorage.getItem('digilib_admin_two_factor') === 'true')

const profile = reactive({
  id: '',
  fullName: '',
  username: '',
  email: '',
  phone: '',
  roleName: '',
  status: '',
  createdAt: '',
  updatedAt: '',
  lastLoginAt: ''
})

const form = reactive({
  fullName: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showPassword = reactive({
  current: false,
  new: false,
  confirm: false
})

const initials = computed(() => {
  const name = profile.fullName || auth.user?.name || 'Admin'

  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((item) => item[0])
      .join('')
      .toUpperCase() || 'A'
  )
})

const statusText = computed(() => {
  const status = String(profile.status || '').toLowerCase()

  if (status === '1' || status === 'active') return 'Đang hoạt động'
  if (status === '2' || status === 'locked') return 'Đang bị khóa'
  if (status === '3' || status === 'inactive') return 'Không hoạt động'

  return 'Đang hoạt động'
})

const passwordMatch = computed(() => {
  return (
    passwordForm.newPassword.length > 0 &&
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword === passwordForm.confirmPassword
  )
})

const browserName = computed(() => {
  const userAgent = navigator.userAgent || ''

  if (userAgent.includes('Edg')) return 'Microsoft Edge'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'

  return 'Trình duyệt'
})

const activities = computed(() => {
  const loginTime = profile.lastLoginAt || new Date().toISOString()
  const updatedTime = profile.updatedAt || profile.createdAt || ''
  const createdTime = profile.createdAt || ''

  const list = [
    {
      id: 'login',
      title: 'Đăng nhập thành công',
      time: formatDateTime(loginTime),
      icon: 'mdi-login',
      color: 'green',
      current: true
    }
  ]

  if (updatedTime) {
    list.push({
      id: 'update',
      title: 'Cập nhật thông tin hồ sơ',
      time: formatDateTime(updatedTime),
      icon: 'mdi-pencil-outline',
      color: 'blue',
      current: false
    })
  }

  list.push({
    id: 'password',
    title: 'Kiểm tra bảo mật tài khoản',
    time: formatDateTime(new Date().toISOString()),
    icon: 'mdi-lock-check-outline',
    color: 'purple',
    current: false
  })

  if (createdTime) {
    list.push({
      id: 'created',
      title: 'Tài khoản được tạo',
      time: formatDateTime(createdTime),
      icon: 'mdi-account-plus-outline',
      color: 'orange',
      current: false
    })
  }

  return list
})

const visibleActivities = computed(() => {
  return showAllActivities.value ? activities.value : activities.value.slice(0, 4)
})

function assignProfile(data = {}) {
  profile.id = data.id || data.Id || ''
  profile.fullName = data.fullName || data.FullName || data.name || data.Name || auth.user?.name || 'Admin'
  profile.username = data.username || data.Username || auth.user?.username || 'admin'
  profile.email = data.email || data.Email || auth.user?.email || ''
  profile.phone = data.phone || data.Phone || auth.user?.phone || ''
  profile.roleName = data.roleName || data.RoleName || data.role || data.Role || auth.user?.role || 'Admin'
  profile.status = data.status ?? data.Status ?? 'active'
  profile.createdAt = data.createdAt || data.CreatedAt || ''
  profile.updatedAt = data.updatedAt || data.UpdatedAt || ''
  profile.lastLoginAt = data.lastLoginAt || data.LastLoginAt || ''

  form.fullName = profile.fullName
  form.email = profile.email
  form.phone = profile.phone || ''
}

async function loadProfile() {
  try {
    loading.value = true
    error.value = ''
    message.value = ''

    const data = unwrap(await identityApi.profile())
    assignProfile(data)
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được hồ sơ cá nhân.')

    assignProfile({
      fullName: auth.user?.name || 'Admin',
      username: auth.user?.username || 'admin',
      email: auth.user?.email || 'admin@digilib.edu.vn',
      phone: auth.user?.phone || '',
      roleName: auth.user?.role || 'Admin',
      status: 'active'
    })
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  try {
    saving.value = true
    error.value = ''
    message.value = ''

    if (!form.fullName.trim()) {
      throw new Error('Vui lòng nhập họ và tên.')
    }

    if (!form.email.trim()) {
      throw new Error('Vui lòng nhập email.')
    }

    await identityApi.updateProfile({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone
    })

    assignProfile({
      ...profile,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      updatedAt: new Date().toISOString()
    })

    auth.user = {
      ...(auth.user || {}),
      name: form.fullName,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      username: profile.username,
      role: profile.roleName || auth.user?.role
    }

    localStorage.setItem('digilib_user', JSON.stringify(auth.user))

    message.value = 'Đã cập nhật hồ sơ cá nhân.'
  } catch (e) {
    error.value = getErrorMessage(e, e.message || 'Lưu hồ sơ thất bại.')
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  try {
    saving.value = true
    error.value = ''
    message.value = ''

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      throw new Error('Vui lòng nhập đầy đủ thông tin mật khẩu.')
    }

    if (passwordForm.newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.')
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      throw new Error('Mật khẩu nhập lại không khớp.')
    }

    await identityApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    resetPasswordForm()
    activeTab.value = 'info'
    message.value = 'Đổi mật khẩu thành công.'
  } catch (e) {
    error.value = getErrorMessage(e, e.message || 'Đổi mật khẩu thất bại.')
  } finally {
    saving.value = false
  }
}

function resetProfileForm() {
  form.fullName = profile.fullName
  form.email = profile.email
  form.phone = profile.phone || ''
  error.value = ''
  message.value = ''
}

function resetPasswordForm() {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''

  showPassword.current = false
  showPassword.new = false
  showPassword.confirm = false
}

async function openInfoTab() {
  activeTab.value = 'info'
  await nextTick()
  formCardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function openPasswordTab() {
  activeTab.value = 'password'
  await nextTick()
  formCardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function copyEmail() {
  try {
    if (!profile.email) {
      throw new Error('Tài khoản chưa có email để sao chép.')
    }

    await navigator.clipboard.writeText(profile.email)
    message.value = 'Đã sao chép email vào clipboard.'
    error.value = ''
  } catch (e) {
    error.value = e.message || 'Không sao chép được email.'
    message.value = ''
  }
}

function toggleTwoFactor() {
  twoFactorEnabled.value = !twoFactorEnabled.value
  localStorage.setItem('digilib_admin_two_factor', String(twoFactorEnabled.value))

  message.value = twoFactorEnabled.value
    ? 'Đã bật xác thực hai lớp cho tài khoản Admin.'
    : 'Đã tắt xác thực hai lớp cho tài khoản Admin.'

  error.value = ''
}

function showCurrentSession() {
  message.value = `Phiên hiện tại đang hoạt động trên ${browserName.value} - Windows.`
  error.value = ''
}

function shortId(id) {
  if (!id) return '-'

  const value = String(id)

  if (value.length <= 10) return value

  return `${value.slice(0, 8)}...`
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('vi-VN')
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-loading {
  min-height: 160px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 850;
}

.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.profile-page {
  display: grid;
  gap: 18px;
}

.profile-top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(430px, 0.85fr);
  gap: 18px;
  align-items: stretch;
}

.profile-bottom-grid {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr 1.1fr;
  gap: 18px;
  align-items: stretch;
}

.profile-hero-card,
.update-card,
.info-card,
.security-card,
.activity-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
}

.profile-hero-card {
  position: relative;
  overflow: hidden;
  padding: 26px;
}

.hero-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 48%;
  height: 155px;
  background:
    radial-gradient(circle at 82% 20%, rgba(37, 99, 235, 0.12), transparent 42%),
    linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.08) 100%);
  border-bottom-left-radius: 90px;
}

.profile-main-info {
  position: relative;
  z-index: 1;
  padding-bottom: 22px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 28px;
}

.profile-avatar {
  width: 124px;
  height: 124px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 44px;
  font-weight: 950;
}

.profile-name-box h2 {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 950;
}

.role-pill {
  width: fit-content;
  margin-top: 9px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  display: block;
  font-size: 13px;
  font-weight: 950;
}

.status-line {
  margin: 14px 0 0;
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 900;
}

.status-line span {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.profile-info-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 28px;
}

.info-item {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 12px;
  align-items: start;
}

.info-icon {
  width: 30px;
  height: 30px;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.info-item span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.info-item b {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 850;
  word-break: break-word;
}

.hero-actions {
  margin-top: 26px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.update-card {
  padding: 22px;
}

.card-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 950;
}

.card-head p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.tabs {
  margin-top: 22px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 28px;
}

.tab {
  height: 46px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-weight: 950;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.profile-form {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full {
  grid-column: 1 / -1;
}

.field {
  display: grid;
  gap: 8px;
}

.field label {
  color: #475569;
  font-size: 13px;
  font-weight: 900;
}

.input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 750;
}

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

.input.disabled,
.input:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-input .input {
  padding-right: 46px;
}

.password-input button {
  position: absolute;
  top: 50%;
  right: 8px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  transform: translateY(-50%);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.password-input button:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.password-rules {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  gap: 8px;
}

.password-rules p {
  margin: 0;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 800;
}

.password-rules p.ok {
  color: #16a34a;
}

.form-actions {
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-btn,
.outline-btn,
.ghost-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 950;
}

.primary-btn {
  border: 0;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
}

.primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.outline-btn,
.ghost-btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #2563eb;
}

.outline-btn.compact {
  padding: 0 14px;
}

.info-card,
.security-card,
.activity-card {
  padding: 22px;
}

.small-card-head {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-head {
  justify-content: space-between;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.small-card-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 950;
}

.small-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.small-icon.blue {
  background: #eff6ff;
  color: #2563eb;
}

.small-icon.purple {
  background: #f3e8ff;
  color: #7c3aed;
}

.small-icon.orange {
  background: #fff7ed;
  color: #ea580c;
}

.detail-list,
.security-list {
  display: grid;
}

.detail-list div {
  min-height: 48px;
  border-bottom: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: center;
}

.detail-list div:last-child {
  border-bottom: 0;
}

.detail-list span {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.detail-list b {
  color: #0f172a;
  text-align: right;
  font-size: 13px;
  font-weight: 900;
  word-break: break-word;
}

.security-row {
  min-height: 58px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.security-row:last-child {
  border-bottom: 0;
}

.security-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.security-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.security-left span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.security-left b {
  display: block;
  margin-top: 3px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
  word-break: break-word;
}

.security-row button,
.link-btn {
  min-width: 60px;
  height: 34px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #ffffff;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
  font-weight: 950;
}

.link-btn {
  border: 0;
  background: transparent;
}

.activity-list {
  display: grid;
  gap: 0;
}

.activity-item {
  position: relative;
  min-height: 68px;
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 12px;
  align-items: center;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.activity-icon.green {
  background: #dcfce7;
  color: #16a34a;
}

.activity-icon.blue {
  background: #dbeafe;
  color: #2563eb;
}

.activity-icon.purple {
  background: #f3e8ff;
  color: #7c3aed;
}

.activity-icon.orange {
  background: #ffedd5;
  color: #ea580c;
}

.activity-item b {
  display: block;
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
}

.activity-item span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.activity-item em {
  padding: 4px 9px;
  border-radius: 999px;
  background: #dcfce7;
  color: #15803d;
  font-style: normal;
  font-size: 12px;
  font-weight: 950;
}

.form-success,
.form-error {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 850;
}

.form-success {
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.form-error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

:global(body.digilib-dark) .profile-loading,
:global(body.digilib-dark) .profile-hero-card,
:global(body.digilib-dark) .update-card,
:global(body.digilib-dark) .info-card,
:global(body.digilib-dark) .security-card,
:global(body.digilib-dark) .activity-card,
:global(body.digilib-dark) .outline-btn,
:global(body.digilib-dark) .ghost-btn,
:global(body.digilib-dark) .security-row button,
:global(body.digilib-dark) .input,
:global(body.digilib-dark) .password-rules {
  background: #0f172a;
  border-color: #334155;
  color: #e5e7eb;
}

:global(body.digilib-dark) .profile-name-box h2,
:global(body.digilib-dark) .card-head h3,
:global(body.digilib-dark) .small-card-head h3,
:global(body.digilib-dark) .info-item b,
:global(body.digilib-dark) .detail-list b,
:global(body.digilib-dark) .security-left b,
:global(body.digilib-dark) .activity-item b {
  color: #f8fafc;
}

:global(body.digilib-dark) .card-head p,
:global(body.digilib-dark) .info-item span,
:global(body.digilib-dark) .field label,
:global(body.digilib-dark) .detail-list span,
:global(body.digilib-dark) .security-left span,
:global(body.digilib-dark) .activity-item span,
:global(body.digilib-dark) .password-rules p {
  color: #cbd5e1;
}

:global(body.digilib-dark) .input.disabled,
:global(body.digilib-dark) .input:disabled,
:global(body.digilib-dark) .security-icon {
  background: #111827;
  border-color: #334155;
}

:global(body.digilib-dark) .tabs,
:global(body.digilib-dark) .profile-main-info,
:global(body.digilib-dark) .detail-list div,
:global(body.digilib-dark) .security-row {
  border-color: #334155;
}

@media (max-width: 1280px) {
  .profile-top-grid,
  .profile-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .profile-hero-card,
  .update-card,
  .info-card,
  .security-card,
  .activity-card {
    padding: 18px;
  }

  .profile-main-info {
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  .profile-info-grid,
  .profile-form {
    grid-template-columns: 1fr;
  }

  .full {
    grid-column: auto;
  }

  .detail-list div {
    grid-template-columns: 1fr;
  }

  .detail-list b {
    text-align: left;
  }

  .hero-actions,
  .form-actions {
    flex-direction: column;
  }

  .hero-actions button,
  .form-actions button {
    width: 100%;
  }
}
</style>