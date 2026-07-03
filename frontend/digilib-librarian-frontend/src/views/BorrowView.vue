<template>
  <div>
    <div class="page-head">
      <div>
        <h1>Mượn sách</h1>
        <p>Chọn bạn đọc và bản sao còn Available để tạo phiếu mượn thật qua API.</p>
      </div>
      <button class="btn" @click="load" :disabled="loading">
        <i class="mdi mdi-refresh"></i>
        Làm mới dữ liệu
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
        <div class="stat-icon blue"><i class="mdi mdi-book-open-page-variant"></i></div>
        <div>
          <b>{{ borrowedCount }}</b>
          <span>Đang mượn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green"><i class="mdi mdi-account-check"></i></div>
        <div>
          <b>{{ readers.length }}</b>
          <span>Bạn đọc</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange"><i class="mdi mdi-bookshelf"></i></div>
        <div>
          <b>{{ availableCopies.length }}</b>
          <span>Bản sao có thể mượn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple"><i class="mdi mdi-clipboard-plus-outline"></i></div>
        <div>
          <b>{{ selectedCopies.length }}</b>
          <span>Sách chọn</span>
        </div>
      </div>
    </div>

    <div class="split">
      <section class="card pad">
        <h2 class="section-title">1. Chọn bạn đọc</h2>

        <div class="field">
          <label>Quét / nhập mã thẻ, tên, email hoặc SĐT</label>
          <div style="display:flex;gap:10px">
            <input
              class="input"
              v-model.trim="readerKeyword"
              placeholder="VD: CARD-DG20260001, LIB001, Nguyễn Văn A"
              @keydown.enter.prevent="chooseFirstReader"
            />
            <button type="button" class="btn primary" @click="chooseFirstReader">
              <i class="mdi mdi-magnify"></i>
              Tìm
            </button>
          </div>
        </div>

        <div v-if="selectedReader" class="mini-profile">
          <div class="avatar">
            <i class="mdi mdi-account"></i>
          </div>

          <div>
            <h3>{{ selectedReader.fullName }}</h3>
            <p>
              {{ selectedReader.cardNumber }}
              • {{ selectedReader.email || 'Chưa có email' }}
              • {{ selectedReader.phone || 'Chưa có SĐT' }}
            </p>
          </div>

          <button class="mini" @click="selectedReader = null">Đổi</button>
        </div>

        <div v-else class="table-wrap" style="margin-top:14px;max-height:300px;overflow:auto">
          <table>
            <thead>
              <tr>
                <th>Bạn đọc</th>
                <th>Mã thẻ</th>
                <th>SĐT</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="r in filteredReaders.slice(0, 8)" :key="r.id">
                <td>
                  <b>{{ r.fullName }}</b>
                  <br />
                  <small>{{ r.email }}</small>
                </td>
                <td>{{ r.cardNumber }}</td>
                <td>{{ r.phone || '-' }}</td>
                <td>
                  <button class="mini success" @click="selectedReader = r">Chọn</button>
                </td>
              </tr>

              <tr v-if="!filteredReaders.length">
                <td colspan="4" class="empty">
                  Không tìm thấy bạn đọc. Hãy tạo độc giả bên Admin trước.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card pad">
        <h2 class="section-title">2. Chọn sách mượn</h2>

        <div class="field">
          <label>Nhập mã bản sao / ISBN / tên sách</label>
          <div style="display:flex;gap:10px">
            <input
              class="input"
              v-model.trim="copyKeyword"
              placeholder="VD: 9786040002001-001 hoặc Cơ sở dữ liệu"
              @keydown.enter.prevent="addFirstCopy"
            />
            <button type="button" class="btn primary" @click="addFirstCopy">
              <i class="mdi mdi-plus"></i>
              Thêm
            </button>
          </div>
        </div>

        <div class="table-wrap" style="margin-top:14px;max-height:300px;overflow:auto">
          <table>
            <thead>
              <tr>
                <th>Mã bản sao</th>
                <th>Sách</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="c in filteredCopies.slice(0, 10)" :key="c.id || c.copyCode">
                <td>
                  <b>{{ c.copyCode }}</b>
                </td>
                <td>{{ c.bookTitle }}</td>
                <td>{{ c.location || '-' }}</td>
                <td>
                  <span class="badge" :class="isAvailable(c.status) ? 'green' : 'orange'">
                    {{ copyStatus(c.status) }}
                  </span>
                </td>
                <td>
                  <button
                    class="mini success"
                    :disabled="!isAvailable(c.status)"
                    @click="addCopy(c)"
                  >
                    Chọn
                  </button>
                </td>
              </tr>

              <tr v-if="!filteredCopies.length">
                <td colspan="5" class="empty">
                  Không tìm thấy bản sao. Hãy thêm bản sao bên Admin trước.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <section class="card pad" style="margin-top:18px">
      <h2 class="section-title">3. Xác nhận phiếu mượn</h2>

      <div class="grid grid-2">
        <div class="field">
          <label>Ngày mượn</label>
          <input class="input" :value="today" disabled />
        </div>

        <div class="field">
          <label>Hạn trả dự kiến</label>
          <input class="input" :value="dueDate" disabled />
        </div>
      </div>

      <div class="table-wrap" style="margin-top:14px">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Sách</th>
              <th>Mã bản sao</th>
              <th>Vị trí</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(c, i) in selectedCopies" :key="c.copyCode">
              <td>{{ i + 1 }}</td>
              <td><b>{{ c.bookTitle }}</b></td>
              <td>{{ c.copyCode }}</td>
              <td>{{ c.location || '-' }}</td>
              <td>
                <button class="mini danger" @click="removeCopy(c.copyCode)">Bỏ</button>
              </td>
            </tr>

            <tr v-if="!selectedCopies.length">
              <td colspan="5" class="empty">Chưa chọn bản sao sách.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        class="btn primary"
        style="width:100%;margin-top:16px"
        :disabled="submitting || !selectedReader || !selectedCopies.length"
        @click="submitBorrow"
      >
        <i class="mdi mdi-check-circle-outline"></i>
        {{ submitting ? 'Đang tạo phiếu...' : 'Xác nhận mượn' }}
      </button>

      <p class="muted" style="margin-bottom:0;margin-top:10px">
        Sau khi mượn thành công, bản sao sẽ chuyển từ Available sang Borrowed.
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  catalogApi,
  circulationApi,
  formatDate,
  getErrorMessage,
  identityApi,
  normalizeBook,
  normalizeCopy,
  normalizeReader,
  normalizeRecord,
  toArray
} from '../services/api'

const books = ref([])
const copies = ref([])
const readers = ref([])
const records = ref([])

const selectedReader = ref(null)
const selectedCopies = ref([])

const readerKeyword = ref('')
const copyKeyword = ref('')

const loading = ref(false)
const submitting = ref(false)

const error = ref('')
const success = ref('')

const today = computed(() => formatDate(new Date()))

const dueDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return formatDate(d)
})

const availableCopies = computed(() => copies.value.filter((c) => isAvailable(c.status)))

const borrowedCount = computed(() =>
  records.value.filter((r) => String(r.status || '').toLowerCase().includes('borrow')).length
)

function isAvailable(status) {
  const value = String(status || '').toLowerCase()
  return value.includes('available') || value === 'có thể mượn'
}

function copyStatus(status) {
  return isAvailable(status) ? 'Có thể mượn' : 'Đang mượn'
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchText(obj, keyword, fields) {
  const q = normalizeText(keyword)
  if (!q) return true
  return fields.some((f) => normalizeText(obj[f]).includes(q))
}

const filteredReaders = computed(() =>
  readers.value.filter((r) =>
    matchText(r, readerKeyword.value, ['fullName', 'cardNumber', 'readerCode', 'email', 'phone'])
  )
)

const filteredCopies = computed(() =>
  copies.value.filter((c) =>
    matchText(c, copyKeyword.value, ['copyCode', 'barcode', 'bookTitle', 'isbn', 'location'])
  )
)

async function load() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const [bookRes, copyRes, readerRes, recordRes] = await Promise.all([
      catalogApi.books(),
      catalogApi.copies(),
      identityApi.readers(),
      circulationApi.records().catch(() => ({ data: [] }))
    ])

    books.value = toArray(bookRes.data).map(normalizeBook)

    copies.value = toArray(copyRes.data)
      .map(normalizeCopy)
      .map((c) => {
        if (!c.bookTitle || c.bookTitle === 'Chưa rõ sách') {
          const b = books.value.find((x) => String(x.id) === String(c.bookId))
          if (b) c.bookTitle = b.title
        }
        return c
      })

    readers.value = toArray(readerRes.data).map(normalizeReader)
    records.value = toArray(recordRes.data).map(normalizeRecord)
  } catch (e) {
    error.value = getErrorMessage(
      e,
      'Không tải được dữ liệu. Kiểm tra Catalog / Identity / Circulation API và token đăng nhập.'
    )
  } finally {
    loading.value = false
  }
}

function chooseFirstReader() {
  if (!filteredReaders.value.length) {
    error.value = 'Không tìm thấy bạn đọc. Hãy kiểm tra mã thẻ hoặc tạo độc giả bên Admin.'
    return
  }

  selectedReader.value = filteredReaders.value[0]
  error.value = ''
}

function addFirstCopy() {
  const copy = filteredCopies.value.find((c) => isAvailable(c.status))

  if (!copy) {
    error.value = 'Không tìm thấy bản sao Available. Hãy kiểm tra mã bản sao hoặc trạng thái tồn kho.'
    return
  }

  addCopy(copy)
}

function addCopy(copy) {
  error.value = ''

  if (!isAvailable(copy.status)) {
    error.value = `Bản sao ${copy.copyCode} không ở trạng thái Available.`
    return
  }

  if (selectedCopies.value.some((x) => x.copyCode === copy.copyCode)) return

  selectedCopies.value.push(copy)
}

function removeCopy(code) {
  selectedCopies.value = selectedCopies.value.filter((x) => x.copyCode !== code)
}

async function submitBorrow() {
  success.value = ''
  error.value = ''

  if (!selectedReader.value) {
    error.value = 'Bạn chưa chọn bạn đọc.'
    return
  }

  if (!selectedCopies.value.length) {
    error.value = 'Bạn chưa chọn bản sao sách.'
    return
  }

  submitting.value = true

  try {
    const reader = selectedReader.value

    for (const copy of selectedCopies.value) {
      const book =
        books.value.find((b) => String(b.id) === String(copy.bookId)) || {
          id: copy.bookId,
          title: copy.bookTitle
        }

      await circulationApi.createRecord({
        readerId: Number(reader.numericId || reader.id),
        readerName: reader.fullName,
        cardNumber: reader.cardNumber || reader.readerCode || '',
        copyCode: copy.copyCode,
        bookId: Number(book.id),
        bookTitle: book.title || copy.bookTitle,
        borrowDate: new Date().toISOString()
      })
    }

    success.value = `Đã tạo ${selectedCopies.value.length} phiếu mượn cho ${reader.fullName}.`
    selectedCopies.value = []
    copyKeyword.value = ''

    await load()
  } catch (e) {
    error.value = getErrorMessage(
      e,
      'Không tạo được phiếu mượn. Có thể bản sao đã Borrowed, độc giả quá giới hạn, còn phí phạt hoặc Catalog không cập nhật được trạng thái bản sao.'
    )
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>