<template>
  <div>
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center ga-4 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-4">Quản lý Sách</h2>
        <p class="text-body-2 text-grey">Thêm, sửa, xóa và theo dõi số lượng sách</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showAdd = true">Thêm sách mới</v-btn>
    </div>

    <v-card>
      <v-card-text class="pa-6">
        <div class="d-flex flex-column flex-sm-row ga-4 mb-6">
          <v-text-field v-model="search" placeholder="Tìm kiếm theo tên sách, tác giả, ISBN..." prepend-inner-icon="mdi-magnify" hide-details class="flex-grow-1" />
          <v-btn variant="outlined" prepend-icon="mdi-filter-variant">Lọc</v-btn>
        </div>

        <v-table>
          <thead>
            <tr>
              <th style="width: 80px;">Ảnh bìa</th>
              <th>Thông tin sách</th>
              <th>ISBN</th>
              <th class="text-center">Bản sao</th>
              <th>Tình trạng</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td>
                <div style="width: 48px; height: 64px; border-radius: 4px; overflow: hidden; border: 1px solid #e5e7eb;">
                  <img v-if="book.coverImageUrl || book.coverImage" :src="book.coverImageUrl || book.coverImage" :alt="book.title" style="width: 100%; height: 100%; object-fit: cover;" />
                  <div v-else class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                    <v-icon size="24" color="grey">mdi-book</v-icon>
                  </div>
                </div>
              </td>
              <td>
                <p class="font-weight-bold text-grey-darken-4">{{ book.title }}</p>
                <p class="text-caption text-grey">{{ book.author }}</p>
              </td>
              <td class="text-body-2 text-grey-darken-1" style="font-family: monospace;">{{ book.isbn || book.ISBN }}</td>
              <td class="text-center">
                <span class="font-weight-bold">{{ getAvailable(book) }}</span> / {{ getTotalCopies(book) }}
              </td>
              <td>
                <v-chip :color="getAvailable(book) > 0 ? 'success' : 'error'" size="small" variant="tonal">
                  {{ getAvailable(book) > 0 ? `Sẵn sàng (${getAvailable(book)})` : 'Đang mượn hết' }}
                </v-chip>
              </td>
              <td class="text-end">
                <v-btn icon variant="text" size="small" color="primary" @click="editBook(book)"><v-icon size="18">mdi-pencil</v-icon></v-btn>
                <v-btn icon variant="text" size="small" color="error" @click="confirmDelete(book)"><v-icon size="18">mdi-delete</v-icon></v-btn>
              </td>
            </tr>
            <tr v-if="books.length === 0">
              <td colspan="6" class="text-center text-grey py-8">Chưa có sách nào</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showAdd" max-width="720" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-6 border-b">{{ editingBook ? 'Sửa sách' : 'Thêm sách mới' }}</v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.isbn" label="ISBN" class="mb-2" />
              <v-text-field v-model="form.title" label="Tên sách" class="mb-2" />
              <v-text-field v-model="form.author" label="Tác giả" class="mb-2" />
              <v-text-field v-model="form.publisher" label="Nhà xuất bản" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.categoryId" :items="categories" item-title="name" item-value="id" label="Thể loại" class="mb-2" />
              <v-row>
                <v-col cols="6"><v-text-field v-model.number="form.publishYear" label="Năm XB" type="number" /></v-col>
                <v-col cols="6"><v-text-field v-model="form.coverImageUrl" label="Ảnh bìa (URL)" /></v-col>
              </v-row>
              <v-textarea v-model="form.description" label="Mô tả" rows="3" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 border-t">
          <v-spacer />
          <v-btn variant="outlined" @click="closeForm">Hủy bỏ</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveBook">Lưu thông tin</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDelete" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
        <v-card-text>Bạn có chắc chắn muốn xóa sách "{{ deletingBook?.title }}"?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDelete = false">Hủy</v-btn>
          <v-btn color="error" @click="deleteBook">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { catalogApi } from '../../services/catalogApi'

const books = ref([])
const categories = ref([])
const search = ref('')
const showAdd = ref(false)
const showDelete = ref(false)
const editingBook = ref(null)
const deletingBook = ref(null)
const saving = ref(false)

const form = reactive({ isbn: '', title: '', author: '', publisher: '', categoryId: null, publishYear: null, coverImageUrl: '', description: '' })

function getAvailable(book) {
  return book.copies?.filter(c => c.status === 'Available').length || 0
}
function getTotalCopies(book) {
  return book.copies?.length || 0
}

async function loadBooks() {
  try {
    const { data } = await catalogApi.getBooks()
    books.value = Array.isArray(data) ? data : (data.data || [])
  } catch { books.value = [] }
}

async function loadCategories() {
  try {
    const { data } = await catalogApi.getCategories()
    categories.value = Array.isArray(data) ? data : (data.data || [])
  } catch { categories.value = [] }
}

function editBook(book) {
  editingBook.value = book
  Object.assign(form, { isbn: book.isbn || book.ISBN, title: book.title, author: book.author, publisher: book.publisher, categoryId: book.categoryId, publishYear: book.publishYear || book.publishedYear, coverImageUrl: book.coverImageUrl || book.coverImage, description: book.description })
  showAdd.value = true
}

function closeForm() {
  showAdd.value = false
  editingBook.value = null
  Object.assign(form, { isbn: '', title: '', author: '', publisher: '', categoryId: null, publishYear: null, coverImageUrl: '', description: '' })
}

async function saveBook() {
  saving.value = true
  try {
    if (editingBook.value) {
      await catalogApi.updateBook(editingBook.value.id, form)
    } else {
      await catalogApi.createBook(form)
    }
    closeForm()
    await loadBooks()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
  finally { saving.value = false }
}

function confirmDelete(book) { deletingBook.value = book; showDelete.value = true }

async function deleteBook() {
  try {
    await catalogApi.deleteBook(deletingBook.value.id)
    showDelete.value = false
    await loadBooks()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
}

onMounted(() => { loadBooks(); loadCategories() })
</script>
