import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";

// customer create
export const createAppointment = async (req, res) => {
  try {
    const {
      serviceId,
      staffId,
      appointmentDate,
      startTime,
      endTime,
      notes
    } = req.body;

    // 1. Validate request
    if (
      !serviceId ||
      !staffId ||
      !appointmentDate ||
      !startTime
    ) {
      return res.status(400).json({
        message: "Service, staff, date and start time are required"
      });
    }

    // 2. Get logged-in customer
    const customerId = req.user.id;
    // 3. Check whether slot is already booked
    const existingAppointment = await Appointment.findOne({
      staffId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      status: {
        $in: ["PENDING", "CONFIRMED"]
      }
    });
    if (existingAppointment) {
      return res.status(409).json({
        message: "This time slot is already booked"
      });
    }
    // 4. Generate unique Order ID
    const orderId =
      `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    // 5. Create appointment
    const appointment = await Appointment.create({
      orderId,
      customerId,
      serviceId,
      staffId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime: endTime || "",
      status: "PENDING",
      notes: notes || ""
    });
    // 6. Response
    return res.status(201).json({
      message: "Appointment booked successfully",
      data: {
        id: appointment._id,
        orderId: appointment.orderId,
        customerId: appointment.customerId,
        serviceId: appointment.serviceId,
        staffId: appointment.staffId,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes
      }
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );
    return res.status(500).json({
      message: "Failed to create appointment"
    });
  }
};
export const getMyAppointments = async (req, res) => {
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

    console.error(
      "Get my appointments error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch appointments"
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const customerId = req.user.id;

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

    console.error(
      "Get appointment details error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch appointment"
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID"
      });
    }

    // 2. Get logged-in customer
    const customerId = req.user._id;

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
        message: `Appointment cannot be cancelled because it is already ${appointment.status}`
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

    console.error(
      "Cancel appointment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel appointment"
    });
  }
};


export const getStaffAppointments = async (req, res) => {
  try {

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

    console.error(
      "Get staff appointments error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch staff appointments"
    });

  }
};

export const getStaffAppointmentById = async (req, res) => {
  try {
    const staffId = req.user.id;
    const appointmentId = req.params.id;

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
      message: "Appointment fetched successfully",
      data: appointment
    });

  } catch (error) {
    console.error(
      "Get staff appointment details error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch appointment"
    });
  }
};



export const confirmAppointment = async (req, res) => {
  try {

    const staffId = req.user.id;
    const appointmentId = req.params.id;

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

    console.error(
      "Confirm appointment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to confirm appointment"
    });

  }
};


export const rejectAppointment = async (req, res) => {
  try {

    const staffId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        staffId,
        status: "PENDING"
      },
      {
        status: "REJECTED"
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

    console.error(
      "Reject appointment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to reject appointment"
    });

  }
};


export const completeAppointment = async (req, res) => {
  try {
    const staffId = req.user.id;
    const appointmentId = req.params.id;

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
    console.error(
      "Complete appointment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to complete appointment"
    });
  }
};