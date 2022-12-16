const {Router} = require('express');
const router = Router();
const axios = require('axios');
const {login} = require('../controllers/mifosController');

router.post('/mifos-login', login);
// router.post('/mifos-register', mifosController.register);

module.exports = router;