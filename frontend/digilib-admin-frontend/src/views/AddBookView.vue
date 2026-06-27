<template>
  <PageHeader title="Thêm sách mới" subtitle="Tạo bản ghi sách mới cho hệ thống thư viện" breadcrumb="Sách › Thêm sách mới" />

  <div class="two-column">
    <div class="card">
      <form @submit.prevent="save">
        <div class="card-pad">
          <h3 class="section-title">Thông tin sách</h3>
          <div class="form-grid">
            <div class="field"><label>ISBN *</label><input v-model="form.isbn" class="input" placeholder="Ví dụ: 9786041122334" required /></div>
            <div class="field"><label>Mã phân loại Dewey</label><input v-model="form.deweyCode" class="input" placeholder="Ví dụ: 823.92" /></div>
            <div class="field" style="grid-column:1/-1"><label>Tên sách *</label><input v-model="form.title" class="input" placeholder="Nhập tên sách" required /></div>
            <div class="field"><label>Tác giả *</label><select v-model="form.authorId" class="select" required><option value="">Chọn tác giả</option><option v-for="a in authors" :key="a.id" :value="a.id">{{ a.name }}</option></select></div>
            <div class="field"><label>Thể loại *</label><select v-model="form.categoryId" class="select" required><option value="">Chọn thể loại</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
            <div class="field"><label>Nhà xuất bản *</label><select v-model="form.publisherId" class="select" required><option value="">Chọn nhà xuất bản</option><option v-for="p in publishers" :key="p.id" :value="p.id">{{ p.name }}</option></select></div>
            <div class="field"><label>Năm xuất bản *</label><input v-model.number="form.publishYear" class="input" type="number" min="1000" required /></div>
            <div class="field"><label>Ngôn ngữ *</label><select v-model="form.language" class="select"><option>Tiếng Việt</option><option>Tiếng Anh</option></select></div>
            <div class="field"><label>Số trang</label><input v-model.number="form.pageCount" class="input" type="number" min="1" /></div>
            <div class="field" style="grid-column:1/-1"><label>Tóm tắt ngắn</label><textarea v-model="form.description" placeholder="Nhập tóm tắt nội dung sách..."></textarea></div>
          </div>
        </div>
        <div class="form-actions"><RouterLink to="/books" class="ghost-btn">Hủy</RouterLink><button class="ghost-btn" type="button"><v-icon icon="mdi-content-save-outline" /> Lưu nháp</button><button class="primary-btn" type="submit" :disabled="loading"><v-icon icon="mdi-content-save" /> {{ loading ? 'Đang lưu...' : 'Lưu sách' }}</button></div>
      </form>
    </div>

    <div class="grid">
      <div class="card card-pad">
        <h3 class="section-title">Ảnh bìa sách</h3>
        <div class="upload-box"><div><v-icon icon="mdi-cloud-upload-outline" size="46" color="primary" /><p>Dán URL ảnh bìa hoặc nhập sau</p><input v-model="form.coverImageUrl" class="input" placeholder="https://..." /><p style="font-size:12px;margin-top:10px">JPG, PNG, WEBP. Kích thước đề xuất: 700x1000px</p></div></div>
      </div>
      <div class="card card-pad">
        <h3 class="section-title">Thông tin bản sao</h3>
        <div class="grid grid-2">
          <div class="field"><label>Số lượng bản sao *</label><input v-model.number="form.initialCopies" class="input" type="number" min="1" /></div>
          <div class="field"><label>Vị trí kệ *</label><input v-model="form.shelfLocation" class="input" placeholder="Ví dụ: Kệ A - Ngăn 1" /></div>
          <div class="field" style="grid-column:1/-1"><label>Ghi chú</label><input v-model="form.note" class="input" placeholder="Sách mới, chưa sử dụng..." /></div>
        </div>
        <p class="badge blue" style="margin-top:16px">Sau khi lưu, hệ thống tự tạo các bản sao theo số lượng đã nhập.</p>
      </div>
      <div v-if="message" class="card card-pad"><p :style="{ color: isError ? '#ef4444' : '#16a34a' }">{{ message }}</p></div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { catalogApi } from '../services/api'

const router = useRouter()
const loading = ref(false)
const message = ref('')
const isError = ref(false)
const categories = ref([])
const authors = ref([])
const publishers = ref([])
const form = reactive({ isbn: '', title: '', deweyCode: '', authorId: '', categoryId: '', publisherId: '', publishYear: new Date().getFullYear(), language: 'Tiếng Việt', pageCount: 0, description: '', coverImageUrl: '', initialCopies: 1, shelfLocation: '', note: '' })

onMounted(async () => {
  try {
    const [c, a, p] = await Promise.all([catalogApi.categories(), catalogApi.authors(), catalogApi.publishers()])
    categories.value = c.data
    authors.value = a.data
    publishers.value = p.data
  } catch {
    message.value = 'Không tải được danh mục từ backend. Hãy kiểm tra API Gateway.'
    isError.value = true
  }
})

async function save() {
  loading.value = true
  message.value = ''
  try {
    await catalogApi.createBook({
      isbn: form.isbn,
      title: form.title,
      subtitle: '',
      deweyCode: form.deweyCode,
      authorId: form.authorId || null,
      categoryId: form.categoryId || null,
      publisherId: form.publisherId || null,
      publishYear: form.publishYear,
      language: form.language,
      pageCount: form.pageCount || 0,
      description: form.description,
      coverImageUrl: form.coverImageUrl,
      initialCopies: form.initialCopies || 1,
      shelfLocation: form.shelfLocation,
      note: form.note
    })
    router.push('/books')
  } catch (e) {
    isError.value = true
    message.value = e?.response?.data || e.message || 'Lưu sách thất bại'
  } finally {
    loading.value = false
  }
}
</script>
