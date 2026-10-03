# DocMind Frontend

React + Vite frontend for the DocMind Spring Boot backend.

## Backend expected
- Base URL: `http://localhost:8081/api/v1`
- JWT authentication using `Authorization: Bearer <token>`
- `POST /auth/login`
- `POST /auth/register`
- `POST /documents/upload`
- `POST /documents/upload-multiple`
- `GET /documents/user`
- `GET /documents/{id}`
- `DELETE /documents/{id}`
- `POST /chat/query`
- `POST /chat/stream`
- `POST /chat/search/similarity`

## Run
```bash
npm install
cp .env.example .env
npm run dev
```

Then open the Vite URL shown in the terminal.

## Important
The backend currently has conversation persistence services/repositories but no HTTP ConversationController, so this frontend intentionally keeps the active chat in browser state and does not invent conversation-history endpoints.
