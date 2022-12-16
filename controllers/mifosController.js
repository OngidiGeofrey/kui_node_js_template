const { default: Axios } = require("axios");

require("dotenv").config();

module.exports.login = async (req, res, next) => {
	try {
		const username = req.body.username;
		const password = req.body.password;
		const url = `${process.env.MIFOS_URL}/self/authentication?username=${username}&password=${password}`;
		await Axios({
			method: "post",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
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
