<template>
  <v-container class="py-12">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">Giới thiệu</h1>
    <v-card class="pa-8">
      <h2 class="text-h5 font-weight-bold mb-4">Hệ thống Quản lý Thư viện Số — DigiLib</h2>
      <p class="text-body-1 text-grey-darken-2 mb-4">
        DigiLib là hệ thống quản lý thư viện số hiện đại, được xây dựng theo kiến trúc microservices. 
        Hệ thống giúp quản lý toàn bộ quy trình hoạt động của thư viện: từ quản lý danh mục sách, mượn/trả sách, 
        đến quản lý độc giả và báo cáo thống kê.
      </p>
      <h3 class="text-h6 font-weight-bold mb-3 mt-6">Kiến trúc hệ thống</h3>
      <v-list>
        <v-list-item prepend-icon="mdi-bookshelf" title="Catalog Service" subtitle="Quản lý sách, thể loại, bản sao sách, tìm kiếm" />
        <v-list-item prepend-icon="mdi-swap-horizontal" title="Circulation Service" subtitle="Xử lý mượn sách, trả sách, phí phạt, công nợ" />
        <v-list-item prepend-icon="mdi-account-key" title="Identity & Report Service" subtitle="Đăng nhập JWT, người dùng, độc giả, thẻ thư viện, báo cáo" />
      </v-list>
      <h3 class="text-h6 font-weight-bold mb-3 mt-6">Công nghệ sử dụng</h3>
      <div class="d-flex flex-wrap ga-2">
        <v-chip v-for="t in techs" :key="t" color="primary" variant="tonal">{{ t }}</v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
const techs = ['Vue 3', 'Vuetify 3', 'ASP.NET Core 8', 'SQL Server', 'Docker', 'JWT', 'YARP Gateway', 'Swagger']
</script>
