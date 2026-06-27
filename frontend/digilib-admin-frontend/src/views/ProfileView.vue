<template>
  <PageHeader
    title="Hồ sơ cá nhân"
    subtitle="Xem và cập nhật thông tin tài khoản Admin đang đăng nhập"
    breadcrumb="Hệ thống / Hồ sơ cá nhân"
  />

  <div v-if="loading" class="card card-pad">Đang tải hồ sơ...</div>

  <div v-else class="two-column">
    <div class="grid">
      <div class="card card-pad" style="text-align:center">
        <div class="profile-avatar">{{ initials }}</div>
        <h2 style="margin:16px 0 4px">{{ profile.fullName || 'Admin' }}</h2>
        <span class="badge blue">{{ profile.roleName || auth.user?.role || 'Quản trị hệ thống' }}</span>
        <p style="color:#16a34a;font-weight:700;margin-top:16px">● {{ statusText }}</p>

        <div class="profile-summary">
          <div>
            <b>Email</b>
            <span>{{ profile.email || '-' }}</span>
          </div>
          <div>
            <b>Tên đăng nhập</b>
            <span>{{ profile.username || '-' }}</span>
          </div>
          <div>
            <b>Số điện thoại</b>
            <span>{{ profile.phone || '-' }}</span>
          </div>
          <div>
            <b>Đăng nhập cuối</b>
            <span>{{ formatDateTime(profile.lastLoginAt) }}</span>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <h3 class="section-title">Thông tin tài khoản</h3>
        <div class="kv"><span class="key">Mã tài khoản</span><b>{{ shortId(profile.id) }}</b></div>
        <div class="kv"><span class="key">Tên đăng nhập</span><b>{{ profile.username || '-' }}</b></div>
        <div class="kv"><span class="key">Email</span><b>{{ profile.email || '-' }}</b></div>
        <div class="kv"><span class="key">Vai trò</span><b>{{ profile.roleName || '-' }}</b></div>
        <div class="kv"><span class="key">Ngày tạo</span><b>{{ formatDateTime(profile.createdAt) }}</b></div>
      </div>
    </div>

    <div class="grid">
      <div class="card card-pad">
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab === 'info' }" type="button" @click="activeTab = 'info'">Thông tin cá nhân</button>
          <button class="tab" :class="{ active: activeTab === 'password' }" type="button" @click="activeTab = 'password'">Đổi mật khẩu</button>
        </div>

        <form v-if="activeTab === 'info'" class="form-grid" @submit.prevent="saveProfile">
          <div class="field">
            <label>Họ và tên *</label>
            <input v-model.trim="form.fullName" class="input" placeholder="Nhập họ tên" />
          </div>
          <div class="field">
            <label>Email *</label>
            <input v-model.trim="form.email" class="input" type="email" placeholder="admin@digilib.edu.vn" />
          </div>
          <div class="field">
            <label>Tên đăng nhập</label>
            <input v-model="profile.username" class="input" disabled />
          </div>
          <div class="field">
            <label>Vai trò</label>
            <input :value="profile.roleName" class="input" disabled />
          </div>
          <div class="field" style="grid-column:1/-1">
            <label>Số điện thoại</label>
            <input v-model.trim="form.phone" class="input" placeholder="0901234567" />
          </div>

          <p v-if="message" class="form-success" style="grid-column:1/-1">{{ message }}</p>
          <p v-if="error" class="form-error" style="grid-column:1/-1">{{ error }}</p>

          <div style="grid-column:1/-1;text-align:right;margin-top:4px">
            <button class="secondary-btn" type="button" @click="loadProfile">Làm mới</button>
            <button class="primary-btn" type="submit" :disabled="saving" style="margin-left:10px">
              {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>

        <form v-else class="form-grid" @submit.prevent="changePassword">
          <div class="field" style="grid-column:1/-1">
            <label>Mật khẩu hiện tại *</label>
            <input v-model="passwordForm.currentPassword" class="input" type="password" autocomplete="current-password" />
          </div>
          <div class="field">
            <label>Mật khẩu mới *</label>
            <input v-model="passwordForm.newPassword" class="input" type="password" autocomplete="new-password" />
          </div>
          <div class="field">
            <label>Nhập lại mật khẩu mới *</label>
            <input v-model="passwordForm.confirmPassword" class="input" type="password" autocomplete="new-password" />
          </div>

          <p v-if="message" class="form-success" style="grid-column:1/-1">{{ message }}</p>
          <p v-if="error" class="form-error" style="grid-column:1/-1">{{ error }}</p>

          <div style="grid-column:1/-1;text-align:right;margin-top:4px">
            <button class="primary-btn" type="submit" :disabled="saving">
              {{ saving ? 'Đang đổi...' : 'Đổi mật khẩu' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card card-pad">
        <h3 class="section-title">Ghi chú</h3>
        <p style="color:#64748b;line-height:1.7;margin:0">
          Trang này lấy dữ liệu từ API thật <b>/api/profile</b>. Khi lưu, hệ thống cập nhật tài khoản Admin trong Identity & Report Service và đồng bộ lại tên/email trên giao diện.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { useAuthStore } from '../stores/auth'
import { getErrorMessage, identityApi, unwrap } from '../services/api'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('info')
const message = ref('')
const error = ref('')

const profile = reactive({
  id: '',
  fullName: '',
  username: '',
  email: '',
  phone: '',
  roleName: '',
  status: '',
  createdAt: '',
  lastLoginAt: ''
})

const form = reactive({ fullName: '', email: '', phone: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

const initials = computed(() => {
  const name = profile.fullName || auth.user?.name || 'Admin'
  return name.split(' ').filter(Boolean).slice(-2).map(x => x[0]).join('').toUpperCase() || 'A'
})

const statusText = computed(() => {
  const status = String(profile.status || '').toLowerCase()
  if (status === '1' || status === 'active') return 'Đang hoạt động'
  if (status === '2' || status === 'locked') return 'Đang bị khóa'
  if (status === '3' || status === 'inactive') return 'Không hoạt động'
  return 'Đang hoạt động'
})

function assignProfile(data) {
  profile.id = data.id || data.Id || ''
  profile.fullName = data.fullName || data.FullName || data.name || auth.user?.name || ''
  profile.username = data.username || data.Username || auth.user?.username || ''
  profile.email = data.email || data.Email || auth.user?.email || ''
  profile.phone = data.phone || data.Phone || auth.user?.phone || ''
  profile.roleName = data.roleName || data.RoleName || auth.user?.role || ''
  profile.status = data.status ?? data.Status ?? ''
  profile.createdAt = data.createdAt || data.CreatedAt || ''
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
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  try {
    saving.value = true
    error.value = ''
    message.value = ''
    if (!form.fullName || !form.email) throw new Error('Vui lòng nhập họ tên và email.')

    await identityApi.updateProfile({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone
    })

    assignProfile({ ...profile, fullName: form.fullName, email: form.email, phone: form.phone })
    auth.user = {
      ...(auth.user || {}),
      name: form.fullName,
      email: form.email,
      phone: form.phone,
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
    if (!passwordForm.currentPassword || !passwordForm.newPassword) throw new Error('Vui lòng nhập đầy đủ mật khẩu.')
    if (passwordForm.newPassword.length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) throw new Error('Mật khẩu nhập lại không khớp.')

    await identityApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    message.value = 'Đổi mật khẩu thành công.'
  } catch (e) {
    error.value = getErrorMessage(e, e.message || 'Đổi mật khẩu thất bại.')
  } finally {
    saving.value = false
  }
}

function shortId(id) {
  if (!id) return '-'
  return String(id).slice(0, 8) + '...'
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
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 32px;
  margin: auto;
  display: grid;
  place-items: center;
  font-size: 40px;
  font-weight: 900;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
}
.profile-summary {
  display: grid;
  gap: 12px;
  margin-top: 20px;
  text-align: left;
}
.profile-summary > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
}
.profile-summary span {
  color: #64748b;
  text-align: right;
  word-break: break-word;
}
.tab {
  border: 0;
  background: transparent;
  cursor: pointer;
}
.form-success {
  color: #15803d;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 10px 12px;
}
.form-error {
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 10px 12px;
}
.secondary-btn {
  border: 1px solid #cbd5e1;
  color: #334155;
  background: #fff;
  border-radius: 12px;
  padding: 11px 16px;
  font-weight: 800;
}
</style>
