import express from "express";
import verifyToken from "../middleware/verifyToken.js";

import {
    createService, getServiceById, getServices, updateService, deleteService
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/create", createService);
router.get("/all",verifyToken, getServices);
router.get("/get/:id", getServiceById);
router.put("/update/:id", updateService);
router.delete("/delete/:id", deleteService);

export default router;