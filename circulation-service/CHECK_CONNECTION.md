# Kiểm tra kết nối Circulation Service

## Chạy backend

```bash
cd backend
npm install
npm run dev
```

## Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

## Kiểm tra

Mở các URL:

```text
http://localhost:5002/health
http://localhost:5173
```

Frontend ưu tiên gọi API Gateway. Nếu Gateway chưa cấu hình route Circulation Service và trả `404`, frontend sẽ hiển thị cảnh báo rồi fallback sang:

```text
http://172.16.14.169:5002
```

Các thao tác thêm độc giả, thêm sách, tạo phiếu mượn và trả sách luôn gọi
backend LAN trực tiếp để cập nhật dữ liệu ngay.

Prefix Circulation Service cần cấu hình trên API Gateway:

```text
/api/v1/circulation
```

## Đăng nhập API Gateway

Frontend đăng nhập qua:

```text
POST /api/v1/identity/login
```

Tài khoản demo:

```text
admin / admin123
librarian / lib123
```
