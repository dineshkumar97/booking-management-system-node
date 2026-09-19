import mongoose from "mongoose";

const departmentListSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const DepartmentList = mongoose.model(
    "DepartmentList",
    departmentListSchema
);

export default DepartmentList;