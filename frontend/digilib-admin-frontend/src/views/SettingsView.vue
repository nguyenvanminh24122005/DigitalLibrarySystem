<template>
  <PageHeader
    title="Cài đặt hệ thống"
    subtitle="Quản lý và cấu hình các thiết lập vận hành của hệ thống thư viện số DIGILIB"
    breadcrumb="Cài đặt hệ thống"
  >
    <button class="ghost-btn" type="button" @click="loadSettings">
      <v-icon icon="mdi-refresh" />
      Làm mới
    </button>
  </PageHeader>

  <section class="settings-page">
    <div v-if="error" class="alert error-alert">
      <v-icon icon="mdi-alert-circle-outline" />
      <span>{{ error }}</span>
    </div>

    <div v-if="success" class="alert success-alert">
      <v-icon icon="mdi-check-circle-outline" />
      <span>{{ success }}</span>
    </div>

    <div class="settings-toolbar">
      <div class="toolbar-left">
        <div class="toolbar-icon">
          <v-icon icon="mdi-cog-outline" />
        </div>

        <div>
          <h2>Cấu hình hệ thống thư viện</h2>
          <p>Các thay đổi giao diện được áp dụng ngay. Các thông tin vận hành sẽ được lưu vào API Settings.</p>
        </div>
      </div>

      <div class="toolbar-actions">
        <button class="ghost-btn" type="button" @click="resetAppearance">
          <v-icon icon="mdi-restore" />
          Khôi phục giao diện
        </button>

        <button class="primary-btn" type="button" :disabled="saving" @click="saveSettings">
          <v-icon icon="mdi-content-save-outline" />
          {{ saving ? 'Đang lưu...' : 'Lưu & áp dụng ngay' }}
        </button>
      </div>
    </div>

    <div class="settings-layout">
      <div class="settings-left">
        <article class="setting-card">
          <div class="card-title-row">
            <div class="card-icon">
              <v-icon icon="mdi-bank-outline" />
            </div>

            <span class="card-number">1.</span>

            <div>
              <h3>Thông tin thư viện</h3>
            </div>
          </div>

          <div class="setting-form info-form">
            <div class="field">
              <label>Tên thư viện</label>
              <input v-model.trim="form.LibraryName" class="input" placeholder="DIGILIB Library" />
            </div>

            <div class="field">
              <label>Email liên hệ</label>
              <input v-model.trim="form.LibraryEmail" class="input" placeholder="info@digilib.vn" />
            </div>

            <div class="field">
              <label>Số điện thoại</label>
              <input v-model.trim="form.LibraryPhone" class="input" placeholder="(024) 1234 5678" />
            </div>

            <div class="field">
              <label>Địa chỉ</label>
              <input v-model.trim="form.LibraryAddress" class="input" placeholder="123 Đường Láng, Đống Đa, Hà Nội" />
            </div>

            <div class="field">
              <label>Giờ mở cửa</label>
              <select v-model="form.OpeningHours" class="select">
                <option value="07:30 - 17:30">07:30 - 17:30 (Thứ 2 - Thứ 7)</option>
                <option value="08:00 - 17:00">08:00 - 17:00 (Thứ 2 - Thứ 6)</option>
                <option value="08:00 - 20:00">08:00 - 20:00 (Hằng ngày)</option>
              </select>
            </div>

            <div class="field logo-field">
              <label>Logo thư viện</label>

              <div class="logo-row">
                <div class="logo-preview">
                  <v-icon icon="mdi-book-open-page-variant-outline" />
                  <span>DIGILIB</span>
                </div>

                <button class="change-logo-btn" type="button">
                  <v-icon icon="mdi-upload-outline" />
                  Thay đổi
                </button>
              </div>

              <small>PNG, JPG, GIF tối đa 2MB</small>
            </div>
          </div>
        </article>

        <article class="setting-card">
          <div class="card-title-row">
            <div class="card-icon">
              <v-icon icon="mdi-book-open-variant" />
            </div>

            <span class="card-number">2.</span>

            <div>
              <h3>Quy định mượn trả</h3>
            </div>
          </div>

          <div class="setting-form borrow-form">
            <div class="setting-line">
              <label>Thời hạn mượn mặc định / ngày</label>

              <div class="input-unit">
                <input v-model.number="form.DefaultBorrowDays" type="number" min="1" />
                <span>ngày</span>
              </div>
            </div>

            <div class="setting-line">
              <label>Số sách tối đa mỗi độc giả</label>

              <div class="input-unit">
                <input v-model.number="form.MaxBooksPerReader" type="number" min="1" />
                <span>quyển</span>
              </div>
            </div>

            <div class="setting-line">
              <label>Số lần gia hạn tối đa</label>

              <div class="input-unit">
                <input v-model.number="form.MaxRenewals" type="number" min="0" />
                <span>lần</span>
              </div>
            </div>

            <div class="setting-line">
              <label>Phí phạt quá hạn / ngày</label>

              <div class="input-unit">
                <input v-model.number="form.FinePerDay" type="number" min="0" />
                <span>đ</span>
              </div>
            </div>

            <div class="setting-line switch-line">
              <label>
                Cho phép độc giả tự gia hạn
                <v-icon icon="mdi-information-outline" />
              </label>

              <label class="switch">
                <input v-model="form.AllowReaderRenewal" type="checkbox" />
                <span></span>
              </label>
            </div>

            <div class="setting-line switch-line">
              <label>
                Cho phép độc giả tự đăng ký
                <v-icon icon="mdi-information-outline" />
              </label>

              <label class="switch">
                <input v-model="form.AllowReaderRegistration" type="checkbox" />
                <span></span>
              </label>
            </div>
          </div>
        </article>

        <article class="setting-card">
          <div class="card-title-row">
            <div class="card-icon">
              <v-icon icon="mdi-bell-outline" />
            </div>

            <span class="card-number">4.</span>

            <div>
              <h3>Thông báo & hệ thống</h3>
            </div>
          </div>

          <div class="setting-form compact-form">
            <div class="setting-line switch-line">
              <label>Bật email thông báo</label>

              <label class="switch">
                <input v-model="form.NotifyByEmail" type="checkbox" />
                <span></span>
              </label>
            </div>

            <div class="setting-line">
              <label>Nhắc hạn trả sách trước</label>

              <div class="input-unit">
                <input v-model.number="form.ReminderBeforeDueDays" type="number" min="1" />
                <span>ngày</span>
              </div>
            </div>

            <div class="setting-line switch-line">
              <label>Cảnh báo sách quá hạn</label>

              <label class="switch">
                <input v-model="form.AlertOverdueBooks" type="checkbox" />
                <span></span>
              </label>
            </div>

            <div class="setting-line switch-line">
              <label>Nhật ký hệ thống chi tiết</label>

              <label class="switch">
                <input v-model="form.EnableDetailedLogs" type="checkbox" />
                <span></span>
              </label>
            </div>
          </div>
        </article>

        <article class="setting-card">
          <div class="card-title-row">
            <div class="card-icon">
              <v-icon icon="mdi-shield-account-outline" />
            </div>

            <span class="card-number">5.</span>

            <div>
              <h3>Bảo mật</h3>
            </div>
          </div>

          <div class="setting-form compact-form">
            <div class="setting-line">
              <label>Tự động đăng xuất sau</label>

              <div class="input-unit small">
                <select v-model.number="form.AutoLogoutMinutes">
                  <option :value="15">15</option>
                  <option :value="30">30</option>
                  <option :value="60">60</option>
                  <option :value="120">120</option>
                </select>
                <span>phút</span>
              </div>
            </div>

            <div class="setting-line">
              <label>Yêu cầu đổi mật khẩu định kỳ</label>

              <div class="input-unit small">
                <select v-model.number="form.PasswordChangeDays">
                  <option :value="30">30</option>
                  <option :value="60">60</option>
                  <option :value="90">90</option>
                  <option :value="180">180</option>
                </select>
                <span>ngày</span>
              </div>
            </div>

            <div class="setting-line switch-line">
              <label>Yêu cầu mật khẩu mạnh</label>

              <label class="switch">
                <input v-model="form.RequireStrongPassword" type="checkbox" />
                <span></span>
              </label>
            </div>

            <div class="setting-line switch-line">
              <label>Xác thực hai bước cho admin</label>

              <label class="switch">
                <input v-model="form.AdminTwoFactor" type="checkbox" />
                <span></span>
              </label>
            </div>
          </div>
        </article>
      </div>

      <aside class="appearance-card">
        <div class="card-title-row">
          <div class="card-icon monitor">
            <v-icon icon="mdi-monitor-dashboard" />
          </div>

          <span class="card-number blue-number">3.</span>

          <div>
            <h3>Giao diện hiển thị</h3>
          </div>
        </div>

        <div class="appearance-group">
          <label>Màu giao diện</label>

          <div class="color-grid">
            <button
              v-for="color in accentOptions"
              :key="color.key"
              type="button"
              class="color-item"
              :class="{ active: appearance.PrimaryColor === color.key }"
              @click="chooseAccent(color.key)"
            >
              <span class="color-preview" :style="{ background: color.value }">
                <v-icon v-if="appearance.PrimaryColor === color.key" icon="mdi-check" />
              </span>

              <small>{{ color.label }}</small>
            </button>
          </div>
        </div>

        <div class="appearance-group">
          <div class="switch-title">
            <label>Chế độ sáng / tối</label>

            <label class="switch">
              <input
                type="checkbox"
                :checked="appearance.ThemeMode === 'dark'"
                @change="setThemeMode($event.target.checked ? 'dark' : 'light')"
              />
              <span></span>
            </label>
          </div>

          <div class="mode-segment">
            <button
              type="button"
              :class="{ active: appearance.ThemeMode === 'light' }"
              @click="setThemeMode('light')"
            >
              <v-icon icon="mdi-white-balance-sunny" />
              Sáng
            </button>

            <button
              type="button"
              :class="{ active: appearance.ThemeMode === 'dark' }"
              @click="setThemeMode('dark')"
            >
              <v-icon icon="mdi-weather-night" />
              Tối
            </button>
          </div>
        </div>

        <div class="appearance-group">
          <label>Phóng to phông chữ</label>

          <div class="font-grid">
            <button
              v-for="font in fontOptions"
              :key="font.value"
              type="button"
              :class="{ active: appearance.FontScale === font.value }"
              @click="setFontScale(font.value)"
            >
              {{ font.label }}
            </button>
          </div>
        </div>

        <div class="preview-box">
          <div class="preview-sidebar">
            <span class="preview-active">
              <v-icon icon="mdi-home-outline" />
              Trang chủ
            </span>

            <span>
              <v-icon icon="mdi-book-open-outline" />
              Sách
            </span>

            <span>
              <v-icon icon="mdi-account-group-outline" />
              Độc giả
            </span>
          </div>

          <div class="preview-main">
            <h4>Xin chào, Admin!</h4>
            <p>Hôm nay là ngày làm việc hiệu quả.</p>

            <div class="preview-stats">
              <div>
                <span>Sách</span>
                <strong>12.345</strong>
              </div>

              <div>
                <span>Độc giả</span>
                <strong>1.234</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="appearance-status">
          <div>
            <span>Màu hiện tại</span>
            <b>{{ selectedAccent.label }}</b>
          </div>

          <div>
            <span>Giao diện</span>
            <b>{{ appearance.ThemeMode === 'dark' ? 'Tối' : 'Sáng' }}</b>
          </div>

          <div>
            <span>Cỡ chữ</span>
            <b>{{ appearance.FontScale }}%</b>
          </div>
        </div>
      </aside>
    </div>

    <div class="bottom-bar">
      <div class="info-note">
        <v-icon icon="mdi-information-outline" />
        <span>Các thay đổi giao diện được áp dụng ngay trên hệ thống.</span>
      </div>

      <div class="bottom-actions">
        <button class="ghost-btn" type="button" @click="resetAll">
          <v-icon icon="mdi-backup-restore" />
          Khôi phục mặc định
        </button>

        <button class="ghost-btn" type="button" @click="loadSettings">
          <v-icon icon="mdi-refresh" />
          Tải lại
        </button>

        <button class="primary-btn" type="button" :disabled="saving" @click="saveSettings">
          <v-icon icon="mdi-content-save-outline" />
          {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { identityApi, unwrap, getErrorMessage } from '../services/api'

const THEME_KEY = 'digilib_theme'
const ACCENT_KEY = 'digilib_primary_color'
const FONT_KEY = 'digilib_font_scale'

const accentOptions = [
  { key: 'blue', label: 'Xanh dương', value: '#2563eb' },
  { key: 'green', label: 'Xanh lá', value: '#159947' },
  { key: 'purple', label: 'Tím', value: '#7c3aed' },
  { key: 'orange', label: 'Cam', value: '#ea580c' },
  { key: 'gray', label: 'Xám', value: '#475569' }
]

const fontOptions = [
  { label: '100%', value: '100' },
  { label: '110%', value: '110' },
  { label: '125%', value: '125' },
  { label: '140%', value: '140' }
]

const defaultForm = {
  LibraryName: 'DIGILIB Library',
  LibraryEmail: 'info@digilib.vn',
  LibraryPhone: '(024) 1234 5678',
  LibraryAddress: '123 Đường Láng, Đống Đa, Hà Nội',
  OpeningHours: '07:30 - 17:30',
  DefaultBorrowDays: 14,
  MaxBooksPerReader: 5,
  MaxRenewals: 2,
  FinePerDay: 2000,
  AllowReaderRegistration: true,
  AllowReaderRenewal: true,
  NotifyByEmail: true,
  ReminderBeforeDueDays: 3,
  AlertOverdueBooks: true,
  EnableDetailedLogs: true,
  AutoLogoutMinutes: 30,
  PasswordChangeDays: 90,
  RequireStrongPassword: true,
  AdminTwoFactor: true
}

const defaultAppearance = {
  PrimaryColor: 'blue',
  ThemeMode: 'light',
  FontScale: '100'
}

const rawSettings = ref([])
const error = ref('')
const success = ref('')
const saving = ref(false)

const form = reactive({ ...defaultForm })
const appearance = reactive({ ...defaultAppearance })

const selectedAccent = computed(() => {
  return accentOptions.find((item) => item.key === appearance.PrimaryColor) || accentOptions[0]
})

function getSetting(items, key, fallback) {
  const item = items.find((setting) => String(setting.key).toLowerCase() === String(key).toLowerCase())
  return item ? item.value : fallback
}

function toBool(value, fallback = false) {
  if (value === true || value === 'true' || value === '1' || value === 1) return true
  if (value === false || value === 'false' || value === '0' || value === 0) return false
  return fallback
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeAccent(value) {
  return accentOptions.some((item) => item.key === value) ? value : 'blue'
}

function normalizeTheme(value) {
  return value === 'dark' ? 'dark' : 'light'
}

function normalizeFontScale(value) {
  return fontOptions.some((item) => item.value === String(value)) ? String(value) : '100'
}

function applySettings(items) {
  rawSettings.value = Array.isArray(items) ? items : []

  form.LibraryName = String(getSetting(rawSettings.value, 'LibraryName', defaultForm.LibraryName))
  form.LibraryEmail = String(getSetting(rawSettings.value, 'LibraryEmail', defaultForm.LibraryEmail))
  form.LibraryPhone = String(getSetting(rawSettings.value, 'LibraryPhone', defaultForm.LibraryPhone))
  form.LibraryAddress = String(getSetting(rawSettings.value, 'LibraryAddress', defaultForm.LibraryAddress))
  form.OpeningHours = String(getSetting(rawSettings.value, 'OpeningHours', defaultForm.OpeningHours))

  form.DefaultBorrowDays = toNumber(getSetting(rawSettings.value, 'DefaultBorrowDays', defaultForm.DefaultBorrowDays), 14)
  form.MaxBooksPerReader = toNumber(getSetting(rawSettings.value, 'MaxBooksPerReader', defaultForm.MaxBooksPerReader), 5)
  form.MaxRenewals = toNumber(getSetting(rawSettings.value, 'MaxRenewals', defaultForm.MaxRenewals), 2)
  form.FinePerDay = toNumber(getSetting(rawSettings.value, 'FinePerDay', defaultForm.FinePerDay), 2000)

  form.AllowReaderRegistration = toBool(getSetting(rawSettings.value, 'AllowReaderRegistration', defaultForm.AllowReaderRegistration), true)
  form.AllowReaderRenewal = toBool(getSetting(rawSettings.value, 'AllowReaderRenewal', defaultForm.AllowReaderRenewal), true)

  form.NotifyByEmail = toBool(getSetting(rawSettings.value, 'NotifyByEmail', defaultForm.NotifyByEmail), true)
  form.ReminderBeforeDueDays = toNumber(getSetting(rawSettings.value, 'ReminderBeforeDueDays', defaultForm.ReminderBeforeDueDays), 3)
  form.AlertOverdueBooks = toBool(getSetting(rawSettings.value, 'AlertOverdueBooks', defaultForm.AlertOverdueBooks), true)
  form.EnableDetailedLogs = toBool(getSetting(rawSettings.value, 'EnableDetailedLogs', defaultForm.EnableDetailedLogs), true)

  form.AutoLogoutMinutes = toNumber(getSetting(rawSettings.value, 'AutoLogoutMinutes', defaultForm.AutoLogoutMinutes), 30)
  form.PasswordChangeDays = toNumber(getSetting(rawSettings.value, 'PasswordChangeDays', defaultForm.PasswordChangeDays), 90)
  form.RequireStrongPassword = toBool(getSetting(rawSettings.value, 'RequireStrongPassword', defaultForm.RequireStrongPassword), true)
  form.AdminTwoFactor = toBool(getSetting(rawSettings.value, 'AdminTwoFactor', defaultForm.AdminTwoFactor), true)

  appearance.PrimaryColor = normalizeAccent(
    getSetting(rawSettings.value, 'PrimaryColor', localStorage.getItem(ACCENT_KEY) || defaultAppearance.PrimaryColor)
  )

  appearance.ThemeMode = normalizeTheme(
    getSetting(rawSettings.value, 'ThemeMode', localStorage.getItem(THEME_KEY) || defaultAppearance.ThemeMode)
  )

  appearance.FontScale = normalizeFontScale(
    getSetting(rawSettings.value, 'FontScale', localStorage.getItem(FONT_KEY) || defaultAppearance.FontScale)
  )

  applyAppearance()
}

function applyAppearance() {
  const color = selectedAccent.value.value
  const scale = Number(appearance.FontScale) / 100
  const isDark = appearance.ThemeMode === 'dark'

  localStorage.setItem(ACCENT_KEY, appearance.PrimaryColor)
  localStorage.setItem(THEME_KEY, appearance.ThemeMode)
  localStorage.setItem(FONT_KEY, appearance.FontScale)

  document.documentElement.classList.toggle('digilib-dark', isDark)
  document.body.classList.toggle('digilib-dark', isDark)

  document.documentElement.style.setProperty('--digilib-primary', color)
  document.documentElement.style.setProperty('--digilib-font-scale', String(scale))

  injectRuntimeStyle()

  window.dispatchEvent(
    new CustomEvent('digilib-theme-change', {
      detail: appearance.ThemeMode
    })
  )
}

function injectRuntimeStyle() {
  let style = document.getElementById('digilib-runtime-appearance')

  if (!style) {
    style = document.createElement('style')
    style.id = 'digilib-runtime-appearance'
    document.head.appendChild(style)
  }

  const scale = Number(appearance.FontScale) / 100

  style.textContent = `
    :root {
      --digilib-primary: ${selectedAccent.value.value};
      --digilib-font-scale: ${scale};
      --digilib-setting-font-size: ${16 * scale}px;
    }

    body .primary-btn,
    body .btn-primary,
    body .register-btn,
    body .v-btn.bg-primary {
      background-color: var(--digilib-primary) !important;
      border-color: var(--digilib-primary) !important;
    }

    body .sidebar-link.router-link-active,
    body .sidebar-link.router-link-exact-active,
    body .nav-link.router-link-active,
    body .nav-link.router-link-exact-active,
    body .brand,
    body a {
      color: var(--digilib-primary) !important;
    }

    body .settings-page {
      font-size: var(--digilib-setting-font-size);
    }
  `
}

function chooseAccent(color) {
  appearance.PrimaryColor = normalizeAccent(color)
  applyAppearance()
}

function setThemeMode(mode) {
  appearance.ThemeMode = normalizeTheme(mode)
  applyAppearance()
}

function setFontScale(scale) {
  appearance.FontScale = normalizeFontScale(scale)
  applyAppearance()
}

function resetAppearance() {
  appearance.PrimaryColor = defaultAppearance.PrimaryColor
  appearance.ThemeMode = defaultAppearance.ThemeMode
  appearance.FontScale = defaultAppearance.FontScale
  applyAppearance()
  success.value = 'Đã khôi phục giao diện mặc định.'
}

function resetAll() {
  Object.assign(form, { ...defaultForm })
  Object.assign(appearance, { ...defaultAppearance })
  applyAppearance()
  success.value = 'Đã khôi phục toàn bộ cài đặt về mặc định. Bấm lưu để cập nhật lên API.'
}

function validateForm() {
  if (!form.LibraryName.trim()) return 'Tên thư viện không được để trống.'
  if (Number(form.DefaultBorrowDays) < 1) return 'Thời hạn mượn mặc định phải lớn hơn hoặc bằng 1 ngày.'
  if (Number(form.MaxBooksPerReader) < 1) return 'Số sách tối đa mỗi độc giả phải lớn hơn hoặc bằng 1.'
  if (Number(form.MaxRenewals) < 0) return 'Số lần gia hạn tối đa không được nhỏ hơn 0.'
  if (Number(form.FinePerDay) < 0) return 'Phí phạt quá hạn không được nhỏ hơn 0.'
  return ''
}

async function loadSettings(options = {}) {
  try {
    error.value = ''

    if (!options.keepMessage) {
      success.value = ''
    }

    const res = await identityApi.settings()
    applySettings(unwrap(res))
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được cài đặt hệ thống từ API.')
    rawSettings.value = []
    applyAppearance()
  }
}

async function saveSettings() {
  const validationError = validateForm()

  if (validationError) {
    error.value = validationError
    success.value = ''
    return
  }

  try {
    saving.value = true
    error.value = ''
    success.value = ''

    applyAppearance()

    await identityApi.updateSettings({
      LibraryName: String(form.LibraryName || ''),
      LibraryEmail: String(form.LibraryEmail || ''),
      LibraryPhone: String(form.LibraryPhone || ''),
      LibraryAddress: String(form.LibraryAddress || ''),
      OpeningHours: String(form.OpeningHours || ''),

      DefaultBorrowDays: String(form.DefaultBorrowDays || 14),
      MaxBooksPerReader: String(form.MaxBooksPerReader || 5),
      MaxRenewals: String(form.MaxRenewals || 0),
      FinePerDay: String(form.FinePerDay || 0),
      AllowReaderRegistration: String(form.AllowReaderRegistration),
      AllowReaderRenewal: String(form.AllowReaderRenewal),

      NotifyByEmail: String(form.NotifyByEmail),
      ReminderBeforeDueDays: String(form.ReminderBeforeDueDays || 3),
      AlertOverdueBooks: String(form.AlertOverdueBooks),
      EnableDetailedLogs: String(form.EnableDetailedLogs),

      AutoLogoutMinutes: String(form.AutoLogoutMinutes || 30),
      PasswordChangeDays: String(form.PasswordChangeDays || 90),
      RequireStrongPassword: String(form.RequireStrongPassword),
      AdminTwoFactor: String(form.AdminTwoFactor),

      PrimaryColor: String(appearance.PrimaryColor),
      ThemeMode: String(appearance.ThemeMode),
      FontScale: String(appearance.FontScale)
    })

    success.value = 'Đã lưu và áp dụng cài đặt hệ thống.'
    await loadSettings({ keepMessage: true })
  } catch (e) {
    error.value = getErrorMessage(e, 'Không lưu được cài đặt hệ thống.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  appearance.PrimaryColor = normalizeAccent(localStorage.getItem(ACCENT_KEY) || defaultAppearance.PrimaryColor)
  appearance.ThemeMode = normalizeTheme(localStorage.getItem(THEME_KEY) || defaultAppearance.ThemeMode)
  appearance.FontScale = normalizeFontScale(localStorage.getItem(FONT_KEY) || defaultAppearance.FontScale)

  applyAppearance()
  loadSettings()
})
</script>

<style scoped>
.settings-page {
  display: grid;
  gap: 18px;
}

.settings-toolbar,
.setting-card,
.appearance-card,
.bottom-bar {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
}

.settings-toolbar {
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.toolbar-icon {
  width: 58px;
  height: 58px;
  border-radius: 15px;
  background: #eff6ff;
  color: var(--digilib-primary, #2563eb);
  display: grid;
  place-items: center;
  font-size: 30px;
}

.toolbar-left h2 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
}

.toolbar-left p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 520px;
  gap: 18px;
  align-items: start;
}

.settings-left {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.setting-card,
.appearance-card {
  padding: 22px;
  min-width: 0;
}

.card-title-row {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.card-icon {
  width: 28px;
  height: 28px;
  color: #475569;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.card-icon.monitor {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: #eff6ff;
  color: var(--digilib-primary, #2563eb);
  font-size: 25px;
}

.card-number {
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
}

.blue-number {
  color: var(--digilib-primary, #2563eb);
}

.card-title-row h3 {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
  font-weight: 950;
}

.setting-form {
  display: grid;
  gap: 14px;
}

.info-form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.borrow-form,
.compact-form {
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.field label,
.setting-line label,
.appearance-group label {
  color: #334155;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 850;
}

.field small {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.input,
.select {
  width: 100%;
  height: 40px;
  padding: 0 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  line-height: 40px;
  font-weight: 750;
  box-sizing: border-box;
}

.input:focus,
.select:focus {
  border-color: var(--digilib-primary, #2563eb);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--digilib-primary, #2563eb) 15%, transparent);
}

.logo-field {
  grid-column: 1 / -1;
}

.logo-row {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 10px;
}

.logo-preview {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: var(--digilib-primary, #2563eb);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 21px;
  font-weight: 950;
}

.change-logo-btn {
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  font-weight: 850;
}

.setting-line {
  min-height: 40px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 14px;
  align-items: center;
}

.setting-line label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.input-unit {
  height: 40px;
  display: grid;
  grid-template-columns: 1fr 48px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.input-unit.small {
  grid-template-columns: 1fr 54px;
}

.input-unit input,
.input-unit select {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 12px;
  border: 0;
  outline: 0;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 750;
  appearance: textfield;
}

.input-unit input::-webkit-inner-spin-button,
.input-unit input::-webkit-outer-spin-button {
  margin: 0;
}

.input-unit span {
  border-left: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 750;
}

.switch-line {
  grid-template-columns: minmax(0, 1fr) 54px;
}

.switch {
  position: relative;
  width: 48px;
  height: 28px;
  cursor: pointer;
  justify-self: end;
}

.switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.switch span {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #cbd5e1;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
  transition: 0.22s ease;
}

.switch span::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 5px 12px rgba(15, 23, 42, 0.22);
  transition: 0.22s ease;
}

.switch input:checked + span {
  background: #2563eb;
}

.switch input:checked + span::after {
  transform: translateX(20px);
}

.appearance-card {
  position: sticky;
  top: 92px;
}

.appearance-group {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

.switch-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.color-item {
  height: 76px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  display: grid;
  gap: 6px;
  place-items: center;
}

.color-item.active {
  border-color: var(--digilib-primary, #2563eb);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--digilib-primary, #2563eb) 20%, transparent);
}

.color-preview {
  width: 44px;
  height: 34px;
  border-radius: 8px;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 17px;
}

.color-item small {
  color: #475569;
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
  font-weight: 850;
}

.mode-segment,
.font-grid {
  display: grid;
  gap: 10px;
}

.mode-segment {
  grid-template-columns: 1fr 1fr;
}

.font-grid {
  grid-template-columns: repeat(4, 1fr);
}

.mode-segment button,
.font-grid button {
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-weight: 900;
}

.mode-segment button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.mode-segment button.active,
.font-grid button.active {
  border-color: var(--digilib-primary, #2563eb);
  background: color-mix(in srgb, var(--digilib-primary, #2563eb) 8%, #ffffff);
  color: var(--digilib-primary, #2563eb);
}

.preview-box {
  margin-top: 22px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 14px;
  overflow: hidden;
}

.preview-sidebar {
  display: grid;
  gap: 8px;
  align-content: start;
}

.preview-sidebar span {
  min-height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 850;
}

.preview-sidebar .preview-active {
  background: color-mix(in srgb, var(--digilib-primary, #2563eb) 12%, #ffffff);
  color: var(--digilib-primary, #2563eb);
}

.preview-main {
  padding: 12px;
  border-radius: 10px;
  background: #ffffff;
}

.preview-main h4 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 950;
}

.preview-main p {
  margin: 5px 0 12px;
  color: #64748b;
  font-size: 12px;
  font-weight: 650;
}

.preview-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.preview-stats div {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: #ffffff;
}

.preview-stats span {
  display: block;
  color: var(--digilib-primary, #2563eb);
  font-size: 11px;
  font-weight: 900;
}

.preview-stats strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 950;
}

.appearance-status {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.appearance-status div {
  padding: 12px;
  border-radius: 9px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.appearance-status span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.appearance-status b {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
}

.bottom-bar {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.info-note {
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 750;
}

.info-note .v-icon {
  color: var(--digilib-primary, #2563eb);
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-btn,
.ghost-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 950;
  white-space: nowrap;
}

.primary-btn {
  border: 0;
  background: var(--digilib-primary, #2563eb);
  color: #ffffff;
  box-shadow: 0 14px 30px color-mix(in srgb, var(--digilib-primary, #2563eb) 24%, transparent);
}

.primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ghost-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
}

.alert {
  min-height: 44px;
  padding: 0 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 850;
}

.error-alert {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.success-alert {
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

:global(body.digilib-dark) .settings-toolbar,
:global(body.digilib-dark) .setting-card,
:global(body.digilib-dark) .appearance-card,
:global(body.digilib-dark) .bottom-bar,
:global(body.digilib-dark) .preview-main,
:global(body.digilib-dark) .preview-stats div,
:global(body.digilib-dark) .color-item,
:global(body.digilib-dark) .mode-segment button,
:global(body.digilib-dark) .font-grid button,
:global(body.digilib-dark) .ghost-btn,
:global(body.digilib-dark) .logo-preview,
:global(body.digilib-dark) .change-logo-btn {
  background: #0f172a;
  border-color: #334155;
  color: #e5e7eb;
}

:global(body.digilib-dark) .toolbar-left h2,
:global(body.digilib-dark) .card-title-row h3,
:global(body.digilib-dark) .card-number,
:global(body.digilib-dark) .preview-main h4,
:global(body.digilib-dark) .preview-stats strong,
:global(body.digilib-dark) .appearance-status b {
  color: #f8fafc;
}

:global(body.digilib-dark) .toolbar-left p,
:global(body.digilib-dark) .field label,
:global(body.digilib-dark) .setting-line label,
:global(body.digilib-dark) .appearance-group label,
:global(body.digilib-dark) .field small,
:global(body.digilib-dark) .preview-main p,
:global(body.digilib-dark) .appearance-status span,
:global(body.digilib-dark) .info-note {
  color: #cbd5e1;
}

:global(body.digilib-dark) .input,
:global(body.digilib-dark) .select,
:global(body.digilib-dark) .input-unit,
:global(body.digilib-dark) .input-unit input,
:global(body.digilib-dark) .input-unit select {
  background: #111827;
  border-color: #334155;
  color: #f8fafc;
}

:global(body.digilib-dark) .input-unit span,
:global(body.digilib-dark) .preview-box,
:global(body.digilib-dark) .appearance-status div {
  background: #111827;
  border-color: #334155;
}

:global(body.digilib-dark) .mode-segment button.active,
:global(body.digilib-dark) .font-grid button.active {
  background: color-mix(in srgb, var(--digilib-primary, #2563eb) 22%, #0f172a);
  color: #dbeafe;
}

@media (max-width: 1440px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .appearance-card {
    position: static;
  }
}

@media (max-width: 980px) {
  .settings-toolbar,
  .bottom-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions,
  .bottom-actions {
    flex-wrap: wrap;
  }

  .settings-left {
    grid-template-columns: 1fr;
  }

  .info-form {
    grid-template-columns: 1fr;
  }

  .setting-line {
    grid-template-columns: 1fr;
  }

  .switch-line {
    grid-template-columns: 1fr 54px;
  }

  .color-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .preview-box {
    grid-template-columns: 1fr;
  }

  .appearance-status {
    grid-template-columns: 1fr;
  }
}
</style>