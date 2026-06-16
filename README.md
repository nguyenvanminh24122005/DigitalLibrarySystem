# 📚 Digital Library System

Hệ thống Quản lý Thư viện Số được phát triển theo kiến trúc Microservices trong môn học **Lập trình Fullstack**.

Dự án hướng đến việc xây dựng một hệ thống thư viện hiện đại, hỗ trợ quản lý sách, quản lý người dùng và quản lý hoạt động mượn trả sách.

---

## 🏗️ Kiến trúc hệ thống

Hệ thống được chia thành 3 module chính:

```text
Digital Library System
│
├── Catalog Service
├── Identity Service
└── Circulation Service
```

### 📚 Catalog Service

Quản lý thông tin sách và bản sao sách.

**Chức năng:**

- Thêm, sửa, xóa sách
- Quản lý bản sao sách
- Tìm kiếm sách
- Quản lý trạng thái sách

---

### 👤 Identity Service

Quản lý tài khoản và xác thực người dùng.

**Chức năng:**

- Đăng ký tài khoản
- Đăng nhập hệ thống
- Phân quyền người dùng
- Quản lý hồ sơ người dùng

---

### 🔄 Circulation Service

Quản lý hoạt động mượn và trả sách.

**Chức năng:**

- Tạo phiếu mượn sách
- Trả sách
- Theo dõi lịch sử mượn
- Quản lý sách quá hạn
- Thống kê hoạt động mượn trả

---

## ⚙️ Công nghệ sử dụng

### Backend

- ASP.NET Core
- Entity Framework Core
- RESTful API
- SQL Server

### Frontend

- HTML
- CSS
- JavaScript
- Razor View

### Công cụ hỗ trợ

- Visual Studio 2022
- GitHub
- Docker
- Postman

---

## 📂 Cấu trúc Repository

```text
DigitalLibrarySystem
│
├── catalog-service
│
├── identity-service
│
├── circulation-service
│
└── README.md
```

---

## 🔄 Luồng hoạt động

```text
Người dùng
    │
    ▼
Đăng nhập / Đăng ký
    │
    ▼
Identity Service
    │
    ▼
Tra cứu sách
    │
    ▼
Catalog Service
    │
    ▼
Mượn / Trả sách
    │
    ▼
Circulation Service
```

---

## 🚀 Hướng dẫn cài đặt

### Clone repository

```bash
git clone https://github.com/nguyenvanminh24122005/DigitalLibrarySystem.git
```

### Chạy từng module

```bash
cd catalog-service
dotnet restore
dotnet run
```

```bash
cd identity-service
dotnet restore
dotnet run
```

```bash
cd circulation-service
dotnet restore
dotnet run
```

---

## 🎯 Mục tiêu dự án

- Xây dựng hệ thống thư viện số theo kiến trúc Microservices.
- Áp dụng kiến thức Fullstack vào thực tế.
- Thực hành làm việc nhóm với GitHub.
- Thực hành xây dựng và tích hợp nhiều dịch vụ trong cùng một hệ thống.
- Nâng cao kỹ năng phát triển phần mềm doanh nghiệp.

---

## 📖 Môn học

**Lập trình Fullstack**

### Đề tài

**Hệ thống Quản lý Thư viện Số (Digital Library System)**
