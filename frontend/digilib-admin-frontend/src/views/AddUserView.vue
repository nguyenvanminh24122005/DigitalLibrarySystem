<template>
  <PageHeader title="Thêm người dùng" subtitle="Tạo tài khoản mới và gán vai trò trong hệ thống" breadcrumb="Người dùng › Thêm người dùng" />
  <div class="two-column">
    <div class="card">
      <form @submit.prevent="save">
        <div class="card-pad">
          <h3 class="section-title">Thông tin tài khoản</h3>
          <div class="form-grid">
            <div class="field"><label>Họ tên *</label><input v-model="form.fullName" class="input" placeholder="Nhập họ tên" required /></div>
            <div class="field"><label>Email *</label><input v-model="form.email" class="input" type="email" placeholder="Nhập email" required /></div>
            <div class="field" style="grid-column:1/-1"><label>Tên đăng nhập *</label><input v-model="form.username" class="input" placeholder="Nhập tên đăng nhập" required /></div>
            <div class="field"><label>Mật khẩu *</label><input v-model="form.password" class="input" type="password" placeholder="Nhập mật khẩu" required /></div>
            <div class="field"><label>Xác nhận mật khẩu *</label><input v-model="confirmPassword" class="input" type="password" placeholder="Nhập lại mật khẩu" required /></div>
            <div class="field" style="grid-column:1/-1"><label>Vai trò *</label><select v-model="form.roleId" class="select" required><option value="">Chọn vai trò</option><option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option></select></div>
            <div class="field" style="grid-column:1/-1"><label>Trạng thái</label><div class="btn-row"><label><input type="radio" v-model.number="form.status" :value="1" /> Hoạt động</label><label><input type="radio" v-model.number="form.status" :value="3" /> Ngừng hoạt động</label></div></div>
            <div class="field" style="grid-column:1/-1"><label>Ghi chú</label><textarea v-model="note" placeholder="Nhập ghi chú nếu có"></textarea></div>
          </div>
        </div>
        <div class="form-actions"><RouterLink to="/users" class="ghost-btn">Hủy bỏ</RouterLink><button class="primary-btn" :disabled="loading"><v-icon icon="mdi-content-save" /> {{ loading ? 'Đang lưu...' : 'Lưu người dùng' }}</button></div>
      </form>
    </div>
    <div class="card card-pad">
      <h3 class="section-title">Thông tin bổ sung</h3>
      <div class="grid">
        <div class="field"><label>Số điện thoại</label><input v-model="form.phone" class="input" placeholder="Nhập số điện thoại" /></div>
        <div class="field"><label>Địa chỉ</label><textarea placeholder="Nhập địa chỉ"></textarea></div>
        <div class="field"><label>Ngày sinh</label><input class="input" type="date" /></div>
        <div class="field"><label>Giới tính</label><div class="btn-row"><label><input type="radio" /> Nam</label><label><input type="radio" /> Nữ</label><label><input type="radio" /> Khác</label></div></div>
        <p v-if="message" :style="{ color: isError ? '#ef4444' : '#16a34a' }">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { identityApi } from '../services/api'
const router = useRouter()
const roles = ref([])
const loading = ref(false)
const message = ref('')
const isError = ref(false)
const confirmPassword = ref('')
const note = ref('')
const form = reactive({ fullName: '', username: '', email: '', phone: '', password: '', roleId: '', status: 1 })

onMounted(async () => {
  try { const { data } = await identityApi.roles(); roles.value = data } catch { roles.value = [] }
})

async function save() {
  if (form.password !== confirmPassword.value) { message.value = 'Mật khẩu xác nhận không khớp'; isError.value = true; return }
  loading.value = true
  try {
    await identityApi.createUser({ ...form })
    router.push('/users')
  } catch (e) {
    isError.value = true
    message.value = e?.response?.data || e.message || 'Lưu người dùng thất bại'
  } finally { loading.value = false }
}
</script>
