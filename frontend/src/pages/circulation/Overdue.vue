<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-grey-darken-4">Sách quá hạn</h2>
      <p class="text-body-2 text-grey">Danh sách các độc giả đang giữ sách quá hạn cần liên hệ thu hồi</p>
    </div>

    <v-card>
      <v-card-text class="pa-6">
        <v-text-field
          v-model="search"
          placeholder="Tìm theo độc giả, thẻ, sách..."
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
              <th>Sách / Bản sao</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th class="text-center">Số ngày trễ</th>
              <th class="text-end">Phí phạt tạm tính</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in filteredRecords" :key="rec.id">
              <td>#{{ rec.id }}</td>
              <td class="font-weight-medium">{{ rec.readerName }}</td>
              <td style="font-family: monospace;">{{ rec.cardNumber || rec.readerCode }}</td>
              <td>
                <p class="mb-0 font-weight-medium text-body-2">{{ rec.bookTitle }}</p>
                <p class="text-caption text-grey mb-0" style="font-family: monospace;">Mã bản sao: {{ rec.copyCode || rec.bookCode }}</p>
              </td>
              <td>{{ formatDate(rec.borrowDate) }}</td>
              <td>{{ formatDate(rec.dueDate) }}</td>
              <td class="text-center">
                <v-chip color="error" size="small" variant="tonal" class="font-weight-bold">
                  {{ rec.lateDays || getLateDays(rec.dueDate) }} ngày
                </v-chip>
              </td>
              <td class="text-end font-weight-bold text-error">
                {{ formatCurrency((rec.lateDays || getLateDays(rec.dueDate)) * FINE_PER_DAY) }}
              </td>
            </tr>
            <tr v-if="filteredRecords.length === 0">
              <td colspan="8" class="text-center text-grey py-8">Không có sách quá hạn nào hiện tại</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { circulationApi } from '../../services/circulationApi'

const search = ref('')
const records = ref([])
const FINE_PER_DAY = 5000

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

function getLateDays(due) {
  if (!due) return 0
  const d1 = new Date(due)
  const d2 = new Date(new Date().toISOString().slice(0, 10))
  const diffTime = d2 - d1
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

const filteredRecords = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return records.value
  return records.value.filter(r => 
    r.readerName?.toLowerCase().includes(q) ||
    r.cardNumber?.toLowerCase().includes(q) ||
    r.readerCode?.toLowerCase().includes(q) ||
    r.copyCode?.toLowerCase().includes(q) ||
    r.bookCode?.toLowerCase().includes(q) ||
    r.bookTitle?.toLowerCase().includes(q)
  )
})

async function loadRecords() {
  try {
    const { data } = await circulationApi.getOverdue()
    // Overdue returns overdue list
    records.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadRecords)
</script>
