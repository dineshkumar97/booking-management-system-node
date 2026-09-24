import mongoose from "mongoose";
const staffSchema = new mongoose.Schema(
  {
    uniqueUserId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Login / connection status
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
        'out_of_office'
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

      startDate: {
        type: Date,
        default: null
      },

      endDate: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;