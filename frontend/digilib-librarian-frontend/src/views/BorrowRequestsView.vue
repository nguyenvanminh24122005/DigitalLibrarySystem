<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Yêu cầu mượn sách</h1>
        <p>Duyệt các yêu cầu do độc giả gửi từ cổng người dùng trước khi tạo phiếu mượn chính thức.</p>
      </div>
      <button class="btn" :disabled="loading" @click="load">
        <i class="mdi mdi-refresh"></i>
        Làm mới
      </button>
    </div>

    <div v-if="error" class="alert error">
      <i class="mdi mdi-alert-circle-outline"></i>
      {{ error }}
    </div>

    <div v-if="success" class="alert success">
      <i class="mdi mdi-check-circle-outline"></i>
      {{ success }}
    </div>

    <div class="grid grid-3" style="margin-bottom:18px">
      <div class="stat-card">
        <div class="stat-icon orange"><i class="mdi mdi-timer-sand"></i></div>
        <div>
          <b>{{ pending.length }}</b>
          <span>Chờ duyệt</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="mdi mdi-book-check"></i></div>
        <div>
          <b>{{ approvedToday }}</b>
          <span>Đã duyệt hôm nay</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="mdi mdi-account-group"></i></div>
        <div>
          <b>{{ readerCount }}</b>
          <span>Độc giả gửi yêu cầu</span>
        </div>
      </div>
    </div>

    <section class="card pad">
      <div class="section-title-row">
        <h2 class="section-title">Danh sách chờ duyệt</h2>
        <input class="input" v-model.trim="keyword" placeholder="Tìm theo độc giả, mã thẻ, sách, mã bản sao..." />
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Mã bản sao</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filtered" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>
                <b>{{ item.readerName }}</b>
                <br />
                <small>{{ item.cardNumber || '-' }}</small>
              </td>
              <td>{{ item.bookTitle }}</td>
              <td>{{ item.copyCode }}</td>
              <td>{{ formatDateTime(item.borrowDate) }}</td>
              <td><span class="badge orange">Chờ duyệt</span></td>
              <td class="actions">
                <button class="mini success" :disabled="actionId === item.id" @click="approve(item)">
                  <i class="mdi mdi-check"></i>
                  Duyệt
                </button>
                <button class="mini danger" :disabled="actionId === item.id" @click="reject(item)">
                  <i class="mdi mdi-close"></i>
                  Từ chối
                </button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="empty">Chưa có yêu cầu mượn sách đang chờ duyệt.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { circulationApi, dataOf, formatDateTime, getErrorMessage, normalizeRecord } from '../services/api'

const records = ref([])
const keyword = ref('')
const loading = ref(false)
const actionId = ref(null)
const error = ref('')
const success = ref('')

const pending = computed(() => records.value.filter((x) => String(x.status || '').toLowerCase() === 'pending'))

const filtered = computed(() => {
  const q = normalizeText(keyword.value)
  if (!q) return pending.value
  return pending.value.filter((item) =>
    [item.readerName, item.cardNumber, item.bookTitle, item.copyCode].some((value) =>
      normalizeText(value).includes(q)
    )
  )
})

const readerCount = computed(() => new Set(pending.value.map((x) => x.cardNumber || x.readerId)).size)
const approvedToday = computed(() => {
  const today = new Date().toDateString()
  return records.value.filter((x) =>
    String(x.status || '').toLowerCase() === 'borrowed' &&
    x.borrowDate &&
    new Date(x.borrowDate).toDateString() === today
  ).length
})

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    records.value = dataOf(await circulationApi.records()).map(normalizeRecord)
  } catch (err) {
    error.value = getErrorMessage(err, 'Không tải được danh sách yêu cầu mượn.')
  } finally {
    loading.value = false
  }
}

async function approve(item) {
  if (!confirm(`Duyệt yêu cầu mượn "${item.bookTitle}" cho ${item.readerName}?`)) return
  actionId.value = item.id
  error.value = ''
  success.value = ''
  try {
    await circulationApi.approveRecord(item.id)
    success.value = `Đã duyệt yêu cầu mượn "${item.bookTitle}".`
    await load()
  } catch (err) {
    error.value = getErrorMessage(err, 'Không duyệt được yêu cầu mượn.')
  } finally {
    actionId.value = null
  }
}

async function reject(item) {
  if (!confirm(`Từ chối yêu cầu mượn "${item.bookTitle}"?`)) return
  actionId.value = item.id
  error.value = ''
  success.value = ''
  try {
    await circulationApi.rejectRecord(item.id, { reason: 'Thủ thư từ chối yêu cầu.' })
    success.value = `Đã từ chối yêu cầu mượn "${item.bookTitle}".`
    await load()
  } catch (err) {
    error.value = getErrorMessage(err, 'Không từ chối được yêu cầu mượn.')
  } finally {
    actionId.value = null
  }
}

onMounted(load)
</script>
