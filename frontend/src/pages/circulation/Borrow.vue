<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h5 font-weight-bold text-grey-darken-4">Mượn sách</h2>
      <p class="text-body-2 text-grey">Tạo phiếu mượn sách mới cho độc giả</p>
    </div>

    <v-row>
      <!-- Form mượn sách -->
      <v-col cols="12" lg="8">
        <v-card class="mb-6">
          <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">
            Thông tin độc giả & Bản sao sách
          </v-card-title>
          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="isValid">
              <!-- Chọn thẻ thư viện -->
              <v-select
                v-model="selectedCardNumber"
                :items="activeCards"
                item-title="cardNumberAndReader"
                item-value="cardNumber"
                label="Chọn Thẻ Thư viện"
                class="mb-4"
                prepend-inner-icon="mdi-card-account-details"
                :rules="[v => !!v || 'Vui lòng chọn thẻ thư viện']"
                @update:model-value="onCardSelected"
              />

              <!-- Chi tiết độc giả (Read-only) -->
              <v-expand-transition>
                <div v-if="selectedCard" class="bg-grey-lighten-4 rounded-lg pa-4 mb-4">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <p class="text-body-2 text-grey">Độc giả:</p>
                      <p class="text-body-1 font-weight-bold">{{ selectedCard.readerName }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <p class="text-body-2 text-grey">Hạn sử dụng thẻ:</p>
                      <p class="text-body-1 font-weight-bold" :class="isExpired(selectedCard.expiredAt) ? 'text-error' : ''">
                        {{ formatDate(selectedCard.expiredAt) }}
                        <span v-if="isExpired(selectedCard.expiredAt)" class="text-caption">(Đã hết hạn)</span>
                      </p>
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>

              <v-divider class="my-4" />

              <!-- Thêm bản sao sách -->
              <h3 class="text-subtitle-2 font-weight-bold mb-3">Chọn sách mượn</h3>
              <v-row align="center">
                <v-col cols="12" sm="8">
                  <v-autocomplete
                    v-model="selectedCopy"
                    :items="availableCopies"
                    item-title="displayName"
                    return-object
                    label="Tìm kiếm Bản sao sách (Mã hoặc Tên sách)"
                    prepend-inner-icon="mdi-magnify"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn
                    color="primary"
                    block
                    prepend-icon="mdi-plus"
                    :disabled="!selectedCopy"
                    @click="addCopyToList"
                  >
                    Thêm vào danh sách
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Danh sách sách đã chọn -->
              <v-table class="mt-4 border rounded-lg" v-if="selectedCopiesList.length > 0">
                <thead>
                  <tr>
                    <th>Mã bản sao</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th class="text-center" style="width: 80px;">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(copy, index) in selectedCopiesList" :key="copy.id">
                    <td class="font-weight-medium" style="font-family: monospace;">{{ copy.copyCode }}</td>
                    <td>{{ copy.bookTitle }}</td>
                    <td class="text-grey">{{ copy.author }}</td>
                    <td class="text-center">
                      <v-btn icon variant="text" color="error" size="small" @click="removeCopyFromList(index)">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div v-else class="text-center py-6 text-grey text-body-2 border border-dashed rounded-lg mt-4">
                Chưa có sách nào được chọn
              </div>

              <v-divider class="my-4" />

              <!-- Thời hạn mượn -->
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="borrowDate"
                    label="Ngày mượn"
                    type="date"
                    :rules="[v => !!v || 'Bắt buộc']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="dueDate"
                    label="Hạn trả dự kiến"
                    type="date"
                    :rules="[v => !!v || 'Bắt buộc']"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-6 pb-6 pt-0">
            <v-spacer />
            <v-btn variant="outlined" @click="resetForm">Hủy bỏ</v-btn>
            <v-btn
              color="primary"
              :loading="submitting"
              :disabled="!isValid || selectedCopiesList.length === 0"
              @click="submitBorrowing"
            >
              Xác nhận mượn sách
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Quy định mượn sách -->
      <v-col cols="12" lg="4">
        <v-card class="mb-6">
          <v-card-title class="text-subtitle-1 font-weight-bold px-6 pt-6 pb-0">Quy định mượn sách</v-card-title>
          <v-card-text class="pa-6">
            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0">
                <template #prepend><v-icon color="primary" class="mr-2">mdi-checkbox-marked-circle-outline</v-icon></template>
                <v-list-item-title class="text-body-2">Số lượng tối đa: <strong>{{ policy.maxBooks }} cuốn</strong> / lần</v-list-item-title>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend><v-icon color="primary" class="mr-2">mdi-checkbox-marked-circle-outline</v-icon></template>
                <v-list-item-title class="text-body-2">Thời gian tối đa: <strong>{{ policy.maxDays }} ngày</strong></v-list-item-title>
              </v-list-item>
              <v-list-item class="px-0">
                <template #prepend><v-icon color="primary" class="mr-2">mdi-checkbox-marked-circle-outline</v-icon></template>
                <v-list-item-title class="text-body-2">Phí phạt quá hạn: <strong>{{ formatCurrency(policy.finePerDay) }}</strong> / ngày</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { circulationApi } from '../../services/circulationApi'
import { reportApi } from '../../services/reportApi'
import { catalogApi } from '../../services/catalogApi'

const router = useRouter()

const formRef = ref(null)
const isValid = ref(false)
const submitting = ref(false)

const activeCards = ref([])
const availableCopies = ref([])
const selectedCardNumber = ref(null)
const selectedCard = ref(null)
const selectedCopy = ref(null)
const selectedCopiesList = ref([])

const borrowDate = ref(new Date().toISOString().slice(0, 10))
const dueDate = ref('')

const policy = ref({ maxBooks: 5, maxDays: 14, finePerDay: 5000 })

const snackbar = ref(false)
const snackbarText = ref('')

// Calculate default due date based on maxDays policy
function updateDefaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + (policy.value.maxDays || 14))
  dueDate.value = date.toISOString().slice(0, 10)
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const isExpired = (exp) => exp ? new Date(exp) < new Date() : false

async function loadData() {
  try {
    // Load active cards
    const cardRes = await reportApi.getCards()
    const cardsList = Array.isArray(cardRes.data) ? cardRes.data : (cardRes.data?.data || [])
    activeCards.value = cardsList
      .filter(c => c.status === 'Active')
      .map(c => ({
        ...c,
        cardNumberAndReader: `${c.cardNumber} - ${c.readerName}`
      }))

    // Load available book copies
    const booksRes = await catalogApi.getBooks()
    const booksList = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.data || [])
    
    const copies = []
    booksList.forEach(book => {
      if (book.copies) {
        book.copies.forEach(copy => {
          if (copy.status === 'Available') {
            copies.push({
              id: copy.id,
              copyCode: copy.copyCode,
              bookId: book.id,
              bookTitle: book.title,
              author: book.author,
              displayName: `${copy.copyCode} - ${book.title}`
            })
          }
        })
      }
    })
    availableCopies.value = copies

    // Load policy
    const policyRes = await circulationApi.getPolicies()
    const policyList = Array.isArray(policyRes.data) ? policyRes.data : (policyRes.data?.data || [])
    if (policyList.length > 0) {
      policy.value = policyList[0]
    }
    updateDefaultDueDate()
  } catch (e) {
    console.error(e)
  }
}

function onCardSelected(val) {
  selectedCard.value = activeCards.value.find(c => c.cardNumber === val) || null
}

function addCopyToList() {
  if (!selectedCopy.value) return
  if (selectedCopiesList.value.some(c => c.id === selectedCopy.value.id)) {
    alert('Bản sao này đã được thêm vào danh sách.')
    return
  }
  if (selectedCopiesList.value.length >= policy.value.maxBooks) {
    alert(`Không được mượn quá số lượng quy định (${policy.value.maxBooks} cuốn).`)
    return
  }
  selectedCopiesList.value.push(selectedCopy.value)
  selectedCopy.value = null
}

function removeCopyFromList(index) {
  selectedCopiesList.value.splice(index, 1)
}

function resetForm() {
  selectedCardNumber.value = null
  selectedCard.value = null
  selectedCopy.value = null
  selectedCopiesList.value = []
  borrowDate.value = new Date().toISOString().slice(0, 10)
  updateDefaultDueDate()
}

async function submitBorrowing() {
  if (selectedCopiesList.value.length === 0) return
  submitting.value = true
  try {
    const payload = {
      cardNumber: selectedCardNumber.value,
      readerId: selectedCard.value.readerId,
      copyCodes: selectedCopiesList.value.map(c => c.copyCode),
      borrowDate: borrowDate.value,
      dueDate: dueDate.value
    }
    await circulationApi.createBorrowing(payload)
    snackbarText.value = 'Tạo phiếu mượn thành công!'
    snackbar.value = true
    setTimeout(() => {
      router.push('/dashboard/borrow-records')
    }, 1000)
  } catch (e) {
    alert(e.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu mượn.')
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>
