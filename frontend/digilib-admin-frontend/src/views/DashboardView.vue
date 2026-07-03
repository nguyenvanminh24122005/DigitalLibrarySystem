<template>
  <PageHeader title="Tổng quan hệ thống" subtitle="Dữ liệu lấy trực tiếp từ Catalog, Identity & Circulation API" />

  <div v-if="error" class="alert error-alert" style="margin-bottom:16px">
    <v-icon icon="mdi-alert-circle-outline" /> {{ error }}
  </div>

  <div class="grid grid-5" style="margin-bottom:18px">
    <StatCard label="Tổng số sách" :value="formatNumber(stats.totalBooks)" trend="API" icon="mdi-book-open-page-variant" />
    <StatCard label="Tổng số bản sao" :value="formatNumber(stats.totalCopies)" trend="API" icon="mdi-database-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Tổng số độc giả" :value="formatNumber(stats.totalReaders)" trend="API" icon="mdi-account-group-outline" color="#7c3aed" bg="#f5f3ff" />
    <StatCard label="Đang mượn" :value="formatNumber(stats.borrowing)" trend="API" icon="mdi-book-sync-outline" color="#f59e0b" bg="#fffbeb" />
    <StatCard label="Sách quá hạn" :value="formatNumber(stats.overdue)" trend="API" icon="mdi-clock-alert-outline" color="#ef4444" bg="#fef2f2" down />
  </div>

  <div class="two-column" style="margin-bottom:18px">
    <div class="card card-pad">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 class="section-title">Biểu đồ lượt mượn - trả trong 30 ngày</h3>
        <button class="ghost-btn" :disabled="loading">{{ loading ? 'Đang tải...' : '30 ngày' }} <v-icon icon="mdi-chevron-down" /></button>
      </div>
      <div style="display:flex;gap:24px;color:#475569;font-weight:700;font-size:14px;margin-left:12px">
        <span><span style="display:inline-block;width:11px;height:11px;background:#2563eb;border-radius:99px"></span> Lượt mượn</span>
        <span><span style="display:inline-block;width:11px;height:11px;background:#16a34a;border-radius:99px"></span> Lượt trả</span>
      </div>
      <div class="live-chart">
        <svg viewBox="0 0 900 260" preserveAspectRatio="none">
          <line v-for="y in [40, 90, 140, 190, 240]" :key="y" x1="30" :y1="y" x2="880" :y2="y" stroke="#e5e7eb" />
          <polyline :points="borrowPolyline" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <polyline :points="returnPolyline" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="p in chartPoints.borrow" :key="'b'+p.x" :cx="p.x" :cy="p.y" r="4" fill="#2563eb" />
          <circle v-for="p in chartPoints.return" :key="'r'+p.x" :cx="p.x" :cy="p.y" r="4" fill="#16a34a" />
        </svg>
        <div class="chart-axis">
          <span>{{ dailyLabels[0] || '--' }}</span>
          <span>{{ dailyLabels[Math.floor(dailyLabels.length / 2)] || '--' }}</span>
          <span>{{ dailyLabels[dailyLabels.length - 1] || '--' }}</span>
        </div>
      </div>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Tỷ lệ tình trạng bản sao</h3>
      <div style="display:grid;grid-template-columns:190px 1fr;align-items:center;gap:14px">
        <div class="donut" :style="donutStyle"><div class="donut-label">{{ formatNumber(stats.totalCopies) }}<br><span style="font-size:12px;color:#64748b">bản sao</span></div></div>
        <div style="display:grid;gap:16px">
          <div style="display:flex;justify-content:space-between"><span>Sẵn sàng</span><b>{{ formatNumber(stats.availableCopies) }} ({{ percent(stats.availableCopies, stats.totalCopies) }}%)</b></div>
          <div style="display:flex;justify-content:space-between"><span>Đang được mượn</span><b>{{ formatNumber(stats.borrowedCopies) }} ({{ percent(stats.borrowedCopies, stats.totalCopies) }}%)</b></div>
          <div style="display:flex;justify-content:space-between"><span>Hư hỏng / mất</span><b>{{ formatNumber(stats.problemCopies) }} ({{ percent(stats.problemCopies, stats.totalCopies) }}%)</b></div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-3">
    <div class="card card-pad">
      <h3 class="section-title">Top sách được mượn nhiều nhất</h3>
      <table>
        <tbody>
          <tr v-for="(book, index) in topBooks" :key="book.name">
            <td style="width:34px;font-weight:800">{{ index + 1 }}</td>
            <td><b>{{ book.name }}</b><br><span style="color:#64748b">Từ phiếu mượn</span></td>
            <td style="text-align:right;font-weight:800">{{ book.value }}</td>
          </tr>
          <tr v-if="!topBooks.length"><td colspan="3" class="empty-cell">Chưa có dữ liệu mượn sách</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Top độc giả mượn nhiều nhất</h3>
      <table>
        <tbody>
          <tr v-for="reader in topReaders" :key="reader.name">
            <td><div class="avatar-fallback" style="width:34px;height:34px">{{ reader.name?.[0] || 'Đ' }}</div></td>
            <td><b>{{ reader.name }}</b><br><span style="color:#64748b">{{ reader.code || 'Độc giả' }}</span></td>
            <td style="text-align:right;font-weight:800">{{ reader.value }}</td>
          </tr>
          <tr v-if="!topReaders.length"><td colspan="3" class="empty-cell">Chưa có dữ liệu độc giả</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Hoạt động gần đây</h3>
      <div v-for="item in activities" :key="item.id || item.text" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eef2f7">
        <span class="log-dot badge blue"><v-icon :icon="item.icon" /></span>
        <div><b>{{ item.text }}</b><br><span style="color:#64748b;font-size:13px">{{ item.time }}</span></div>
      </div>
      <div v-if="!activities.length" class="empty-cell">Chưa có nhật ký hệ thống</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import { catalogApi, circulationApi, getErrorMessage, identityApi, toArray } from '../services/api'

const loading = ref(false)
const error = ref('')
const books = ref([])
const copies = ref([])
const readers = ref([])
const tickets = ref([])
const overdueTickets = ref([])
const logs = ref([])

const stats = reactive({
  totalBooks: 0,
  totalCopies: 0,
  totalReaders: 0,
  borrowing: 0,
  overdue: 0,
  availableCopies: 0,
  borrowedCopies: 0,
  problemCopies: 0
})

function normalizeStatus(value) {
  return String(value ?? '').trim().toLowerCase()
}
function isBorrowed(status) {
  const text = normalizeStatus(status)
  return text === '2' || text === 'borrowed' || text.includes('đang') || text.includes('dang')
}
function isReturned(status) {
  const text = normalizeStatus(status)
  return text === 'returned' || text.includes('trả') || text.includes('tra')
}
function isAvailable(status) {
  const text = normalizeStatus(status)
  return text === '1' || text === 'available' || text.includes('sẵn') || text.includes('san') || text.includes('có thể') || text.includes('co the')
}
function isProblemCopy(copy) {
  const status = normalizeStatus(copy.status ?? copy.Status ?? copy.borrowStatus ?? copy.BorrowStatus)
  const condition = normalizeStatus(copy.condition ?? copy.Condition)
  return status.includes('lost') || status.includes('damaged') || condition.includes('mất') || condition.includes('mat') || condition.includes('hỏng') || condition.includes('hong')
}
function ticketStatus(ticket) {
  return ticket.status ?? ticket.Status
}
function dateOfTicket(ticket) {
  return ticket.borrowDate ?? ticket.BorrowDate ?? ticket.createdAt ?? ticket.CreatedAt
}
function returnDateOfTicket(ticket) {
  return ticket.returnDate ?? ticket.ReturnDate
}
function bookTitleOfTicket(ticket) {
  return ticket.bookTitle ?? ticket.BookTitle ?? 'Không rõ sách'
}
function readerNameOfTicket(ticket) {
  return ticket.readerName ?? ticket.ReaderName ?? 'Không rõ độc giả'
}
function readerCodeOfTicket(ticket) {
  return ticket.cardNumber ?? ticket.CardNumber ?? ticket.readerCode ?? ticket.ReaderCode ?? ''
}
function formatNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN')
}
function percent(value, total) {
  if (!total) return 0
  return Math.round((Number(value || 0) / Number(total)) * 100)
}
function topFromMap(map, limit = 5) {
  return [...map.entries()].sort((a, b) => b[1].value - a[1].value).slice(0, limit).map(([, value]) => value)
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const topBooks = computed(() => {
  const map = new Map()
  tickets.value.forEach(ticket => {
    const name = bookTitleOfTicket(ticket)
    const current = map.get(name) || { name, value: 0 }
    current.value += 1
    map.set(name, current)
  })
  return topFromMap(map)
})

const topReaders = computed(() => {
  const map = new Map()
  tickets.value.forEach(ticket => {
    const name = readerNameOfTicket(ticket)
    const code = readerCodeOfTicket(ticket)
    const current = map.get(name) || { name, code, value: 0 }
    current.value += 1
    map.set(name, current)
  })
  return topFromMap(map)
})

const dailySeries = computed(() => {
  const today = new Date()
  return Array.from({ length: 30 }, (_, index) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 29 + index)
    const borrowCount = tickets.value.filter(ticket => {
      const date = new Date(dateOfTicket(ticket))
      return !Number.isNaN(date.getTime()) && sameDay(date, d)
    }).length
    const returnCount = tickets.value.filter(ticket => {
      const raw = returnDateOfTicket(ticket)
      if (!raw && !isReturned(ticketStatus(ticket))) return false
      const date = new Date(raw || dateOfTicket(ticket))
      return !Number.isNaN(date.getTime()) && sameDay(date, d)
    }).length
    return { label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), borrowCount, returnCount }
  })
})

const dailyLabels = computed(() => dailySeries.value.map(x => x.label))
const chartPoints = computed(() => {
  const maxValue = Math.max(1, ...dailySeries.value.flatMap(x => [x.borrowCount, x.returnCount]))
  const width = 850
  const left = 30
  const top = 30
  const height = 205
  const step = dailySeries.value.length > 1 ? width / (dailySeries.value.length - 1) : width
  const toPoint = (value, index) => ({ x: left + step * index, y: top + height - (value / maxValue) * height })
  return {
    borrow: dailySeries.value.map((x, i) => toPoint(x.borrowCount, i)),
    return: dailySeries.value.map((x, i) => toPoint(x.returnCount, i))
  }
})
const borrowPolyline = computed(() => chartPoints.value.borrow.map(p => `${p.x},${p.y}`).join(' '))
const returnPolyline = computed(() => chartPoints.value.return.map(p => `${p.x},${p.y}`).join(' '))

const donutStyle = computed(() => {
  const total = Math.max(stats.totalCopies, 1)
  const ready = (stats.availableCopies / total) * 100
  const borrowed = (stats.borrowedCopies / total) * 100
  return {
    background: `conic-gradient(#16a34a 0 ${ready}%, #2563eb ${ready}% ${ready + borrowed}%, #f59e0b ${ready + borrowed}% 100%)`
  }
})

const activities = computed(() => logs.value.slice(0, 6).map(log => ({
  id: log.id ?? log.Id,
  icon: 'mdi-history',
  text: log.description ?? log.Description ?? log.action ?? log.Action ?? 'Cập nhật hệ thống',
  time: log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : ''
})))

onMounted(loadDashboard)

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    const results = await Promise.allSettled([
      catalogApi.books(),
      catalogApi.copies(),
      identityApi.readers(),
      circulationApi.borrowTickets(),
      circulationApi.overdue(),
      identityApi.logs({ take: 10 })
    ])

    const catalogBooks = results[0].status === 'fulfilled' ? toArray(results[0].value.data) : []
    let catalogCopies = results[1].status === 'fulfilled' ? toArray(results[1].value.data) : []
    if (!catalogCopies.length) {
      catalogCopies = catalogBooks.flatMap(book => toArray(book.copies ?? book.Copies))
    }

    books.value = catalogBooks
    copies.value = catalogCopies
    readers.value = results[2].status === 'fulfilled' ? toArray(results[2].value.data) : []
    tickets.value = results[3].status === 'fulfilled' ? toArray(results[3].value.data) : []
    overdueTickets.value = results[4].status === 'fulfilled' ? toArray(results[4].value.data) : []
    logs.value = results[5].status === 'fulfilled' ? toArray(results[5].value.data) : []

    stats.totalBooks = books.value.length
    stats.totalCopies = copies.value.length
    stats.totalReaders = readers.value.length
    stats.borrowedCopies = copies.value.filter(copy => isBorrowed(copy.status ?? copy.Status ?? copy.borrowStatus ?? copy.BorrowStatus)).length
    stats.availableCopies = copies.value.filter(copy => isAvailable(copy.status ?? copy.Status ?? copy.borrowStatus ?? copy.BorrowStatus) && !isProblemCopy(copy)).length
    stats.problemCopies = copies.value.filter(isProblemCopy).length
    stats.borrowing = tickets.value.filter(ticket => isBorrowed(ticketStatus(ticket))).length || stats.borrowedCopies
    stats.overdue = overdueTickets.value.length
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được dữ liệu tổng quan.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.live-chart { margin-top: 12px; height: 300px; }
.live-chart svg { width: 100%; height: 260px; }
.chart-axis { display: flex; justify-content: space-between; padding: 0 20px; color: #64748b; font-weight: 700; }
.donut { width: 160px; height: 160px; border-radius: 999px; display: grid; place-items: center; }
.donut::before { content: ''; width: 92px; height: 92px; border-radius: 999px; background: white; position: absolute; }
.donut-label { position: relative; text-align: center; font-weight: 900; color: #0f172a; }
.empty-cell { color: #64748b; text-align: center; padding: 20px; }
</style>
