<template>
  <div class="card stat">
    <div class="stat-icon" :style="{ background: bg, color }">
      <v-icon :icon="icon" size="28" />
    </div>
    <div>
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="trend" :class="{ down }">
        <v-icon :icon="down ? 'mdi-arrow-down' : 'mdi-arrow-up'" size="16" />
        {{ trend }} so với tháng trước
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  trend: { type: String, default: '0%' },
  icon: { type: String, default: 'mdi-chart-box' },
  color: { type: String, default: '#2563eb' },
  bg: { type: String, default: '#eff6ff' },
  down: { type: Boolean, default: false }
})
</script>
