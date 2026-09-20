import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        default: ""
    },

    profileImage: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: [
            "CUSTOMER",
            "STAFF",
            "ADMIN"
        ],
        default: "CUSTOMER"
    },

    designation: {
        type: String,
        trim: true,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "INACTIVE"
        ],
        default: "ACTIVE"
    },

    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        }
    ]
});

const UserDetails = mongoose.model(
    "UserDetails",
    userDetailsSchema
);

export default UserDetails;