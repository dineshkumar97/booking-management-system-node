import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import { setServers } from "node:dns/promises";
import serverless from "serverless-http";
import { createServer } from "node:http";
import { Server } from "socket.io";

import userDetailsRouter from "./src/routes/userDetailsRouter.js";
import appointmentRouter from "./src/routes/appointmentRouter.js";
import serviceRouter from "./src/routes/serviceRouter.js";
import staffRouter from "./src/routes/staffRouter.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import { initializeSocket } from "./socket-server.js";

setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(requestLogger);
app.use(helmet());
// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:4200",
  "https://main.d278yotn95mf53.amplifyapp.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],
    credentials: true
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

// =====================================================
// ROUTES
// =====================================================

app.use(
  "/booking-management-systemt/user",
  userDetailsRouter
);

app.use(
  "/booking-management-systemt/appointments",
  appointmentRouter
);

app.use(
  "/booking-management-systemt/service",
  serviceRouter
);

app.use(
  "/booking-management-systemt/staff",
  staffRouter
);

app.use(errorHandler);
// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Node.js Express API is working"
  });
});

// =====================================================
// MONGODB
// =====================================================

let dbConnectionPromise;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose
      .connect(process.env.DATABASE_URL)
      .then(() => {
        console.log(
          "MongoDB connected successfully"
        );
      })
      .catch((error) => {
        dbConnectionPromise = null;

        console.error(
          "MongoDB connection error:",
          error
        );

        throw error;
      });
  }

  await dbConnectionPromise;
};

// =====================================================
// SOCKET.IO
// =====================================================

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// initializeSocket(io);

// =====================================================
// LAMBDA HANDLER
// =====================================================

const serverlessHandler = serverless(app, {
  binary: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream"
  ]
});

export const handler = async (
  event,
  context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  await connectDatabase();

  return serverlessHandler(
    event,
    context
  );
};

// =====================================================
// LOCAL SERVER
// =====================================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  connectDatabase()
    .then(() => {
      httpServer.listen(
        PORT,
        () => {
          console.log(
            `Local server running: http://localhost:${PORT}`
          );

          console.log(
            `Socket.IO running: http://localhost:${PORT}`
          );
        }
      );
    })
    .catch((error) => {
      console.error(
        "Failed to start local server:",
        error
      );
    });
}