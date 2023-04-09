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

const mifosController = require('../controllers/mifosController');
router.post('/make-loan-repayment/:id',mifosController.make_loan_repayment);
//loan products listing 
router.post('/loanproducts/listing',mifosController.listing);

//amortization schedule 
router.post('/loans/amortization-schedule/:id',mifosController.amortization_schedule);

//retrieve a loan product
router.post('/loanproducts/:id',mifosController.get_loan_product_by_id);

//list loans
router.post('/loans/listing',mifosController.get_loan_applications);

//loan application 
router.post('/loans',mifosController.loan_application);

// list loans applied by a client
router.post('/loans/client/:id',mifosController.client_accounts);

//list client  loan summary details
router.post('/client/summary/:id',mifosController.client_summary);

//withdraw a loan
router.post('/loans/withdraw/:id',mifosController.withdraw_loan_application);
//Get Loan Statement
//e.g. http://localhost:8443/api/get-loan-statement/21
router.post('/get-loan-statement/:id', mifosController.getLoanStatement);
//retrieve client profile details.
router.post('/profile/:id', mifosController.retrieve_client_profile);

//retrieve client profile details.
router.post('/paymenttypes', mifosController.paymenttypes);


//client loan Balance.
router.post('/client/account/:id', mifosController.client_loan_balance);



router.post('/authentication', mifosController.get_authorization_token);

router.post('/stk_push', mifosController.stk_push);
module.exports = router;
