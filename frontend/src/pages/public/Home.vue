<template>
  <div>
    <!-- Hero -->
    <div style="background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); min-height: 420px;" class="d-flex align-center">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <h1 class="text-h3 text-md-h2 font-weight-black text-white mb-4">Khám phá tri thức<br/>vô tận</h1>
            <p class="text-subtitle-1 text-blue-lighten-3 mb-8" style="max-width: 480px;">
              Hệ thống quản lý thư viện số hiện đại, giúp bạn dễ dàng tìm kiếm, mượn trả và theo dõi kho tàng kiến thức.
            </p>
            <div class="d-flex ga-3">
              <v-btn color="white" size="large" :to="{ name: 'Login' }">
                <v-icon start>mdi-login</v-icon> Đăng nhập
              </v-btn>
              <v-btn variant="outlined" color="white" size="large" :to="{ name: 'Register' }">
                <v-icon start>mdi-account-plus</v-icon> Đăng ký
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="d-none d-md-flex justify-center">
            <v-icon size="200" color="white" style="opacity: 0.15;">mdi-book-open-page-variant</v-icon>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Features -->
    <v-container class="py-16">
      <h2 class="text-h4 font-weight-bold text-center mb-2">Tính năng nổi bật</h2>
      <p class="text-body-1 text-grey text-center mb-12">Quản lý thư viện chưa bao giờ dễ dàng đến thế</p>
      <v-row>
        <v-col cols="12" md="4" v-for="f in features" :key="f.title">
          <v-card class="text-center pa-8 h-100" variant="outlined">
            <v-avatar :color="f.color" size="64" class="mb-4">
              <v-icon color="white" size="32">{{ f.icon }}</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">{{ f.title }}</h3>
            <p class="text-body-2 text-grey">{{ f.desc }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Stats -->
    <div style="background: #f9fafb;" class="py-16">
      <v-container>
        <v-row>
          <v-col cols="6" md="3" v-for="s in homeStats" :key="s.label" class="text-center">
            <h3 class="text-h3 font-weight-black text-primary">{{ s.value }}</h3>
            <p class="text-body-2 text-grey mt-1">{{ s.label }}</p>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>
const features = [
  { icon: 'mdi-magnify', title: 'Tìm kiếm thông minh', desc: 'Tìm sách theo tên, tác giả, thể loại, ISBN nhanh chóng', color: '#1976D2' },
  { icon: 'mdi-swap-horizontal', title: 'Mượn trả dễ dàng', desc: 'Quy trình mượn trả sách đơn giản, tự động tính phí phạt', color: '#4CAF50' },
  { icon: 'mdi-chart-line', title: 'Báo cáo chi tiết', desc: 'Thống kê toàn diện về hoạt động mượn trả và sách phổ biến', color: '#FF9800' },
]
const homeStats = [
  { value: '12,000+', label: 'Đầu sách' },
  { value: '45,000+', label: 'Bản sao' },
  { value: '5,000+', label: 'Độc giả' },
  { value: '99.9%', label: 'Uptime' },
]
</script>
