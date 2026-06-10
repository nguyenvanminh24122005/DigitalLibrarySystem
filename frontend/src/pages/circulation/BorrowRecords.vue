<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-4">Danh sách Phiếu mượn</h2>
        <p class="text-body-2 text-grey">Quản lý và tra cứu lịch sử mượn trả sách</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/dashboard/borrow">Mượn sách mới</v-btn>
    </div>

    <v-card>
      <v-card-text class="pa-6">
        <v-row class="mb-4" dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              placeholder="Tìm theo độc giả, thẻ, sách, bản sao..."
              prepend-inner-icon="mdi-magnify"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="statusFilter"
              :items="['Tất cả', 'Đang mượn', 'Đã trả', 'Quá hạn']"
              label="Trạng thái"
              hide-details
            />
          </v-col>
        </v-row>

        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Độc giả</th>
              <th>Thẻ</th>
              <th>Sách / Bản sao</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th>Phí phạt</th>
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
              <td>{{ formatDate(rec.returnDate) }}</td>
              <td>
                <v-chip :color="statusColor(rec)" size="small" variant="tonal">
                  {{ statusText(rec) }}
                </v-chip>
              </td>
              <td class="font-weight-bold" :class="rec.fine > 0 ? 'text-error' : ''">
                {{ rec.fine > 0 ? formatCurrency(rec.fine) : '—' }}
              </td>
            </tr>
            <tr v-if="filteredRecords.length === 0">
              <td colspan="9" class="text-center text-grey py-8">Không có dữ liệu phiếu mượn</td>
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
const statusFilter = ref('Tất cả')
const records = ref([])

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const isOverdue = (rec) => {
  if (rec.returnDate || rec.status === 'Returned' || rec.status === 'RETURNED') return false
  return new Date(rec.dueDate) < new Date(new Date().toISOString().slice(0, 10))
}

function statusColor(rec) {
  if (rec.status === 'Returned' || rec.status === 'RETURNED') return 'success'
  if (isOverdue(rec)) return 'error'
  return 'warning'
}

function statusText(rec) {
  if (rec.status === 'Returned' || rec.status === 'RETURNED') return 'Đã trả'
  if (isOverdue(rec)) return 'Quá hạn'
  return 'Đang mượn'
}

const filteredRecords = computed(() => {
  let list = records.value
  
  // Filter by status
  if (statusFilter.value === 'Đang mượn') {
    list = list.filter(r => (r.status === 'Borrowed' || r.status === 'BORROWED') && !isOverdue(r))
  } else if (statusFilter.value === 'Đã trả') {
    list = list.filter(r => r.status === 'Returned' || r.status === 'RETURNED')
  } else if (statusFilter.value === 'Quá hạn') {
    list = list.filter(r => isOverdue(r))
  }

  // Filter by search
  const q = search.value.toLowerCase().trim()
  if (!q) return list

  return list.filter(r => 
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
    const { data } = await circulationApi.getBorrowings()
    records.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadRecords)
</script>
