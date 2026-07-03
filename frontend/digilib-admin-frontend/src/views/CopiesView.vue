<template>
  <PageHeader
    title="Bản sao & Tồn kho"
    subtitle="Quản lý bản sao sách, vị trí kệ, tình trạng và trạng thái mượn"
    breadcrumb="Bản sao & Tồn kho"
  >
    <div class="btn-row">
      <button class="primary-btn" @click="openCreate"><v-icon icon="mdi-plus" /> Thêm bản sao</button>
      <button class="ghost-btn" @click="exportCsv"><v-icon icon="mdi-download" /> Xuất CSV</button>
    </div>
  </PageHeader>

  <div v-if="error" class="card card-pad" style="margin-bottom:16px;color:#ef4444">{{ error }}</div>
  <div v-if="success" class="card card-pad" style="margin-bottom:16px;color:#16a34a">{{ success }}</div>

  <div class="grid grid-4" style="margin-bottom:18px">
    <StatCard label="Tổng bản sao" :value="copies.length" icon="mdi-package-variant-closed" />
    <StatCard label="Có thể mượn" :value="availableCount" icon="mdi-check-circle-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Đang mượn" :value="borrowedCount" icon="mdi-book-clock-outline" color="#f97316" bg="#fff7ed" />
    <StatCard label="Dữ liệu" value="API" icon="mdi-cloud-check-outline" color="#2563eb" bg="#eff6ff" />
  </div>

  <div class="two-column">
    <div class="card">
      <div class="filter-bar" style="grid-template-columns:2fr 1.2fr 1.1fr auto auto">
        <input class="input" v-model="q" placeholder="Tìm theo mã bản sao, tên sách, vị trí kệ..." />
        <select class="select" v-model="bookFilter">
          <option value="">Tất cả sách</option>
          <option v-for="book in books" :key="book.id" :value="String(book.id)">{{ book.title }}</option>
        </select>
        <select class="select" v-model="statusFilter">
          <option value="">Tất cả trạng thái</option>
          <option value="Có thể mượn">Có thể mượn</option>
          <option value="Đang được mượn">Đang mượn</option>
          <option value="Không mượn được">Không khả dụng</option>
        </select>
        <button class="primary-btn" @click="loadData">Tải lại</button>
        <button class="ghost-btn" @click="resetFilters">Đặt lại</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Sách</th>
              <th>Mã bản sao</th>
              <th>Vị trí kệ</th>
              <th>Tình trạng</th>
              <th>Trạng thái mượn</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filtered" :key="item.id || item.copyCode">
              <td>{{ index + 1 }}</td>
              <td><b>{{ item.book }}</b><br><span style="color:#64748b;font-size:12px">ID sách: {{ item.bookId }}</span></td>
              <td><b>{{ item.copyCode }}</b></td>
              <td>{{ item.location || '-' }}</td>
              <td><StatusBadge :text="item.condition" /></td>
              <td><StatusBadge :text="item.borrowStatus" /></td>
              <td>
                <button class="action-btn" @click="openEdit(item)"><v-icon icon="mdi-pencil-outline" /></button>
                <button class="action-btn danger" @click="removeItem(item)"><v-icon icon="mdi-trash-can-outline" /></button>
              </td>
            </tr>
            <tr v-if="!loading && filtered.length === 0"><td colspan="7" class="empty-state">Không có bản sao phù hợp.</td></tr>
            <tr v-if="loading"><td colspan="7" class="empty-state">Đang tải dữ liệu...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <SideStats
      title="Quản lý bản sao"
      :total="String(copies.length)"
      :items="['Thêm bản sao theo sách từng đầu', 'Theo dõi vị trí kệ và tình trạng sách', 'Quản lý trạng thái kho mượn/trả trong Catalog']"
    />
  </div>

  <div v-if="showForm" class="copy-modal-backdrop" @click.self="closeForm">
    <div class="copy-modal">
      <button class="modal-close-btn" type="button" @click="closeForm"><v-icon icon="mdi-close" /></button>
      <div class="modal-header">
        <div class="modal-icon"><v-icon icon="mdi-package-variant-plus" /></div>
        <div>
          <h3>{{ editingItem ? 'Cập nhật bản sao' : 'Thêm bản sao' }}</h3>
          <p>Nhập thông tin bản sao sách để quản lý tồn kho.</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="field wide">
          <label>Sách <span>*</span></label>
          <select class="select" v-model="form.bookId" :disabled="!!editingItem" required>
            <option value="">Chọn sách</option>
            <option v-for="book in books" :key="book.id" :value="String(book.id)">{{ book.title }}</option>
          </select>
        </div>
        <div class="field"><label>Mã bản sao <span>*</span></label><input class="input" v-model.trim="form.copyCode" placeholder="VD: 9786040002001-001" /></div>
        <div class="field"><label>Vị trí kệ</label><input class="input" v-model.trim="form.location" placeholder="Tầng 1 - Kệ A1" /></div>
        <div class="field"><label>Tình trạng</label><select class="select" v-model="form.condition"><option>Mới</option><option>Cũ</option><option>Hỏng</option><option>Mất</option></select></div>
        <div class="field"><label>Trạng thái mượn</label><select class="select" v-model="form.status"><option value="Available">Có thể mượn</option><option value="Borrowed">Đang mượn</option><option value="Unavailable">Không khả dụng</option></select></div>
        <div class="field wide"><label>Ghi chú</label><textarea v-model.trim="form.note" placeholder="Nhập ghi chú..."></textarea></div>
      </div>

      <div class="modal-footer">
        <button class="ghost-btn" type="button" @click="closeForm">Hủy</button>
        <button class="primary-btn" type="button" :disabled="saving || !canSave" @click="saveItem">{{ saving ? 'Đang lưu...' : 'Lưu bản sao' }}</button>
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
import { catalogApi, getErrorMessage, toArray } from '../services/api'
import { mapCopy } from '../services/adapters'

const books = ref([])
const copies = ref([])
const q = ref('')
const bookFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showForm = ref(false)
const editingItem = ref(null)

const form = reactive({ bookId: '', copyCode: '', location: '', condition: 'Mới', status: 'Available', note: '' })

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  return copies.value.filter(item => {
    const matchesKeyword = !keyword || [item.book, item.copyCode, item.location, item.condition, item.borrowStatus].some(x => String(x || '').toLowerCase().includes(keyword))
    const matchesBook = !bookFilter.value || String(item.bookId) === String(bookFilter.value)
    const matchesStatus = !statusFilter.value || item.borrowStatus === statusFilter.value
    return matchesKeyword && matchesBook && matchesStatus
  })
})
const availableCount = computed(() => copies.value.filter(x => x.borrowStatus === 'Có thể mượn').length)
const borrowedCount = computed(() => copies.value.filter(x => x.borrowStatus === 'Đang được mượn').length)
const canSave = computed(() => form.bookId && form.copyCode.trim())

onMounted(loadData)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const booksRes = await catalogApi.books()
    const bookList = toArray(booksRes.data)
    books.value = bookList.map(book => ({ id: book.id ?? book.Id, title: book.title ?? book.Title ?? 'Chưa rõ sách' }))

    let copyList = []
    try {
      const copiesRes = await catalogApi.copies()
      copyList = toArray(copiesRes.data)
    } catch {
      copyList = bookList.flatMap(book => toArray(book.copies ?? book.Copies).map(copy => ({ ...copy, bookTitle: book.title ?? book.Title, bookId: book.id ?? book.Id, coverImage: book.coverImage ?? book.CoverImage })))
    }

    copies.value = copyList.map(mapCopy).map(copy => ({ ...copy, copyCode: copy.copyCode || copy.code }))
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được danh sách bản sao.')
  } finally {
    loading.value = false
  }
}

function resetFilters() { q.value = ''; bookFilter.value = ''; statusFilter.value = '' }
function resetForm() { Object.assign(form, { bookId: '', copyCode: '', location: '', condition: 'Mới', status: 'Available', note: '' }) }
function openCreate() { editingItem.value = null; resetForm(); showForm.value = true }
function openEdit(item) { editingItem.value = item; Object.assign(form, { bookId: String(item.bookId), copyCode: item.copyCode, location: item.location, condition: item.condition === 'Hư hỏng' ? 'Hỏng' : item.condition, status: item.borrowStatus === 'Đang được mượn' ? 'Borrowed' : item.borrowStatus === 'Không mượn được' ? 'Unavailable' : 'Available', note: item.note || '' }); showForm.value = true }
function closeForm() { showForm.value = false; editingItem.value = null; resetForm() }
function buildPayload() { return { bookId: Number(form.bookId), copyCode: form.copyCode, status: form.status, condition: form.condition, location: form.location, shelfLocation: form.location, note: form.note } }
async function saveItem() {
  if (!canSave.value) return
  saving.value = true; error.value = ''; success.value = ''
  try {
    if (editingItem.value) await catalogApi.updateCopy(editingItem.value.id, buildPayload())
    else await catalogApi.createBookCopy(form.bookId, buildPayload())
    success.value = editingItem.value ? 'Cập nhật bản sao thành công.' : 'Thêm bản sao thành công.'
    closeForm(); await loadData()
  } catch (e) { error.value = getErrorMessage(e, 'Lưu bản sao thất bại.') }
  finally { saving.value = false }
}
async function removeItem(item) {
  if (!confirm(`Xóa bản sao ${item.copyCode}?`)) return
  try { await catalogApi.deleteCopy(item.id); success.value = 'Xóa bản sao thành công.'; await loadData() }
  catch (e) { error.value = getErrorMessage(e, 'Không thể xóa bản sao.') }
}
function exportCsv() {
  const rows = [['Sách', 'Mã bản sao', 'Vị trí kệ', 'Tình trạng', 'Trạng thái mượn'], ...filtered.value.map(i => [i.book, i.copyCode, i.location, i.condition, i.borrowStatus])]
  const csv = rows.map(row => row.map(v => `"${String(v || '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = 'copies.csv'; a.click(); URL.revokeObjectURL(url)
}
</script>

<style scoped>
.copy-modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 28px; background: rgba(15, 23, 42, 0.52); backdrop-filter: blur(4px); }
.copy-modal { position: relative; width: min(980px, 96vw); max-height: 92vh; overflow-y: auto; padding: 34px; border-radius: 26px; background: #ffffff; box-shadow: 0 28px 90px rgba(15, 23, 42, 0.28); }
.modal-close-btn { position: absolute; top: 22px; right: 22px; width: 38px; height: 38px; display: grid; place-items: center; border: 0; border-radius: 50%; color: #64748b; background: #f8fafc; cursor: pointer; }
.modal-header { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
.modal-icon { width: 62px; height: 62px; display: grid; place-items: center; border-radius: 18px; color: #2563eb; background: #eff6ff; font-size: 30px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.field.wide { grid-column: 1 / -1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 14px; margin-top: 24px; padding-top: 22px; border-top: 1px solid #e5eaf3; }
@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
</style>
