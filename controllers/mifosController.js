const { default: Axios } = require("axios");

require("dotenv").config();


// list all loan products
module.exports.listing = async (req, res, next) => {
	try {
		
		const base64AunthenticationKey = req.headers["access_token"];
		const url = `${process.env.MIFOS_URL}/loanproducts`;
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
				'Authorization': 'Basic '+base64AunthenticationKey
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

// retrieve  the loan product by Id
module.exports.get_loan_product_by_id = async (req, res, next) => {
	try {
		
		let product_id=req.params.id;
		const base64AunthenticationKey = req.headers["access_token"];
		const url = `${process.env.MIFOS_URL}/loanproducts/${product_id}`;
		console.log(url);
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
				'Authorization': 'Basic '+base64AunthenticationKey
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
