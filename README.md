# Cardnect

Cardnect is a secure peer-to-peer platform where premium card holders can monetize card benefits and deal seekers can access verified offers.

It is built as a full-stack application with a Spring Boot backend, React frontend, PostgreSQL database, and WebSocket-based real-time notifications.

## Highlights

- JWT-based authentication with OTP and password flows
- Role-agnostic marketplace for listing and requesting card offers
- Real-time notifications via STOMP over SockJS
- PostgreSQL-backed persistence with JPA/Hibernate
- Responsive frontend built with React + Vite
- Dockerized local and production-style deployment

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.3
- Spring Security
- Spring Data JPA
- Spring WebSocket
- PostgreSQL
- JWT (jjwt)
- Bucket4j (rate-limiting library)

### Frontend
- React 19
- Vite 8
- React Router
- TanStack Query
- Axios
- SockJS + STOMP
- Lucide Icons

### Infrastructure
- Docker + Docker Compose
- Nginx (frontend static hosting)

## Repository Structure

```text
Cardnect/
├── backend/                # Spring Boot API + WebSocket server
├── frontend/               # React client app
├── docker-compose.yml      # Full local stack (Postgres + API + Web)
└── README.md
```

## System Architecture

```text
[ React (Vite) ]
      |
      | REST (HTTP)
      v
[ Spring Boot API ] ---- [ PostgreSQL ]
      |
      | STOMP/SockJS
      v
[ Real-time Notifications ]
```

## Quick Start (Docker - Recommended)

### 1) Prerequisites

- Docker
- Docker Compose

### 2) Optional environment variables

Create a `.env` file at project root (same level as `docker-compose.yml`) if you want to override defaults:

```env
CLERK_PUBLISHABLE_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
```

### 3) Start all services

```bash
docker compose up --build
```

### 4) Access apps

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Database: localhost:5432

## Local Development (Without Docker)

## Backend

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 16+

### Run

```bash
cd backend
mvn spring-boot:run
```

Default backend URL: http://localhost:8080

## Frontend

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: http://localhost:5173

## Environment Configuration

## Backend variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | No | `jdbc:postgresql://localhost:5432/cardnect` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | No | `postgres` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | No | `postgres` | DB password |
| `AUTH_JWT_SECRET` | Yes (prod) | dev fallback in config | JWT signing secret |
| `AUTH_JWT_EXPIRATION_MINUTES` | No | `10080` | JWT expiry |
| `AUTH_OTP_BYPASS` | No | `true` (dev) | OTP bypass toggle |
| `RESEND_ENABLED` | No | `false` | Enable email sending |
| `RESEND_API_KEY` | If enabled | empty | Resend API key |
| `RESEND_FROM_EMAIL` | If enabled | `no-reply@cardnect.app` | Sender email |
| `APP_BASE_URL` | No | `http://localhost:5173` | Frontend URL for email links |
| `CORS_ALLOWED_ORIGINS` | No | localhost values | Comma-separated allowed origins |
| `WHATSAPP_ENABLED` | No | `true` | WhatsApp verification feature toggle |
| `WHATSAPP_TOKEN` | Optional | empty | Meta WhatsApp token |
| `WHATSAPP_PHONE_ID` | Optional | empty | WhatsApp phone ID |
| `WHATSAPP_BUSINESS_ID` | Optional | empty | WhatsApp business ID |
| `WHATSAPP_WEBHOOK_TOKEN` | Optional | empty | Webhook verification token |

## Frontend variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:8080/api/v1` | REST API base URL |
| `VITE_WS_URL` | Yes | `http://localhost:8080/ws` | WebSocket endpoint |
| `VITE_CLERK_PUBLISHABLE_KEY` | Optional | empty | Clerk key if used |
| `VITE_DEV_BYPASS_OTP` | Optional | `false` | Dev OTP bypass toggle |

## API Overview

Base prefix: `/api/v1`

### Auth
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `GET /auth/me`

### Listings
- `GET /listings` (public)
- `GET /listings/me`
- `POST /listings`
- `PUT /listings/{id}`
- `DELETE /listings/{id}`

### Requests
- `POST /requests`
- `GET /requests/me`
- `GET /requests/incoming`
- `PATCH /requests/{id}/status`

### Notifications
- `GET /notifications/me`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`

### Users
- `GET /users/me`

## Real-time Notifications

- STOMP/SockJS endpoint: `/ws`
- Broker destinations enabled: `/queue`, `/topic`
- User destination prefix: `/user`

## Build Commands

### Backend

```bash
cd backend
mvn clean package
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Security Notes

- Use a strong `AUTH_JWT_SECRET` in production
- Disable OTP bypass in production
- Restrict CORS to trusted domains only
- Run services behind HTTPS in production
- Never commit real secrets to the repository

## Deployment Notes

- Frontend Docker image serves static build through Nginx
- Backend Docker image packages and runs Spring Boot JAR
- Use managed PostgreSQL for production
- Add reverse proxy and TLS termination for public deployments

## Troubleshooting

### Frontend cannot reach backend

- Check `VITE_API_BASE_URL`
- Check backend is running on port 8080
- Verify `CORS_ALLOWED_ORIGINS`

### OTP/email issues

- Confirm `RESEND_ENABLED=true`
- Verify `RESEND_API_KEY` and sender email

### WebSocket not connecting

- Ensure backend `/ws` endpoint is reachable
- Confirm `VITE_WS_URL` is correct

## License

This project is currently private/proprietary unless you add a license file.
