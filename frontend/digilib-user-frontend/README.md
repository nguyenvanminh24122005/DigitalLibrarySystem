# DIGILIB Reader Frontend

Giao diện Độc giả dùng React + Vite, style đồng bộ với Admin/Librarian DIGILIB.

## Chạy local

```bash
cd frontend/digilib-user-frontend
npm install
npm run dev
```

Tạo file `.env` nếu cần đổi API Gateway:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Build

```bash
npm run build
```

## API đã kết nối qua API Gateway

- Identity & Report:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/auth/me`
  - `GET /api/readers/me`
  - `PUT /api/readers/me`
  - `GET /api/readers/me/card`
  - `PUT /api/profile/change-password`
- Catalog:
  - `GET /api/books`
  - `GET /api/books/search`
  - `GET /api/books/{id}`
  - `GET /api/books/{id}/availability`
  - `GET /api/books/{id}/copies`
  - `GET /api/categories`
  - `POST /api/users/{userId}/borrowings`
  - `GET /api/users/{userId}/notifications`
  - `PUT /api/users/{userId}/notifications/{id}/read`
  - `PUT /api/users/{userId}/notifications/read-all`
- Circulation:
  - `GET /api/borrow-records`
  - `POST /api/borrow-records`
  - `POST /api/borrow-records/{id}/renew`
  - `POST /api/borrow-records/{id}/return`
  - `GET /api/fines`

Khi độc giả bấm mượn sách, frontend gọi Catalog để tạo thông báo/yêu cầu và gọi Circulation để tạo phiếu mượn, vì vậy màn hình Thủ thư/Admin dùng Circulation API có thể thấy dữ liệu.
