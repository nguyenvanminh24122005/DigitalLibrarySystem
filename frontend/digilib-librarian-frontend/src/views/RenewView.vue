<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Gia hạn sách</h1>
        <p>Gia hạn hạn trả cho phiếu đang mượn. Phiếu đã trả hoặc quá hạn sẽ không được gia hạn.</p>
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

    <div class="card pad" style="margin-bottom:18px">
      <h2 class="section-title">Tìm phiếu cần gia hạn</h2>

      <div class="grid grid-2">
        <div class="field">
          <label>Tìm theo mã bản sao, tên sách, tên độc giả hoặc mã thẻ</label>
          <input
            class="input"
            v-model.trim="keyword"
            placeholder="VD: 9786040002001-001 hoặc Nguyễn Văn A"
          />
        </div>

        <div class="field">
          <label>Số ngày gia hạn</label>
          <select class="select" v-model.number="days">
            <option :value="7">7 ngày</option>
            <option :value="14">14 ngày</option>
            <option :value="21">21 ngày</option>
            <option :value="30">30 ngày</option>
          </select>
        </div>
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
              <th>Hạn hiện tại</th>
              <th>Hạn mới</th>
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

              <td>
                <span class="badge" :class="isOverdue(r) ? 'red' : 'orange'">
                  {{ formatDate(r.dueDate) }}
                </span>
              </td>

              <td>
                <b>{{ newDueDateText(r) }}</b>
              </td>

              <td>
                <button
                  class="mini success"
                  @click="renewBook(r)"
                  :disabled="processing || isOverdue(r)"
                >
                  <i class="mdi mdi-calendar-plus"></i>
                  Gia hạn
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

    <div class="alert" style="margin-top:18px">
      <i class="mdi mdi-information-outline"></i>
      Nếu bấm gia hạn mà báo lỗi 404, nghĩa là backend chưa có API
      <b>POST /api/borrow-records/:id/renew</b>.
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { circulationApi, formatDate, getErrorMessage, normalizeRecord, toArray } from '../services/api'

const records = ref([])
const keyword = ref('')
const days = ref(7)

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

const filteredBorrowed = computed(() =>
  records.value.filter((r) => isBorrowed(r) && matches(r))
)

function addDays(dateValue, count) {
  const d = new Date(dateValue)
  d.setDate(d.getDate() + Number(count || 7))
  return d
}

function newDueDateText(r) {
  return formatDate(addDays(r.dueDate, days.value))
}

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

async function renewBook(record) {
  if (!record?.id) return

  if (isOverdue(record)) {
    error.value = 'Phiếu đã quá hạn, không thể gia hạn.'
    return
  }

  if (!confirm(`Gia hạn ${days.value} ngày cho phiếu #${record.id} - ${record.copyCode}?`)) {
    return
  }

  processing.value = true
  error.value = ''
  success.value = ''

  try {
    await circulationApi.renewRecord(record.id, {
      days: Number(days.value),
      note: 'Thủ thư gia hạn sách'
    })

    success.value = `Đã gia hạn ${days.value} ngày cho ${record.copyCode}.`
    await load()
  } catch (e) {
    error.value = getErrorMessage(
      e,
      'Không gia hạn được. Có thể backend chưa thêm API /renew hoặc phiếu đã quá hạn/đã trả.'
    )
  } finally {
    processing.value = false
  }
}

onMounted(load)
</script>