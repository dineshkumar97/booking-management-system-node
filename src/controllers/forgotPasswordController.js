import crypto from "crypto";
import bcrypt from 'bcryptjs';
import { sendForgotPasswordEmail } from "../services/emailService.js";
import UserDetails from "../models/userDetailsModel.js";
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        const employee = await UserDetails.findOne({
            email: email.toLowerCase()
        });
        // Important:
        // Don't reveal whether email exists
        if (!employee) {
            return res.status(200).json({
                message: "If the email exists, a reset link has been sent."
            });
        }
        // Generate random token
        const resetToken = crypto.randomBytes(32).toString("hex");
        // Hash token before storing
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        // Token expires after 15 minutes
        employee.resetPasswordToken = hashedToken;
        employee.resetPasswordExpires =
            new Date(Date.now() + 15 * 60 * 1000);
        await employee.save();

        // Send raw token in email
        await sendForgotPasswordEmail(
            employee,
            resetToken
        );

        return res.status(200).json({
            message: "If the email exists, a reset link has been sent."
        });

    } catch (error) {

        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const resetPassword = async (req, res) => {

    try {

        const {
            token,
            password
        } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required"
            });
        }

        // Validate password
        if (password.length < 5) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        // Hash received token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find employee
        const employee = await UserDetails.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                $gt: new Date()
            }
        });

        if (!employee) {
            return res.status(400).json({
                message: "Invalid or expired reset link"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        employee.password = hashedPassword;

        // Remove reset token
        employee.resetPasswordToken = null;
        employee.resetPasswordExpires = null;

        await employee.save();

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {

        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};