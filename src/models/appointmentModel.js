import mongoose from "mongoose";
// import UserDetails from "./userDetailsModel.js";
// import Service from "./serviceModel.js";

const appointmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
      required: true
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetails",
      required: true
    },

    appointmentDate: {
      type: Date,
      required: true
    },

    startTime: {
      type: String,
      required: true
    },

    endTime: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        "REJECTED"
      ],
      default: "PENDING"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Appointment = mongoose.model(
  "AppointmentDetails",
  appointmentSchema
);

export default Appointment;