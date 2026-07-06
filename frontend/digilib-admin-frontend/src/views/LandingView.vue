<template>
  <main class="landing-page">
    <header class="top-header">
      <RouterLink to="/" class="brand">
        <i class="mdi mdi-book-open-page-variant-outline"></i>
        <span>DIGILIB</span>
      </RouterLink>

      <nav class="main-nav">
        <a href="#home" class="active">Trang chủ</a>
        <a href="#guide">Hướng dẫn</a>
        <a href="#contact">Liên hệ</a>
      </nav>

      <div class="header-actions">
        <button class="theme-btn" type="button" title="Đổi giao diện" @click="changeTheme">
          <i :class="isDarkMode ? 'mdi mdi-weather-sunny' : 'mdi mdi-weather-night'"></i>
        </button>

        <RouterLink class="login-btn" to="/login">
          Đăng nhập
        </RouterLink>

        <RouterLink class="register-btn" to="/login?tab=register">
          Đăng ký
        </RouterLink>
      </div>
    </header>

    <section id="home" class="hero-section">
      <div class="hero-left">
        <div class="hero-badge">
          <i class="mdi mdi-star-outline"></i>
          Nền tảng quản lý thư viện hiện đại
        </div>

        <h1>
          Hệ thống quản lý
          <br />
          thư viện số <span>DIGILIB</span>
        </h1>

        <p>
          DIGILIB giúp thư viện vận hành hiệu quả với đầy đủ chức năng:
          tra cứu sách, quản lý mượn trả, quản lý độc giả, thẻ thư viện,
          nhắc hạn trả và báo cáo thống kê chính xác.
        </p>

        <div class="hero-buttons">
          <RouterLink class="primary-btn" to="/login">
            <i class="mdi mdi-login"></i>
            Đăng nhập hệ thống
          </RouterLink>

          <RouterLink class="outline-btn" to="/login?tab=register">
            <i class="mdi mdi-account-plus-outline"></i>
            Đăng ký độc giả
          </RouterLink>
        </div>

        <form class="hero-search" @submit.prevent="searchBooks">
          <i class="mdi mdi-magnify"></i>

          <input
            v-model.trim="keyword"
            type="text"
            placeholder="Tìm sách, tác giả, thể loại..."
          />

          <button type="submit">
            Tìm kiếm
          </button>
        </form>
      </div>

      <div class="hero-visual">
        <div class="float-icon icon-book">
          <i class="mdi mdi-book-open-page-variant-outline"></i>
        </div>

        <div class="float-icon icon-cap">
          <i class="mdi mdi-school-outline"></i>
        </div>

        <div class="float-icon icon-menu">
          <i class="mdi mdi-menu"></i>
        </div>

        <div class="book-stack">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="laptop">
          <div class="laptop-screen">
            <div class="screen-top">
              <b>DIGILIB</b>

              <div class="screen-nav">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div class="screen-search">
              <span>Tìm kiếm sách, tác giả...</span>
              <button>Tìm</button>
            </div>

            <div class="screen-title">
              Sách phổ biến hôm nay
            </div>

            <div class="screen-books">
              <article
                v-for="book in visualBooks"
                :key="book.id"
              >
                <img
                  :src="book.coverImage"
                  :alt="book.title"
                  @load="validateBookImage($event, book)"
                  @error="replaceBrokenImage($event, book)"
                />

                <b>{{ book.shortTitle }}</b>
              </article>
            </div>

            <div class="screen-stats">
              <span>
                <i class="mdi mdi-book-outline"></i>
                {{ landingStats.totalBooks }} sách
              </span>

              <span>
                <i class="mdi mdi-account-outline"></i>
                {{ landingStats.readerLabel }} độc giả
              </span>

              <span>
                <i class="mdi mdi-book-sync-outline"></i>
                Mượn trả
              </span>

              <span>
                <i class="mdi mdi-chart-box-outline"></i>
                Báo cáo
              </span>
            </div>
          </div>

          <div class="laptop-base"></div>
        </div>

        <div class="plant">
          <span class="leaf l1"></span>
          <span class="leaf l2"></span>
          <span class="leaf l3"></span>
          <span class="leaf l4"></span>
          <span class="pot"></span>
        </div>
      </div>
    </section>

    <section id="featured" class="book-section">
      <div class="section-head">
        <h2>
          <i class="mdi mdi-star-circle-outline"></i>
          Sách nổi bật
        </h2>

        <button type="button" @click="goLogin">
          Xem tất cả
          <i class="mdi mdi-arrow-right"></i>
        </button>
      </div>

      <div v-if="featuredBooks.length" class="book-grid fixed-book-grid">
        <article
          v-for="book in featuredBooks"
          :key="book.id"
          class="book-card"
        >
          <div class="book-cover">
            <img
              :src="book.coverImage"
              :alt="book.title"
              @load="validateBookImage($event, book)"
              @error="replaceBrokenImage($event, book)"
            />
          </div>

          <div class="book-content">
            <h3>{{ book.title }}</h3>
            <p>{{ book.author }}</p>

            <span :class="book.availableCopies > 0 ? 'available' : 'borrow-count'">
              <i :class="book.availableCopies > 0 ? 'mdi mdi-check-circle-outline' : 'mdi mdi-clock-outline'"></i>
              {{ book.availableCopies > 0 ? 'Còn sẵn' : 'Tạm hết sách' }}
            </span>
          </div>

          <button class="book-action" type="button" @click="goLogin">
            Xem chi tiết
          </button>
        </article>
      </div>

      <div v-else class="landing-empty-state">
        <i class="mdi mdi-book-search-outline"></i>
        <h3>Chưa có sách để hiển thị</h3>
        <p>Khi bạn thêm sách trong trang quản trị, dữ liệu thật từ Catalog API sẽ tự động xuất hiện tại đây.</p>
      </div>
    </section>

    <section id="hot" class="book-section hot-section">
      <div class="section-head">
        <h2>
          <i class="mdi mdi-fire"></i>
          Sách đang hot
        </h2>

        <button type="button" @click="goLogin">
          Xem tất cả
          <i class="mdi mdi-arrow-right"></i>
        </button>
      </div>

      <div v-if="hotBooks.length" class="book-grid fixed-book-grid">
        <article
          v-for="book in hotBooks"
          :key="book.id"
          class="book-card hot-card"
        >
          <div class="hot-label">
            Hot
          </div>

          <div class="book-cover">
            <img
              :src="book.coverImage"
              :alt="book.title"
              @load="validateBookImage($event, book)"
              @error="replaceBrokenImage($event, book)"
            />
          </div>

          <div class="book-content">
            <h3>{{ book.title }}</h3>
            <p>{{ book.author }}</p>

            <span class="borrow-count">
              <i class="mdi mdi-trending-up"></i>
              {{ book.borrowCount > 0 ? `${book.borrowCount} lượt mượn` : 'Sách mới cập nhật' }}
            </span>
          </div>

          <button class="book-action primary" type="button" @click="goLogin">
            Mượn ngay
          </button>
        </article>
      </div>

      <div v-else class="landing-empty-state">
        <i class="mdi mdi-fire-off"></i>
        <h3>Chưa có sách đang hot</h3>
        <p>Danh sách này sẽ lấy từ dữ liệu sách thật, không dùng sách mẫu cố định nữa.</p>
      </div>
    </section>

    <section id="guide" class="guide-section">
      <div class="section-head">
        <h2>
          <i class="mdi mdi-book-open-variant"></i>
          Hướng dẫn sử dụng DIGILIB
        </h2>

        <button type="button" @click="goLogin">
          Bắt đầu sử dụng
          <i class="mdi mdi-arrow-right"></i>
        </button>
      </div>

      <div class="guide-layout">
        <article class="guide-intro">
          <div class="guide-icon">
            <i class="mdi mdi-information-outline"></i>
          </div>

          <h3>Cách bắt đầu với hệ thống thư viện số</h3>

          <p>
            Người dùng truy cập trang chủ, đăng nhập hoặc đăng ký tài khoản độc giả.
            Sau khi đăng nhập, hệ thống tự chuyển đến đúng giao diện theo vai trò:
            Admin, Thủ thư hoặc Độc giả.
          </p>

          <button type="button" @click="goLogin">
            Vào đăng nhập
          </button>
        </article>

        <div class="guide-grid">
          <article class="guide-card">
            <div class="guide-step">
              1
            </div>

            <div>
              <h3>Đăng nhập / Đăng ký</h3>
              <span>Bước đầu sử dụng</span>
            </div>

            <p>
              Độc giả có thể đăng ký tài khoản mới. Admin và Thủ thư đăng nhập
              bằng tài khoản đã được cấp trong hệ thống.
            </p>
          </article>

          <article class="guide-card">
            <div class="guide-step">
              2
            </div>

            <div>
              <h3>Tra cứu sách</h3>
              <span>Tìm kiếm tài liệu</span>
            </div>

            <p>
              Người dùng có thể tìm sách theo tên sách, tác giả, thể loại và
              kiểm tra tình trạng sách trước khi mượn.
            </p>
          </article>

          <article class="guide-card">
            <div class="guide-step">
              3
            </div>

            <div>
              <h3>Theo dõi mượn trả</h3>
              <span>Quản lý lịch sử</span>
            </div>

            <p>
              Độc giả theo dõi sách đang mượn, hạn trả, lịch sử mượn trả và
              thông tin thẻ thư viện của mình.
            </p>
          </article>
        </div>
      </div>
    </section>

    <footer id="contact" class="footer">
      <div>
        <h2>
          <i class="mdi mdi-book-open-page-variant-outline"></i>
          DIGILIB
        </h2>
        <p>Hệ thống quản lý thư viện số</p>
        <em>Hiện đại - Hiệu quả - Thân thiện</em>
      </div>

      <div>
        <h3>Thông tin liên hệ</h3>
        <p>
          <i class="mdi mdi-map-marker-outline"></i>
          123 Đường số 1, Quận 1, TP. Hồ Chí Minh
        </p>
        <p>
          <i class="mdi mdi-phone-outline"></i>
          (028) 1234 5678
        </p>
        <p>
          <i class="mdi mdi-email-outline"></i>
          support@digilib.vn
        </p>
      </div>

      <div>
        <h3>Liên kết nhanh</h3>
        <a href="#home">Trang chủ</a>
        <a href="#guide">Hướng dẫn</a>
        <a href="#contact">Liên hệ</a>
      </div>

      <div>
        <h3>Hướng dẫn</h3>
        <a href="#featured">Tra cứu sách</a>
        <a href="#guide">Quy trình sử dụng</a>
        <a href="#contact">Liên hệ</a>
      </div>

      <div>
        <h3>Kết nối với chúng tôi</h3>
        <div class="socials">
          <span><i class="mdi mdi-facebook"></i></span>
          <span><i class="mdi mdi-youtube"></i></span>
          <span><i class="mdi mdi-facebook-messenger"></i></span>
          <span><i class="mdi mdi-email"></i></span>
        </div>
      </div>

      <div class="copyright">
        © 2024 DIGILIB. All rights reserved.
      </div>
    </footer>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { applyDigilibTheme, toggleDigilibTheme } from '../utils/digilibTheme'

function getPublicUrl(port) {
  return `${window.location.protocol}//${window.location.hostname}:${port}`
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || getPublicUrl(8080)).replace(/\/$/, '')

const router = useRouter()

const keyword = ref('')
const apiBooks = ref([])
const apiReaders = ref([])
const isDarkMode = ref(false)

let themeTimer = null

onMounted(() => {
  loadLandingData()

  const theme = applyDigilibTheme()
  isDarkMode.value = theme === 'dark'

  themeTimer = window.setInterval(() => {
    const currentTheme = applyDigilibTheme()
    isDarkMode.value = currentTheme === 'dark'
  }, 500)
})

onBeforeUnmount(() => {
  if (themeTimer) {
    window.clearInterval(themeTimer)
  }
})

const books = computed(() => apiBooks.value.map(normalizeBook))

const featuredBooks = computed(() => {
  const q = normalize(keyword.value)
  const source = books.value

  if (!q) {
    return source.slice(0, 6)
  }

  return source
    .filter((book) => {
      const content = normalize(`${book.title} ${book.author} ${book.category} ${book.publisher} ${book.isbn}`)
      return content.includes(q)
    })
    .slice(0, 6)
})

const hotBooks = computed(() => {
  return [...books.value]
    .sort((a, b) => {
      const bScore = Number(b.borrowCount || 0) + Number(b.availableCopies || 0)
      const aScore = Number(a.borrowCount || 0) + Number(a.availableCopies || 0)
      return bScore - aScore
    })
    .slice(0, 6)
})

const visualBooks = computed(() => featuredBooks.value.slice(0, 5))

const landingStats = computed(() => {
  const bookCount = books.value.length
  const readerCount = apiReaders.value.length

  return {
    totalBooks: bookCount.toLocaleString('vi-VN'),
    readerLabel: readerCount.toLocaleString('vi-VN')
  }
})
async function loadLandingData() {
  const [bookRes, readerRes] = await Promise.allSettled([
    request('/api/books'),
    request('/api/readers')
  ])

  apiBooks.value = bookRes.status === 'fulfilled' ? toArray(bookRes.value) : []
  apiReaders.value = readerRes.status === 'fulfilled' ? toArray(readerRes.value) : []
}
async function request(path) {
  const response = await fetch(`${API_BASE}${path}`)
  const text = await response.text()

  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.title || `API lỗi ${response.status}`)
  }

  return data
}

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.$values)) return data.$values

  return []
}

function normalizeBook(item = {}) {
  const title = item.title || item.Title || item.name || item.Name || 'Chưa rõ tên sách'
  const author = item.author || item.Author || item.authorName || item.AuthorName || 'Chưa rõ tác giả'
  const publisher = item.publisher || item.Publisher || item.publisherName || item.PublisherName || ''
  const isbn = item.isbn || item.ISBN || item.Isbn || ''
  const copies = toArray(item.copies || item.Copies)
  const totalCopies = Number(item.totalCopies ?? item.TotalCopies ?? item.copyCount ?? item.CopyCount ?? copies.length ?? 0)
  const availableCopies = Number(
    item.availableCopies ??
    item.AvailableCopies ??
    copies.filter((copy) => isCopyAvailable(copy)).length ??
    0
  )
  const fallbackCover = makeBookCover(title, author, '#2563eb', '#93c5fd')

  return {
    id: item.id || item.Id || item.bookId || item.BookId || title,
    title,
    shortTitle: title.length > 15 ? `${title.slice(0, 15)}...` : title,
    author,
    publisher,
    isbn,
    category: item.category || item.Category || item.categoryName || item.CategoryName || 'Chưa phân loại',
    coverImage:
      item.coverImage ||
      item.CoverImage ||
      item.coverImageUrl ||
      item.CoverImageUrl ||
      item.coverUrl ||
      item.CoverUrl ||
      item.imageUrl ||
      item.ImageUrl ||
      fallbackCover,
    fallbackCover,
    totalCopies,
    availableCopies,
    borrowCount: Number(item.borrowCount || item.BorrowCount || item.totalBorrow || item.TotalBorrow || 0)
  }
}

function isCopyAvailable(copy = {}) {
  const status = normalize(copy.status || copy.Status || copy.borrowStatus || copy.BorrowStatus)
  const condition = normalize(copy.condition || copy.Condition)

  const statusOk = !status || status.includes('available') || status.includes('co san') || status.includes('co the') || status.includes('hoat dong')
  const conditionBad = condition.includes('hong') || condition.includes('mat') || condition.includes('lost') || condition.includes('damaged')

  return statusOk && !conditionBad
}
function makeBookCover(title, author, fromColor, toColor) {
  const lines = String(title).split('|').slice(0, 3)

  const titleSvg = lines
    .map((line, index) => {
      return `<tspan x="34" y="${110 + index * 48}">${escapeSvg(line)}</tspan>`
    })
    .join('')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" viewBox="0 0 420 560">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${fromColor}" />
          <stop offset="100%" stop-color="${toColor}" />
        </linearGradient>
        <radialGradient id="light" cx="75%" cy="20%" r="75%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.65)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <rect width="420" height="560" rx="28" fill="url(#bg)" />
      <rect x="22" y="22" width="376" height="516" rx="22" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.32)" />
      <circle cx="330" cy="90" r="94" fill="url(#light)" />
      <circle cx="88" cy="430" r="118" fill="rgba(255,255,255,0.12)" />
      <path d="M44 390 C120 340, 190 450, 376 360" fill="none" stroke="rgba(255,255,255,0.36)" stroke-width="8" stroke-linecap="round" />

      <text font-family="Arial, sans-serif" font-size="39" font-weight="900" fill="#ffffff" letter-spacing="1">
        ${titleSvg}
      </text>

      <rect x="34" y="382" width="110" height="4" rx="2" fill="rgba(255,255,255,0.75)" />
      <text x="34" y="455" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.92)">
        ${escapeSvg(author)}
      </text>

      <text x="34" y="508" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="rgba(255,255,255,0.82)">
        DIGILIB BOOK
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function escapeSvg(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

function replaceBrokenImage(event, book) {
  const img = event.target

  img.onerror = null
  img.onload = null
  img.src =
    book.fallbackCover ||
    makeBookCover(book.title, book.author, '#2563eb', '#93c5fd')
}

function validateBookImage(event, book) {
  const img = event.target

  if (!img.naturalWidth || !img.naturalHeight) {
    replaceBrokenImage(event, book)
    return
  }

  if (img.naturalWidth < 80 || img.naturalHeight < 100) {
    replaceBrokenImage(event, book)
  }
}

function searchBooks() {
  document.querySelector('#featured')?.scrollIntoView({
    behavior: 'smooth'
  })
}

function goLogin() {
  router.push('/login')
}

function changeTheme() {
  const theme = toggleDigilibTheme()
  isDarkMode.value = theme === 'dark'
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 4% 30%, rgba(37, 99, 235, 0.08), transparent 24%),
    radial-gradient(circle at 86% 8%, rgba(37, 99, 235, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f5f8ff 58%, #ffffff 100%);
  color: #0f172a;
}

</style>

<style scoped>
.landing-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 4% 30%, rgba(37, 99, 235, 0.08), transparent 24%),
    radial-gradient(circle at 86% 8%, rgba(37, 99, 235, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f5f8ff 58%, #ffffff 100%);
  color: #0f172a;
}

.top-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 68px;
  padding: 0 106px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  color: #2563eb;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 29px;
  font-weight: 950;
  letter-spacing: 0.4px;
}

.brand i {
  font-size: 38px;
}

.main-nav {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 42px;
}

.main-nav a {
  height: 100%;
  color: #0f172a;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 900;
  border-bottom: 3px solid transparent;
}

.main-nav a.active,
.main-nav a:hover {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-btn,
.login-btn,
.register-btn {
  height: 42px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 900;
}

.theme-btn {
  width: 42px;
  border: 0;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font-size: 21px;
}

.login-btn {
  padding: 0 24px;
  border: 1px solid #93c5fd;
  color: #2563eb;
  background: #ffffff;
}

.register-btn {
  padding: 0 28px;
  color: #ffffff;
  background: #2563eb;
  box-shadow: 0 16px 35px rgba(37, 99, 235, 0.22);
}

.hero-section {
  max-width: 1440px;
  min-height: 430px;
  margin: 0 auto;
  padding: 46px 28px 26px;
  display: grid;
  grid-template-columns: 0.78fr 1.22fr;
  gap: 42px;
  align-items: center;
}

.hero-badge {
  width: max-content;
  height: 42px;
  padding: 0 18px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: rgba(239, 246, 255, 0.86);
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
}

.hero-left h1 {
  margin: 30px 0 0;
  font-size: 55px;
  line-height: 1.07;
  letter-spacing: -1.6px;
  font-weight: 950;
}

.hero-left h1 span {
  color: #2563eb;
}

.hero-left p {
  max-width: 630px;
  margin: 22px 0 0;
  color: #475569;
  font-size: 17px;
  line-height: 1.72;
  font-weight: 650;
}

.hero-buttons {
  margin-top: 28px;
  display: flex;
  gap: 16px;
}

.primary-btn,
.outline-btn {
  height: 50px;
  padding: 0 24px;
  border-radius: 10px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-weight: 900;
}

.primary-btn {
  color: #ffffff;
  background: #2563eb;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.24);
}

.outline-btn {
  color: #2563eb;
  background: #ffffff;
  border: 1px solid #93c5fd;
}

.hero-search {
  width: min(560px, 100%);
  height: 54px;
  margin-top: 26px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: #ffffff;
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
}

.hero-search i {
  color: #64748b;
  text-align: center;
  font-size: 21px;
}

.hero-search input {
  height: 100%;
  border: 0;
  outline: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.hero-search button {
  height: 100%;
  border: 0;
  background: #2563eb;
  color: #ffffff;
  font-weight: 950;
  cursor: pointer;
}

.hero-visual {
  position: relative;
  min-height: 390px;
}

.float-icon {
  position: absolute;
  z-index: 4;
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 42px;
}

.icon-book {
  left: 170px;
  top: 18px;
}

.icon-cap {
  left: 82px;
  top: 142px;
}

.icon-menu {
  right: 22px;
  top: 98px;
}

.book-stack {
  position: absolute;
  left: 0;
  bottom: 70px;
  width: 235px;
  height: 106px;
  z-index: 2;
}

.book-stack span {
  position: absolute;
  left: 18px;
  width: 208px;
  height: 28px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.12);
}

.book-stack span:nth-child(1) {
  bottom: 0;
  transform: skewY(-4deg);
  border-bottom: 5px solid #2563eb;
}

.book-stack span:nth-child(2) {
  bottom: 30px;
  transform: skewY(-3deg);
  border-bottom: 5px solid #1d4ed8;
}

.book-stack span:nth-child(3) {
  bottom: 60px;
  transform: skewY(-2deg);
  border-bottom: 5px solid #60a5fa;
}

.laptop {
  position: absolute;
  right: 135px;
  bottom: 30px;
  width: 520px;
  height: 305px;
  z-index: 3;
  perspective: 1300px;
}

.laptop-screen {
  width: 100%;
  height: 285px;
  padding: 20px;
  border-radius: 16px 16px 10px 10px;
  background: #ffffff;
  border: 14px solid #0f172a;
  box-shadow: 0 34px 70px rgba(15, 23, 42, 0.22);
  transform: rotateX(3deg) rotateY(-7deg);
  overflow: hidden;
}

.laptop-base {
  position: absolute;
  left: 22px;
  right: 8px;
  bottom: -12px;
  height: 26px;
  border-radius: 4px 4px 22px 22px;
  background: linear-gradient(180deg, #dbe4f0, #94a3b8);
  transform: skewX(-16deg);
}

.screen-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.screen-top b {
  color: #2563eb;
  font-size: 15px;
  font-weight: 950;
}

.screen-nav {
  display: flex;
  gap: 8px;
}

.screen-nav span {
  width: 32px;
  height: 4px;
  border-radius: 999px;
  background: #bfdbfe;
}

.screen-search {
  height: 32px;
  margin-top: 12px;
  padding: 0 6px 0 14px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.screen-search button {
  width: 62px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #2563eb;
  font-size: 11px;
  font-weight: 850;
}

.screen-title {
  margin-top: 12px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
}

.screen-books {
  margin-top: 9px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 9px;
}

.screen-books img {
  width: 100%;
  height: 76px;
  border-radius: 5px;
  object-fit: contain;
  object-position: center;
  background: linear-gradient(135deg, #f8fafc, #eef4ff);
  padding: 3px;
}

.screen-books b {
  display: block;
  margin-top: 5px;
  color: #0f172a;
  font-size: 9px;
  line-height: 1.15;
  font-weight: 800;
}

.screen-stats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.screen-stats span {
  min-height: 42px;
  padding: 6px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 9px;
  font-weight: 750;
  display: grid;
  gap: 4px;
}

.screen-stats i {
  color: #2563eb;
  font-size: 14px;
}

.plant {
  position: absolute;
  right: 0;
  bottom: 62px;
  width: 108px;
  height: 170px;
  z-index: 2;
}

.leaf {
  position: absolute;
  bottom: 58px;
  left: 50%;
  width: 24px;
  height: 94px;
  border-radius: 24px 24px 6px 24px;
  background: linear-gradient(180deg, #22c55e, #15803d);
  transform-origin: bottom center;
}

.leaf.l1 {
  transform: translateX(-50%) rotate(-38deg);
}

.leaf.l2 {
  transform: translateX(-50%) rotate(-16deg);
}

.leaf.l3 {
  transform: translateX(-50%) rotate(16deg);
}

.leaf.l4 {
  transform: translateX(-50%) rotate(38deg);
}

.pot {
  position: absolute;
  left: 25px;
  bottom: 0;
  width: 58px;
  height: 58px;
  border-radius: 0 0 18px 18px;
  background: linear-gradient(180deg, #ffffff, #e2e8f0);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.12);
}

.book-section,
.guide-section {
  max-width: 1420px;
  margin: 16px auto 0;
  padding: 0 28px;
}

.hot-section {
  margin-top: 28px;
}

.section-head {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-head h2 i {
  color: #2563eb;
}

.hot-section .section-head h2 i {
  color: #ef4444;
}

.guide-section .section-head h2 i {
  color: #2563eb;
}

.section-head button {
  border: 0;
  background: transparent;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 900;
  cursor: pointer;
}

.fixed-book-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 22px;
  align-items: stretch;
}

.landing-empty-state {
  min-height: 220px;
  padding: 38px 24px;
  border: 1px dashed #bfdbfe;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.74);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #64748b;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.04);
}

.landing-empty-state i {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 14px;
}

.landing-empty-state h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
}

.landing-empty-state p {
  max-width: 520px;
  margin: 0;
  line-height: 1.6;
  font-weight: 700;
}

.book-card {
  position: relative;
  min-height: 340px;
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.book-cover {
  width: 100%;
  height: 176px;
  border-radius: 14px;
  overflow: hidden;
  background: #eff6ff;
  flex: 0 0 auto;
}

.book-cover img {
  width: 100%;
  height: 100%;
  min-width: 100%;
  display: block;
  object-fit: contain;
  object-position: center;
  background: linear-gradient(135deg, #f8fafc, #eef4ff);
  padding: 8px;
}

.book-content {
  min-height: 108px;
  padding-top: 13px;
}

.book-content h3 {
  min-height: 44px;
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.28;
  font-weight: 950;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-content p {
  min-height: 22px;
  margin: 7px 0 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.available,
.borrow-count {
  width: fit-content;
  margin-top: 9px;
  padding: 5px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 900;
}

.available {
  color: #15803d;
  background: #dcfce7;
}

.borrow-count {
  color: #f97316;
  background: #fff7ed;
}

.book-action {
  width: 100%;
  height: 38px;
  margin-top: auto;
  border: 1px solid #93c5fd;
  border-radius: 9px;
  background: #ffffff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.book-action.primary {
  border: 0;
  color: #ffffff;
  background: #2563eb;
}

.hot-label {
  position: absolute;
  top: 0;
  left: 14px;
  z-index: 2;
  padding: 5px 11px;
  border-radius: 0 0 10px 10px;
  color: #ffffff;
  background: #ef4444;
  font-size: 12px;
  font-weight: 950;
}

.guide-section {
  margin-top: 34px;
}

.guide-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 22px;
  align-items: stretch;
}

.guide-intro,
.guide-card {
  background: #ffffff;
  border: 1px solid #dbeafe;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
}

.guide-intro {
  min-height: 270px;
  padding: 28px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.guide-icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 34px;
}

.guide-intro h3 {
  margin: 18px 0 0;
  color: #0f172a;
  font-size: 26px;
  line-height: 1.25;
  font-weight: 950;
}

.guide-intro p {
  margin: 12px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.65;
  font-weight: 650;
}

.guide-intro button {
  width: fit-content;
  height: 42px;
  margin-top: 22px;
  padding: 0 18px;
  border: 0;
  border-radius: 11px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.guide-card {
  min-height: 270px;
  padding: 22px;
  border-radius: 20px;
}

.guide-step {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 950;
}

.guide-card h3 {
  margin: 18px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 950;
}

.guide-card span {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
  font-weight: 750;
}

.guide-card p {
  margin: 15px 0 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.65;
  font-weight: 650;
}

.footer {
  margin-top: 34px;
  padding: 28px 112px 22px;
  background: linear-gradient(135deg, #073b98, #005bd8);
  color: #ffffff;
  display: grid;
  grid-template-columns: 1.35fr 1.3fr 0.7fr 0.7fr 1fr;
  gap: 34px;
}

.footer h2,
.footer h3,
.footer p {
  margin: 0;
}

.footer h2 {
  font-size: 26px;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 950;
}

.footer p,
.footer a,
.footer em {
  color: #dbeafe;
  line-height: 1.65;
  text-decoration: none;
  display: block;
  font-size: 14px;
  font-weight: 650;
}

.socials {
  display: flex;
  gap: 10px;
}

.socials span {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  display: grid;
  place-items: center;
  font-size: 20px;
}

.copyright {
  grid-column: 1 / -1;
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  color: #dbeafe;
  text-align: center;
  font-size: 13px;
}

@media (max-width: 1280px) {
  .top-header {
    padding: 0 34px;
  }

  .hero-section {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    min-height: 390px;
  }

  .fixed-book-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .guide-layout {
    grid-template-columns: 1fr;
  }

  .guide-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer {
    padding-left: 34px;
    padding-right: 34px;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 820px) {
  .main-nav,
  .theme-btn {
    display: none;
  }

  .top-header {
    padding: 0 18px;
  }

  .hero-left h1 {
    font-size: 38px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .hero-search {
    grid-template-columns: 42px 1fr;
  }

  .hero-search button {
    display: none;
  }

  .hero-visual {
    display: none;
  }

  .fixed-book-grid,
  .guide-grid,
  .footer {
    grid-template-columns: 1fr;
  }
}
</style>
