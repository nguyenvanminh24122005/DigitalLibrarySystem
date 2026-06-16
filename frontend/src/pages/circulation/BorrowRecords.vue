<template>
  <section class="circulation-page">
    <div class="circulation-header">
      <div>
        <p class="section-kicker">Circulation</p>
        <h1>Quản lý mượn trả</h1>
        <p>Danh sách phiếu mượn, trạng thái xử lý và các thao tác nghiệp vụ thư viện.</p>
      </div>

      <div class="header-actions">
        <v-btn variant="outlined" prepend-icon="mdi-refresh" :loading="loading" @click="loadRecords">
          Làm mới
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/dashboard/borrow">
          Tạo phiếu mượn
        </v-btn>
      </div>
    </div>

    <div class="stat-grid">
      <button
        v-for="item in statCards"
        :key="item.filter"
        class="stat-card"
        :class="{ active: statusFilter === item.filter }"
        type="button"
        @click="statusFilter = item.filter"
      >
        <span class="stat-icon" :class="item.tone">
          <v-icon size="24">{{ item.icon }}</v-icon>
        </span>
        <span>
          <small>{{ item.label }}</small>
          <strong>{{ item.value }}</strong>
        </span>
      </button>
    </div>

    <v-card class="records-card">
      <v-card-text class="pa-0">
        <div class="table-toolbar">
          <div>
            <h2>Danh sách phiếu mượn</h2>
            <p>{{ filteredRecords.length }} phiếu đang hiển thị</p>
          </div>

          <div class="filters">
            <v-text-field
              v-model="search"
              class="search-field"
              density="comfortable"
              placeholder="Tìm độc giả, thẻ, sách, mã bản sao..."
              prepend-inner-icon="mdi-magnify"
              hide-details
            />
            <v-select
              v-model="statusFilter"
              class="status-filter"
              density="comfortable"
              :items="filterOptions"
              label="Trạng thái"
              hide-details
            />
          </div>
        </div>

        <div class="table-wrap">
          <v-table>
            <thead>
              <tr>
                <th>Phiếu</th>
                <th>Độc giả</th>
                <th>Sách / Bản sao</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Phí phạt</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in filteredRecords" :key="rec.id">
                <td>
                  <div class="record-id">#{{ rec.id }}</div>
                  <div class="record-code">{{ normalizedStatus(rec) }}</div>
                </td>
                <td>
                  <div class="primary-text">{{ rec.readerName || 'Chưa có tên' }}</div>
                  <div class="muted mono">{{ rec.cardNumber || rec.readerCode || '—' }}</div>
                </td>
                <td>
                  <div class="primary-text">{{ rec.bookTitle || 'Không rõ tên sách' }}</div>
                  <div class="muted mono">Mã bản sao: {{ rec.copyCode || rec.bookCode || '—' }}</div>
                </td>
                <td>{{ formatDate(rec.borrowDate) }}</td>
                <td>
                  <span :class="{ 'date-danger': isOverdue(rec) }">{{ formatDate(rec.dueDate) }}</span>
                </td>
                <td>{{ formatDate(rec.returnDate) }}</td>
                <td>
                  <v-chip :color="statusColor(rec)" size="small" variant="tonal">
                    {{ statusText(rec) }}
                  </v-chip>
                </td>
                <td class="font-weight-bold" :class="rec.fine > 0 ? 'text-error' : ''">
                  {{ rec.fine > 0 ? formatCurrency(rec.fine) : '—' }}
                </td>
                <td>
                  <div class="row-actions">
                    <v-btn
                      size="small"
                      color="success"
                      variant="tonal"
                      prepend-icon="mdi-check"
                      :disabled="!canApprove(rec)"
                      @click="approveBorrowing(rec)"
                    >
                      Duyệt mượn
                    </v-btn>
                    <v-btn
                      size="small"
                      color="error"
                      variant="tonal"
                      prepend-icon="mdi-close"
                      :disabled="!canReject(rec)"
                      :loading="workingId === rejectKey(rec)"
                      @click="rejectBorrowing(rec)"
                    >
                      Từ chối
                    </v-btn>
                    <v-btn
                      size="small"
                      color="primary"
                      variant="tonal"
                      prepend-icon="mdi-book-check-outline"
                      :disabled="!canReturn(rec)"
                      :loading="workingId === returnKey(rec)"
                      @click="confirmReturn(rec)"
                    >
                      Xác nhận trả
                    </v-btn>
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && filteredRecords.length === 0">
                <td colspan="9">
                  <div class="app-empty">
                    <div>
                      <v-icon size="36" color="primary">mdi-clipboard-search-outline</v-icon>
                      <p class="mt-3 mb-0">Không có dữ liệu phiếu mượn phù hợp</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-8 text-grey">Đang tải danh sách phiếu mượn...</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2800">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Đóng</v-btn>
      </template>
    </v-snackbar>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { circulationApi } from '../../services/circulationApi'

const filterOptions = ['Tất cả', 'Chờ duyệt', 'Đang mượn', 'Chờ trả', 'Quá hạn', 'Đã trả']

const search = ref('')
const statusFilter = ref('Tất cả')
const records = ref([])
const loading = ref(false)
const workingId = ref(null)
const snackbar = ref({ show: false, text: '', color: 'success' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const normalizedStatus = (rec) => String(rec.status || '').trim().toUpperCase()

const isReturned = (rec) => Boolean(rec.returnDate) || ['RETURNED', 'DA_TRA', 'ĐÃ TRẢ'].includes(normalizedStatus(rec))
const isPending = (rec) => ['PENDING', 'WAITING', 'REQUESTED', 'CHO_DUYET', 'CHỜ DUYỆT'].includes(normalizedStatus(rec))
const isWaitingReturn = (rec) => ['WAITING_RETURN', 'PENDING_RETURN', 'CHO_TRA', 'CHỜ TRẢ'].includes(normalizedStatus(rec))
const isBorrowed = (rec) => ['BORROWED', 'APPROVED', 'ACTIVE', 'DANG_MUON', 'ĐANG MƯỢN'].includes(normalizedStatus(rec))

const todayDate = () => new Date(new Date().toISOString().slice(0, 10))

const isOverdue = (rec) => {
  if (!rec.dueDate || isReturned(rec)) return false
  return new Date(rec.dueDate) < todayDate()
}

function statusColor(rec) {
  if (isReturned(rec)) return 'success'
  if (isOverdue(rec)) return 'error'
  if (isPending(rec)) return 'info'
  if (isWaitingReturn(rec)) return 'secondary'
  return 'warning'
}

function statusText(rec) {
  if (isReturned(rec)) return 'Đã trả'
  if (isOverdue(rec)) return 'Quá hạn'
  if (isPending(rec)) return 'Chờ duyệt'
  if (isWaitingReturn(rec)) return 'Chờ trả'
  return 'Đang mượn'
}

const stats = computed(() => {
  const count = (predicate) => records.value.filter(predicate).length
  return {
    pending: count(isPending),
    borrowed: count((rec) => isBorrowed(rec) && !isOverdue(rec) && !isWaitingReturn(rec) && !isReturned(rec)),
    waitingReturn: count((rec) => isWaitingReturn(rec) && !isReturned(rec)),
    overdue: count(isOverdue),
    returned: count(isReturned),
  }
})

const statCards = computed(() => [
  { label: 'Chờ duyệt', value: stats.value.pending, filter: 'Chờ duyệt', icon: 'mdi-timer-sand', tone: 'info' },
  { label: 'Đang mượn', value: stats.value.borrowed, filter: 'Đang mượn', icon: 'mdi-book-open-variant', tone: 'warning' },
  { label: 'Chờ trả', value: stats.value.waitingReturn, filter: 'Chờ trả', icon: 'mdi-book-clock-outline', tone: 'purple' },
  { label: 'Quá hạn', value: stats.value.overdue, filter: 'Quá hạn', icon: 'mdi-clock-alert-outline', tone: 'danger' },
  { label: 'Đã trả', value: stats.value.returned, filter: 'Đã trả', icon: 'mdi-check-circle-outline', tone: 'success' },
])

const filteredRecords = computed(() => {
  let list = records.value

  if (statusFilter.value !== 'Tất cả') {
    list = list.filter((rec) => statusText(rec) === statusFilter.value)
  }

  const q = search.value.toLowerCase().trim()
  if (!q) return list

  return list.filter((rec) =>
    rec.readerName?.toLowerCase().includes(q) ||
    rec.cardNumber?.toLowerCase().includes(q) ||
    rec.readerCode?.toLowerCase().includes(q) ||
    rec.copyCode?.toLowerCase().includes(q) ||
    rec.bookCode?.toLowerCase().includes(q) ||
    rec.bookTitle?.toLowerCase().includes(q) ||
    String(rec.id || '').includes(q)
  )
})

function canApprove(rec) {
  return isPending(rec)
}

function canReject(rec) {
  return isPending(rec) || (isBorrowed(rec) && !isReturned(rec))
}

function canReturn(rec) {
  return !isReturned(rec) && (isBorrowed(rec) || isWaitingReturn(rec) || isOverdue(rec))
}

function rejectKey(rec) {
  return `reject-${rec.id}`
}

function returnKey(rec) {
  return `return-${rec.id}`
}

function notify(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

async function approveBorrowing() {
  notify('API hiện tại chưa có endpoint duyệt mượn. Nút đã được hiển thị để sẵn sàng nối khi backend hỗ trợ.', 'info')
}

async function rejectBorrowing(rec) {
  if (!rec.id || !confirm(`Từ chối phiếu mượn #${rec.id}?`)) return
  workingId.value = rejectKey(rec)
  try {
    await circulationApi.cancelBorrowing(rec.id)
    notify('Đã từ chối phiếu mượn.')
    await loadRecords()
  } catch (e) {
    notify(e.response?.data?.message || 'Không thể từ chối phiếu mượn.', 'error')
  } finally {
    workingId.value = null
  }
}

async function confirmReturn(rec) {
  if (!rec.id || !confirm(`Xác nhận trả sách cho phiếu #${rec.id}?`)) return
  workingId.value = returnKey(rec)
  try {
    await circulationApi.returnBorrowing(rec.id)
    notify('Đã xác nhận trả sách.')
    await loadRecords()
  } catch (e) {
    notify(e.response?.data?.message || 'Không thể xác nhận trả sách.', 'error')
  } finally {
    workingId.value = null
  }
}

async function loadRecords() {
  loading.value = true
  try {
    const { data } = await circulationApi.getBorrowings()
    records.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error(e)
    notify('Không thể tải danh sách phiếu mượn.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadRecords)
</script>

<style scoped>
.circulation-page {
  display: grid;
  gap: 22px;
}

.circulation-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
}

.circulation-header h1 {
  color: #fff;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  font-weight: 950;
  line-height: 1.08;
}

.circulation-header p:last-child,
.table-toolbar p,
.muted {
  color: #93a4bd;
}

.header-actions,
.filters,
.row-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(130px, 1fr));
  gap: 14px;
}

.stat-card {
  min-height: 112px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding: 18px;
  color: #eaf2ff;
  border: 1px solid rgba(96, 165, 250, 0.16);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(15, 27, 46, 0.94), rgba(8, 19, 35, 0.9));
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
  text-align: left;
  cursor: pointer;
}

.stat-card.active,
.stat-card:hover {
  border-color: rgba(103, 232, 249, 0.48);
  background: linear-gradient(180deg, rgba(18, 42, 70, 0.96), rgba(10, 24, 43, 0.94));
}

.stat-card small {
  display: block;
  color: #cbd5e1;
  font-size: 0.86rem;
  font-weight: 850;
  margin-bottom: 7px;
}

.stat-card strong {
  color: #fff;
  font-size: 2rem;
  font-weight: 950;
  line-height: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 15px;
}

.stat-icon.info {
  color: #67e8f9;
  background: rgba(103, 232, 249, 0.12);
}

.stat-icon.warning {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.13);
}

.stat-icon.purple {
  color: #c4b5fd;
  background: rgba(167, 139, 250, 0.14);
}

.stat-icon.danger {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.14);
}

.stat-icon.success {
  color: #34d399;
  background: rgba(52, 211, 153, 0.13);
}

.records-card {
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.table-toolbar h2 {
  color: #fff;
  font-size: 1.22rem;
  font-weight: 950;
}

.filters {
  min-width: min(680px, 100%);
}

.search-field {
  min-width: 320px;
}

.status-filter {
  max-width: 180px;
}

.table-wrap {
  overflow-x: auto;
}

.record-id,
.primary-text {
  color: #fff;
  font-weight: 900;
}

.record-code {
  color: #67e8f9;
  font-size: 0.76rem;
  font-weight: 850;
  margin-top: 3px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
  font-size: 0.82rem;
  margin-top: 4px;
}

.date-danger {
  color: #fb7185;
  font-weight: 900;
}

.row-actions {
  justify-content: flex-end;
  min-width: 360px;
}

@media (max-width: 1320px) {
  .stat-grid {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .filters {
    min-width: 0;
  }
}

@media (max-width: 760px) {
  .circulation-header,
  .header-actions,
  .filters {
    align-items: stretch;
    flex-direction: column;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }

  .search-field,
  .status-filter {
    min-width: 0;
    max-width: none;
  }
}
</style>
