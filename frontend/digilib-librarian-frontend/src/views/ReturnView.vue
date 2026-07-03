<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Trả sách</h1>
        <p>Trả sách sẽ cập nhật phiếu mượn thành Returned và đổi bản sao về Available.</p>
      </div>
      <button class="btn" @click="load" :disabled="loading">
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

    <div class="grid grid-4" style="margin-bottom:18px">
      <div class="stat-card">
        <div class="stat-icon orange"><i class="mdi mdi-book-clock-outline"></i></div>
        <div>
          <b>{{ borrowed.length }}</b>
          <span>Phiếu đang mượn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green"><i class="mdi mdi-book-check-outline"></i></div>
        <div>
          <b>{{ returnedCount }}</b>
          <span>Đã trả</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red"><i class="mdi mdi-alert-circle-outline"></i></div>
        <div>
          <b>{{ overdueCount }}</b>
          <span>Quá hạn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue"><i class="mdi mdi-database-search"></i></div>
        <div>
          <b>{{ records.length }}</b>
          <span>Tổng phiếu</span>
        </div>
      </div>
    </div>

    <div class="card pad" style="margin-bottom:18px">
      <h2 class="section-title">Trả nhanh</h2>

      <div style="display:flex;gap:10px;align-items:end">
        <div class="field" style="flex:1">
          <label>Nhập mã bản sao, tên sách, tên độc giả hoặc mã thẻ</label>
          <input
            class="input"
            v-model.trim="keyword"
            placeholder="VD: 9786040002001-001, Nguyễn Văn A"
            @keydown.enter.prevent="returnFirst"
          />
        </div>

        <button class="btn primary" @click="returnFirst" :disabled="processing">
          <i class="mdi mdi-book-arrow-left-outline"></i>
          Trả phiếu đầu tiên
        </button>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Mã bản sao</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in filteredBorrowed" :key="r.id">
              <td>#{{ r.id }}</td>

              <td>
                <b>{{ r.readerName }}</b>
                <br />
                <small>{{ r.cardNumber }}</small>
              </td>

              <td>
                <b>{{ r.bookTitle }}</b>
              </td>

              <td>{{ r.copyCode }}</td>
              <td>{{ formatDate(r.borrowDate) }}</td>
              <td>{{ formatDate(r.dueDate) }}</td>

              <td>
                <span class="badge" :class="isOverdue(r) ? 'red' : 'orange'">
                  {{ isOverdue(r) ? 'Quá hạn' : 'Đang mượn' }}
                </span>
              </td>

              <td>
                <button class="mini success" @click="returnBook(r)" :disabled="processing">
                  <i class="mdi mdi-book-arrow-left-outline"></i>
                  Trả sách
                </button>
              </td>
            </tr>

            <tr v-if="!filteredBorrowed.length">
              <td colspan="8" class="empty">
                Không có phiếu đang mượn phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { circulationApi, formatDate, getErrorMessage, normalizeRecord, toArray } from '../services/api'

const records = ref([])
const keyword = ref('')
const loading = ref(false)
const processing = ref(false)
const error = ref('')
const success = ref('')

function text(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isBorrowed(r) {
  return String(r.status || '').toLowerCase().includes('borrow')
}

function isReturned(r) {
  return String(r.status || '').toLowerCase().includes('return')
}

function isOverdue(r) {
  return (
    isBorrowed(r) &&
    r.dueDate &&
    new Date(r.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  )
}

function matches(r) {
  const q = text(keyword.value)
  if (!q) return true

  return [r.readerName, r.cardNumber, r.bookTitle, r.copyCode, r.id].some((x) =>
    text(x).includes(q)
  )
}

const borrowed = computed(() => records.value.filter(isBorrowed))
const filteredBorrowed = computed(() => borrowed.value.filter(matches))
const returnedCount = computed(() => records.value.filter(isReturned).length)
const overdueCount = computed(() => records.value.filter(isOverdue).length)

async function load() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const res = await circulationApi.records()
    records.value = toArray(res.data).map(normalizeRecord)
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được danh sách phiếu mượn.')
  } finally {
    loading.value = false
  }
}

async function returnBook(record) {
  if (!record?.id) return

  if (!confirm(`Xác nhận trả sách: ${record.bookTitle} - ${record.copyCode}?`)) return

  processing.value = true
  error.value = ''
  success.value = ''

  try {
    await circulationApi.returnRecord(record.id, {
      returnDate: new Date().toISOString(),
      note: 'Thủ thư xác nhận trả sách'
    })

    success.value = `Đã trả sách ${record.copyCode}. Bản sao đã chuyển về Available.`
    await load()
  } catch (e) {
    error.value = getErrorMessage(
      e,
      'Không trả được sách. Có thể API return chưa đúng hoặc Catalog không cập nhật được bản sao.'
    )
  } finally {
    processing.value = false
  }
}

function returnFirst() {
  const record = filteredBorrowed.value[0]

  if (!record) {
    error.value = 'Không tìm thấy phiếu đang mượn để trả.'
    return
  }

  returnBook(record)
}

onMounted(load)
</script>