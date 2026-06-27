<template>
  <div>
    <div class="page-head"><div><h1>Mượn sách</h1><p>Tạo phiếu mượn, kiểm tra thẻ thư viện và cập nhật tồn kho qua API</p></div></div>
    <div v-if="error" class="alert error">{{ error }}</div><div v-if="success" class="alert success">{{ success }}</div>
    <div class="grid grid-4">
      <div class="card stat"><div class="stat-icon blue"><i class="mdi mdi-book-open"></i></div><div><div class="stat-label">Đang mượn</div><div class="stat-value">{{ borrowing }}</div></div></div>
      <div class="card stat"><div class="stat-icon green"><i class="mdi mdi-account-check"></i></div><div><div class="stat-label">Bạn đọc hợp lệ</div><div class="stat-value">{{ reader?.canBorrow ? 1 : 0 }}</div></div></div>
      <div class="card stat"><div class="stat-icon orange"><i class="mdi mdi-book-clock"></i></div><div><div class="stat-label">Sách chọn</div><div class="stat-value">{{ selectedCopies.length }}</div></div></div>
      <div class="card stat"><div class="stat-icon purple"><i class="mdi mdi-file-document-plus"></i></div><div><div class="stat-label">Phiếu hôm nay</div><div class="stat-value">{{ todayTickets }}</div></div></div>
    </div>

    <div class="split" style="margin-top:16px">
      <section class="card pad">
        <h2 class="section-title">1. Thông tin bạn đọc</h2>
        <div class="toolbar">
          <div class="field"><label>Quét / nhập mã thẻ, mã độc giả, email, SĐT</label><input class="input" v-model="readerKeyword" @keyup.enter="findReader" placeholder="Ví dụ: DG20260001 hoặc CARD-DG20260001" /></div>
          <button class="btn primary" @click="findReader"><i class="mdi mdi-magnify"></i>Tìm kiếm</button>
        </div>
        <div v-if="reader" class="card pad" style="margin-top:16px;background:#fbfdff">
          <div class="info-list">
            <div class="info-row"><span>Họ tên</span><b>{{ reader.readerName || reader.fullName }}</b></div>
            <div class="info-row"><span>Mã độc giả</span><b>{{ reader.readerCode }}</b></div>
            <div class="info-row"><span>Thẻ thư viện</span><b>{{ reader.cardNumber || '-' }}</b></div>
            <div class="info-row"><span>Giới hạn mượn</span><b>{{ reader.borrowLimit || 0 }} sách</b></div>
            <div class="info-row"><span>Trạng thái</span><b><span class="badge" :class="reader.canBorrow ? 'green':'red'">{{ reader.message }}</span></b></div>
          </div>
        </div>
        <div v-else class="empty">Chưa chọn bạn đọc.</div>
      </section>

      <section class="card pad">
        <h2 class="section-title">2. Chọn sách mượn</h2>
        <div class="toolbar">
          <div class="field"><label>Nhập mã bản sao / ISBN / tên sách</label><input class="input" v-model="copyKeyword" @keyup.enter="findCopy" placeholder="Quét mã bản sao hoặc tìm sách" /></div>
          <button class="btn primary" @click="findCopy"><i class="mdi mdi-plus"></i>Thêm</button>
        </div>
        <div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>#</th><th>Sách</th><th>Mã bản sao</th><th>Tình trạng</th><th>Thao tác</th></tr></thead><tbody><tr v-for="(c,i) in selectedCopies" :key="c.id"><td>{{ i+1 }}</td><td>{{ c.bookTitle }}</td><td>{{ c.copyCode }}</td><td><span class="badge green">Sẵn sàng</span></td><td><button class="mini danger" @click="selectedCopies.splice(i,1)"><i class="mdi mdi-delete-outline"></i>Xóa</button></td></tr><tr v-if="!selectedCopies.length"><td colspan="5" class="empty">Chưa chọn bản sao sách.</td></tr></tbody></table></div>
        <div class="toolbar" style="margin-top:14px">
          <div class="field"><label>Ngày mượn</label><input class="input" type="date" v-model="borrowDate" /></div>
          <div class="field"><label>Hạn trả</label><input class="input" type="date" v-model="dueDate" /></div>
          <button class="btn primary" :disabled="!canSubmit || loading" @click="submitBorrow"><i class="mdi mdi-check-circle-outline"></i>Xác nhận mượn</button>
        </div>
      </section>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <section class="card pad"><h2 class="section-title">Lịch sử mượn gần đây</h2><div class="table-wrap"><table><thead><tr><th>Mã phiếu</th><th>Bạn đọc</th><th>Ngày mượn</th><th>Hạn trả</th><th>Trạng thái</th></tr></thead><tbody><tr v-for="t in recent" :key="t.id"><td>{{ t.ticketCode }}</td><td>{{ t.readerName }}</td><td>{{ formatDate(t.borrowDate) }}</td><td>{{ formatDate(t.dueDate) }}</td><td>{{ ticketBadge(t.status) }}</td></tr><tr v-if="!recent.length"><td colspan="5" class="empty">Chưa có phiếu mượn.</td></tr></tbody></table></div></section>
      <section class="card pad"><h2 class="section-title">Sách khả dụng</h2><div class="table-wrap"><table><thead><tr><th>Sách</th><th>Mã bản sao</th><th>Vị trí</th><th></th></tr></thead><tbody><tr v-for="c in availableCopies.slice(0,8)" :key="c.id"><td>{{ c.bookTitle }}</td><td>{{ c.copyCode }}</td><td>{{ c.shelfLocation }}</td><td><button class="mini" @click="addCopy(c)">Chọn</button></td></tr><tr v-if="!availableCopies.length"><td colspan="4" class="empty">Chưa có bản sao sẵn sàng.</td></tr></tbody></table></div></section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { catalogApi, circulationApi, identityApi, dataOf, getErrorMessage, formatDate, statusMaps, enumText, getUser } from '../services/api'
const error = ref(''), success = ref(''), loading = ref(false)
const readerKeyword = ref(''), copyKeyword = ref('')
const reader = ref(null), selectedCopies = ref([]), copies = ref([]), tickets = ref([])
const today = new Date(); const plus14 = new Date(); plus14.setDate(today.getDate()+14)
const borrowDate = ref(today.toISOString().slice(0,10)), dueDate = ref(plus14.toISOString().slice(0,10))
const borrowing = computed(() => tickets.value.filter(t => Number(t.status) === 1 || t.status === 'Borrowing').length)
const todayTickets = computed(() => tickets.value.filter(t => new Date(t.borrowDate || t.createdAt).toDateString() === new Date().toDateString()).length)
const recent = computed(() => tickets.value.slice(0,6))
const availableCopies = computed(() => copies.value.filter(c => Number(c.borrowStatus) === 1 || c.borrowStatus === 'Available'))
const canSubmit = computed(() => reader.value?.canBorrow && selectedCopies.value.length > 0 && selectedCopies.value.length <= Number(reader.value.borrowLimit || 999))
function ticketBadge(s){ return enumText(s,statusMaps.ticket) }
function addCopy(c){ if (!selectedCopies.value.some(x=>x.id===c.id)) selectedCopies.value.push(c) }
async function findReader(){ error.value=''; success.value=''; reader.value=null; const q=readerKeyword.value.trim(); if(!q) return; try { const { data } = await identityApi.readers({ q }); const found = data[0]; if(!found) throw new Error('Không tìm thấy bạn đọc.'); const status = await identityApi.validateCard(found.readerCode); reader.value = { ...found, ...status.data } } catch(e){ error.value=getErrorMessage(e,'Không tìm thấy hoặc thẻ không hợp lệ.') } }
async function findCopy(){ error.value=''; const q=copyKeyword.value.trim(); if(!q) return; try { let found=null; try { found = dataOf(await catalogApi.copyByCode(q)) } catch { const res = await catalogApi.copies({ q }); found = dataOf(res).find(c => Number(c.borrowStatus)===1 || c.borrowStatus==='Available') } if(!found) throw new Error('Không tìm thấy bản sao sẵn sàng.'); if(Number(found.borrowStatus)!==1 && found.borrowStatus!=='Available') throw new Error('Bản sao này không sẵn sàng để mượn.'); addCopy(found); copyKeyword.value='' } catch(e){ error.value=getErrorMessage(e,'Không tìm thấy bản sao sẵn sàng.') } }
async function submitBorrow(){ if(!canSubmit.value) return; loading.value=true; error.value=''; success.value=''; try { const user=getUser(); await circulationApi.createTicket({ readerCode: reader.value.readerCode, readerName: reader.value.readerName || reader.value.fullName, librarianName: user.fullName || user.email || 'Thủ thư', borrowDate: borrowDate.value, dueDate: dueDate.value, items: selectedCopies.value.map(c => ({ bookId: c.bookId, copyId: c.id, copyCode: c.copyCode, bookTitle: c.bookTitle })) }); success.value='Tạo phiếu mượn thành công.'; selectedCopies.value=[]; await load() } catch(e){ error.value=getErrorMessage(e,'Tạo phiếu mượn thất bại.') } finally { loading.value=false } }
async function load(){ const [t,c]=await Promise.all([circulationApi.tickets(), catalogApi.copies()]); tickets.value=dataOf(t); copies.value=dataOf(c) }
onMounted(load)
</script>
