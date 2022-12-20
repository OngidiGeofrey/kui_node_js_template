const { default: Axios } = require("axios");
var JSON = require('querystring');


require("dotenv").config();


// list all loan products
module.exports.listing = async (req, res, next) => {
	try {
		
		const base64AunthenticationKey = req.headers["access-token"];
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
		const base64AunthenticationKey = req.headers["access-token"];
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
		
		
		const base64AunthenticationKey = req.headers["access-token"];
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
		const base64AunthenticationKey = req.headers["access-token"];
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
		const base64AunthenticationKey = req.headers["access-token"];
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
		
		let loan__id=req.params.id;
		let note=req.body.reason;
		const base64AunthenticationKey = req.headers["access_token"];
		
		const url = `${process.env.MIFOS_URL}/loans/${loan__id}?command=withdrawnByApplicant`;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		const data = {
			
				locale: "en",
				dateFormat: "dd MMMM yyyy",
				withdrawnOnDate: `${today}`,
				note: `${note}`
			
		};
		await Axios({
			method: "POST",
			url: url,
			headers: {
				
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
				"authorization": 'Basic '+base64AunthenticationKey
			},
			
			data:data,

			
		}).then((response) => {
			console.log(data)
		return	res.json({
				result_code:0,
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
		
		let clientId=req.params.id;
		let productId=req.body.productId;
		let principal=req.body.principal;
		let loanTermFrequency=req.body.loanTermFrequency;
		let loanTermFrequencyType=req.body.loanTermFrequencyType;
		let numberOfRepayments=req.body.numberOfRepayments;
		let interestRatePerPeriod=req.body.interestRatePerPeriod
		let repaymentEvery=req.body.repaymentEvery;
		let repaymentFrequencyType=req.body.repaymentFrequencyType;
		let amortizationType=req.body.amortizationType;
		let isEqualAmortization=req.body.isEqualAmortization;
		let interestType=req.body.interestType;
		let interestCalculationPeriodType=req.body.interestCalculationPeriodType;
		let transactionProcessingStrategyId=req.body.transactionProcessingStrategyId;
		let allowPartialPeriodInterestCalcualtion=req.body.allowPartialPeriodInterestCalcualtion;

		
		const base64AunthenticationKey = req.headers["access-token"];
		
		const url = `${process.env.MIFOS_URL}/loans`;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		const data = {
			
				clientId:`${clientId}`,
				productId:`${productId}`,
				disbursementData:[],
				fundId:1,
				principal:`${principal}`,
				loanTermFrequency:`${loanTermFrequency}`,
				loanTermFrequencyType:`${loanTermFrequencyType}`,
				numberOfRepayments:`${numberOfRepayments}`,
				repaymentEvery:`${repaymentEvery}`,
				repaymentFrequencyType:`${repaymentFrequencyType}`,
				interestRatePerPeriod:`${interestRatePerPeriod}`,
				amortizationType:`${amortizationType}`,
				isEqualAmortization:`${isEqualAmortization}`,
				interestType:`${interestType}`,
				interestCalculationPeriodType:`${interestCalculationPeriodType}`,
				allowPartialPeriodInterestCalcualtion:`${allowPartialPeriodInterestCalcualtion}`,
				transactionProcessingStrategyId:`${transactionProcessingStrategyId}`,
				charges:[],
				locale:"en",
				dateFormat:"dd MMMM yyyy",
				loanType:"individual",
				expectedDisbursementDate:`${today}`,
				submittedOnDate:`${today}`
				
			
		};
		await Axios({
			method: "POST",
			url: url,
			headers: {
				
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
				"authorization": 'Basic '+base64AunthenticationKey
			},
			
			data:data,

			
		}).then((response) => {
			console.log(data)
		return	res.json({
				result_code:0,
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		return next(err);
	}
};
