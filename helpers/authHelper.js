import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

export const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
};

export const comparePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
};

export const sendOtp = async (mailId, otpCode) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: 'awesomecreator09@gmail.com',
                pass: process.env.NODEMAILER_ADMIN_PASSWORD
            }
        });
        let info = await transporter.sendMail({
            from: 'awesomecreator09@gmail.com', // sender address
            to: mailId,
            subject: "OTP VERIFICATION ✔", // Subject line
            text: `Your OTP : ${otpCode}`, // plain text body
        });
        return info;
    } catch (error) {
        console.log(error);
    }
};
