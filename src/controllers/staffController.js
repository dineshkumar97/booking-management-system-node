import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import UserDetails from "../models/userDetailsModel.js";
import ServiceDetails from "../models/serviceModel.js";


// CREATE STAFF
export const createStaff = async  (req, res, next) => {
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
    next(error);
  }
};


// GET ALL STAFF
export const getStaff = async  (req, res, next) => {
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
    next(error);
  }
};


// GET STAFF BY ID
export const getStaffById = async  (req, res, next) => {
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
    next(error);
  }
};


// UPDATE STAFF
export const updateStaff = async  (req, res, next) => {
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
    next(error);
  }
};


// UPDATE STAFF STATUS
export const updateStaffStatus = async  (req, res, next) => {
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
    next(error);
  }
};


// DELETE STAFF
export const deleteStaff = async  (req, res, next) => {
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
   next(error);
  }
};
