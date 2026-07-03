import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import './assets/styles.css'
import App from './App.vue'
import router from './router'
import './assets/librarian-typography.css'

createApp(App).use(router).mount('#app')
