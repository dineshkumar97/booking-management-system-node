import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";
// =====================================================
// CUSTOMER - CREATE APPOINTMENT
// =====================================================
export const createAppointment = async  (req, res, next) => {
  try {
    const {
      serviceId,
      staffId,
      appointmentDate,
      startTime,
      endTime,
      notes
    } = req.body;
    
    // 2. Get logged-in customer
    const customerId =
      req.user._id.toString();
    // 3. Validate customer ID
    if (
      !mongoose.Types.ObjectId.isValid(
        customerId
      )
    ) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }
    // 4. Validate service ID
    if (
      !mongoose.Types.ObjectId.isValid(
        serviceId
      )
    ) {
      return res.status(400).json({
        message: "Invalid service ID"
      });
    }
    // 5. Validate staff ID
    if (
      !mongoose.Types.ObjectId.isValid(
        staffId
      )
    ) {
      return res.status(400).json({
        message: "Invalid staff ID"
      });
    }
    // 6. Check whether slot is already booked
    const existingAppointment =
      await Appointment.findOne({
        staffId,
        appointmentDate:
          new Date(appointmentDate),
        startTime,
        status: {
          $in: [
            "PENDING",
            "CONFIRMED"
          ]
        }
      });
    if (existingAppointment) {
      return res.status(409).json({
        message:
          "This time slot is already bookedp"
      });
    }
    // 7. Generate unique Order ID
    const lastAppointment =
      await Appointment
        .findOne({
          orderId: {
            $regex: /^BMSOR\d+$/
          }
        })
        .sort({
          orderId: -1
        });
    let orderId = "BMSOR000001";
    if (lastAppointment?.orderId) {
      const lastNumber =
        parseInt(
          lastAppointment.orderId
            .replace("BMS", ""),
          10
        );
      orderId =
        `BMSOR${String(
          lastNumber + 1
        ).padStart(6, "0")}`;
    }
    // 8. Create appointment
    const appointment =
      await Appointment.create({
        orderId,
        customerId,
        serviceId,
        staffId,
        appointmentDate:
          new Date(appointmentDate),
        startTime,
        endTime: endTime || "",
        status: "PENDING",
        notes: notes || ""
      });
    // 9. Response
    return res.status(201).json({
      message:
        "Appointment booked successfully",
      data: {
        id: appointment._id,
        orderId:
          appointment.orderId,
        customerId:
          appointment.customerId,
        serviceId:
          appointment.serviceId,
        staffId:
          appointment.staffId,
        appointmentDate:
          appointment.appointmentDate,
        startTime:
          appointment.startTime,
        endTime:
          appointment.endTime,
        status:
          appointment.status,
        notes:
          appointment.notes
      }
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// CUSTOMER - GET MY APPOINTMENTS
// =====================================================
export const getCustomerAppointments = async  (req, res, next) => {
  try {
    const customerId = req.user.id;
    const appointments = await Appointment.find({
      customerId
    })
      .populate(
        "serviceId",
        "name description duration price"
      )
      .populate(
        "staffId",
        "name email"
      )
      .sort({
        appointmentDate: -1,
        startTime: -1
      });
    return res.status(200).json({
      message: "Appointments fetched successfully",
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// CUSTOMER - GET APPOINTMENT BY ID
// =====================================================
export const getCustomerAppointmentById = async  (req, res, next) => {
  try {
    const { id } = req.params;
    // 1. Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID"
      });
    }
    // 2. Get logged-in customer
    const customerId = req.user.id;
    // 3. Get customer's appointment
    const appointment = await Appointment.findOne({
      _id: id,
      customerId
    })
      .populate(
        "serviceId",
        "name description duration price"
      )
      .populate(
        "staffId",
        "name email"
      );
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }
    return res.status(200).json({
      message: "Appointment fetched successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// CUSTOMER - CANCEL APPOINTMENT
// =====================================================
export const cancelAppointment = async  (req, res, next) => {
  try {
    const { id } = req.params;
    // 1. Validate appointment ID
    // 2. Get logged-in customer
    const customerId = req.user.id;
    // 3. Find customer's appointment
    const appointment = await Appointment.findOne({
      _id: id,
      customerId
    });
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }
    // 4. Only PENDING appointments can be cancelled
    if (appointment.status !== "PENDING") {
      return res.status(400).json({
        message:
          `Appointment cannot be cancelled because it is already ${appointment.status}`
      });
    }
    // 5. Update status
    appointment.status = "CANCELLED";
    await appointment.save();
    // 6. Response
    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// STAFF - GET STAFF APPOINTMENTS
// =====================================================
export const getStaffAppointments = async  (req, res, next) => {
  try {
    // Logged-in staff
    const staffId = req.user.id;
    const appointments = await Appointment.find({
      staffId
    })
      .populate(
        "customerId",
        "name email phone"
      )
      .populate(
        "serviceId",
        "name description duration price"
      )
      .populate(
        "staffId",
        "name email"
      )
      .sort({
        appointmentDate: -1,
        startTime: -1
      });
    return res.status(200).json({
      message: "Staff appointments fetched successfully",
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// STAFF - GET APPOINTMENT BY ID
// =====================================================
export const getStaffAppointmentById = async  (req, res, next) => {
  try {
    const staffId = req.user.id;
    const appointmentId = req.params.id;
    // 1. Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID"
      });
    }
    // 2. Get staff appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      staffId
    })
      .populate(
        "customerId",
        "name email phone"
      )
      .populate(
        "serviceId",
        "name description duration price"
      )
      .populate(
        "staffId",
        "name email"
      );
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }
    return res.status(200).json({
      message: "Staff appointment fetched successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// STAFF - CONFIRM APPOINTMENT
// =====================================================
export const confirmAppointment = async  (req, res, next) => {
  try {
    const staffId = req.user.id;
    const appointmentId = req.params.id;
    // 1. Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID"
      });
    }
    // 2. Confirm only PENDING appointment
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        staffId,
        status: "PENDING"
      },
      {
        status: "CONFIRMED"
      },
      {
        new: true
      }
    );
    if (!appointment) {
      return res.status(404).json({
        message: "Pending appointment not found"
      });
    }
    return res.status(200).json({
      message: "Appointment confirmed successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// STAFF - REJECT APPOINTMENT
// =====================================================
export const rejectAppointment = async  (req, res, next) => {
  try {
    const staffId = req.user._id;
    const appointmentId = req.params.id;
    const { comment } = req.body;
    // 1. Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID"
      });
    }
    // 2. Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Rejection comment is required"
      });
    }
    // 3. Reject only PENDING appointment
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        staffId,
        status: "PENDING"
      },
      {
        $set: {
          status: "REJECTED",
          comments: comment.trim()
        }
      },
      {
        new: true
      }
    );
    if (!appointment) {
      return res.status(404).json({
        message: "Pending appointment not found"
      });
    }
    return res.status(200).json({
      message: "Appointment rejected successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// STAFF - COMPLETE APPOINTMENT
// =====================================================
export const completeAppointment = async  (req, res, next) => {
  try {
    const staffId = req.user.id;
    const appointmentId = req.params.id;
    // 1. Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID"
      });
    }
    // 2. Complete only CONFIRMED appointment
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        staffId,
        status: "CONFIRMED"
      },
      {
        status: "COMPLETED"
      },
      {
        new: true
      }
    );
    if (!appointment) {
      return res.status(404).json({
        message: "Confirmed appointment not found"
      });
    }
    return res.status(200).json({
      message: "Appointment completed successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// STAFF - GET ALL APPOINTMENT
// =====================================================
export const getAllAppointments = async  (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate(
        "customerId",
        "name email phone"
      )
      .populate(
        "serviceId",
        "name description duration price"
      )
      .populate(
        "staffId",
        "name email"
      )
      .sort({
        appointmentDate: -1,
        startTime: -1
      });
    return res.status(200).json({
      message: "All appointments fetched successfully",
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};