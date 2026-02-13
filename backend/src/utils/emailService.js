import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"MediStock" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your MediStock Account",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
                    <h2 style="color: #10b981; text-align: center;">Welcome to MediStock!</h2>
                    <p style="font-size: 16px; color: #333;">Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #059669;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666; text-align: center;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
