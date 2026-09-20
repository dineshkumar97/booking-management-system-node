import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import UserDetails from "../models/userDetailsModel.js";
import ServiceDetails from "../models/serviceModel.js";


// CREATE STAFF
export const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone
    } = req.body;

    // Validation
    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, password and phone are required"
      });
    }

    if (password.length < 5) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    // Check duplicate email
    const existingUser = await UserDetails.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create staff
    const staff = await UserDetails.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      role: "STAFF",
      status: "ACTIVE"
    });

    return res.status(201).json({
      message: "Staff created successfully",
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
        createdAt: staff.createdAt
      }
    });

  } catch (error) {
    console.error("Create staff error:", error);

    return res.status(500).json({
      message: "Failed to create staff"
    });
  }
};


// GET ALL STAFF
export const getStaff = async (req, res) => {
  try {
    const staff = await UserDetails.find({
      role: "STAFF"
    })
      .select("-password")
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      message: "Staff fetched successfully",
     data: staff
    });

  } catch (error) {
    console.error("Get staff error:", error);

    return res.status(500).json({
      message: "Failed to fetch staff"
    });
  }
};


// GET STAFF BY ID
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID"
      });
    }

    const staff = await UserDetails.findOne({
      _id: id,
      role: "STAFF"
    }).select("-password");

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    return res.status(200).json({
      message: "Staff fetched successfully",
      data:staff
    });

  } catch (error) {
    console.error("Get staff details error:", error);

    return res.status(500).json({
      message: "Failed to fetch staff"
    });
  }
};


// UPDATE STAFF
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      designation
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID"
      });
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        message: "Name, email and phone are required"
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    // Check email used by another user
    const existingUser = await UserDetails.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: id }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const staff = await UserDetails.findOneAndUpdate(
      {
        _id: id,
        role: "STAFF"
      },
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        designation:designation.trim()
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    return res.status(200).json({
      message: "Staff updated successfully",
      data:staff
    });

  } catch (error) {
    console.error("Update staff error:", error);

    return res.status(500).json({
      message: "Failed to update staff"
    });
  }
};


// UPDATE STAFF STATUS
export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID"
      });
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        message: "Status must be ACTIVE or INACTIVE"
      });
    }

    const staff = await UserDetails.findOneAndUpdate(
      {
        _id: id,
        role: "STAFF"
      },
      {
        status
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    return res.status(200).json({
      message: `Staff ${status.toLowerCase()} successfully`,
     data: staff
    });

  } catch (error) {
    console.error("Update staff status error:", error);

    return res.status(500).json({
      message: "Failed to update staff status"
    });
  }
};


// DELETE STAFF
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID"
      });
    }

    const staff = await UserDetails.findOneAndDelete({
      _id: id,
      role: "STAFF"
    });

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    return res.status(200).json({
      message: "Staff deleted successfully"
    });

  } catch (error) {
    console.error("Delete staff error:", error);

    return res.status(500).json({
      message: "Failed to delete staff"
    });
  }
};


export const assignServicesToStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { services } = req.body;

    // 1. Validate staff ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid staff ID"
      });
    }

    // 2. Validate services
    if (!Array.isArray(services)) {
      return res.status(400).json({
        message: "Services must be an array"
      });
    }

    // 3. Check staff
    const staff = await UserDetails.findOne({
      _id: id,
      role: "STAFF"
    });

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    // 4. Check services exist and are active
    const activeServices = await ServiceDetails.find({
      _id: { $in: services },
      status: "ACTIVE"
    }).select("_id");

    if (activeServices.length !== services.length) {
      return res.status(400).json({
        message: "One or more services are invalid or inactive"
      });
    }

    // 5. Remove duplicate service IDs
    const uniqueServices = [
      ...new Set(
        services.map(serviceId => serviceId.toString())
      )
    ];

    // 6. Assign services
    staff.services = uniqueServices;

    await staff.save();

    // 7. Get updated staff
    const updatedStaff = await UserDetails.findById(id)
      .select("-password")
      .populate(
        "services",
        "name description duration price status"
      );

    return res.status(200).json({
      message: "Services assigned to staff successfully",
      staff: updatedStaff
    });

  } catch (error) {

    console.error(
      "Assign services error:",
      error
    );

    return res.status(500).json({
      message: "Failed to assign services"
    });
  }
};