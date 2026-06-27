<template>
  <div>
    <div class="page-head"><div><h1>Trả sách</h1><p>Xử lý trả sách, cập nhật tồn kho và tính phí phạt quá hạn</p></div></div>
    <div v-if="error" class="alert error">{{ error }}</div><div v-if="success" class="alert success">{{ success }}</div>
    <div class="grid grid-4">
      <div class="card stat"><div class="stat-icon blue"><i class="mdi mdi-book-open"></i></div><div><div class="stat-label">Đang mượn</div><div class="stat-value">{{ openTickets.length }}</div></div></div>
      <div class="card stat"><div class="stat-icon green"><i class="mdi mdi-calendar-check"></i></div><div><div class="stat-label">Đến hạn hôm nay</div><div class="stat-value">{{ dueToday }}</div></div></div>
      <div class="card stat"><div class="stat-icon red"><i class="mdi mdi-clock-alert-outline"></i></div><div><div class="stat-label">Quá hạn</div><div class="stat-value">{{ overdueCount }}</div></div></div>
      <div class="card stat"><div class="stat-icon purple"><i class="mdi mdi-book-check-outline"></i></div><div><div class="stat-label">Đã trả hôm nay</div><div class="stat-value">{{ returnedToday }}</div></div></div>
    </div>
    <div class="split" style="margin-top:16px">
      <section class="card pad">
        <h2 class="section-title">1. Tra cứu phiếu mượn / bạn đọc</h2>
        <div class="toolbar"><div class="field"><label>Tìm theo mã phiếu, mã độc giả, tên bạn đọc</label><input class="input" v-model="q" @keyup.enter="search" placeholder="Nhập từ khóa" /></div><button class="btn primary" @click="search">Tìm kiếm</button></div>
        <div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>Mã phiếu</th><th>Bạn đọc</th><th>Hạn trả</th><th>Số sách</th><th></th></tr></thead><tbody><tr v-for="t in filtered" :key="t.id"><td>{{ t.ticketCode }}</td><td>{{ t.readerName }}<br><small>{{ t.readerCode }}</small></td><td>{{ formatDate(t.dueDate) }}</td><td>{{ activeItems(t).length }}</td><td><button class="mini" @click="selectTicket(t)">Chọn</button></td></tr><tr v-if="!filtered.length"><td colspan="5" class="empty">Không có phiếu mượn phù hợp.</td></tr></tbody></table></div>
      </section>
      <section class="card pad">
        <h2 class="section-title">2. Danh sách sách trả</h2>
        <div v-if="selected" class="sub-title">Phiếu {{ selected.ticketCode }} - {{ selected.readerName }}</div>
        <div class="table-wrap"><table><thead><tr><th></th><th>Sách</th><th>Mã bản sao</th><th>Hạn trả</th><th>Phí dự kiến</th></tr></thead><tbody><tr v-for="i in activeItems(selected)" :key="i.id"><td><input type="checkbox" :value="i.id" v-model="itemIds"></td><td>{{ i.bookTitle }}</td><td>{{ i.copyCode }}</td><td>{{ formatDate(i.dueDate) }}</td><td>{{ formatMoney(expectedFine(i)) }}</td></tr><tr v-if="!selected"><td colspan="5" class="empty">Chưa chọn phiếu mượn.</td></tr></tbody></table></div>
        <div class="field" style="margin-top:12px"><label>Ghi chú trả sách</label><textarea class="textarea" v-model="note" placeholder="Tình trạng sách, ghi chú phí phạt..."></textarea></div>
        <div class="toolbar" style="justify-content:flex-end;margin-top:14px"><button class="btn" @click="clear">Hủy</button><button class="btn primary" :disabled="!selected || !itemIds.length || loading" @click="returnBooks">Xác nhận trả sách</button></div>
      </section>
    </div>
    <section class="card pad" style="margin-top:16px"><h2 class="section-title">Lịch sử trả gần đây</h2><div class="table-wrap"><table><thead><tr><th>Mã phiếu</th><th>Bạn đọc</th><th>Ngày trả</th><th>Trạng thái</th></tr></thead><tbody><tr v-for="t in returned.slice(0,8)" :key="t.id"><td>{{ t.ticketCode }}</td><td>{{ t.readerName }}</td><td>{{ formatDateTime(t.returnDate || t.updatedAt) }}</td><td><span class="badge green">Đã trả</span></td></tr><tr v-if="!returned.length"><td colspan="4" class="empty">Chưa có phiếu trả.</td></tr></tbody></table></div></section>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { circulationApi, dataOf, getErrorMessage, formatDate, formatDateTime, formatMoney } from '../services/api'
const tickets=ref([]), q=ref(''), selected=ref(null), itemIds=ref([]), note=ref(''), error=ref(''), success=ref(''), loading=ref(false)
const finePerDay=2000
const openTickets=computed(()=>tickets.value.filter(t=>Number(t.status)===1||Number(t.status)===3||t.status==='Borrowing'||t.status==='Overdue'))
const returned=computed(()=>tickets.value.filter(t=>Number(t.status)===2||t.status==='Returned'))
const filtered=computed(()=>{const k=q.value.toLowerCase().trim();return openTickets.value.filter(t=>!k||[t.ticketCode,t.readerCode,t.readerName].join(' ').toLowerCase().includes(k)).slice(0,20)})
const dueToday=computed(()=>openTickets.value.filter(t=>new Date(t.dueDate).toDateString()===new Date().toDateString()).length)
const overdueCount=computed(()=>openTickets.value.filter(t=>new Date(t.dueDate)<new Date()).length)
const returnedToday=computed(()=>returned.value.filter(t=>new Date(t.returnDate||t.updatedAt).toDateString()===new Date().toDateString()).length)
function activeItems(t){return t?.items?.filter(i=>Number(i.itemStatus)!==2&&i.itemStatus!=='Returned')||[]}
function expectedFine(i){return Math.max(0, Math.floor((new Date()-new Date(i.dueDate))/(86400000))) * finePerDay}
function selectTicket(t){selected.value=t; itemIds.value=activeItems(t).map(i=>i.id); note.value=''}
function clear(){selected.value=null; itemIds.value=[]; note.value=''}
function search(){}
async function returnBooks(){loading.value=true;error.value='';success.value='';try{await circulationApi.returnTicket(selected.value.id,{itemIds:itemIds.value,note:note.value});success.value='Trả sách thành công.';clear();await load()}catch(e){error.value=getErrorMessage(e,'Trả sách thất bại.')}finally{loading.value=false}}
async function load(){tickets.value=dataOf(await circulationApi.tickets())}
onMounted(load)
</script>
