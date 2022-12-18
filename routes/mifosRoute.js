const {Router} = require('express');
const router = Router();
const axios = require('axios');
const {login, register, createClient} = require('../controllers/mifosController');

router.post('/mifos-login', login);
router.post('/mifos-register', register);
router.post('/mifos-create-client', createClient);

module.exports = router;