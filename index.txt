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
// import "./src/cronJobs/job.js";
setServers(["1.1.1.1", "8.8.8.8"]);

const mongooseString = process.env.DATABASE_URL;

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.use("/booking-management-systemt/user", userDetailsRouter);
app.use("/booking-management-systemt/appointments",appointmentRouter);
app.use("/booking-management-systemt/service",serviceRouter);
app.use("/booking-management-systemt/staff",staffRouter);

// MongoDB connection
mongoose.connect(mongooseString)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

/* const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
}) */

//Server Code
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Node.js Express Lambda API is working"
  },
console.log('Express Lambda API is working')
);
});

const serverlessHandler = serverless(app, {
  binary: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream"
  ]
});

export const handler = async (event, context) => {
  return await serverlessHandler(event, context);
};



// | #         | Concept            | What you learn                   |
// | --------- | ------------------ | -------------------------------- |
// | ✅ 1       | Express basics     | Routes, middleware, controllers  |
// | ✅ 2       | MongoDB + Mongoose | Models, queries, populate        |
// | ✅ 3       | Authentication     | JWT, password hashing            |
// | ✅ 4       | Authorization      | Roles: CUSTOMER/STAFF/ADMIN      |
// | ✅ 5       | Error handling     | Centralized error handling       |
// | ✅ 6       | File upload        | Multer + S3                      |
// | ✅ 7       | Email              | Nodemailer + templates           |
// | ✅ 8       | Cron jobs          | `node-cron`                      |
// | ✅ 9       | Transactions       | MongoDB transactions             |
// | ✅ 10      | Atomic booking     | Unique indexes / race conditions |
// | ✅ 11      | Redis              | Cache + locks                    |
// | ✅ 12      | Queue              | BullMQ concepts                  |
// | **➡️ 13** | **Rate limiting**  | Protect APIs                     |
// | 14        | API security       | Helmet, validation, sanitization |
// | 15        | Logging            | Winston/Pino                     |
// | 16        | API documentation  | Swagger/OpenAPI                  |
// | 17        | Testing            | Jest + Supertest                 |
// | 18        | WebSockets         | Socket.IO                        |
// | 19        | Graceful shutdown  | Production server handling       |
// | 20        | Monitoring         | Health checks + AWS CloudWatch   |
