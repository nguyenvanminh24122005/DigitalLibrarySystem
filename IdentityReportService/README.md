# DigiLib — Hệ thống Quản lý Thư viện Số

Hệ thống quản lý thư viện số DigiLib được thiết kế và phát triển theo kiến trúc **Microservices** phân tán, giúp tin học hóa toàn diện quy trình quản trị danh mục sách, quản lý độc giả, xử lý mượn trả và công nợ quá hạn của thư viện.

---

## 1. Giới thiệu Đề tài
Đề tài xây dựng một hệ thống quản lý thư viện số hiện đại cho phép:
- Quản lý kho sách (sách, thể loại, tình trạng vật lý các bản sao sách).
- Quản lý độc giả (Readers) và vòng đời thẻ thư viện (cấp mới, khóa, gia hạn).
- Thực hiện quy trình mượn/trả sách (kiểm tra hạn ngạch mượn, cập nhật trạng thái sách, tự động tính phí phạt trễ hạn).
- Theo dõi công nợ, đóng phạt và báo cáo thống kê hoạt động trực quan.

---

## 2. Kiến trúc Tổng quan
Hệ thống sử dụng mô hình **Microservices** giao tiếp thông qua **API Gateway**:

```text
       [ Vue 3 Client (Port 3000) ]
                    │
                    ▼ (HTTP Requests)
       [ API Gateway YARP (Port 8080) ]
         /          │           \
        /           │            \
       ▼            ▼             ▼
[ Catalog ]   [ Circulation ]   [ Identity & Report ]
(Port 5001)     (Port 5002)         (Port 5003)
    │               │                   │
    ▼               ▼                   ▼
(CatalogDB)   (CirculationDB)      (IdentityDB)
           [ SQL Server (Port 1433) ]
```

---

## 3. Phân công Service & Database
Hệ thống được chia thành 3 dịch vụ backend riêng biệt cùng 3 cơ sở dữ liệu riêng:
- **N1: Catalog Service** - Cơ sở dữ liệu: `CatalogDB`
  - Quản lý danh mục sách, thể loại, bản sao sách và tình trạng vật lý.
- **N2: Circulation Service** - Cơ sở dữ liệu: `CirculationDB`
  - Xử lý các quy trình mượn, trả sách, tính phí phạt quá hạn và thu nợ.
- **N3: Identity & Report Service** - Cơ sở dữ liệu: `IdentityDB`
  - Đăng ký, đăng nhập JWT, quản lý thẻ thư viện, tiếp nhận sự kiện mượn/trả để vẽ dashboard báo cáo.

---

## 4. Công nghệ Sử dụng
- **Frontend**: Vue 3 (Vite), Vuetify 3 (Material Design), Pinia State Management, Vue Router, Axios.
- **API Gateway**: ASP.NET Core 8.0 với **YARP (Yet Another Reverse Proxy)**.
- **Backend Services**: ASP.NET Core 8.0, Entity Framework Core (EF Core).
- **Database**: Microsoft SQL Server (3 Database độc lập chạy trên cùng 1 Instance).
- **Containerization**: Docker & Docker Compose.

---

## 5. Cấu trúc Thư mục
```text
digital-library-system/
├── api-gateway/            # Gateway điều phối requests (YARP)
├── catalog-service/        # Dịch vụ danh mục sách (N1)
│   └── BackEnd/            # Cốc nguồn C# .NET
├── circulation-service/    # Dịch vụ mượn trả & công nợ (N2)
│   └── backend/            # Cốc nguồn C# .NET
├── identity-service/       # Dịch vụ người dùng & báo cáo (N3)
│   └── backend/            # Cốc nguồn C# .NET (IdentityReportService)
├── frontend/               # Giao diện Vue 3 duy nhất của toàn hệ thống
├── design/                 # Folder chứa UI design gốc
├── docs/                   # Tài liệu kiến trúc chi tiết
├── docker-compose.yml      # Cấu hình container chạy toàn bộ hệ thống
├── .env.example            # Biến môi trường mẫu
└── README.md               # Tài liệu hướng dẫn chính
```

---

## 6. Cách chạy bằng Docker Compose

### Bước 1: Tạo tệp `.env`
Sao chép `.env.example` thành `.env` tại thư mục gốc:
```bash
cp .env.example .env
```

### Bước 2: Build và khởi động các container
Chạy Docker Compose để tự động build và chạy toàn bộ dịch vụ:
```bash
docker compose up -d --build
```

---

## 7. Tài khoản Demo
Dữ liệu mẫu đã được seed sẵn vào cơ sở dữ liệu với các tài khoản sau:

| Vai trò | Email đăng nhập | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Admin** (Quản trị viên) | `admin@smartlib.local` | `Admin@123` |
| **Librarian** (Thủ thư) | `librarian@smartlib.local` | `Librarian@123` |
| **Reader** (Độc giả) | `reader@smartlib.local` | `Reader@123` |

---

## 8. URL sau khi chạy
Sau khi toàn bộ dịch vụ khởi động thành công, các URL hoạt động như sau:
- **Giao diện chính**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **Swagger UI** (Hỗ trợ kiểm thử API):
  - Catalog Service API: [http://localhost:5001/swagger](http://localhost:5001/swagger)
  - Circulation Service API: [http://localhost:5002/swagger](http://localhost:5002/swagger)
  - Identity Service API: [http://localhost:5003/swagger](http://localhost:5003/swagger)

---

## 9. Luồng Mượn sách (Borrow Flow)
1. Thủ thư mở giao diện **Mượn sách** trên frontend.
2. Hệ thống gọi qua API Gateway đến `Identity Service` để xác nhận thẻ độc giả có hợp lệ/đang kích hoạt hay không.
3. Hệ thống gọi qua API Gateway đến `Catalog Service` để kiểm tra bản sao sách có mã `CopyCode` cần mượn có sẵn sàng (`Available`) không.
4. `Catalog Service` đánh dấu bản sao sách là `Borrowed`.
5. `Circulation Service` ghi nhận một `BorrowRecord` mới với ngày mượn và hạn trả dự kiến.
6. `Circulation Service` gửi sự kiện `book-borrowed` sang `Identity Service` để cập nhật nhật ký hoạt động và số liệu thống kê.

---

## 10. Luồng Trả sách (Return Flow)
1. Thủ thư mở giao diện **Trả sách** trên frontend và tìm các phiếu mượn chưa trả.
2. Khi xác nhận trả sách, `Circulation Service` tính toán số ngày trễ hạn so với hạn trả dự kiến.
3. Nếu trễ hạn, hệ thống tính phí phạt phát sinh (5.000 VNĐ / ngày trễ) và cập nhật/tạo mới công nợ quá hạn trong bảng `Fines`.
4. `Circulation Service` gọi sang `Catalog Service` chuyển trạng thái bản sao sách về lại `Available`.
5. `Circulation Service` gửi sự kiện `book-returned` sang `Identity Service` để lưu nhật ký trả và phí phạt.

---

## 11. Lưu ý Quan trọng
- **Frontend chính** duy nhất nằm ở thư mục `/frontend` tại thư mục gốc. **Không còn bất kỳ frontend riêng lẻ nào** trong từng dịch vụ con (đã dọn sạch legacy FrontEnd của các dịch vụ để tránh nhầm lẫn).
- Toàn bộ kết nối API từ frontend bắt buộc đi qua **API Gateway** chạy tại port `8080`.