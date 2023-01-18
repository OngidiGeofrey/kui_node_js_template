const { default: Axios } = require("axios");
const config = require("../config.json");
const { MifosUser } = require("../db");
const https = require('node:https');
var JSON = require("querystring");

require("dotenv").config();

module.exports.login = async (req, res, next) => {
	try {
		const username = req.body.username;
		const password = req.body.password;
		await Axios({
			method: "post",
			url: `${config.mifosUrl}/authentication?username=${username}&password=${password}`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
			},
			httpsAgent: new https.Agent({ rejectUnauthorized: false })
		}).then(async (response) => {
			// Check the user in the database
			const user = await MifosUser.findOne({
				where: {
					userId: response.data.userId,
				},
			});

			if (!user) {
				//if user not found in database
				//create user in database
				const newUser = await MifosUser.create({
					userId: response.data.userId,
					username: response.data.username,
				});

				console.log("New User: ", newUser);
			}

			res.json({
				status: "success",
				prompt:
					user.clientId === null
						? "Please create client to proceed"
						: "Login successful",
				result: { ...response.data, ...user },
			});
		});
	} catch (err) {
		console.log("err: ", err);
		return next(err);
	}
};

module.exports.register = async (req, res, next) => {
	
	//create user in mifos

	console.log("Hello World");
	try {

		

		const body = req.body;
		const token = `${config.mifosAdminTenantkey}`;
		
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		/*Buffer(
			`${config.mifosUsername}:${config.mifosPassword}`
		).toString("base64");*/

		// create a user

		let data = {
			username: body.username,
			firstname: body.firstname,
			lastname: body.lastname,
			password : body.password,
			repeatPassword: body.repeatPassword,
			email: body.email,
			password: body.password,
			repeatPassword: body.repeatPassword,
			officeId: 1,
			staffId: 1,
			roles: body.roles || ["2", "2"],
			sendPasswordToEmail: false,
			passwordNeverExpires: true,
		};

		const register = await Axios({
			method: "post",
			url: `${config.mifosUrl}/users`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: `Basic ${token}`,
			},
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
			data: data,
		});


		//create a  client

		const client_data = {
			officeId:  1, //req
			firstname: body.firstname,
			lastname: body.lastname,
			mobileNo: body.mobileNo,
			dateFormat: "dd MMMM yyyy",
			locale: "en",
			active: true,
			activationDate: today,
			submittedOnDate: today,
			savingsProductId:null,
			familyMembers:[],
			address:  [],	
		};
		const register_client= await Axios({
			method: "post",
			url: `${config.mifosUrl}/clients`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: `Basic ${token}`,
			},
			
			data: client_data,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
		});

		//create user and client in database
		const user = await MifosUser.create({
			userId: register.data.resourceId,
			clientId: register_client.data.clientId,
			username: body.username,
		});
		return res.json({
			status: "success",
			result: {...user, ...register.data},
		});
	} catch (err) {
		return next(err);
	}
};


module.exports.makeLoanRepayment = async (req, res, next) => {
	try {
		let loan__id = req.params.id;
		let note = req.body.reason;
		const base64AunthenticationKey = req.headers["access-token"];

		const url = `${config.mifosUrl}/loans/${loan__id}?command=withdrawnByApplicant`;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		const data = {
			locale: "en",
			dateFormat: "dd MMMM yyyy",
			withdrawnOnDate: `${today}`,
			note: `${note}`,
		};
		await Axios({
			method: "POST",
			url: url,
			headers: {
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: "Basic " + base64AunthenticationKey,
			},
			data: data,
		}).then((response) => {
			console.log(data);
			return res.json({
				result_code: 0,
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};

// list all loan products
module.exports.listing = async (req, res, next) => {
	try {
		const base64AunthenticationKey = req.headers["access-token"];
		const url = `${config.mifosUrl}/loanproducts`;
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: "Basic " + base64AunthenticationKey,
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
		let product_id = req.params.id;
		const base64AunthenticationKey = req.headers["access-token"];
		const url = `${config.mifosUrl}/loanproducts/${product_id}`;

		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: "Basic " + base64AunthenticationKey,
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
		const base64AunthenticationKey = req.headers["access-token"];
		const url = `${config.mifosUrl}/loans`;

		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: "Basic " + base64AunthenticationKey,
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
		let client__id = req.params.id;
		const base64AunthenticationKey = req.headers["access-token"];
		const url = `${config.mifosUrl}/clients/${client__id}/accounts`;

		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: "Basic " + base64AunthenticationKey,
			},
			httpsAgent: new https.Agent({ rejectUnauthorized: false })
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
		let R_client__id = req.params.id;
		const base64AunthenticationKey = req.headers["access-token"];
		const url = `${config.mifosUrl}/runreports/ClientSummary?R_clientId=${R_client__id}&genericResultSet=false`;
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: "Basic " + base64AunthenticationKey,
			},
		}).then((response) => {
			return res.json({
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};

// withdraw loan application
module.exports.withdraw_loan_application = async (req, res, next) => {
	try {
		let loan__id = req.params.id;
		let note = req.body.reason;
		const base64AunthenticationKey = req.headers["access-token"];

		const url = `${config.mifosUrl}/loans/${loan__id}?command=withdrawnByApplicant`;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		const data = {
			locale: "en",
			dateFormat: "dd MMMM yyyy",
			withdrawnOnDate: `${today}`,
			note: `${note}`,
		};
		await Axios({
			method: "POST",
			url: url,
			headers: {
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: "Basic " + base64AunthenticationKey,
			},
			data: data,
		}).then((response) => {
			console.log(data);
			return res.json({
				result_code: 0,
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};

// make loan repayment
module.exports.make_loan_repayment = async (req, res, next) => {
	try {
		let loan__id = req.params.id;
		let note = req.body.reason;
		const base64AunthenticationKey = req.headers["access-token"];

		const url = `${config.mifosUrl}/loans/${loan__id}/transactions?command=repayment`;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		const data1 = {
			dateFormat: "dd MMMM yyyy",
			locale: "en",
			transactionDate: `${today}`,
			transactionAmount: req.body.transactionAmount,
			paymentTypeId: req.body.paymentTypeId,
			note: req.body.note,
			accountNumber: req.body.accountNumber,
			checkNumber: req.body.checkNumber,
			routingCode: req.body.routingCode,
			receiptNumber: req.body.receiptNumber,
			bankNumber: req.body.bankNumber,
		};
		console.log(data1);

		await Axios({
			method: "POST",
			url: url,
			headers: {
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: "Basic " + base64AunthenticationKey,
			},
			data: data1,
		}).then((response) => {
			console.log(data);
			return res.json({
				result_code: 0,
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};

//make loan application
module.exports.loan_application = async (req, res, next) => {
	try {

		let data=req.body;
		/*let clientId = req.params.id;
		let productId = req.body.productId;
		let principal = req.body.principal;
		let loanTermFrequency = req.body.loanTermFrequency;
		let loanTermFrequencyType = req.body.loanTermFrequencyType;
		let numberOfRepayments = req.body.numberOfRepayments;
		let interestRatePerPeriod = req.body.interestRatePerPeriod;
		let repaymentEvery = req.body.repaymentEvery;
		let repaymentFrequencyType = req.body.repaymentFrequencyType;
		let amortizationType = req.body.amortizationType;
		let isEqualAmortization = req.body.isEqualAmortization;
		let interestType = req.body.interestType;
		let interestCalculationPeriodType = req.body.interestCalculationPeriodType;
		let transactionProcessingStrategyId =req.body.transactionProcessingStrategyId;
		let allowPartialPeriodInterestCalcualtion =req.body.allowPartialPeriodInterestCalcualtion;*/

		const base64AunthenticationKey = req.headers["access-token"];

		const url = `${config.mifosUrl}/loans`;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

	/*	const data = {
			"clientId": `${clientId}`,
			"productId": productId,
			"disbursementData": [],
			"fundId": 1,
			"principal": principal,
			"loanTermFrequency": loanTermFrequency,
			"loanTermFrequencyType": loanTermFrequencyType,
			"numberOfRepayments": numberOfRepayments,
			"repaymentEvery": repaymentEvery,
			"repaymentFrequencyType": repaymentFrequencyType,
			"interestRatePerPeriod": interestRatePerPeriod,
			"amortizationType": amortizationType,
			"isEqualAmortization": isEqualAmortization,
			"interestType": interestType,
			"interestCalculationPeriodType":interestCalculationPeriodType,
			"allowPartialPeriodInterestCalcualtion":allowPartialPeriodInterestCalcualtion,
			"transactionProcessingStrategyId":transactionProcessingStrategyId,
			"charges":[{"chargeId":2,"amount":1}],
			"locale":"en",
			"dateFormat":"dd MMMM yyyy",
			"loanType":"individual",
			"expectedDisbursementDate":`${today}`,
			"submittedOnDate":`${today}`

			};*/

	console.log(data);
		await Axios({
			method: "POST",
			url: url,
			headers: {
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: "Basic " + base64AunthenticationKey,
			},

			data: data,
			
		}).then((response) => {
			console.log(data);
			return res.json({
				result_code: 0,
				status: "Your loan request has been received for processing",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};

//Get Loan Statement By Loan Id
module.exports.getLoanStatement = async (req, res, next) => {
	try {
		const loanId = req.params.id;
		const accessToken = req.headers["access-token"];
		const url = `${config.mifosUrl}/loans/${loanId}?associations=all`;
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: `Basic ${accessToken}`,
			},
			httpsAgent: new https.Agent({ rejectUnauthorized: false })
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



//calculate amortization schedule
module.exports.amortization_schedule = async (req, res, next) => {
	try {
		const loanId = req.params.id;
		const accessToken = req.headers["access-token"];
		const url = `${config.mifosUrl}/loans/${loanId}?associations=all&exclude=guarantors,futureSchedule`;
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: `Basic ${accessToken}`,
			},
		}).then((response) => {
			res.json({
				loanId: loanId,
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};
