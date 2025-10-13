import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import busRoutes from "./routes/buses.js";

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json({ limit: '10kb' })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
connectDB();

// API Documentation route
app.get("/", (req, res) => {
  res.json({
    name: "NTC Bus Tracking API",
    version: "1.0.0",
    endpoints: {
      buses: {
        base: "/api/buses",
        operations: {
          list: "GET /api/buses",
          create: "POST /api/buses",
          getOne: "GET /api/buses/:id",
          update: "PUT /api/buses/:id",
          delete: "DELETE /api/buses/:id",
          bulk: {
            create: "POST /api/buses/bulk/create",
            update: "PUT /api/buses/bulk/update",
            delete: "DELETE /api/buses/bulk/delete"
          }
        }
      }
    }
  });
});

// Mount routes
app.use('/api/buses', busRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      error: errors
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Graceful shutdown handling
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(` Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT || 5000}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});
