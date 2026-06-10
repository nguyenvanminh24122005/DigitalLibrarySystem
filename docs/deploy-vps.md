# Hướng dẫn Deploy DigiLib lên VPS Ubuntu

Tài liệu này hướng dẫn chi tiết cách triển khai toàn bộ hệ thống DigiLib lên máy chủ ảo (VPS) chạy hệ điều hành Ubuntu sử dụng Docker và Docker Compose.

---

## 1. Yêu cầu Hệ thống
* **Hệ điều hành**: Ubuntu 20.04 LTS hoặc 22.04 LTS.
* **Cấu hình tối thiểu**: 2 vCPU, 4GB RAM (đảm bảo đủ tài nguyên chạy SQL Server và 5 container khác).
* **Công cụ cài sẵn**: `docker`, `docker-compose`, `git`.

---

## 2. Chuẩn bị VPS
Cài đặt Docker và Docker Compose nếu chưa có:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
sudo apt install docker.io -y
sudo systemctl enable --now docker

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra phiên bản
docker --version
docker-compose --version
```

---

## 3. Clone source code & Cấu hình môi trường
Truy cập thư mục làm việc và lấy mã nguồn:

```bash
git clone <URL_REPOSITOY_CUA_BAN> digital-library
cd digital-library

# Sao chép file cấu hình môi trường mẫu
cp .env.example .env
```

Chỉnh sửa file `.env` bằng `nano` hoặc `vim`:
* Cập nhật mật khẩu SQL Server `SA_PASSWORD` cực kỳ bảo mật.
* Thay đổi `JWT_SECRET` sang một chuỗi bảo mật ngẫu nhiên dài hơn 32 ký tự.
* Cập nhật địa chỉ IP của VPS vào biến `VITE_API_BASE_URL` (ví dụ: `VITE_API_BASE_URL=http://<IP_VPS>:8080/api/v1`).

```bash
nano .env
```

---

## 4. Build và Chạy Hệ thống
Sử dụng docker-compose để tự động build image và chạy toàn bộ dịch vụ ở chế độ chạy ngầm (`-d`):

```bash
# Thực hiện build và start các container
docker-compose up -d --build
```

Kiểm tra trạng thái chạy của các dịch vụ:

```bash
docker-compose ps
```

Kết quả hiển thị mong đợi:
```text
NAME                  IMAGE                    COMMAND                  SERVICE               CREATED         STATUS         PORTS
api-gateway           digital-library-api-...  "dotnet ApiGateway.d…"   api-gateway           1 minute ago    Up 1 minute    0.0.0.0:8080->8080/tcp
catalog-service       digital-library-cat…     "dotnet CatalogServi…"   catalog-service       1 minute ago    Up 1 minute    0.0.0.0:5001->5001/tcp
circulation-service   digital-library-cir…     "dotnet CirculationS…"   circulation-service   1 minute ago    Up 1 minute    0.0.0.0:5002->5002/tcp
identity-service      digital-library-ide…     "dotnet IdentityRepo…"   identity-service      1 minute ago    Up 1 minute    0.0.0.0:5003->5003/tcp
mssql-db              mcr.microsoft.com/m…     "/opt/mssql/bin/sqls…"   sqlserver             1 minute ago    Up 1 minute    0.0.0.0:1433->1433/tcp
vue-frontend          digital-library-fr…      "/docker-entrypoint.…"   frontend              1 minute ago    Up 1 minute    0.0.0.0:3000->80/tcp
```

---

## 5. Truy cập Hệ thống
Sau khi các dịch vụ khởi động thành công:
1. **Giao diện người dùng**: `http://<IP_VPS_CUA_BAN>:3000`
2. **API Gateway**: `http://<IP_VPS_CUA_BAN>:8080`
3. **Swagger UI các dịch vụ** (sử dụng cho debug):
   * Catalog API: `http://<IP_VPS_CUA_BAN>:5001/swagger`
   * Circulation API: `http://<IP_VPS_CUA_BAN>:5002/swagger`
   * Identity API: `http://<IP_VPS_CUA_BAN>:5003/swagger`

---

## 6. Xem Log & Khắc phục sự cố
Nếu dịch vụ gặp lỗi, hãy xem log để kiểm tra:

```bash
# Xem log của toàn bộ hệ thống
docker-compose logs -f

# Xem log của một dịch vụ cụ thể
docker-compose logs -f circulation-service
```

Để restart hoặc dừng hệ thống:
```bash
# Restart hệ thống
docker-compose restart

# Dừng và xóa container
docker-compose down
```
