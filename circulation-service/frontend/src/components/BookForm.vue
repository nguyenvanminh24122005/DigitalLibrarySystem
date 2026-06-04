<script setup>
import { reactive } from "vue";

const emit = defineEmits(["submit"]);
const form = reactive({ code: "", title: "", author: "", category: "" });

function submit() {
  emit("submit", { ...form });
  Object.assign(form, { code: "", title: "", author: "", category: "" });
}
</script>

<template>
  <form class="row g-3" @submit.prevent="submit">
    <div class="col-md-4"><label class="form-label">Mã sách</label><input v-model="form.code" class="form-control" required /></div>
    <div class="col-md-8"><label class="form-label">Tên sách</label><input v-model="form.title" class="form-control" required /></div>
    <div class="col-md-6"><label class="form-label">Tác giả</label><input v-model="form.author" class="form-control" required /></div>
    <div class="col-md-6"><label class="form-label">Thể loại</label><input v-model="form.category" class="form-control" required /></div>
    <div class="col-12 text-end"><button type="submit" class="btn btn-primary">Thêm sách</button></div>
  </form>
</template>
