<template>
  <section class="librarian-dashboard">
    <div class="page-head">
      <div>
        <h1>Tổng quan nghiệp vụ</h1>
        <p>Dữ liệu lấy trực tiếp từ Catalog, Identity và Circulation API</p>
      </div>

      <button class="reload-btn" :disabled="loading" @click="loadDashboard">
        <i class="mdi mdi-refresh"></i>
        {{ loading ? 'Đang tải...' : 'Tải lại dữ liệu' }}
      </button>
    </div>

    <div v-if="errorMessage" class="api-error">
      <i class="mdi mdi-alert-circle-outline"></i>
      <span>{{ errorMessage }}</span>
      <button @click="loadDashboard">Thử lại</button>
    </div>

    <div class="stat-grid">
      <article class="stat-card">
        <div class="stat-icon blue">
          <i class="mdi mdi-book-open-page-variant-outline"></i>
        </div>
        <div>
          <span>Đang mượn</span>
          <b>{{ stats.borrowing }}</b>
          <small>Phiếu chưa trả</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon green">
          <i class="mdi mdi-book-check-outline"></i>
        </div>
        <div>
          <span>Đã trả</span>
          <b>{{ stats.returned }}</b>
          <small>Tổng phiếu hoàn tất</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon red">
          <i class="mdi mdi-clock-alert-outline"></i>
        </div>
        <div>
          <span>Quá hạn</span>
          <b>{{ stats.overdue }}</b>
          <small>Cần xử lý</small>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon purple">
          <i class="mdi mdi-cash-multiple"></i>
        </div>
        <div>
          <span>Phí chưa thu</span>
          <b>{{ formatMoney(stats.unpaidFine) }}</b>
          <small>Từ API phí phạt</small>
        </div>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-title">
          <h2>Biểu đồ mượn - trả 7 ngày gần đây</h2>
          <span>{{ records.length }} phiếu từ API</span>
        </div>

        <div v-if="weeklyChart.length" class="bar-chart">
          <div
            v-for="item in weeklyChart"
            :key="item.key"
            class="bar-item"
          >
            <div class="bar-box">
              <span
                class="bar borrow"
                :style="{ height: `${getBarHeight(item.borrow)}%` }"
                :title="`Mượn: ${item.borrow}`"
              ></span>
              <span
                class="bar return"
                :style="{ height: `${getBarHeight(item.returned)}%` }"
                :title="`Trả: ${item.returned}`"
              ></span>
            </div>
            <small>{{ item.label }}</small>
          </div>
        </div>

        <div v-else class="empty-box">
          Chưa có dữ liệu mượn/trả trong 7 ngày gần đây.
        </div>

        <div class="legend">
          <span><i class="dot blue"></i>Lượt mượn</span>
          <span><i class="dot green"></i>Lượt trả</span>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Tỷ lệ tình trạng bản sao</h2>
          <span>{{ copies.length }} bản sao</span>
        </div>

        <div class="copy-status-list">
          <div>
            <span>Sẵn sàng</span>
            <b>{{ copyStats.available }}</b>
          </div>

          <div>
            <span>Đang mượn</span>
            <b>{{ copyStats.borrowed }}</b>
          </div>

          <div>
            <span>Hư hỏng / mất / bảo trì</span>
            <b>{{ copyStats.damaged }}</b>
          </div>
        </div>
      </section>
    </div>

    <div class="dashboard-grid lower">
      <section class="panel">
        <div class="panel-title">
          <h2>Sách được mượn nhiều</h2>
          <span>Cập nhật từ phiếu mượn</span>
        </div>

        <div v-if="topBorrowedBooks.length" class="top-books">
          <div
            v-for="(book, index) in topBorrowedBooks"
            :key="book.title"
            class="top-book-row"
          >
            <b>#{{ index + 1 }}</b>
            <div>
              <strong>{{ book.title }}</strong>
              <small>{{ book.count }} lượt mượn</small>
            </div>
          </div>
        </div>

        <div v-else class="empty-box">
          Chưa có dữ liệu mượn sách.
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Thông báo cần xử lý</h2>
          <span>Dữ liệu nghiệp vụ thật</span>
        </div>

        <div class="notice-list">
          <button class="notice-row" @click="goTo('/overdue')">
            <span>Sách quá hạn</span>
            <b>{{ stats.overdue }}</b>
          </button>

          <button class="notice-row" @click="goTo('/fines')">
            <span>Phí phạt chưa thu</span>
            <b>{{ unpaidFineCount }}</b>
          </button>

          <button class="notice-row" @click="goTo('/readers')">
            <span>Độc giả đang hoạt động</span>
            <b>{{ activeReaderCount }}</b>
          </button>

          <button class="notice-row" @click="goTo('/borrow')">
            <span>Bản sao có thể cho mượn</span>
            <b>{{ copyStats.available }}</b>
          </button>
        </div>
      </section>
    </div>

    <section class="panel table-panel">
      <div class="panel-title">
        <h2>Phiếu mượn gần đây</h2>

        <div class="table-actions">
          <input
            v-model.trim="keyword"
            placeholder="Tìm theo sách, độc giả, mã thẻ..."
          />

          <select v-model="recordFilter">
            <option value="all">Tất cả</option>
            <option value="borrowing">Đang mượn</option>
            <option value="returned">Đã trả</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>
      </div>

      <div v-if="filteredRecords.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Sách</th>
              <th>Độc giả</th>
              <th>Mã thẻ</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th>Phí phạt</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(record, index) in filteredRecords.slice(0, 10)" :key="record.id || index">
              <td>{{ index + 1 }}</td>
              <td>
                <b>{{ record.bookTitle || record.title || 'Không rõ sách' }}</b>
                <small>{{ record.copyCode || record.barcode || '-' }}</small>
              </td>
              <td>{{ record.readerName || record.fullName || '-' }}</td>
              <td>{{ record.cardNumber || '-' }}</td>
              <td>{{ formatDate(record.borrowDate || record.createdAt) }}</td>
              <td :class="{ danger: isOverdue(record) }">
                {{ formatDate(record.dueDate) }}
              </td>
              <td>{{ formatDate(record.returnDate || record.returnedAt) }}</td>
              <td>
                <span :class="['status-badge', getRecordTone(record)]">
                  {{ getRecordStatusText(record) }}
                </span>
              </td>
              <td :class="{ danger: getFineAmount(record) > 0 }">
                {{ formatMoney(getFineAmount(record)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-box">
        Không có phiếu mượn phù hợp.
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const loading = ref(false)
const errorMessage = ref('')
const records = ref([])
const fines = ref([])
const copies = ref([])
const readers = ref([])
const books = ref([])

const keyword = ref('')
const recordFilter = ref('all')

onMounted(() => {
  loadDashboard()
})

function getToken() {
  return (
    localStorage.getItem('digilib_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    ''
  )
}

async function requestOne(path) {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const text = await res.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.title ||
      data?.error ||
      `API ${path} lỗi ${res.status}`

    throw new Error(msg)
  }

  return data
}

async function requestMany(paths) {
  let lastError = null

  for (const path of paths) {
    try {
      return await requestOne(path)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Không gọi được API.')
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.result)) return data.result
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [
      recordRes,
      fineRes,
      copyRes,
      readerRes,
      bookRes,
    ] = await Promise.allSettled([
      requestMany([
        '/api/borrow-records',
        '/api/circulation/borrow-records',
        '/api/circulation/history',
      ]),
      requestMany([
        '/api/fines',
        '/api/circulation/fines',
      ]),
      requestMany([
        '/api/copies',
        '/api/book-copies',
        '/api/catalog/copies',
      ]),
      requestMany([
        '/api/readers',
        '/api/users/readers',
        '/api/identity/readers',
      ]),
      requestMany([
        '/api/books',
        '/api/catalog/books',
      ]),
    ])

    records.value =
      recordRes.status === 'fulfilled'
        ? toArray(recordRes.value).map(normalizeRecord)
        : []

    fines.value =
      fineRes.status === 'fulfilled'
        ? toArray(fineRes.value).map(normalizeFine)
        : []

    copies.value =
      copyRes.status === 'fulfilled'
        ? toArray(copyRes.value).map(normalizeCopy)
        : []

    readers.value =
      readerRes.status === 'fulfilled'
        ? toArray(readerRes.value)
        : []

    books.value =
      bookRes.status === 'fulfilled'
        ? toArray(bookRes.value)
        : []

    if (
      recordRes.status === 'rejected' &&
      fineRes.status === 'rejected' &&
      copyRes.status === 'rejected'
    ) {
      throw new Error('Không lấy được dữ liệu dashboard từ API Gateway.')
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Không tải được dữ liệu tổng quan.'
  } finally {
    loading.value = false
  }
}

function firstValue(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key]
    }
  }

  return fallback
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeRecord(item = {}) {
  const book = item.book || item.Book || {}

  return {
    ...item,
    id: firstValue(item, ['id', 'Id', 'loanId', 'LoanId']),
    bookTitle:
      firstValue(item, ['bookTitle', 'BookTitle', 'title', 'Title']) ||
      firstValue(book, ['title', 'Title']),
    readerName: firstValue(item, ['readerName', 'ReaderName', 'fullName', 'FullName']),
    cardNumber: firstValue(item, ['cardNumber', 'CardNumber']),
    copyCode: firstValue(item, ['copyCode', 'CopyCode', 'barcode', 'Barcode']),
    borrowDate: firstValue(item, ['borrowDate', 'BorrowDate', 'borrowedAt', 'BorrowedAt', 'createdAt', 'CreatedAt']),
    dueDate: firstValue(item, ['dueDate', 'DueDate']),
    returnDate: firstValue(item, ['returnDate', 'ReturnDate', 'returnedAt', 'ReturnedAt']),
    status: firstValue(item, ['status', 'Status'], 'Borrowed'),
    fine: Number(firstValue(item, ['fine', 'Fine', 'fineAmount', 'FineAmount', 'estimatedFine', 'EstimatedFine'], 0)),
    renewCount: Number(firstValue(item, ['renewCount', 'RenewCount'], 0)),
  }
}

function normalizeFine(item = {}) {
  return {
    ...item,
    id: firstValue(item, ['id', 'Id']),
    amount: Number(firstValue(item, ['amount', 'Amount', 'fineAmount', 'FineAmount', 'totalAmount', 'TotalAmount'], 0)),
    status: firstValue(item, ['status', 'Status'], 'Unpaid'),
  }
}

function normalizeCopy(item = {}) {
  return {
    ...item,
    id: firstValue(item, ['id', 'Id', 'copyId', 'CopyId']),
    status: firstValue(item, ['status', 'Status', 'borrowStatus', 'BorrowStatus'], ''),
    condition: firstValue(item, ['condition', 'Condition'], ''),
  }
}

function isReturned(record) {
  const status = normalizeText(record?.status)

  return (
    status.includes('return') ||
    status.includes('tra') ||
    status.includes('returned') ||
    Boolean(record?.returnDate)
  )
}

function isBorrowing(record) {
  if (isReturned(record)) return false

  const status = normalizeText(record?.status)

  return (
    !status ||
    status.includes('borrow') ||
    status.includes('dang muon') ||
    status.includes('pending') ||
    status.includes('approved')
  )
}

function isOverdue(record) {
  if (!record?.dueDate || isReturned(record)) return false

  const due = new Date(record.dueDate)

  if (Number.isNaN(due.getTime())) return false

  due.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return due.getTime() < today.getTime()
}

function isFineUnpaid(fine) {
  const status = normalizeText(fine?.status)

  return (
    !status.includes('paid') &&
    !status.includes('da thanh toan') &&
    !status.includes('closed')
  )
}

function getFineAmount(record) {
  return Number(record?.fine || record?.estimatedFine || record?.fineAmount || 0)
}

const stats = computed(() => {
  const borrowing = records.value.filter(isBorrowing).length
  const returned = records.value.filter(isReturned).length
  const overdue = records.value.filter(isOverdue).length
  const unpaidFine = fines.value
    .filter(isFineUnpaid)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  return {
    borrowing,
    returned,
    overdue,
    unpaidFine,
  }
})

const unpaidFineCount = computed(() => {
  return fines.value.filter(isFineUnpaid).length
})

const activeReaderCount = computed(() => {
  return readers.value.filter((reader) => {
    const status = normalizeText(reader.status || reader.Status || reader.cardStatus || reader.CardStatus)

    return (
      !status ||
      status.includes('active') ||
      status.includes('hoat dong') ||
      status === '1'
    )
  }).length
})

const copyStats = computed(() => {
  let available = 0
  let borrowed = 0
  let damaged = 0

  for (const copy of copies.value) {
    const status = normalizeText(copy.status)
    const condition = normalizeText(copy.condition)

    if (
      condition.includes('hong') ||
      condition.includes('mat') ||
      condition.includes('bao tri') ||
      status.includes('lost') ||
      status.includes('damaged') ||
      status.includes('maintenance')
    ) {
      damaged += 1
    } else if (
      status.includes('borrow') ||
      status.includes('dang muon') ||
      status.includes('loan')
    ) {
      borrowed += 1
    } else {
      available += 1
    }
  }

  return {
    available,
    borrowed,
    damaged,
  }
})

const weeklyChart = computed(() => {
  const result = []
  const today = new Date()

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const key = date.toISOString().slice(0, 10)

    result.push({
      key,
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      borrow: 0,
      returned: 0,
    })
  }

  for (const record of records.value) {
    const borrowKey = toDateKey(record.borrowDate)
    const returnKey = toDateKey(record.returnDate)

    const borrowItem = result.find((x) => x.key === borrowKey)
    if (borrowItem) borrowItem.borrow += 1

    const returnItem = result.find((x) => x.key === returnKey)
    if (returnItem) returnItem.returned += 1
  }

  return result
})

const maxChartValue = computed(() => {
  return Math.max(
    1,
    ...weeklyChart.value.map((item) => Math.max(item.borrow, item.returned)),
  )
})

function getBarHeight(value) {
  if (!value) return 8
  return Math.max(12, Math.round((value / maxChartValue.value) * 100))
}

function toDateKey(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

const topBorrowedBooks = computed(() => {
  const map = new Map()

  for (const record of records.value) {
    const title = record.bookTitle || record.title || 'Không rõ sách'
    map.set(title, (map.get(title) || 0) + 1)
  }

  return Array.from(map.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

const filteredRecords = computed(() => {
  const q = normalizeText(keyword.value)

  return records.value
    .filter((record) => {
      if (recordFilter.value === 'borrowing') return isBorrowing(record)
      if (recordFilter.value === 'returned') return isReturned(record)
      if (recordFilter.value === 'overdue') return isOverdue(record)

      return true
    })
    .filter((record) => {
      if (!q) return true

      const content = normalizeText(
        [
          record.bookTitle,
          record.readerName,
          record.cardNumber,
          record.copyCode,
          record.status,
        ].join(' '),
      )

      return content.includes(q)
    })
    .sort((a, b) => new Date(b.borrowDate || 0) - new Date(a.borrowDate || 0))
})

function getRecordStatusText(record) {
  if (isReturned(record)) return 'Đã trả'
  if (isOverdue(record)) return 'Quá hạn'

  const status = normalizeText(record.status)

  if (status.includes('pending')) return 'Chờ xử lý'
  if (status.includes('approved')) return 'Đã duyệt'

  return 'Đang mượn'
}

function getRecordTone(record) {
  if (isReturned(record)) return 'green'
  if (isOverdue(record)) return 'red'

  return 'blue'
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleDateString('vi-VN')
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.librarian-dashboard {
  padding: 28px;
  color: #0f172a;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-head h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.8px;
}

.page-head p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 16px;
}

.reload-btn {
  border: 0;
  background: #2563eb;
  color: white;
  border-radius: 14px;
  padding: 13px 18px;
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.22);
}

.reload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-error {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
}

.api-error button {
  margin-left: auto;
  border: 0;
  background: #be123c;
  color: white;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 800;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.stat-card,
.panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.stat-card {
  min-height: 132px;
  padding: 22px;
  display: flex;
  gap: 18px;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 28px;
}

.stat-icon.blue {
  color: #2563eb;
  background: #eff6ff;
}

.stat-icon.green {
  color: #16a34a;
  background: #f0fdf4;
}

.stat-icon.red {
  color: #ef4444;
  background: #fef2f2;
}

.stat-icon.purple {
  color: #7c3aed;
  background: #f5f3ff;
}

.stat-card span {
  display: block;
  color: #64748b;
  font-weight: 800;
}

.stat-card b {
  display: block;
  margin: 7px 0;
  font-size: 32px;
  line-height: 1;
  font-weight: 900;
}

.stat-card small {
  color: #16a34a;
  font-weight: 800;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.dashboard-grid.lower {
  grid-template-columns: 1fr 1fr;
}

.panel {
  padding: 22px;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 18px;
}

.panel-title h2 {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.panel-title span {
  color: #64748b;
  font-weight: 700;
}

.bar-chart {
  height: 210px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: end;
  gap: 12px;
  padding: 18px 6px 0;
  border-bottom: 1px solid #e2e8f0;
}

.bar-item {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 8px;
  text-align: center;
}

.bar-box {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
}

.bar {
  width: 18px;
  border-radius: 8px 8px 0 0;
  min-height: 8px;
}

.bar.borrow {
  background: #2563eb;
}

.bar.return {
  background: #16a34a;
}

.bar-item small {
  color: #64748b;
  font-weight: 700;
}

.legend {
  display: flex;
  gap: 18px;
  margin-top: 14px;
  color: #475569;
  font-weight: 800;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.dot.blue {
  background: #2563eb;
}

.dot.green {
  background: #16a34a;
}

.copy-status-list {
  display: grid;
  gap: 0;
}

.copy-status-list div {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.copy-status-list div:last-child {
  border-bottom: 0;
}

.copy-status-list b {
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
}

.top-books {
  display: grid;
  gap: 12px;
}

.top-book-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 13px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.top-book-row > b {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #2563eb;
  background: #eff6ff;
}

.top-book-row strong,
.top-book-row small {
  display: block;
}

.top-book-row small {
  margin-top: 4px;
  color: #64748b;
}

.notice-list {
  display: grid;
  gap: 0;
}

.notice-row {
  width: 100%;
  min-height: 58px;
  border: 0;
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 16px;
  font-weight: 750;
  text-align: left;
}

.notice-row:last-child {
  border-bottom: 0;
}

.notice-row b {
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
}

.table-panel {
  margin-bottom: 28px;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.table-actions input,
.table-actions select {
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 13px;
  padding: 0 12px;
  outline: 0;
  color: #0f172a;
  font-weight: 650;
}

.table-actions input {
  min-width: 280px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

th {
  color: #334155;
  font-size: 13px;
  font-weight: 900;
  text-align: left;
  padding: 13px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

td {
  color: #1e293b;
  padding: 14px 10px;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
}

td b,
td small {
  display: block;
}

td b {
  color: #0f172a;
  font-weight: 850;
}

td small {
  margin-top: 4px;
  color: #64748b;
}

.danger {
  color: #dc2626 !important;
  font-weight: 850;
}

.status-badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 850;
}

.status-badge.blue {
  color: #2563eb;
  background: #eff6ff;
}

.status-badge.green {
  color: #16a34a;
  background: #f0fdf4;
}

.status-badge.red {
  color: #dc2626;
  background: #fef2f2;
}

.empty-box {
  min-height: 120px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: #f8fafc;
  color: #64748b;
  display: grid;
  place-items: center;
  text-align: center;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .stat-grid,
  .dashboard-grid,
  .dashboard-grid.lower {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .librarian-dashboard {
    padding: 18px;
  }

  .page-head,
  .panel-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-grid,
  .dashboard-grid,
  .dashboard-grid.lower {
    grid-template-columns: 1fr;
  }

  .table-actions {
    width: 100%;
    flex-direction: column;
  }

  .table-actions input,
  .table-actions select {
    width: 100%;
    min-width: 0;
  }
}
</style>