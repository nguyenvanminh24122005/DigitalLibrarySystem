<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-4">Quản lý Bản sao sách</h2>
        <p class="text-body-2 text-grey">Xem và quản lý bản sao của từng đầu sách</p>
      </div>
    </div>
    <v-card class="mb-6">
      <v-card-text>
        <v-select v-model="selectedBookId" :items="books" item-title="title" item-value="id" label="Chọn sách" @update:model-value="loadCopies" />
      </v-card-text>
    </v-card>
    <v-card v-if="selectedBookId">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Bản sao</span>
        <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="showAdd = true">Thêm bản sao</v-btn>
      </v-card-title>
      <v-table>
        <thead><tr><th>Mã bản sao</th><th>Trạng thái</th><th>Vị trí</th><th class="text-end">Thao tác</th></tr></thead>
        <tbody>
          <tr v-for="copy in copies" :key="copy.id">
            <td class="font-weight-medium" style="font-family: monospace;">{{ copy.copyCode }}</td>
            <td><v-chip :color="statusColor(copy.status)" size="small" variant="tonal">{{ copy.status }}</v-chip></td>
            <td class="text-grey">{{ copy.location || '—' }}</td>
            <td class="text-end">
              <v-btn icon variant="text" size="small" color="primary" @click="editCopy(copy)"><v-icon size="18">mdi-pencil</v-icon></v-btn>
              <v-btn icon variant="text" size="small" color="error" @click="deleteCopy(copy)"><v-icon size="18">mdi-delete</v-icon></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <v-dialog v-model="showAdd" max-width="420" persistent>
      <v-card class="pa-6">
        <v-card-title>{{ editingCopy ? 'Sửa bản sao' : 'Thêm bản sao' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="copyForm.copyCode" label="Mã bản sao" class="mb-3" />
          <v-select v-model="copyForm.status" :items="['Available','Borrowed','Lost','Damaged','Inactive']" label="Trạng thái" class="mb-3" />
          <v-text-field v-model="copyForm.location" label="Vị trí" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="showAdd = false">Hủy</v-btn><v-btn color="primary" @click="saveCopy">Lưu</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { catalogApi } from '../../services/catalogApi'

const books = ref([])
const copies = ref([])
const selectedBookId = ref(null)
const showAdd = ref(false)
const editingCopy = ref(null)
const copyForm = reactive({ copyCode: '', status: 'Available', location: '' })

const statusColor = (s) => ({ Available: 'success', Borrowed: 'warning', Lost: 'error', Damaged: 'error', Inactive: 'grey' }[s] || 'grey')

async function loadBooks() {
  try { const { data } = await catalogApi.getBooks(); books.value = Array.isArray(data) ? data : (data.data || []) } catch {}
}
async function loadCopies() {
  if (!selectedBookId.value) return
  try { const { data } = await catalogApi.getCopies(selectedBookId.value); copies.value = Array.isArray(data) ? data : (data.data || []) } catch { copies.value = [] }
}
function editCopy(c) { editingCopy.value = c; Object.assign(copyForm, c); showAdd.value = true }
async function saveCopy() {
  try {
    if (editingCopy.value) await catalogApi.updateCopy(editingCopy.value.id, copyForm)
    else await catalogApi.createCopy(selectedBookId.value, copyForm)
    showAdd.value = false; editingCopy.value = null; await loadCopies()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
}
async function deleteCopy(c) { if (confirm(`Xóa bản sao "${c.copyCode}"?`)) { await catalogApi.deleteCopy(c.id); await loadCopies() } }
onMounted(loadBooks)
</script>
