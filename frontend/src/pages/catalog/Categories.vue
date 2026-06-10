<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-4">Quản lý Thể loại</h2>
        <p class="text-body-2 text-grey">Thêm, sửa, xóa thể loại sách</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">Thêm thể loại</v-btn>
    </div>
    <v-card>
      <v-table>
        <thead><tr><th>ID</th><th>Tên thể loại</th><th>Mô tả</th><th class="text-end">Thao tác</th></tr></thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td class="font-weight-medium">{{ cat.name }}</td>
            <td class="text-grey">{{ cat.description || '—' }}</td>
            <td class="text-end">
              <v-btn icon variant="text" size="small" color="primary" @click="editCat(cat)"><v-icon size="18">mdi-pencil</v-icon></v-btn>
              <v-btn icon variant="text" size="small" color="error" @click="deleteCat(cat)"><v-icon size="18">mdi-delete</v-icon></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <v-dialog v-model="showDialog" max-width="480" persistent>
      <v-card class="pa-6">
        <v-card-title>{{ editing ? 'Sửa thể loại' : 'Thêm thể loại' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Tên thể loại" class="mb-3" />
          <v-textarea v-model="form.description" label="Mô tả" rows="3" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="showDialog = false">Hủy</v-btn><v-btn color="primary" @click="save">Lưu</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { catalogApi } from '../../services/catalogApi'

const categories = ref([])
const showDialog = ref(false)
const editing = ref(null)
const form = reactive({ name: '', description: '' })

async function load() {
  try { const { data } = await catalogApi.getCategories(); categories.value = Array.isArray(data) ? data : (data.data || []) } catch {}
}
function openAdd() { editing.value = null; form.name = ''; form.description = ''; showDialog.value = true }
function editCat(c) { editing.value = c; form.name = c.name; form.description = c.description; showDialog.value = true }
async function save() {
  try {
    if (editing.value) await catalogApi.updateCategory(editing.value.id, form)
    else await catalogApi.createCategory(form)
    showDialog.value = false; await load()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
}
async function deleteCat(c) { if (confirm(`Xóa "${c.name}"?`)) { await catalogApi.deleteCategory(c.id); await load() } }
onMounted(load)
</script>
