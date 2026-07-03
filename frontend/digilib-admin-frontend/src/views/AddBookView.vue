<template>
  <PageHeader
    title="Thêm sách mới"
    subtitle="Tạo bản ghi sách mới cho hệ thống thư viện"
    breadcrumb="Sách › Thêm sách mới"
  />

  <div class="two-column">
    <div class="card">
      <form @submit.prevent="save">
        <div class="card-pad">
          <h3 class="section-title">Thông tin sách</h3>

          <div class="form-grid">
            <div class="field">
              <label>ISBN *</label>
              <input
                v-model.trim="form.isbn"
                class="input"
                placeholder="Ví dụ: 9786041122334"
                required
              />
            </div>

            <div class="field">
              <label>Mã phân loại Dewey</label>
              <input
                v-model.trim="form.deweyCode"
                class="input"
                placeholder="Ví dụ: 895.922"
              />
            </div>

            <div class="field" style="grid-column: 1 / -1">
              <label>Tên sách *</label>
              <input
                v-model.trim="form.title"
                class="input"
                placeholder="Nhập tên sách"
                required
              />
            </div>

            <div class="field">
              <label>Tác giả *</label>
              <select v-model="form.authorId" class="select" required>
                <option value="">Chọn tác giả</option>
                <option v-for="a in authors" :key="a.id" :value="String(a.id)">
                  {{ a.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Thể loại *</label>
              <select v-model="form.categoryId" class="select" required>
                <option value="">Chọn thể loại</option>
                <option v-for="c in categories" :key="c.id" :value="String(c.id)">
                  {{ c.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Nhà xuất bản *</label>
              <select v-model="form.publisherId" class="select" required>
                <option value="">Chọn nhà xuất bản</option>
                <option v-for="p in publishers" :key="p.id" :value="String(p.id)">
                  {{ p.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Năm xuất bản *</label>
              <input
                v-model.number="form.publishYear"
                class="input"
                type="number"
                min="1000"
                required
              />
            </div>

            <div class="field">
              <label>Ngôn ngữ *</label>
              <select v-model="form.language" class="select">
                <option>Tiếng Việt</option>
                <option>Tiếng Anh</option>
              </select>
            </div>

            <div class="field">
              <label>Số trang</label>
              <input
                v-model.number="form.pageCount"
                class="input"
                type="number"
                min="0"
              />
            </div>

            <div class="field" style="grid-column: 1 / -1">
              <label>Tóm tắt ngắn</label>
              <textarea
                v-model.trim="form.description"
                placeholder="Nhập tóm tắt nội dung sách..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <RouterLink to="/books" class="ghost-btn">
            Hủy
          </RouterLink>

          <button class="ghost-btn" type="button" @click="saveDraft">
            <v-icon icon="mdi-content-save-outline" />
            Lưu nháp
          </button>

          <button class="primary-btn" type="submit" :disabled="loading">
            <v-icon icon="mdi-content-save" />
            {{ loading ? 'Đang lưu...' : 'Lưu sách' }}
          </button>
        </div>
      </form>
    </div>

    <div class="grid">
      <div class="card card-pad">
        <h3 class="section-title">Ảnh bìa sách</h3>

        <div class="upload-box">
          <div>
            <v-icon icon="mdi-cloud-upload-outline" size="46" color="primary" />

            <p>Dán URL ảnh bìa hoặc nhập sau</p>

            <input
              v-model.trim="form.coverImageUrl"
              class="input"
              placeholder="https://..."
            />

            <p style="font-size: 12px; margin-top: 10px">
              JPG, PNG, WEBP. Kích thước đề xuất: 700x1000px
            </p>
          </div>
        </div>

        <div v-if="form.coverImageUrl" class="cover-preview">
          <img :src="form.coverImageUrl" alt="Ảnh bìa sách" />
        </div>
      </div>

      <div class="card card-pad">
        <h3 class="section-title">Thông tin bản sao</h3>

        <div class="grid grid-2">
          <div class="field">
            <label>Số lượng bản sao *</label>
            <input
              v-model.number="form.initialCopies"
              class="input"
              type="number"
              min="1"
            />
          </div>

          <div class="field">
            <label>Vị trí kệ *</label>
            <input
              v-model.trim="form.shelfLocation"
              class="input"
              placeholder="Ví dụ: Tầng 1 - Kệ A1"
            />
          </div>

          <div class="field" style="grid-column: 1 / -1">
            <label>Ghi chú</label>
            <input
              v-model.trim="form.note"
              class="input"
              placeholder="Sách mới, chưa sử dụng..."
            />
          </div>
        </div>

        <p class="badge blue" style="margin-top: 16px">
          Sau khi lưu, hệ thống tự tạo các bản sao theo số lượng đã nhập.
        </p>
      </div>

      <div v-if="message" class="card card-pad">
        <p :style="{ color: isError ? '#ef4444' : '#16a34a' }">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { catalogApi, getErrorMessage } from '../services/api'

const router = useRouter()

const loading = ref(false)
const message = ref('')
const isError = ref(false)

const categories = ref([])
const authors = ref([])
const publishers = ref([])

const form = reactive({
  isbn: '',
  title: '',
  deweyCode: '',
  authorId: '',
  categoryId: '',
  publisherId: '',
  publishYear: new Date().getFullYear(),
  language: 'Tiếng Việt',
  pageCount: 0,
  description: '',
  coverImageUrl: '',
  initialCopies: 1,
  shelfLocation: '',
  note: ''
})

onMounted(loadLookups)

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
    name: item.name ?? item.Name ?? item.title ?? item.Title ?? 'Chưa rõ'
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
  } catch (e) {
    message.value = getErrorMessage(
      e,
      'Không tải được danh mục từ backend. Hãy kiểm tra API Gateway.'
    )
    isError.value = true
  }
}

function selectedName(list, id) {
  const item = list.value.find((x) => String(x.id) === String(id))
  return item?.name || ''
}

function buildBookPayload() {
  const authorName = selectedName(authors, form.authorId)
  const categoryName = selectedName(categories, form.categoryId)
  const publisherName = selectedName(publishers, form.publisherId)

  const descriptionParts = [
    form.description,
    form.deweyCode ? `Mã phân loại Dewey: ${form.deweyCode}` : '',
    form.language ? `Ngôn ngữ: ${form.language}` : '',
    Number(form.pageCount || 0) > 0 ? `Số trang: ${form.pageCount}` : '',
    form.note ? `Ghi chú: ${form.note}` : ''
  ].filter(Boolean)

  return {
    title: form.title,
    isbn: form.isbn,
    author: authorName,
    category: categoryName,
    publisher: publisherName,
    publishedYear: Number(form.publishYear || new Date().getFullYear()),
    description: descriptionParts.join('\n'),
    coverImage: form.coverImageUrl || ''
  }
}

function buildCopyPayload(index) {
  const codeBase = form.isbn || form.title.replaceAll(' ', '-').toUpperCase()
  const copyCode = `${codeBase}-${String(index).padStart(3, '0')}`

  return {
    copyCode,
    status: 'Available',
    condition: 'Sẵn sàng',
    location: form.shelfLocation,
    shelfLocation: form.shelfLocation,
    note: form.note
  }
}

async function save() {
  loading.value = true
  message.value = ''
  isError.value = false

  try {
    const bookPayload = buildBookPayload()

    const bookRes = await catalogApi.createBook(bookPayload)
    const createdBook = bookRes.data

    const bookId = createdBook?.id ?? createdBook?.Id

    if (!bookId) {
      throw new Error('Đã tạo sách nhưng không lấy được ID sách để tạo bản sao.')
    }

    const totalCopies = Math.max(1, Number(form.initialCopies || 1))

    for (let i = 1; i <= totalCopies; i++) {
      await catalogApi.createBookCopy(bookId, buildCopyPayload(i))
    }

    router.push('/books')
  } catch (e) {
    isError.value = true
    message.value = getErrorMessage(e, 'Lưu sách thất bại.')
  } finally {
    loading.value = false
  }
}

function saveDraft() {
  localStorage.setItem('digilib_add_book_draft', JSON.stringify(form))
  isError.value = false
  message.value = 'Đã lưu nháp trên trình duyệt.'
}
</script>

<style scoped>
.cover-preview {
  margin-top: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 16px;
  overflow: hidden;
  background: #f8fafc;
}

.cover-preview img {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  background: #f8fafc;
}
</style>