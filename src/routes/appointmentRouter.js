import express from "express";
import verifyToken, {
  authorizeRoles
} from '../middleware/verifyToken.js';
import {
  createAppointment, getCustomerAppointments, getCustomerAppointmentById, cancelAppointment,
  getStaffAppointments, confirmAppointment, rejectAppointment, completeAppointment,
  getStaffAppointmentById, getAllAppointments
} from "../controllers/appointmentController.js";


const router = express.Router();

router.post("/create", verifyToken, createAppointment);
router.get("/all", verifyToken, getCustomerAppointments);
router.get("/get/:id", verifyToken, getCustomerAppointmentById);
router.patch("/booking/:id/cancel", verifyToken, cancelAppointment);
router.get("/staffAppointment", verifyToken, authorizeRoles('STAFF'), getStaffAppointments);
router.get("/staff/:id", verifyToken, authorizeRoles('STAFF'), getStaffAppointmentById);
router.put("/staff/:id/confirm", verifyToken, authorizeRoles('STAFF'), confirmAppointment);
router.put("/staff/:id/reject", verifyToken, authorizeRoles('STAFF'), rejectAppointment);
router.put("/staff/:id/complete", verifyToken, authorizeRoles('STAFF'), completeAppointment);
router.get("/admin/all", verifyToken, authorizeRoles("ADMIN"), getAllAppointments);

export default router;