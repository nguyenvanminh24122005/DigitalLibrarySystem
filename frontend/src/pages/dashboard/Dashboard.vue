<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-grey-darken-4">Dashboard</h2>
      <p class="text-body-2 text-grey">Tổng quan tình hình hoạt động của thư viện</p>
    </div>

    <!-- Stat Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" lg="3" v-for="stat in stats" :key="stat.title">
        <v-card>
          <v-card-text class="d-flex align-center pa-5">
            <v-avatar :color="stat.bgColor" size="48" class="mr-4">
              <v-icon :color="stat.iconColor" size="24">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-medium text-grey">{{ stat.title }}</p>
              <h3 class="text-h5 font-weight-bold" :class="stat.valueColor || 'text-grey-darken-4'">{{ stat.value }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row>
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="text-subtitle-1 font-weight-bold">Lượt mượn sách trong tuần</v-card-title>
          <v-card-text>
            <div style="height: 320px; display: flex; align-items: flex-end; gap: 12px; padding-top: 16px;">
              <div v-for="(d, i) in weeklyData" :key="i" class="d-flex flex-column align-center flex-grow-1">
                <span class="text-caption text-grey mb-1">{{ d.borrows }}</span>
                <div
                  :style="{ height: (d.borrows / 90 * 240) + 'px', width: '100%', maxWidth: '48px' }"
                  class="rounded-t bg-primary mx-auto"
                  style="min-height: 8px; transition: height 0.3s ease;"
                />
                <span class="text-caption text-grey mt-2">{{ d.name }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1 font-weight-bold">Top Sách Mượn Nhiều</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item v-for="(book, i) in topBooks" :key="book.title" class="px-0">
                <template #prepend>
                  <span class="text-body-2 font-weight-bold text-grey mr-3" style="width: 16px;">{{ i + 1 }}</span>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">{{ book.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ book.author }}</v-list-item-subtitle>
                <template #append>
                  <span class="text-body-2 font-weight-medium text-primary">{{ book.borrows }} lượt</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title class="text-subtitle-1 font-weight-bold">Cảnh báo</v-card-title>
          <v-card-text>
            <div v-for="alert in alerts" :key="alert.title" class="d-flex justify-space-between align-center py-2" style="border-bottom: 1px solid #f3f4f6;">
              <div>
                <p class="text-body-2 font-weight-medium">{{ alert.title }}</p>
                <p class="text-caption text-grey">Còn lại: {{ alert.remaining }}/{{ alert.total }}</p>
              </div>
              <v-chip :color="alert.remaining === 0 ? 'error' : 'warning'" size="small" variant="tonal">
                {{ alert.remaining === 0 ? 'Hết sách' : 'Sắp hết' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportApi } from '../../services/reportApi'
import { circulationApi } from '../../services/circulationApi'

const stats = ref([
  { title: 'Tổng đầu sách', value: '—', icon: 'mdi-book', bgColor: '#E3F2FD', iconColor: '#1976D2' },
  { title: 'Tổng bản sao', value: '—', icon: 'mdi-book-multiple', bgColor: '#E8F5E9', iconColor: '#4CAF50' },
  { title: 'Đang mượn', value: '—', icon: 'mdi-account-group', bgColor: '#F3E5F5', iconColor: '#9C27B0' },
  { title: 'Phiếu quá hạn', value: '—', icon: 'mdi-alert-circle', bgColor: '#FFEBEE', iconColor: '#F44336', valueColor: 'text-error' },
])

const weeklyData = ref([
  { name: 'T2', borrows: 45 }, { name: 'T3', borrows: 52 }, { name: 'T4', borrows: 38 },
  { name: 'T5', borrows: 65 }, { name: 'T6', borrows: 48 }, { name: 'T7', borrows: 85 }, { name: 'CN', borrows: 70 },
])

const topBooks = ref([
  { title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', borrows: 156 },
  { title: 'Nhà Giả Kim', author: 'Paulo Coelho', borrows: 142 },
  { title: 'Clean Code', author: 'Robert C. Martin', borrows: 98 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', borrows: 85 },
])

const alerts = ref([
  { title: 'Design Patterns', remaining: 1, total: 10 },
  { title: 'JavaScript The Good Parts', remaining: 0, total: 5 },
])

onMounted(async () => {
  try {
    const { data } = await reportApi.getDashboard()
    if (data) {
      stats.value[0].value = data.totalBooks?.toLocaleString() || '0'
      stats.value[1].value = data.totalCopies?.toLocaleString() || '0'
      stats.value[2].value = data.totalBorrowing?.toLocaleString() || '0'
      stats.value[3].value = data.totalOverdue?.toLocaleString() || '0'
      if (data.topBooks) topBooks.value = data.topBooks
      if (data.weeklyBorrows) weeklyData.value = data.weeklyBorrows
    }
  } catch { /* use defaults */ }
})
</script>
