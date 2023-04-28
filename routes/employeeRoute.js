const { Router } = require("express");
const router = Router();
const axios = require("axios");
const {
	login,
	register,
	createClient,
	makeLoanRepayment,
} = require("../controllers/employeeController");
const {
	validationLogin,
	validationRegister,
	validationCreateClient,
	validationRepayLoan,
} = require("../middlewares/employeeMiddleware");
 

const mifosController = require('../controllers/employeeController');
router.get('/',mifosController.listing);
//loan products listing 
 
module.exports = router;
