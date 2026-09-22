import express from "express";

import {
    createStaff,
    getStaff,
    getStaffById,
    updateStaff,
    updateStaffStatus,
    deleteStaff,
} from "../controllers/staffController.js";

const router = express.Router();
// CREATE
router.post("/create",createStaff);
// GET ALL
router.get("/all",getStaff);
// GET BY ID
router.get("/get:id",getStaffById);
// UPDATE
router.put("/update/:id",updateStaff);

// STATUS
router.patch("/update:id/status",updateStaffStatus);
// DELETE
router.delete("/delete:id",deleteStaff);


export default router;