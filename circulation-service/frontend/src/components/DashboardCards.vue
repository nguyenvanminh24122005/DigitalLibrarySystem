<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
});

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;
</script>

<template>
  <div class="row g-3">
    <div class="col-md-6 col-xl" v-for="card in [
      ['Tổng phiếu mượn', stats.totalRecords],
      ['Sách đang mượn', stats.borrowedBooks],
      ['Sách quá hạn', stats.overdueBooks],
      ['Tổng tiền phạt', money(stats.totalFine)],
      ['Tổng công nợ', money(stats.totalDebt)]
    ]" :key="card[0]">
      <div class="card dashboard-card">
        <div class="card-body">
          <p class="text-secondary mb-2">{{ card[0] }}</p>
          <p class="display-6 mb-0">{{ card[1] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
