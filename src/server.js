import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import busRoutes from "./routes/buses.js";
import { config } from "./config/config.js";

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json({ limit: '10kb' })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging in development
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Connect to PostgreSQL (Supabase) instead of MongoDB
connectDB();

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: "Supabase PostgreSQL"
  });
});

// API Documentation route - KEEPING EXACTLY AS IS
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
          getOne: "GET /api/buses/:route",
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

// Global Error Handler - Updated for PostgreSQL
app.use((err, req, res, next) => {
  console.error(err.stack);

  // PostgreSQL validation error
  if (err.code === '23505') { // Unique constraint violation
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered'
    });
  }

  // PostgreSQL foreign key constraint
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced record does not exist'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Graceful shutdown handling
const server = app.listen(config.port, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
  console.log(`📍 Database: Supabase PostgreSQL`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
