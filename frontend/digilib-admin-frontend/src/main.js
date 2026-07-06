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
import './digilib-dark.css'

import { applyDigilibTheme } from './utils/digilibTheme'

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
      },
      dark: {
        dark: true,
        colors: {
          primary: '#60a5fa',
          secondary: '#94a3b8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#38bdf8',
          background: '#020617',
          surface: '#0f172a'
        }
      }
    }
  }
})

function syncDigilibTheme() {
  const theme = applyDigilibTheme()

  if (vuetify.theme?.global?.name) {
    vuetify.theme.global.name.value = theme === 'dark' ? 'dark' : 'light'
  }
}

syncDigilibTheme()

window.addEventListener('storage', syncDigilibTheme)
window.addEventListener('focus', syncDigilibTheme)
window.addEventListener('digilib-theme-change', syncDigilibTheme)

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .mount('#app')