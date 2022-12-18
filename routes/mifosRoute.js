const {Router} = require('express');
const router = Router();
const mifosController = require('../controllers/mifosController');
//loan products listing 
router.post('/loanproducts/listing',mifosController.listing);

//retrieve a loan product
router.post('/loanproducts/:id',mifosController.get_loan_product_by_id);

//list loans
router.post('/loans/listing',mifosController.get_loan_applications);

// list loans applied by a client
router.post('/loans/client/:id',mifosController.client_accounts);

//list client  loan summary details
router.post('/client/summary/:id',mifosController.client_summary);
module.exports = router;
