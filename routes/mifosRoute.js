const {Router} = require('express');
const router = Router();
const mifosController = require('../controllers/mifosController');

router.post('/loanproducts/listing',mifosController.listing);
router.post('/loanproducts/:id',mifosController.get_loan_product_by_id);
router.post('/loan/:client_id',mifosController.get_loan_product_by_id);


module.exports = router;
