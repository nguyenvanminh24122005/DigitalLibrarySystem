# 📚 Digital Library System

## Tổng quan dự án

Digital Library System là hệ thống quản lý thư viện số được phát triển theo mô hình **Fullstack Microservices Architecture**.

Dự án được xây dựng nhằm số hóa các hoạt động quản lý thư viện truyền thống, hỗ trợ quản lý tài nguyên sách, người dùng và các nghiệp vụ mượn – trả sách thông qua một hệ thống tập trung, hiện đại và dễ mở rộng.

Hệ thống được chia thành nhiều dịch vụ độc lập nhằm tăng khả năng bảo trì, phát triển và tích hợp trong môi trường thực tế.

---

## 🎯 Mục tiêu dự án

- Xây dựng hệ thống quản lý thư viện số hoàn chỉnh.
- Áp dụng kiến thức Fullstack vào thực tế.
- Thực hành thiết kế hệ thống theo kiến trúc Microservices.
- Tăng cường kỹ năng làm việc nhóm và quản lý mã nguồn với GitHub.
- Nâng cao khả năng phát triển ứng dụng Web doanh nghiệp.

---

## 🏛️ Kiến trúc hệ thống

Hệ thống được tổ chức theo mô hình Microservices:

```text
                    ┌─────────────────┐
                    │     Vue.js      │
                    │    Frontend     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼

 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │   Catalog    │   │   Identity   │   │ Circulation  │
 │   Service    │   │   Service    │   │   Service    │
 └──────────────┘   └──────────────┘   └──────────────┘

         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼

                     SQL Server Database
```

---

## 📦 Các Module Chính

### 📚 Catalog Service

Quản lý toàn bộ thông tin sách trong thư viện.

**Chức năng:**

- Quản lý đầu sách
- Quản lý bản sao sách
- Quản lý tác giả
- Quản lý nhà xuất bản
- Quản lý thể loại sách
- Tìm kiếm và tra cứu sách
- Theo dõi trạng thái sách

---

### 👤 Identity Service

Quản lý tài khoản và xác thực người dùng.

**Chức năng:**

- Đăng ký tài khoản
- Đăng nhập hệ thống
- Xác thực người dùng
- Phân quyền truy cập
- Quản lý thông tin cá nhân

---

### 🔄 Circulation Service

Quản lý nghiệp vụ mượn và trả sách.

**Chức năng:**

- Tạo phiếu mượn sách
- Quản lý trả sách
- Theo dõi lịch sử mượn
- Quản lý sách quá hạn
- Thống kê hoạt động mượn trả

---

## 💻 Công nghệ sử dụng

### Frontend

- Vue.js 3
- Vite
- Axios
- HTML5
- CSS3
- JavaScript ES6+

### Backend

- ASP.NET Core
- Entity Framework Core
- RESTful API
- Dependency Injection
- Swagger

### Database

- SQL Server

### Công cụ hỗ trợ

- Visual Studio 2022
- Visual Studio Code
- Git & GitHub
- Docker
- Postman

---

## 📂 Cấu trúc Repository

```text
DigitalLibrarySystem
│
├── catalog-service/
│
├── identity-service/
│
├── circulation-service/
│
└── README.md
```

---

## 🔄 Quy trình hoạt động

```text
Người dùng
     │
     ▼
Đăng ký / Đăng nhập
     │
     ▼
Identity Service
     │
     ▼
Truy cập hệ thống
     │
     ▼
Tra cứu sách
     │
     ▼
Catalog Service
     │
     ▼
Mượn sách / Trả sách
     │
     ▼
Circulation Service
     │
     ▼
Cập nhật trạng thái sách
```

---

## 🚀 Hướng dẫn cài đặt

### Clone dự án

```bash
git clone https://github.com/nguyenvanminh24122005/DigitalLibrarySystem.git
```

### Chạy Catalog Service

```bash
cd catalog-service
dotnet restore
dotnet run
```

### Chạy Identity Service

```bash
cd identity-service
dotnet restore
dotnet run
```

### Chạy Circulation Service

```bash
cd circulation-service
dotnet restore
dotnet run
```

### Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Định hướng phát triển

- Tích hợp JWT Authentication.
- Triển khai Docker cho từng dịch vụ.
- Xây dựng API Gateway.
- Triển khai hệ thống trên VPS.
- Bổ sung Dashboard thống kê.
- Tích hợp tìm kiếm nâng cao.
- Hoàn thiện quy trình mượn – trả sách trực tuyến.

---

## 📖 Thông tin học phần

**Môn học:** Lập trình Fullstack

**Đề tài:** Hệ thống Quản lý Thư viện Số (Digital Library System)

**Kiến trúc:** Fullstack Microservices Architecture
