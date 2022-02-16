const { Router } = require('express');
const router = Router();

// Import Middlewares
const {
	validationSignup,
	isUserExistsSignup,
	validateLogin,
	authenticateToken,
	validationUpdateProfile,
	isUserExistsUpdate,
	validationChangePassword,
	validationForgotPassword,
	isEmailRegistered,
	validationResetPassword,
	isResetTokenValid,
} = require('../middlewares/userMiddleware');

// Import Controllers
const usersController = require('../controllers/usersController');

router.post(
	'/user/sign-up',
	[validationSignup, isUserExistsSignup],
	usersController.signUp
); // sends verification link to user
router.get('/user/sign-up/verify/:token', usersController.signUpVerify); // verify user link when clicked
router.post('/user/refresh-token',[authenticateToken], usersController.refreshToken); // verify user link when clicked
router.post('/user/login', [validateLogin], usersController.login);
router.post('/user/get-user', [authenticateToken], usersController.getLoggedInUser); // get logged in user
router.post(
	'/user/update-profile',
	[authenticateToken, validationUpdateProfile, isUserExistsUpdate],
	usersController.updateProfile
);
router.post(
	'/user/change-password',
	[authenticateToken, validationChangePassword],
	usersController.changePassword
);
router.post(
	'/user/forgot-password',
	[validationForgotPassword, isEmailRegistered],
	usersController.forgotPassword
); // sends reset link to user

router.get(
	'/user/forgot-password/verify/:token',
	usersController.forgotPasswordVerify
); // verify reset link when clicked
router.post(
	'/user/reset-password',
	[validationResetPassword, isResetTokenValid],
	usersController.resetPassword
); // reset to new password

module.exports = router;
