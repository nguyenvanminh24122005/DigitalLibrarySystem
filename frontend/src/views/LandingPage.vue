<template>
  <div class="user-main-page">
    <!-- HEADER -->
    <header class="user-header">
      <button class="brand" type="button" @click="scrollToSection('top')">
        <v-icon size="34">mdi-book-open-page-variant</v-icon>
        <span>
          <b>Thư viện số</b>
          <small>Digital Library</small>
        </span>
      </button>

      <nav class="user-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          :class="{ active: activeSection === item.id }"
          @click="scrollToSection(item.id)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="header-actions">
        <button class="icon-btn" type="button" title="Làm mới dữ liệu" @click="refreshAll">
          <v-icon size="22">mdi-refresh</v-icon>
        </button>

        <button class="icon-btn has-badge" type="button" title="Thông báo" @click="showNotifications = !showNotifications">
          <v-icon size="22">mdi-bell-outline</v-icon>
          <span v-if="notifications.length">{{ notifications.length }}</span>
        </button>

        <button v-if="currentUser" class="user-pill" type="button" @click="showUserMenu = !showUserMenu">
          <span class="avatar">{{ userInitial }}</span>
          <div>
            <b>{{ userName }}</b>
            <small>{{ libraryCardNumber }}</small>
          </div>
          <v-icon size="18">mdi-chevron-down</v-icon>
        </button>

        <div v-else class="auth-buttons">
          <button type="button" @click="goLogin">Đăng nhập</button>
          <button type="button" class="solid" @click="goRegister">Đăng ký</button>
        </div>

        <div v-if="showUserMenu" class="user-menu">
          <button type="button" @click="scrollToSection('card')">
            <v-icon size="18">mdi-card-account-details-outline</v-icon>
            Thẻ của tôi
          </button>

          <button type="button" @click="scrollToSection('history')">
            <v-icon size="18">mdi-history</v-icon>
            Lịch sử mượn
          </button>

          <button type="button" @click="logout">
            <v-icon size="18">mdi-logout</v-icon>
            Đăng xuất
          </button>
        </div>

        <div v-if="showNotifications" class="notification-panel">
          <div class="panel-head">
            <b>Thông báo</b>
            <button type="button" @click="showNotifications = false">
              <v-icon size="18">mdi-close</v-icon>
            </button>
          </div>

          <div v-if="notifications.length === 0" class="empty-noti">
            Chưa có thông báo mới.
          </div>

          <div v-else class="noti-list">
            <div v-for="noti in notifications" :key="noti.id">
              <v-icon size="20">{{ noti.icon }}</v-icon>
              <div>
                <b>{{ noti.title }}</b>
                <p>{{ noti.message }}</p>
                <small>{{ noti.time }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO + QUICK STATUS -->
    <main id="top">
      <section class="hero-section">
        <div class="hero-left">
          <span class="welcome-chip">
            <v-icon size="18">mdi-account-heart-outline</v-icon>
            Không gian độc giả
          </span>

          <h1>
            Chào mừng trở lại,
            <span>{{ userName }}</span>
          </h1>

          <p>
            Tìm kiếm sách, đặt mượn tài liệu, theo dõi phiếu mượn hiện tại,
            kiểm tra lịch sử và trạng thái thẻ thư viện ngay trên một trang.
          </p>

          <div class="hero-search">
            <v-icon size="28">mdi-magnify</v-icon>
            <input
              v-model="searchText"
              placeholder="Tìm sách theo tên, tác giả hoặc ISBN..."
              @keyup.enter="scrollToSection('books')"
            />

            <button v-if="searchText" type="button" class="clear-btn" @click="searchText = ''">
              <v-icon size="18">mdi-close</v-icon>
            </button>

            <button type="button" class="search-btn" @click="scrollToSection('books')">
              Tìm kiếm
            </button>
          </div>

          <div class="hero-actions">
            <button type="button" class="primary-action" @click="scrollToSection('books')">
              <v-icon size="20">mdi-book-search-outline</v-icon>
              Tìm tài liệu
            </button>

            <button type="button" class="secondary-action" @click="scrollToSection('history')">
              <v-icon size="20">mdi-history</v-icon>
              Xem phiếu mượn
            </button>
          </div>
        </div>

        <div class="reader-overview-card">
          <div class="overview-top">
            <span class="reader-avatar">{{ userInitial }}</span>
            <div>
              <b>{{ userName }}</b>
              <small>{{ libraryCardNumber }}</small>
            </div>
          </div>

          <div class="card-preview">
            <span>Thẻ thư viện điện tử</span>
            <strong>{{ libraryCardNumber }}</strong>
            <p>{{ cardStatusText }}</p>
          </div>

          <div class="overview-stats">
            <div>
              <b>{{ books.length }}</b>
              <span>Tổng sách</span>
            </div>

            <div>
              <b>{{ activeBorrowRecords.length }}</b>
              <span>Đang mượn</span>
            </div>

            <div>
              <b>{{ pendingBorrowRecords.length }}</b>
              <span>Chờ duyệt</span>
            </div>

            <div>
              <b>{{ formatMoney(totalFineDebt) }}</b>
              <span>Công nợ</span>
            </div>
          </div>
        </div>
      </section>

      <!-- QUICK BORROW STATUS -->
      <section id="status" class="section-block">
        <div class="section-head">
          <div>
            <span>Trạng thái hiện tại</span>
            <h2>Phiếu mượn của tôi</h2>
          </div>

          <button type="button" @click="refreshBorrows">
            <v-icon size="18">mdi-refresh</v-icon>
            Làm mới
          </button>
        </div>

        <div v-if="currentBorrowCards.length === 0" class="empty-card">
          <v-icon size="58">mdi-book-check-outline</v-icon>
          <h3>Bạn chưa có phiếu mượn đang hoạt động</h3>
          <p>Hãy tìm sách bên dưới và bấm “Đặt mượn” để gửi yêu cầu tới thủ thư.</p>
        </div>

        <div v-else class="borrow-status-grid">
          <article
            v-for="record in currentBorrowCards"
            :key="record.id"
            class="borrow-status-card"
            :class="record.status"
          >
            <div class="borrow-card-top">
              <span class="status-badge" :class="record.status">
                {{ statusText(record.status) }}
              </span>
              <small>{{ record.borrowId }}</small>
            </div>

            <h3>{{ record.bookTitle }}</h3>
            <p>{{ record.isbn || record.bookId }}</p>

            <div class="borrow-info">
              <span>
                <v-icon size="17">mdi-calendar-start</v-icon>
                Ngày mượn: <b>{{ record.borrowDate || '--' }}</b>
              </span>

              <span>
                <v-icon size="17">mdi-calendar-end</v-icon>
                Hạn trả: <b>{{ record.dueDate || '--' }}</b>
              </span>

              <span v-if="record.overdueDays > 0" class="danger">
                <v-icon size="17">mdi-alert-outline</v-icon>
                Quá hạn {{ record.overdueDays }} ngày
              </span>
            </div>
          </article>
        </div>
      </section>

      <!-- BOOK SEARCH -->
      <section id="books" class="section-block books-section">
        <div class="section-head">
          <div>
            <span>Tài liệu</span>
            <h2>Kho sách thư viện</h2>
            <p>Hiển thị {{ filteredBooks.length }} kết quả phù hợp</p>
          </div>

          <div class="filter-actions">
            <select v-model="selectedCategory">
              <option value="all">Tất cả thể loại</option>
              <option v-for="category in categoryOptions" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <select v-model="selectedYear">
              <option value="all">Tất cả năm</option>
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>

            <button type="button" @click="refreshBooks">
              <v-icon size="18">mdi-refresh</v-icon>
              Tải sách
            </button>
          </div>
        </div>

        <div v-if="booksLoading" class="empty-card">
          <v-progress-circular indeterminate color="#0d9488" size="48" />
          <h3>Đang tải sách...</h3>
        </div>

        <div v-else-if="filteredBooks.length === 0" class="empty-card">
          <v-icon size="60">mdi-book-off-outline</v-icon>
          <h3>Chưa có sách để hiển thị</h3>
          <p>
            Nếu dùng dữ liệu thật, hãy kiểm tra API nhóm 1 hoặc thêm sách trong trang Admin.
          </p>
        </div>

        <div v-else class="book-grid">
          <article v-for="book in visibleBooks" :key="book.id" class="book-card">
            <div class="cover">
              <img v-if="book.coverImage" :src="book.coverImage" :alt="book.title" @error="onCoverError" />
              <v-icon v-else size="54">mdi-book-open-page-variant</v-icon>

              <span class="book-status" :class="book.status">
                {{ book.availableCopies > 0 ? 'Còn sách' : 'Hết sách' }}
              </span>
            </div>

            <div class="book-body">
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>

              <div class="book-meta">
                <span>{{ book.category }}</span>
                <span>{{ book.year || '---' }}</span>
                <span>{{ book.availableCopies }} / {{ book.totalCopies }} bản</span>
              </div>

              <div class="book-actions">
                <button type="button" class="outline" @click="openBookDetail(book)">
                  Xem chi tiết
                </button>

                <button
                  type="button"
                  :disabled="!canBorrowBook(book)"
                  @click="reserveBook(book)"
                >
                  {{ borrowButtonText(book) }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="filteredBooks.length > bookLimit" class="show-more-wrap">
          <button type="button" @click="showAllBooks = !showAllBooks">
            {{ showAllBooks ? 'Thu gọn' : 'Xem thêm sách' }}
            <v-icon size="18">{{ showAllBooks ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </button>
        </div>
      </section>

      <!-- HISTORY -->
      <section id="history" class="section-block">
        <div class="section-head">
          <div>
            <span>Lịch sử</span>
            <h2>Lịch sử mượn trả</h2>
            <p>Theo dõi trạng thái phiếu mượn và phí phạt phát sinh</p>
          </div>

          <div class="filter-actions">
            <select v-model="borrowStatusFilter">
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="borrowing">Đang mượn</option>
              <option value="returned">Đã trả</option>
              <option value="overdue">Quá hạn</option>
            </select>

            <button type="button" @click="exportHistory">
              <v-icon size="18">mdi-download-outline</v-icon>
              Xuất CSV
            </button>
          </div>
        </div>

        <div v-if="filteredBorrowRecords.length === 0" class="empty-card">
          <v-icon size="58">mdi-history</v-icon>
          <h3>Chưa có lịch sử mượn trả</h3>
          <p>Những phiếu bạn đặt mượn sẽ hiển thị tại đây.</p>
        </div>

        <div v-else class="history-table-card">
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
              <tr v-for="record in filteredBorrowRecords" :key="record.id">
                <td class="code">{{ record.borrowId }}</td>
                <td>
                  <b>{{ record.bookTitle }}</b>
                  <small>{{ record.isbn || record.bookId }}</small>
                </td>
                <td>{{ record.borrowDate || '--' }}</td>
                <td>{{ record.dueDate || '--' }}</td>
                <td>{{ record.returnDate || 'Chưa trả' }}</td>
                <td>{{ formatMoney(record.fineAmount) }}</td>
                <td>
                  <span class="status-badge" :class="record.status">
                    {{ statusText(record.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- CARD -->
      <section id="card" class="section-block">
        <div class="section-head">
          <div>
            <span>Thẻ thư viện</span>
            <h2>Thông tin độc giả</h2>
          </div>
        </div>

        <div class="profile-grid">
          <div class="library-card">
            <div class="card-brand">
              <v-icon size="34">mdi-book-open-page-variant</v-icon>
              <span>Digital Library</span>
            </div>

            <div class="card-number">{{ libraryCardNumber }}</div>

            <div class="card-bottom">
              <div>
                <small>Chủ thẻ</small>
                <b>{{ userName }}</b>
              </div>

              <div>
                <small>Trạng thái</small>
                <b>{{ cardStatusText }}</b>
              </div>
            </div>
          </div>

          <div class="profile-info">
            <div>
              <span>Họ tên</span>
              <b>{{ userName }}</b>
            </div>

            <div>
              <span>Email</span>
              <b>{{ currentUser?.email || '--' }}</b>
            </div>

            <div>
              <span>Mã thẻ</span>
              <b>{{ libraryCardNumber }}</b>
            </div>

            <div>
              <span>Ngày hết hạn</span>
              <b>{{ cardExpiredAt || 'Chưa cập nhật' }}</b>
            </div>

            <div>
              <span>Sách đang mượn</span>
              <b>{{ activeBorrowRecords.length }}</b>
            </div>

            <div>
              <span>Công nợ phí phạt</span>
              <b>{{ formatMoney(totalFineDebt) }}</b>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- DETAIL DIALOG -->
    <v-dialog v-model="bookDetailDialog" max-width="760">
      <v-card class="book-detail-dialog">
        <div class="dialog-head">
          <div>
            <h2>Chi tiết sách</h2>
            <p>{{ selectedBook?.isbn }}</p>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="bookDetailDialog = false" />
        </div>

        <div v-if="selectedBook" class="book-detail-content">
          <div class="detail-cover">
            <img v-if="selectedBook.coverImage" :src="selectedBook.coverImage" :alt="selectedBook.title" />
            <v-icon v-else size="72">mdi-book-open-page-variant</v-icon>
          </div>

          <div class="detail-info">
            <span class="book-status" :class="selectedBook.status">
              {{ selectedBook.availableCopies > 0 ? 'Còn sách' : 'Hết sách' }}
            </span>

            <h3>{{ selectedBook.title }}</h3>
            <p>{{ selectedBook.description || 'Chưa có mô tả cho tài liệu này.' }}</p>

            <div class="detail-grid">
              <div>
                <span>Tác giả</span>
                <b>{{ selectedBook.author }}</b>
              </div>

              <div>
                <span>Nhà xuất bản</span>
                <b>{{ selectedBook.publisher || '--' }}</b>
              </div>

              <div>
                <span>Năm XB</span>
                <b>{{ selectedBook.year || '--' }}</b>
              </div>

              <div>
                <span>Bản sao</span>
                <b>{{ selectedBook.availableCopies }} / {{ selectedBook.totalCopies }}</b>
              </div>
            </div>

            <button
              type="button"
              class="detail-borrow-btn"
              :disabled="!canBorrowBook(selectedBook)"
              @click="reserveBook(selectedBook)"
            >
              {{ borrowButtonText(selectedBook) }}
            </button>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2800" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || '/api'
const CIRCULATION_API_URL = import.meta.env.VITE_CIRCULATION_API_URL || '/api'
const finePerDay = Number(JSON.parse(localStorage.getItem('library_borrow_policy') || '{}')?.finePerDay || import.meta.env.VITE_FINE_PER_DAY || 5000)

const navItems = [
  { id: 'top', label: 'Trang chủ' },
  { id: 'books', label: 'Tài liệu' },
  { id: 'status', label: 'Phiếu mượn' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'card', label: 'Thẻ của tôi' }
]

const books = ref([])
const borrowRecords = ref([])
const currentUser = ref(null)
const searchText = ref('')
const selectedCategory = ref('all')
const selectedYear = ref('all')
const borrowStatusFilter = ref('all')
const activeSection = ref('top')
const booksLoading = ref(false)
const showAllBooks = ref(false)
const bookLimit = 8
const showUserMenu = ref(false)
const showNotifications = ref(false)
const bookDetailDialog = ref(false)
const selectedBook = ref(null)

const snackbar = ref({
  show: false,
  text: '',
  color: '#0d9488'
})

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const getAuthUser = () => {
  return (
    readJson('library_current_user', null) ||
    readJson('library_auth_user', null) ||
    readJson('user', null)
  )
}

const userName = computed(() => {
  return currentUser.value?.name || currentUser.value?.fullName || 'Độc giả'
})

const userInitial = computed(() => {
  return userName.value.trim().charAt(0).toUpperCase() || 'U'
})

const libraryCardNumber = computed(() => {
  return (
    currentUser.value?.cardId ||
    currentUser.value?.libraryCardNumber ||
    currentUser.value?.libraryCard?.cardId ||
    'Chưa có thẻ'
  )
})

const cardExpiredAt = computed(() => {
  return currentUser.value?.cardExpiredAt || currentUser.value?.expiredAt || currentUser.value?.libraryCard?.expiredAt || ''
})

const cardStatusText = computed(() => {
  const status = String(currentUser.value?.status || currentUser.value?.cardStatus || 'active').toLowerCase()
  if (status.includes('lock') || status.includes('khóa')) return 'Đang khóa'
  return 'Đang hoạt động'
})

const categoryOptions = computed(() => {
  return [...new Set(books.value.map((book) => book.category).filter(Boolean))]
})

const yearOptions = computed(() => {
  return [...new Set(books.value.map((book) => book.year).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a))
})

const filteredBooks = computed(() => {
  const keyword = searchText.value.toLowerCase().trim()

  return books.value.filter((book) => {
    const matchKeyword =
      !keyword ||
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.isbn.toLowerCase().includes(keyword)

    const matchCategory = selectedCategory.value === 'all' || book.category === selectedCategory.value
    const matchYear = selectedYear.value === 'all' || String(book.year) === String(selectedYear.value)

    return matchKeyword && matchCategory && matchYear
  })
})

const visibleBooks = computed(() => {
  if (showAllBooks.value) return filteredBooks.value
  return filteredBooks.value.slice(0, bookLimit)
})

const pendingBorrowRecords = computed(() => {
  return borrowRecords.value.filter((item) => item.status === 'pending')
})

const activeBorrowRecords = computed(() => {
  return borrowRecords.value.filter((item) => item.status === 'borrowing' || item.status === 'overdue')
})

const currentBorrowCards = computed(() => {
  return borrowRecords.value
    .filter((item) => ['pending', 'borrowing', 'overdue'].includes(item.status))
    .slice(0, 3)
})

const filteredBorrowRecords = computed(() => {
  if (borrowStatusFilter.value === 'all') return borrowRecords.value
  return borrowRecords.value.filter((item) => item.status === borrowStatusFilter.value)
})

const totalFineDebt = computed(() => {
  return borrowRecords.value
    .filter((item) => Number(item.fineAmount || 0) > 0 && !item.finePaid)
    .reduce((sum, item) => sum + Number(item.fineAmount || 0), 0)
})

const notifications = computed(() => {
  const list = []

  pendingBorrowRecords.value.forEach((item) => {
    list.push({
      id: `pending-${item.id}`,
      icon: 'mdi-timer-sand',
      title: 'Phiếu đang chờ duyệt',
      message: `${item.bookTitle} đang chờ thủ thư xác nhận.`,
      time: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'
    })
  })

  activeBorrowRecords.value.forEach((item) => {
    if (item.status === 'overdue') {
      list.push({
        id: `overdue-${item.id}`,
        icon: 'mdi-alert-outline',
        title: 'Sách quá hạn',
        message: `${item.bookTitle} đã quá hạn ${item.overdueDays} ngày.`,
        time: 'Cần xử lý'
      })
    }
  })

  return list.slice(0, 8)
})

watch([searchText, selectedCategory, selectedYear], () => {
  showAllBooks.value = false
})

const apiFetch = async (baseUrl, path, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('library_token')

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  if (response.status === 204) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const unwrapList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.books)) return data.books
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.borrows)) return data.borrows
  return []
}

const getBookStatus = (availableCopies, totalCopies) => {
  const available = Number(availableCopies || 0)
  const total = Number(totalCopies || 0)
  if (available <= 0 || total <= 0) return 'out'
  if (available <= 2) return 'low'
  return 'available'
}

const normalizeBook = (book = {}) => {
  const totalCopies = Number(book.totalCopies ?? book.copyCount ?? book.copies ?? book.quantity ?? 0)
  const availableCopies = Number(book.availableCopies ?? book.availableCopyCount ?? book.available ?? book.remainingCopies ?? 0)

  return {
    id: book.id ?? book.bookId ?? book.isbn ?? `BOOK-${Date.now()}`,
    bookId: book.bookId ?? book.id ?? book.isbn ?? '',
    isbn: book.isbn ?? book.ISBN ?? '',
    title: book.title ?? book.name ?? book.bookTitle ?? 'Chưa có tiêu đề',
    author: book.author ?? book.authors ?? 'Chưa cập nhật',
    publisher: book.publisher ?? book.publisherName ?? book.nxb ?? '',
    year: Number(book.year ?? book.publishYear ?? book.publishedYear ?? 0),
    category: book.category ?? book.categoryName ?? book.genre ?? 'Chưa phân loại',
    totalCopies,
    availableCopies,
    coverImage: book.coverImage ?? book.coverUrl ?? book.imageUrl ?? book.thumbnail ?? '',
    description: book.description ?? book.summary ?? '',
    status: getBookStatus(availableCopies, totalCopies)
  }
}

const parseDate = (value) => {
  if (!value) return null
  if (String(value).includes('/')) {
    const [day, month, year] = String(value).split('/')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(value)
}

const formatDateInput = (date = new Date()) => {
  const value = new Date(date)
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDateVi = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN')
}

const daysBetween = (from, to) => {
  const d1 = parseDate(from)
  const d2 = parseDate(to)
  if (!d1 || !d2 || Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0
  return Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

const normalizeBorrow = (item = {}) => {
  const borrowDateRaw = item.borrowDate || item.borrowedAt || item.createdAt || ''
  const dueDateRaw = item.dueDate || item.deadline || item.expectedReturnDate || ''
  const returnDateRaw = item.returnDate || item.returnedAt || ''

  let status = item.status || 'pending'
  if (['Chờ duyệt', 'pending'].includes(status)) status = 'pending'
  if (['Đang mượn', 'borrowing', 'borrowed'].includes(status)) status = 'borrowing'
  if (['Đã trả', 'returned'].includes(status)) status = 'returned'
  if (['Quá hạn', 'overdue'].includes(status)) status = 'overdue'

  const borrowDate = formatDateVi(borrowDateRaw)
  const dueDate = formatDateVi(dueDateRaw)
  const returnDate = returnDateRaw ? formatDateVi(returnDateRaw) : ''
  const overdueDays = returnDate || status === 'borrowing' || status === 'overdue'
    ? daysBetween(dueDate, returnDate || formatDateInput())
    : 0

  if (!returnDate && status === 'borrowing' && overdueDays > 0) {
    status = 'overdue'
  }

  return {
    id: item.id || item.borrowId || `BR-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    borrowId: item.borrowId || item.id || `BR-${Date.now().toString().slice(-6)}`,
    readerId: item.readerId || item.userId || item.libraryCardNumber || libraryCardNumber.value,
    readerName: item.readerName || item.fullName || item.name || userName.value,
    readerEmail: item.readerEmail || item.email || currentUser.value?.email || '',
    bookId: item.bookId || item.bookID || '',
    bookTitle: item.bookTitle || item.book || item.title || item.bookName || 'Tài liệu',
    isbn: item.isbn || '',
    borrowDate,
    dueDate,
    returnDate,
    status,
    overdueDays,
    fineAmount: Number(item.fineAmount ?? item.fine ?? overdueDays * finePerDay ?? 0),
    finePaid: Boolean(item.finePaid || item.isPaid || item.debtStatus === 'paid'),
    createdAt: item.createdAt || new Date().toISOString()
  }
}

const refreshBooks = async () => {
  booksLoading.value = true

  try {
    const data = await apiFetch(CATALOG_API_URL, '/books')
    const list = unwrapList(data).map(normalizeBook)
    books.value = list
    writeJson('library_catalog_books', list)
  } catch (error) {
    books.value = readJson('library_catalog_books', []).map(normalizeBook)
    console.warn('Không tải được API nhóm 1, dùng localStorage:', error)
  } finally {
    booksLoading.value = false
  }
}

const refreshBorrows = async () => {
  if (!currentUser.value) {
    borrowRecords.value = []
    return
  }

  try {
    const readerId = encodeURIComponent(libraryCardNumber.value || currentUser.value.id || currentUser.value.email)
    const data = await apiFetch(CIRCULATION_API_URL, `/borrow-records/reader/${readerId}`)
    borrowRecords.value = unwrapList(data).map(normalizeBorrow)
  } catch (error) {
    const local = readJson('library_borrow_requests', [])
    const myId = String(libraryCardNumber.value || currentUser.value.id || currentUser.value.email || '')
    borrowRecords.value = local
      .map(normalizeBorrow)
      .filter((item) => {
        return (
          String(item.readerId) === myId ||
          String(item.readerEmail) === String(currentUser.value.email || '') ||
          String(item.readerName).toLowerCase() === String(userName.value).toLowerCase()
        )
      })

    console.warn('Không tải được API nhóm 2, dùng localStorage:', error)
  }
}

const refreshAll = async () => {
  await Promise.all([refreshBooks(), refreshBorrows()])
  showMessage('Đã làm mới dữ liệu.')
}

const showMessage = (text, color = '#0d9488') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const scrollToSection = (id) => {
  activeSection.value = id
  const target = id === 'top' ? document.getElementById('top') : document.getElementById(id)

  target?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })

  showUserMenu.value = false
  showNotifications.value = false
}

const canBorrowBook = (book) => {
  return !!currentUser.value && Number(book.availableCopies) > 0
}

const borrowButtonText = (book) => {
  if (!currentUser.value) return 'Đăng nhập để mượn'
  if (Number(book.availableCopies) <= 0) return 'Hết sách'
  return 'Đặt mượn'
}

const reserveBook = async (book) => {
  if (!currentUser.value) {
    router.push('/login')
    return
  }

  if (Number(book.availableCopies) <= 0) {
    showMessage('Sách hiện đã hết, không thể đặt mượn.', 'orange')
    return
  }

  const borrowPolicy = readJson('library_borrow_policy', { maxBooks: 5, maxBorrowDays: 14 })
  const activeCount = activeBorrowRecords.value.length + pendingBorrowRecords.value.length

  if (activeCount >= Number(borrowPolicy.maxBooks || 5)) {
    showMessage(`Bạn đã đạt giới hạn mượn ${borrowPolicy.maxBooks} sách.`, 'orange')
    return
  }

  const now = new Date()
  const due = new Date()
  due.setDate(now.getDate() + Number(borrowPolicy.maxBorrowDays || 14))

  const payload = {
    readerId: libraryCardNumber.value,
    readerName: userName.value,
    readerEmail: currentUser.value.email || '',
    bookId: book.id,
    bookTitle: book.title,
    isbn: book.isbn,
    borrowDate: formatDateInput(now),
    dueDate: formatDateInput(due),
    status: 'pending'
  }

  let created = null

  try {
    const data = await apiFetch(CIRCULATION_API_URL, '/borrow-records', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    created = normalizeBorrow(data?.data || data || payload)
  } catch (error) {
    created = normalizeBorrow({
      id: Date.now(),
      borrowId: `BR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      ...payload,
      createdAt: new Date().toISOString()
    })

    const allRequests = readJson('library_borrow_requests', [])
    allRequests.unshift(created)
    writeJson('library_borrow_requests', allRequests)

    console.warn('Không tạo được phiếu qua API nhóm 2, lưu localStorage:', error)
  }

  borrowRecords.value.unshift(created)

  const events = readJson('library_circulation_events', [])
  events.unshift({
    id: Date.now(),
    type: 'book.borrowed',
    borrowId: created.borrowId,
    readerId: created.readerId,
    readerName: created.readerName,
    bookId: created.bookId,
    bookTitle: created.bookTitle,
    message: `${created.readerName} đặt mượn ${created.bookTitle}`,
    createdAt: new Date().toISOString()
  })
  writeJson('library_circulation_events', events)

  showMessage(`Đã gửi yêu cầu mượn "${book.title}".`)
  bookDetailDialog.value = false
  scrollToSection('status')
}

const openBookDetail = (book) => {
  selectedBook.value = book
  bookDetailDialog.value = true
}

const statusText = (status) => {
  if (status === 'pending') return 'Chờ duyệt'
  if (status === 'borrowing') return 'Đang mượn'
  if (status === 'returned') return 'Đã trả'
  if (status === 'overdue') return 'Quá hạn'
  return 'Không rõ'
}

const formatMoney = (amount) => {
  return `${Number(amount || 0).toLocaleString('vi-VN')}đ`
}

const exportHistory = () => {
  const rows = [
    ['Ma phieu', 'Tai lieu', 'Ngay muon', 'Han tra', 'Ngay tra', 'Phat', 'Trang thai'],
    ...filteredBorrowRecords.value.map((item) => [
      item.borrowId,
      item.bookTitle,
      item.borrowDate,
      item.dueDate,
      item.returnDate || 'Chua tra',
      item.fineAmount,
      statusText(item.status)
    ])
  ]

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lich-su-muon-tra-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const onCoverError = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80'
}

const goLogin = () => {
  router.push('/login')
}

const goRegister = () => {
  router.push('/register')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('library_token')
  localStorage.removeItem('library_current_user')
  localStorage.removeItem('library_auth_user')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  currentUser.value = getAuthUser()

  if (!currentUser.value) {
    router.push('/login')
    return
  }

  await refreshAll()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: Inter, 'Segoe UI', sans-serif;
}

.user-main-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}

.user-header {
  height: 92px;
  padding: 0 46px;
  background: rgba(255,255,255,.96);
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  gap: 26px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.brand {
  border: none;
  background: transparent;
  color: #0d9488;
  display: flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
}

.brand span {
  display: grid;
  text-align: left;
}

.brand b {
  color: #0f172a;
  font-size: 20px;
  line-height: 1.05;
  font-weight: 950;
}

.brand small {
  color: #64748b;
  font-size: 13px;
  font-weight: 750;
}

.user-nav {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.user-nav button {
  height: 42px;
  border: none;
  border-radius: 14px;
  padding: 0 16px;
  background: transparent;
  color: #334155;
  font-weight: 900;
  cursor: pointer;
}

.user-nav button.active,
.user-nav button:hover {
  background: #ecfdf5;
  color: #0d9488;
}

.header-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #dbe3ec;
  border-radius: 50%;
  background: white;
  color: #334155;
  cursor: pointer;
  position: relative;
}

.icon-btn.has-badge span {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 950;
  position: absolute;
  top: -5px;
  right: -3px;
  display: grid;
  place-items: center;
}

.user-pill {
  height: 58px;
  min-width: 240px;
  border: 1px solid #99f6e4;
  border-radius: 20px;
  background: linear-gradient(135deg,#ffffff,#f0fdfa);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 13px;
  cursor: pointer;
}

.avatar,
.reader-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #ccfbf1;
  color: #0f766e;
  display: grid;
  place-items: center;
  font-weight: 950;
}

.user-pill div {
  display: grid;
  text-align: left;
  flex: 1;
}

.user-pill b {
  font-size: 14px;
  font-weight: 950;
}

.user-pill small {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-buttons button {
  height: 42px;
  border: 1px solid #0d9488;
  border-radius: 13px;
  background: white;
  color: #0d9488;
  padding: 0 16px;
  font-weight: 900;
  cursor: pointer;
}

.auth-buttons .solid {
  background: #0d9488;
  color: white;
}

.user-menu,
.notification-panel {
  position: absolute;
  top: 66px;
  right: 0;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: white;
  box-shadow: 0 18px 42px rgba(15,23,42,.12);
  z-index: 60;
}

.user-menu {
  width: 220px;
  padding: 10px;
}

.user-menu button {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #334155;
  font-weight: 850;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-menu button:hover {
  background: #ecfdf5;
  color: #0d9488;
}

.notification-panel {
  width: 360px;
  padding: 14px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-head button {
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.empty-noti {
  color: #64748b;
  font-weight: 750;
  padding: 18px;
  text-align: center;
}

.noti-list {
  display: grid;
  gap: 10px;
}

.noti-list > div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 8px;
}

.noti-list b {
  color: #0f172a;
}

.noti-list p {
  margin: 4px 0;
  color: #475569;
  font-size: 13px;
}

.noti-list small {
  color: #64748b;
}

.hero-section {
  padding: 70px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) 470px;
  gap: 50px;
  align-items: center;
  background:
    radial-gradient(circle at 12% 5%, rgba(45,212,191,.18), transparent 32%),
    linear-gradient(135deg,#f0fdfa 0%,#ffffff 62%,#f8fafc 100%);
}

.welcome-chip {
  width: max-content;
  border-radius: 999px;
  padding: 8px 13px;
  background: #ccfbf1;
  color: #0f766e;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-left h1 {
  max-width: 820px;
  margin: 22px 0 18px;
  font-size: 58px;
  line-height: 1.08;
  font-weight: 950;
  letter-spacing: -1.6px;
}

.hero-left h1 span {
  color: #0d9488;
}

.hero-left p {
  max-width: 760px;
  color: #475569;
  font-size: 17px;
  line-height: 1.75;
  margin: 0 0 28px;
}

.hero-search {
  width: min(100%, 820px);
  min-height: 68px;
  border: 1px solid #dbe3ec;
  border-radius: 20px;
  background: white;
  padding: 8px 8px 8px 18px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 34px 130px;
  align-items: center;
  gap: 10px;
  box-shadow: 0 16px 34px rgba(15,23,42,.07);
}

.hero-search input {
  height: 50px;
  border: none;
  outline: none;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.clear-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
}

.search-btn,
.primary-action,
.secondary-action {
  height: 50px;
  border-radius: 15px;
  border: none;
  font-weight: 950;
  cursor: pointer;
}

.search-btn,
.primary-action {
  background: #0d9488;
  color: white;
}

.secondary-action {
  border: 1px solid #0d9488;
  background: white;
  color: #0d9488;
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  gap: 12px;
}

.primary-action,
.secondary-action {
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reader-overview-card {
  min-height: 420px;
  border: 1px solid rgba(13,148,136,.18);
  border-radius: 28px;
  padding: 28px;
  background:
    radial-gradient(circle at 74% 20%,rgba(45,212,191,.30),transparent 34%),
    linear-gradient(135deg,#ecfdf5,#ffffff);
  box-shadow: 0 26px 60px rgba(15,23,42,.08);
}

.overview-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.reader-avatar {
  width: 64px;
  height: 64px;
  font-size: 24px;
}

.overview-top b {
  display: block;
  font-size: 22px;
  font-weight: 950;
}

.overview-top small {
  color: #64748b;
  font-weight: 850;
}

.card-preview {
  min-height: 170px;
  border-radius: 24px;
  padding: 24px;
  background: linear-gradient(135deg,#0f766e,#0d9488);
  color: white;
  display: grid;
  align-content: space-between;
  margin-bottom: 22px;
}

.card-preview span {
  color: #ccfbf1;
  font-weight: 850;
}

.card-preview strong {
  font-size: 28px;
  letter-spacing: 1px;
}

.card-preview p {
  margin: 0;
  color: #ecfeff;
  font-weight: 850;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
}

.overview-stats div {
  border-radius: 18px;
  background: white;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(15,23,42,.06);
}

.overview-stats b {
  color: #0d9488;
  font-size: 28px;
  font-weight: 950;
  display: block;
}

.overview-stats span {
  color: #64748b;
  font-size: 13px;
  font-weight: 850;
}

.section-block {
  padding: 42px 56px;
}

.section-head {
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
}

.section-head span {
  color: #0d9488;
  font-weight: 950;
}

.section-head h2 {
  margin: 5px 0;
  color: #0f172a;
  font-size: 34px;
  font-weight: 950;
}

.section-head p {
  margin: 0;
  color: #64748b;
  font-weight: 750;
}

.section-head button,
.filter-actions button {
  height: 42px;
  border: 1px solid #0d9488;
  border-radius: 13px;
  background: white;
  color: #0d9488;
  padding: 0 14px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
}

.filter-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-actions select {
  height: 42px;
  border: 1px solid #dbe3ec;
  border-radius: 13px;
  background: white;
  color: #334155;
  padding: 0 13px;
  font-weight: 850;
  outline: none;
}

.empty-card {
  min-height: 260px;
  border: 1px dashed #cbd5e1;
  border-radius: 22px;
  background: white;
  color: #64748b;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 34px;
}

.empty-card h3 {
  margin: 10px 0 5px;
  color: #0f172a;
}

.empty-card p {
  max-width: 560px;
  line-height: 1.6;
}

.borrow-status-grid,
.book-grid {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 22px;
}

.borrow-status-card {
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: white;
  padding: 20px;
  box-shadow: 0 14px 30px rgba(15,23,42,.05);
}

.borrow-status-card.overdue {
  border-color: #fecaca;
  background: #fff7f7;
}

.borrow-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.borrow-card-top small {
  color: #64748b;
  font-weight: 850;
}

.borrow-status-card h3 {
  margin: 16px 0 6px;
  font-size: 22px;
  font-weight: 950;
}

.borrow-status-card p {
  color: #64748b;
  font-weight: 750;
  margin: 0 0 16px;
}

.borrow-info {
  display: grid;
  gap: 9px;
}

.borrow-info span {
  color: #475569;
  font-size: 14px;
  font-weight: 750;
  display: flex;
  align-items: center;
  gap: 7px;
}

.borrow-info .danger {
  color: #ef4444;
  font-weight: 950;
}

.book-grid {
  grid-template-columns: repeat(4,minmax(0,1fr));
}

.book-card {
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: white;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(15,23,42,.06);
  transition: .2s;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 24px 48px rgba(15,23,42,.10);
}

.cover {
  height: 250px;
  background: #ecfdf5;
  color: #0d9488;
  display: grid;
  place-items: center;
  position: relative;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-status,
.status-badge {
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.book-status {
  position: absolute;
  left: 14px;
  bottom: 14px;
}

.book-status.available,
.status-badge.returned {
  background: #dcfce7;
  color: #15803d;
}

.book-status.low {
  background: #ffedd5;
  color: #ea580c;
}

.book-status.out,
.status-badge.overdue {
  background: #fee2e2;
  color: #ef4444;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.borrowing {
  background: #dbeafe;
  color: #2563eb;
}

.book-body {
  padding: 18px;
}

.book-body h3 {
  min-height: 52px;
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 950;
  line-height: 1.3;
}

.book-body p {
  margin: 0 0 14px;
  color: #64748b;
  font-weight: 850;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.book-meta span {
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  padding: 6px 9px;
  font-size: 12px;
  font-weight: 850;
}

.book-actions {
  display: grid;
  gap: 9px;
}

.book-actions button,
.detail-borrow-btn {
  height: 42px;
  border: none;
  border-radius: 13px;
  background: #0d9488;
  color: white;
  font-weight: 950;
  cursor: pointer;
}

.book-actions button.outline {
  border: 1px solid #0d9488;
  background: white;
  color: #0d9488;
}

.book-actions button:disabled,
.detail-borrow-btn:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.show-more-wrap {
  margin-top: 26px;
  display: flex;
  justify-content: center;
}

.show-more-wrap button {
  height: 44px;
  border: 1px solid #dbe3ec;
  border-radius: 999px;
  background: white;
  color: #0f766e;
  padding: 0 24px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.history-table-card {
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: white;
  overflow-x: auto;
  box-shadow: 0 16px 36px rgba(15,23,42,.05);
}

.history-table-card table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

.history-table-card th {
  background: #f8fafc;
  color: #334155;
  text-align: left;
  padding: 14px;
  font-size: 13px;
  font-weight: 950;
}

.history-table-card td {
  border-top: 1px solid #eef2f7;
  padding: 14px;
  color: #334155;
  font-weight: 750;
}

.history-table-card td b {
  display: block;
  color: #0f172a;
}

.history-table-card td small {
  display: block;
  color: #64748b;
  margin-top: 4px;
}

.history-table-card .code {
  color: #0d9488;
  font-weight: 950;
}

.profile-grid {
  display: grid;
  grid-template-columns: 420px minmax(0,1fr);
  gap: 24px;
}

.library-card {
  min-height: 260px;
  border-radius: 26px;
  padding: 26px;
  color: white;
  background:
    radial-gradient(circle at 82% 18%,rgba(153,246,228,.35),transparent 34%),
    linear-gradient(135deg,#064e3b,#0d9488);
  display: grid;
  align-content: space-between;
  box-shadow: 0 22px 46px rgba(13,148,136,.18);
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 950;
}

.card-number {
  font-size: 30px;
  font-weight: 950;
  letter-spacing: 1px;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.card-bottom small {
  display: block;
  color: #ccfbf1;
  font-weight: 850;
}

.card-bottom b {
  display: block;
  margin-top: 5px;
}

.profile-info {
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: white;
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 14px;
  box-shadow: 0 16px 36px rgba(15,23,42,.05);
}

.profile-info div {
  border-radius: 16px;
  background: #f8fafc;
  padding: 14px;
}

.profile-info span {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 850;
}

.profile-info b {
  display: block;
  margin-top: 6px;
  color: #0f172a;
}

.book-detail-dialog {
  border-radius: 24px !important;
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
  font-size: 23px;
  font-weight: 950;
}

.dialog-head p {
  margin: 5px 0 0;
  color: #64748b;
}

.book-detail-content {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 22px;
}

.detail-cover {
  height: 320px;
  border-radius: 20px;
  background: #ecfdf5;
  color: #0d9488;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info h3 {
  margin: 14px 0 8px;
  font-size: 28px;
  font-weight: 950;
}

.detail-info p {
  color: #475569;
  line-height: 1.65;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
  margin: 18px 0;
}

.detail-grid div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
}

.detail-grid span {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 850;
}

.detail-grid b {
  display: block;
  margin-top: 5px;
}

.detail-borrow-btn {
  width: 100%;
}

@media (max-width: 1280px) {
  .hero-section,
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .book-grid {
    grid-template-columns: repeat(3,minmax(0,1fr));
  }
}

@media (max-width: 980px) {
  .user-header {
    height: auto;
    padding: 14px 18px;
    flex-wrap: wrap;
  }

  .user-nav {
    order: 3;
    width: 100%;
    margin-left: 0;
    overflow-x: auto;
  }

  .hero-section,
  .section-block {
    padding-left: 22px;
    padding-right: 22px;
  }

  .hero-left h1 {
    font-size: 42px;
  }

  .book-grid,
  .borrow-status-grid,
  .profile-info {
    grid-template-columns: 1fr;
  }

  .book-detail-content {
    grid-template-columns: 1fr;
  }

  .hero-search {
    grid-template-columns: 34px 1fr 34px;
  }

  .search-btn {
    grid-column: 1 / -1;
  }
}
</style>
