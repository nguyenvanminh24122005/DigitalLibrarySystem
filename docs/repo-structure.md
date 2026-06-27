# Repo structure

Repo nay duoc don ve mot cau truc chinh:

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

Nguyen tac:

- Backend service chi nam o root service folder tuong ung.
- Frontend chi nam trong `frontend/`.
- `digilib-real-full/` da bi loai bo vi chua cac ban duplicate cua ApiGateway, Catalog, Circulation va frontend.
- Compose chinh nam o root repo. Khong giu compose rieng trong tung service de tranh chay nham.
