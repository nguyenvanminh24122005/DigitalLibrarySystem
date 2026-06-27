<template>
  <PageHeader title="Nhật ký hệ thống" subtitle="Theo dõi các hoạt động quan trọng từ Identity & Report Service" breadcrumb="Nhật ký hệ thống">
    <button class="ghost-btn" @click="loadLogs"><v-icon icon="mdi-refresh" /> Làm mới</button>
  </PageHeader>

  <div class="card" style="margin-bottom:18px">
    <div class="filter-bar logs-filter">
      <input v-model.trim="filters.q" class="input" placeholder="Tìm theo hành động, đối tượng, mô tả..." @keyup.enter="loadLogs" />
      <input v-model.trim="filters.actor" class="input" placeholder="Người thực hiện" @keyup.enter="loadLogs" />
      <input v-model.trim="filters.action" class="input" placeholder="Hành động" @keyup.enter="loadLogs" />
      <input v-model.trim="filters.module" class="input" placeholder="Module" @keyup.enter="loadLogs" />
      <select v-model="filters.result" class="select">
        <option value="">Tất cả kết quả</option>
        <option value="1">Thành công</option>
        <option value="2">Thất bại</option>
      </select>
      <button class="primary-btn" @click="loadLogs">Lọc</button>
      <button class="ghost-btn" @click="resetFilters">Đặt lại</button>
    </div>
  </div>

  <p v-if="error" class="alert error-alert"><v-icon icon="mdi-alert-circle-outline" /> {{ error }}</p>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Module</th><th>Đối tượng</th><th>Mô tả</th><th>IP</th><th>Kết quả</th></tr>
        </thead>
        <tbody>
          <tr v-for="(log, i) in logs" :key="log.id">
            <td>{{ i + 1 }}</td>
            <td>{{ formatDate(log.createdAt, true) }}</td>
            <td><b>{{ log.actorName || '-' }}</b></td>
            <td>{{ log.action || '-' }}</td>
            <td><span class="badge blue">{{ log.module || '-' }}</span></td>
            <td>{{ log.targetType || '-' }}</td>
            <td>{{ log.description || '-' }}</td>
            <td>{{ log.ipAddress || '-' }}</td>
            <td><span class="badge" :class="Number(log.result) === 2 ? 'red' : 'green'">{{ Number(log.result) === 2 ? 'Thất bại' : 'Thành công' }}</span></td>
          </tr>
          <tr v-if="!logs.length"><td colspan="9" class="empty-cell">Không có nhật ký hệ thống.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { identityApi, unwrap, getErrorMessage } from '../services/api'
import { formatDate } from '../services/adapters'

const logs = ref([])
const error = ref('')
const filters = reactive({ q: '', actor: '', action: '', module: '', result: '' })

function queryParams() {
  const params = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') params[key] = value
  }
  return params
}

async function loadLogs() {
  try {
    error.value = ''
    const res = await identityApi.logs(queryParams())
    logs.value = unwrap(res) || []
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được nhật ký hệ thống từ API.')
    logs.value = []
  }
}

function resetFilters() {
  filters.q = ''
  filters.actor = ''
  filters.action = ''
  filters.module = ''
  filters.result = ''
  loadLogs()
}

onMounted(loadLogs)
</script>

<style scoped>
.logs-filter {
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto auto;
}
@media (max-width: 1180px) {
  .logs-filter {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
