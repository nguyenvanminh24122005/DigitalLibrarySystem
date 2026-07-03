import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import './assets/styles.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: { defaultSet: 'mdi' },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#0ea5e9',
          background: '#f8fafc',
          surface: '#ffffff'
        }
      }
    }
  }
})

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app')
