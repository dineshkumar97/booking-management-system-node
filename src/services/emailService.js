import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Employee Create
export const sendEmployeeCreatedEmail = async ({
    name,
    employeeId,
    department,
    email,
    createdAt
}) => {
    const templatePath = path.join(
        __dirname,
        "../templates/emails/employeeCreated.html"
    );
    const formattedDate = new Date(createdAt)
        .toLocaleDateString("en-GB")
        .replaceAll("/", "-");
    let html = await fs.readFile(templatePath, "utf-8");

    // Replace dynamic values
    html = html
        .replaceAll("{{name}}", name)
        .replaceAll("{{employeeId}}", employeeId)
        .replaceAll("{{department}}", department)
        .replaceAll("{{email}}", email)
        .replaceAll("{{joiningDate}}", formattedDate);
    await transporter.sendMail({
        from: `"HR Team" <${process.env.EMAIL_USER}>`,
        // to: 'dineshkumarppn07@gmail.com',
        to: email,
        subject: "Employee Account Created",
        html
    }).then(() => {
        console.log('Employee created email sent successfully');
    })
        .catch((error) => {
            console.error('Employee email failed:', error);
        });

};

// Forgot Reset
export const sendForgotPasswordEmail = async (employee, resetToken) => {

    const templatePath = path.join(
        __dirname,
        "../templates/emails/passwordReset.html"
    );

    let html = await fs.readFile(templatePath, "utf-8");

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('resl', resetLink)
    html = html
        .replaceAll("{{name}}", employee.name)
        .replaceAll("{{resetLink}}", resetLink);

    await transporter.sendMail({
        from: `"HR Team" <${process.env.EMAIL_USER}>`,
        to: employee.email,
        //    to: 'dineshkumarppn07@gmail.com',
        subject: "Reset Your Password",
        html
    });
};


// Signup Template

export const sendSignupCreatedEmail = async ({ name, email }) => {
    const templatePath = path.join(
        __dirname,
        "../templates/emails/signup.html"
    );

    let html = await fs.readFile(templatePath, "utf-8");
    const loginLink = `${process.env.FRONTEND_URL}/login`;

    // Replace dynamic values
    html = html
        .replaceAll("{{name}}", name)
        .replaceAll("{{email}}", email)
        .replaceAll("{{loginLink}}", loginLink);
    await transporter.sendMail({
        from: `"HR Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome! Your Account Has Been Created",
        html
    }).then(() => {
        console.log('Account created email sent successfully');
    })
        .catch((error) => {
            console.error('Account email failed:', error);
        });

};