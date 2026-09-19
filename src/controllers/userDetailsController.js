import bcrypt from 'bcryptjs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3.js';
import UserDetails from "../models/userDetailsModel.js";
import generationToken from "../tokengeneration/generationToken.js";
import { sendSignupCreatedEmail } from "../services/emailService.js";


export const createUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existingUser = await UserDetails.findOne({ email });
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserDetails({ name, email, phone, password: hashedPassword });
            await newUser.save();
            await sendSignupCreatedEmail(newUser);
            return res.status(201).json({ message: 'Signup successfully' });
        }
        res.status(409).json({ message: 'User Already Exists' });

    } catch (error) {
        console.error(error);
        res.status(500).json({
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
        const isMatch = await bcrypt.compare(password, user.password);
        // 4. Password doesn't match
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        // 5. Login successful
        const token = generationToken(user);
        const userDetails = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone

        }
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
        const { name, email, phone } = req.body;

        const updateData = {
            name,
            email,
            phone
        };

        // Upload profile image to S3
        if (req.file) {

            const fileName = `uploadImages/${Date.now()}-${req.file.originalname}`;

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
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
                profileImage: user.profileImage || ''
            }
        });

    } catch (error) {

        console.error('Update user error:', error);

        return res.status(500).json({
            message: 'Something went wrong',
            error: error.message
        });
    }
};
// export const updateUsers = async (req, res) => {
//     try {
//         const { name, email, phone } = req.body;
//         const updateData = {
//             name,
//             email,
//             phone
//         };
//         // If image is uploaded
//         if (req.file) {
//             updateData.profileImage = req.file.originalname;
//         }
//         const user = await UserDetails.findByIdAndUpdate(
//             req.params.idUser,
//             updateData,
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );
//         if (!user) {
//             return res.status(404).json({
//                 message: 'User not found'
//             });
//         }
//         const userDetails = {
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             profileImage: user.profileImage
//         };
//         return res.status(200).json({
//             message: 'Profile has been updated successfully.',
//             data: userDetails
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: error.message,
//             error: error.message
//         });
//     }
// };



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


// | Situation                         |                      Status |
// | --------------------------------- | --------------------------: |
// | User created                      |               `201 Created` |
// | User already exists               |              `409 Conflict` |
// | Invalid/missing input             |           `400 Bad Request` |
// | Login unauthorized/wrong password |          `401 Unauthorized` |
// | No permission                     |             `403 Forbidden` |
// | User not found                    |             `404 Not Found` |
// | Server/database error             | `500 Internal Server Error` |
