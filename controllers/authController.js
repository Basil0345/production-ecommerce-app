import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js'
import { comparePassword, hashPassword, sendOtp } from './../helpers/authHelper.js';
import JWT from 'jsonwebtoken';
import otp from '../models/otp.js';
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        //validation
        if (!name) {
            return res.send({ message: 'Name is Required' });
        }
        if (!email) {
            return res.send({ message: 'Email is Required' });
        }
        if (!password) {
            return res.send({ message: 'Password is Required' });
        }
        if (!phone) {
            return res.send({ message: 'Phone no is Required' });
        }
        if (!address) {
            return res.send({ message: 'Address is Required' });
        }
        if (!answer) {
            return res.send({ message: 'Answer is Required' });
        }
        //register user
        const hashedPassword = await hashPassword(password);
        const validationAnswer = answer.toLowerCase()
        //save
        const user = await new userModel({ name, email, password: hashedPassword, phone, address, answer: validationAnswer }).save();
        res.status(200).send({
            success: true,
            message: 'User Registered Successfully',
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Registration',
            error
        })
    }
};

//POST LOGIN

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        // validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: 'Invalid username or password'
            })
        }
        //user check or email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'Email is not registered'
            })
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Invalid Password'
            })
        }
        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })
        res.status(200).send({
            success: true,
            message: 'login successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in login',
            error
        })
    }

};

//Forgot Password Controller
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        if (!email) {
            return res.status(400).send({ message: 'email is required' })
        }
        if (!answer) {
            return res.status(400).send({ message: 'answer is required' })
        }
        if (!newPassword) {
            return res.status(400).send({ message: 'New Password is required' })
        }
        //Check
        const validationAnswer = answer.toLowerCase()
        const user = await userModel.findOne({ email, answer: validationAnswer })

        //validation

        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'Wrong Email or Answer'
            })
        }

        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully "
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'something went wrong',
            error
        })
    }
}

export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);
        //password
        if (password && password.length < 6) {
            return res.json({ error: 'Password is required and 6 character long' });
        }
        //hashing 
        const hashedPassword = password ? await hashPassword(password) : undefined;

        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            address: address || user.address,
            phone: phone || user.phone

        }, { new: true });
        res.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            updatedUser
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error while updating profile',
            error
        })
    }
};

//orders
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: '-1' });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while getting Orders',
            error
        })
    }
};

//get all orders

export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: '-1' })
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while getting Orders',
            error
        })
    }
};

//order status

export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId,
            { status },
            { new: true }
        );
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while getting Orders',
            error
        })
    }
};

//Check existing user -> Registration 
export const checkExistingUser = async (req, res, next) => {
    try {
        //check user
        const existingUser = await userModel.findOne({ email: req.params.MailId });
        //existing user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Already Registered'
            })
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Something went wrong',
            error
        })
    }

};


//sendOtpController
export const sendOtpController = async (req, res) => {
    try {
        let data = await otp.findOneAndDelete({ email: req.params.MailId });
        let otpcode = Math.floor((Math.random() * 10000) + 1);
        let otpData = new otp({
            email: req.params.MailId,
            code: otpcode,
            expireIn: new Date().getTime() + 300 * 1000
        })
        let otpResponse = await otpData.save();
        await sendOtp(otpResponse.email, otpResponse.code);
        return res.status(200).send({
            success: true,
            message: 'Check Inbox',
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while sending otp',
            error
        })
    }
};


//verify Otp controller
export const verifyOtpController = async (req, res, next) => {
    try {
        const otpCode = req.params.otp;
        let data = await otp.findOne({ email: req.body.email, code: otpCode });
        if (data) {
            let currentTime = new Date().getTime();
            let diff = data.expireIn - currentTime;
            if (diff < 0) {
                console.log("timeOut");
                await otp.findOneAndDelete({ email: req.body.email });
                return res.status(200).send({ message: 'OTP Expired' });
            } else {
                await otp.findOneAndDelete({ email: req.body.email });
                next();
            }
        } else {
            res.status(200).send({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.log(error);
    }
}