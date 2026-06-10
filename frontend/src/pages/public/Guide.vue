<template>
  <v-container class="py-12">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">Hướng dẫn sử dụng</h1>
    <v-card class="pa-8">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel v-for="g in guides" :key="g.title" :title="g.title" :text="g.content" />
      </v-expansion-panels>
    </v-card>
  </v-container>
</template>

<script setup>
const guides = [
  { title: '1. Đăng nhập hệ thống', content: 'Truy cập trang đăng nhập, nhập email và mật khẩu. Hệ thống hỗ trợ 3 vai trò: Admin (quản trị viên), Librarian (thủ thư), Reader (độc giả).' },
  { title: '2. Tìm kiếm sách', content: 'Vào mục Quản lý sách, sử dụng thanh tìm kiếm để tìm theo tên sách, tác giả, ISBN hoặc thể loại.' },
  { title: '3. Mượn sách', content: 'Vào mục Mượn sách → Tìm độc giả theo mã thẻ → Chọn bản sao sách còn trống → Xác nhận cho mượn. Hệ thống tự động kiểm tra thẻ thư viện và giới hạn mượn.' },
  { title: '4. Trả sách', content: 'Vào mục Trả sách → Nhập mã phiếu mượn → Xác nhận trả. Nếu quá hạn, hệ thống tự động tính phí phạt.' },
  { title: '5. Quản lý độc giả & thẻ thư viện', content: 'Admin/Thủ thư có thể tạo, sửa, xóa hồ sơ độc giả. Cấp thẻ thư viện, gia hạn hoặc khóa thẻ.' },
  { title: '6. Xem báo cáo', content: 'Admin có thể xem báo cáo tổng hợp: thống kê mượn/trả theo thời gian, top sách phổ biến, phí phạt.' },
]
</script>
