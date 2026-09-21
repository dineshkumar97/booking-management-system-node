import express from "express";
import verifyToken from "../middleware/verifyToken.js";

import {
  createAppointment, getMyAppointments, getAppointmentById, cancelAppointment,
  getStaffAppointments,confirmAppointment,rejectAppointment,completeAppointment
} from "../controllers/appointmentController.js";


const router = express.Router();

router.post("/create", verifyToken, createAppointment);
router.get("/all", verifyToken, getMyAppointments);
router.get("/get/:id", verifyToken, getAppointmentById);
router.patch("/booking/:id/cancel", verifyToken, cancelAppointment);
router.get("/staffAppointment",verifyToken,getStaffAppointments);
router.get("/staff/:id",verifyToken,getStaffAppointments);


router.put("/staff/:id/confirm",verifyToken,confirmAppointment);
router.put("/staff/:id/reject",verifyToken,rejectAppointment);
router.put("/staff/:id/complete",verifyToken,completeAppointment);

export default router;