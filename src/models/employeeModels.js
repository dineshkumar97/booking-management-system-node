import mongoose from "mongoose";

const employeeListSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        phone: {
            type: String
        },

        dob: {
            type: String,
            required: true,
        },
        department: {
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

const EmployeeList = mongoose.model(
    "EmployeeList",
    employeeListSchema
);

export default EmployeeList;