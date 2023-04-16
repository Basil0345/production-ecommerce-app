import express from 'express';
import { checkExistingUser, checkExistingUserForgot, forgotPasswordController, getAllOrdersController, getAllUsersController, getOrdersController, loginController, orderStatusController, registerController, sendOtpController, updateProfileController, verifyOtpController } from '../controllers/authController.js';
import { IsOtpSent, isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
//router object
const router = express.Router();

//routing
//LOGIN || POST
router.post('/login', loginController);

//Forgot Password
router.post('/forgot-password/:MailId', checkExistingUserForgot, sendOtpController);

//verifyOtp -> forgot password
router.post("/verifyforgototp/:otp", verifyOtpController, forgotPasswordController)


//protected User route auth
router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({
        ok: true
    })
})

//protected Admin route auth
router.get('/admin-auth', requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({
        ok: true
    })
})

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController)

//All orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

//All users
router.get("/all-users", requireSignIn, isAdmin, getAllUsersController);

//order status update
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);

//sendOtp
router.post("/sendOtp/:MailId", checkExistingUser, sendOtpController);

//OTP FORM - Access
router.get("/openotp", IsOtpSent, (req, res) => {
    res.status(200).send({
        ok: true
    });
});

//verifyOtp
router.post("/verifyotp/:otp", verifyOtpController, registerController)

export default router;