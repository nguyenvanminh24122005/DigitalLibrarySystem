# Thiết kế Cơ sở Dữ liệu DigiLib

Hệ thống sử dụng kiến trúc **Database-per-service** để đảm bảo tính độc lập. Tuy nhiên, để triển khai đơn giản, dễ chạy và dễ quản lý, tất cả 3 database riêng biệt đều được lưu trữ trên **cùng một SQL Server Instance**.

---

## 1. Catalog Database (`CatalogDB`)
Quản lý danh mục sách và tình trạng vật lý của sách.

```mermaid
erDiagram
    CATEGORIES ||--o{ BOOKS : "has"
    BOOKS ||--o{ BOOK_COPIES : "contains"

    CATEGORIES {
        int Id PK
        string Name
        string Description
    }

    BOOKS {
        int Id PK
        string Title
        string Author
        string ISBN
        string Publisher
        int PublishedYear
        string CoverImage
        string Description
        int CategoryId FK
        string Category
    }

    BOOK_COPIES {
        int Id PK
        int BookId FK
        string CopyCode
        string Status "Available, Borrowed, Lost, Damaged"
        string Condition "Mới, Cũ, Hỏng, Mất"
    }
```

---

## 2. Circulation Database (`CirculationDB`)
Quản lý thông tin giao dịch mượn/trả và công nợ quá hạn.

```mermaid
erDiagram
    BORROW_POLICIES {
        int Id PK
        string Name
        int MaxBooks
        int MaxDays
        decimal FinePerDay
    }

    BORROW_RECORDS {
        int Id PK
        int ReaderId
        string ReaderName
        string CardNumber
        string CopyCode
        int BookId
        string BookTitle
        DateTime BorrowDate
        DateTime DueDate
        DateTime ReturnDate
        string Status "Borrowed, Returned"
        decimal Fine
    }

    FINES {
        int Id PK
        int ReaderId
        string ReaderName
        string CardNumber
        decimal Amount
        string Status "Unpaid, Paid"
        DateTime UpdatedAt
    }
```

---

## 3. Identity Database (`IdentityDB`)
Quản lý người dùng, thẻ thư viện, nhật ký hoạt động và tiếp nhận event tổng hợp báo cáo.

```mermaid
erDiagram
    USERS ||--o| LIBRARY_CARDS : "owns"

    USERS {
        int Id PK
        string FullName
        string Email
        string PasswordHash
        string Role "Admin, Librarian, Reader"
        bool IsActive
        DateTime CreatedAt
        string Phone
        string Address
    }

    LIBRARY_CARDS {
        int Id PK
        int UserId FK
        string CardNumber
        string Status "Active, Locked, Expired"
        DateTime IssuedAt
        DateTime ExpiredAt
    }

    BORROW_EVENTS {
        int Id PK
        string EventType
        int ReaderId
        int BookId
        string BookTitle
        DateTime BorrowedAt
        bool IsReturned
        DateTime ReturnedAt
        decimal FineAmount
    }

    RETURN_EVENTS {
        int Id PK
        int ReaderId
        int BookId
        string BookTitle
        DateTime ReturnedAt
        decimal FineAmount
    }

    BOOK_STATISTICS {
        int Id PK
        int BookId
        string BookTitle
        int TotalBorrowed
        DateTime UpdatedAt
    }

    ACTIVITY_LOGS {
        int Id PK
        string Action
        string Description
        string UserEmail
        string Type
        DateTime CreatedAt
    }

    SYSTEM_SETTINGS {
        int Id PK
        string Key
        string Value
    }
```
