<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-4">Quản lý Độc giả</h2>
        <p class="text-body-2 text-grey">Thêm, sửa, xóa hồ sơ độc giả</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">Thêm độc giả</v-btn>
    </div>
    <v-card>
      <v-card-text class="pa-6">
        <v-text-field v-model="search" placeholder="Tìm kiếm độc giả..." prepend-inner-icon="mdi-magnify" hide-details class="mb-4" />
        <v-table>
          <thead><tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Điện thoại</th><th>Trạng thái</th><th class="text-end">Thao tác</th></tr></thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.id }}</td>
              <td class="font-weight-medium">{{ r.fullName }}</td>
              <td>{{ r.email }}</td>
              <td>{{ r.phone || '—' }}</td>
              <td><v-chip :color="r.isActive !== false ? 'success' : 'grey'" size="small" variant="tonal">{{ r.isActive !== false ? 'Hoạt động' : 'Ngừng' }}</v-chip></td>
              <td class="text-end">
                <v-btn icon variant="text" size="small" color="primary" @click="editReader(r)"><v-icon size="18">mdi-pencil</v-icon></v-btn>
                <v-btn icon variant="text" size="small" color="error" @click="deleteReader(r)"><v-icon size="18">mdi-delete</v-icon></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showDialog" max-width="520" persistent>
      <v-card class="pa-6">
        <v-card-title>{{ editing ? 'Sửa độc giả' : 'Thêm độc giả' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.fullName" label="Họ tên" class="mb-3" />
          <v-text-field v-model="form.email" label="Email" class="mb-3" />
          <v-text-field v-model="form.phone" label="Điện thoại" class="mb-3" />
          <v-text-field v-model="form.address" label="Địa chỉ" class="mb-3" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="showDialog = false">Hủy</v-btn><v-btn color="primary" @click="save">Lưu</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { reportApi } from '../../services/reportApi'

const readers = ref([])
const search = ref('')
const showDialog = ref(false)
const editing = ref(null)
const form = reactive({ fullName: '', email: '', phone: '', address: '' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q ? readers.value.filter(r => r.fullName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)) : readers.value
})

async function load() {
  try { const { data } = await reportApi.getReaders(); readers.value = Array.isArray(data) ? data : (data.data || []) } catch {}
}
function openAdd() { editing.value = null; Object.assign(form, { fullName: '', email: '', phone: '', address: '' }); showDialog.value = true }
function editReader(r) { editing.value = r; Object.assign(form, r); showDialog.value = true }
async function save() {
  try {
    if (editing.value) await reportApi.updateReader(editing.value.id, form)
    else await reportApi.createReader(form)
    showDialog.value = false; await load()
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
}
async function deleteReader(r) { if (confirm(`Xóa "${r.fullName}"?`)) { await reportApi.deleteReader(r.id); await load() } }
onMounted(load)
</script>
