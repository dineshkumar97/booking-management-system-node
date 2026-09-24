import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

import UserDetails from "../models/userDetailsModel.js";
import OtpDetails from "../models/otpModel.js";
import generationToken from "../tokengeneration/generationToken.js";
import { otpEmailSend } from "../services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendLoginOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user = await UserDetails.findOne({
            email: normalizedEmail
        });

        console.log(user)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        // Generate 6 digit OTP
        const otp = crypto
            .randomInt(100000, 1000000)
            .toString();

        // OTP expires after 5 minutes
        const expiresAt = new Date(
            Date.now() +  1* 60 * 1000
        );

        // Save OTP
        await OtpDetails.findOneAndUpdate(
            {
                email: normalizedEmail
            },
            {
                email: normalizedEmail,
                otp,
                expiresAt
            },
            {
                upsert: true,
                new: true
            }
        );

        // Send OTP email
        await otpEmailSend({
            name: user.name,
            // email: user.email,
            otp
        });

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(
            "Send login OTP error:",
            error
        );

        return res.status(500).json({
            message: "Failed to send OTP"
        });
    }
};

export const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const normalizedOtp =
            otp.toString().trim();

        // Find OTP
        const otpDetails = await OtpDetails.findOne({
            email: normalizedEmail
        });

        if (!otpDetails) {
            return res.status(400).json({
                message:
                    "OTP not found. Please request a new OTP."
            });
        }

        // Check OTP expiry
        if (
            otpDetails.expiresAt.getTime() <
            Date.now()
        ) {
            await OtpDetails.deleteOne({
                email: normalizedEmail
            });

            return res.status(400).json({
                message:
                    "OTP has expired. Please request a new OTP."
            });
        }

        // Check OTP
        if (otpDetails.otp !== normalizedOtp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Find user
        const user = await UserDetails.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check account status
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        // Generate existing JWT
        const token = generationToken(user);

        // Delete OTP after successful login
        await OtpDetails.deleteOne({
            email: normalizedEmail
        });

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                role: user.role,
                designation: user.designation,
                status: user.status,
                uniqueUserId: user.uniqueUserId
            }
        });

    } catch (error) {
        console.error(
            "Verify login OTP error:",
            error
        );

        return res.status(500).json({
            message: "Failed to verify OTP"
        });
    }
};