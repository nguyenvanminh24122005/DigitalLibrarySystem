<template>
  <PageHeader
    title="Tác giả"
    subtitle="Quản lý thông tin tác giả và danh mục tác giả trong thư viện"
    breadcrumb="Tác giả"
  >
    <div class="btn-row">
      <button class="primary-btn" @click="openCreate">
        <v-icon icon="mdi-plus" />
        Thêm tác giả
      </button>

      <button class="ghost-btn" @click="exportCsv">
        <v-icon icon="mdi-download" />
        Xuất CSV
      </button>
    </div>
  </PageHeader>

  <div v-if="error" class="card card-pad alert-error">
    {{ error }}
  </div>

  <div v-if="success" class="card card-pad alert-success">
    {{ success }}
  </div>

  <div class="grid grid-4 stats-grid">
    <StatCard
      label="Tổng tác giả"
      :value="authors.length"
      icon="mdi-account-edit-outline"
    />

    <StatCard
      label="Đang hoạt động"
      :value="activeCount"
      icon="mdi-check-circle-outline"
      color="#16a34a"
      bg="#ecfdf5"
    />

    <StatCard
      label="Ngưng hiển thị"
      :value="inactiveCount"
      icon="mdi-pause-circle-outline"
      color="#f97316"
      bg="#fff7ed"
    />

    <StatCard
      label="Dữ liệu"
      value="API"
      icon="mdi-cloud-check-outline"
      color="#7c3aed"
      bg="#f5f3ff"
    />
  </div>

  <div class="two-column">
    <div class="card">
      <div class="filter-bar author-filter">
        <input
          class="input"
          placeholder="Tìm theo tên tác giả..."
          v-model="q"
        />

        <select class="select" v-model="status">
          <option value="">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Ngưng sử dụng">Ngưng hiển thị</option>
        </select>

        <button class="primary-btn" @click="loadData">
          Tải lại
        </button>

        <button class="ghost-btn" @click="reset">
          Đặt lại
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tên tác giả</th>
              <th>Quốc tịch</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>

              <td>
                <div class="author-name-cell">
                  <div class="author-avatar">
                    {{ getInitials(item.name) }}
                  </div>

                  <div>
                    <b>{{ item.name }}</b>
                    <span>ID: {{ item.id }}</span>
                  </div>
                </div>
              </td>

              <td>{{ item.nationality || '-' }}</td>

              <td class="description-cell">
                {{ item.description || '-' }}
              </td>

              <td>
                <StatusBadge :text="item.status" />
              </td>

              <td>{{ item.updatedAt || '-' }}</td>

              <td>
                <button class="action-btn" @click="openEdit(item)">
                  <v-icon icon="mdi-pencil-outline" />
                </button>

                <button class="action-btn danger" @click="removeItem(item)">
                  <v-icon icon="mdi-trash-can-outline" />
                </button>
              </td>
            </tr>

            <tr v-if="!loading && filtered.length === 0">
              <td colspan="7" class="empty-state">
                Không có tác giả phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <SideStats
      title="Quản lý tác giả"
      :total="String(authors.length)"
      :items="[
        'Thêm/sửa tác giả qua Catalog API',
        'Ngưng hiển thị thay vì xóa cứng',
        'Dùng cho danh mục đầu sách'
      ]"
    />
  </div>

  <!-- MODAL THÊM / SỬA TÁC GIẢ -->
  <div v-if="showForm" class="author-modal-backdrop" @click.self="closeForm">
    <div class="author-modal">
      <button class="modal-close-btn" type="button" @click="closeForm">
        <v-icon icon="mdi-close" />
      </button>

      <div class="modal-header">
        <div class="modal-icon">
          <v-icon icon="mdi-account-edit-outline" />
        </div>

        <div>
          <h3>
            {{ editingId ? 'Cập nhật tác giả' : 'Thêm tác giả' }}
          </h3>

          <p>
            Nhập thông tin tác giả để sử dụng khi thêm sách và quản lý danh mục đầu sách.
          </p>
        </div>
      </div>

      <div class="author-form-grid">
        <div class="field">
          <label>Tên tác giả <span>*</span></label>

          <div class="input-wrap">
            <v-icon icon="mdi-account-outline" />
            <input
              v-model.trim="form.name"
              type="text"
              placeholder="Nhập tên tác giả"
            />
          </div>
        </div>

        <div class="field">
          <label>Quốc tịch</label>

          <div class="input-wrap">
            <v-icon icon="mdi-earth" />
            <input
              v-model.trim="form.nationality"
              type="text"
              placeholder="Ví dụ: Việt Nam"
            />
          </div>
        </div>

        <div class="field wide">
          <label>Mô tả / Tiểu sử ngắn</label>

          <div class="input-wrap textarea-wrap">
            <v-icon icon="mdi-text-box-outline" />
            <textarea
              v-model.trim="form.description"
              placeholder="Nhập mô tả ngắn về tác giả, lĩnh vực sáng tác hoặc ghi chú"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="author-preview">
        <div class="preview-avatar">
          {{ getInitials(form.name || 'TG') }}
        </div>

        <div>
          <strong>{{ form.name || 'Tên tác giả' }}</strong>
          <span>{{ form.nationality || 'Quốc tịch chưa nhập' }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" type="button" @click="closeForm">
          Hủy
        </button>

        <button
          class="save-btn"
          type="button"
          :disabled="saving || !form.name.trim()"
          @click="saveItem"
        >
          <v-icon icon="mdi-content-save-outline" />
          {{ saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Lưu tác giả' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import SideStats from '../components/SideStats.vue'
import { catalogApi, getErrorMessage } from '../services/api'
import { mapLookup } from '../services/adapters'

const authors = ref([])
const q = ref('')
const status = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showForm = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  nationality: '',
  description: ''
})

const filtered = computed(() => {
  return authors.value.filter((item) => {
    const keyword = q.value.toLowerCase()

    const matchesKeyword =
      !keyword ||
      String(item.name || '').toLowerCase().includes(keyword) ||
      String(item.nationality || '').toLowerCase().includes(keyword) ||
      String(item.description || '').toLowerCase().includes(keyword)

    const matchesStatus = !status.value || item.status === status.value

    return matchesKeyword && matchesStatus
  })
})

const activeCount = computed(() => {
  return authors.value.filter((item) => item.status === 'Hoạt động').length
})

const inactiveCount = computed(() => {
  return authors.value.filter((item) => item.status !== 'Hoạt động').length
})

onMounted(loadData)

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await catalogApi.authors()

    authors.value = data.map((item) => mapLookup(item, 'author'))
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được tác giả.')
  } finally {
    loading.value = false
  }
}

function reset() {
  q.value = ''
  status.value = ''
}

function resetForm() {
  Object.assign(form, {
    name: '',
    nationality: '',
    description: ''
  })
}

function openCreate() {
  editingId.value = null
  resetForm()
  showForm.value = true
}

function openEdit(item) {
  editingId.value = item.id

  Object.assign(form, {
    name: item.name || '',
    nationality: item.nationality || '',
    description: item.description || ''
  })

  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  resetForm()
}

async function saveItem() {
  if (!form.name.trim()) {
    error.value = 'Vui lòng nhập tên tác giả.'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  const payload = {
    name: form.name,
    nationality: form.nationality,
    description: form.description
  }

  try {
    if (editingId.value) {
      await catalogApi.updateAuthor(editingId.value, payload)
      success.value = 'Cập nhật tác giả thành công.'
    } else {
      await catalogApi.createAuthor(payload)
      success.value = 'Thêm tác giả thành công.'
    }

    closeForm()
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Lưu tác giả thất bại.')
  } finally {
    saving.value = false
  }
}

async function removeItem(item) {
  if (!confirm(`Ngưng hiển thị tác giả ${item.name}?`)) return

  try {
    await catalogApi.deleteAuthor(item.id)
    success.value = 'Đã ngưng hiển thị tác giả.'
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Không thể ngưng hiển thị tác giả.')
  }
}

function getInitials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return 'TG'

  const first = words[0]?.[0] || ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] : ''

  return `${first}${last}`.toUpperCase()
}

function exportCsv() {
  const rows = [
    ['Tên', 'Quốc tịch', 'Mô tả', 'Trạng thái'],
    ...filtered.value.map((item) => [
      item.name,
      item.nationality,
      item.description,
      item.status
    ])
  ]

  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')
    )
    .join('\n')

  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;'
    })
  )

  const a = document.createElement('a')
  a.href = url
  a.download = 'authors.csv'
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.stats-grid {
  margin-bottom: 18px;
}

.alert-error {
  margin-bottom: 16px;
  color: #ef4444;
}

.alert-success {
  margin-bottom: 16px;
  color: #16a34a;
}

.author-filter {
  grid-template-columns: 2fr 1fr auto auto;
}

.author-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-name-cell b {
  display: block;
  color: #0f172a;
}

.author-name-cell span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.author-avatar,
.preview-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  color: #2563eb;
  background: #eff6ff;
  font-weight: 900;
}

.author-avatar {
  width: 38px;
  height: 38px;
  font-size: 13px;
}

.description-cell {
  max-width: 360px;
  line-height: 1.45;
  color: #475569;
}

.author-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 28px;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(4px);
}

.author-modal {
  position: relative;
  width: min(960px, 96vw);
  max-height: 92vh;
  overflow-y: auto;
  padding: 34px;
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.28);
}

.modal-close-btn {
  position: absolute;
  top: 22px;
  right: 22px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: #64748b;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  color: #1d4ed8;
  background: #eff6ff;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.modal-icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 18px;
  color: #2563eb;
  background: #eff6ff;
  font-size: 30px;
}

.modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 26px;
  font-weight: 900;
}

.modal-header p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
}

.author-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.field.wide {
  grid-column: 1 / -1;
}

.field label {
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.field label span {
  color: #ef4444;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap :deep(.v-icon) {
  position: absolute;
  left: 16px;
  z-index: 1;
  color: #64748b;
  font-size: 22px;
}

.input-wrap input,
.input-wrap textarea {
  width: 100%;
  border: 1px solid #d7dfec;
  border-radius: 13px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-size: 15px;
  transition: all 0.18s ease;
}

.input-wrap input {
  height: 52px;
  padding: 0 18px 0 50px;
}

.input-wrap textarea {
  min-height: 130px;
  padding: 16px 18px 16px 50px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.55;
}

.input-wrap input::placeholder,
.input-wrap textarea::placeholder {
  color: #94a3b8;
}

.input-wrap input:focus,
.input-wrap textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.textarea-wrap {
  align-items: flex-start;
}

.textarea-wrap :deep(.v-icon) {
  top: 16px;
}

.author-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 16px;
  background: #f8fafc;
}

.preview-avatar {
  width: 52px;
  height: 52px;
  font-size: 16px;
}

.author-preview strong {
  display: block;
  color: #0f172a;
  font-size: 16px;
}

.author-preview span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-weight: 700;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid #e5eaf3;
}

.cancel-btn,
.save-btn {
  height: 48px;
  padding: 0 22px;
  border-radius: 13px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.cancel-btn {
  color: #334155;
  background: #ffffff;
  border: 1px solid #d7dfec;
}

.cancel-btn:hover {
  background: #f8fafc;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #ffffff;
  background: #2563eb;
  border: 1px solid #2563eb;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.24);
}

.save-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.save-btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 820px) {
  .author-modal {
    padding: 26px 20px;
  }

  .author-form-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    align-items: flex-start;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>