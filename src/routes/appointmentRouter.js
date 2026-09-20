import express from "express";
import verifyToken from "../middleware/verifyToken.js";

import {
  createAppointment, getMyAppointments, getAppointmentById, cancelAppointment
} from "../controllers/appointmentController.js";


const router = express.Router();

router.post("/create", verifyToken, createAppointment);
router.get("/all", verifyToken, getMyAppointments);
router.get("/get/:id", verifyToken, getAppointmentById);
router.patch("/booking/:id/cancel", verifyToken, cancelAppointment);

export default router;