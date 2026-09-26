# Real-Time Order Tracker & Live Support System

A full-stack web application demonstrating multiple real-time communication protocols: REST API, WebSockets, JSON-RPC 2.0, and Server-Sent Events (SSE).

## 🔗 Live Links

- **Frontend (Vercel):** https://order-tracker-system.vercel.app
- **Backend (Render):** https://order-tracker-system.onrender.com

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Render (backend), Vercel (frontend)

## 📡 Features & Endpoints

### 1. REST API (Orders & Catalog)
- `GET /api/v1/catalog` — Get all catalog items
- `GET /api/v1/orders` — Get all orders
- `GET /api/v1/orders/:id` — Get single order
- `POST /api/v1/orders` — Create new order
- `PATCH /api/v1/orders/:id` — Update order status
- `DELETE /api/v1/orders/:id` — Delete order

### 2. WebSocket (Socket.io) Events
- `join` — User joins as `customer` or `agent` with their name
- `joinRoom` — User joins a specific chat room
- `sendMessage` — Send a chat message to a room
- `receiveMessage` — Receive a chat message from a room
- `updateOrderStatus` — Update order status via socket (broadcasts to all clients)
- `orderStatusUpdated` — Broadcast event when an order status changes

### 3. JSON-RPC 2.0 (`/rpc`)
Send POST requests with JSON-RPC 2.0 format:
- **Method:** `cancelOrder` — Cancels an order by ID
- **Method:** `getOrderStatus` — Gets the current status of an order

Example request:
```json
{
  "jsonrpc": "2.0",
  "method": "cancelOrder",
  "params": { "orderId": "abc-123" },
  "id": 1
}