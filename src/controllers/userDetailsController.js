import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3.js';
import UserDetails from "../models/userDetailsModel.js";
import ServiceDetails from "../models/serviceModel.js";
import generationToken from "../tokengeneration/generationToken.js";
import { sendSignupCreatedEmail } from "../services/emailService.js";
import StaffDetails from "../models/staffModel.js";


export const createUser = async  (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            designation,
            status,
            role,
            password
        } = req.body;
        const defaultPassword = password || "12345";
        const hashedPassword = await bcrypt.hash(
            defaultPassword,
            10
        );
        // Check existing email
        const existingUser = await UserDetails.findOne({
            email
        });
        if (existingUser) {
            return res.status(409).json({
                message: 'User Already Exists'
            });
        }
        // Allow only CUSTOMER / STAFF
        const userRole =
            role === 'ADMIN'
                ? 'ADMIN'
                : role === 'STAFF'
                    ? 'STAFF'
                    : 'CUSTOMER';
        // =====================================
        // Generate Unique User ID
        // =====================================
        const lastUser = await UserDetails
            .findOne({
                uniqueUserId: {
                    $regex: /^BSM\d+$/
                }
            })
            .sort({
                uniqueUserId: -1
            });
        let uniqueUserId = "BSM000001";
        if (lastUser?.uniqueUserId) {
            const lastNumber = parseInt(
                lastUser.uniqueUserId.replace("BSM", ""),
                10
            );
            uniqueUserId =
                `BSM${String(lastNumber + 1).padStart(6, "0")}`;
        }
        // =====================================
        // Hash Password
        // =====================================
        // =====================================
        // Create User
        // =====================================
        const newUser = new UserDetails({
            name,
            // email,
            phone,
            password: hashedPassword,
            role: userRole,
            uniqueUserId
        });
        await newUser.save();
        // Signup Email
        await sendSignupCreatedEmail(newUser);
        // =====================================
        // Response
        // =====================================
        return res.status(201).json({
            message: 'Signup successfully',
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                uniqueUserId: newUser.uniqueUserId
            }
        });
    } catch (error) {
        next(error);
    }
};
export const getUsers = async  (req, res, next) => {
    try {
        const users = await UserDetails.find();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const authenticate = async  (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1. Find user by email
        const user = await UserDetails.findOne({ email });
        // 2. Email not found
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        // 3. Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        // 4. Password doesn't match
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        // 5. Check user status
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: "User account is inactive"
            });
        }
        // 6. Generate JWT
        const token = generationToken(user);
        const staff = await StaffDetails.findOne({
            uniqueUserId: user.uniqueUserId
        });
        // 7. User details
        const userDetails = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user?.role,
            status: user.status,
            uniqueUserId: user.uniqueUserId,
            availabilityStatus:
                staff?.availabilityStatus || 'available',

            onlineStatus:
                staff?.onlineStatus || 'offline'
        };
        // 8. Login successful
        return res.status(200).json({
            message: "Login successful",
            token: token,
            data: userDetails
        });
    } catch (error) {
        next(error);
    }
};

export const userDelete = async  (req, res, next) => {
    try {
        const { idUser } = req.params;
        const user = await UserDetails.findByIdAndDelete(idUser);
        if (!user) {
            return res.status(404).json({
                message: 'user not found'
            });
        }
        return res.status(200).json({
            message: 'user deleted successfully',
            data: user
        });
    } catch (error) {
        console.error('Delete user error:', error);
        next(error);

    }
};

export const updateUsers = async  (req, res, next) => {
    try {
        const { name, email, phone, designation } = req.body;
        const updateData = {
            name,
            email,
            phone, designation
        };
        // Upload profile image to S3
        if (req.file) {
            const fileName = `uploadImages/${Date.now()}-${req.file.originalname}`;
            const command = new PutObjectCommand({
                Bucket: 'booking-management-system-images-upload',
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            });
            await s3Client.send(command);
            // Store only S3 key in MongoDB
            updateData.profileImage = fileName;
        }
        const user = await UserDetails.findByIdAndUpdate(
            req.params.idUser,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );
        const staff = await StaffDetails.findOne({
            uniqueUserId: user.uniqueUserId
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        return res.status(200).json({
            message: 'Profile has been updated successfully.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                designation: user.designation,
                profileImage: user.profileImage || '',
                availabilityStatus:
                    staff?.availabilityStatus || 'available',
                onlineStatus:
                    staff?.onlineStatus || 'offline'
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        next(error);

    }
};

export const getProfile = async  (req, res, next) => {
    try {
        const user = await UserDetails.findById(req.params.idUser);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        // Generate S3 URL
        let profileImage = '';
        if (user.profileImage) {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: user.profileImage
            });
            profileImage = await getSignedUrl(
                s3Client,
                command,
                {
                    expiresIn: 3600
                }
            );
        }
        const staff = await StaffDetails.findOne({
            uniqueUserId: user.uniqueUserId
        });
        return res.status(200).json({
            message: 'Profile fetched successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user?.role,
                status: user.status,
                // IMPORTANT
                profileImage: profileImage,
                uniqueUserId: user.uniqueUserId,
                availabilityStatus:
                    staff?.availabilityStatus || 'available',
                onlineStatus:
                    staff?.onlineStatus || 'offline'
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        next(error);

    }
};

export const assignServicesToStaff = async  (req, res, next) => {
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
        // 4. Remove duplicate service IDs
        const uniqueServices = [
            ...new Set(
                services.map(
                    serviceId => serviceId.toString()
                )
            )
        ];
        // 5. Check services exist and are active
        const activeServices = await ServiceDetails.find({
            _id: {
                $in: uniqueServices
            },
            status: "ACTIVE"
        }).select("_id");
        if (
            activeServices.length !==
            uniqueServices.length
        ) {
            return res.status(400).json({
                message:
                    "One or more services are invalid or inactive"
            });
        }
        // 6. Update services
        const updatedStaff =
            await UserDetails.findByIdAndUpdate(
                id,
                {
                    $set: {
                        services: uniqueServices
                    }
                },
                {
                    new: true,
                    runValidators: false
                }
            )
                .select("-password")
                .populate(
                    "services",
                    "name description duration price status"
                );
        // 7. Response
        return res.status(200).json({
            message:
                "Services assigned to staff successfully",
            staff: updatedStaff
        });
    } catch (error) {
        console.error(
            "Assign services error:",
            error
        );
        next(error);

    }
};
// | Situation                         |                      Status |
// | --------------------------------- | --------------------------: |
// | User created                      |               `201 Created` |
// | User already exists               |              `409 Conflict` |
// | Invalid/missing input             |           `400 Bad Request` |
// | Login unauthorized/wrong password |          `401 Unauthorized` |
// | No permission                     |             `403 Forbidden` |
// | User not found                    |             `404 Not Found` |
// | Server/database error             | `500 Internal Server Error` |
