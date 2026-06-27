<template><div>
  <div class="page-head"><div><h1>Gia hạn sách</h1><p>Kiểm tra điều kiện và cập nhật hạn trả mới</p></div></div>
  <div v-if="error" class="alert error">{{ error }}</div><div v-if="success" class="alert success">{{ success }}</div>
  <div class="grid grid-4">
    <div class="card stat"><div class="stat-icon green"><i class="mdi mdi-calendar-check-outline"></i></div><div><div class="stat-label">Có thể gia hạn</div><div class="stat-value">{{ eligible.length }}</div></div></div>
    <div class="card stat"><div class="stat-icon orange"><i class="mdi mdi-clock-outline"></i></div><div><div class="stat-label">Sắp đến hạn</div><div class="stat-value">{{ dueSoon }}</div></div></div>
    <div class="card stat"><div class="stat-icon red"><i class="mdi mdi-close-circle-outline"></i></div><div><div class="stat-label">Bị từ chối</div><div class="stat-value">{{ rejected.length }}</div></div></div>
    <div class="card stat"><div class="stat-icon blue"><i class="mdi mdi-calendar-plus"></i></div><div><div class="stat-label">Gia hạn hôm nay</div><div class="stat-value">{{ renewedToday }}</div></div></div>
  </div>
  <div class="split" style="margin-top:16px">
    <section class="card pad"><h2 class="section-title">1. Tra cứu phiếu mượn / bạn đọc</h2><div class="toolbar"><div class="field"><label>Từ khóa</label><input class="input" v-model="q" placeholder="Mã phiếu, bạn đọc, mã thẻ" /></div><button class="btn primary">Tìm kiếm</button></div>
      <div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>Mã phiếu</th><th>Bạn đọc</th><th>Hạn hiện tại</th><th>Điều kiện</th><th></th></tr></thead><tbody><tr v-for="t in filtered" :key="t.id"><td>{{t.ticketCode}}</td><td>{{t.readerName}}<br><small>{{t.readerCode}}</small></td><td>{{formatDate(t.dueDate)}}</td><td><span class="badge" :class="canRenew(t)?'green':'red'">{{ canRenew(t)?'Hợp lệ':'Không hợp lệ' }}</span></td><td><button class="mini" :disabled="!canRenew(t)" @click="selectTicket(t)">Chọn</button></td></tr><tr v-if="!filtered.length"><td colspan="5" class="empty">Không có phiếu phù hợp.</td></tr></tbody></table></div></section>
    <section class="card pad"><h2 class="section-title">2. Danh sách sách được gia hạn</h2><div v-if="selected" class="sub-title">Phiếu {{selected.ticketCode}} - {{selected.readerName}}</div><div class="table-wrap"><table><thead><tr><th></th><th>Sách</th><th>Mã bản sao</th><th>Hạn hiện tại</th><th>Hạn mới</th></tr></thead><tbody><tr v-for="i in activeItems(selected)" :key="i.id"><td><input type="checkbox" :value="i.id" v-model="itemIds"></td><td>{{i.bookTitle}}</td><td>{{i.copyCode}}</td><td>{{formatDate(i.dueDate)}}</td><td>{{formatDate(newDue(i))}}</td></tr><tr v-if="!selected"><td colspan="5" class="empty">Chưa chọn phiếu.</td></tr></tbody></table></div>
      <div class="toolbar" style="margin-top:14px"><div class="field"><label>Số ngày gia hạn</label><select class="select" v-model.number="extendDays"><option :value="7">7 ngày</option><option :value="14">14 ngày</option><option :value="30">30 ngày</option></select></div><button class="btn" @click="clear">Hủy</button><button class="btn primary" :disabled="!selected||!itemIds.length||loading" @click="renew">Xác nhận gia hạn</button></div></section>
  </div>
  <section class="card pad" style="margin-top:16px"><h2 class="section-title">Quy tắc & ghi chú</h2><div class="grid grid-3"><div class="alert success">Thẻ thư viện còn hiệu lực</div><div class="alert success">Không có phí phạt chưa thanh toán</div><div class="alert success">Không áp dụng cho sách đã quá hạn</div></div></section>
</div></template>
<script setup>
import {computed,onMounted,ref} from 'vue'
import {circulationApi,dataOf,getErrorMessage,formatDate} from '../services/api'
const tickets=ref([]), history=ref([]), q=ref(''), selected=ref(null), itemIds=ref([]), extendDays=ref(7), error=ref(''), success=ref(''), loading=ref(false)
const open=computed(()=>tickets.value.filter(t=>Number(t.status)===1||t.status==='Borrowing'))
const eligible=computed(()=>open.value.filter(canRenew))
const rejected=computed(()=>open.value.filter(t=>!canRenew(t)))
const dueSoon=computed(()=>open.value.filter(t=>{const d=(new Date(t.dueDate)-new Date())/86400000;return d>=0&&d<=3}).length)
const renewedToday=computed(()=>history.value.filter(h=>String(h.action||'').includes('Gia hạn')&&new Date(h.createdAt).toDateString()===new Date().toDateString()).length)
const filtered=computed(()=>{const k=q.value.toLowerCase().trim();return open.value.filter(t=>!k||[t.ticketCode,t.readerName,t.readerCode].join(' ').toLowerCase().includes(k)).slice(0,20)})
function activeItems(t){return t?.items?.filter(i=>Number(i.itemStatus)!==2&&i.itemStatus!=='Returned')||[]}
function canRenew(t){return activeItems(t).length>0 && new Date(t.dueDate)>=new Date(new Date().toDateString())}
function selectTicket(t){selected.value=t;itemIds.value=activeItems(t).map(i=>i.id)}
function clear(){selected.value=null;itemIds.value=[]}
function newDue(i){const base=new Date(i.dueDate)>new Date()?new Date(i.dueDate):new Date();base.setDate(base.getDate()+extendDays.value);return base}
async function renew(){loading.value=true;error.value='';success.value='';try{await circulationApi.renewTicket(selected.value.id,{itemIds:itemIds.value,extendDays:extendDays.value,note:'Gia hạn từ giao diện thủ thư'});success.value='Gia hạn thành công.';clear();await load()}catch(e){error.value=getErrorMessage(e,'Gia hạn thất bại.')}finally{loading.value=false}}
async function load(){const [t,h]=await Promise.all([circulationApi.tickets(),circulationApi.history()]);tickets.value=dataOf(t);history.value=dataOf(h)}
onMounted(load)
</script>
