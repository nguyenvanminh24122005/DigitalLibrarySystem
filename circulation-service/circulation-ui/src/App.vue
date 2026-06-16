<script setup>
import { computed, nextTick, ref } from 'vue'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const finePerDay = 5000

const today = new Date()
today.setHours(0, 0, 0, 0)

const toIso = (offset) => {
  const date = new Date(today)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const readers = ref([
  { id: 'DG001', name: 'Nguyen Minh Anh', email: 'anh.nguyen@library.vn', phone: '0901 225 178' },
  { id: 'DG002', name: 'Tran Hoang Nam', email: 'nam.tran@library.vn', phone: '0918 442 730' },
  { id: 'DG003', name: 'Le Thanh Tam', email: 'tam.le@library.vn', phone: '0932 114 909' },
  { id: 'DG004', name: 'Pham Gia Han', email: 'han.pham@library.vn', phone: '0986 775 201' },
  { id: 'DG005', name: 'Do Quang Huy', email: 'huy.do@library.vn', phone: '0977 553 619' },
])

const books = ref([
  { id: 'BK001', copyId: 'CP-1001', title: 'Clean Architecture' },
  { id: 'BK002', copyId: 'CP-1002', title: 'Domain-Driven Design' },
  { id: 'BK003', copyId: 'CP-1003', title: 'Vue.js in Action' },
  { id: 'BK004', copyId: 'CP-1004', title: 'Designing Data-Intensive Applications' },
  { id: 'BK005', copyId: 'CP-1005', title: 'The Pragmatic Programmer' },
  { id: 'BK006', copyId: 'CP-1006', title: 'Refactoring' },
])

const borrowRecords = ref([
  { id: 'PM-2401', readerId: 'DG001', bookId: 'BK001', borrowedAt: toIso(-16), dueAt: toIso(-2), returnedAt: null, manualDebt: 0 },
  { id: 'PM-2402', readerId: 'DG002', bookId: 'BK002', borrowedAt: toIso(-10), dueAt: toIso(4), returnedAt: null, manualDebt: 0 },
  { id: 'PM-2403', readerId: 'DG003', bookId: 'BK003', borrowedAt: toIso(-24), dueAt: toIso(-10), returnedAt: toIso(-6), manualDebt: 20000 },
  { id: 'PM-2404', readerId: 'DG004', bookId: 'BK004', borrowedAt: toIso(-7), dueAt: toIso(7), returnedAt: null, manualDebt: 0 },
  { id: 'PM-2405', readerId: 'DG005', bookId: 'BK005', borrowedAt: toIso(-30), dueAt: toIso(-16), returnedAt: null, manualDebt: 0 },
  { id: 'PM-2406', readerId: 'DG001', bookId: 'BK006', borrowedAt: toIso(-21), dueAt: toIso(-8), returnedAt: toIso(-8), manualDebt: 0 },
  { id: 'PM-2407', readerId: 'DG002', bookId: 'BK003', borrowedAt: toIso(-18), dueAt: toIso(-4), returnedAt: toIso(-1), manualDebt: 15000 },
  { id: 'PM-2408', readerId: 'DG004', bookId: 'BK001', borrowedAt: toIso(-3), dueAt: toIso(11), returnedAt: null, manualDebt: 0 },
])

const activeMenu = ref('Phiếu mượn')
const selectedId = ref('PM-2401')
const query = ref('')
const statusFilter = ref('all')
const formMode = ref('')
const chatOpen = ref(false)
const chatQuestion = ref('')
const messages = ref([
  { role: 'ai', text: 'Xin chào, tôi có thể kiểm tra quá hạn, công nợ và tóm tắt hôm nay.' },
])

const newReader = ref({ name: '', email: '', phone: '' })
const newBook = ref({ title: '', copyId: '' })
const newBorrow = ref({ readerId: 'DG001', bookId: 'BK001', borrowedAt: toIso(0), dueAt: toIso(14) })

const menus = ['Tổng quan', 'Phiếu mượn', 'Trả sách', 'Quá hạn', 'Công nợ', 'AI giám sát', 'Cài đặt']

const readerById = computed(() => Object.fromEntries(readers.value.map((reader) => [reader.id, reader])))
const bookById = computed(() => Object.fromEntries(books.value.map((book) => [book.id, book])))

const daysBetween = (from, to) => {
  const start = new Date(from)
  const end = new Date(to)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((end - start) / MS_PER_DAY))
}

const decorateRecord = (record) => {
  const dueDate = new Date(record.dueAt)
  dueDate.setHours(0, 0, 0, 0)
  const endDate = record.returnedAt ? new Date(record.returnedAt) : today
  endDate.setHours(0, 0, 0, 0)
  const overdueDays = Math.max(0, Math.ceil((endDate - dueDate) / MS_PER_DAY))
  const fine = overdueDays * finePerDay
  const debt = record.returnedAt ? record.manualDebt : fine + record.manualDebt
  const status = record.returnedAt ? 'Đã trả' : dueDate < today ? 'Quá hạn' : 'Đang mượn'

  return {
    ...record,
    reader: readerById.value[record.readerId],
    book: bookById.value[record.bookId],
    overdueDays,
    fine,
    debt,
    status,
  }
}

const decoratedRecords = computed(() => borrowRecords.value.map(decorateRecord))

const filteredRecords = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return decoratedRecords.value.filter((record) => {
    const statusMatch = statusFilter.value === 'all' || record.status === statusFilter.value
    const text = [
      record.id,
      record.reader?.name,
      record.reader?.id,
      record.reader?.email,
      record.book?.title,
      record.book?.copyId,
    ].join(' ').toLowerCase()
    return statusMatch && (!keyword || text.includes(keyword))
  })
})

const selectedRecord = computed(() => {
  return decoratedRecords.value.find((record) => record.id === selectedId.value) || decoratedRecords.value[0]
})

const stats = computed(() => {
  const records = decoratedRecords.value
  return [
    { label: 'Tổng phiếu mượn', value: records.length, tone: 'mint' },
    { label: 'Đang mượn', value: records.filter((item) => item.status === 'Đang mượn').length, tone: 'teal' },
    { label: 'Đã trả', value: records.filter((item) => item.status === 'Đã trả').length, tone: 'green' },
    { label: 'Phiếu quá hạn', value: records.filter((item) => item.status === 'Quá hạn').length, tone: 'amber' },
    { label: 'Tổng phí phạt', value: currency.format(records.reduce((sum, item) => sum + item.fine, 0)), tone: 'rose' },
    { label: 'Tổng công nợ', value: currency.format(records.reduce((sum, item) => sum + item.debt, 0)), tone: 'navy' },
  ]
})

const nextCode = (prefix, collection) => {
  const number = collection.length + 1
  return `${prefix}${String(number).padStart(3, '0')}`
}

const addReader = () => {
  if (!newReader.value.name.trim()) return
  const reader = {
    id: nextCode('DG', readers.value),
    name: newReader.value.name.trim(),
    email: newReader.value.email.trim() || `docgia${readers.value.length + 1}@library.vn`,
    phone: newReader.value.phone.trim() || '0900 000 000',
  }
  readers.value.unshift(reader)
  newBorrow.value.readerId = reader.id
  newReader.value = { name: '', email: '', phone: '' }
}

const addBook = () => {
  if (!newBook.value.title.trim()) return
  const book = {
    id: nextCode('BK', books.value),
    copyId: newBook.value.copyId.trim() || `CP-${1000 + books.value.length + 1}`,
    title: newBook.value.title.trim(),
  }
  books.value.unshift(book)
  newBorrow.value.bookId = book.id
  newBook.value = { title: '', copyId: '' }
}

const createBorrow = () => {
  const idNumber = borrowRecords.value.length + 2401
  const record = {
    id: `PM-${idNumber}`,
    readerId: newBorrow.value.readerId,
    bookId: newBorrow.value.bookId,
    borrowedAt: newBorrow.value.borrowedAt,
    dueAt: newBorrow.value.dueAt,
    returnedAt: null,
    manualDebt: 0,
  }
  borrowRecords.value.unshift(record)
  selectedId.value = record.id
  formMode.value = ''
}

const returnBook = (recordId) => {
  const record = borrowRecords.value.find((item) => item.id === recordId)
  if (!record || record.returnedAt) return
  const fine = decorateRecord(record).fine
  record.returnedAt = toIso(0)
  record.manualDebt = fine
}

const deleteRecord = (recordId) => {
  borrowRecords.value = borrowRecords.value.filter((record) => record.id !== recordId)
  if (selectedId.value === recordId) {
    selectedId.value = borrowRecords.value[0]?.id || ''
  }
}

const askAI = async () => {
  const question = chatQuestion.value.trim()
  if (!question) return
  messages.value.push({ role: 'user', text: question })
  chatQuestion.value = ''
  messages.value.push({ role: 'ai', text: answerQuestion(question) })
  await nextTick()
  const body = document.querySelector('.chat-body')
  if (body) body.scrollTop = body.scrollHeight
}

const namesFor = (records) => {
  const names = [...new Set(records.map((record) => record.reader?.name).filter(Boolean))]
  return names.length ? names.join(', ') : 'Không có dữ liệu phù hợp.'
}

const answerQuestion = (question) => {
  const text = question.toLowerCase()
  const notReturned = decoratedRecords.value.filter((record) => !record.returnedAt)
  const overdue = decoratedRecords.value.filter((record) => record.status === 'Quá hạn')
  const debt = decoratedRecords.value.filter((record) => record.debt > 0)
  const totalDebt = debt.reduce((sum, item) => sum + item.debt, 0)

  if (text.includes('chưa trả')) return `Chưa trả sách: ${namesFor(notReturned)}.`
  if (text.includes('quá hạn') || text.includes('qua han')) return `Đang quá hạn: ${namesFor(overdue)}.`
  if (text.includes('công nợ') || text.includes('cong no')) return `Còn công nợ: ${namesFor(debt)}. Tổng công nợ hiện tại là ${currency.format(totalDebt)}.`
  if (text.includes('tóm tắt') || text.includes('tom tat') || text.includes('hôm nay')) {
    return `Hôm nay có ${notReturned.length} phiếu chưa trả, ${overdue.length} phiếu quá hạn và ${currency.format(totalDebt)} công nợ cần theo dõi.`
  }
  return 'Tôi hiểu các câu hỏi: Ai chưa trả sách? Ai quá hạn? Ai còn công nợ? Tóm tắt hôm nay.'
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">LS</div>
        <div>
          <strong>Library System</strong>
          <span>Circulation</span>
        </div>
      </div>
      <nav class="nav">
        <button
          v-for="menu in menus"
          :key="menu"
          :class="{ active: activeMenu === menu }"
          type="button"
          @click="activeMenu = menu"
        >
          <span>{{ menu.slice(0, 1) }}</span>
          {{ menu }}
        </button>
      </nav>
      <div class="sidebar-card">
        <span>AI giám sát</span>
        <strong>{{ decoratedRecords.filter((item) => item.status === 'Quá hạn').length }} cảnh báo</strong>
      </div>
    </aside>

    <main class="workspace">
      <header class="topbar">
        <div>
          <p>Circulation Service</p>
          <h1>Quản lý mượn/trả sách</h1>
        </div>
        <div class="header-tools">
          <button type="button" @click="formMode = 'reader'">Thêm độc giả</button>
          <button type="button" @click="formMode = 'book'">Thêm sách</button>
          <button class="primary" type="button" @click="formMode = 'borrow'">Tạo phiếu mượn</button>
        </div>
      </header>

      <section class="stats-grid">
        <article v-for="card in stats" :key="card.label" class="stat-card" :class="card.tone">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </section>

      <section v-if="formMode" class="quick-form">
        <div class="form-heading">
          <strong v-if="formMode === 'reader'">Thêm độc giả</strong>
          <strong v-if="formMode === 'book'">Thêm sách</strong>
          <strong v-if="formMode === 'borrow'">Tạo phiếu mượn</strong>
          <button type="button" @click="formMode = ''">Đóng</button>
        </div>

        <div v-if="formMode === 'reader'" class="form-grid">
          <input v-model="newReader.name" placeholder="Tên độc giả" />
          <input v-model="newReader.email" placeholder="Email" />
          <input v-model="newReader.phone" placeholder="Số điện thoại" />
          <button class="primary" type="button" @click="addReader">Lưu độc giả</button>
        </div>

        <div v-if="formMode === 'book'" class="form-grid">
          <input v-model="newBook.title" placeholder="Tên sách" />
          <input v-model="newBook.copyId" placeholder="Mã bản sao" />
          <button class="primary" type="button" @click="addBook">Lưu sách</button>
        </div>

        <div v-if="formMode === 'borrow'" class="form-grid">
          <select v-model="newBorrow.readerId">
            <option v-for="reader in readers" :key="reader.id" :value="reader.id">
              {{ reader.name }} - {{ reader.id }}
            </option>
          </select>
          <select v-model="newBorrow.bookId">
            <option v-for="book in books" :key="book.id" :value="book.id">
              {{ book.title }} - {{ book.copyId }}
            </option>
          </select>
          <input v-model="newBorrow.borrowedAt" type="date" />
          <input v-model="newBorrow.dueAt" type="date" />
          <button class="primary" type="button" @click="createBorrow">Tạo phiếu</button>
        </div>
      </section>

      <div class="content-grid">
        <section class="records-panel">
          <div class="filters">
            <input v-model="query" placeholder="Tìm mã phiếu, độc giả, sách..." />
            <select v-model="statusFilter">
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang mượn">Đang mượn</option>
              <option value="Đã trả">Đã trả</option>
              <option value="Quá hạn">Quá hạn</option>
            </select>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Thông tin độc giả</th>
                  <th>Sách mượn</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Trạng thái</th>
                  <th>Phí phạt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="record in filteredRecords"
                  :key="record.id"
                  :class="{ selected: selectedRecord?.id === record.id }"
                  @click="selectedId = record.id"
                >
                  <td><strong>{{ record.id }}</strong></td>
                  <td>
                    <strong>{{ record.reader?.name }}</strong>
                    <span>{{ record.reader?.id }} · {{ record.reader?.phone }}</span>
                  </td>
                  <td>
                    <strong>{{ record.book?.title }}</strong>
                    <span>{{ record.book?.copyId }}</span>
                  </td>
                  <td>{{ record.borrowedAt }}</td>
                  <td>{{ record.dueAt }}</td>
                  <td><span class="badge" :class="record.status">{{ record.status }}</span></td>
                  <td>{{ currency.format(record.fine) }}</td>
                  <td class="actions">
                    <button type="button" @click.stop="returnBook(record.id)" :disabled="!!record.returnedAt">Trả</button>
                    <button type="button" @click.stop="deleteRecord(record.id)">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="detail-panel" v-if="selectedRecord">
          <div class="detail-head">
            <span>Chi tiết phiếu</span>
            <strong>{{ selectedRecord.id }}</strong>
          </div>
          <div class="reader-card">
            <strong>{{ selectedRecord.reader?.name }}</strong>
            <span>{{ selectedRecord.reader?.id }}</span>
          </div>
          <dl>
            <div><dt>Email</dt><dd>{{ selectedRecord.reader?.email }}</dd></div>
            <div><dt>Số điện thoại</dt><dd>{{ selectedRecord.reader?.phone }}</dd></div>
            <div><dt>Tên sách</dt><dd>{{ selectedRecord.book?.title }}</dd></div>
            <div><dt>Mã bản sao</dt><dd>{{ selectedRecord.book?.copyId }}</dd></div>
            <div><dt>Ngày mượn</dt><dd>{{ selectedRecord.borrowedAt }}</dd></div>
            <div><dt>Hạn trả</dt><dd>{{ selectedRecord.dueAt }}</dd></div>
            <div><dt>Ngày trả</dt><dd>{{ selectedRecord.returnedAt || 'Chưa trả' }}</dd></div>
            <div><dt>Số ngày quá hạn</dt><dd>{{ selectedRecord.overdueDays }} ngày</dd></div>
            <div><dt>Phí phạt</dt><dd>{{ currency.format(selectedRecord.fine) }}</dd></div>
            <div><dt>Công nợ</dt><dd>{{ currency.format(selectedRecord.debt) }}</dd></div>
          </dl>
          <button
            class="wide primary"
            type="button"
            :disabled="!!selectedRecord.returnedAt"
            @click="returnBook(selectedRecord.id)"
          >
            Xác nhận trả sách
          </button>
        </aside>
      </div>
    </main>

    <div class="chat" :class="{ open: chatOpen }">
      <button class="chat-toggle" type="button" @click="chatOpen = !chatOpen">AI</button>
      <section v-if="chatOpen" class="chat-window">
        <header>
          <strong>AI giám sát</strong>
          <button type="button" @click="chatOpen = false">Đóng</button>
        </header>
        <div class="chat-body">
          <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
            {{ message.text }}
          </div>
        </div>
        <form @submit.prevent="askAI">
          <input v-model="chatQuestion" placeholder="Ai quá hạn?" />
          <button class="primary" type="submit">Gửi</button>
        </form>
      </section>
    </div>
  </div>
</template>
