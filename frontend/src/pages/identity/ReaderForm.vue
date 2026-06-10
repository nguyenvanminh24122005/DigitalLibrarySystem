<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="$router.back()">Quay lại</v-btn>
    <v-card max-width="600" class="mx-auto pa-8">
      <h2 class="text-h5 font-weight-bold mb-6">{{ isEdit ? 'Sửa độc giả' : 'Thêm độc giả' }}</h2>
      <v-form @submit.prevent="save">
        <v-text-field v-model="form.fullName" label="Họ tên" class="mb-3" />
        <v-text-field v-model="form.email" label="Email" type="email" class="mb-3" />
        <v-text-field v-model="form.phone" label="Điện thoại" class="mb-3" />
        <v-text-field v-model="form.address" label="Địa chỉ" class="mb-3" />
        <div class="d-flex justify-end ga-3 mt-4">
          <v-btn variant="outlined" @click="$router.back()">Hủy</v-btn>
          <v-btn color="primary" type="submit" :loading="saving">Lưu</v-btn>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reportApi } from '../../services/reportApi'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const form = reactive({ fullName: '', email: '', phone: '', address: '' })

onMounted(async () => {
  if (isEdit.value) { try { const { data } = await reportApi.getReader(route.params.id); Object.assign(form, data) } catch {} }
})
async function save() {
  saving.value = true
  try {
    if (isEdit.value) await reportApi.updateReader(route.params.id, form)
    else await reportApi.createReader(form)
    router.push({ name: 'Readers' })
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
  finally { saving.value = false }
}
</script>
