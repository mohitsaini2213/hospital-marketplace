const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');

/**
 * Real-time channel for:
 *  - Admins joining an "admins" room to receive new_registration / new_lead events
 *  - Facility owners joining "facility_<id>" to receive listing_status_changed events
 *
 * Auth: client passes the JWT access token in the connection handshake.
 * We never trust a claimed role from the client — it's decoded from the
 * verified token, same as REST requests.
 */
const initSocket = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(); // allow anonymous connect; they just won't join private rooms
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(); // invalid token -> treat as anonymous, do not crash the handshake
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.type === 'admin') {
      socket.join('admins');
    }
    if (socket.user?.type === 'facility') {
      socket.join(`facility_${socket.user.id}`);
    }

    socket.on('disconnect', () => {});
  });

  return io;
};

module.exports = initSocket;
