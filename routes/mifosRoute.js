const {Router} = require('express');
const router = Router();
const mifosController = require('../controllers/mifosController');

router.post('/loanproducts/listing',mifosController.listing);

module.exports = router;
