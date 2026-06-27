# DIGILIB Admin Frontend

Code giao diện Admin cho đề tài **Hệ thống quản lý thư viện số**.

## Chức năng đã có

- Đăng nhập Admin mock JWT
- Layout Admin + sidebar đúng phân quyền đã thống nhất
- Tổng quan hệ thống
- Sách
- Thêm sách mới
- Chi tiết sách
- Bản sao & Tồn kho
- Thể loại
- Tác giả
- Nhà xuất bản
- Người dùng
- Thêm người dùng
- Độc giả
- Vai trò & Phân quyền
- Báo cáo thống kê
- Nhật ký hệ thống
- Cài đặt hệ thống
- Hồ sơ cá nhân

## Chạy project

```bash
npm install
npm run dev
```

Mở trình duyệt tại:

```bash
http://localhost:5173
```

Tài khoản mock:

```text
admin@digilib.edu.vn
123456
```

## Kết nối API thật

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sửa API Gateway:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Các route API đã chuẩn bị trong `src/services/api.js`.

## Menu Admin

Admin chỉ chứa các phần:

- Catalog Service - Nhóm 1
- Identity & Report Service - Nhóm 3
- Báo cáo tổng hợp
- Cài đặt hệ thống

Không đưa nghiệp vụ chi tiết của Nhóm 2 vào Admin như tạo phiếu mượn, trả sách, công nợ/phí phạt. Các phần đó nên để trong giao diện Thủ thư.
