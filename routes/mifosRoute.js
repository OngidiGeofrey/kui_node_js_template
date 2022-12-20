const { Router } = require("express");
const router = Router();
const axios = require("axios");
const {
	login,
	register,
	createClient,
	makeLoanRepayment,
} = require("../controllers/mifosController");
const {
	validationLogin,
	validationRegister,
	validationCreateClient,
	validationRepayLoan,
} = require("../middlewares/mifosmiddleware");

router.post("/mifos-login", [validationLogin, login]);
router.post("/mifos-register", [validationRegister, register]);
router.post("/mifos-create-client", [validationCreateClient, createClient]);
router.post("/mifos-make-loan-repayment", [
	validationRepayLoan,
	makeLoanRepayment,
]);

module.exports = router;
