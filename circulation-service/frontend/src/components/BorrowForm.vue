<script setup>
import { reactive } from "vue";

defineProps({ readers: Array, books: Array });
const emit = defineEmits(["submit"]);
const now = new Date();
const due = new Date();
due.setDate(due.getDate() + 14);
const asDate = (date) => date.toISOString().slice(0, 10);
const form = reactive({ readerId: "", bookId: "", borrowDate: asDate(now), dueDate: asDate(due) });

function submit() {
  emit("submit", { ...form });
  form.readerId = "";
  form.bookId = "";
}
</script>

<template>
  <form class="row g-3" @submit.prevent="submit">
    <div class="col-12"><label class="form-label">Độc giả</label><select v-model="form.readerId" class="form-select" required><option value="">Chọn độc giả</option><option v-for="reader in readers" :key="reader.id" :value="reader.id">{{ reader.code }} - {{ reader.name }}</option></select></div>
    <div class="col-12"><label class="form-label">Sách có thể mượn</label><select v-model="form.bookId" class="form-select" required><option value="">Chọn sách</option><option v-for="book in books.filter(item => item.status === 'AVAILABLE')" :key="book.id" :value="book.id">{{ book.code }} - {{ book.title }}</option></select></div>
    <div class="col-md-6"><label class="form-label">Ngày mượn</label><input v-model="form.borrowDate" type="date" class="form-control" required /></div>
    <div class="col-md-6"><label class="form-label">Hạn trả</label><input v-model="form.dueDate" type="date" class="form-control" required /></div>
    <div class="col-12 text-end"><button type="submit" class="btn btn-primary">Tạo phiếu mượn</button></div>
  </form>
</template>
