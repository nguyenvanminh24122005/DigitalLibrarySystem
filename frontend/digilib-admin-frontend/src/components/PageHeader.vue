<template>
  <div class="page-head">
    <div>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      <div v-if="breadcrumb" class="breadcrumb">Trang chủ › {{ breadcrumb }}</div>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  breadcrumb: { type: String, default: '' }
})
</script>
