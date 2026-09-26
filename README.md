<img width="805" height="318" alt="ss7" src="https://github.com/user-attachments/assets/26b0c401-508d-4fb6-880f-19a153ed86c7" />
<img width="939" height="473" alt="ss6" src="https://github.com/user-attachments/assets/73e8f90a-071d-485f-a8ed-42cfbcaf5ebc" />
<img width="631" height="185" alt="ss5" src="https://github.com/user-attachments/assets/c685fb3c-bf96-435e-aad8-d6e229668384" />
<img width="960" height="236" alt="ss4" src="https://github.com/user-attachments/assets/ad472c62-ed7b-41a4-a5b4-abbf4170869b" />
<img width="351" height="249" alt="ss3" src="https://github.com/user-attachments/assets/bc12b188-445e-4fea-8844-b4e52a787203" />
<img width="340" height="287" alt="ss2" src="https://github.com/user-attachments/assets/4a790a23-9228-4410-8290-08e813c678d9" />
<img width="297" height="278" alt="ss" src="https://github.com/user-attachments/assets/557ab59e-2093-48e9-bab7-e097b1b7cc96" />
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
