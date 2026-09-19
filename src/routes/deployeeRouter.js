import express from "express";

import {
    createDepartment,
    updateDepartment,
    getDepartments,
    toggleDepartmentStatus,
    deleteDepartment
   
} from "../controllers/departmentController.js";

const router = express.Router();
router.post("/create", createDepartment);
router.get("/all", getDepartments);
router.put('/update/:idUser', updateDepartment);
router.put('/status/:idUser',toggleDepartmentStatus);
router.delete('/delete/:idUser', deleteDepartment);


export default router;