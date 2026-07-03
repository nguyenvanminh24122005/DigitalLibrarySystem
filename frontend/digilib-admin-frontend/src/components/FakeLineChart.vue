<template>
  <div class="line-chart">
    <svg class="fake-chart" viewBox="0 0 800 260" preserveAspectRatio="none">
      <line v-for="y in [40,90,140,190,240]" :key="y" x1="0" :y1="y" x2="800" :y2="y" class="chart-grid" />
      <polyline points="0,180 70,120 140,150 210,80 280,145 350,135 420,170 490,115 560,150 630,95 700,145 800,120" class="chart-line-blue" />
      <polyline points="0,210 70,170 140,178 210,160 280,188 350,110 420,175 490,155 560,185 630,105 700,150 800,165" class="chart-line-green" />
    </svg>
  </div>
</template>
