# Digital Library System

Repo nay da duoc sap xep lai theo mot cau truc duy nhat cho he thong thu vien so.

## Cau truc

```text
DigitalLibrarySystem/
  api-gateway/
  catalog-service/
    CatalogService/
  circulation-service/
    CirculationService.Api/
  identity-report-service/
  frontend/
    digilib-admin-frontend/
    digilib-librarian-frontend/
    digilib-user-frontend/
  docs/
  docker-compose.yml
```

## Backend services

- `api-gateway`: reverse proxy cho cac API.
- `catalog-service/CatalogService`: quan ly sach, ban sao, tai lieu so va thong tin nguoi dung lien quan den catalog.
- `circulation-service/CirculationService.Api`: quan ly muon, tra, gia han, tien phat.
- `identity-report-service`: dang nhap, phan quyen, nguoi dung, doc gia, bao cao va log he thong.

## Frontend apps

- `frontend/digilib-admin-frontend`: giao dien admin.
- `frontend/digilib-librarian-frontend`: giao dien thu thu.
- `frontend/digilib-user-frontend`: giao dien ban doc.

## Chay bang Docker

Tao file `.env` tu `.env.example`, dat `SA_PASSWORD`, sau do chay:

```bash
docker compose up --build
```

Port mac dinh:

- API Gateway: `http://localhost:8080`
- Catalog Service: `http://localhost:5001`
- Circulation Service: `http://localhost:5002`
- Identity Report Service: `http://localhost:5003`
- Admin Frontend: `http://localhost:5173`
- Librarian Frontend: `http://localhost:5174`
- User Frontend: `http://localhost:5175`

## Ghi chu cau truc

Khong tao them backend service ben trong folder tong hop khac. Neu them frontend moi, dat trong `frontend/`. Neu them backend moi, dat ngang hang voi cac service root hien tai va cap nhat `docker-compose.yml`.

Xem them: `docs/repo-structure.md`.
