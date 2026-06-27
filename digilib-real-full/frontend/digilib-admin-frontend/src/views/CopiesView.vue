<template>
  <PageHeader title="Bản sao & Tồn kho" subtitle="Quản lý từng bản sao sách, vị trí kệ và trạng thái tồn kho" breadcrumb="Bản sao & Tồn kho">
    <div class="btn-row">
      <button class="primary-btn" @click="openCreate"><v-icon icon="mdi-plus" /> Thêm bản sao</button>
      <button class="ghost-btn" @click="exportCsv"><v-icon icon="mdi-download" /> Xuất CSV</button>
    </div>
  </PageHeader>

  <div v-if="error" class="card card-pad" style="margin-bottom:16px;color:#ef4444">{{ error }}</div>
  <div v-if="success" class="card card-pad" style="margin-bottom:16px;color:#16a34a">{{ success }}</div>

  <div class="grid grid-5" style="margin-bottom:18px">
    <StatCard label="Tổng bản sao" :value="stats.total" icon="mdi-package-variant" />
    <StatCard label="Sẵn sàng" :value="stats.available" icon="mdi-check-circle-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Đang được mượn" :value="stats.borrowed" icon="mdi-book-sync-outline" color="#f59e0b" bg="#fffbeb" />
    <StatCard label="Hư hỏng" :value="stats.damaged" icon="mdi-alert-outline" color="#ef4444" bg="#fef2f2" />
    <StatCard label="Mất / thất lạc" :value="stats.lost" icon="mdi-shield-alert-outline" color="#64748b" bg="#f1f5f9" />
  </div>

  <div class="two-column">
    <div>
      <div class="card filter-bar" style="grid-template-columns:2fr 1fr 1fr auto auto;margin-bottom:18px">
        <input class="input" placeholder="Tìm theo mã bản sao hoặc tên sách..." v-model="filters.q" @keyup.enter="loadCopies" />
        <select class="select" v-model="filters.condition">
          <option value="">Tất cả tình trạng</option>
          <option :value="CopyCondition.Good">Sẵn sàng</option>
          <option :value="CopyCondition.Damaged">Hư hỏng</option>
          <option :value="CopyCondition.Lost">Mất / thất lạc</option>
          <option :value="CopyCondition.Maintenance">Bảo trì</option>
        </select>
        <select class="select" v-model="filters.borrowStatus">
          <option value="">Tất cả mượn/trả</option>
          <option :value="BorrowStatus.Available">Có thể mượn</option>
          <option :value="BorrowStatus.Borrowed">Đang được mượn</option>
          <option :value="BorrowStatus.Unavailable">Không mượn được</option>
        </select>
        <button class="primary-btn" @click="loadCopies"><v-icon icon="mdi-filter-outline" /> Lọc</button>
        <button class="ghost-btn" @click="resetFilters"><v-icon icon="mdi-refresh" /> Đặt lại</button>
      </div>

      <div class="card">
        <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center">
          <h3 class="section-title" style="margin:0">Danh sách bản sao</h3>
          <span style="color:#64748b">{{ loading ? 'Đang tải...' : `${copies.length} bản sao` }}</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Mã bản sao</th><th>Sách</th><th>ISBN</th><th>Vị trí kệ</th><th>Tình trạng</th><th>Trạng thái mượn</th><th>Cập nhật</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
            <tbody>
              <tr v-for="(copy,i) in copies" :key="copy.id">
                <td>{{ i+1 }}</td>
                <td><b>{{ copy.code }}</b></td>
                <td><div style="display:flex;gap:10px;align-items:center"><img :src="copy.cover" class="book-cover" /><div><b>{{ copy.book }}</b></div></div></td>
                <td>{{ copy.isbn }}</td>
                <td>{{ copy.location }}</td>
                <td><StatusBadge :text="copy.condition" /></td>
                <td>{{ copy.borrowStatus }}</td>
                <td>{{ copy.updatedAt }}</td>
                <td>{{ copy.note }}</td>
                <td>
                  <button class="action-btn" @click="openEdit(copy)"><v-icon icon="mdi-pencil-outline" /></button>
                  <button class="action-btn danger" @click="removeCopy(copy)"><v-icon icon="mdi-trash-can-outline" /></button>
                </td>
              </tr>
              <tr v-if="!loading && copies.length === 0"><td colspan="10" class="empty-state">Không có bản sao phù hợp.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card card-pad">
        <h3 class="section-title">Phân bổ trạng thái bản sao</h3>
        <div class="donut"><div class="donut-label">{{ stats.total }}<br><span style="font-size:12px;color:#64748b">bản sao</span></div></div>
        <div class="grid" style="margin-top:18px">
          <div style="display:flex;justify-content:space-between"><span>Sẵn sàng</span><b>{{ stats.available }}</b></div>
          <div style="display:flex;justify-content:space-between"><span>Đang mượn</span><b>{{ stats.borrowed }}</b></div>
          <div style="display:flex;justify-content:space-between"><span>Hư hỏng</span><b>{{ stats.damaged }}</b></div>
          <div style="display:flex;justify-content:space-between"><span>Mất / thất lạc</span><b>{{ stats.lost }}</b></div>
        </div>
      </div>
      <div class="card card-pad">
        <h3 class="section-title">Cảnh báo tồn kho</h3>
        <p class="badge orange">Theo dõi bản sao hư hỏng/mất để xử lý kịp thời</p>
        <p class="badge blue">Dữ liệu được lấy trực tiếp từ Catalog Service</p>
      </div>
    </div>
  </div>

  <div v-if="showForm" class="modal-backdrop">
    <div class="modal-card">
      <h3 class="section-title">{{ editingId ? 'Cập nhật bản sao' : 'Thêm bản sao' }}</h3>
      <div class="form-grid">
        <div class="field" style="grid-column:1/-1"><label>Sách *</label><select class="select" v-model="form.bookId" :disabled="Boolean(editingId)" required><option value="">Chọn sách</option><option v-for="b in books" :key="b.id" :value="b.id">{{ b.title }} - {{ b.isbn }}</option></select></div>
        <div class="field"><label>Mã bản sao *</label><input class="input" v-model="form.copyCode" :disabled="Boolean(editingId)" /></div>
        <div class="field"><label>Vị trí kệ *</label><input class="input" v-model="form.shelfLocation" placeholder="Tầng 1 - Kệ A1" /></div>
        <div class="field"><label>Tình trạng</label><select class="select" v-model.number="form.condition"><option :value="CopyCondition.Good">Sẵn sàng</option><option :value="CopyCondition.Damaged">Hư hỏng</option><option :value="CopyCondition.Lost">Mất / thất lạc</option><option :value="CopyCondition.Maintenance">Bảo trì</option></select></div>
        <div class="field"><label>Trạng thái mượn</label><select class="select" v-model.number="form.borrowStatus"><option :value="BorrowStatus.Available">Có thể mượn</option><option :value="BorrowStatus.Borrowed">Đang được mượn</option><option :value="BorrowStatus.Unavailable">Không mượn được</option></select></div>
        <div class="field"><label>Mã phiếu mượn hiện tại</label><input class="input" v-model="form.currentBorrowTicketCode" placeholder="Chỉ nhập nếu đang mượn" /></div>
        <div class="field" style="grid-column:1/-1"><label>Ghi chú</label><textarea v-model="form.note" /></div>
      </div>
      <div class="form-actions">
        <button class="ghost-btn" @click="closeForm">Hủy</button>
        <button class="primary-btn" @click="saveCopy" :disabled="saving">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { catalogApi, getErrorMessage } from '../services/api'
import { BorrowStatus, CopyCondition, mapBook, mapCopy } from '../services/adapters'

const copies = ref([])
const books = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showForm = ref(false)
const editingId = ref(null)
const filters = reactive({ q: '', condition: '', borrowStatus: '' })
const form = reactive({ bookId: '', copyCode: '', shelfLocation: '', condition: CopyCondition.Good, borrowStatus: BorrowStatus.Available, currentBorrowTicketCode: '', note: '' })

const stats = computed(() => ({
  total: copies.value.length,
  available: copies.value.filter(x => x.borrowStatusValue === BorrowStatus.Available && x.conditionValue === CopyCondition.Good).length,
  borrowed: copies.value.filter(x => x.borrowStatusValue === BorrowStatus.Borrowed).length,
  damaged: copies.value.filter(x => x.conditionValue === CopyCondition.Damaged).length,
  lost: copies.value.filter(x => x.conditionValue === CopyCondition.Lost).length
}))

onMounted(async () => { await Promise.all([loadBooks(), loadCopies()]) })

async function loadBooks() {
  const { data } = await catalogApi.books()
  books.value = data.map(mapBook)
}

async function loadCopies() {
  loading.value = true; error.value = ''
  try {
    const params = { q: filters.q || undefined, condition: filters.condition || undefined, borrowStatus: filters.borrowStatus || undefined }
    const { data } = await catalogApi.copies(params)
    copies.value = data.map(mapCopy)
  } catch (e) { error.value = getErrorMessage(e, 'Không tải được danh sách bản sao.') }
  finally { loading.value = false }
}

function resetFilters() { filters.q = ''; filters.condition = ''; filters.borrowStatus = ''; loadCopies() }
function clearForm() { Object.assign(form, { bookId: '', copyCode: '', shelfLocation: '', condition: CopyCondition.Good, borrowStatus: BorrowStatus.Available, currentBorrowTicketCode: '', note: '' }) }
function openCreate() { editingId.value = null; clearForm(); showForm.value = true }
function openEdit(copy) { editingId.value = copy.id; Object.assign(form, { bookId: copy.bookId, copyCode: copy.code, shelfLocation: copy.location, condition: copy.conditionValue, borrowStatus: copy.borrowStatusValue, currentBorrowTicketCode: copy.currentBorrowTicketCode, note: copy.note }); showForm.value = true }
function closeForm() { showForm.value = false }

async function saveCopy() {
  saving.value = true; error.value = ''; success.value = ''
  try {
    if (editingId.value) {
      await catalogApi.updateCopy(editingId.value, { shelfLocation: form.shelfLocation, condition: Number(form.condition), borrowStatus: Number(form.borrowStatus), currentBorrowTicketCode: form.currentBorrowTicketCode || null, note: form.note })
      success.value = 'Cập nhật bản sao thành công.'
    } else {
      await catalogApi.createCopy({ bookId: form.bookId, copyCode: form.copyCode, shelfLocation: form.shelfLocation, condition: Number(form.condition), borrowStatus: Number(form.borrowStatus), note: form.note })
      success.value = 'Thêm bản sao thành công.'
    }
    closeForm(); await loadCopies()
  } catch (e) { error.value = getErrorMessage(e, 'Lưu bản sao thất bại.') }
  finally { saving.value = false }
}

async function removeCopy(copy) {
  if (!confirm(`Xóa bản sao ${copy.code}?`)) return
  try { await catalogApi.deleteCopy(copy.id); success.value = 'Xóa bản sao thành công.'; await loadCopies() }
  catch (e) { error.value = getErrorMessage(e, 'Không thể xóa bản sao này.') }
}

function exportCsv() {
  const rows = [['Mã bản sao','Sách','ISBN','Vị trí','Tình trạng','Trạng thái mượn','Ghi chú'], ...copies.value.map(x => [x.code,x.book,x.isbn,x.location,x.condition,x.borrowStatus,x.note])]
  const csv = rows.map(r => r.map(v => `"${String(v || '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = 'book-copies.csv'; a.click(); URL.revokeObjectURL(url)
}
</script>
