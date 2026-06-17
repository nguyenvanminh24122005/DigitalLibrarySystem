<template>
  <v-app>
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="brand">
          <v-icon size="30">mdi-library</v-icon>
          <span>
            <strong>Digital Library</strong>
            <small>Admin workspace</small>
          </span>
        </div>

        <nav>
          <button
            v-for="item in menu"
            :key="item.id"
            type="button"
            :class="{ active: currentTab === item.id }"
            @click="currentTab = item.id"
          >
            <v-icon size="21">{{ item.icon }}</v-icon>
            {{ item.label }}
            <small v-if="item.badge">{{ item.badge }}</small>
          </button>
        </nav>

        <div class="admin-card">
          <span class="avatar">A</span>
          <div>
            <strong>Admin Thư viện</strong>
            <small>admin@thuvien.com</small>
          </div>
        </div>
      </aside>

      <main class="workspace">
        <header class="topbar">
          <div>
            <span>Quản trị hệ thống</span>
            <h1>{{ currentTitle }}</h1>
          </div>

          <div class="top-actions">
            <label class="search">
              <v-icon size="20">mdi-magnify</v-icon>
              <input v-model="globalSearch" placeholder="Tìm sách, độc giả, mã phiếu..." />
            </label>
            <button type="button" @click="refresh">
              <v-icon size="19">mdi-refresh</v-icon>
              Làm mới
            </button>
            <button type="button" class="danger" @click="logout">
              <v-icon size="19">mdi-logout</v-icon>
            </button>
          </div>
        </header>

        <section v-if="currentTab === 'overview'" class="page">
          <div class="kpi-grid">
            <article v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
              <span :style="{ background: kpi.bg, color: kpi.color }">
                <v-icon size="28">{{ kpi.icon }}</v-icon>
              </span>
              <div>
                <small>{{ kpi.label }}</small>
                <strong>{{ kpi.value }}</strong>
                <p>{{ kpi.note }}</p>
              </div>
            </article>
          </div>

          <div class="overview-grid">
            <article class="panel chart-panel">
              <div class="panel-head">
                <div>
                  <h2>Hoạt động mượn trả</h2>
                  <p>Tổng hợp theo trạng thái phiếu hiện tại.</p>
                </div>
              </div>
              <div class="bar-chart">
                <div v-for="item in statusChart" :key="item.label">
                  <span>{{ item.label }}</span>
                  <i><b :style="{ width: item.width, background: item.color }"></b></i>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-head">
                <div>
                  <h2>Cảnh báo cần xử lý</h2>
                  <p>Yêu cầu mượn và phiếu quá hạn.</p>
                </div>
              </div>
              <div class="alert-list">
                <button v-for="item in urgentItems" :key="item.id" type="button" @click="currentTab = 'circulation'">
                  <v-icon size="22">{{ item.icon }}</v-icon>
                  <span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.desc }}</small>
                  </span>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-if="currentTab === 'books'" class="page">
          <div class="toolbar">
            <div>
              <h2>Quản lý sách</h2>
              <p>Thêm, chỉnh sửa, lọc và theo dõi số bản sách.</p>
            </div>
            <button type="button" @click="openBookForm()">
              <v-icon size="19">mdi-plus</v-icon>
              Thêm sách
            </button>
          </div>

          <div class="data-card">
            <table>
              <thead>
                <tr>
                  <th>Sách</th>
                  <th>Thể loại</th>
                  <th>ISBN</th>
                  <th>Bản còn</th>
                  <th>Vị trí</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in filteredBooks" :key="book.id">
                  <td class="book-cell">
                    <img :src="book.cover" :alt="book.title" @error="coverFallback" />
                    <span><strong>{{ book.title }}</strong><small>{{ book.author }} · {{ book.publisher }}</small></span>
                  </td>
                  <td>{{ book.category }}</td>
                  <td>{{ book.isbn }}</td>
                  <td><span class="pill" :class="{ red: Number(book.availableCopies) === 0 }">{{ book.availableCopies }}/{{ book.totalCopies }}</span></td>
                  <td>{{ book.location }}</td>
                  <td class="row-actions">
                    <button type="button" @click="openBookForm(book)"><v-icon size="18">mdi-pencil</v-icon></button>
                    <button type="button" class="red" @click="deleteBook(book.id)"><v-icon size="18">mdi-delete-outline</v-icon></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="currentTab === 'readers'" class="page">
          <div class="toolbar">
            <div>
              <h2>Quản lý độc giả</h2>
              <p>Hồ sơ độc giả và trạng thái thẻ thư viện.</p>
            </div>
            <button type="button" @click="openReaderForm()">
              <v-icon size="19">mdi-account-plus-outline</v-icon>
              Thêm độc giả
            </button>
          </div>

          <div class="reader-grid">
            <article v-for="reader in filteredReaders" :key="reader.id" class="reader-card">
              <div class="reader-head">
                <span>{{ initials(reader.name) }}</span>
                <button type="button" @click="openReaderForm(reader)"><v-icon size="18">mdi-pencil</v-icon></button>
              </div>
              <h3>{{ reader.name }}</h3>
              <p>{{ reader.email }}</p>
              <div class="reader-meta">
                <div><span>Mã thẻ</span><b>{{ reader.cardId }}</b></div>
                <div><span>Hết hạn</span><b>{{ reader.expireDate }}</b></div>
                <div><span>Trạng thái</span><b>{{ reader.status }}</b></div>
                <div><span>Đang mượn</span><b>{{ activeBorrowCount(reader.id) }}</b></div>
              </div>
            </article>
          </div>
        </section>

        <section v-if="currentTab === 'circulation'" class="page">
          <div class="toolbar">
            <div>
              <h2>Mượn trả</h2>
              <p>Duyệt yêu cầu, ghi nhận trả sách và theo dõi phí phạt.</p>
            </div>
            <select v-model="borrowFilter">
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="borrowing">Đang mượn</option>
              <option value="overdue">Quá hạn</option>
              <option value="returned">Đã trả</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div class="data-card">
            <table>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Độc giả</th>
                  <th>Sách</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Phạt</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredBorrows" :key="item.id">
                  <td class="code">{{ item.id }}</td>
                  <td>{{ item.readerName }}</td>
                  <td><strong>{{ item.bookTitle }}</strong><small>{{ item.note }}</small></td>
                  <td>{{ item.borrowDate || item.requestDate }}</td>
                  <td>{{ item.dueDate || '--' }}</td>
                  <td>{{ formatMoney(item.fine) }}</td>
                  <td><span class="status" :class="item.status">{{ statusText(item.status) }}</span></td>
                  <td class="row-actions">
                    <button v-if="item.status === 'pending'" type="button" @click="approve(item.id)"><v-icon size="18">mdi-check</v-icon></button>
                    <button v-if="item.status === 'pending'" type="button" class="red" @click="reject(item.id)"><v-icon size="18">mdi-close</v-icon></button>
                    <button v-if="['borrowing', 'overdue'].includes(item.status)" type="button" @click="returnBook(item.id)"><v-icon size="18">mdi-keyboard-return</v-icon></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="currentTab === 'reports'" class="page">
          <div class="toolbar">
            <div>
              <h2>Báo cáo</h2>
              <p>Nhìn nhanh hiệu suất kho sách, độc giả và công nợ.</p>
            </div>
            <button type="button" @click="exportReport">
              <v-icon size="19">mdi-download-outline</v-icon>
              Xuất báo cáo
            </button>
          </div>

          <div class="report-grid">
            <article class="panel">
              <h2>Sách theo thể loại</h2>
              <div class="bar-chart compact">
                <div v-for="item in categoryChart" :key="item.label">
                  <span>{{ item.label }}</span>
                  <i><b :style="{ width: item.width, background: '#0f766e' }"></b></i>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </article>
            <article class="panel">
              <h2>Tài chính</h2>
              <div class="finance-number">{{ formatMoney(totalFine) }}</div>
              <p>Tổng phí phạt đã ghi nhận trên toàn bộ phiếu mượn.</p>
            </article>
            <article class="panel">
              <h2>Sách khan hiếm</h2>
              <div class="mini-list">
                <div v-for="book in lowStockBooks" :key="book.id">
                  <strong>{{ book.title }}</strong>
                  <span>{{ book.availableCopies }}/{{ book.totalCopies }} bản</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-if="currentTab === 'settings'" class="page">
          <div class="toolbar">
            <div>
              <h2>Cài đặt vận hành</h2>
              <p>Thiết lập chính sách mượn trả cho toàn hệ thống.</p>
            </div>
            <button type="button" @click="saveSettingForm">
              <v-icon size="19">mdi-content-save-outline</v-icon>
              Lưu cài đặt
            </button>
          </div>

          <div class="settings-card">
            <label>
              Tên thư viện
              <input v-model="settingsForm.libraryName" />
            </label>
            <label>
              Số ngày mượn tối đa
              <input v-model.number="settingsForm.maxBorrowDays" type="number" min="1" />
            </label>
            <label>
              Số sách tối đa mỗi độc giả
              <input v-model.number="settingsForm.maxBooksPerReader" type="number" min="1" />
            </label>
            <label>
              Phí phạt mỗi ngày
              <input v-model.number="settingsForm.finePerDay" type="number" min="0" />
            </label>
          </div>
        </section>
      </main>
    </div>

    <v-dialog v-model="bookDialog" max-width="860">
      <v-card class="dialog-card">
        <div class="dialog-head">
          <div>
            <h2>{{ editingBookId ? 'Cập nhật sách' : 'Thêm sách mới' }}</h2>
            <p>Thông tin sẽ được lưu vào dữ liệu frontend.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="bookDialog = false" />
        </div>
        <form class="form-grid" @submit.prevent="saveBookForm">
          <label>Tên sách<input v-model="bookForm.title" required /></label>
          <label>Tác giả<input v-model="bookForm.author" required /></label>
          <label>ISBN<input v-model="bookForm.isbn" required /></label>
          <label>Thể loại<input v-model="bookForm.category" required /></label>
          <label>Nhà xuất bản<input v-model="bookForm.publisher" /></label>
          <label>Năm xuất bản<input v-model.number="bookForm.year" type="number" /></label>
          <label>Tổng bản<input v-model.number="bookForm.totalCopies" type="number" min="0" /></label>
          <label>Bản còn<input v-model.number="bookForm.availableCopies" type="number" min="0" /></label>
          <label>Vị trí<input v-model="bookForm.location" /></label>
          <label>Ảnh bìa URL<input v-model="bookForm.cover" /></label>
          <label class="full">Mô tả<textarea v-model="bookForm.description" rows="4"></textarea></label>
          <div class="dialog-actions">
            <button type="button" class="soft" @click="bookDialog = false">Hủy</button>
            <button type="submit">Lưu sách</button>
          </div>
        </form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="readerDialog" max-width="680">
      <v-card class="dialog-card">
        <div class="dialog-head">
          <div>
            <h2>{{ editingReaderId ? 'Cập nhật độc giả' : 'Thêm độc giả' }}</h2>
            <p>Tạo hoặc chỉnh sửa hồ sơ thẻ thư viện.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="readerDialog = false" />
        </div>
        <form class="form-grid" @submit.prevent="saveReaderForm">
          <label>Họ tên<input v-model="readerForm.name" required /></label>
          <label>Email<input v-model="readerForm.email" type="email" required /></label>
          <label>Số điện thoại<input v-model="readerForm.phone" /></label>
          <label>Mã thẻ<input v-model="readerForm.cardId" required /></label>
          <label>Ngày cấp<input v-model="readerForm.issueDate" type="date" /></label>
          <label>Ngày hết hạn<input v-model="readerForm.expireDate" type="date" /></label>
          <label class="full">Trạng thái<select v-model="readerForm.status"><option>Hoạt động</option><option>Tạm khóa</option></select></label>
          <div class="dialog-actions">
            <button type="button" class="soft" @click="readerDialog = false">Hủy</button>
            <button type="submit">Lưu độc giả</button>
          </div>
        </form>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="2600">
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  approveBorrow,
  formatMoney,
  getBooks,
  getBorrows,
  getReaders,
  getSettings,
  rejectBorrow,
  returnBorrow,
  saveBooks,
  saveReaders,
  saveSettings,
  statusText
} from '../services/libraryData'

const router = useRouter()

const books = ref([])
const readers = ref([])
const borrows = ref([])
const settings = ref({})
const currentTab = ref('overview')
const globalSearch = ref('')
const borrowFilter = ref('all')
const bookDialog = ref(false)
const readerDialog = ref(false)
const editingBookId = ref('')
const editingReaderId = ref('')
const snackbar = ref({ show: false, color: 'success', text: '' })

const bookForm = reactive({
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  year: new Date().getFullYear(),
  totalCopies: 1,
  availableCopies: 1,
  location: '',
  cover: '',
  description: ''
})

const readerForm = reactive({
  name: '',
  email: '',
  phone: '',
  cardId: '',
  status: 'Hoạt động',
  issueDate: '',
  expireDate: ''
})

const settingsForm = reactive({
  libraryName: '',
  maxBorrowDays: 14,
  maxBooksPerReader: 5,
  finePerDay: 5000
})

const pendingCount = computed(() => borrows.value.filter((item) => item.status === 'pending').length)
const overdueCount = computed(() => borrows.value.filter((item) => item.status === 'overdue').length)
const totalFine = computed(() => borrows.value.reduce((sum, item) => sum + Number(item.fine || 0), 0))

const menu = computed(() => [
  { id: 'overview', label: 'Tổng quan', icon: 'mdi-view-dashboard-outline' },
  { id: 'books', label: 'Sách', icon: 'mdi-bookshelf' },
  { id: 'readers', label: 'Độc giả', icon: 'mdi-account-group-outline' },
  { id: 'circulation', label: 'Mượn trả', icon: 'mdi-swap-horizontal', badge: pendingCount.value || '' },
  { id: 'reports', label: 'Báo cáo', icon: 'mdi-chart-box-outline' },
  { id: 'settings', label: 'Cài đặt', icon: 'mdi-cog-outline' }
])

const currentTitle = computed(() => menu.value.find((item) => item.id === currentTab.value)?.label || 'Tổng quan')

const searchText = computed(() => globalSearch.value.trim().toLowerCase())

const filteredBooks = computed(() => {
  return books.value.filter((book) => {
    if (!searchText.value) return true
    return [book.title, book.author, book.isbn, book.category].join(' ').toLowerCase().includes(searchText.value)
  })
})

const filteredReaders = computed(() => {
  return readers.value.filter((reader) => {
    if (!searchText.value) return true
    return [reader.name, reader.email, reader.cardId, reader.phone].join(' ').toLowerCase().includes(searchText.value)
  })
})

const filteredBorrows = computed(() => {
  return borrows.value.filter((item) => {
    const matchesStatus = borrowFilter.value === 'all' || item.status === borrowFilter.value
    const matchesSearch = !searchText.value || [item.id, item.readerName, item.bookTitle].join(' ').toLowerCase().includes(searchText.value)
    return matchesStatus && matchesSearch
  })
})

const kpis = computed(() => [
  {
    label: 'Tổng đầu sách',
    value: books.value.length,
    note: `${books.value.reduce((sum, item) => sum + Number(item.availableCopies || 0), 0)} bản còn sẵn sàng`,
    icon: 'mdi-bookshelf',
    bg: '#e7f8f4',
    color: '#0f766e'
  },
  {
    label: 'Độc giả',
    value: readers.value.length,
    note: `${readers.value.filter((item) => item.status === 'Hoạt động').length} thẻ hoạt động`,
    icon: 'mdi-account-group-outline',
    bg: '#e0f2fe',
    color: '#0369a1'
  },
  {
    label: 'Chờ duyệt',
    value: pendingCount.value,
    note: 'Yêu cầu cần thủ thư xử lý',
    icon: 'mdi-clock-alert-outline',
    bg: '#fef3c7',
    color: '#b45309'
  },
  {
    label: 'Quá hạn',
    value: overdueCount.value,
    note: `${formatMoney(totalFine.value)} phí phạt`,
    icon: 'mdi-alert-outline',
    bg: '#fee2e2',
    color: '#dc2626'
  }
])

const statusChart = computed(() => {
  const colors = {
    pending: '#d97706',
    borrowing: '#2563eb',
    overdue: '#dc2626',
    returned: '#16a34a',
    rejected: '#64748b'
  }
  const max = Math.max(1, ...Object.keys(colors).map((status) => borrows.value.filter((item) => item.status === status).length))

  return Object.keys(colors).map((status) => {
    const value = borrows.value.filter((item) => item.status === status).length
    return {
      label: statusText(status),
      value,
      width: `${Math.max(8, (value / max) * 100)}%`,
      color: colors[status]
    }
  })
})

const categoryChart = computed(() => {
  const groups = books.value.reduce((map, book) => {
    map[book.category] = (map[book.category] || 0) + 1
    return map
  }, {})
  const max = Math.max(1, ...Object.values(groups))

  return Object.entries(groups).map(([label, value]) => ({
    label,
    value,
    width: `${Math.max(8, (value / max) * 100)}%`
  }))
})

const lowStockBooks = computed(() => {
  return [...books.value].filter((book) => Number(book.availableCopies) <= 2).slice(0, 6)
})

const urgentItems = computed(() => {
  const items = []
  if (pendingCount.value) {
    items.push({ id: 'pending', icon: 'mdi-clock-outline', title: `${pendingCount.value} yêu cầu chờ duyệt`, desc: 'Cần xác nhận để độc giả nhận sách.' })
  }
  if (overdueCount.value) {
    items.push({ id: 'overdue', icon: 'mdi-alert-circle-outline', title: `${overdueCount.value} phiếu quá hạn`, desc: 'Nên nhắc trả và cập nhật phí phạt.' })
  }
  if (!items.length) {
    items.push({ id: 'ok', icon: 'mdi-check-circle-outline', title: 'Vận hành ổn định', desc: 'Không có cảnh báo nghiêm trọng.' })
  }
  return items
})

const refresh = () => {
  books.value = getBooks()
  readers.value = getReaders()
  borrows.value = getBorrows()
  settings.value = getSettings()
  Object.assign(settingsForm, settings.value)
}

const notify = (text, color = 'success') => {
  snackbar.value = { show: true, color, text }
}

const resetBookForm = () => {
  Object.assign(bookForm, {
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    year: new Date().getFullYear(),
    totalCopies: 1,
    availableCopies: 1,
    location: '',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
    description: ''
  })
}

const openBookForm = (book = null) => {
  editingBookId.value = book?.id || ''
  resetBookForm()
  if (book) Object.assign(bookForm, book)
  bookDialog.value = true
}

const saveBookForm = () => {
  const nextBooks = [...books.value]
  const payload = {
    ...bookForm,
    id: editingBookId.value || `B${Date.now()}`,
    totalCopies: Number(bookForm.totalCopies || 0),
    availableCopies: Math.min(Number(bookForm.availableCopies || 0), Number(bookForm.totalCopies || 0))
  }

  const index = nextBooks.findIndex((item) => item.id === payload.id)
  if (index >= 0) nextBooks[index] = payload
  else nextBooks.unshift(payload)

  saveBooks(nextBooks)
  bookDialog.value = false
  refresh()
  notify('Đã lưu thông tin sách.')
}

const deleteBook = (id) => {
  saveBooks(books.value.filter((book) => book.id !== id))
  refresh()
  notify('Đã xóa sách khỏi danh mục.', 'warning')
}

const resetReaderForm = () => {
  const year = new Date().getFullYear()
  Object.assign(readerForm, {
    name: '',
    email: '',
    phone: '',
    cardId: `LIB-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Hoạt động',
    issueDate: new Date().toISOString().slice(0, 10),
    expireDate: `${year + 1}-12-31`
  })
}

const openReaderForm = (reader = null) => {
  editingReaderId.value = reader?.id || ''
  resetReaderForm()
  if (reader) Object.assign(readerForm, reader)
  readerDialog.value = true
}

const saveReaderForm = () => {
  const nextReaders = [...readers.value]
  const payload = { ...readerForm, id: editingReaderId.value || `R${Date.now()}` }
  const index = nextReaders.findIndex((item) => item.id === payload.id)
  if (index >= 0) nextReaders[index] = payload
  else nextReaders.unshift(payload)

  saveReaders(nextReaders)
  readerDialog.value = false
  refresh()
  notify('Đã lưu hồ sơ độc giả.')
}

const approve = (id) => {
  if (approveBorrow(id)) notify('Đã duyệt phiếu mượn.')
  else notify('Không thể duyệt phiếu này.', 'error')
  refresh()
}

const reject = (id) => {
  rejectBorrow(id)
  refresh()
  notify('Đã từ chối yêu cầu mượn.', 'warning')
}

const returnBook = (id) => {
  returnBorrow(id)
  refresh()
  notify('Đã ghi nhận trả sách.')
}

const saveSettingForm = () => {
  saveSettings({ ...settingsForm })
  refresh()
  notify('Đã lưu cài đặt vận hành.')
}

const activeBorrowCount = (readerId) => {
  return borrows.value.filter((item) => item.readerId === readerId && ['pending', 'borrowing', 'overdue'].includes(item.status)).length
}

const initials = (name) => String(name || 'DG').split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase()

const coverFallback = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=600&auto=format&fit=crop'
}

const exportReport = () => {
  const rows = [
    ['Chi so', 'Gia tri'],
    ['Tong dau sach', books.value.length],
    ['Doc gia', readers.value.length],
    ['Phieu muon', borrows.value.length],
    ['Cho duyet', pendingCount.value],
    ['Qua han', overdueCount.value],
    ['Tong phi phat', totalFine.value]
  ]
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bao-cao-thu-vien-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const logout = () => {
  ;['token', 'accessToken', 'role', 'user', 'library_current_user', 'library_auth_user', 'isAdmin'].forEach((key) => localStorage.removeItem(key))
  router.push('/login')
}

onMounted(refresh)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-shell {
  min-height: 100vh;
  background: #f5f7fb;
  color: #172033;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  font-family: Inter, Segoe UI, sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

.sidebar {
  min-height: 100vh;
  padding: 22px 16px;
  background: #123631;
  color: white;
  position: sticky;
  top: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 8px;
  color: #99f6e4;
}

.brand span {
  display: grid;
}

.brand strong {
  color: white;
  font-size: 18px;
}

.brand small,
.admin-card small {
  color: #b6d6cf;
}

nav {
  display: grid;
  gap: 7px;
}

nav button,
.top-actions button,
.toolbar button,
.row-actions button,
.dialog-actions button,
.alert-list button {
  border: 0;
  cursor: pointer;
}

nav button {
  min-height: 46px;
  border-radius: 12px;
  padding: 0 12px;
  background: transparent;
  color: #cce5df;
  display: flex;
  align-items: center;
  gap: 11px;
  font-weight: 850;
  text-align: left;
}

nav button.active,
nav button:hover {
  background: #0f766e;
  color: white;
}

nav button small {
  min-width: 24px;
  height: 24px;
  margin-left: auto;
  border-radius: 999px;
  background: #f97316;
  display: grid;
  place-items: center;
  color: white;
}

.admin-card {
  border-radius: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 11px;
}

.avatar,
.reader-head span {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #ccfbf1;
  color: #0f766e;
  display: grid;
  place-items: center;
  font-weight: 950;
}

.workspace {
  min-width: 0;
}

.topbar {
  min-height: 82px;
  padding: 16px 28px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #dde5ef;
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar span,
.toolbar p,
.panel p {
  color: #64748b;
}

.topbar h1,
.toolbar h2,
.panel h2 {
  margin: 2px 0 0;
  color: #172033;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search {
  height: 44px;
  min-width: 330px;
  border: 1px solid #d7e0ec;
  border-radius: 13px;
  background: white;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #172033;
}

.top-actions button,
.toolbar button,
.dialog-actions button {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 14px;
  background: #0f766e;
  color: white;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.top-actions .danger {
  width: 42px;
  padding: 0;
  background: #fee2e2;
  color: #dc2626;
}

.page {
  padding: 26px 28px 36px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card,
.panel,
.data-card,
.reader-card,
.settings-card {
  border: 1px solid #e0e7ef;
  border-radius: 18px;
  background: white;
  box-shadow: 0 14px 30px rgba(23, 32, 51, 0.055);
}

.kpi-card {
  padding: 18px;
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 14px;
}

.kpi-card > span {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
}

.kpi-card small,
.reader-meta span {
  color: #64748b;
  font-weight: 850;
}

.kpi-card strong {
  display: block;
  margin-top: 4px;
  font-size: 31px;
}

.kpi-card p {
  margin: 4px 0 0;
  color: #64748b;
}

.overview-grid,
.report-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(360px, 0.7fr);
  gap: 18px;
}

.report-grid {
  grid-template-columns: 1.2fr 0.8fr 1fr;
}

.panel {
  padding: 20px;
}

.panel-head {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.bar-chart {
  display: grid;
  gap: 14px;
}

.bar-chart div {
  display: grid;
  grid-template-columns: 120px 1fr 38px;
  align-items: center;
  gap: 12px;
}

.bar-chart.compact div {
  grid-template-columns: 110px 1fr 32px;
}

.bar-chart span {
  color: #46566f;
  font-weight: 850;
}

.bar-chart i {
  height: 12px;
  border-radius: 999px;
  background: #edf2f7;
  overflow: hidden;
}

.bar-chart b {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.alert-list,
.mini-list {
  display: grid;
  gap: 10px;
}

.alert-list button,
.mini-list div {
  border: 1px solid #e0e7ef;
  border-radius: 14px;
  background: #f8fafc;
  padding: 13px;
}

.alert-list button {
  color: #172033;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  text-align: left;
}

.alert-list small,
.mini-list span {
  display: block;
  margin-top: 3px;
  color: #64748b;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.toolbar select,
.settings-card input,
.settings-card select,
.form-grid input,
.form-grid select,
.form-grid textarea {
  width: 100%;
  min-height: 42px;
  border: 1px solid #d7e0ec;
  border-radius: 12px;
  background: white;
  padding: 0 12px;
  color: #172033;
  outline: 0;
}

.data-card {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  border-top: 1px solid #edf2f7;
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

td small {
  display: block;
  margin-top: 3px;
  color: #64748b;
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.book-cell img {
  width: 48px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
}

.pill,
.status {
  border-radius: 999px;
  padding: 7px 10px;
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.pill.red,
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

.code {
  color: #0f766e;
  font-weight: 950;
}

.row-actions {
  display: flex;
  gap: 7px;
}

.row-actions button {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #e7f8f4;
  color: #0f766e;
  display: grid;
  place-items: center;
}

.row-actions button.red {
  background: #fee2e2;
  color: #dc2626;
}

.reader-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.reader-card {
  padding: 18px;
}

.reader-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reader-head button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  cursor: pointer;
}

.reader-card h3 {
  margin: 15px 0 4px;
}

.reader-card p {
  margin: 0 0 14px;
  color: #64748b;
}

.reader-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.reader-meta div,
.settings-card label {
  border-radius: 13px;
  background: #f8fafc;
  padding: 12px;
}

.reader-meta b {
  display: block;
  margin-top: 4px;
}

.finance-number {
  color: #0f766e;
  font-size: 44px;
  font-weight: 950;
}

.settings-card {
  max-width: 860px;
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.settings-card label,
.form-grid label {
  color: #334155;
  font-weight: 850;
}

.settings-card input,
.form-grid input,
.form-grid select,
.form-grid textarea {
  margin-top: 8px;
}

.dialog-card {
  border-radius: 20px !important;
  padding: 22px;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.dialog-head h2 {
  margin: 0;
}

.dialog-head p {
  margin: 4px 0 0;
  color: #64748b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.form-grid .full,
.dialog-actions {
  grid-column: 1 / -1;
}

.form-grid textarea {
  padding-top: 10px;
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-actions .soft {
  background: #eef2f7;
  color: #334155;
}

@media (max-width: 1180px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    min-height: auto;
    position: static;
    grid-template-rows: auto auto;
  }

  .admin-card {
    display: none;
  }

  nav {
    grid-template-columns: repeat(3, 1fr);
  }

  .kpi-grid,
  .reader-grid,
  .overview-grid,
  .report-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .topbar,
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .top-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .search {
    min-width: 0;
    width: 100%;
  }

  nav,
  .kpi-grid,
  .reader-grid,
  .overview-grid,
  .report-grid,
  .settings-card,
  .form-grid,
  .reader-meta {
    grid-template-columns: 1fr;
  }
}
</style>
