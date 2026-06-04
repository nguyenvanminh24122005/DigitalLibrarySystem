# Circulation Service

Ứng dụng quản lý mượn trả sách cho đề tài thư viện số, gồm:

- `backend/`: REST API Express, lưu dữ liệu trong các file JSON.
- `frontend/`: Vue 3 + Vite + Bootstrap 5, gọi backend bằng axios.

Dữ liệu ban đầu để trống. Người dùng nhập độc giả, sách và phiếu mượn trực tiếp từ giao diện.

## Chạy backend

```bash
cd backend
npm install
npm run dev
```

Backend chạy tại:

```text
http://localhost:5002
```

Health check:

```text
http://localhost:5002/health
```

Backend lắng nghe trên `0.0.0.0`, vì vậy API Gateway hoặc máy khác trong cùng mạng LAN có thể gọi:

```text
http://<IP_LAN>:5002
```

## Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

Frontend đọc URL API Gateway từ `frontend/.env`:

```env
VITE_API_GATEWAY_URL=https://starry-glutinous-ultimatum.ngrok-free.dev
```

Mọi request axios của frontend ưu tiên gửi qua API Gateway với prefix:

```text
/api/v1/circulation
```

Frontend đăng nhập API Gateway qua:

```text
POST /api/v1/identity/login
```

Tài khoản demo:

```text
admin / admin123
librarian / lib123
```

Token JWT được lưu vào `localStorage` và tự động gắn vào header
`Authorization: Bearer <token>` của request Circulation Service.

API Gateway cần forward các route `/api/v1/circulation/readers`,
`/api/v1/circulation/books`, `/api/v1/circulation/borrow`,
`/api/v1/circulation/return`, `/api/v1/circulation/debts`,
`/api/v1/circulation/records`, `/api/v1/circulation/overdue` và
`/api/v1/circulation/stats` đến Circulation Service.

Nếu Gateway chưa cấu hình route và trả `404`, frontend hiển thị cảnh báo rồi
tạm thời fallback về backend LAN `http://172.16.14.169:5002/api`.

Các thao tác thêm độc giả, thêm sách, tạo phiếu mượn và trả sách được gửi
trực tiếp đến backend LAN để dữ liệu Circulation Service được cập nhật ngay.

Máy khác trong cùng mạng LAN có thể truy cập:

```text
http://<IP_LAN>:5173
```

## API chính

```text
GET  /health
GET  /api/readers
POST /api/readers
GET  /api/books
POST /api/books
POST /api/borrow
PUT  /api/return/:id
GET  /api/debts
```

Frontend còn sử dụng các API hỗ trợ dashboard:

```text
GET  /api/records
GET  /api/overdue
GET  /api/stats
PUT  /api/debts/:readerId/pay
```
