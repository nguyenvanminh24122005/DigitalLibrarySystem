<template>
  <PageHeader
    title="Độc giả"
    subtitle="Quản lý hồ sơ độc giả, thẻ thư viện, ngày hết hạn và trạng thái khóa/mở"
    breadcrumb="Độc giả"
  />

  <section class="reader-page">
    <div v-if="error" class="alert error-alert">
      <v-icon icon="mdi-alert-circle-outline" />
      <span>{{ error }}</span>
    </div>

    <div v-if="success" class="alert success-alert">
      <v-icon icon="mdi-check-circle-outline" />
      <span>{{ success }}</span>
    </div>

    <div class="stat-grid">
      <article class="stat-card">
        <div class="stat-icon blue">
          <v-icon icon="mdi-account-group-outline" />
        </div>

        <div>
          <span>Tổng độc giả</span>
          <strong>{{ stats.total }}</strong>
          <small>Hồ sơ đang quản lý</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon green">
          <v-icon icon="mdi-card-account-details-outline" />
        </div>

        <div>
          <span>Thẻ hợp lệ</span>
          <strong>{{ stats.active }}</strong>
          <small>Độc giả có thể mượn sách</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon orange">
          <v-icon icon="mdi-lock-outline" />
        </div>

        <div>
          <span>Tạm khóa</span>
          <strong>{{ stats.locked }}</strong>
          <small>Không thể mượn sách</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon red">
          <v-icon icon="mdi-calendar-alert-outline" />
        </div>

        <div>
          <span>Hết hạn thẻ</span>
          <strong>{{ stats.expired }}</strong>
          <small>Cần gia hạn thẻ</small>
        </div>
      </article>
    </div>

    <div class="reader-card">
      <div class="filter-panel">
        <div class="filter-search-row">
          <div class="search-box">
            <v-icon icon="mdi-magnify" />
            <input
              v-model.trim="filters.keyword"
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại, mã độc giả hoặc mã thẻ..."
              @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <div class="filter-control-row">
          <div class="select-box">
            <v-icon icon="mdi-account-check-outline" />
            <select v-model="filters.status">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Tạm khóa</option>
              <option value="expired">Hết hạn thẻ</option>
            </select>
          </div>

          <div class="select-box">
            <v-icon icon="mdi-card-account-details-outline" />
            <select v-model="filters.cardStatus">
              <option value="">Tất cả thẻ</option>
              <option value="valid">Thẻ còn hạn</option>
              <option value="expired">Thẻ hết hạn</option>
            </select>
          </div>

          <button class="filter-btn" type="button" @click="applyFilters">
            <v-icon icon="mdi-filter-outline" />
            Lọc
          </button>

          <button class="ghost-btn" type="button" @click="resetFilters">
            <v-icon icon="mdi-refresh" />
            Đặt lại
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 52px">#</th>
              <th>Mã độc giả</th>
              <th>Độc giả</th>
              <th>Email / SĐT</th>
              <th>Thẻ thư viện</th>
              <th>Ngày cấp</th>
              <th>Ngày hết hạn</th>
              <th>Trạng thái</th>
              <th>Đang mượn</th>
              <th style="width: 210px">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="empty-cell">
                <v-icon icon="mdi-loading" class="spin" />
                Đang tải danh sách độc giả...
              </td>
            </tr>

            <tr v-else-if="pagedReaders.length === 0">
              <td colspan="10" class="empty-cell">
                Chưa có độc giả phù hợp.
              </td>
            </tr>

            <tr v-for="(reader, index) in pagedReaders" :key="reader.id || reader.code">
              <td>{{ startIndex + index + 1 }}</td>

              <td>
                <b class="reader-code">{{ reader.code }}</b>
              </td>

              <td>
                <div class="reader-name">
                  <b>{{ reader.fullName }}</b>
                  <span>{{ reader.username || 'Chưa có tên đăng nhập' }}</span>
                </div>
              </td>

              <td>
                <div class="reader-contact">
                  <b>{{ reader.email || '-' }}</b>
                  <span>{{ reader.phone || '-' }}</span>
                </div>
              </td>

              <td>
                <button class="card-code-btn" type="button" @click="openCardDetail(reader)">
                  <v-icon icon="mdi-card-account-details-outline" />
                  {{ reader.libraryCardCode }}
                </button>
              </td>

              <td>{{ formatDate(reader.issuedAt) }}</td>

              <td>
                <span :class="isExpired(reader.expiresAt) ? 'date expired' : 'date'">
                  {{ formatDate(reader.expiresAt) }}
                </span>
              </td>

              <td>
                <span class="status-pill" :class="reader.status">
                  {{ statusLabel(reader.status) }}
                </span>
              </td>

              <td>
                <span class="borrow-count">
                  {{ reader.borrowedCount }} / {{ reader.maxBooks }} sách
                </span>
              </td>

              <td>
                <div class="action-group">
                  <button class="icon-action" type="button" title="Xem hồ sơ" @click="openDetail(reader)">
                    <v-icon icon="mdi-eye-outline" />
                  </button>

                  <button class="icon-action" type="button" title="Sửa độc giả" @click="openEditModal(reader)">
                    <v-icon icon="mdi-pencil-outline" />
                  </button>

                  <button class="icon-action" type="button" title="Gia hạn thẻ" @click="openRenewModal(reader)">
                    <v-icon icon="mdi-calendar-plus-outline" />
                  </button>

                  <button
                    class="icon-action"
                    type="button"
                    :class="reader.status === 'locked' ? 'unlock' : 'lock'"
                    :title="reader.status === 'locked' ? 'Mở khóa độc giả' : 'Khóa độc giả'"
                    @click="toggleLock(reader)"
                  >
                    <v-icon :icon="reader.status === 'locked' ? 'mdi-lock-open-outline' : 'mdi-lock-outline'" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <span>
          Hiển thị {{ filteredReaders.length ? startIndex + 1 : 0 }} -
          {{ Math.min(startIndex + pageSize, filteredReaders.length) }}
          trên {{ filteredReaders.length }} độc giả
        </span>

        <div class="pagination-actions">
          <button type="button" :disabled="page === 1" @click="page--">
            <v-icon icon="mdi-chevron-left" />
          </button>

          <b>{{ page }}</b>

          <button type="button" :disabled="page === totalPages" @click="page++">
            <v-icon icon="mdi-chevron-right" />
          </button>

          <select v-model.number="pageSize">
            <option :value="5">5 / trang</option>
            <option :value="10">10 / trang</option>
            <option :value="20">20 / trang</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="detailModal.open" class="modal-backdrop" @click.self="closeDetailModal">
      <article class="detail-modal">
        <header class="modal-head">
          <div>
            <h3>Hồ sơ độc giả</h3>
            <p>Xem thông tin cá nhân, thẻ thư viện và trạng thái mượn trả.</p>
          </div>

          <button type="button" @click="closeDetailModal">
            <v-icon icon="mdi-close" />
          </button>
        </header>

        <div class="detail-tabs">
          <button
            type="button"
            :class="{ active: detailTab === 'profile' }"
            @click="detailTab = 'profile'"
          >
            Hồ sơ độc giả
          </button>

          <button
            type="button"
            :class="{ active: detailTab === 'card' }"
            @click="detailTab = 'card'"
          >
            Thẻ thư viện
          </button>
        </div>

        <section v-if="detailTab === 'profile'" class="detail-body">
          <div class="detail-summary">
            <div class="summary-icon">
              <v-icon icon="mdi-account-circle-outline" />
            </div>

            <div>
              <h4>{{ selectedReader.fullName }}</h4>
              <span class="status-pill" :class="selectedReader.status">
                {{ statusLabel(selectedReader.status) }}
              </span>
            </div>
          </div>

          <div class="detail-grid">
            <div>
              <span>Mã độc giả</span>
              <b>{{ selectedReader.code }}</b>
            </div>

            <div>
              <span>Tên đăng nhập</span>
              <b>{{ selectedReader.username || '-' }}</b>
            </div>

            <div>
              <span>Email</span>
              <b>{{ selectedReader.email || '-' }}</b>
            </div>

            <div>
              <span>Số điện thoại</span>
              <b>{{ selectedReader.phone || '-' }}</b>
            </div>

            <div>
              <span>Giới hạn mượn</span>
              <b>{{ selectedReader.maxBooks }} sách</b>
            </div>

            <div>
              <span>Số sách đang mượn</span>
              <b>{{ selectedReader.borrowedCount }} sách</b>
            </div>

            <div class="full">
              <span>Ghi chú</span>
              <b>{{ selectedReader.note || '-' }}</b>
            </div>
          </div>
        </section>

        <section v-else class="detail-body">
          <div class="library-card-preview">
            <div class="library-card-top">
              <div>
                <span>DIGILIB LIBRARY CARD</span>
                <h4>{{ selectedReader.libraryCardCode }}</h4>
              </div>

              <v-icon icon="mdi-card-account-details-outline" />
            </div>

            <div class="library-card-name">
              <span>Độc giả</span>
              <b>{{ selectedReader.fullName }}</b>
            </div>

            <div class="library-card-grid">
              <div>
                <span>Mã độc giả</span>
                <b>{{ selectedReader.code }}</b>
              </div>

              <div>
                <span>Ngày cấp</span>
                <b>{{ formatDate(selectedReader.issuedAt) }}</b>
              </div>

              <div>
                <span>Ngày hết hạn</span>
                <b>{{ formatDate(selectedReader.expiresAt) }}</b>
              </div>

              <div>
                <span>Trạng thái</span>
                <b>{{ statusLabel(selectedReader.status) }}</b>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="outline-btn" type="button" @click="copyCardCode">
              <v-icon icon="mdi-content-copy" />
              Sao chép mã thẻ
            </button>

            <button class="outline-btn" type="button" @click="openRenewModal(selectedReader)">
              <v-icon icon="mdi-calendar-plus-outline" />
              Gia hạn thẻ
            </button>

            <button class="primary-btn" type="button" @click="printLibraryCard">
              <v-icon icon="mdi-printer-outline" />
              In thẻ
            </button>
          </div>
        </section>
      </article>
    </div>

    <div v-if="formModal.open" class="modal-backdrop" @click.self="closeFormModal">
      <article class="form-modal">
        <header class="modal-head">
          <div>
            <h3>Sửa độc giả</h3>
            <p>Cập nhật thông tin hồ sơ độc giả đã đăng ký.</p>
          </div>

          <button type="button" @click="closeFormModal">
            <v-icon icon="mdi-close" />
          </button>
        </header>

        <form class="reader-form" @submit.prevent="saveReader">
          <div class="field">
            <label>Họ tên độc giả *</label>
            <input v-model.trim="readerForm.fullName" class="input" placeholder="Nguyễn Văn A" />
          </div>

          <div class="field">
            <label>Mã độc giả *</label>
            <input v-model.trim="readerForm.code" class="input" placeholder="DG20260001" />
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model.trim="readerForm.email" class="input" type="email" placeholder="reader@gmail.com" />
          </div>

          <div class="field">
            <label>Số điện thoại</label>
            <input v-model.trim="readerForm.phone" class="input" placeholder="0901234567" />
          </div>

          <div class="field">
            <label>Mã thẻ thư viện *</label>
            <input v-model.trim="readerForm.libraryCardCode" class="input" placeholder="CARD-DG20260001" />
          </div>

          <div class="field">
            <label>Ngày cấp thẻ</label>
            <input v-model="readerForm.issuedAt" class="input" type="date" />
          </div>

          <div class="field">
            <label>Ngày hết hạn</label>
            <input v-model="readerForm.expiresAt" class="input" type="date" />
          </div>

          <div class="field">
            <label>Giới hạn mượn</label>
            <input v-model.number="readerForm.maxBooks" class="input" type="number" min="1" />
          </div>

          <div class="field">
            <label>Trạng thái</label>
            <select v-model="readerForm.status" class="select">
              <option value="active">Hoạt động</option>
              <option value="locked">Tạm khóa</option>
              <option value="expired">Hết hạn thẻ</option>
            </select>
          </div>

          <div class="field full">
            <label>Ghi chú</label>
            <textarea v-model.trim="readerForm.note" class="textarea" rows="3" placeholder="Ghi chú ngắn về độc giả"></textarea>
          </div>

          <div class="modal-actions full">
            <button class="ghost-btn" type="button" @click="closeFormModal">Hủy</button>

            <button class="primary-btn" type="submit" :disabled="saving">
              <v-icon icon="mdi-content-save-outline" />
              {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>
      </article>
    </div>

    <div v-if="renewModal.open" class="modal-backdrop" @click.self="closeRenewModal">
      <article class="small-modal">
        <header class="modal-head">
          <div>
            <h3>Gia hạn thẻ thư viện</h3>
            <p>{{ renewModal.reader?.fullName }} - {{ renewModal.reader?.libraryCardCode }}</p>
          </div>

          <button type="button" @click="closeRenewModal">
            <v-icon icon="mdi-close" />
          </button>
        </header>

        <div class="small-modal-body">
          <div class="field">
            <label>Ngày hết hạn mới</label>
            <input v-model="renewModal.newExpiresAt" class="input" type="date" />
          </div>

          <div class="modal-actions">
            <button class="ghost-btn" type="button" @click="closeRenewModal">Hủy</button>

            <button class="primary-btn" type="button" :disabled="saving" @click="renewCard">
              <v-icon icon="mdi-calendar-check-outline" />
              Gia hạn
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { identityApi, unwrap, getErrorMessage } from '../services/api'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const READER_ENDPOINT = '/api/readers'

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const readers = ref([])
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({
  keyword: '',
  status: '',
  cardStatus: ''
})

const detailModal = reactive({
  open: false
})

const detailTab = ref('profile')
const selectedReader = reactive(emptyReader())

const formModal = reactive({
  open: false
})

const readerForm = reactive(emptyReader())

const renewModal = reactive({
  open: false,
  reader: null,
  newExpiresAt: ''
})

const stats = computed(() => {
  return {
    total: readers.value.length,
    active: readers.value.filter((item) => item.status === 'active' && !isExpired(item.expiresAt)).length,
    locked: readers.value.filter((item) => item.status === 'locked').length,
    expired: readers.value.filter((item) => item.status === 'expired' || isExpired(item.expiresAt)).length
  }
})

const filteredReaders = computed(() => {
  const keyword = normalize(filters.keyword)

  return readers.value.filter((reader) => {
    const searchContent = normalize(`
      ${reader.code}
      ${reader.fullName}
      ${reader.username}
      ${reader.email}
      ${reader.phone}
      ${reader.libraryCardCode}
    `)

    const matchKeyword = !keyword || searchContent.includes(keyword)
    const matchStatus = !filters.status || reader.status === filters.status

    const cardExpired = isExpired(reader.expiresAt)
    const matchCardStatus =
      !filters.cardStatus ||
      (filters.cardStatus === 'valid' && !cardExpired) ||
      (filters.cardStatus === 'expired' && cardExpired)

    return matchKeyword && matchStatus && matchCardStatus
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredReaders.value.length / pageSize.value))
})

const startIndex = computed(() => {
  return (page.value - 1) * pageSize.value
})

const pagedReaders = computed(() => {
  return filteredReaders.value.slice(startIndex.value, startIndex.value + pageSize.value)
})

watch([() => filters.keyword, () => filters.status, () => filters.cardStatus, pageSize], () => {
  page.value = 1
})

function emptyReader() {
  return {
    id: '',
    code: '',
    fullName: '',
    username: '',
    email: '',
    phone: '',
    libraryCardCode: '',
    issuedAt: today(),
    expiresAt: nextYear(),
    maxBooks: 5,
    borrowedCount: 0,
    status: 'active',
    note: ''
  }
}

async function loadReaders() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    let res = null

    if (typeof identityApi?.readers === 'function') {
      res = await identityApi.readers()
    } else {
      res = await fetchApi(READER_ENDPOINT)
    }

    readers.value = toArraySafe(unwrapSafe(res)).map(normalizeReader)
  } catch (e) {
    console.error('Tải danh sách độc giả lỗi:', e?.response?.data || e)
    error.value = getApiError(e, 'Không tải được danh sách độc giả.')
    readers.value = []
  } finally {
    loading.value = false
  }
}

function normalizeReader(item = {}) {
  const id = item.id || item.Id || item.readerId || item.ReaderId || item.userId || item.UserId || item.code || item.Code
  const code = item.code || item.Code || item.readerCode || item.ReaderCode || item.maDocGia || `DG${id || Date.now()}`
  const fullName = item.fullName || item.FullName || item.name || item.Name || item.readerName || 'Chưa rõ tên'

  const issuedAt = toDateInput(
    item.issuedAt ||
    item.IssuedAt ||
    item.cardIssuedAt ||
    item.CardIssuedAt ||
    item.createdAt ||
    item.CreatedAt ||
    today()
  )

  const expiresAt = toDateInput(
    item.expiresAt ||
    item.ExpiresAt ||
    item.expiryDate ||
    item.ExpiryDate ||
    item.cardExpiresAt ||
    item.CardExpiresAt ||
    item.expiredAt ||
    item.ExpiredAt ||
    nextYear()
  )

  const isLocked = item.isLocked ?? item.IsLocked
  const rawStatus = String(item.status || item.Status || '').toLowerCase()

  let status = rawStatus || 'active'

  if (isLocked === true || rawStatus === 'locked' || rawStatus === 'khoa' || rawStatus === 'khóa') {
    status = 'locked'
  } else if (isExpired(expiresAt) || rawStatus === 'expired' || rawStatus === 'het-han' || rawStatus === 'hết hạn') {
    status = 'expired'
  } else {
    status = 'active'
  }

  return {
    id,
    code,
    fullName,
    username: item.username || item.Username || item.userName || item.UserName || '',
    email: item.email || item.Email || '',
    phone: item.phone || item.Phone || item.phoneNumber || item.PhoneNumber || '',
    libraryCardCode:
      item.libraryCardCode ||
      item.LibraryCardCode ||
      item.cardNumber ||
      item.CardNumber ||
      item.cardCode ||
      item.CardCode ||
      `CARD-${code}`,
    issuedAt,
    expiresAt,
    maxBooks: Number(item.maxBooks || item.MaxBooks || item.borrowLimit || item.BorrowLimit || 5),
    borrowedCount: Number(item.borrowedCount || item.BorrowedCount || item.currentBorrowed || item.CurrentBorrowed || 0),
    status,
    note: item.note || item.Note || item.description || item.Description || ''
  }
}

async function openDetail(reader) {
  Object.assign(selectedReader, reader)
  detailTab.value = 'profile'
  detailModal.open = true

  await fetchReaderDetail(reader)
}

async function openCardDetail(reader) {
  Object.assign(selectedReader, reader)
  detailTab.value = 'card'
  detailModal.open = true

  await fetchReaderDetail(reader)
}

async function fetchReaderDetail(reader) {
  try {
    if (!reader.id) return

    let res = null

    if (typeof identityApi?.reader === 'function') {
      res = await identityApi.reader(reader.id)
    } else if (typeof identityApi?.getReader === 'function') {
      res = await identityApi.getReader(reader.id)
    } else {
      res = await fetchApi(`${READER_ENDPOINT}/${reader.id}`)
    }

    Object.assign(selectedReader, normalizeReader({ ...reader, ...unwrapSafe(res) }))
  } catch {
    // Nếu backend chưa hỗ trợ API chi tiết thì giữ dữ liệu đang có ở bảng.
  }
}

function closeDetailModal() {
  detailModal.open = false
}

function openEditModal(reader) {
  Object.assign(readerForm, {
    ...reader,
    issuedAt: toDateInput(reader.issuedAt),
    expiresAt: toDateInput(reader.expiresAt)
  })

  formModal.open = true
}

function closeFormModal() {
  formModal.open = false
}

async function saveReader() {
  try {
    saving.value = true
    error.value = ''
    success.value = ''

    validateReaderForm()

    const payload = makeReaderPayload(readerForm)

    await updateReaderApi(readerForm.id, payload)

    const index = readers.value.findIndex((item) => String(item.id) === String(readerForm.id))

    if (index !== -1) {
      readers.value[index] = normalizeReader({ ...readers.value[index], ...payload })
    }

    if (String(selectedReader.id) === String(readerForm.id)) {
      Object.assign(selectedReader, normalizeReader({ ...selectedReader, ...payload }))
    }

    success.value = 'Đã cập nhật hồ sơ độc giả.'
    closeFormModal()
  } catch (e) {
    console.error('Lưu độc giả lỗi:', e?.response?.data || e)
    error.value = getApiError(e, 'Không lưu được độc giả.')
  } finally {
    saving.value = false
  }
}

async function updateReaderApi(id, payload) {
  const calls = []

  if (typeof identityApi?.updateReader === 'function') {
    calls.push(() => identityApi.updateReader(id, payload))
    calls.push(() => identityApi.updateReader(id, { request: payload }))
  }

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: payload
  }))

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: { request: payload }
  }))

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${id}`, {
    method: 'PATCH',
    body: payload
  }))

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${id}`, {
    method: 'PATCH',
    body: { request: payload }
  }))

  return callFirstSuccess(calls)
}

function makeReaderPayload(reader) {
  return {
    id: reader.id,
    code: reader.code,
    readerCode: reader.code,
    fullName: reader.fullName,
    name: reader.fullName,
    username: reader.username,
    email: reader.email,
    phone: reader.phone,
    phoneNumber: reader.phone,
    libraryCardCode: reader.libraryCardCode,
    cardCode: reader.libraryCardCode,
    cardNumber: reader.libraryCardCode,
    issuedAt: reader.issuedAt,
    cardIssuedAt: reader.issuedAt,
    expiresAt: reader.expiresAt,
    expiryDate: reader.expiresAt,
    cardExpiresAt: reader.expiresAt,
    maxBooks: Number(reader.maxBooks || 5),
    borrowLimit: Number(reader.maxBooks || 5),
    borrowedCount: Number(reader.borrowedCount || 0),
    status: reader.status,
    isLocked: reader.status === 'locked',
    note: reader.note
  }
}

function validateReaderForm() {
  if (!readerForm.fullName.trim()) {
    throw new Error('Vui lòng nhập họ tên độc giả.')
  }

  if (!readerForm.code.trim()) {
    throw new Error('Vui lòng nhập mã độc giả.')
  }

  if (!readerForm.libraryCardCode.trim()) {
    throw new Error('Vui lòng nhập mã thẻ thư viện.')
  }

  if (!readerForm.expiresAt) {
    throw new Error('Vui lòng chọn ngày hết hạn thẻ.')
  }
}

function openRenewModal(reader) {
  renewModal.reader = reader
  renewModal.newExpiresAt = addMonths(toDateInput(reader.expiresAt || today()), 12)
  renewModal.open = true
}

function closeRenewModal() {
  renewModal.open = false
  renewModal.reader = null
  renewModal.newExpiresAt = ''
}

async function renewCard() {
  try {
    saving.value = true
    error.value = ''
    success.value = ''

    if (!renewModal.reader || !renewModal.newExpiresAt) {
      throw new Error('Vui lòng chọn ngày hết hạn mới.')
    }

    const reader = renewModal.reader
    const newDate = renewModal.newExpiresAt

    await renewReaderCardApi(reader, newDate)

    const target = readers.value.find((item) => String(item.id) === String(reader.id))

    if (target) {
      target.expiresAt = newDate
      target.status = 'active'
    }

    if (String(selectedReader.id) === String(reader.id)) {
      selectedReader.expiresAt = newDate
      selectedReader.status = 'active'
    }

    success.value = 'Đã gia hạn thẻ thư viện.'
    closeRenewModal()
  } catch (e) {
    console.error('Gia hạn thẻ lỗi:', e?.response?.data || e)
    error.value = getApiError(e, 'Không gia hạn được thẻ thư viện.')
  } finally {
    saving.value = false
  }
}

async function renewReaderCardApi(reader, newDate) {
  const payload = {
    request: {
      expiresAt: newDate,
      expiryDate: newDate,
      cardExpiresAt: newDate,
      newExpiresAt: newDate,
      newExpiryDate: newDate
    }
  }

  const flatPayload = {
    expiresAt: newDate,
    expiryDate: newDate,
    cardExpiresAt: newDate,
    newExpiresAt: newDate,
    newExpiryDate: newDate
  }

  const calls = []

  if (typeof identityApi?.renewReaderCard === 'function') {
    calls.push(() => identityApi.renewReaderCard(reader.id, payload))
    calls.push(() => identityApi.renewReaderCard(reader.id, flatPayload))
  }

  if (typeof identityApi?.renewCard === 'function') {
    calls.push(() => identityApi.renewCard(reader.id, payload))
    calls.push(() => identityApi.renewCard(reader.id, flatPayload))
  }

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${reader.id}/card/renew`, {
    method: 'PUT',
    body: payload
  }))

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${reader.id}/card/renew`, {
    method: 'PUT',
    body: flatPayload
  }))

  return callFirstSuccess(calls)
}

async function toggleLock(reader) {
  try {
    saving.value = true
    error.value = ''
    success.value = ''

    const nextStatus = reader.status === 'locked' ? 'active' : 'locked'

    if (nextStatus === 'locked') {
      await lockReaderApi(reader)
    } else {
      await unlockReaderApi(reader)
    }

    reader.status = nextStatus

    if (String(selectedReader.id) === String(reader.id)) {
      selectedReader.status = nextStatus
    }

    success.value = nextStatus === 'locked'
      ? 'Đã khóa độc giả.'
      : 'Đã mở khóa độc giả.'
  } catch (e) {
    console.error('Cập nhật trạng thái độc giả lỗi:', e?.response?.data || e)
    error.value = getApiError(e, 'Không cập nhật được trạng thái độc giả.')
  } finally {
    saving.value = false
  }
}

async function lockReaderApi(reader) {
  const payload = {
    request: {
      reason: 'Khóa độc giả từ trang quản trị',
      status: 'locked',
      isLocked: true
    }
  }

  const flatPayload = {
    reason: 'Khóa độc giả từ trang quản trị',
    status: 'locked',
    isLocked: true
  }

  const calls = []

  if (typeof identityApi?.lockReader === 'function') {
    calls.push(() => identityApi.lockReader(reader.id, payload))
    calls.push(() => identityApi.lockReader(reader.id, flatPayload))
  }

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${reader.id}/lock`, {
    method: 'POST',
    body: payload
  }))

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${reader.id}/lock`, {
    method: 'POST',
    body: flatPayload
  }))

  return callFirstSuccess(calls)
}

async function unlockReaderApi(reader) {
  const payload = {
    request: {
      status: 'active',
      isLocked: false
    }
  }

  const flatPayload = {
    status: 'active',
    isLocked: false
  }

  const calls = []

  if (typeof identityApi?.unlockReader === 'function') {
    calls.push(() => identityApi.unlockReader(reader.id, payload))
    calls.push(() => identityApi.unlockReader(reader.id, flatPayload))
  }

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${reader.id}/unlock`, {
    method: 'POST',
    body: payload
  }))

  calls.push(() => fetchApi(`${READER_ENDPOINT}/${reader.id}/unlock`, {
    method: 'POST',
    body: flatPayload
  }))

  return callFirstSuccess(calls)
}

async function callFirstSuccess(calls) {
  let lastError = null

  for (const call of calls) {
    try {
      return await call()
    } catch (e) {
      lastError = e
    }
  }

  throw lastError || new Error('Không có API phù hợp.')
}

function applyFilters() {
  page.value = 1
}

function resetFilters() {
  filters.keyword = ''
  filters.status = ''
  filters.cardStatus = ''
  page.value = 1
}

async function copyCardCode() {
  try {
    await navigator.clipboard.writeText(selectedReader.libraryCardCode)
    success.value = 'Đã sao chép mã thẻ thư viện.'
    error.value = ''
  } catch {
    error.value = 'Không sao chép được mã thẻ.'
    success.value = ''
  }
}

function printLibraryCard() {
  const content = `
DIGILIB LIBRARY CARD

Mã thẻ: ${selectedReader.libraryCardCode}
Độc giả: ${selectedReader.fullName}
Mã độc giả: ${selectedReader.code}
Ngày cấp: ${formatDate(selectedReader.issuedAt)}
Ngày hết hạn: ${formatDate(selectedReader.expiresAt)}
Trạng thái: ${statusLabel(selectedReader.status)}
  `

  const printWindow = window.open('', '_blank', 'width=560,height=520')

  if (!printWindow) {
    error.value = 'Trình duyệt đã chặn cửa sổ in thẻ.'
    return
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Thẻ thư viện</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            background: #f8fafc;
          }

          .card {
            border: 2px solid #2563eb;
            border-radius: 18px;
            padding: 24px;
            background: #ffffff;
          }

          h1 {
            color: #2563eb;
            margin: 0 0 16px;
          }

          pre {
            font-size: 15px;
            line-height: 1.7;
            white-space: pre-wrap;
          }
        </style>
      </head>

      <body>
        <div class="card">
          <h1>DIGILIB</h1>
          <pre>${content}</pre>
        </div>

        <script>
          window.print()
        <\/script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

async function fetchApi(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json'
  }

  const token = localStorage.getItem('digilib_token') || localStorage.getItem('token')

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const text = await response.text()

  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const apiError = new Error(data?.message || data?.title || `API lỗi ${response.status}`)
    apiError.response = {
      status: response.status,
      data
    }
    throw apiError
  }

  return data
}

function unwrapSafe(data) {
  try {
    return unwrap(data)
  } catch {
    return data?.data || data?.item || data?.result || data
  }
}

function toArraySafe(data) {
  const value = unwrapSafe(data)

  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.value)) return value.value
  if (Array.isArray(value?.$values)) return value.$values

  return []
}

function getApiError(errorValue, fallback) {
  try {
    return getErrorMessage(errorValue, fallback)
  } catch {
    return errorValue?.response?.data?.message ||
      errorValue?.response?.data?.title ||
      errorValue?.message ||
      fallback
  }
}

function statusLabel(status) {
  if (status === 'locked') return 'Tạm khóa'
  if (status === 'expired') return 'Hết hạn'
  return 'Hoạt động'
}

function isExpired(value) {
  if (!value) return false

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return false

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  return date < todayDate
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('vi-VN')
}

function toDateInput(value) {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return String(value)
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function nextYear() {
  return addMonths(today(), 12)
}

function addMonths(value, months) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return nextYear()
  }

  date.setMonth(date.getMonth() + months)

  return date.toISOString().slice(0, 10)
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

onMounted(loadReaders)
</script>

<style scoped>
.reader-page {
  display: grid;
  gap: 18px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card,
.reader-card,
.detail-modal,
.form-modal,
.small-modal {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
}

.stat-card {
  min-height: 118px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 30px;
}

.stat-icon.blue {
  background: #eff6ff;
  color: #2563eb;
}

.stat-icon.green {
  background: #f0fdf4;
  color: #16a34a;
}

.stat-icon.orange {
  background: #fff7ed;
  color: #f97316;
}

.stat-icon.red {
  background: #fef2f2;
  color: #ef4444;
}

.stat-card span {
  color: #475569;
  font-size: 14px;
  font-weight: 850;
}

.stat-card strong {
  display: block;
  margin-top: 5px;
  color: #0f172a;
  font-size: 30px;
  font-weight: 950;
}

.stat-card small {
  color: #16a34a;
  font-weight: 850;
}

.reader-card {
  overflow: hidden;
}

.filter-panel {
  padding: 22px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  display: grid;
  gap: 14px;
}

.filter-search-row {
  display: grid;
  grid-template-columns: 1fr;
}

.search-box {
  height: 48px;
  padding: 0 15px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 11px;
}

.search-box .v-icon {
  color: #64748b;
  font-size: 23px;
  flex: 0 0 auto;
}

.search-box input {
  width: 100%;
  height: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 750;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.filter-control-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) 118px 128px;
  gap: 12px;
  align-items: center;
}

.select-box {
  height: 46px;
  padding: 0 13px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 9px;
}

.select-box .v-icon {
  color: #64748b;
  font-size: 20px;
  flex: 0 0 auto;
}

.select-box select {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
}

.select,
.input,
.textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: 0;
  background: #ffffff;
  color: #0f172a;
  font-weight: 750;
}

.select,
.input {
  height: 46px;
  padding: 0 14px;
}

.textarea {
  padding: 12px 14px;
  resize: vertical;
}

.filter-btn,
.primary-btn,
.ghost-btn,
.outline-btn {
  height: 46px;
  padding: 0 18px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 950;
  white-space: nowrap;
}

.primary-btn,
.filter-btn {
  border: 0;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.2);
}

.primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ghost-btn,
.outline-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 18px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

th {
  background: #f8fafc;
  color: #475569;
  font-weight: 950;
}

.reader-code {
  color: #0f172a;
}

.reader-name,
.reader-contact {
  display: grid;
  gap: 4px;
}

.reader-name b,
.reader-contact b {
  color: #0f172a;
  font-weight: 950;
}

.reader-name span,
.reader-contact span {
  color: #64748b;
  font-size: 13px;
  font-weight: 750;
}

.card-code-btn {
  border: 0;
  background: transparent;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  font-weight: 950;
}

.date.expired {
  color: #dc2626;
  font-weight: 950;
}

.status-pill {
  width: fit-content;
  min-height: 28px;
  padding: 5px 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 950;
}

.status-pill.active {
  background: #dcfce7;
  color: #15803d;
}

.status-pill.locked {
  background: #fff7ed;
  color: #ea580c;
}

.status-pill.expired {
  background: #fee2e2;
  color: #dc2626;
}

.borrow-count {
  color: #334155;
  font-weight: 850;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-action {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  color: #334155;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 18px;
}

.icon-action:hover {
  border-color: #93c5fd;
  color: #2563eb;
  background: #eff6ff;
}

.icon-action.lock {
  color: #ef4444;
  background: #fff1f2;
}

.icon-action.unlock {
  color: #16a34a;
  background: #f0fdf4;
}

.pagination-bar {
  padding: 16px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-bar span {
  color: #64748b;
  font-weight: 750;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.pagination-actions button {
  width: 38px;
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
}

.pagination-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination-actions b {
  min-width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  display: grid;
  place-items: center;
}

.pagination-actions select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  padding: 28px;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
}

.detail-modal,
.form-modal {
  width: min(860px, 100%);
  max-height: calc(100vh - 56px);
  overflow: auto;
}

.small-modal {
  width: min(480px, 100%);
  overflow: hidden;
}

.small-modal-body {
  padding: 22px;
}

.modal-head {
  padding: 22px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.modal-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 950;
}

.modal-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-weight: 700;
}

.modal-head button {
  width: 38px;
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
}

.detail-tabs {
  padding: 0 22px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 26px;
}

.detail-tabs button {
  height: 48px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-weight: 950;
}

.detail-tabs button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.detail-body {
  padding: 22px;
}

.detail-summary {
  padding: 18px;
  border-radius: 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 14px;
}

.summary-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 34px;
}

.detail-summary h4 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
}

.detail-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.detail-grid div {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
}

.detail-grid .full {
  grid-column: 1 / -1;
}

.detail-grid span,
.library-card-grid span,
.library-card-name span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 850;
}

.detail-grid b,
.library-card-grid b,
.library-card-name b {
  display: block;
  margin-top: 5px;
  color: #0f172a;
  font-weight: 950;
}

.library-card-preview {
  padding: 24px;
  border-radius: 22px;
  background:
    radial-gradient(circle at 90% 15%, rgba(255, 255, 255, 0.24), transparent 28%),
    linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
}

.library-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.library-card-top span,
.library-card-name span,
.library-card-grid span {
  color: rgba(255, 255, 255, 0.75);
}

.library-card-top h4 {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 950;
}

.library-card-top .v-icon {
  font-size: 42px;
}

.library-card-name {
  margin-top: 34px;
}

.library-card-name b {
  color: #ffffff;
  font-size: 23px;
}

.library-card-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.library-card-grid b {
  color: #ffffff;
}

.card-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.reader-form {
  padding: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field.full,
.modal-actions.full {
  grid-column: 1 / -1;
}

.field label {
  color: #334155;
  font-weight: 900;
}

.modal-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.alert {
  min-height: 44px;
  padding: 0 15px;
  border-radius: 12px;
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

.empty-cell {
  padding: 34px !important;
  text-align: center;
  color: #64748b;
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

:global(body.digilib-dark) .stat-card,
:global(body.digilib-dark) .reader-card,
:global(body.digilib-dark) .detail-modal,
:global(body.digilib-dark) .form-modal,
:global(body.digilib-dark) .small-modal,
:global(body.digilib-dark) .filter-panel,
:global(body.digilib-dark) .search-box,
:global(body.digilib-dark) .select-box,
:global(body.digilib-dark) .select,
:global(body.digilib-dark) .input,
:global(body.digilib-dark) .textarea,
:global(body.digilib-dark) .ghost-btn,
:global(body.digilib-dark) .outline-btn,
:global(body.digilib-dark) .icon-action,
:global(body.digilib-dark) .modal-head button,
:global(body.digilib-dark) .pagination-actions button,
:global(body.digilib-dark) .pagination-actions select {
  background: #0f172a;
  border-color: #334155;
  color: #e5e7eb;
}

:global(body.digilib-dark) .search-box input,
:global(body.digilib-dark) .select-box select {
  color: #e5e7eb;
}

:global(body.digilib-dark) th,
:global(body.digilib-dark) .detail-summary,
:global(body.digilib-dark) .input:disabled {
  background: #111827;
}

:global(body.digilib-dark) td,
:global(body.digilib-dark) th,
:global(body.digilib-dark) .modal-head,
:global(body.digilib-dark) .detail-tabs,
:global(body.digilib-dark) .filter-panel {
  border-color: #334155;
}

:global(body.digilib-dark) .stat-card strong,
:global(body.digilib-dark) .reader-code,
:global(body.digilib-dark) .reader-name b,
:global(body.digilib-dark) .reader-contact b,
:global(body.digilib-dark) .modal-head h3,
:global(body.digilib-dark) .detail-summary h4,
:global(body.digilib-dark) .detail-grid b,
:global(body.digilib-dark) .field label {
  color: #f8fafc;
}

:global(body.digilib-dark) .stat-card span,
:global(body.digilib-dark) .reader-name span,
:global(body.digilib-dark) .reader-contact span,
:global(body.digilib-dark) .modal-head p,
:global(body.digilib-dark) .detail-grid span,
:global(body.digilib-dark) .borrow-count {
  color: #cbd5e1;
}

@media (max-width: 1280px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-control-row {
    grid-template-columns: 1fr 1fr;
  }

  .filter-btn,
  .ghost-btn {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .stat-grid,
  .filter-control-row,
  .detail-grid,
  .reader-form,
  .library-card-grid {
    grid-template-columns: 1fr;
  }

  .pagination-bar,
  .modal-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .modal-backdrop {
    padding: 12px;
  }

  .primary-btn,
  .ghost-btn,
  .outline-btn,
  .filter-btn {
    width: 100%;
  }
}
</style>