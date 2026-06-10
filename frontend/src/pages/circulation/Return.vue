<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-grey-darken-4">Trả sách</h2>
      <p class="text-body-2 text-grey">Ghi nhận trả sách và xử lý quá hạn cho độc giả</p>
    </div>

    <v-card class="mb-6">
      <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">
        Tìm kiếm phiếu mượn đang hoạt động
      </v-card-title>
      <v-card-text class="pa-6">
        <v-text-field
          v-model="search"
          placeholder="Nhập mã thẻ, tên độc giả hoặc mã bản sao sách..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="mb-4"
        />

        <v-table v-if="filteredRecords.length > 0">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Mã thẻ</th>
              <th>Độc giả</th>
              <th>Tên sách (Mã bản sao)</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th class="text-center">Quá hạn</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in filteredRecords" :key="rec.id">
              <td class="font-weight-medium">#{{ rec.id }}</td>
              <td style="font-family: monospace;">{{ rec.cardNumber || rec.readerCode }}</td>
              <td>{{ rec.readerName }}</td>
              <td>
                <p class="mb-0 font-weight-medium">{{ rec.bookTitle }}</p>
                <p class="text-caption text-grey mb-0" style="font-family: monospace;">Mã bản sao: {{ rec.copyCode || rec.bookCode }}</p>
              </td>
              <td>{{ formatDate(rec.borrowDate) }}</td>
              <td>{{ formatDate(rec.dueDate) }}</td>
              <td class="text-center">
                <v-chip :color="isOverdue(rec.dueDate) ? 'error' : 'success'" size="small" variant="tonal">
                  {{ isOverdue(rec.dueDate) ? `${getLateDays(rec.dueDate)} ngày` : 'Không' }}
                </v-chip>
              </td>
              <td class="text-end">
                <v-btn color="primary" size="small" @click="selectForReturn(rec)">
                  Trả sách
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-else class="text-center py-8 text-grey text-body-2">
          Không tìm thấy phiếu mượn nào chưa trả phù hợp với từ khóa
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialog xác nhận trả sách -->
    <v-dialog v-model="showDialog" max-width="500" persistent>
      <v-card class="pa-6" v-if="selectedRecord">
        <v-card-title class="text-h6 font-weight-bold px-0 pt-0 pb-4 border-b">
          Xác nhận Trả sách
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div class="mb-4">
            <p class="text-body-2 text-grey mb-1">Độc giả:</p>
            <p class="text-body-1 font-weight-bold">{{ selectedRecord.readerName }} ({{ selectedRecord.cardNumber || selectedRecord.readerCode }})</p>
          </div>
          <div class="mb-4">
            <p class="text-body-2 text-grey mb-1">Tên sách:</p>
            <p class="text-body-1 font-weight-medium">{{ selectedRecord.bookTitle }}</p>
            <p class="text-caption text-grey" style="font-family: monospace;">Mã bản sao: {{ selectedRecord.copyCode || selectedRecord.bookCode }}</p>
          </div>
          <v-row dense>
            <v-col cols="6">
              <p class="text-body-2 text-grey mb-1">Ngày mượn:</p>
              <p class="text-body-1 font-weight-medium">{{ formatDate(selectedRecord.borrowDate) }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-body-2 text-grey mb-1">Hạn trả dự kiến:</p>
              <p class="text-body-1 font-weight-medium">{{ formatDate(selectedRecord.dueDate) }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- Chọn ngày trả -->
          <v-text-field
            v-model="returnDate"
            label="Ngày trả sách thực tế"
            type="date"
            class="mb-4"
            @update:model-value="calculateExpectedFine"
          />

          <!-- Phí phạt dự kiến -->
          <div class="bg-grey-lighten-4 rounded-lg pa-4">
            <v-row dense align="center">
              <v-col cols="6">
                <p class="text-body-2 text-grey">Số ngày quá hạn:</p>
                <p class="text-h6 font-weight-bold" :class="calculatedLateDays > 0 ? 'text-error' : 'text-success'">
                  {{ calculatedLateDays }} ngày
                </p>
              </v-col>
              <v-col cols="6">
                <p class="text-body-2 text-grey">Phí phạt ước tính:</p>
                <p class="text-h6 font-weight-bold" :class="calculatedFine > 0 ? 'text-error' : 'text-success'">
                  {{ formatCurrency(calculatedFine) }}
                </p>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions class="px-0 pb-0 pt-4 border-t">
          <v-spacer />
          <v-btn variant="outlined" @click="showDialog = false">Hủy bỏ</v-btn>
          <v-btn color="primary" :loading="submitting" @click="submitReturn">
            Xác nhận trả
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
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
const records = ref([])
const showDialog = ref(false)
const selectedRecord = ref(null)
const returnDate = ref(new Date().toISOString().slice(0, 10))
const calculatedLateDays = ref(0)
const calculatedFine = ref(0)
const submitting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')

const FINE_PER_DAY = 5000

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const isOverdue = (due) => due ? new Date(due) < new Date(new Date().toISOString().slice(0, 10)) : false

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
  const active = records.value.filter(r => r.status === 'Borrowed' || r.status === 'BORROWED')
  if (!q) return active
  return active.filter(r => 
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

function selectForReturn(rec) {
  selectedRecord.value = rec
  returnDate.value = new Date().toISOString().slice(0, 10)
  calculateExpectedFine()
  showDialog.value = true
}

function calculateExpectedFine() {
  if (!selectedRecord.value || !returnDate.value) return
  const due = new Date(selectedRecord.value.dueDate)
  const ret = new Date(returnDate.value)
  const diffTime = ret - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  calculatedLateDays.value = diffDays > 0 ? diffDays : 0
  calculatedFine.value = calculatedLateDays.value * FINE_PER_DAY
}

async function submitReturn() {
  if (!selectedRecord.value) return
  submitting.value = true
  try {
    // Wait! Let's pass the returnDate in body if API requires it
    await circulationApi.returnBorrowing(selectedRecord.value.id, {
      returnDate: returnDate.value
    })
    snackbarText.value = calculatedLateDays.value > 0 
      ? `Trả sách thành công! Quá hạn ${calculatedLateDays.value} ngày, phát sinh phí phạt ${formatCurrency(calculatedFine.value)}.`
      : 'Trả sách thành công!'
    snackbar.value = true
    showDialog.value = false
    await loadRecords()
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi ghi nhận trả sách.')
  } finally {
    submitting.value = false
  }
}

onMounted(loadRecords)
</script>
