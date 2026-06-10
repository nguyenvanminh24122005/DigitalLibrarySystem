<template>
  <div>
    <!-- Public Navbar -->
    <v-app-bar color="white" elevation="1" density="comfortable">
      <v-container class="d-flex align-center py-0">
        <router-link to="/" class="d-flex align-center text-decoration-none">
          <v-icon color="primary" size="32" class="mr-2">mdi-book-open-page-variant</v-icon>
          <span class="text-h6 font-weight-bold text-primary">DigiLib</span>
        </router-link>
        <v-spacer />
        <div class="d-none d-md-flex align-center ga-1">
          <v-btn variant="text" :to="{ name: 'Home' }" color="grey-darken-2">Trang chủ</v-btn>
          <v-btn variant="text" :to="{ name: 'About' }" color="grey-darken-2">Giới thiệu</v-btn>
          <v-btn variant="text" :to="{ name: 'Guide' }" color="grey-darken-2">Hướng dẫn</v-btn>
          <v-btn variant="text" :to="{ name: 'Contact' }" color="grey-darken-2">Liên hệ</v-btn>
          <v-divider vertical class="mx-2" />
          <v-btn variant="outlined" color="primary" :to="{ name: 'Login' }">Đăng nhập</v-btn>
          <v-btn variant="flat" color="primary" :to="{ name: 'Register' }">Đăng ký</v-btn>
        </div>
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
      </v-container>
    </v-app-bar>

    <!-- Mobile drawer -->
    <v-navigation-drawer v-model="drawer" temporary location="right" class="d-md-none">
      <v-list nav>
        <v-list-item :to="{ name: 'Home' }" prepend-icon="mdi-home" title="Trang chủ" />
        <v-list-item :to="{ name: 'About' }" prepend-icon="mdi-information" title="Giới thiệu" />
        <v-list-item :to="{ name: 'Guide' }" prepend-icon="mdi-book-open" title="Hướng dẫn" />
        <v-list-item :to="{ name: 'Contact' }" prepend-icon="mdi-email" title="Liên hệ" />
        <v-divider class="my-2" />
        <v-list-item :to="{ name: 'Login' }" prepend-icon="mdi-login" title="Đăng nhập" />
        <v-list-item :to="{ name: 'Register' }" prepend-icon="mdi-account-plus" title="Đăng ký" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer color="grey-darken-4" class="pa-6">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" class="mr-2">mdi-book-open-page-variant</v-icon>
              <span class="text-h6 font-weight-bold text-white">DigiLib</span>
            </div>
            <p class="text-grey-lighten-1 text-body-2">
              Hệ thống quản lý thư viện số hiện đại, giúp bạn dễ dàng tìm kiếm, mượn trả và theo dõi kho tàng kiến thức.
            </p>
          </v-col>
          <v-col cols="12" md="4">
            <h4 class="text-white mb-3">Liên kết</h4>
            <div class="d-flex flex-column ga-1">
              <router-link to="/" class="text-grey-lighten-1 text-decoration-none text-body-2">Trang chủ</router-link>
              <router-link to="/about" class="text-grey-lighten-1 text-decoration-none text-body-2">Giới thiệu</router-link>
              <router-link to="/guide" class="text-grey-lighten-1 text-decoration-none text-body-2">Hướng dẫn</router-link>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <h4 class="text-white mb-3">Liên hệ</h4>
            <p class="text-grey-lighten-1 text-body-2">Email: contact@digilib.local</p>
            <p class="text-grey-lighten-1 text-body-2">Điện thoại: (028) 1234 5678</p>
          </v-col>
        </v-row>
        <v-divider class="my-4" color="grey-darken-2" />
        <p class="text-center text-grey text-body-2">© 2026 DigiLib — Hệ thống quản lý thư viện số</p>
      </v-container>
    </v-footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)
</script>
