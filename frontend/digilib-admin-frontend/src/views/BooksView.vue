<template>
  <PageHeader
    title="Sách"
    subtitle="Quản lý thông tin sách trong thư viện"
    breadcrumb="Sách"
  >
    <div class="btn-row">
      <button class="ghost-btn" @click="exportCsv">
        <v-icon icon="mdi-download" />
        Xuất CSV
      </button>

      <RouterLink to="/books/new" class="primary-btn">
        <v-icon icon="mdi-plus" />
        Thêm sách mới
      </RouterLink>
    </div>
  </PageHeader>

  <div v-if="error" class="card card-pad alert-error">
    {{ error }}
  </div>

  <div v-if="success" class="card card-pad alert-success">
    {{ success }}
  </div>

  <div class="grid grid-4 stats-grid">
    <StatCard
      label="Tổng số sách"
      :value="filteredBooks.length"
      icon="mdi-book-open-page-variant"
    />

    <StatCard
      label="Tổng bản sao"
      :value="stats.totalCopies"
      icon="mdi-package-variant"
      color="#16a34a"
      bg="#ecfdf5"
    />

    <StatCard
      label="Đang được mượn"
      :value="stats.borrowedCopies"
      icon="mdi-book-sync-outline"
      color="#f59e0b"
      bg="#fffbeb"
    />

    <StatCard
      label="Đã ngưng"
      :value="stats.inactiveBooks"
      icon="mdi-pause-circle-outline"
      color="#64748b"
      bg="#f1f5f9"
    />
  </div>

  <div class="card filter-bar books-filter">
    <div class="field">
      <input
        class="input"
        placeholder="Tìm kiếm sách"
        v-model="filters.q"
      />
    </div>

    <div class="field">
      <label>Thể loại</label>
      <select class="select" v-model="filters.category">
        <option value="">Tất cả</option>
        <option v-for="c in categories" :key="c.id" :value="c.name">
          {{ c.name }}
        </option>
      </select>
    </div>

    <div class="field">
      <label>Tác giả</label>
      <select class="select" v-model="filters.author">
        <option value="">Tất cả</option>
        <option v-for="a in authors" :key="a.id" :value="a.name">
          {{ a.name }}
        </option>
      </select>
    </div>

    <div class="field">
      <label>Nhà xuất bản</label>
      <select class="select" v-model="filters.publisher">
        <option value="">Tất cả</option>
        <option v-for="p in publishers" :key="p.id" :value="p.name">
          {{ p.name }}
        </option>
      </select>
    </div>

    <div class="field">
      <label>Trạng thái</label>
      <select class="select" v-model="filters.status">
        <option value="">Tất cả</option>
        <option value="Hoạt động">Hoạt động</option>
        <option value="Ngưng sử dụng">Ngưng sử dụng</option>
      </select>
    </div>

    <button class="ghost-btn" @click="loadBooks">
      <v-icon icon="mdi-refresh" />
      Tải lại
    </button>

    <button class="ghost-btn" @click="resetFilters">
      <v-icon icon="mdi-refresh" />
      Đặt lại
    </button>
  </div>

  <div class="card">
    <div class="card-pad table-head">
      <h3 class="section-title">
        Danh sách sách ({{ filteredBooks.length }} sách)
      </h3>

      <span>
        {{ loading ? 'Đang tải...' : 'Dữ liệu từ Catalog API' }}
      </span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Ảnh bìa</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Thể loại</th>
            <th>NXB</th>
            <th>Năm XB</th>
            <th>Số bản sao</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(book, index) in filteredBooks" :key="book.id">
            <td>{{ index + 1 }}</td>

            <td>
              <img
                :src="book.cover"
                class="book-cover"
                @error="onImageError"
              />
            </td>

            <td>
              <RouterLink :to="`/books/${book.id}`">
                <b>{{ book.title }}</b>
              </RouterLink>

              <br />

              <span class="book-desc">
                {{ book.subtitle }}
              </span>
            </td>

            <td>{{ book.author }}</td>

            <td>
              <span class="badge purple">
                {{ book.category }}
              </span>
            </td>

            <td>{{ book.publisher }}</td>

            <td>{{ book.year }}</td>

            <td>{{ book.copies }}</td>

            <td>
              <StatusBadge :text="book.status" />
            </td>

            <td>
              <RouterLink :to="`/books/${book.id}`" class="action-btn">
                <v-icon icon="mdi-eye-outline" />
              </RouterLink>

              <button class="action-btn danger" @click="removeBook(book)">
                <v-icon icon="mdi-trash-can-outline" />
              </button>
            </td>
          </tr>

          <tr v-if="!loading && filteredBooks.length === 0">
            <td colspan="10" class="empty-state">
              Không có sách phù hợp.
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="10" class="empty-state">
              Đang tải dữ liệu...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { catalogApi, getErrorMessage } from '../services/api'

const books = ref([])
const categories = ref([])
const authors = ref([])
const publishers = ref([])

const loading = ref(false)
const error = ref('')
const success = ref('')

const fallbackCover =
  'https://placehold.co/160x220/png?text=DIGILIB'

const filters = reactive({
  q: '',
  category: '',
  author: '',
  publisher: '',
  status: ''
})

const filteredBooks = computed(() => {
  const keyword = filters.q.trim().toLowerCase()

  return books.value.filter((book) => {
    const matchesKeyword =
      !keyword ||
      book.title.toLowerCase().includes(keyword) ||
      book.isbn.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.category.toLowerCase().includes(keyword) ||
      book.publisher.toLowerCase().includes(keyword)

    const matchesCategory =
      !filters.category || book.category === filters.category

    const matchesAuthor =
      !filters.author || book.author === filters.author

    const matchesPublisher =
      !filters.publisher || book.publisher === filters.publisher

    const matchesStatus =
      !filters.status || book.status === filters.status

    return (
      matchesKeyword &&
      matchesCategory &&
      matchesAuthor &&
      matchesPublisher &&
      matchesStatus
    )
  })
})

const stats = computed(() => {
  return {
    totalCopies: filteredBooks.value.reduce(
      (sum, book) => sum + Number(book.copies || 0),
      0
    ),

    borrowedCopies: filteredBooks.value.reduce(
      (sum, book) => sum + Number(book.borrowedCopies || 0),
      0
    ),

    inactiveBooks: filteredBooks.value.filter(
      (book) => book.status !== 'Hoạt động'
    ).length
  }
})

onMounted(async () => {
  await Promise.all([loadLookups(), loadBooks()])
})

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.$values)) return data.$values
  return []
}

function normalizeLookup(item) {
  return {
    id: item.id ?? item.Id,
    name:
      item.name ??
      item.Name ??
      item.title ??
      item.Title ??
      'Chưa rõ'
  }
}

function normalizeStatus(status) {
  const text = String(status || '').toLowerCase()

  if (
    text.includes('inactive') ||
    text.includes('ngưng') ||
    text.includes('ngung') ||
    text.includes('deleted')
  ) {
    return 'Ngưng sử dụng'
  }

  return 'Hoạt động'
}

function normalizeBook(item) {
  const copies = toArray(item.copies ?? item.Copies)

  const borrowedCopies = copies.filter((copy) => {
    const status = String(copy.status ?? copy.Status ?? '').toLowerCase()
    return (
      status.includes('borrow') ||
      status.includes('đang mượn') ||
      status.includes('dang muon')
    )
  }).length

  const title =
    item.title ??
    item.Title ??
    item.name ??
    item.Name ??
    'Chưa có tên sách'

  const description =
    item.description ??
    item.Description ??
    ''

  const cover =
    item.coverImage ??
    item.CoverImage ??
    item.coverImageUrl ??
    item.CoverImageUrl ??
    fallbackCover

  return {
    id: item.id ?? item.Id,

    title,

    subtitle:
      description ||
      item.subtitle ||
      item.Subtitle ||
      'Chưa có mô tả',

    isbn:
      item.isbn ??
      item.ISBN ??
      item.Isbn ??
      '',

    author:
      item.author ??
      item.Author ??
      item.authorName ??
      item.AuthorName ??
      'Chưa rõ',

    category:
      item.category ??
      item.Category ??
      item.categoryName ??
      item.CategoryName ??
      'Chưa phân loại',

    publisher:
      item.publisher ??
      item.Publisher ??
      item.publisherName ??
      item.PublisherName ??
      'Chưa rõ',

    year:
      item.publishedYear ??
      item.PublishedYear ??
      item.publishYear ??
      item.PublishYear ??
      item.year ??
      item.Year ??
      0,

    cover,

    copies:
      item.copyCount ??
      item.CopyCount ??
      item.totalCopies ??
      item.TotalCopies ??
      copies.length,

    borrowedCopies,

    status: normalizeStatus(item.status ?? item.Status)
  }
}

async function loadLookups() {
  try {
    const [categoryRes, authorRes, publisherRes] = await Promise.all([
      catalogApi.categories(),
      catalogApi.authors(),
      catalogApi.publishers()
    ])

    categories.value = toArray(categoryRes.data).map(normalizeLookup)
    authors.value = toArray(authorRes.data).map(normalizeLookup)
    publishers.value = toArray(publisherRes.data).map(normalizeLookup)
  } catch {
    // Không chặn trang sách nếu danh mục lỗi
  }
}

async function loadBooks() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await catalogApi.books()
    books.value = toArray(data).map(normalizeBook)
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được danh sách sách.')
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  Object.assign(filters, {
    q: '',
    category: '',
    author: '',
    publisher: '',
    status: ''
  })

  loadBooks()
}

async function removeBook(book) {
  if (!confirm(`Xóa hoặc ngưng hoạt động sách ${book.title}?`)) return

  error.value = ''
  success.value = ''

  try {
    await catalogApi.deleteBook(book.id)
    success.value = 'Đã xóa/ngưng hoạt động sách.'
    await loadBooks()
  } catch (e) {
    error.value = getErrorMessage(e, 'Không thể xóa sách này.')
  }
}

function exportCsv() {
  const rows = [
    [
      'Tên sách',
      'ISBN',
      'Tác giả',
      'Thể loại',
      'NXB',
      'Năm',
      'Số bản sao',
      'Trạng thái'
    ],
    ...filteredBooks.value.map((book) => [
      book.title,
      book.isbn,
      book.author,
      book.category,
      book.publisher,
      book.year,
      book.copies,
      book.status
    ])
  ]

  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')
    )
    .join('\n')

  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;'
    })
  )

  const a = document.createElement('a')
  a.href = url
  a.download = 'books.csv'
  a.click()

  URL.revokeObjectURL(url)
}

function onImageError(event) {
  event.target.src = fallbackCover
}
</script>

<style scoped>
.stats-grid {
  margin-bottom: 18px;
}

.books-filter {
  margin-bottom: 18px;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto auto;
}

.alert-error {
  margin-bottom: 16px;
  color: #ef4444;
}

.alert-success {
  margin-bottom: 16px;
  color: #16a34a;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-head h3 {
  margin: 0;
}

.table-head span {
  color: #64748b;
}

.book-cover {
  width: 58px;
  height: 76px;
  object-fit: cover;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid #e5eaf3;
}

.book-desc {
  display: inline-block;
  max-width: 420px;
  margin-top: 6px;
  color: #64748b;
  line-height: 1.45;
}

@media (max-width: 1200px) {
  .books-filter {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .books-filter {
    grid-template-columns: 1fr;
  }

  .table-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
</style>