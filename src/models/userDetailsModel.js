import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema(
    {
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
        role: {
            type: String
        },
        status: {
            type: String
        },

        password: {
            type: String,
            required: true
        },
        resetPasswordToken: {
            type: String,
            default: null
        },

        resetPasswordExpires: {
            type: Date,
            default: null
        },
        profileImage: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

const UserDetails = mongoose.model(
    "UserDetails",
    userDetailsSchema
);

export default UserDetails;