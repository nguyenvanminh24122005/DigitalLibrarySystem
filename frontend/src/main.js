import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// --- CẤU HÌNH VUETIFY ---
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Đảm bảo icon MDI hoạt động

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

// --- KHỞI TẠO ỨNG DỤNG ---
const app = createApp(App)

// Khai báo các plugin cho toàn hệ thống
app.use(createPinia()) // Bộ não lưu trữ trạng thái (Token, Role)
app.use(router)        // Trái tim điều hướng chuyển trang
app.use(vuetify)       // Thư viện giao diện UI

// Render ứng dụng
app.mount('#app')