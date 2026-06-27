<template>
  <PageHeader title="Thể loại" subtitle="Quản lý danh mục thể loại sách trong thư viện" breadcrumb="Thể loại">
    <div class="btn-row"><button class="primary-btn" @click="openCreate"><v-icon icon="mdi-plus" /> Thêm thể loại</button><button class="ghost-btn" @click="exportCsv"><v-icon icon="mdi-download" /> Xuất CSV</button></div>
  </PageHeader>
  <div v-if="error" class="card card-pad" style="margin-bottom:16px;color:#ef4444">{{ error }}</div>
  <div v-if="success" class="card card-pad" style="margin-bottom:16px;color:#16a34a">{{ success }}</div>
  <div class="grid grid-4" style="margin-bottom:18px">
    <StatCard label="Tổng thể loại" :value="categories.length" icon="mdi-shape-outline" />
    <StatCard label="Đang hoạt động" :value="activeCount" icon="mdi-check-circle-outline" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Ngưng sử dụng" :value="inactiveCount" icon="mdi-pause-circle-outline" color="#f97316" bg="#fff7ed" />
    <StatCard label="Dữ liệu" value="API" icon="mdi-cloud-check-outline" color="#7c3aed" bg="#f5f3ff" />
  </div>
  <div class="two-column">
    <div class="card">
      <div class="filter-bar" style="grid-template-columns:2fr 1fr auto auto">
        <input class="input" placeholder="Tìm theo tên thể loại..." v-model="q" />
        <select class="select" v-model="status"><option value="">Tất cả trạng thái</option><option value="Hoạt động">Hoạt động</option><option value="Ngưng sử dụng">Ngưng sử dụng</option></select>
        <button class="primary-btn" @click="loadData">Tải lại</button><button class="ghost-btn" @click="reset">Đặt lại</button>
      </div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Tên thể loại</th><th>Mô tả</th><th>Trạng thái</th><th>Cập nhật</th><th>Thao tác</th></tr></thead><tbody><tr v-for="(item,i) in filtered" :key="item.id"><td>{{ i+1 }}</td><td><b>{{ item.name }}</b></td><td>{{ item.description }}</td><td><StatusBadge :text="item.status" /></td><td>{{ item.updatedAt }}</td><td><button class="action-btn" @click="openEdit(item)"><v-icon icon="mdi-pencil-outline" /></button><button class="action-btn danger" @click="removeItem(item)"><v-icon icon="mdi-trash-can-outline" /></button></td></tr><tr v-if="!loading && filtered.length === 0"><td colspan="6" class="empty-state">Không có thể loại phù hợp.</td></tr></tbody></table></div>
    </div>
    <SideStats title="Quản lý thể loại" :total="String(categories.length)" :items="['Thêm/sửa thể loại qua Catalog API', 'Xóa sẽ chuyển sang ngưng sử dụng', 'Dùng để phân loại đầu sách']" />
  </div>
  <div v-if="showForm" class="modal-backdrop"><div class="modal-card"><h3 class="section-title">{{ editingId ? 'Cập nhật thể loại' : 'Thêm thể loại' }}</h3><div class="grid"><div class="field"><label>Tên thể loại *</label><input class="input" v-model="form.name" /></div><div class="field"><label>Mô tả</label><textarea v-model="form.description" /></div></div><div class="form-actions"><button class="ghost-btn" @click="showForm=false">Hủy</button><button class="primary-btn" :disabled="saving" @click="saveItem">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button></div></div></div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'; import StatCard from '../components/StatCard.vue'; import StatusBadge from '../components/StatusBadge.vue'; import SideStats from '../components/SideStats.vue'
import { catalogApi, getErrorMessage } from '../services/api'; import { mapLookup } from '../services/adapters'
const categories = ref([]), q = ref(''), status = ref(''), loading = ref(false), saving = ref(false), error = ref(''), success = ref(''), showForm = ref(false), editingId = ref(null)
const form = reactive({ name: '', description: '' })
const filtered = computed(() => categories.value.filter(x => (!q.value || x.name.toLowerCase().includes(q.value.toLowerCase())) && (!status.value || x.status === status.value)))
const activeCount = computed(() => categories.value.filter(x => x.status === 'Hoạt động').length)
const inactiveCount = computed(() => categories.value.filter(x => x.status !== 'Hoạt động').length)
onMounted(loadData)
async function loadData(){ loading.value=true; error.value=''; try{ const {data}=await catalogApi.categories(); categories.value=data.map(x=>mapLookup(x,'category')) }catch(e){ error.value=getErrorMessage(e,'Không tải được thể loại.') } finally{ loading.value=false } }
function reset(){ q.value=''; status.value='' }
function openCreate(){ editingId.value=null; form.name=''; form.description=''; showForm.value=true }
function openEdit(item){ editingId.value=item.id; form.name=item.name; form.description=item.description; showForm.value=true }
async function saveItem(){ saving.value=true; error.value=''; success.value=''; try{ if(editingId.value){ await catalogApi.updateCategory(editingId.value,{ name:form.name, description:form.description }); success.value='Cập nhật thể loại thành công.' } else { await catalogApi.createCategory({ name:form.name, description:form.description }); success.value='Thêm thể loại thành công.' } showForm.value=false; await loadData() }catch(e){ error.value=getErrorMessage(e,'Lưu thể loại thất bại.') }finally{ saving.value=false } }
async function removeItem(item){ if(!confirm(`Ngưng sử dụng thể loại ${item.name}?`)) return; try{ await catalogApi.deleteCategory(item.id); success.value='Đã ngưng sử dụng thể loại.'; await loadData() }catch(e){ error.value=getErrorMessage(e,'Không thể ngưng sử dụng thể loại.') } }
function exportCsv(){ const rows=[['Tên','Mô tả','Trạng thái'],...filtered.value.map(x=>[x.name,x.description,x.status])]; const csv=rows.map(r=>r.map(v=>`"${String(v||'').replaceAll('"','""')}"`).join(',')).join('\n'); const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); const a=document.createElement('a'); a.href=url; a.download='categories.csv'; a.click(); URL.revokeObjectURL(url) }
</script>
