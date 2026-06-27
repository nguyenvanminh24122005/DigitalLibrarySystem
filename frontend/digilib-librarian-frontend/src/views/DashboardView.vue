<template>
  <div>
    <div class="page-head"><div><h1>Tổng quan nghiệp vụ</h1><p>Dữ liệu lấy trực tiếp từ Catalog, Identity và Circulation API</p></div></div>
    <div v-if="error" class="alert error">{{ error }}</div>
    <div class="grid grid-4">
      <div class="card stat"><div class="stat-icon blue"><i class="mdi mdi-book-open-variant"></i></div><div><div class="stat-label">Đang mượn</div><div class="stat-value">{{ borrowing }}</div><div class="stat-note">Phiếu chưa trả</div></div></div>
      <div class="card stat"><div class="stat-icon green"><i class="mdi mdi-book-check-outline"></i></div><div><div class="stat-label">Đã trả</div><div class="stat-value">{{ returned }}</div><div class="stat-note">Tổng phiếu hoàn tất</div></div></div>
      <div class="card stat"><div class="stat-icon red"><i class="mdi mdi-clock-alert-outline"></i></div><div><div class="stat-label">Quá hạn</div><div class="stat-value">{{ overdue.length }}</div><div class="stat-note" style="color:#ef4444">Cần xử lý</div></div></div>
      <div class="card stat"><div class="stat-icon purple"><i class="mdi mdi-cash-multiple"></i></div><div><div class="stat-label">Phí chưa thu</div><div class="stat-value">{{ formatMoney(unpaidFine) }}</div><div class="stat-note">Từ API phí phạt</div></div></div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card pad">
        <h2 class="section-title">Biểu đồ mượn - trả 7 ngày gần đây</h2>
        <div v-if="tickets.length" class="chart-bars">
          <div v-for="d in chart" :key="d.day" class="bar" :title="`${d.day}: ${d.count}`" :style="{height: Math.max(8, d.count * 28) + 'px'}"></div>
        </div>
        <div v-else class="empty">Chưa có giao dịch mượn trả.</div>
      </div>
      <div class="card pad">
        <h2 class="section-title">Tỷ lệ tình trạng bản sao</h2>
        <div class="info-list">
          <div class="info-row"><span>Sẵn sàng</span><b>{{ availableCopies }}</b></div>
          <div class="info-row"><span>Đang mượn</span><b>{{ borrowedCopies }}</b></div>
          <div class="info-row"><span>Hư hỏng / mất / bảo trì</span><b>{{ unavailableCopies }}</b></div>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card pad">
        <h2 class="section-title">Sách được mượn nhiều</h2>
        <div class="table-wrap"><table><thead><tr><th>#</th><th>Sách</th><th>Số lượt</th></tr></thead><tbody><tr v-for="(b,i) in topBooks" :key="b.title"><td>{{ i+1 }}</td><td>{{ b.title }}</td><td>{{ b.count }}</td></tr><tr v-if="!topBooks.length"><td colspan="3" class="empty">Chưa có dữ liệu.</td></tr></tbody></table></div>
      </div>
      <div class="card pad">
        <h2 class="section-title">Thông báo cần xử lý</h2>
        <div class="info-list">
          <div class="info-row"><span>Sách quá hạn</span><b>{{ overdue.length }}</b></div>
          <div class="info-row"><span>Phí phạt chưa thu</span><b>{{ unpaidFines.length }}</b></div>
          <div class="info-row"><span>Độc giả đang hoạt động</span><b>{{ readers.length }}</b></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { catalogApi, circulationApi, identityApi, dataOf, getErrorMessage, formatMoney } from '../services/api'
const error = ref('')
const tickets = ref([]), overdue = ref([]), fines = ref([]), copies = ref([]), readers = ref([])
const borrowing = computed(() => tickets.value.filter(t => Number(t.status) === 1 || t.status === 'Borrowing').length)
const returned = computed(() => tickets.value.filter(t => Number(t.status) === 2 || t.status === 'Returned').length)
const unpaidFines = computed(() => fines.value.filter(f => Number(f.status) !== 3 && f.status !== 'Paid'))
const unpaidFine = computed(() => unpaidFines.value.reduce((s, f) => s + Number(f.remainingAmount || 0), 0))
const availableCopies = computed(() => copies.value.filter(c => Number(c.borrowStatus) === 1 || c.borrowStatus === 'Available').length)
const borrowedCopies = computed(() => copies.value.filter(c => Number(c.borrowStatus) === 2 || c.borrowStatus === 'Borrowed').length)
const unavailableCopies = computed(() => Math.max(0, copies.value.length - availableCopies.value - borrowedCopies.value))
const topBooks = computed(() => {
  const map = new Map()
  tickets.value.flatMap(t => t.items || []).forEach(i => map.set(i.bookTitle, (map.get(i.bookTitle) || 0) + 1))
  return [...map.entries()].map(([title, count]) => ({ title, count })).sort((a,b)=>b.count-a.count).slice(0,5)
})
const chart = computed(() => {
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6-i)); return d })
  return days.map(d => ({ day: d.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }), count: tickets.value.filter(t => new Date(t.borrowDate || t.createdAt).toDateString() === d.toDateString()).length }))
})
onMounted(async () => {
  try {
    const [t,o,f,c,r] = await Promise.all([circulationApi.tickets(), circulationApi.overdue(), circulationApi.fines(), catalogApi.copies(), identityApi.readers()])
    tickets.value = dataOf(t); overdue.value = dataOf(o); fines.value = dataOf(f); copies.value = dataOf(c); readers.value = dataOf(r)
  } catch(e) { error.value = getErrorMessage(e, 'Không tải được dữ liệu tổng quan.') }
})
</script>
