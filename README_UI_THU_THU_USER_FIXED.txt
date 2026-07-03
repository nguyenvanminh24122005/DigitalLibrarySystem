BẢN SỬA GIAO DIỆN THỦ THƯ + ĐỘC GIẢ

Phần admin được giữ nguyên.
Đã làm lại:
- frontend/digilib-librarian-frontend
- frontend/digilib-user-frontend

Thủ thư:
- Dashboard tổng quan
- Mượn sách
- Trả sách
- Bản sao & tồn kho
- Độc giả
- Quá hạn
- Lịch sử
- Phí phạt

Độc giả:
- Tổng quan
- Tra cứu sách
- Sách đang mượn
- Lịch sử mượn
- Hồ sơ độc giả

Luồng chuẩn:
Admin tạo sách/bản sao/độc giả.
Thủ thư lập phiếu mượn bằng mã bản sao Available.
Circulation tạo phiếu mượn và gọi Catalog đổi bản sao sang Borrowed.
Thủ thư trả sách thì bản sao đổi lại Available.
Độc giả xem sách, sách đang mượn và lịch sử theo mã thẻ.

Lệnh chạy:
cd D:\tailieu\FullStack\DigitalLibrarySystem_full_fixed

docker rm -f mssql-db catalog-service circulation-service identity-report-service api-gateway digilib-admin-frontend digilib-librarian-frontend digilib-user-frontend 2>$null

docker compose up -d --build --force-recreate

Mở:
Admin:    http://localhost:5173
Thủ thư:  http://localhost:5174
Độc giả:  http://localhost:5175
Catalog Swagger: http://localhost:5001/swagger
