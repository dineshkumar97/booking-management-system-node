import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { setServers } from "node:dns/promises";
import serverless from "serverless-http";

import userDetailsRouter from "./src/routes/userDetailsRouter.js";
import appointmentRouter from "./src/routes/appointmentRouter.js";
import serviceRouter from "./src/routes/serviceRouter.js";
import staffRouter from "./src/routes/staffRouter.js";

setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "https://main.d278yotn95mf53.amplifyapp.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// ===============================
// Body Parser
// ===============================
app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

// ===============================
// Routes
// ===============================
app.use(
  "/booking-management-systemt/user",
  userDetailsRouter
);

app.use(
  "/booking-management-systemt/appointments",
  appointmentRouter
);

app.use(
  "/booking-management-systemt/services",
  serviceRouter
);

app.use(
  "/booking-management-systemt/staff",
  staffRouter
);

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking Management System API is working"
  });
});

// ===============================
// MongoDB Connection
// ===============================
let isDatabaseConnected = false;

const connectDatabase = async () => {
  if (isDatabaseConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);

    isDatabaseConnected = true;

    console.log("Database connected successfully");
  } catch (error) {
    isDatabaseConnected = false;

    console.error("Database connection error:", error);

    throw error;
  }
};

// ===============================
// Lambda Handler
// ===============================
const serverlessHandler = serverless(app, {
  binary: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "image/webp"
  ]
});

export const handler = async (event, context) => {
  // Keep MongoDB connection alive between Lambda invocations
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDatabase();

    return await serverlessHandler(event, context);
  } catch (error) {
    console.error("Lambda error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message
      })
    };
  }
};

// ===============================
// Local Development
// ===============================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}