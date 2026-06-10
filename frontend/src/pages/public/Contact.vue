<template>
  <v-container class="py-12">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">Liên hệ</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-8">
          <h3 class="text-h6 font-weight-bold mb-4">Thông tin liên hệ</h3>
          <v-list>
            <v-list-item prepend-icon="mdi-map-marker" title="Địa chỉ" subtitle="123 Đường ABC, Quận 1, TP.HCM" />
            <v-list-item prepend-icon="mdi-phone" title="Điện thoại" subtitle="(028) 1234 5678" />
            <v-list-item prepend-icon="mdi-email" title="Email" subtitle="contact@digilib.local" />
            <v-list-item prepend-icon="mdi-clock" title="Giờ làm việc" subtitle="Thứ 2 - Thứ 7: 7:30 - 17:00" />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-8">
          <h3 class="text-h6 font-weight-bold mb-4">Gửi tin nhắn</h3>
          <v-text-field label="Họ tên" class="mb-3" />
          <v-text-field label="Email" type="email" class="mb-3" />
          <v-textarea label="Nội dung" rows="4" class="mb-3" />
          <v-btn color="primary" size="large">Gửi tin nhắn</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
