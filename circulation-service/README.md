<<<<<<< HEAD
# Circulation Service

Vai trò:
- Tạo phiếu mượn
- Trả sách
- Tính phí phạt quá hạn
- Quản lý công nợ
- Danh sách sách quá hạn

Database:
- CirculationDB

Service integration:
- Gọi Identity Service để kiểm tra thẻ độc giả
- Gọi Catalog Service để kiểm tra/cập nhật trạng thái bản sao sách
- Gửi event mượn/trả sang Identity & Report Service

API chính:
- GET /api/borrowings
- POST /api/borrowings
- PUT /api/borrowings/{id}/return
- GET /api/overdue
- GET /api/fines
- PUT /api/fines/{id}/pay

Lưu ý:
- Service này không có frontend riêng.
- Frontend chính nằm ở /frontend.
- API được gọi thông qua /api-gateway.
=======
Circulation Service
>>>>>>> 008f7ce15ecc486308cb288b21edfc3df5064086
