import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { PutObjectCommand ,GetObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3.js';
import UserDetails from "../models/userDetailsModel.js";
import ServiceDetails from "../models/serviceModel.js";

import generationToken from "../tokengeneration/generationToken.js";
import { sendSignupCreatedEmail } from "../services/emailService.js";


export const createUser = async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            password,
            role
        } = req.body;


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

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // =====================================
        // Create User
        // =====================================

        const newUser = new UserDetails({
            name,
            email,
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

        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};



export const getUsers = async (req, res) => {
    try {
        const users = await UserDetails.find();

        res.status(200).json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get users"
        });
    }
};



// export const authenticate = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await UserDetails.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid email format' });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'InCorrect Password' });
//         }
//         // const token = generationToken(user);
//         const message = {
//             // token:token,
//             message: 'Login Successfully...'
//         }
//         res.json(message)
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: error.message
//         });
//     }
// }

export const authenticate = async (req, res) => {
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

        // 7. User details
        const userDetails = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user?.role,
            status: user.status
        };

        // 8. Login successful
        return res.status(200).json({
            message: "Login successful",
            token: token,
            data: userDetails
        });

    } catch (error) {

        console.error("Authentication error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};

export const userDelete = async (req, res) => {
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

        return res.status(500).json({
            message: 'Failed to delete department'
        });
    }
};

export const updateUsers = async (req, res) => {

    try {

        // ==============================
        // USER PERMISSION CHECK
        // ==============================

        const requestedUserId = req.params.idUser;

        const loggedInUserId =
            req.user._id.toString();

        const loggedInRole =
            req.user.role;

        // CUSTOMER and STAFF
        // can update only their own profile

        // ADMIN
        // can update any user

        if (
            loggedInRole !== 'ADMIN' &&
            requestedUserId !== loggedInUserId
        ) {
            return res.status(403).json({
                message:
                    'You do not have permission to update this user.'
            });
        }


        // ==============================
        // EXISTING PROFILE UPDATE CODE
        // ==============================

        const {
            name,
            email,
            phone
        } = req.body;

        const updateData = {
            name,
            email,
            phone
        };


        // ==============================
        // S3 PROFILE IMAGE
        // ==============================

        if (req.file) {

            const fileName =
                `uploadImages/${Date.now()}-${req.file.originalname}`;

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            });

            await s3Client.send(command);

            updateData.profileImage = fileName;
        }


        // ==============================
        // UPDATE USER
        // ==============================

        const user =
            await UserDetails.findByIdAndUpdate(
                req.params.idUser,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }


        // ==============================
        // RESPONSE
        // ==============================

        return res.status(200).json({
            message:
                'Profile has been updated successfully.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user?.role,
                status: user.status,
                profileImage: user.profileImage || ''
            }
        });

    } catch (error) {

        console.error(
            'Update user error:',
            error
        );

        return res.status(500).json({
            message: 'Something went wrong',
            error: error.message
        });
    }
};



export const getProfile = async (req, res) => {
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
                profileImage: profileImage
            }
        });

    } catch (error) {

        console.error('Get profile error:', error);

        return res.status(500).json({
            message: 'Something went wrong',
            error: error.message
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

        return res.status(500).json({
            message: "Failed to assign services",
            error: error.message
        });
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
