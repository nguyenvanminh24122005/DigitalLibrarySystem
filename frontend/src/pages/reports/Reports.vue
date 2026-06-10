<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-grey-darken-4">Báo cáo Thống kê</h2>
      <p class="text-body-2 text-grey">Phân tích tình hình hoạt động, mượn trả và tài chính của thư viện</p>
    </div>

    <!-- Tabs Báo cáo -->
    <v-card class="mb-6">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="borrowing" prepend-icon="mdi-clipboard-text-outline">Hoạt động Mượn Trả</v-tab>
        <v-tab value="books" prepend-icon="mdi-book-multiple">Thống kê Sách</v-tab>
        <v-tab value="fines" prepend-icon="mdi-cash-multiple">Doanh thu Phạt</v-tab>
      </v-tabs>
    </v-card>

    <v-window v-model="tab">
      <!-- Mượn trả window -->
      <v-window-item value="borrowing">
        <v-row>
          <v-col cols="12" md="4" v-for="stat in borrowStats" :key="stat.title">
            <v-card>
              <v-card-text class="d-flex align-center pa-5">
                <v-avatar :color="stat.bgColor" size="48" class="mr-4">
                  <v-icon :color="stat.iconColor" size="24">{{ stat.icon }}</v-icon>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-medium text-grey">{{ stat.title }}</p>
                  <h3 class="text-h5 font-weight-bold text-grey-darken-4">{{ stat.value }}</h3>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-6">
          <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">
            Lượt mượn theo ngày trong tuần
          </v-card-title>
          <v-card-text class="pa-6">
            <div style="height: 300px; display: flex; align-items: flex-end; gap: 16px; padding-top: 16px;">
              <div v-for="(item, i) in weeklyBorrows" :key="i" class="d-flex flex-column align-center flex-grow-1">
                <span class="text-caption text-grey mb-1 font-weight-bold">{{ item.borrows }}</span>
                <div
                  :style="{ height: (item.borrows / maxWeeklyBorrows * 200) + 'px', width: '100%', maxWidth: '40px' }"
                  class="rounded-t bg-primary mx-auto"
                  style="min-height: 8px; transition: height 0.3s ease;"
                />
                <span class="text-caption text-grey mt-2">{{ item.name }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Sách window -->
      <v-window-item value="books">
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="h-100">
              <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">
                Top Sách Được Mượn Nhiều Nhất
              </v-card-title>
              <v-card-text class="pa-6">
                <div v-for="(book, index) in topBooks" :key="book.title" class="mb-4">
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="font-weight-medium">{{ index + 1 }}. {{ book.title }}</span>
                    <span class="text-primary font-weight-bold">{{ book.borrows }} lượt</span>
                  </div>
                  <v-progress-linear
                    :model-value="book.borrows / maxBookBorrows * 100"
                    color="primary"
                    height="8"
                    rounded
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="h-100">
              <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">
                Phân bố Sách theo Thể loại
              </v-card-title>
              <v-card-text class="pa-6">
                <div v-for="cat in bookDistribution" :key="cat.name" class="mb-4">
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="font-weight-medium">{{ cat.name }}</span>
                    <span class="text-grey-darken-2 font-weight-bold">{{ cat.count }} cuốn ({{ cat.percentage }}%)</span>
                  </div>
                  <v-progress-linear
                    :model-value="cat.percentage"
                    color="success"
                    height="8"
                    rounded
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Phạt window -->
      <v-window-item value="fines">
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-text class="d-flex align-center pa-5">
                <v-avatar color="#E8F5E9" size="48" class="mr-4">
                  <v-icon color="#4CAF50" size="24">mdi-cash-check</v-icon>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-medium text-grey">Đã thu phí phạt</p>
                  <h3 class="text-h5 font-weight-bold text-success">{{ formatCurrency(fineRevenue.collected) }}</h3>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-text class="d-flex align-center pa-5">
                <v-avatar color="#FFEBEE" size="48" class="mr-4">
                  <v-icon color="#F44336" size="24">mdi-cash-multiple</v-icon>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-medium text-grey">Còn nợ (Chưa thu)</p>
                  <h3 class="text-h5 font-weight-bold text-error">{{ formatCurrency(fineRevenue.unpaid) }}</h3>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-6">
          <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">
            Chi tiết các khoản phạt quá hạn phát sinh gần đây
          </v-card-title>
          <v-card-text class="pa-6">
            <v-table>
              <thead>
                <tr>
                  <th>Độc giả</th>
                  <th>Sách</th>
                  <th>Ngày quá hạn</th>
                  <th>Mức phạt</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in recentFines" :key="f.id">
                  <td class="font-weight-medium">{{ f.readerName }}</td>
                  <td>{{ f.bookTitle }}</td>
                  <td>{{ formatDate(f.date) }}</td>
                  <td class="text-error font-weight-bold">{{ formatCurrency(f.amount) }}</td>
                  <td>
                    <v-chip :color="f.status === 'Paid' ? 'success' : 'error'" size="small" variant="tonal">
                      {{ f.status === 'Paid' ? 'Đã thanh toán' : 'Chưa đóng' }}
                    </v-chip>
                  </td>
                </tr>
                <tr v-if="recentFines.length === 0">
                  <td colspan="5" class="text-center text-grey py-8">Không có khoản phạt phát sinh gần đây</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reportApi } from '../../services/reportApi'

const tab = ref('borrowing')

const borrowStats = ref([
  { title: 'Lượt mượn mới (tháng này)', value: '142', icon: 'mdi-book-plus', bgColor: '#E3F2FD', iconColor: '#1976D2' },
  { title: 'Lượt trả đúng hạn', value: '124', icon: 'mdi-check-circle', bgColor: '#E8F5E9', iconColor: '#4CAF50' },
  { title: 'Số lượt trễ hạn', value: '18', icon: 'mdi-alert-circle', bgColor: '#FFEBEE', iconColor: '#F44336' },
])

const weeklyBorrows = ref([
  { name: 'T2', borrows: 24 },
  { name: 'T3', borrows: 35 },
  { name: 'T4', borrows: 15 },
  { name: 'T5', borrows: 42 },
  { name: 'T6', borrows: 28 },
  { name: 'T7', borrows: 56 },
  { name: 'CN', borrows: 45 },
])

const topBooks = ref([
  { title: 'Đắc Nhân Tâm', borrows: 156 },
  { title: 'Nhà Giả Kim', borrows: 142 },
  { title: 'Clean Code', borrows: 98 },
  { title: 'Sapiens: Lược Sử Loài Người', borrows: 85 },
  { title: 'Giải thuật và Lập trình', borrows: 62 },
])

const bookDistribution = ref([
  { name: 'Công nghệ thông tin', count: 120, percentage: 40 },
  { name: 'Kinh tế & Quản trị', count: 90, percentage: 30 },
  { name: 'Văn học & Nghệ thuật', count: 60, percentage: 20 },
  { name: 'Khoa học xã hội', count: 30, percentage: 10 },
])

const fineRevenue = ref({
  collected: 450000,
  unpaid: 120000,
})

const recentFines = ref([
  { id: 1, readerName: 'Nguyễn Văn A', bookTitle: 'Clean Code', date: '2026-06-05', amount: 25000, status: 'Paid' },
  { id: 2, readerName: 'Trần Thị B', bookTitle: 'Nhà Giả Kim', date: '2026-06-08', amount: 15000, status: 'Unpaid' },
  { id: 3, readerName: 'Lê Văn C', bookTitle: 'Sapiens', date: '2026-06-09', amount: 50000, status: 'Unpaid' },
])

const maxWeeklyBorrows = computed(() => {
  return Math.max(...weeklyBorrows.value.map(item => item.borrows), 10)
})

const maxBookBorrows = computed(() => {
  return Math.max(...topBooks.value.map(item => item.borrows), 10)
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

async function loadReportData() {
  try {
    const { data } = await reportApi.getDashboard()
    if (data) {
      if (data.weeklyBorrows) weeklyBorrows.value = data.weeklyBorrows
      if (data.topBooks) topBooks.value = data.topBooks
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadReportData)
</script>
