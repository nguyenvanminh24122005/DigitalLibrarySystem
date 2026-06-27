<template>
  <div class="grid">
    <div class="card card-pad">
      <h3 class="section-title">{{ title }}</h3>
      <div style="display:grid;grid-template-columns:150px 1fr;gap:14px;align-items:center">
        <div class="donut"><div class="donut-label">{{ total }}<br><span style="font-size:12px;color:#64748b">đầu sách</span></div></div>
        <div class="grid" style="gap:10px"><div v-for="item in items" :key="item" style="display:flex;justify-content:space-between"><span>{{ item.split(' ').slice(0,-1).join(' ') }}</span><b>{{ item.split(' ').at(-1) }}</b></div></div>
      </div>
    </div>
    <div class="card card-pad">
      <h3 class="section-title">Hoạt động cập nhật gần đây</h3>
      <div v-for="i in 4" :key="i" style="display:flex;gap:12px;padding:11px 0;border-bottom:1px solid #eef2f7">
        <span class="log-dot badge blue"><v-icon icon="mdi-pencil-outline" /></span>
        <div><b>Cập nhật danh mục</b><br><span style="color:#64748b;font-size:13px">31/05/2024 10:{{ i }}5</span></div>
      </div>
    </div>
    <div class="card card-pad"><h3 class="section-title">Mẹo quản lý</h3><ul style="color:#475569;line-height:1.9"><li>Chuẩn hóa tên để tránh trùng lặp.</li><li>Nên ngưng sử dụng thay vì xóa dữ liệu.</li></ul></div>
  </div>
</template>
<script setup>
defineProps({ title: String, total: String, items: Array })
</script>
