<script setup>
import { reactive } from "vue";

defineProps({ records: Array });
const emit = defineEmits(["submit"]);
const form = reactive({ recordId: "", returnDate: new Date().toISOString().slice(0, 10) });

function submit() {
  emit("submit", { ...form });
  form.recordId = "";
}
</script>

<template>
  <form class="row g-3" @submit.prevent="submit">
    <div class="col-12"><label class="form-label">Phiếu đang mượn</label><select v-model="form.recordId" class="form-select" required><option value="">Chọn phiếu mượn</option><option v-for="record in records.filter(item => item.status === 'BORROWED')" :key="record.id" :value="record.id">#{{ record.id }} - {{ record.readerName }} - {{ record.bookTitle }}</option></select></div>
    <div class="col-12"><label class="form-label">Ngày trả</label><input v-model="form.returnDate" type="date" class="form-control" required /></div>
    <div class="col-12 text-end"><button type="submit" class="btn btn-success">Xác nhận trả sách</button></div>
  </form>
</template>
