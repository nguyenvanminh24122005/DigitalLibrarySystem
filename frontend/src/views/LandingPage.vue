<template>
  <div class="reader-app">
    <header class="topbar">
      <button class="brand" type="button" @click="scrollTo('top')">
        <v-icon size="30">mdi-library</v-icon>
        <span>
          <strong>Thư viện số</strong>
          <small>Cổng độc giả</small>
        </span>
      </button>

      <nav>
        <button v-for="item in navItems" :key="item.id" type="button" @click="scrollTo(item.id)">
          {{ item.label }}
        </button>
      </nav>

      <div class="account">
        <button class="icon-btn" type="button" title="Làm mới" @click="loadData">
          <v-icon size="21">mdi-refresh</v-icon>
        </button>
        <button class="profile-btn" type="button" @click="scrollTo('card')">
          <span>{{ initials }}</span>
          <b>{{ reader.name }}</b>
        </button>
        <button class="icon-btn danger" type="button" title="Đăng xuất" @click="logout">
          <v-icon size="21">mdi-logout</v-icon>
        </button>
      </div>
    </header>

    <main id="top">
      <section class="hero">
        <div>
          <span class="eyebrow">
            <v-icon size="18">mdi-sparkles</v-icon>
            Không gian học tập cá nhân
          </span>
          <h1>Tra cứu, đặt mượn và theo dõi sách trong một giao diện gọn gàng.</h1>
          <p>
            Xin chào {{ reader.name }}. Bạn có thể tìm tài liệu, gửi yêu cầu mượn, xem hạn trả,
            phí phạt và thông tin thẻ thư viện ngay tại đây.
          </p>

          <div class="search-box">
            <v-icon size="25">mdi-magnify</v-icon>
            <input
              v-model="search"
              placeholder="Tìm theo tên sách, tác giả, ISBN..."
              @keyup.enter="scrollTo('books')"
            />
            <button v-if="search" type="button" class="ghost-icon" @click="search = ''">
              <v-icon size="18">mdi-close</v-icon>
            </button>
            <button type="button" @click="scrollTo('books')">Tìm sách</button>
          </div>

          <div class="hero-actions">
            <button type="button" @click="scrollTo('books')">
              <v-icon size="19">mdi-book-search</v-icon>
              Khám phá kho sách
            </button>
            <button type="button" class="secondary" @click="scrollTo('history')">
              <v-icon size="19">mdi-history</v-icon>
              Xem lịch sử mượn
            </button>
          </div>
        </div>

        <aside class="hero-card">
          <div class="reader-card">
            <span>Thẻ thư viện</span>
            <strong>{{ reader.cardId }}</strong>
            <small>{{ reader.status }} · hết hạn {{ displayDate(reader.expireDate) }}</small>
          </div>
          <div class="metric-grid">
            <div v-for="metric in readerMetrics" :key="metric.label">
              <v-icon size="23">{{ metric.icon }}</v-icon>
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </div>
          </div>
        </aside>
      </section>

      <section id="status" class="section">
        <div class="section-head">
          <div>
            <span>Trạng thái</span>
            <h2>Phiếu mượn hiện tại</h2>
          </div>
          <button type="button" @click="loadData">
            <v-icon size="18">mdi-refresh</v-icon>
            Làm mới
          </button>
        </div>

        <div v-if="activeBorrows.length === 0" class="empty">
          <v-icon size="48">mdi-book-check-outline</v-icon>
          <h3>Bạn chưa có phiếu mượn đang xử lý</h3>
          <p>Hãy chọn một tài liệu trong kho sách và gửi yêu cầu mượn.</p>
        </div>

        <div v-else class="borrow-grid">
          <article v-for="item in activeBorrows" :key="item.id" class="borrow-card" :class="item.status">
            <div>
              <span class="status" :class="item.status">{{ statusText(item.status) }}</span>
              <small>{{ item.id }}</small>
            </div>
            <h3>{{ item.bookTitle }}</h3>
            <p>{{ item.note }}</p>
            <ul>
              <li><v-icon size="17">mdi-calendar-clock</v-icon> Yêu cầu: {{ displayDate(item.requestDate) }}</li>
              <li><v-icon size="17">mdi-calendar-start</v-icon> Mượn: {{ displayDate(item.borrowDate) }}</li>
              <li><v-icon size="17">mdi-calendar-end</v-icon> Hạn trả: {{ displayDate(item.dueDate) }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="books" class="section">
        <div class="section-head">
          <div>
            <span>Kho tài liệu</span>
            <h2>Tìm sách phù hợp</h2>
            <p>{{ filteredBooks.length }} kết quả đang hiển thị</p>
          </div>
          <div class="filters">
            <select v-model="category">
              <option value="all">Tất cả thể loại</option>
              <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
            </select>
            <select v-model="availability">
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Còn sách</option>
              <option value="out">Hết sách</option>
            </select>
          </div>
        </div>

        <div class="book-grid">
          <article v-for="book in filteredBooks" :key="book.id" class="book-card">
            <div class="cover">
              <img :src="book.cover" :alt="book.title" @error="coverFallback" />
              <span :class="{ out: Number(book.availableCopies) === 0 }">
                {{ Number(book.availableCopies) > 0 ? 'Còn sách' : 'Hết sách' }}
              </span>
            </div>
            <div class="book-body">
              <small>{{ book.category }} · {{ book.location }}</small>
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>
              <div class="copies">{{ book.availableCopies }}/{{ book.totalCopies }} bản sẵn sàng</div>
              <div class="book-actions">
                <button type="button" class="outline" @click="openBook(book)">Chi tiết</button>
                <button type="button" :disabled="Number(book.availableCopies) === 0" @click="reserve(book)">
                  Đặt mượn
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="history" class="section">
        <div class="section-head">
          <div>
            <span>Lịch sử</span>
            <h2>Lịch sử mượn trả</h2>
            <p>Theo dõi toàn bộ yêu cầu, sách đang mượn và phí phát sinh.</p>
          </div>
          <button type="button" @click="exportCsv">
            <v-icon size="18">mdi-download-outline</v-icon>
            Xuất CSV
          </button>
        </div>

        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Tài liệu</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Ngày trả</th>
                <th>Phạt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in myBorrows" :key="item.id">
                <td class="code">{{ item.id }}</td>
                <td><strong>{{ item.bookTitle }}</strong><small>{{ item.note }}</small></td>
                <td>{{ displayDate(item.borrowDate) }}</td>
                <td>{{ displayDate(item.dueDate) }}</td>
                <td>{{ displayDate(item.returnDate) }}</td>
                <td>{{ formatMoney(item.fine) }}</td>
                <td><span class="status" :class="item.status">{{ statusText(item.status) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="card" class="section">
        <div class="section-head">
          <div>
            <span>Hồ sơ</span>
            <h2>Thông tin độc giả</h2>
          </div>
        </div>

        <div class="profile-grid">
          <div class="library-card">
            <v-icon size="34">mdi-card-account-details-outline</v-icon>
            <span>Digital Library Card</span>
            <strong>{{ reader.cardId }}</strong>
            <div>
              <small>Chủ thẻ</small>
              <b>{{ reader.name }}</b>
            </div>
          </div>

          <div class="profile-panel">
            <div v-for="item in profileRows" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>

    <v-dialog v-model="detailDialog" max-width="780">
      <v-card class="dialog-card" v-if="selectedBook">
        <div class="dialog-head">
          <div>
            <h2>{{ selectedBook.title }}</h2>
            <p>{{ selectedBook.author }} · {{ selectedBook.isbn }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
        </div>
        <div class="dialog-content">
          <img :src="selectedBook.cover" :alt="selectedBook.title" @error="coverFallback" />
          <div>
            <span class="status available">{{ selectedBook.category }}</span>
            <p>{{ selectedBook.description }}</p>
            <div class="detail-grid">
              <div><span>Nhà xuất bản</span><b>{{ selectedBook.publisher }}</b></div>
              <div><span>Năm xuất bản</span><b>{{ selectedBook.year }}</b></div>
              <div><span>Vị trí</span><b>{{ selectedBook.location }}</b></div>
              <div><span>Bản còn</span><b>{{ selectedBook.availableCopies }}/{{ selectedBook.totalCopies }}</b></div>
            </div>
            <button class="full-btn" type="button" :disabled="Number(selectedBook.availableCopies) === 0" @click="reserve(selectedBook)">
              Gửi yêu cầu mượn
            </button>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="2600">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createBorrowRequest,
  formatMoney,
  getBooks,
  getBorrows,
  getCurrentReader,
  statusText
} from '../services/libraryData'

const router = useRouter()

const navItems = [
  { id: 'books', label: 'Kho sách' },
  { id: 'status', label: 'Phiếu mượn' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'card', label: 'Thẻ thư viện' }
]

const reader = ref({})
const books = ref([])
const borrows = ref([])
const search = ref('')
const category = ref('all')
const availability = ref('all')
const selectedBook = ref(null)
const detailDialog = ref(false)
const snackbar = ref({ show: false, color: 'success', text: '' })

const getAuthUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem('library_current_user') || 'null') ||
      JSON.parse(localStorage.getItem('library_auth_user') || 'null') ||
      JSON.parse(localStorage.getItem('user') || 'null')
    )
  } catch {
    return null
  }
}

const initials = computed(() => {
  return String(reader.value.name || 'DG').split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase()
})

const myBorrows = computed(() => {
  return borrows.value.filter((item) => item.readerId === reader.value.id)
})

const activeBorrows = computed(() => {
  return myBorrows.value.filter((item) => ['pending', 'borrowing', 'overdue'].includes(item.status))
})

const categories = computed(() => {
  return [...new Set(books.value.map((book) => book.category).filter(Boolean))]
})

const filteredBooks = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return books.value.filter((book) => {
    const matchesSearch = !keyword || [book.title, book.author, book.isbn].join(' ').toLowerCase().includes(keyword)
    const matchesCategory = category.value === 'all' || book.category === category.value
    const matchesAvailability =
      availability.value === 'all' ||
      (availability.value === 'available' && Number(book.availableCopies) > 0) ||
      (availability.value === 'out' && Number(book.availableCopies) === 0)

    return matchesSearch && matchesCategory && matchesAvailability
  })
})

const readerMetrics = computed(() => [
  { label: 'Đang xử lý', value: activeBorrows.value.length, icon: 'mdi-book-clock-outline' },
  { label: 'Đã trả', value: myBorrows.value.filter((item) => item.status === 'returned').length, icon: 'mdi-check-circle-outline' },
  { label: 'Phí phạt', value: formatMoney(myBorrows.value.reduce((sum, item) => sum + Number(item.fine || 0), 0)), icon: 'mdi-cash' },
  { label: 'Kho sách', value: books.value.length, icon: 'mdi-bookshelf' }
])

const profileRows = computed(() => [
  { label: 'Họ tên', value: reader.value.name || '--' },
  { label: 'Email', value: reader.value.email || '--' },
  { label: 'Số điện thoại', value: reader.value.phone || '--' },
  { label: 'Mã thẻ', value: reader.value.cardId || '--' },
  { label: 'Ngày cấp', value: displayDate(reader.value.issueDate) },
  { label: 'Ngày hết hạn', value: displayDate(reader.value.expireDate) }
])

const displayDate = (value) => value || '--'

const loadData = () => {
  const user = getAuthUser()
  if (!user) {
    router.push('/login')
    return
  }

  reader.value = getCurrentReader(user)
  books.value = getBooks()
  borrows.value = getBorrows()
}

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const showMessage = (text, color = 'success') => {
  snackbar.value = { show: true, color, text }
}

const reserve = (book) => {
  try {
    createBorrowRequest(reader.value, book)
    loadData()
    detailDialog.value = false
    showMessage(`Đã gửi yêu cầu mượn "${book.title}".`)
    scrollTo('status')
  } catch (error) {
    showMessage(error.message || 'Không thể gửi yêu cầu mượn.', 'error')
  }
}

const openBook = (book) => {
  selectedBook.value = book
  detailDialog.value = true
}

const coverFallback = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=600&auto=format&fit=crop'
}

const exportCsv = () => {
  const rows = [
    ['Ma phieu', 'Tai lieu', 'Ngay muon', 'Han tra', 'Ngay tra', 'Phat', 'Trang thai'],
    ...myBorrows.value.map((item) => [
      item.id,
      item.bookTitle,
      item.borrowDate,
      item.dueDate,
      item.returnDate,
      item.fine,
      statusText(item.status)
    ])
  ]
  const csv = rows.map((row) => row.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lich-su-muon-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const logout = () => {
  ;['token', 'accessToken', 'role', 'user', 'library_current_user', 'library_auth_user'].forEach((key) => localStorage.removeItem(key))
  router.push('/login')
}

onMounted(loadData)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.reader-app {
  min-height: 100vh;
  background: #f6f8fb;
  color: #172033;
  font-family: Inter, Segoe UI, sans-serif;
}

.topbar {
  min-height: 76px;
  padding: 12px 34px;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid #dde5ef;
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  gap: 22px;
  position: sticky;
  top: 0;
  z-index: 30;
}

button {
  font: inherit;
}

.brand,
.profile-btn,
.icon-btn,
nav button,
.section-head button,
.hero-actions button,
.search-box button,
.book-actions button,
.full-btn {
  border: 0;
  cursor: pointer;
}

.brand {
  background: transparent;
  color: #0f766e;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand span {
  display: grid;
  text-align: left;
}

.brand strong {
  color: #172033;
  font-size: 19px;
}

.brand small {
  color: #6b778c;
}

nav {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

nav button {
  height: 40px;
  border-radius: 10px;
  padding: 0 13px;
  background: transparent;
  color: #46566f;
  font-weight: 800;
}

nav button:hover {
  background: #e7f8f4;
  color: #0f766e;
}

.account {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border: 1px solid #d7e0ec;
  border-radius: 999px;
  background: white;
  color: #46566f;
}

.icon-btn.danger {
  color: #dc2626;
}

.profile-btn {
  height: 46px;
  border-radius: 999px;
  padding: 4px 14px 4px 5px;
  background: #ffffff;
  border: 1px solid #b8efe4;
  color: #172033;
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 900;
}

.profile-btn span {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #ccfbf1;
  color: #0f766e;
  display: grid;
  place-items: center;
}

.hero {
  min-height: 560px;
  padding: 64px 48px 40px;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) 430px;
  gap: 34px;
  align-items: center;
  background: linear-gradient(135deg, #effdfa 0%, #ffffff 58%, #f6f8fb 100%);
}

.eyebrow {
  width: max-content;
  border-radius: 999px;
  padding: 8px 12px;
  background: #dff8ef;
  color: #0f766e;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 900;
}

.hero h1 {
  max-width: 840px;
  margin: 18px 0 15px;
  font-size: 52px;
  line-height: 1.08;
  letter-spacing: 0;
}

.hero p {
  max-width: 760px;
  color: #526179;
  font-size: 17px;
  line-height: 1.7;
}

.search-box {
  width: min(100%, 820px);
  min-height: 66px;
  margin-top: 28px;
  padding: 8px 8px 8px 17px;
  border: 1px solid #d7e0ec;
  border-radius: 16px;
  background: white;
  display: grid;
  grid-template-columns: 30px 1fr 32px 118px;
  align-items: center;
  gap: 8px;
  box-shadow: 0 18px 40px rgba(23, 32, 51, 0.08);
}

.search-box input {
  height: 48px;
  border: 0;
  outline: 0;
  color: #172033;
  font-weight: 750;
}

.search-box button:not(.ghost-icon),
.hero-actions button,
.section-head button,
.book-actions button,
.full-btn {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 15px;
  background: #0f766e;
  color: white;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.ghost-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #eef2f7;
  color: #64748b;
}

.hero-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-actions .secondary,
.book-actions .outline,
.section-head button {
  background: white;
  color: #0f766e;
  border: 1px solid #0f766e;
}

.hero-card {
  border: 1px solid #cdeee7;
  border-radius: 24px;
  background: white;
  padding: 22px;
  box-shadow: 0 24px 55px rgba(23, 32, 51, 0.1);
}

.reader-card,
.library-card {
  min-height: 180px;
  border-radius: 20px;
  padding: 22px;
  color: white;
  background: linear-gradient(135deg, #0b3d3a, #0f766e 58%, #14b8a6);
  display: grid;
  align-content: space-between;
}

.reader-card span,
.reader-card small,
.library-card span,
.library-card small {
  color: #cdfcf2;
}

.reader-card strong,
.library-card strong {
  font-size: 28px;
}

.metric-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-grid div,
.profile-panel div,
.detail-grid div {
  border-radius: 14px;
  background: #f7fafc;
  padding: 13px;
}

.metric-grid strong {
  display: block;
  margin-top: 7px;
  color: #172033;
  font-size: 24px;
}

.metric-grid span,
.profile-panel span,
.detail-grid span {
  color: #66758c;
  font-size: 12px;
  font-weight: 800;
}

.section {
  padding: 40px 48px;
}

.section-head {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.section-head span {
  color: #0f766e;
  font-weight: 950;
}

.section-head h2 {
  margin: 4px 0;
  font-size: 31px;
}

.section-head p {
  margin: 0;
  color: #64748b;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filters select {
  height: 42px;
  border: 1px solid #d7e0ec;
  border-radius: 12px;
  background: white;
  padding: 0 12px;
  color: #334155;
  font-weight: 850;
}

.empty {
  min-height: 220px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: white;
  color: #64748b;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 30px;
}

.empty h3 {
  margin: 10px 0 4px;
  color: #172033;
}

.borrow-grid,
.book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.borrow-card,
.book-card,
.table-card,
.profile-panel {
  border: 1px solid #e0e7ef;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 30px rgba(23, 32, 51, 0.06);
}

.borrow-card {
  padding: 18px;
}

.borrow-card > div:first-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.borrow-card h3 {
  margin: 14px 0 6px;
}

.borrow-card p {
  color: #64748b;
}

.borrow-card ul {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  list-style: none;
  color: #46566f;
}

.borrow-card li {
  display: flex;
  gap: 7px;
  align-items: center;
}

.book-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.book-card {
  overflow: hidden;
}

.cover {
  height: 230px;
  position: relative;
  background: #e7f8f4;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover span,
.status {
  border-radius: 999px;
  padding: 7px 10px;
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.cover span {
  position: absolute;
  left: 13px;
  bottom: 13px;
}

.cover span.out,
.status.overdue,
.status.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status.pending {
  background: #fef3c7;
  color: #b45309;
}

.status.borrowing {
  background: #dbeafe;
  color: #2563eb;
}

.book-body {
  padding: 16px;
}

.book-body small,
td small {
  display: block;
  color: #64748b;
}

.book-body h3 {
  min-height: 50px;
  margin: 8px 0 5px;
  line-height: 1.28;
}

.book-body p {
  margin: 0 0 12px;
  color: #526179;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copies {
  border-radius: 12px;
  background: #f1f5f9;
  padding: 9px 10px;
  color: #46566f;
  font-weight: 850;
}

.book-actions {
  margin-top: 13px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.book-actions button:disabled,
.full-btn:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.table-card {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  border-top: 1px solid #eef2f7;
  text-align: left;
}

th {
  border-top: 0;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
}

td {
  color: #334155;
}

.code {
  color: #0f766e;
  font-weight: 950;
}

.profile-grid {
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr);
  gap: 18px;
}

.library-card {
  min-height: 260px;
}

.profile-panel {
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.profile-panel strong,
.detail-grid b {
  display: block;
  margin-top: 6px;
  color: #172033;
}

.dialog-card {
  border-radius: 20px !important;
  padding: 22px;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.dialog-head h2 {
  margin: 0;
}

.dialog-head p {
  margin: 4px 0 0;
  color: #64748b;
}

.dialog-content {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 20px;
}

.dialog-content img {
  width: 100%;
  height: 320px;
  border-radius: 16px;
  object-fit: cover;
}

.detail-grid {
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.full-btn {
  width: 100%;
}

@media (max-width: 1180px) {
  .hero,
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .topbar {
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
  }

  .hero,
  .section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .search-box {
    grid-template-columns: 28px 1fr 32px;
  }

  .search-box button:not(.ghost-icon) {
    grid-column: 1 / -1;
  }

  .book-grid,
  .borrow-grid,
  .profile-panel,
  .dialog-content,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
