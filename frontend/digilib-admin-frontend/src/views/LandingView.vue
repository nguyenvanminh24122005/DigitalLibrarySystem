<template>
  <main class="landing-page">
    <header class="landing-header">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">
          <i class="mdi mdi-book-open-page-variant-outline"></i>
        </span>

        <span>DIGILIB</span>
      </RouterLink>

      <nav class="nav">
        <a href="#books">Sách</a>
        <a href="#features">Chức năng</a>
        <a href="#stats">Thống kê</a>
      </nav>

      <div class="auth-actions">
        <RouterLink class="login-btn" to="/login">
          Đăng nhập
        </RouterLink>

        <RouterLink class="register-btn" to="/login?tab=register">
          Đăng ký
        </RouterLink>
      </div>
    </header>

    <section class="hero-section">
      <div class="hero-content">
        <div class="badge">
          <i class="mdi mdi-shield-check-outline"></i>
          Hệ thống thư viện số
        </div>

        <h1>
          Thư viện số DIGILIB
          <span>quản lý thật, dữ liệu thật</span>
        </h1>

        <p>
          Hệ thống hỗ trợ quản lý sách, bản sao, độc giả, mượn trả,
          thẻ thư viện, phí phạt và báo cáo thống kê. Người dùng đăng nhập
          một lần, hệ thống tự chuyển đúng giao diện theo vai trò.
        </p>

        <div class="hero-buttons">
          <RouterLink class="primary-btn" to="/login">
            Đăng nhập hệ thống
            <i class="mdi mdi-arrow-right"></i>
          </RouterLink>

          <RouterLink class="secondary-btn" to="/login?tab=register">
            Đăng ký độc giả
          </RouterLink>
        </div>

        <div class="role-row">
          <article>
            <i class="mdi mdi-account-tie-outline"></i>
            <b>Admin</b>
            <span>Quản trị hệ thống</span>
          </article>

          <article>
            <i class="mdi mdi-account-supervisor-outline"></i>
            <b>Thủ thư</b>
            <span>Xử lý mượn trả</span>
          </article>

          <article>
            <i class="mdi mdi-account-outline"></i>
            <b>Độc giả</b>
            <span>Tìm kiếm và mượn sách</span>
          </article>
        </div>
      </div>

      <aside class="hero-dashboard">
        <div class="dashboard-head">
          <div>
            <b>DIGILIB SYSTEM</b>
            <span>Dữ liệu lấy từ API Gateway</span>
          </div>

          <button type="button" :disabled="loading" @click="loadData">
            <i class="mdi mdi-refresh"></i>
          </button>
        </div>

        <div v-if="errorMessage" class="api-error">
          <i class="mdi mdi-alert-circle-outline"></i>
          {{ errorMessage }}
        </div>

        <div class="stat-grid" id="stats">
          <article>
            <i class="mdi mdi-book-open-outline blue"></i>
            <span>Tổng số sách</span>
            <b>{{ stats.books }}</b>
          </article>

          <article>
            <i class="mdi mdi-package-variant green"></i>
            <span>Bản sao</span>
            <b>{{ stats.copies }}</b>
          </article>

          <article>
            <i class="mdi mdi-shape-outline orange"></i>
            <span>Thể loại</span>
            <b>{{ stats.categories }}</b>
          </article>

          <article>
            <i class="mdi mdi-bank-outline purple"></i>
            <span>Nhà xuất bản</span>
            <b>{{ stats.publishers }}</b>
          </article>
        </div>

        <div class="copy-status">
          <div>
            <span>Sẵn sàng</span>
            <b>{{ copyStatus.available }}</b>
          </div>

          <div>
            <span>Đang mượn</span>
            <b>{{ copyStatus.borrowed }}</b>
          </div>

          <div>
            <span>Hư hỏng / mất</span>
            <b>{{ copyStatus.damaged }}</b>
          </div>
        </div>
      </aside>
    </section>

    <section id="books" class="books-section">
      <div class="section-title">
        <h2>Sách trong thư viện</h2>
        <p>
          Danh sách bên dưới lấy trực tiếp từ Catalog API. Nếu chưa nhập sách
          trong Admin thì khu vực này sẽ hiện trống.
        </p>
      </div>

      <div v-if="loading" class="loading-box">
        <i class="mdi mdi-loading mdi-spin"></i>
        Đang tải dữ liệu từ API...
      </div>

      <div v-else-if="books.length" class="book-grid">
        <article v-for="book in books.slice(0, 8)" :key="book.id" class="book-card">
          <div class="book-cover">
            <img
              v-if="book.coverImage"
              :src="book.coverImage"
              :alt="book.title"
            />

            <span v-else>
              {{ getBookInitial(book.title) }}
            </span>
          </div>

          <div>
            <h3>{{ book.title }}</h3>
            <p>{{ book.author || 'Chưa rõ tác giả' }}</p>

            <div class="book-meta">
              <span>{{ book.category || 'Chưa phân loại' }}</span>
              <b>{{ getBookAvailableCount(book) }} bản sẵn sàng</b>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-box">
        <i class="mdi mdi-book-outline"></i>
        <b>Chưa có sách trong hệ thống</b>
        <span>
          Bạn hãy đăng nhập Admin để thêm thể loại, tác giả, nhà xuất bản,
          sách và bản sao.
        </span>
      </div>
    </section>

    <section id="features" class="feature-section">
      <div class="section-title">
        <h2>Luồng sử dụng thật của hệ thống</h2>
        <p>Không tách rời demo, các giao diện dùng chung API Gateway.</p>
      </div>

      <div class="feature-grid">
        <article>
          <i class="mdi mdi-database-sync-outline"></i>
          <h3>Catalog Service</h3>
          <p>
            Quản lý sách, bản sao, thể loại, tác giả, nhà xuất bản và trạng thái tồn kho.
          </p>
        </article>

        <article>
          <i class="mdi mdi-book-sync-outline"></i>
          <h3>Circulation Service</h3>
          <p>
            Xử lý phiếu mượn, trả sách, gia hạn, sách quá hạn và phí phạt.
          </p>
        </article>

        <article>
          <i class="mdi mdi-account-key-outline"></i>
          <h3>Identity & Report</h3>
          <p>
            Quản lý tài khoản, vai trò, độc giả, thẻ thư viện, báo cáo và nhật ký hệ thống.
          </p>
        </article>
      </div>
    </section>

    <section class="cta-section">
      <div>
        <h2>Bắt đầu sử dụng DIGILIB</h2>
        <p>
          Admin, Thủ thư và Độc giả đều đăng nhập chung tại một màn hình.
          Sau khi đăng nhập, hệ thống tự chuyển đến đúng giao diện.
        </p>
      </div>

      <RouterLink class="primary-btn" to="/login">
        Vào đăng nhập
        <i class="mdi mdi-login"></i>
      </RouterLink>
    </section>

    <footer class="footer">
      <b>DIGILIB</b>
      <span>Hệ thống quản lý thư viện số</span>
    </footer>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

function getPublicUrl(port) {
  return `${window.location.protocol}//${window.location.hostname}:${port}`
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || getPublicUrl(8080)).replace(/\/$/, '')

const loading = ref(false)
const errorMessage = ref('')

const books = ref([])
const categories = ref([])
const authors = ref([])
const publishers = ref([])
const copies = ref([])

onMounted(() => {
  loadData()
})

const stats = computed(() => {
  return {
    books: books.value.length,
    categories: categories.value.length,
    authors: authors.value.length,
    publishers: publishers.value.length,
    copies: copies.value.length
  }
})

const copyStatus = computed(() => {
  let available = 0
  let borrowed = 0
  let damaged = 0

  for (const copy of copies.value) {
    const status = normalize(copy.status || copy.Status || copy.borrowStatus || copy.BorrowStatus)
    const condition = normalize(copy.condition || copy.Condition)

    if (
      status.includes('borrow') ||
      status.includes('dang muon') ||
      status.includes('loan')
    ) {
      borrowed += 1
    } else if (
      status.includes('lost') ||
      status.includes('damaged') ||
      status.includes('maintenance') ||
      condition.includes('hong') ||
      condition.includes('mat') ||
      condition.includes('bao tri')
    ) {
      damaged += 1
    } else {
      available += 1
    }
  }

  return {
    available,
    borrowed,
    damaged
  }
})

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [bookRes, categoryRes, authorRes, publisherRes, copyRes] =
      await Promise.allSettled([
        request('/api/books'),
        request('/api/categories'),
        request('/api/authors'),
        request('/api/publishers'),
        request('/api/copies')
      ])

    books.value = bookRes.status === 'fulfilled' ? toArray(bookRes.value).map(normalizeBook) : []
    categories.value = categoryRes.status === 'fulfilled' ? toArray(categoryRes.value) : []
    authors.value = authorRes.status === 'fulfilled' ? toArray(authorRes.value) : []
    publishers.value = publisherRes.status === 'fulfilled' ? toArray(publisherRes.value) : []
    copies.value = copyRes.status === 'fulfilled' ? toArray(copyRes.value) : []

    if (
      bookRes.status === 'rejected' &&
      categoryRes.status === 'rejected' &&
      authorRes.status === 'rejected' &&
      publisherRes.status === 'rejected'
    ) {
      throw new Error('Không kết nối được API Gateway.')
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Không tải được dữ liệu từ API.'
  } finally {
    loading.value = false
  }
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

function firstValue(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key]
    }
  }

  return fallback
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

function normalizeBook(item = {}) {
  const copies = toArray(item.copies || item.Copies)

  return {
    id: firstValue(item, ['id', 'Id', 'bookId', 'BookId']),
    title: firstValue(item, ['title', 'Title', 'name', 'Name'], 'Chưa rõ tên sách'),
    author: firstValue(item, ['author', 'Author', 'authorName', 'AuthorName'], ''),
    category: firstValue(item, ['category', 'Category', 'categoryName', 'CategoryName'], ''),
    publisher: firstValue(item, ['publisher', 'Publisher', 'publisherName', 'PublisherName'], ''),
    coverImage: firstValue(item, ['coverImage', 'CoverImage', 'coverUrl', 'CoverUrl', 'imageUrl', 'ImageUrl'], ''),
    copies
  }
}

function getBookInitial(title) {
  return String(title || 'S')
    .trim()
    .slice(0, 2)
    .toUpperCase()
}

function getBookAvailableCount(book) {
  const bookCopies = toArray(book.copies)

  if (!bookCopies.length) return 0

  return bookCopies.filter((copy) => {
    const status = normalize(copy.status || copy.Status)
    const condition = normalize(copy.condition || copy.Condition)

    return (
      !status.includes('borrow') &&
      !status.includes('dang muon') &&
      !status.includes('lost') &&
      !status.includes('damaged') &&
      !condition.includes('hong') &&
      !condition.includes('mat')
    )
  }).length
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 10%, rgba(37, 99, 235, 0.13), transparent 30%),
    radial-gradient(circle at 90% 8%, rgba(59, 130, 246, 0.14), transparent 28%),
    linear-gradient(135deg, #f8fafc 0%, #edf4ff 100%);
  color: #0f172a;
}

.landing-header {
  height: 86px;
  padding: 0 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  color: #2563eb;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: 28px;
  font-weight: 950;
  letter-spacing: 0.5px;
}

.brand-icon {
  width: 52px;
  height: 52px;
  border-radius: 17px;
  background: #eff6ff;
  display: grid;
  place-items: center;
  font-size: 31px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 34px;
}

.nav a {
  color: #475569;
  text-decoration: none;
  font-weight: 800;
}

.nav a:hover {
  color: #2563eb;
}

.auth-actions {
  display: flex;
  gap: 12px;
}

.login-btn,
.register-btn,
.primary-btn,
.secondary-btn {
  height: 48px;
  padding: 0 20px;
  border-radius: 15px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
}

.login-btn,
.secondary-btn {
  color: #2563eb;
  background: #ffffff;
  border: 1px solid #dbeafe;
}

.register-btn,
.primary-btn {
  color: #ffffff;
  background: #2563eb;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.24);
}

.hero-section {
  max-width: 1380px;
  margin: 48px auto 0;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.badge {
  width: max-content;
  padding: 10px 16px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
}

.hero-content h1 {
  margin: 24px 0 0;
  max-width: 760px;
  font-size: 66px;
  line-height: 1.04;
  font-weight: 950;
  letter-spacing: -2.2px;
}

.hero-content h1 span {
  display: block;
  color: #2563eb;
}

.hero-content p {
  max-width: 700px;
  margin: 24px 0 0;
  color: #64748b;
  font-size: 19px;
  line-height: 1.75;
  font-weight: 550;
}

.hero-buttons {
  margin-top: 34px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.role-row {
  margin-top: 42px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.role-row article,
.hero-dashboard,
.book-card,
.feature-grid article,
.cta-section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
}

.role-row article {
  padding: 22px;
  border-radius: 22px;
}

.role-row i {
  color: #2563eb;
  font-size: 32px;
}

.role-row b,
.role-row span {
  display: block;
}

.role-row b {
  margin-top: 12px;
  font-size: 20px;
  font-weight: 950;
}

.role-row span {
  margin-top: 5px;
  color: #64748b;
  font-weight: 700;
}

.hero-dashboard {
  padding: 30px;
  border-radius: 34px;
  backdrop-filter: blur(18px);
}

.dashboard-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-head b {
  display: block;
  font-size: 24px;
  font-weight: 950;
  letter-spacing: 2.5px;
}

.dashboard-head span {
  color: #64748b;
  font-weight: 700;
}

.dashboard-head button {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 15px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 22px;
  cursor: pointer;
}

.dashboard-head button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-error {
  margin-top: 18px;
  padding: 13px 15px;
  border-radius: 15px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  font-weight: 800;
}

.stat-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.stat-grid article {
  min-height: 138px;
  padding: 22px;
  border-radius: 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.stat-grid i {
  font-size: 32px;
}

.stat-grid span,
.stat-grid b {
  display: block;
}

.stat-grid span {
  margin-top: 13px;
  color: #64748b;
  font-weight: 800;
}

.stat-grid b {
  margin-top: 5px;
  color: #0f172a;
  font-size: 34px;
  font-weight: 950;
}

.blue {
  color: #2563eb;
}

.green {
  color: #16a34a;
}

.orange {
  color: #f97316;
}

.purple {
  color: #7c3aed;
}

.copy-status {
  margin-top: 24px;
  display: grid;
  gap: 0;
}

.copy-status div {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 800;
}

.copy-status div:last-child {
  border-bottom: 0;
}

.copy-status b {
  color: #0f172a;
  font-size: 20px;
}

.books-section,
.feature-section {
  max-width: 1380px;
  margin: 90px auto 0;
  padding: 0 48px;
}

.section-title {
  text-align: center;
  margin-bottom: 34px;
}

.section-title h2 {
  margin: 0;
  font-size: 42px;
  font-weight: 950;
  letter-spacing: -1px;
}

.section-title p {
  max-width: 760px;
  margin: 12px auto 0;
  color: #64748b;
  font-size: 17px;
  line-height: 1.65;
  font-weight: 600;
}

.loading-box,
.empty-box {
  min-height: 220px;
  border-radius: 28px;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.86);
  color: #64748b;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 30px;
  font-weight: 800;
}

.empty-box i,
.loading-box i {
  color: #2563eb;
  font-size: 42px;
}

.empty-box b,
.empty-box span {
  display: block;
}

.empty-box b {
  margin-top: 8px;
  color: #0f172a;
  font-size: 22px;
}

.empty-box span {
  max-width: 520px;
  margin-top: 8px;
  line-height: 1.6;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.book-card {
  padding: 18px;
  border-radius: 26px;
}

.book-cover {
  height: 220px;
  border-radius: 20px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-cover span {
  color: #2563eb;
  font-size: 38px;
  font-weight: 950;
}

.book-card h3 {
  min-height: 48px;
  margin: 16px 0 5px;
  font-size: 19px;
  line-height: 1.25;
  font-weight: 950;
}

.book-card p {
  margin: 0;
  color: #64748b;
  font-weight: 700;
}

.book-meta {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.book-meta span {
  color: #2563eb;
  background: #eff6ff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
}

.book-meta b {
  color: #16a34a;
  font-size: 13px;
  font-weight: 900;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.feature-grid article {
  padding: 30px;
  border-radius: 28px;
}

.feature-grid i {
  color: #2563eb;
  font-size: 42px;
}

.feature-grid h3 {
  margin: 18px 0 10px;
  font-size: 24px;
  font-weight: 950;
}

.feature-grid p {
  margin: 0;
  color: #64748b;
  line-height: 1.65;
  font-weight: 600;
}

.cta-section {
  max-width: 1280px;
  margin: 90px auto 0;
  padding: 42px;
  border-radius: 34px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.cta-section h2 {
  margin: 0;
  font-size: 36px;
  font-weight: 950;
}

.cta-section p {
  max-width: 760px;
  margin: 10px 0 0;
  color: #cbd5e1;
  line-height: 1.65;
  font-weight: 600;
}

.footer {
  max-width: 1380px;
  margin: 60px auto 0;
  padding: 30px 48px 46px;
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-weight: 700;
}

.footer b {
  color: #2563eb;
  font-size: 22px;
  font-weight: 950;
}

@media (max-width: 1080px) {
  .landing-header {
    padding: 0 24px;
  }

  .nav {
    display: none;
  }

  .hero-section {
    grid-template-columns: 1fr;
    padding: 0 24px;
  }

  .book-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-grid,
  .role-row {
    grid-template-columns: 1fr;
  }

  .cta-section {
    margin-left: 24px;
    margin-right: 24px;
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 680px) {
  .auth-actions {
    gap: 8px;
  }

  .login-btn,
  .register-btn {
    padding: 0 12px;
  }

  .hero-content h1 {
    font-size: 42px;
  }

  .stat-grid,
  .book-grid {
    grid-template-columns: 1fr;
  }

  .books-section,
  .feature-section {
    padding: 0 24px;
  }
}
</style>
