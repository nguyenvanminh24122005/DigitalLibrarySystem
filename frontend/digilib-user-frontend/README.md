# DIGILIB User Frontend

Bộ giao diện User hoàn chỉnh cho thư viện số DIGILIB, gồm dashboard, tìm kiếm sách, sách mới, sách nổi bật, thể loại, chi tiết sách, danh sách bản sao, mượn/trả sách, eBook reader, tài liệu số, thông báo, hồ sơ cá nhân, empty/error/toast states.

## Chạy local

```bash
npm install
npm run dev
```

Mặc định app gọi API Catalog tại:

```env
VITE_CATALOG_API=http://localhost:5002/api
```

Nếu backend của bạn chạy cổng khác, tạo file `.env`:

```env
VITE_CATALOG_API=http://localhost:5002/api
```

## Build production

```bash
npm run build
npm run preview
```

## API đã tích hợp

Frontend đã gọi các API CatalogService sau:

- `GET /api/books`
- `GET /api/books/search`
- `GET /api/books/{id}`
- `GET /api/books/{id}/availability`
- `PUT /api/books/{bookId}/copies/{copyId}/borrow`
- `PUT /api/books/{bookId}/copies/{copyId}/return`

Các phần chưa có backend như yêu thích, lịch sử mượn, tiến độ đọc, tài liệu số, thông báo được lưu tạm bằng `localStorage` hoặc dữ liệu mẫu để bạn demo giao diện không bị lỗi.

## Gắn vào project hiện tại

Bạn có thể copy toàn bộ thư mục `src`, `package.json`, `index.html` vào frontend Vite/React hiện tại. Nếu project đã có sẵn routing/layout thì copy từng page/component tương ứng.
