const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(bodyParser.json());

// ===== In-memory "database" =====
let catalog = [
  { id: 1, name: 'Burger', price: 5.99 },
  { id: 2, name: 'Pizza', price: 8.99 },
  { id: 3, name: 'Fries', price: 2.99 },
  { id: 4, name: 'Soda', price: 1.99 }
];

let orders = [];
// order shape: { id, items: [], status, customerName, createdAt }

// ===== SSE clients & helper (declared early so all routes can use it) =====
let sseClients = [];

function sendSystemAlert(message) {
  sseClients.forEach(client => {
    client.write(`data: ${JSON.stringify({ message, timestamp: new Date().toISOString() })}\n\n`);
  });
}

// ===== REST API: Catalog =====

app.get('/api/v1/catalog', (req, res) => {
  res.json(catalog);
});

// ===== REST API: Orders =====

app.get('/api/v1/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/v1/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/v1/orders', (req, res) => {
  const { items, customerName } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items are required' });
  }

  const newOrder = {
    id: uuidv4(),
    items,
    customerName: customerName || 'Guest',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  sendSystemAlert(`New order placed by ${newOrder.customerName}`);
  res.status(201).json(newOrder);
});

app.patch('/api/v1/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  order.status = status;
  io.emit('orderStatusUpdated', order);
  res.json(order);
});

app.delete('/api/v1/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  orders.splice(index, 1);
  res.json({ message: 'Order deleted' });
});

// ===== JSON-RPC 2.0 =====

app.post('/rpc', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0' || !method) {
    return res.json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
      id: id || null
    });
  }

  if (method === 'cancelOrder') {
    const { orderId } = params || {};
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Order not found' },
        id
      });
    }

    order.status = 'Cancelled';
    io.emit('orderStatusUpdated', order);

    return res.json({
      jsonrpc: '2.0',
      result: order,
      id
    });
  }

  if (method === 'getOrderStatus') {
    const { orderId } = params || {};
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Order not found' },
        id
      });
    }

    return res.json({
      jsonrpc: '2.0',
      result: { status: order.status },
      id
    });
  }

  return res.json({
    jsonrpc: '2.0',
    error: { code: -32601, message: 'Method not found' },
    id
  });
});

// ===== Server-Sent Events (SSE) =====

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ message: 'Connected to live alerts' })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Example: send an alert every 30 seconds (demo purpose)
setInterval(() => {
  sendSystemAlert('System check: all services running normally');
}, 30000);

// ===== WebSocket (Socket.io) Logic =====

let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('join', ({ role, name }) => {
    connectedUsers[socket.id] = { role, name };
    console.log(`${name} joined as ${role}`);
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', ({ roomId, message, sender }) => {
    const payload = {
      sender,
      message,
      timestamp: new Date().toISOString()
    };
    io.to(roomId).emit('receiveMessage', payload);
  });

  socket.on('updateOrderStatus', ({ orderId, status }) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      io.emit('orderStatusUpdated', order);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    delete connectedUsers[socket.id];
  });
});

// ===== Server start =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, orders, catalog, io };