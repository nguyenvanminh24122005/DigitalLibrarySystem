<script setup>
import { reactive } from "vue";

const emit = defineEmits(["submit"]);
const form = reactive({ code: "", name: "", email: "", phone: "" });

function submit() {
  emit("submit", { ...form });
  Object.assign(form, { code: "", name: "", email: "", phone: "" });
}
</script>

<template>
  <form class="row g-3" @submit.prevent="submit">
    <div class="col-md-4"><label class="form-label">Mã độc giả</label><input v-model="form.code" class="form-control" required /></div>
    <div class="col-md-8"><label class="form-label">Họ và tên</label><input v-model="form.name" class="form-control" required /></div>
    <div class="col-md-7"><label class="form-label">Email</label><input v-model="form.email" type="email" class="form-control" required /></div>
    <div class="col-md-5"><label class="form-label">Số điện thoại</label><input v-model="form.phone" class="form-control" required /></div>
    <div class="col-12 text-end"><button type="submit" class="btn btn-primary">Thêm độc giả</button></div>
  </form>
</template>
