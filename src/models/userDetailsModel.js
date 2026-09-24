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
    onlineStatus: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "INACTIVE"
        ],
        default: "ACTIVE"
    },
    uniqueUserId: {
        type: String,
        required: true,
        unique: true
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        default: ""
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        }
    ],
    onlineStatus: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },

    // User selected availability
    availabilityStatus: {
        type: String,
        enum: [
            'available',
            'busy',
            'away',
            'dnd',
            'out_of_office',
            'offline'
        ],
        default: 'available'
    },

    lastSeen: {
        type: Date,
        default: null
    },

    outOfOffice: {
        enabled: {
            type: Boolean,
            default: false
        },
    }

},

    {
        timestamps: true
    });

const UserDetails = mongoose.model(
    "UserDetails",
    userDetailsSchema
);

export default UserDetails;