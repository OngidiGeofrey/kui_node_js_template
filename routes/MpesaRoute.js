const { Router } = require("express");
const router = Router();
const axios = require("axios");
const {
	get_authorization_token,
	register,
	createClient,
	makeLoanRepayment,
} = require("../controllers/MpesaController");
const {
	validationKeys,
	validationRegister,
	validationCreateClient,
	validationRepayLoan,
} = require("../middlewares/mpesaMiddleware");
router.post("/mifos-login", [validationLogin, login]);
router.post("/mifos-register", [validationRegister, register]);


router.post("/Authentication", [validationKeys, get_authorization_token]);
module.exports = router;
