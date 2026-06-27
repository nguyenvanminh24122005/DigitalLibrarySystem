<template>
  <span class="badge" :class="badgeClass">{{ text }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ text: String })
const badgeClass = computed(() => {
  const t = props.text || ''
  if (t.includes('Hoạt động') || t.includes('Sẵn sàng') || t.includes('có sẵn') || t.includes('Thành công')) return 'green'
  if (t.includes('mượn') || t.includes('Cập nhật')) return 'blue'
  if (t.includes('Tạm') || t.includes('Ngưng') || t.includes('Hư') || t.includes('quá hạn') || t.includes('Đang được')) return 'orange'
  if (t.includes('Xóa') || t.includes('Mất') || t.includes('Thất bại') || t.includes('Quá hạn')) return 'red'
  if (t.includes('Admin') || t.includes('Quản trị')) return 'purple'
  return 'gray'
})
</script>
