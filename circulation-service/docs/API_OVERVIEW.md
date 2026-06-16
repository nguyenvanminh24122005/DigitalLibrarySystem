# Circulation Service API Overview

## Database

Service này dùng đúng 3 bảng theo ER Diagram:

- `BORROW_POLICIES`
- `BORROW_RECORDS`
- `FINES`

`ReturnDate` được để `NULL` khi sách đang ở trạng thái `Borrowed`. Khi trả sách, hệ thống cập nhật `ReturnDate`, chuyển `Status` thành `Returned` và tính `Fine`.

## API chính

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/borrow-policies` | Danh sách chính sách mượn |
| GET | `/api/borrow-policies/current` | Chính sách đang dùng, lấy bản ghi mới nhất |
| POST | `/api/borrow-policies` | Tạo chính sách mượn |
| PUT | `/api/borrow-policies/{id}` | Cập nhật chính sách |
| DELETE | `/api/borrow-policies/{id}` | Xóa chính sách |
| GET | `/api/borrow-records` | Danh sách phiếu mượn/trả |
| GET | `/api/borrow-records/overdue` | Danh sách đang quá hạn |
| GET | `/api/borrow-records/reader/{readerId}` | Lịch sử mượn theo độc giả |
| POST | `/api/borrow-records` | Tạo phiếu mượn |
| POST | `/api/borrow-records/{id}/return` | Trả sách và tính phạt |
| GET | `/api/fines` | Danh sách công nợ/phí phạt |
| GET | `/api/fines/reader/{readerId}` | Phí phạt theo độc giả |
| GET | `/api/fines/reader/{readerId}/debt` | Tổng công nợ chưa thanh toán |
| POST | `/api/fines/{id}/pay` | Thanh toán phí phạt |

## Logic nghiệp vụ

Khi tạo phiếu mượn:

1. Lấy chính sách mượn mới nhất trong `BORROW_POLICIES`.
2. Kiểm tra `CopyCode` có đang được mượn không.
3. Kiểm tra số sách đang mượn của độc giả có vượt `MaxBooks` không.
4. Kiểm tra độc giả còn công nợ chưa thanh toán không.
5. Tạo bản ghi trong `BORROW_RECORDS`, `DueDate = BorrowDate + MaxDays`.

Khi trả sách:

1. Lấy phiếu mượn theo `Id`.
2. Nếu đã `Returned` thì không cho trả lại lần nữa.
3. Tính số ngày quá hạn: `max(0, ReturnDate - DueDate)`.
4. Tính tiền phạt: `OverdueDays * FinePerDay`.
5. Cập nhật `BORROW_RECORDS.Fine`.
6. Nếu có phạt, tạo hoặc cộng dồn vào `FINES` của độc giả.
