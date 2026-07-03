# Deploy DigiLib len VPS Ubuntu

Tai lieu nay ap dung cho cau truc repo hien tai:

- `api-gateway/`
- `catalog-service/CatalogService/`
- `circulation-service/CirculationService.Api/`
- `identity-report-service/`
- `frontend/digilib-admin-frontend/`
- `frontend/digilib-librarian-frontend/`
- `frontend/digilib-user-frontend/`

## 1. Chuan bi VPS

VPS nen co toi thieu 2 vCPU va 4 GB RAM vi chay SQL Server bang Docker kha ton RAM.

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git docker.io docker-compose-plugin
sudo systemctl enable --now docker
docker --version
docker compose version
```

Neu user hien tai chua chay duoc Docker:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Clone repo

```bash
git clone <REPO_URL> DigitalLibrarySystem
cd DigitalLibrarySystem
```

## 3. Tao file moi truong

```bash
cp .env.example .env
nano .env
```

Can sua cac bien quan trong:

```env
ASPNETCORE_ENVIRONMENT=Production
NODE_ENV=production
SA_PASSWORD=<mat-khau-sql-server-manh>
JWT_SECRET=<chuoi-bi-mat-dai-hon-32-ky-tu>
JWT_ISSUER=DIGILIB.Identity
JWT_AUDIENCE=DIGILIB.Services
VITE_API_BASE_URL=http://<IP_OR_DOMAIN_VPS>:8080
```

Neu co domain va reverse proxy HTTPS, dung:

```env
VITE_API_BASE_URL=https://api.<domain-cua-ban>
```

Luu y: `VITE_API_BASE_URL` duoc nap luc build frontend, nen moi lan doi bien nay can build lai image frontend.

## 4. Build va chay

```bash
docker compose up -d --build
docker compose ps
```

Port mac dinh:

- Admin frontend: `http://<IP_OR_DOMAIN>:5173`
- Librarian frontend: `http://<IP_OR_DOMAIN>:5174`
- User frontend: `http://<IP_OR_DOMAIN>:5175`
- API Gateway: `http://<IP_OR_DOMAIN>:8080`
- Catalog Swagger: `http://<IP_OR_DOMAIN>:5001/swagger`
- Circulation Swagger: `http://<IP_OR_DOMAIN>:5002/swagger`
- Identity Report Swagger: `http://<IP_OR_DOMAIN>:5003/swagger`

## 5. Firewall

Neu dung UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 5174/tcp
sudo ufw allow 5175/tcp
sudo ufw enable
sudo ufw status
```

Chi mo port backend `5001`, `5002`, `5003` neu can debug Swagger tu ben ngoai.

## 6. Len code moi

```bash
git pull
docker compose up -d --build
docker image prune -f
```

## 7. Xem log va restart

```bash
docker compose logs -f
docker compose logs -f api-gateway
docker compose restart
docker compose down
```

## 8. Loi hay gap

- Frontend goi API ve `localhost`: sua `VITE_API_BASE_URL` trong `.env` thanh IP/domain VPS, sau do chay `docker compose up -d --build`.
- SQL Server khong len: kiem tra `SA_PASSWORD` du manh, thuong can chu hoa, chu thuong, so, ky tu dac biet va dai.
- API loi ket noi DB: xem log service bang `docker compose logs -f <service-name>`.
