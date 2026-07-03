<template>
  <PageHeader
    title="Nhà xuất bản"
    subtitle="Quản lý thông tin nhà xuất bản trong thư viện"
    breadcrumb="Nhà xuất bản"
  >
    <div class="btn-row">
      <button class="primary-btn" @click="openCreate">
        <v-icon icon="mdi-plus" />
        Thêm NXB
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
      label="Tổng NXB"
      :value="publishers.length"
      icon="mdi-office-building-outline"
    />

    <StatCard
      label="Đang hoạt động"
      :value="activeCount"
      icon="mdi-check-circle-outline"
      color="#16a34a"
      bg="#ecfdf5"
    />

    <StatCard
      label="Ngưng hợp tác"
      :value="inactiveCount"
      icon="mdi-handshake-outline"
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
      <div class="filter-bar publisher-filter">
        <input
          class="input"
          placeholder="Tìm theo tên nhà xuất bản..."
          v-model="q"
        />

        <select class="select" v-model="status">
          <option value="">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Ngưng sử dụng">Ngưng hợp tác</option>
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
              <th>Tên NXB</th>
              <th>Quốc gia</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>

              <td>
                <b>{{ item.name }}</b>
              </td>

              <td>{{ item.country || '-' }}</td>
              <td>{{ item.email || '-' }}</td>
              <td>{{ item.phone || '-' }}</td>

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
              <td colspan="8" class="empty-state">
                Không có nhà xuất bản phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <SideStats
      title="Quản lý NXB"
      :total="String(publishers.length)"
      :items="[
        'Thêm/sửa nhà xuất bản qua Catalog API',
        'Ngưng hợp tác thay vì xóa cứng',
        'Dùng cho danh mục sách'
      ]"
    />
  </div>

  <!-- MODAL THÊM / SỬA NHÀ XUẤT BẢN -->
  <div v-if="showForm" class="publisher-modal-backdrop" @click.self="closeForm">
    <div class="publisher-modal">
      <button class="modal-close-btn" type="button" @click="closeForm">
        <v-icon icon="mdi-close" />
      </button>

      <div class="modal-header">
        <div class="modal-icon">
          <v-icon icon="mdi-office-building-outline" />
        </div>

        <div>
          <h3>
            {{ editingId ? 'Cập nhật nhà xuất bản' : 'Thêm nhà xuất bản' }}
          </h3>

          <p>
            Nhập thông tin nhà xuất bản để quản lý danh mục sách trong hệ thống.
          </p>
        </div>
      </div>

      <div class="publisher-form-grid">
        <div class="field">
          <label>Tên NXB <span>*</span></label>

          <div class="input-wrap">
            <v-icon icon="mdi-domain" />
            <input
              v-model.trim="form.name"
              type="text"
              placeholder="Nhập tên nhà xuất bản"
            />
          </div>
        </div>

        <div class="field">
          <label>Quốc gia</label>

          <div class="input-wrap">
            <v-icon icon="mdi-earth" />
            <input
              v-model.trim="form.country"
              type="text"
              placeholder="Ví dụ: Việt Nam"
            />
          </div>
        </div>

        <div class="field">
          <label>Email</label>

          <div class="input-wrap">
            <v-icon icon="mdi-email-outline" />
            <input
              v-model.trim="form.email"
              type="email"
              placeholder="email@nhaxuatban.com"
            />
          </div>
        </div>

        <div class="field">
          <label>Điện thoại</label>

          <div class="input-wrap">
            <v-icon icon="mdi-phone-outline" />
            <input
              v-model.trim="form.phone"
              type="tel"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        <div class="field wide">
          <label>Website</label>

          <div class="input-wrap">
            <v-icon icon="mdi-web" />
            <input
              v-model.trim="form.website"
              type="text"
              placeholder="https://www.nhaxuatban.com"
            />
          </div>
        </div>

        <div class="field wide">
          <label>Địa chỉ</label>

          <div class="input-wrap textarea-wrap">
            <v-icon icon="mdi-map-marker-outline" />
            <textarea
              v-model.trim="form.address"
              placeholder="Nhập địa chỉ hoặc ghi chú về nhà xuất bản"
            ></textarea>
          </div>
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
          {{ saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Lưu nhà xuất bản' }}
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

const publishers = ref([])
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
  country: '',
  address: '',
  email: '',
  phone: '',
  website: ''
})

const filtered = computed(() => {
  return publishers.value.filter((item) => {
    const matchesKeyword =
      !q.value ||
      String(item.name || '')
        .toLowerCase()
        .includes(q.value.toLowerCase())

    const matchesStatus = !status.value || item.status === status.value

    return matchesKeyword && matchesStatus
  })
})

const activeCount = computed(() => {
  return publishers.value.filter((item) => item.status === 'Hoạt động').length
})

const inactiveCount = computed(() => {
  return publishers.value.filter((item) => item.status !== 'Hoạt động').length
})

onMounted(loadData)

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await catalogApi.publishers()

    publishers.value = data.map((item) => {
      const mapped = mapLookup(item, 'publisher')

      return {
        ...mapped,
        website: item.website || item.webSite || mapped.website || ''
      }
    })
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được nhà xuất bản.')
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
    country: '',
    address: '',
    email: '',
    phone: '',
    website: ''
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
    country: item.country || '',
    address: item.address || '',
    email: item.email || '',
    phone: item.phone || '',
    website: item.website || ''
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
    error.value = 'Vui lòng nhập tên nhà xuất bản.'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  const payload = {
    name: form.name,
    country: form.country,
    address: form.address,
    email: form.email,
    phone: form.phone,
    website: form.website
  }

  try {
    if (editingId.value) {
      await catalogApi.updatePublisher(editingId.value, payload)
      success.value = 'Cập nhật NXB thành công.'
    } else {
      await catalogApi.createPublisher(payload)
      success.value = 'Thêm NXB thành công.'
    }

    closeForm()
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Lưu NXB thất bại.')
  } finally {
    saving.value = false
  }
}

async function removeItem(item) {
  if (!confirm(`Ngưng hợp tác NXB ${item.name}?`)) return

  try {
    await catalogApi.deletePublisher(item.id)
    success.value = 'Đã ngưng hợp tác NXB.'
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Không thể ngưng hợp tác NXB.')
  }
}

function exportCsv() {
  const rows = [
    ['Tên', 'Quốc gia', 'Email', 'Điện thoại', 'Website', 'Trạng thái'],
    ...filtered.value.map((item) => [
      item.name,
      item.country,
      item.email,
      item.phone,
      item.website,
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
  a.download = 'publishers.csv'
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

.publisher-filter {
  grid-template-columns: 2fr 1fr auto auto;
}

.publisher-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 28px;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(4px);
}

.publisher-modal {
  position: relative;
  width: min(980px, 96vw);
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

.publisher-form-grid {
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
  min-height: 92px;
  padding: 16px 18px 16px 50px;
  resize: vertical;
  font-family: inherit;
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
  .publisher-modal {
    padding: 26px 20px;
  }

  .publisher-form-grid {
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