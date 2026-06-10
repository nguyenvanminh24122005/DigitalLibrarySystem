<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="$router.back()">Quay lại</v-btn>
    <v-card max-width="720" class="mx-auto pa-8">
      <h2 class="text-h5 font-weight-bold mb-6">{{ isEdit ? 'Sửa sách' : 'Thêm sách mới' }}</h2>
      <v-form @submit.prevent="save">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.isbn" label="ISBN" class="mb-2" />
            <v-text-field v-model="form.title" label="Tên sách" class="mb-2" />
            <v-text-field v-model="form.author" label="Tác giả" class="mb-2" />
            <v-text-field v-model="form.publisher" label="Nhà xuất bản" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model.number="form.publishYear" label="Năm xuất bản" type="number" class="mb-2" />
            <v-text-field v-model="form.coverImageUrl" label="Ảnh bìa URL" class="mb-2" />
            <v-textarea v-model="form.description" label="Mô tả" rows="4" />
          </v-col>
        </v-row>
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
import { catalogApi } from '../../services/catalogApi'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const form = reactive({ isbn: '', title: '', author: '', publisher: '', publishYear: null, coverImageUrl: '', description: '' })

onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await catalogApi.getBook(route.params.id)
      Object.assign(form, data)
    } catch {}
  }
})

async function save() {
  saving.value = true
  try {
    if (isEdit.value) await catalogApi.updateBook(route.params.id, form)
    else await catalogApi.createBook(form)
    router.push({ name: 'Books' })
  } catch (e) { alert(e.response?.data?.message || 'Lỗi') }
  finally { saving.value = false }
}
</script>
