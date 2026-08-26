require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const initSocket = require('./socket');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiters');

const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const mapRoutes = require('./routes/mapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const httpServer = http.createServer(app);

// ---------- Security & core middleware ----------
app.set('trust proxy', 1); // needed behind Render's proxy for correct req.ip / secure cookies

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin header
      // such as server-to-server/health checks.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '10mb' })); // base64 image uploads can be sizable
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

// ---------- Socket.IO (real-time admin/facility notifications) ----------
const io = initSocket(httpServer, allowedOrigins);
app.set('io', io);

// ---------- Health check ----------
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Hospital Marketplace API is running.' }));

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Boot ----------
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`[Server] Hospital Marketplace API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();

// Fail loudly instead of hanging silently on unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection]', err);
});

module.exports = app;
