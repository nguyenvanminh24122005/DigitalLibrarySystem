<template>
  <PageHeader title="Sách" subtitle="Quản lý thông tin sách trong thư viện" breadcrumb="Sách">
    <div class="btn-row">
      <button class="ghost-btn" @click="exportCsv"><v-icon icon="mdi-download" /> Xuất CSV</button>
      <RouterLink to="/books/new" class="primary-btn"><v-icon icon="mdi-plus" /> Thêm sách mới</RouterLink>
    </div>
  </PageHeader>

  <div v-if="error" class="card card-pad" style="margin-bottom:16px;color:#ef4444">{{ error }}</div>
  <div v-if="success" class="card card-pad" style="margin-bottom:16px;color:#16a34a">{{ success }}</div>

  <div class="grid grid-4" style="margin-bottom:18px">
    <StatCard label="Tổng số sách" :value="books.length" icon="mdi-book-open-page-variant" />
    <StatCard label="Tổng bản sao" :value="stats.totalCopies" icon="mdi-package-variant" color="#16a34a" bg="#ecfdf5" />
    <StatCard label="Đang được mượn" :value="stats.borrowedCopies" icon="mdi-book-sync-outline" color="#f59e0b" bg="#fffbeb" />
    <StatCard label="Đã ngưng" :value="stats.inactiveBooks" icon="mdi-pause-circle-outline" color="#64748b" bg="#f1f5f9" />
  </div>

  <div class="card filter-bar" style="margin-bottom:18px">
    <div class="field"><input class="input" placeholder="Tìm kiếm sách" v-model="filters.q" @keyup.enter="loadBooks" /></div>
    <div class="field"><label>Thể loại</label><select class="select" v-model="filters.categoryId"><option value="">Tất cả</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
    <div class="field"><label>Tác giả</label><select class="select" v-model="filters.authorId"><option value="">Tất cả</option><option v-for="a in authors" :key="a.id" :value="a.id">{{ a.name }}</option></select></div>
    <div class="field"><label>Nhà xuất bản</label><select class="select" v-model="filters.publisherId"><option value="">Tất cả</option><option v-for="p in publishers" :key="p.id" :value="p.id">{{ p.name }}</option></select></div>
    <div class="field"><label>Trạng thái</label><select class="select" v-model="filters.status"><option value="">Tất cả</option><option :value="CatalogStatus.Active">Hoạt động</option><option :value="CatalogStatus.Inactive">Ngưng sử dụng</option></select></div>
    <button class="ghost-btn" @click="loadBooks"><v-icon icon="mdi-filter-outline" /> Lọc</button>
    <button class="ghost-btn" @click="resetFilters"><v-icon icon="mdi-refresh" /> Đặt lại</button>
  </div>

  <div class="card">
    <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center">
      <h3 class="section-title" style="margin:0">Danh sách sách ({{ books.length }} sách)</h3>
      <span style="color:#64748b">{{ loading ? 'Đang tải...' : 'Dữ liệu từ Catalog API' }}</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Ảnh bìa</th><th>Tên sách</th><th>Tác giả</th><th>Thể loại</th><th>NXB</th><th>Năm XB</th><th>Số bản sao</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          <tr v-for="(book, index) in books" :key="book.id">
            <td>{{ index + 1 }}</td><td><img :src="book.cover" class="book-cover" /></td>
            <td><RouterLink :to="`/books/${book.id}`"><b>{{ book.title }}</b></RouterLink><br><span style="color:#64748b">{{ book.subtitle }}</span></td>
            <td>{{ book.author }}</td><td><span class="badge purple">{{ book.category }}</span></td><td>{{ book.publisher }}</td><td>{{ book.year }}</td><td>{{ book.copies }}</td>
            <td><StatusBadge :text="book.status" /></td>
            <td><RouterLink :to="`/books/${book.id}`" class="action-btn"><v-icon icon="mdi-eye-outline" /></RouterLink><button class="action-btn danger" @click="removeBook(book)"><v-icon icon="mdi-trash-can-outline" /></button></td>
          </tr>
          <tr v-if="!loading && books.length === 0"><td colspan="10" class="empty-state">Không có sách phù hợp.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'; import StatCard from '../components/StatCard.vue'; import StatusBadge from '../components/StatusBadge.vue'
import { catalogApi, getErrorMessage } from '../services/api'; import { CatalogStatus, mapBook } from '../services/adapters'
const books=ref([]), categories=ref([]), authors=ref([]), publishers=ref([]), loading=ref(false), error=ref(''), success=ref('')
const filters=reactive({q:'',categoryId:'',authorId:'',publisherId:'',status:''})
const stats=computed(()=>({ totalCopies: books.value.reduce((s,b)=>s+(b.copies||0),0), borrowedCopies: books.value.reduce((s,b)=>s+(b.borrowedCopies||0),0), inactiveBooks: books.value.filter(b=>b.status!=='Hoạt động').length }))
onMounted(async()=>{ await Promise.all([loadLookups(), loadBooks()]) })
async function loadLookups(){ try{ const [c,a,p]=await Promise.all([catalogApi.categories(),catalogApi.authors(),catalogApi.publishers()]); categories.value=c.data; authors.value=a.data; publishers.value=p.data }catch{} }
async function loadBooks(){ loading.value=true; error.value=''; try{ const params={q:filters.q||undefined,categoryId:filters.categoryId||undefined,authorId:filters.authorId||undefined,publisherId:filters.publisherId||undefined,status:filters.status||undefined}; const{data}=await catalogApi.books(params); books.value=data.map(mapBook) }catch(e){ error.value=getErrorMessage(e,'Không tải được danh sách sách.') }finally{ loading.value=false } }
function resetFilters(){ Object.assign(filters,{q:'',categoryId:'',authorId:'',publisherId:'',status:''}); loadBooks() }
async function removeBook(book){ if(!confirm(`Xóa hoặc ngưng hoạt động sách ${book.title}?`)) return; try{ await catalogApi.deleteBook(book.id); success.value='Đã xóa/ngưng hoạt động sách.'; await loadBooks() }catch(e){ error.value=getErrorMessage(e,'Không thể xóa sách này.') } }
function exportCsv(){ const rows=[['Tên sách','ISBN','Tác giả','Thể loại','NXB','Năm','Số bản sao','Trạng thái'],...books.value.map(b=>[b.title,b.isbn,b.author,b.category,b.publisher,b.year,b.copies,b.status])]; const csv=rows.map(r=>r.map(v=>`"${String(v||'').replaceAll('"','""')}"`).join(',')).join('\n'); const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); const a=document.createElement('a'); a.href=url; a.download='books.csv'; a.click(); URL.revokeObjectURL(url) }
</script>
