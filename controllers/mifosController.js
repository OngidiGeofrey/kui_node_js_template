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

// list all loans
module.exports.get_loan_applications = async (req, res, next) => {
	try {
		
		
		const base64AunthenticationKey = req.headers["access_token"];
		const url = `${process.env.MIFOS_URL}/loans`;
		
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



// retrieve client loans account
module.exports.client_accounts = async (req, res, next) => {
	try {
		
		let client__id=req.params.id;
		const base64AunthenticationKey = req.headers["access_token"];
		const url = `${process.env.MIFOS_URL}/clients/${client__id}/accounts`;
		
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



// retrieve client loans summary
module.exports.client_summary = async (req, res, next) => {
	try {
		
		let R_client__id=req.params.id;
		const base64AunthenticationKey = req.headers["access_token"];
		const url = `${process.env.MIFOS_URL}/runreports/ClientSummary?R_clientId=${R_client__id}&genericResultSet=false`;
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