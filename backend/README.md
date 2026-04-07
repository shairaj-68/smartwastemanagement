# Smart Waste Backend

Backend foundation for the Smart Waste Management System.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth + RBAC (citizen, worker, admin)
- Cloudinary image upload support
- Socket.io notifications
- Swagger API docs
- Layered structure (routes/controllers/services/models/middleware/validators)

## Project Structure

src/

- config/
- controllers/
- middleware/
- models/
- routes/
- services/
- utils/
- validators/
- scripts/

## Setup

1. Install dependencies

```bash
npm install
```

1. Create local environment file

Use `.env.example` as template and create `.env` in the same folder.

1. Update required environment values in `.env`

- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- optional integration keys for Cloudinary and AI APIs

1. Start development server

```bash
npm run dev
```

1. Seed default users

```bash
npm run seed
```

## API Base

- Base: `/api/v1`
- Health: `GET /api/v1/health`
- Auth: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`
- Complaints: create/list/detail/update status/upload image/nearby search under `/api/v1/complaints`
- Worker: assigned complaints and status updates under `/api/v1/workers`
- Admin: worker assignment, users list, analytics, complaint deletion under `/api/v1/admin`
- Notifications: `GET /api/v1/notifications`
- API Docs: `/api/docs`

## Notes

- Keep secrets only in environment variables.
- Do not commit `.env` files.
- Rotate any key that was ever exposed in plain text.

## Test and Quality

```bash
npm run lint
npm test
```

## Deployment

- Docker: [Dockerfile](Dockerfile)
- Compose stack: [../docker-compose.yml](../docker-compose.yml)
- CI workflow: [../.github/workflows/ci.yml](../.github/workflows/ci.yml)
- Backup runbook: [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md)
