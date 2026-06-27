<template>
  <PageHeader title="Vai trò & Phân quyền" subtitle="Quản lý vai trò và quyền từ Identity & Report Service" breadcrumb="Vai trò & Phân quyền">
    <button class="ghost-btn" @click="loadData"><v-icon icon="mdi-refresh" /> Làm mới</button>
  </PageHeader>

  <p v-if="error" class="alert error-alert"><v-icon icon="mdi-alert-circle-outline" /> {{ error }}</p>

  <div class="grid grid-2">
    <div class="card">
      <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center">
        <h3 class="section-title" style="margin:0">Danh sách vai trò</h3>
        <span class="badge blue">{{ roles.length }} vai trò</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Vai trò</th><th>Mô tả</th><th>Người dùng</th><th>Loại</th><th></th></tr></thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id" :class="{ selected: selectedRole?.id === role.id }">
              <td><b>{{ role.name }}</b></td>
              <td>{{ role.description || '-' }}</td>
              <td>{{ role.userCount || 0 }}</td>
              <td><span class="badge" :class="role.isSystemRole ? 'purple' : 'gray'">{{ role.isSystemRole ? 'Hệ thống' : 'Tùy chỉnh' }}</span></td>
              <td><button class="action-btn" @click="selectRole(role)"><v-icon icon="mdi-shield-key-outline" /></button></td>
            </tr>
            <tr v-if="!roles.length"><td colspan="5" class="empty-cell">Không có vai trò.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card card-pad">
      <h3 class="section-title">Phân quyền {{ selectedRole ? `cho ${selectedRole.name}` : '' }}</h3>
      <div v-if="selectedRole">
        <div class="permission-groups">
          <div v-for="group in groupedPermissions" :key="group.module" class="permission-group">
            <h4>{{ group.module }}</h4>
            <label v-for="permission in group.items" :key="permission.id" class="permission-item">
              <input v-model="selectedPermissionIds" type="checkbox" :value="permission.id" />
              <span>
                <b>{{ permission.name }}</b>
                <small>{{ permission.code }}</small>
              </span>
            </label>
          </div>
        </div>
        <div class="btn-row" style="justify-content:flex-end;margin-top:20px">
          <button class="ghost-btn" @click="selectRole(selectedRole)">Hoàn tác</button>
          <button class="primary-btn" @click="savePermissions" :disabled="saving"><v-icon icon="mdi-content-save-outline" /> {{ saving ? 'Đang lưu...' : 'Lưu phân quyền' }}</button>
        </div>
      </div>
      <div v-else class="empty-state">Chọn một vai trò để xem và chỉnh quyền.</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { identityApi, unwrap, getErrorMessage } from '../services/api'

const roles = ref([])
const permissions = ref([])
const selectedRole = ref(null)
const selectedPermissionIds = ref([])
const error = ref('')
const saving = ref(false)

const groupedPermissions = computed(() => {
  const map = new Map()
  for (const p of permissions.value) {
    const module = p.module || 'Khác'
    if (!map.has(module)) map.set(module, [])
    map.get(module).push(p)
  }
  return [...map.entries()].map(([module, items]) => ({ module, items }))
})

function selectRole(role) {
  selectedRole.value = role
  const codes = role.permissionCodes || []
  selectedPermissionIds.value = permissions.value.filter((p) => codes.includes(p.code)).map((p) => p.id)
}

async function loadData() {
  try {
    error.value = ''
    const [rolesRes, permissionsRes] = await Promise.all([identityApi.roles(), identityApi.permissions()])
    roles.value = unwrap(rolesRes) || []
    permissions.value = unwrap(permissionsRes) || []
    if (roles.value.length) selectRole(selectedRole.value ? roles.value.find((x) => x.id === selectedRole.value.id) || roles.value[0] : roles.value[0])
  } catch (e) {
    error.value = getErrorMessage(e, 'Không tải được vai trò/phân quyền từ API.')
    roles.value = []
    permissions.value = []
  }
}

async function savePermissions() {
  if (!selectedRole.value) return
  try {
    saving.value = true
    error.value = ''
    await identityApi.updateRolePermissions(selectedRole.value.id, { permissionIds: selectedPermissionIds.value })
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Không lưu được phân quyền.')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.selected td {
  background: #eff6ff !important;
}
.permission-groups {
  display: grid;
  gap: 18px;
  max-height: 610px;
  overflow: auto;
  padding-right: 4px;
}
.permission-group {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
}
.permission-group h4 {
  margin: 0 0 10px;
  color: #2563eb;
}
.permission-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 9px 0;
  border-top: 1px solid #f1f5f9;
}
.permission-item input {
  margin-top: 3px;
  width: 17px;
  height: 17px;
  accent-color: #2563eb;
}
.permission-item small {
  display: block;
  color: #64748b;
  margin-top: 2px;
}
</style>
