<template>
  <PageHeader title="Người dùng" subtitle="Quản lý tài khoản đăng nhập và trạng thái người dùng" breadcrumb="Người dùng">
    <RouterLink to="/users/new" class="primary-btn"><v-icon icon="mdi-plus" /> Thêm người dùng</RouterLink>
  </PageHeader>

  <div v-if="error" class="card card-pad" style="margin-bottom:16px;color:#ef4444">{{ error }}</div>
  <div v-if="success" class="card card-pad" style="margin-bottom:16px;color:#16a34a">{{ success }}</div>

  <div class="grid grid-4" style="margin-bottom:18px">
    <StatCard label="Tổng người dùng" :value="users.length" icon="mdi-account-group-outline" />
    <StatCard label="Hoạt động" :value="activeCount" icon="mdi-check-circle-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Tạm khóa" :value="lockedCount" icon="mdi-lock-outline" color="#f97316" bg="#fff7ed" />
    <StatCard label="Không hoạt động" :value="inactiveCount" icon="mdi-account-off-outline" color="#64748b" bg="#f1f5f9" />
  </div>

  <div class="card">
    <div class="filter-bar" style="grid-template-columns:2fr 1fr 1fr auto auto">
      <input class="input" placeholder="Tìm theo tên, email, số điện thoại..." v-model="filters.q" @keyup.enter="loadUsers" />
      <select class="select" v-model="filters.roleId"><option value="">Tất cả vai trò</option><option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option></select>
      <select class="select" v-model="filters.status"><option value="">Tất cả trạng thái</option><option :value="AccountStatus.Active">Hoạt động</option><option :value="AccountStatus.Locked">Tạm khóa</option><option :value="AccountStatus.Inactive">Không hoạt động</option></select>
      <button class="primary-btn" @click="loadUsers"><v-icon icon="mdi-filter-outline" /> Lọc</button>
      <button class="ghost-btn" @click="resetFilters"><v-icon icon="mdi-refresh" /> Đặt lại</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Họ và tên</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
        <tbody>
          <tr v-for="(u,i) in users" :key="u.id">
            <td>{{ i+1 }}</td><td><b>{{ u.name }}</b><br><span style="color:#64748b">{{ u.username }}</span></td><td>{{ u.email }}</td><td>{{ u.phone }}</td><td><span class="badge blue">{{ u.role }}</span></td><td><StatusBadge :text="u.status" /></td><td>{{ u.createdAt }}</td>
            <td>
              <button class="action-btn" @click="openEdit(u)"><v-icon icon="mdi-pencil-outline" /></button>
              <button v-if="u.statusValue === AccountStatus.Active" class="action-btn danger" title="Khóa" @click="lock(u)"><v-icon icon="mdi-lock-outline" /></button>
              <button v-else class="action-btn" title="Mở khóa" @click="unlock(u)"><v-icon icon="mdi-lock-open-outline" /></button>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0"><td colspan="8" class="empty-state">Không có người dùng phù hợp.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="showForm" class="modal-backdrop">
    <div class="modal-card">
      <h3 class="section-title">Cập nhật người dùng</h3>
      <div class="form-grid">
        <div class="field"><label>Họ tên *</label><input class="input" v-model="form.fullName" /></div>
        <div class="field"><label>Email *</label><input class="input" v-model="form.email" type="email" /></div>
        <div class="field"><label>Số điện thoại</label><input class="input" v-model="form.phone" /></div>
        <div class="field"><label>Vai trò *</label><select class="select" v-model="form.roleId"><option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option></select></div>
        <div class="field"><label>Trạng thái</label><select class="select" v-model.number="form.status"><option :value="AccountStatus.Active">Hoạt động</option><option :value="AccountStatus.Locked">Tạm khóa</option><option :value="AccountStatus.Inactive">Không hoạt động</option></select></div>
      </div>
      <div class="form-actions"><button class="ghost-btn" @click="showForm=false">Hủy</button><button class="primary-btn" :disabled="saving" @click="saveUser">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button></div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'; import StatCard from '../components/StatCard.vue'; import StatusBadge from '../components/StatusBadge.vue'
import { identityApi, getErrorMessage } from '../services/api'; import { AccountStatus, mapUser } from '../services/adapters'
const users=ref([]), roles=ref([]), loading=ref(false), saving=ref(false), error=ref(''), success=ref(''), showForm=ref(false), editingId=ref(null)
const filters=reactive({q:'',roleId:'',status:''}); const form=reactive({fullName:'',email:'',phone:'',roleId:'',status:AccountStatus.Active})
const activeCount=computed(()=>users.value.filter(x=>x.statusValue===AccountStatus.Active).length), lockedCount=computed(()=>users.value.filter(x=>x.statusValue===AccountStatus.Locked).length), inactiveCount=computed(()=>users.value.filter(x=>x.statusValue===AccountStatus.Inactive).length)
onMounted(async()=>{await Promise.all([loadRoles(), loadUsers()])})
async function loadRoles(){try{const{data}=await identityApi.roles();roles.value=data}catch{roles.value=[]}}
async function loadUsers(){loading.value=true;error.value='';try{const params={q:filters.q||undefined,roleId:filters.roleId||undefined,status:filters.status||undefined};const{data}=await identityApi.users(params);users.value=data.map(mapUser)}catch(e){error.value=getErrorMessage(e,'Không tải được người dùng.')}finally{loading.value=false}}
function resetFilters(){filters.q='';filters.roleId='';filters.status='';loadUsers()}
function openEdit(u){editingId.value=u.id; const role=roles.value.find(r=>r.name===u.role); Object.assign(form,{fullName:u.name,email:u.email,phone:u.phone,roleId:role?.id||'',status:u.statusValue}); showForm.value=true}
async function saveUser(){saving.value=true;error.value='';success.value='';try{await identityApi.updateUser(editingId.value,{...form, status:Number(form.status)});success.value='Cập nhật người dùng thành công.';showForm.value=false;await loadUsers()}catch(e){error.value=getErrorMessage(e,'Lưu người dùng thất bại.')}finally{saving.value=false}}
async function lock(u){if(!confirm(`Khóa tài khoản ${u.name}?`))return;try{await identityApi.lockUser(u.id);success.value='Đã khóa tài khoản.';await loadUsers()}catch(e){error.value=getErrorMessage(e,'Khóa tài khoản thất bại.')}}
async function unlock(u){try{await identityApi.unlockUser(u.id);success.value='Đã mở khóa tài khoản.';await loadUsers()}catch(e){error.value=getErrorMessage(e,'Mở khóa tài khoản thất bại.')}}
</script>
