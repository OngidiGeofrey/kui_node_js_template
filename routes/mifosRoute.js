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


const mifosController = require('../controllers/mifosController');
//loan products listing 
router.post('/loanproducts/listing',mifosController.listing);

//retrieve a loan product
router.post('/loanproducts/:id',mifosController.get_loan_product_by_id);

//list loans
router.post('/loans/listing',mifosController.get_loan_applications);

//loan application 
router.post('/loans/:id',mifosController.loan_application);

// list loans applied by a client
router.post('/loans/client/:id',mifosController.client_accounts);

//list client  loan summary details
router.post('/client/summary/:id',mifosController.client_summary);

//withdraw a loan
router.post('/loans/withdraw/:id',mifosController.withdraw_loan_application);
module.exports = router;
