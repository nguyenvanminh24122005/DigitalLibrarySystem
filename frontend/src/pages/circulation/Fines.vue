<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-grey-darken-4">Quản lý Phí phạt / Công nợ</h2>
      <p class="text-body-2 text-grey">Theo dõi và thu phí phạt quá hạn từ độc giả</p>
    </div>

    <v-card>
      <v-card-text class="pa-6">
        <v-text-field
          v-model="search"
          placeholder="Tìm theo tên độc giả, mã thẻ..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="mb-4"
        />

        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Độc giả</th>
              <th>Số thẻ</th>
              <th>Số tiền phạt</th>
              <th>Trạng thái</th>
              <th>Cập nhật cuối</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fine in filteredFines" :key="fine.id">
              <td>#{{ fine.id }}</td>
              <td class="font-weight-medium">{{ fine.readerName }}</td>
              <td style="font-family: monospace;">{{ fine.cardNumber || fine.readerCode }}</td>
              <td class="font-weight-bold text-error">
                {{ formatCurrency(fine.amount) }}
              </td>
              <td>
                <v-chip :color="fine.status === 'Paid' || fine.status === 'PAID' ? 'success' : 'error'" size="small" variant="tonal">
                  {{ fine.status === 'Paid' || fine.status === 'PAID' ? 'Đã nộp' : 'Chưa nộp' }}
                </v-chip>
              </td>
              <td>{{ formatDate(fine.updatedAt) }}</td>
              <td class="text-end">
                <v-btn
                  v-if="fine.status !== 'Paid' && fine.status !== 'PAID' && fine.amount > 0"
                  color="success"
                  size="small"
                  @click="settleFine(fine)"
                >
                  Thu tiền
                </v-btn>
                <span v-else class="text-grey text-body-2">—</span>
              </td>
            </tr>
            <tr v-if="filteredFines.length === 0">
              <td colspan="7" class="text-center text-grey py-8">Không có khoản phí phạt nào phù hợp</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Snackbar thông báo -->
    <v-snackbar v-model="snackbar" color="success" timeout="3000">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Đóng</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { circulationApi } from '../../services/circulationApi'

const search = ref('')
const fines = ref([])
const snackbar = ref(false)
const snackbarText = ref('')

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const filteredFines = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return fines.value
  return fines.value.filter(f => 
    f.readerName?.toLowerCase().includes(q) ||
    f.cardNumber?.toLowerCase().includes(q) ||
    f.readerCode?.toLowerCase().includes(q)
  )
})

async function loadFines() {
  try {
    const { data } = await circulationApi.getFines()
    fines.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error(e)
  }
}

async function settleFine(fine) {
  if (confirm(`Xác nhận thu phí phạt ${formatCurrency(fine.amount)} của độc giả "${fine.readerName}"?`)) {
    try {
      // In node implementation, we pay by readerId or fineId.
      // Let's support both. In Node routes, it is: PUT /debts/:readerId/pay
      // In EF Core implementation we'll match fine.id or fine.readerId.
      await circulationApi.payFine(fine.readerId || fine.id)
      snackbarText.value = 'Thu phí phạt thành công!'
      snackbar.value = true
      await loadFines()
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi xử lý thanh toán.')
    }
  }
}

onMounted(loadFines)
</script>
