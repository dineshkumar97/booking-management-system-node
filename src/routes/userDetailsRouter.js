import express from "express";
import { upload } from '../middleware/uploadMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimit.js';
import verifyToken, {
  authorizeRoles
} from '../middleware/verifyToken.js';
import {
    createUser,
    getUsers,
    authenticate,
    userDelete,
    updateUsers,
    getProfile,
    assignServicesToStaff
} from "../controllers/userDetailsController.js";
import {
    forgotPassword, resetPassword
} from "../controllers/forgotPasswordController.js";
import {
    sendLoginOtp,
    verifyLoginOtp
} from "../controllers/otpController.js";
// import { loginSchema } from "../validations/userValidation.js";

const router = express.Router();
router.post("/create", createUser);
router.put('/update/:idUser', upload.single('profileImage'), updateUsers);
router.get('/profile/:idUser', getProfile);
router.get("/all", getUsers);
// router.post('/authenticate',loginRateLimiter, validate(loginSchema), authenticate);
router.post('/authenticate',loginRateLimiter,  authenticate);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete('/delete/:idUser', userDelete);
router.put("/staff/assign/:id/services",verifyToken,assignServicesToStaff);
router.post("/send-login-otp",sendLoginOtp);
router.post("/verify-login-otp",verifyLoginOtp);
export default router;





// Role
/* "role": "ADMIN",
"role": "STAFF",
"role": "CUSTOMER", */
/* admin@gmail.com
staff@gmail.com
customer@gmail.com */
/* 
backend/
│
├── src/
│
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── appointment.controller.js
│   │   ├── service.controller.js
│   │   ├── staff.controller.js
│   │   └── user.controller.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Service.js
│   │   └── Availability.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── appointment.routes.js
│   │   ├── service.routes.js
│   │   ├── staff.routes.js
│   │   └── user.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── services/
│   │   ├── email.service.js
│   │   ├── appointment.service.js
│   │   └── slot.service.js
│   │
│   ├── utils/
│   │   ├── token.js
│   │   └── response.js
│   │
│   └── app.js
│
├── server.js
├── .env
└── package.json */
// DB
/* Customers
Services
Staff
Appointments */