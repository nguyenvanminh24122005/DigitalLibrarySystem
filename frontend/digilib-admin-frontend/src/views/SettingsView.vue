<template>
  <PageHeader title="Cài đặt hệ thống" subtitle="Quản lý tham số vận hành lấy từ API Settings" breadcrumb="Cài đặt hệ thống">
    <button class="ghost-btn" @click="loadSettings"><v-icon icon="mdi-refresh" /> Làm mới</button>
  </PageHeader>

  <p v-if="error" class="alert error-alert"><v-icon icon="mdi-alert-circle-outline" /> {{ error }}</p>
  <p v-if="success" class="alert success-alert"><v-icon icon="mdi-check-circle-outline" /> {{ success }}</p>

  <div class="grid grid-2">
    <div class="card card-pad">
      <h3 class="section-title">Thông tin thư viện</h3>
      <div class="form-grid one-col">
        <div class="field">
          <label>Tên thư viện</label>
          <input v-model.trim="form.LibraryName" class="input" placeholder="Tên thư viện" />
        </div>
        <div class="field">
          <label>Cho phép độc giả đăng ký</label>
          <select v-model="form.AllowReaderRegistration" class="select">
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Quy định mượn trả</h3>
      <div class="form-grid one-col">
        <div class="field">
          <label>Thời hạn mượn mặc định / ngày</label>
          <input v-model.number="form.DefaultBorrowDays" class="input" type="number" min="1" />
        </div>
        <div class="field">
          <label>Số sách tối đa mỗi độc giả</label>
          <input v-model.number="form.MaxBooksPerReader" class="input" type="number" min="1" />
        </div>
        <div class="field">
          <label>Số lần gia hạn tối đa</label>
          <input v-model.number="form.MaxRenewals" class="input" type="number" min="0" />
        </div>
        <div class="field">
          <label>Phí phạt quá hạn / ngày</label>
          <input v-model.number="form.FinePerDay" class="input" type="number" min="0" />
        </div>
      </div>
    </div>
  </div>

  <div class="card card-pad" style="margin-top:18px">
    <h3 class="section-title">Tất cả cài đặt từ API</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Key</th><th>Value</th><th>Mô tả</th><th>Cập nhật bởi</th><th>Thời gian</th></tr></thead>
        <tbody>
          <tr v-for="item in rawSettings" :key="item.id || item.key">
            <td><b>{{ item.key }}</b></td>
            <td>{{ item.value }}</td>
            <td>{{ item.description || '-' }}</td>
            <td>{{ item.updatedBy || '-' }}</td>
            <td>{{ formatDate(item.updatedAt, true) }}</td>
          </tr>
          <tr v-if="!rawSettings.length"><td colspan="5" class="empty-cell">Chưa có cài đặt hệ thống.</td></tr>
        </tbody>
      </table>
    </div>
    <div class="form-actions">
      <button class="ghost-btn" @click="loadSettings">Làm mới</button>
      <button class="primary-btn" @click="saveSettings" :disabled="saving"><v-icon icon="mdi-content-save-outline" /> {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { identityApi, unwrap, getErrorMessage } from '../services/api'
import { formatDate } from '../services/adapters'

const rawSettings = ref([])
const error = ref('')
const success = ref('')
const saving = ref(false)
const form = reactive({
  LibraryName: '',
  DefaultBorrowDays: 14,
  MaxBooksPerReader: 5,
  MaxRenewals: 2,
  FinePerDay: 2000,
  AllowReaderRegistration: 'true'
})

function applySettings(items) {
  rawSettings.value = items || []
  for (const item of rawSettings.value) {
    if (Object.prototype.hasOwnProperty.call(form, item.key)) {
      form[item.key] = item.value
    }
  }
}

async function loadSettings() {
  try {
    error.value = ''
    success.value = ''
    const res = await identityApi.settings()
    applySettings(unwrap(res))
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được cài đặt hệ thống từ API.')
    rawSettings.value = []
  }
}

async function saveSettings() {
  try {
    saving.value = true
    error.value = ''
    success.value = ''
    await identityApi.updateSettings({
      LibraryName: String(form.LibraryName || ''),
      DefaultBorrowDays: String(form.DefaultBorrowDays || 14),
      MaxBooksPerReader: String(form.MaxBooksPerReader || 5),
      MaxRenewals: String(form.MaxRenewals || 0),
      FinePerDay: String(form.FinePerDay || 0),
      AllowReaderRegistration: String(form.AllowReaderRegistration)
    })
    success.value = 'Đã lưu cài đặt hệ thống.'
    await loadSettings()
  } catch (e) {
    error.value = getErrorMessage(e, 'Không lưu được cài đặt hệ thống.')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.one-col {
  grid-template-columns: 1fr;
}
.success-alert {
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  margin-bottom: 16px;
}
</style>
