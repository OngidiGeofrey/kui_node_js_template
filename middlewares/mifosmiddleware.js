const yup = require('yup');
const { MifosUser } = require("../db");

// ========================================================================

// Schema - Login
let schemaLogin = yup.object().shape({
	username: yup.string().required('Please enter Username'),
	password: yup.string().required('Please enter Password'),
});

// Validation - Login
module.exports.validationLogin = (req, res, next) => {
	// validations here
	console.log('🐞 validationLogin');

	schemaLogin
		.validate(
			{
				username: req.body.username,
				password: req.body.password,
			},
			{ abortEarly: false }
		)
		.then(function () {
			next();
		})
		.catch(function (err) {
			return next(err);
		});
}