<template>
  <PageHeader title="Chi tiết sách" subtitle="Dữ liệu chi tiết lấy trực tiếp từ Catalog Service" breadcrumb="Sách › Chi tiết sách">
    <div class="btn-row">
      <RouterLink to="/books" class="ghost-btn"><v-icon icon="mdi-arrow-left" /> Quay lại</RouterLink>
      <button class="ghost-btn" @click="loadData"><v-icon icon="mdi-refresh" /> Làm mới</button>
    </div>
  </PageHeader>

  <p v-if="error" class="alert error-alert"><v-icon icon="mdi-alert-circle-outline" /> {{ error }}</p>

  <div v-if="book" class="two-column" style="margin-bottom:18px">
    <div class="card card-pad">
      <div class="detail-hero">
        <img :src="book.cover" class="cover-large" alt="Bìa sách" />
        <div>
          <div class="btn-row" style="justify-content:space-between;margin-bottom:10px">
            <h2 style="font-size:32px;margin:0">{{ book.title }}</h2>
            <StatusBadge :text="availability.canBorrow ? 'Có thể mượn' : 'Hết bản sẵn sàng'" />
          </div>
          <p style="color:#64748b;font-size:16px;margin-bottom:18px">{{ book.subtitle || 'Chưa có mô tả ngắn.' }}</p>
          <div class="grid grid-3">
            <div class="kv"><span class="key">ISBN</span><b>{{ book.isbn || '-' }}</b></div>
            <div class="kv"><span class="key">Tác giả</span><b>{{ book.author }}</b></div>
            <div class="kv"><span class="key">Thể loại</span><b>{{ book.category }}</b></div>
            <div class="kv"><span class="key">NXB</span><b>{{ book.publisher }}</b></div>
            <div class="kv"><span class="key">Năm XB</span><b>{{ book.year || '-' }}</b></div>
            <div class="kv"><span class="key">Trạng thái</span><b>{{ book.status }}</b></div>
          </div>
          <h3 class="section-title" style="margin-top:24px">Tóm tắt nội dung</h3>
          <p style="line-height:1.8;color:#334155">{{ book.raw?.description || 'Thông tin mô tả sách đang được cập nhật.' }}</p>
          <div class="btn-row" style="margin-top:22px">
            <RouterLink to="/books" class="ghost-btn"><v-icon icon="mdi-arrow-left" /> Quay lại</RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card card-pad">
        <h3 class="section-title">Tổng quan bản sao</h3>
        <div class="copy-stats">
          <div class="copy-total">
            <b>{{ totalCopies }}</b>
            <span>bản sao</span>
          </div>
          <div class="grid">
            <div class="row-between"><span>Tổng số</span><b>{{ totalCopies }}</b></div>
            <div class="row-between"><span>Sẵn sàng</span><b style="color:#16a34a">{{ availableCopies }}</b></div>
            <div class="row-between"><span>Đang được mượn</span><b>{{ borrowedCopies }}</b></div>
            <div class="row-between"><span>Không sẵn sàng</span><b style="color:#ef4444">{{ unavailableCopies }}</b></div>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <h3 class="section-title">Lịch sử cập nhật</h3>
        <div v-if="history.length">
          <div v-for="item in history" :key="item.id || item.createdAt" class="activity-row">
            <span class="log-dot badge blue"><v-icon icon="mdi-history" /></span>
            <div><b>{{ item.eventType || item.action || 'Cập nhật' }}</b><br><span>{{ item.description || item.targetType || '-' }}</span><br><small>{{ formatDate(item.createdAt || item.occurredAt, true) }}</small></div>
          </div>
        </div>
        <div v-else class="empty-state">Chưa có lịch sử cập nhật.</div>
      </div>
    </div>
  </div>

  <div v-if="book" class="card">
    <div class="tabs"><span class="tab active">Bản sao</span></div>
    <div class="card-pad" style="display:flex;justify-content:space-between;gap:12px;align-items:center">
      <input v-model.trim="copyKeyword" class="input" style="max-width:340px" placeholder="Tìm kiếm bản sao..." />
      <RouterLink to="/copies" class="primary-btn"><v-icon icon="mdi-package-variant" /> Quản lý bản sao</RouterLink>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Mã bản sao</th><th>Vị trí kệ</th><th>Tình trạng</th><th>Trạng thái mượn</th><th>Ngày nhập</th><th>Cập nhật gần nhất</th><th>Ghi chú</th></tr>
        </thead>
        <tbody>
          <tr v-for="(copy, i) in filteredCopies" :key="copy.id">
            <td>{{ i + 1 }}</td>
            <td><b>{{ copy.code }}</b></td>
            <td>{{ copy.location || '-' }}</td>
            <td><StatusBadge :text="copy.condition" /></td>
            <td>{{ copy.borrowStatus }}</td>
            <td>{{ copy.createdAt || '-' }}</td>
            <td>{{ copy.updatedAt || '-' }}</td>
            <td>{{ copy.note || '-' }}</td>
          </tr>
          <tr v-if="!filteredCopies.length"><td colspan="8" class="empty-cell">Không có bản sao phù hợp.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { catalogApi, getErrorMessage, unwrap, toArray } from '../services/api'
import { formatDate, mapBook, mapCopy } from '../services/adapters'

const route = useRoute()
const book = ref(null)
const copies = ref([])
const history = ref([])
const availability = ref({})
const error = ref('')
const copyKeyword = ref('')

const totalCopies = computed(() => Number(availability.value.totalCopies ?? copies.value.length ?? 0))
const availableCopies = computed(() => Number(availability.value.availableCopies ?? copies.value.filter((x) => x.borrowStatus === 'Có thể mượn').length))
const borrowedCopies = computed(() => Number(availability.value.borrowedCopies ?? copies.value.filter((x) => x.borrowStatus === 'Đang được mượn').length))
const unavailableCopies = computed(() => Math.max(0, totalCopies.value - availableCopies.value - borrowedCopies.value))
const filteredCopies = computed(() => {
  const keyword = copyKeyword.value.toLowerCase()
  if (!keyword) return copies.value
  return copies.value.filter((copy) => [copy.code, copy.location, copy.condition, copy.borrowStatus].join(' ').toLowerCase().includes(keyword))
})

async function loadData() {
  try {
    error.value = ''
    const id = route.params.id
    const [bookRes, copiesRes, availabilityRes, historyRes] = await Promise.allSettled([
      catalogApi.book(id),
      catalogApi.bookCopies(id),
      catalogApi.bookAvailability(id),
      catalogApi.bookHistory(id)
    ])

    if (bookRes.status === 'fulfilled') book.value = mapBook(unwrap(bookRes.value))
    else throw bookRes.reason

    copies.value = copiesRes.status === 'fulfilled' ? toArray(unwrap(copiesRes.value)).map(mapCopy) : []
    availability.value = availabilityRes.status === 'fulfilled' ? unwrap(availabilityRes.value) || {} : {}
    history.value = historyRes.status === 'fulfilled' ? toArray(unwrap(historyRes.value)) : []
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được chi tiết sách từ API.')
  }
}

onMounted(loadData)
</script>

<style scoped>
.copy-stats {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 18px;
  align-items: center;
}
.copy-total {
  height: 140px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: grid;
  place-items: center;
  text-align: center;
}
.copy-total b {
  font-size: 34px;
  line-height: 1;
}
.copy-total span {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-top: 6px;
}
.row-between {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eef2f7;
  padding: 9px 0;
}
.activity-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
}
.activity-row span,
.activity-row small {
  color: #64748b;
}
</style>
