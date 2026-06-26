# 📚 Catalog Service - Digital Library System

## Giới thiệu

Catalog Service là module quản lý danh mục sách trong hệ thống Quản lý Thư viện Số (Digital Library System).

Module chịu trách nhiệm quản lý thông tin sách, bản sao sách và cung cấp dữ liệu cho các module khác trong hệ thống.

---

## Thành viên nhóm

- Tạ Công Thắng
- Nguyễn Chí Vĩ
- Nguyễn Văn Minh

---

## Chức năng chính

### Quản lý sách

- Thêm sách mới
- Cập nhật thông tin sách
- Xóa sách
- Xem danh sách sách
- Xem chi tiết sách

### Quản lý bản sao sách

- Tạo bản sao sách
- Quản lý mã định danh từng bản sao
- Theo dõi trạng thái sách

### Tìm kiếm sách

- Theo tên sách
- Theo tác giả
- Theo thể loại
- Theo ISBN

---

## Công nghệ sử dụng

### Backend

- ASP.NET Core MVC
- Entity Framework Core
- SQL Server

### Frontend

- Razor View
- HTML
- CSS
- JavaScript

### Công cụ hỗ trợ

- Visual Studio 2022
- GitHub
- SQL Server
- Docker

---

## Cấu trúc thư mục

```text
CatalogService
│
├── Controllers
│   ├── BooksController.cs
│   └── HomeController.cs
│
├── DTOs
│
├── Data
│   └── AppDbContext.cs
│
├── Models
│   ├── Book.cs
│   ├── BookCopy.cs
│   └── ErrorViewModel.cs
│
├── Services
│   ├── IBookService.cs
│   └── BookService.cs
│
├── Views
│
├── wwwroot
│   ├── css
│   ├── js
│   └── lib
│
├── Migrations
│
├── Program.cs
│
├── Dockerfile
│
└── appsettings.json
```

---

## Cơ sở dữ liệu

### Book

| Thuộc tính |
|------------|
| Id |
| Title |
| Author |
| Category |
| ISBN |
| Publisher |
| PublishedYear |
| Description |
| CoverImage |

### BookCopy

| Thuộc tính |
|------------|
| Id |
| CopyCode |
| Status |
| BookId |

---

## Các chức năng nghiệp vụ

### Quản lý đầu sách

- Thêm đầu sách mới
- Chỉnh sửa thông tin sách
- Xóa đầu sách
- Xem chi tiết sách

### Quản lý bản sao

- Mỗi đầu sách có nhiều bản sao
- Mỗi bản sao có mã định danh riêng
- Theo dõi tình trạng từng bản sao

### Trạng thái sách

- Available (Có thể mượn)
- Borrowed (Đang được mượn)
- Lost (Đã mất)

---

## Hướng dẫn chạy dự án

### Clone repository

```bash
git clone https://github.com/nguyenvanminh24122005/DigitalLibrarySystem.git
```

### Khôi phục package

```bash
dotnet restore
```

### Cập nhật cơ sở dữ liệu

```bash
dotnet ef database update
```

### Chạy ứng dụng

```bash
dotnet run
```

Hoặc mở bằng Visual Studio 2022:

```text
CatalogService.csproj
→ F5
```

---

## Docker

Build image:

```bash
docker build -t catalogservice .
```

Run container:

```bash
docker run -p 5000:80 catalogservice
```

---

## Vai trò trong hệ thống

Catalog Service là một trong ba module của hệ thống:

### Catalog Service

Quản lý danh mục sách và bản sao sách.

### Identity Service

Quản lý người dùng và xác thực.

### Circulation Service

Quản lý mượn và trả sách.

---

## Môn học

**Lập trình Fullstack**

## Đề tài

**Hệ thống Quản lý Thư viện Số**

## Module

**Catalog Service**