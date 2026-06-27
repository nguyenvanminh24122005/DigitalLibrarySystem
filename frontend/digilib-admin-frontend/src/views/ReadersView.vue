<template>
  <PageHeader title="Độc giả" subtitle="Quản lý hồ sơ độc giả, thẻ thư viện, ngày hết hạn và trạng thái khóa/mở" breadcrumb="Độc giả">
    <button class="primary-btn" @click="openCreate"><v-icon icon="mdi-plus" /> Thêm độc giả</button>
  </PageHeader>

  <div v-if="error" class="card card-pad alert error-alert" style="margin-bottom:16px"><v-icon icon="mdi-alert-circle-outline" /> {{ error }}</div>
  <div v-if="success" class="card card-pad alert success-alert" style="margin-bottom:16px"><v-icon icon="mdi-check-circle-outline" /> {{ success }}</div>

  <div class="grid grid-4" style="margin-bottom:18px">
    <StatCard label="Tổng độc giả" :value="readers.length" icon="mdi-account-group-outline" />
    <StatCard label="Thẻ hợp lệ" :value="validCardCount" icon="mdi-card-account-details-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Tạm khóa" :value="lockedCount" icon="mdi-lock-outline" color="#f97316" bg="#fff7ed" />
    <StatCard label="Hết hạn thẻ" :value="expiredCardCount" icon="mdi-calendar-alert-outline" color="#ef4444" bg="#fef2f2" />
  </div>

  <div class="card">
    <div class="filter-bar" style="grid-template-columns:2fr 1fr auto auto">
      <input class="input" placeholder="Tìm theo tên, email, mã độc giả, mã thẻ..." v-model="filters.q" @keyup.enter="loadReaders" />
      <select class="select" v-model="filters.status">
        <option value="">Tất cả trạng thái</option>
        <option :value="AccountStatus.Active">Hoạt động</option>
        <option :value="AccountStatus.Locked">Tạm khóa</option>
        <option :value="AccountStatus.Inactive">Không hoạt động</option>
      </select>
      <button class="primary-btn" @click="loadReaders"><v-icon icon="mdi-filter-outline" /> Lọc</button>
      <button class="ghost-btn" @click="resetFilters"><v-icon icon="mdi-refresh" /> Đặt lại</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Mã ĐG</th>
            <th>Độc giả</th>
            <th>Email / SĐT</th>
            <th>Thẻ thư viện</th>
            <th>Ngày hết hạn</th>
            <th>Giới hạn</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r,i) in readers" :key="r.id">
            <td>{{ i+1 }}</td>
            <td><b>{{ r.code }}</b></td>
            <td><b>{{ r.name }}</b><br><span class="muted">{{ r.memberType }}</span></td>
            <td>{{ r.email }}<br><span class="muted">{{ r.phone || '-' }}</span></td>
            <td>
              <button class="card-link" @click="openCard(r)">
                <v-icon icon="mdi-card-account-details-outline" />
                <span>{{ r.cardNumber || 'Chưa cấp thẻ' }}</span>
              </button>
              <br>
              <span :class="['card-status', r.hasValidCard ? 'ok' : 'bad']">{{ r.cardStatus }}</span>
            </td>
            <td>{{ r.cardExpiredAt || '-' }}</td>
            <td>{{ r.borrowLimit || '-' }} sách</td>
            <td><StatusBadge :text="r.status" /></td>
            <td class="row-actions wide-actions">
              <button class="mini-btn" title="Xem thẻ" @click="openCard(r)"><v-icon icon="mdi-eye-outline" /> Thẻ</button>
              <button class="mini-btn" title="Sửa hồ sơ" @click="openEdit(r)"><v-icon icon="mdi-pencil-outline" /> Sửa</button>
              <button class="mini-btn" title="Gia hạn thẻ" @click="renewCard(r)"><v-icon icon="mdi-calendar-plus-outline" /> Gia hạn</button>
              <button class="mini-btn danger" v-if="r.statusValue === AccountStatus.Active" title="Khóa độc giả/thẻ" @click="quickToggle(r)"><v-icon icon="mdi-lock-outline" /> Khóa</button>
              <button class="mini-btn success" v-else title="Mở khóa độc giả/thẻ" @click="quickToggle(r)"><v-icon icon="mdi-lock-open-outline" /> Mở</button>
            </td>
          </tr>
          <tr v-if="loading"><td colspan="9" class="empty-state">Đang tải độc giả...</td></tr>
          <tr v-if="!loading && readers.length===0"><td colspan="9" class="empty-state">Không có độc giả phù hợp.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="showForm" class="modal-backdrop">
    <div class="modal-card wide-modal">
      <h3 class="section-title">{{ editingId ? 'Cập nhật độc giả' : 'Thêm độc giả' }}</h3>
      <div class="form-grid">
        <div class="field"><label>Họ tên *</label><input class="input" v-model="form.fullName" /></div>
        <div class="field"><label>Email *</label><input class="input" type="email" v-model="form.email" /></div>
        <div class="field"><label>Số điện thoại</label><input class="input" v-model="form.phone" /></div>
        <div class="field"><label>Ngày sinh</label><input class="input" type="date" v-model="form.dateOfBirth" /></div>
        <div class="field"><label>Giới tính</label><select class="select" v-model="form.gender"><option value="">Chọn</option><option>Nam</option><option>Nữ</option><option>Khác</option></select></div>
        <div class="field"><label>Loại thành viên</label><input class="input" v-model="form.memberType" /></div>
        <div class="field"><label>Trạng thái</label><select class="select" v-model.number="form.status"><option :value="AccountStatus.Active">Hoạt động</option><option :value="AccountStatus.Locked">Tạm khóa</option><option :value="AccountStatus.Inactive">Không hoạt động</option></select></div>
        <div class="field" style="grid-column:1/-1"><label>Địa chỉ</label><textarea v-model="form.address" /></div>
      </div>
      <div class="form-actions"><button class="ghost-btn" @click="showForm=false">Hủy</button><button class="primary-btn" :disabled="saving" @click="saveReader">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button></div>
    </div>
  </div>

  <div v-if="showCard" class="modal-backdrop">
    <div class="modal-card card-modal">
      <div class="card-preview">
        <div class="library-card" :class="selectedReader?.hasValidCard ? 'valid' : 'invalid'">
          <div class="card-top">
            <div><b>DIGILIB CARD</b><span>Thẻ thư viện số</span></div>
            <v-icon icon="mdi-book-open-page-variant-outline" />
          </div>
          <h2>{{ selectedReader?.name }}</h2>
          <p>Mã độc giả: <b>{{ selectedReader?.code }}</b></p>
          <p>Số thẻ: <b>{{ selectedReader?.cardNumber || 'Chưa cấp' }}</b></p>
          <div class="card-bottom">
            <span>Hết hạn<br><b>{{ selectedReader?.cardExpiredAt || '-' }}</b></span>
            <span>Giới hạn<br><b>{{ selectedReader?.borrowLimit || 0 }} sách</b></span>
          </div>
        </div>
      </div>

      <h3 class="section-title">Chi tiết thẻ thư viện</h3>
      <div class="card-info-grid">
        <p><span>Trạng thái thẻ</span><b>{{ selectedReader?.cardStatus || '-' }}</b></p>
        <p><span>Ngày cấp</span><b>{{ selectedReader?.cardIssuedAt || '-' }}</b></p>
        <p><span>Ngày hết hạn</span><b>{{ selectedReader?.cardExpiredAt || '-' }}</b></p>
        <p><span>Có thể mượn</span><b :class="selectedReader?.hasValidCard ? 'text-ok' : 'text-bad'">{{ selectedReader?.hasValidCard ? 'Có' : 'Không' }}</b></p>
      </div>

      <div class="form-actions wrap-actions">
        <button class="ghost-btn" @click="showCard=false">Đóng</button>
        <button v-if="!selectedReader?.cardNumber" class="primary-btn" @click="issueCard(selectedReader)"><v-icon icon="mdi-card-plus-outline" /> Cấp thẻ</button>
        <button v-else class="primary-btn" @click="renewCard(selectedReader)"><v-icon icon="mdi-calendar-plus-outline" /> Gia hạn 12 tháng</button>
        <button v-if="selectedReader?.statusValue === AccountStatus.Active" class="danger-btn" @click="quickToggle(selectedReader)"><v-icon icon="mdi-lock-outline" /> Khóa thẻ</button>
        <button v-else class="success-btn" @click="quickToggle(selectedReader)"><v-icon icon="mdi-lock-open-outline" /> Mở khóa thẻ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { identityApi, getErrorMessage } from '../services/api'
import { AccountStatus, mapReader } from '../services/adapters'

const readers = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const showForm = ref(false)
const showCard = ref(false)
const selectedReader = ref(null)
const editingId = ref(null)
const filters = reactive({ q: '', status: '' })
const form = reactive({ fullName: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '', memberType: 'Thành viên', status: AccountStatus.Active })

const lockedCount = computed(() => readers.value.filter(x => x.statusValue === AccountStatus.Locked).length)
const validCardCount = computed(() => readers.value.filter(x => x.hasValidCard).length)
const expiredCardCount = computed(() => readers.value.filter(x => x.cardExpiredAt && !x.hasValidCard).length)

onMounted(loadReaders)

async function loadReaders() {
  loading.value = true
  error.value = ''
  try {
    const params = { q: filters.q || undefined, status: filters.status || undefined }
    const { data } = await identityApi.readers(params)
    readers.value = data.map(mapReader)
    if (selectedReader.value) {
      selectedReader.value = readers.value.find(x => x.id === selectedReader.value.id) || selectedReader.value
    }
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được độc giả.')
  } finally {
    loading.value = false
  }
}

function resetFilters() { filters.q = ''; filters.status = ''; loadReaders() }
function clearForm() { Object.assign(form, { fullName: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '', memberType: 'Thành viên', status: AccountStatus.Active }) }
function openCreate() { editingId.value = null; clearForm(); showForm.value = true }
function openEdit(r) { editingId.value = r.id; Object.assign(form, { fullName: r.name, email: r.email, phone: r.phone, dateOfBirth: r.dob, gender: r.gender, address: r.address, memberType: r.memberType, status: r.statusValue }); showForm.value = true }
function openCard(r) { selectedReader.value = r; showCard.value = true }

async function saveReader() {
  saving.value = true; error.value = ''; success.value = ''
  try {
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null, status: Number(form.status) }
    if (editingId.value) { await identityApi.updateReader(editingId.value, payload); success.value = 'Cập nhật độc giả thành công.' }
    else { await identityApi.createReader(payload); success.value = 'Thêm độc giả và cấp thẻ thư viện thành công.' }
    showForm.value = false
    await loadReaders()
  } catch (e) { error.value = getErrorMessage(e, 'Lưu độc giả thất bại.') }
  finally { saving.value = false }
}

async function quickToggle(r) {
  if (!r) return
  try {
    if (r.statusValue === AccountStatus.Active) { await identityApi.lockReaderCard(r.id, { reason: 'Khóa từ trang quản trị Admin' }); success.value = 'Đã khóa thẻ thư viện và độc giả.' }
    else { await identityApi.unlockReaderCard(r.id); success.value = 'Đã mở khóa thẻ thư viện và độc giả.' }
    await loadReaders()
  } catch (e) { error.value = getErrorMessage(e, 'Cập nhật trạng thái thẻ thất bại.') }
}

async function renewCard(r) {
  if (!r) return
  try {
    await identityApi.renewReaderCard(r.id, { extendMonths: 12 })
    success.value = `Đã gia hạn thẻ thư viện cho ${r.name} thêm 12 tháng.`
    await loadReaders()
  } catch (e) { error.value = getErrorMessage(e, 'Gia hạn thẻ thất bại.') }
}

async function issueCard(r) {
  if (!r) return
  try {
    await identityApi.issueReaderCard(r.id, { validMonths: 12, borrowLimit: 5 })
    success.value = `Đã cấp thẻ thư viện cho ${r.name}.`
    await loadReaders()
  } catch (e) { error.value = getErrorMessage(e, 'Cấp thẻ thất bại.') }
}
</script>

<style scoped>
.muted { color:#64748b; font-size:13px; }
.card-link { border:0; background:transparent; color:#2563eb; font-weight:900; display:inline-flex; align-items:center; gap:6px; cursor:pointer; padding:0; }
.card-status { font-size:12px; font-weight:800; }
.card-status.ok { color:#16a34a; }
.card-status.bad { color:#ef4444; }
.wide-actions { min-width: 260px; display:flex; gap:6px; flex-wrap:wrap; }
.mini-btn { border:1px solid #dbe3ef; background:#fff; border-radius:10px; padding:7px 9px; display:inline-flex; align-items:center; gap:4px; font-weight:800; color:#475569; cursor:pointer; }
.mini-btn.danger { color:#ef4444; background:#fef2f2; border-color:#fecaca; }
.mini-btn.success { color:#16a34a; background:#f0fdf4; border-color:#bbf7d0; }
.wide-modal { width:min(900px, 94vw); }
.card-modal { width:min(760px, 94vw); }
.card-preview { display:flex; justify-content:center; margin-bottom:18px; }
.library-card { width:min(420px, 100%); min-height:230px; border-radius:24px; padding:24px; color:#fff; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 24px 50px rgba(37,99,235,.28); }
.library-card.invalid { background:linear-gradient(135deg,#64748b,#334155); }
.card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; }
.card-top b { font-size:20px; letter-spacing:1px; }
.card-top span { display:block; opacity:.85; margin-top:4px; }
.card-top .v-icon { font-size:42px; opacity:.9; }
.library-card h2 { margin:0 0 12px; font-size:28px; }
.library-card p { margin:8px 0; opacity:.95; }
.card-bottom { display:flex; justify-content:space-between; margin-top:28px; }
.card-bottom span { opacity:.9; }
.card-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0 22px; }
.card-info-grid p { margin:0; padding:14px; border-radius:14px; background:#f8fafc; border:1px solid #e2e8f0; }
.card-info-grid span { display:block; color:#64748b; font-size:13px; margin-bottom:6px; }
.text-ok { color:#16a34a; }
.text-bad { color:#ef4444; }
.wrap-actions { flex-wrap:wrap; }
.danger-btn, .success-btn { height:44px; border:0; border-radius:12px; color:#fff; font-weight:900; padding:0 18px; display:inline-flex; align-items:center; gap:8px; cursor:pointer; }
.danger-btn { background:#ef4444; }
.success-btn { background:#16a34a; }
.success-alert { background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; }
</style>
