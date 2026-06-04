<script setup>
defineProps({ debts: Array });
defineEmits(["pay"]);
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead><tr><th>Độc giả</th><th>Công nợ</th><th>Trạng thái</th><th class="text-end">Thao tác</th></tr></thead>
      <tbody>
        <tr v-for="debt in debts" :key="debt.id">
          <td><strong>{{ debt.readerName }}</strong><div class="small text-secondary">{{ debt.readerCode }}</div></td>
          <td>{{ money(debt.amount) }}</td>
          <td><span class="badge" :class="debt.status === 'PAID' ? 'text-bg-success' : 'text-bg-warning'">{{ debt.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán" }}</span></td>
          <td class="text-end"><button v-if="debt.status === 'UNPAID'" class="btn btn-sm btn-outline-success" @click="$emit('pay', debt.readerId)">Thanh toán</button></td>
        </tr>
        <tr v-if="debts.length === 0"><td colspan="4" class="text-center text-secondary py-4">Chưa có công nợ.</td></tr>
      </tbody>
    </table>
  </div>
</template>
