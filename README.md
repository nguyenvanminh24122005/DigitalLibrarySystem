# DigiLib — Hệ thống Quản lý Thư viện Số (Microservices)

Hệ thống quản lý thư viện số DigiLib được phát triển dựa trên kiến trúc **Microservices** phân tán. Hệ thống tích hợp đầy đủ quy trình quản lý danh mục sách, quản lý độc giả, xử lý mượn trả và công nợ phạt quá hạn, cùng trang tổng quan báo cáo số liệu trực quan.

---

## 1. Sơ đồ Kiến trúc & Luồng Dữ liệu

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

## 2. Công nghệ Sử dụng

* **Core Backend Services**: ASP.NET Core 8.0 Web API, Entity Framework Core (EF Core).
* **API Gateway**: ASP.NET Core 8.0 với **YARP (Yet Another Reverse Proxy)**.
* **Frontend**: Vue 3, Vuetify 3 (Material Design), Pinia State Management, Vue Router, Axios.
* **Database**: Microsoft SQL Server (3 Database độc lập trên cùng 1 Instance).
* **Containerization**: Docker & Docker Compose.

---

## 3. Cấu trúc Dự án

```text
digital-library-system/
│
├── api-gateway/            # API Gateway YARP điều phối requests
├── catalog-service/        # Dịch vụ quản lý đầu sách, thể loại, bản sao sách
├── circulation-service/    # Dịch vụ quản lý mượn/trả sách, phí phạt quá hạn
├── identity-service/       # Dịch vụ quản lý người dùng, thẻ thư viện, báo cáo
├── frontend/               # Giao diện quản lý chính duy nhất (Vue 3 + Vuetify)
├── docs/                   # Tài liệu chi tiết (Kiến trúc, DB, Luồng API, Deploy VPS)
├── docker-compose.yml      # File cấu hình khởi chạy toàn bộ hệ thống bằng Docker
└── .env.example            # Cấu hình biến môi trường mẫu
```

---

## 4. Hướng dẫn Khởi chạy Nhanh bằng Docker Compose

Yêu cầu máy tính đã cài đặt **Docker Desktop**.

### Bước 1: Tạo cấu hình môi trường
Sao chép file `.env.example` thành `.env` tại thư mục gốc của dự án:

```bash
cp .env.example .env
```

*Lưu ý: Mặc định file cấu hình mẫu đã được thiết lập sẵn các giá trị tối ưu để chạy trực tiếp trên môi trường local qua Docker.*

### Bước 2: Khởi động hệ thống
Chạy lệnh sau tại thư mục gốc để Docker tự động build mã nguồn và khởi chạy các container:

```bash
docker compose up -d --build
```

### Bước 3: Truy cập hệ thống
Sau khi các container ở trạng thái `Running` / `Healthy`:
* **Giao diện quản trị (Vite Web App)**: [http://localhost:3000](http://localhost:3000)
* **API Gateway**: [http://localhost:8080](http://localhost:8080)
* **Swagger API UI (Dùng để kiểm thử API)**:
  * Catalog API: [http://localhost:5001/swagger](http://localhost:5001/swagger)
  * Circulation API: [http://localhost:5002/swagger](http://localhost:5002/swagger)
  * Identity API: [http://localhost:5003/swagger](http://localhost:5003/swagger)

---

## 5. Tài khoản Đăng nhập Mặc định

Hệ thống đã tự động seed dữ liệu mẫu cho tài khoản quản trị và độc giả:

| Vai trò | Email đăng nhập | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Admin** (Quản trị viên) | `admin@smartlib.local` | `Admin@123` |
| **Librarian** (Thủ thư) | `librarian@smartlib.local` | `Librarian@123` |
| **Reader** (Độc giả) | `reader@smartlib.local` | `Reader@123` |

---

## 6. Tài liệu Chi tiết trong thư mục `docs/`

Để tìm hiểu sâu hơn về thiết kế hệ thống, hãy tham khảo các hướng dẫn cụ thể sau:
* 🗺️ [Kiến trúc chi tiết hệ thống](file:///d:/hochanhi3/fullstack/btmoi/repo/docs/architecture.md)
* 🗄️ [Thiết kế Cơ sở Dữ liệu & ERD](file:///d:/hochanhi3/fullstack/btmoi/repo/docs/database.md)
* 🔄 [Luồng nghiệp vụ Mượn/Trả chi tiết](file:///d:/hochanhi3/fullstack/btmoi/repo/docs/api-flow.md)
* ☁️ [Hướng dẫn deploy lên VPS Ubuntu](file:///d:/hochanhi3/fullstack/btmoi/repo/docs/deploy-vps.md)