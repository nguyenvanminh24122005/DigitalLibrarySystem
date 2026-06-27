<template>
  <PageHeader title="Báo cáo thống kê" subtitle="Tổng hợp dữ liệu thật từ Catalog, Circulation và Identity Service" breadcrumb="Báo cáo thống kê">
    <div class="btn-row">
      <button class="ghost-btn" :disabled="loading" @click="loadData"><v-icon icon="mdi-refresh" /> Làm mới</button>
      <button class="primary-btn" :disabled="loading" @click="syncEvents"><v-icon icon="mdi-sync" /> Đồng bộ events</button>
    </div>
  </PageHeader>

  <p v-if="error" class="alert error-alert"><v-icon icon="mdi-alert-circle-outline" /> {{ error }}</p>
  <p v-if="syncMessage" class="alert success-alert"><v-icon icon="mdi-check-circle-outline" /> {{ syncMessage }}</p>

  <div class="grid grid-5" style="margin-bottom:18px">
    <StatCard label="Tổng số sách" :value="fmt(overview.totalBooks)" icon="mdi-book-open-page-variant" />
    <StatCard label="Tổng số bản sao" :value="fmt(overview.totalCopies)" icon="mdi-database-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Độc giả hoạt động" :value="fmt(overview.activeReaders)" icon="mdi-account-group-outline" color="#7c3aed" bg="#f5f3ff" />
    <StatCard label="Lượt mượn tháng này" :value="fmt(overview.borrowCountThisMonth)" icon="mdi-book-sync-outline" color="#f59e0b" bg="#fffbeb" />
    <StatCard label="Sách quá hạn" :value="fmt(overview.overdueCount)" icon="mdi-clock-alert-outline" color="#ef4444" bg="#fef2f2" down />
  </div>

  <div class="grid grid-4" style="margin-bottom:18px">
    <StatCard label="Tổng tiền phạt" :value="money(revenueReport.totalFine)" icon="mdi-cash-multiple" color="#ef4444" bg="#fef2f2" />
    <StatCard label="Đã thu" :value="money(revenueReport.paidAmount)" icon="mdi-cash-check" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Còn nợ" :value="money(revenueReport.remainingAmount)" icon="mdi-cash-clock" color="#f97316" bg="#fff7ed" />
    <StatCard label="Phiếu phạt" :value="fmt(revenueReport.fineCount)" icon="mdi-receipt-text-outline" color="#7c3aed" bg="#f5f3ff" />
  </div>

  <div class="grid grid-2" style="margin-bottom:18px">
    <div class="card card-pad">
      <h3 class="section-title">Lượt mượn - trả trong 30 ngày</h3>
      <div v-if="daily.length" class="simple-chart">
        <div v-for="item in daily" :key="item.date" class="chart-col" :title="`${item.date}: mượn ${item.borrowCount}, trả ${item.returnCount}`">
          <span class="borrow" :style="{ height: barHeight(item.borrowCount, maxDaily) }"></span>
          <span class="return" :style="{ height: barHeight(item.returnCount, maxDaily) }"></span>
        </div>
      </div>
      <div v-else class="empty-state">Chưa có dữ liệu mượn/trả.</div>
      <div class="legend"><span><i class="borrow-dot"></i>Lượt mượn</span><span><i class="return-dot"></i>Lượt trả</span></div>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Doanh thu phí phạt theo ngày</h3>
      <div v-if="dailyRevenue.length" class="revenue-chart">
        <div v-for="item in dailyRevenue" :key="item.date" class="revenue-col" :title="`${item.date}: ${money(item.value)}`">
          <span :style="{ height: barHeight(item.value, maxRevenue) }"></span>
        </div>
      </div>
      <div v-else class="empty-state">Chưa có dữ liệu phí phạt.</div>
      <div class="legend"><span><i class="revenue-dot"></i>Tiền phạt đã thu</span></div>
    </div>
  </div>

  <div class="grid grid-2" style="margin-bottom:18px">
    <div class="card card-pad">
      <h3 class="section-title">Tình trạng bản sao</h3>
      <div v-if="bookStatus.length" class="status-list">
        <div v-for="item in bookStatus" :key="item.name">
          <div class="row-between"><span>{{ item.name }}</span><b>{{ fmt(item.value) }}</b></div>
          <div class="bar"><span :style="{ width: percent(item.value, totalStatus) + '%' }"></span></div>
        </div>
      </div>
      <div v-else class="empty-state">Chưa có dữ liệu bản sao.</div>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Thẻ thư viện</h3>
      <div class="status-list">
        <div><div class="row-between"><span>Tổng độc giả</span><b>{{ fmt(readersReport.totalReaders) }}</b></div><div class="bar"><span :style="{ width: '100%' }"></span></div></div>
        <div><div class="row-between"><span>Thẻ còn hiệu lực</span><b>{{ fmt(readersReport.validCards) }}</b></div><div class="bar green"><span :style="{ width: percent(readersReport.validCards, readersReport.totalReaders) + '%' }"></span></div></div>
        <div><div class="row-between"><span>Thẻ hết hạn</span><b>{{ fmt(readersReport.expiredCards) }}</b></div><div class="bar red"><span :style="{ width: percent(readersReport.expiredCards, readersReport.totalReaders) + '%' }"></span></div></div>
        <div><div class="row-between"><span>Độc giả bị khóa</span><b>{{ fmt(readersReport.lockedReaders) }}</b></div><div class="bar orange"><span :style="{ width: percent(readersReport.lockedReaders, readersReport.totalReaders) + '%' }"></span></div></div>
      </div>
    </div>
  </div>

  <div class="grid grid-3">
    <div class="card card-pad">
      <h3 class="section-title">Top sách được mượn nhiều nhất</h3>
      <table>
        <tbody>
          <tr v-for="(book, index) in topBooks" :key="book.name">
            <td>{{ index + 1 }}</td>
            <td><b>{{ book.name }}</b></td>
            <td style="text-align:right"><b>{{ fmt(book.value) }}</b></td>
          </tr>
          <tr v-if="!topBooks.length"><td colspan="3" class="empty-cell">Chưa có dữ liệu.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Top độc giả mượn nhiều nhất</h3>
      <table>
        <tbody>
          <tr v-for="(reader, index) in topReaders" :key="reader.name">
            <td>{{ index + 1 }}</td>
            <td><b>{{ reader.name }}</b></td>
            <td style="text-align:right"><b>{{ fmt(reader.value) }}</b></td>
          </tr>
          <tr v-if="!topReaders.length"><td colspan="3" class="empty-cell">Chưa có dữ liệu.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Tổng hợp báo cáo</h3>
      <p>Tổng sách: <b style="float:right;color:#2563eb">{{ fmt(booksReport.totalBooks) }}</b></p>
      <p>Bản sao có sẵn: <b style="float:right;color:#16a34a">{{ fmt(booksReport.availableCopies) }}</b></p>
      <p>Đang mượn: <b style="float:right">{{ fmt(booksReport.borrowedCopies) }}</b></p>
      <p>Tổng lượt mượn: <b style="float:right">{{ fmt(circulationReport.borrowCount) }}</b></p>
      <p>Lượt trả: <b style="float:right;color:#16a34a">{{ fmt(circulationReport.returnCount) }}</b></p>
      <p>Tiền phạt đã thu: <b style="float:right;color:#16a34a">{{ money(revenueReport.paidAmount) }}</b></p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import { identityApi, unwrap, getErrorMessage } from '../services/api'

const loading = ref(false)
const error = ref('')
const syncMessage = ref('')
const overview = ref({})
const booksReport = ref({})
const readersReport = ref({})
const circulationReport = ref({})
const revenueReport = ref({})

const daily = computed(() => overview.value.dailyBorrowReturns || overview.value.dailyBorrowreturns || [])
const dailyRevenue = computed(() => revenueReport.value.dailyRevenue || revenueReport.value.dailyRevenue || [])
const bookStatus = computed(() => overview.value.bookStatusRate || [])
const topBooks = computed(() => overview.value.topBooks || [])
const topReaders = computed(() => overview.value.topReaders || [])
const totalStatus = computed(() => bookStatus.value.reduce((sum, item) => sum + Number(item.value || 0), 0))
const maxDaily = computed(() => Math.max(1, ...daily.value.flatMap((x) => [x.borrowCount || 0, x.returnCount || 0])))
const maxRevenue = computed(() => Math.max(1, ...dailyRevenue.value.map((x) => Number(x.value || 0))))

function fmt(value) { return Number(value || 0).toLocaleString('vi-VN') }
function money(value) { return Number(value || 0).toLocaleString('vi-VN') + 'đ' }
function percent(value, total) { return total ? Math.round((Number(value || 0) / Number(total || 0)) * 100) : 0 }
function barHeight(value, max) { return `${Math.max(6, Math.round((Number(value || 0) / Number(max || 1)) * 160))}px` }

async function loadData() {
  try {
    loading.value = true
    error.value = ''
    syncMessage.value = ''
    const [overviewRes, booksRes, readersRes, circulationRes, revenueRes] = await Promise.all([
      identityApi.reports(),
      identityApi.booksReport(),
      identityApi.readersReport(),
      identityApi.circulationReport(),
      identityApi.revenueReport()
    ])
    overview.value = unwrap(overviewRes) || {}
    booksReport.value = unwrap(booksRes) || {}
    readersReport.value = unwrap(readersRes) || {}
    circulationReport.value = unwrap(circulationRes) || {}
    revenueReport.value = unwrap(revenueRes) || {}
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được báo cáo từ API.')
  } finally {
    loading.value = false
  }
}

async function syncEvents() {
  try {
    error.value = ''
    const res = await identityApi.syncReportEvents()
    const data = unwrap(res) || {}
    syncMessage.value = `Đã đồng bộ ${data.catalogEventsAdded || 0} event Catalog và ${data.circulationEventsAdded || 0} event Circulation.`
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Không đồng bộ được events báo cáo.')
  }
}

onMounted(loadData)
</script>

<style scoped>
.simple-chart,
.revenue-chart {
  height: 210px;
  display: flex;
  align-items: end;
  gap: 6px;
  border-bottom: 1px solid #e5e7eb;
  padding: 14px 4px 0;
}
.chart-col,
.revenue-col {
  flex: 1;
  min-width: 5px;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 2px;
}
.chart-col span,
.revenue-col span {
  width: 7px;
  border-radius: 999px 999px 0 0;
  display: block;
}
.chart-col .borrow { background: #2563eb; }
.chart-col .return { background: #16a34a; }
.revenue-col span { background: #f97316; }
.legend {
  display: flex;
  gap: 18px;
  color: #64748b;
  font-size: 13px;
  margin-top: 12px;
  font-weight: 700;
}
.legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.borrow-dot { background: #2563eb; }
.return-dot { background: #16a34a; }
.revenue-dot { background: #f97316; }
.status-list { display: grid; gap: 16px; }
.row-between { display: flex; justify-content: space-between; margin-bottom: 8px; }
.bar.green span { background: #16a34a; }
.bar.red span { background: #ef4444; }
.bar.orange span { background: #f97316; }
.success-alert {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  margin-bottom: 16px;
}
</style>
