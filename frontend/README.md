# Frontend apps

Thu muc nay gom cac giao dien cua he thong Digital Library.

| App | Thu muc | Framework | Port dev mac dinh | Port Docker |
| --- | --- | --- | --- | --- |
| Admin | `digilib-admin-frontend` | Vue + Vite | `5173` | `5173` |
| Librarian | `digilib-librarian-frontend` | Vue + Vite | `5174` | `5174` |
| User | `digilib-user-frontend` | React + Vite | `5173` | `5175` |
Chay tung app:

```bash
cd frontend/digilib-admin-frontend
npm install
npm run dev
```

```bash
cd frontend/digilib-librarian-frontend
npm install
npm run dev
```

```bash
cd frontend/digilib-user-frontend
npm install
npm run dev
```

Docker compose o root repo build cac UI tu cac thu muc con trong `frontend/`.
