# Luồng Nghiệp vụ Hệ thống (API Flow)

Tài liệu này mô tả chi tiết các bước tương tác giữa các service khi xảy ra nghiệp vụ chính: **Mượn sách** và **Trả sách**.

---

## 1. Quy trình Mượn sách (Borrow Flow)

Khi thủ thư thực hiện thao tác cho mượn sách trên giao diện:

```mermaid
sequenceDiagram
    autonumber
    actor Librarian as Thủ thư (UI)
    participant GW as API Gateway (8080)
    participant Circ as Circulation Service (5002)
    participant Id as Identity Service (5003)
    participant Cat as Catalog Service (5001)

    Librarian->>GW: POST /api/v1/circulation/borrowings { readerId, copyCodes }
    GW->>Circ: Chuyển tiếp request
    
    rect rgb(240, 248, 255)
        note right of Circ: Xác thực độc giả & thẻ thư viện
        Circ->>Id: GET /api/cards/validate/{readerId}
        Id-->>Circ: Trả về { isValid: true, status: "Active" }
    end

    loop Mỗi bản sao sách trong danh sách
        rect rgb(255, 245, 238)
            note right of Circ: Kiểm tra & cập nhật trạng thái sách
            Circ->>Cat: GET /api/books/copies/lookup/{copyCode}
            Cat-->>Circ: Trả về thông tin bản sao & sách (Trạng thái: Available)
            
            Circ->>Cat: PUT /api/books/copies/borrow-by-code/{copyCode}
            Cat-->>Circ: Ghi nhận Borrowed thành công
        end

        rect rgb(240, 255, 240)
            note right of Circ: Lưu trữ & đồng bộ sự kiện thống kê
            Circ->>Id: POST /api/events/book-borrowed { readerId, bookId, bookTitle }
            Id-->>Circ: Đã lưu event mượn sách & tăng số lượt mượn
        end
    end

    note over Circ: Lưu BorrowRecord vào database
    Circ-->>GW: Trả về thông tin phiếu mượn
    GW-->>Librarian: Hiển thị thông báo thành công
```

---

## 2. Quy trình Trả sách (Return Flow)

Khi độc giả đem trả sách tại quầy thư viện:

```mermaid
sequenceDiagram
    autonumber
    actor Librarian as Thủ thư (UI)
    participant GW as API Gateway (8080)
    participant Circ as Circulation Service (5002)
    participant Cat as Catalog Service (5001)
    participant Id as Identity Service (5003)

    Librarian->>GW: PUT /api/v1/circulation/borrowings/{id}/return { returnDate }
    GW->>Circ: Chuyển tiếp request
    
    note over Circ: Tìm phiếu mượn & Tính toán số ngày quá hạn
    note over Circ: Số ngày trễ = Ngày trả thực tế - Hạn trả dự kiến
    note over Circ: Phí phạt = Ngày trễ * 5.000 VNĐ

    rect rgb(255, 245, 238)
        note right of Circ: Cập nhật trạng thái bản sao sách
        Circ->>Cat: PUT /api/books/copies/return-by-code/{copyCode}
        Cat-->>Circ: Cập nhật Available thành công
    end

    rect rgb(240, 255, 240)
        note right of Circ: Đồng bộ sự kiện trả sách & phí phạt
        Circ->>Id: POST /api/events/book-returned { readerId, bookId, fineAmount }
        Id-->>Circ: Lưu event trả sách thành công
    end

    opt Nếu phát sinh phí phạt (Fine > 0)
        note over Circ: Lưu/Cộng dồn nợ vào bảng Fines (Trạng thái: Unpaid)
    end

    note over Circ: Cập nhật BorrowRecord thành Returned
    Circ-->>GW: Trả về kết quả phiếu mượn & phí phạt phát sinh
    GW-->>Librarian: Hiển thị kết quả trả sách lên màn hình
```
