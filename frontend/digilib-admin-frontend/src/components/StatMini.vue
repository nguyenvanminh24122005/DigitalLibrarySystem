<template>
  <div class="card card-pad" style="box-shadow:none;background:#fbfdff">
    <div style="color:#64748b;font-weight:700">{{ title }}</div>
    <div style="font-size:26px;font-weight:800" :style="{color: danger ? '#ef4444' : '#0f172a'}">{{ value }}</div>
    <div class="trend" :class="{down:danger}">{{ danger ? '↓ 8%' : '↑ 15%' }} so với kỳ trước</div>
  </div>
</template>
<script setup>
defineProps({ title:String, value:[String,Number], danger:Boolean })
</script>
