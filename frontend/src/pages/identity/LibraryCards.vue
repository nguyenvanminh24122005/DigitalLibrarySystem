<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-4">Thẻ Thư viện</h2>
        <p class="text-body-2 text-grey">Quản lý thẻ thư viện cho độc giả</p>
      </div>
    </div>
    <v-card>
      <v-table>
        <thead><tr><th>Mã thẻ</th><th>Độc giả</th><th>Trạng thái</th><th>Ngày cấp</th><th>Hạn thẻ</th><th class="text-end">Thao tác</th></tr></thead>
        <tbody>
          <tr v-for="card in cards" :key="card.id">
            <td class="font-weight-medium" style="font-family: monospace;">{{ card.cardNumber }}</td>
            <td>{{ card.readerName }}</td>
            <td><v-chip :color="cardColor(card.status)" size="small" variant="tonal">{{ card.status }}</v-chip></td>
            <td>{{ formatDate(card.issuedAt) }}</td>
            <td>{{ formatDate(card.expiredAt) }}</td>
            <td class="text-end">
              <v-btn v-if="card.status !== 'Locked'" size="small" variant="text" color="warning" @click="lock(card.id)">Khóa</v-btn>
              <v-btn size="small" variant="text" color="primary" @click="renew(card.id)">Gia hạn</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportApi } from '../../services/reportApi'

const cards = ref([])
const cardColor = (s) => ({ Active: 'success', Expired: 'error', Locked: 'warning' }[s] || 'grey')
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

async function load() {
  try { const { data } = await reportApi.getCards(); cards.value = Array.isArray(data) ? data : (data.data || []) } catch {}
}
async function lock(id) { try { await reportApi.lockCard(id); await load() } catch (e) { alert(e.response?.data?.message || 'Lỗi') } }
async function renew(id) { try { await reportApi.renewCard(id); await load() } catch (e) { alert(e.response?.data?.message || 'Lỗi') } }
onMounted(load)
</script>
