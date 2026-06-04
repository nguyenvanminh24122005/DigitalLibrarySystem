<script setup>
import { reactive } from "vue";

defineProps({
  authenticated: {
    type: Boolean,
    required: true
  },
  username: {
    type: String,
    default: ""
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["login", "logout"]);
const form = reactive({ username: "admin", password: "admin123" });

function submit() {
  emit("login", { ...form });
}
</script>

<template>
  <section class="card section-card mb-4">
    <div class="card-body">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h2 class="h6 mb-1">Đăng nhập API Gateway</h2>
          <p class="small text-secondary mb-0">
            <span v-if="authenticated">Đã đăng nhập: {{ username }}</span>
            <span v-else>Đăng nhập để sử dụng các API Circulation Service.</span>
          </p>
        </div>
        <button v-if="authenticated" class="btn btn-outline-secondary" @click="$emit('logout')">
          Đăng xuất
        </button>
      </div>

      <form v-if="!authenticated" class="row g-3 mt-1" @submit.prevent="submit">
        <div class="col-md-5">
          <label class="form-label">Tài khoản</label>
          <input v-model="form.username" class="form-control" autocomplete="username" required />
        </div>
        <div class="col-md-5">
          <label class="form-label">Mật khẩu</label>
          <input v-model="form.password" type="password" class="form-control" autocomplete="current-password" required />
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
          </button>
        </div>
      </form>

      <p class="small text-secondary mt-3 mb-0">
        Tài khoản demo: <code>admin / admin123</code> hoặc <code>librarian / lib123</code>
      </p>
    </div>
  </section>
</template>
