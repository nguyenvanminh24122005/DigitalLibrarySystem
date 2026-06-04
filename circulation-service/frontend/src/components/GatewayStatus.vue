<script setup>
defineProps({
  url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  responseTime: {
    type: Number,
    default: null
  }
});
</script>

<template>
  <section class="card section-card mb-4">
    <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div>
        <h2 class="h6 mb-1">Kết nối API Gateway</h2>
        <p class="small text-secondary mb-0">{{ url }}</p>
      </div>
      <div class="text-md-end">
        <p class="fw-semibold mb-1">
          <span v-if="status === 'connected'">🟢 Đã kết nối API Gateway</span>
          <span v-else-if="status === 'error'">🔴 Không kết nối được API Gateway</span>
          <span v-else>Đang kiểm tra API Gateway...</span>
        </p>
        <p class="small text-secondary mb-0">
          Thời gian phản hồi: {{ responseTime === null ? "Chưa xác định" : `${responseTime} ms` }}
        </p>
      </div>
    </div>
  </section>
</template>
