const { default: Axios } = require("axios");
const config = require('../config.json');

require("dotenv").config();


module.exports.login = async (req, res, next) => {
	try {
		const username = req.body.username;
		const password = req.body.password;
		const url = `${config.mifos_url}/self/authentication?username=${username}&password=${password}`;
		await Axios({
			method: "post",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifos_tenant_id}`,
			},
		}).then((response) => {
			res.json({
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};
