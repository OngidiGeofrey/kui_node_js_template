const { default: Axios } = require("axios");
const config = require("../config.json");
const { MifosUser,MifosLoan } = require("../db");
const https = require('node:https');
var JSON = require("querystring");
const { isEmpty } = require("lodash");

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
		 res.json({
			resCode:401,
			status: "Authentication Failed",
			message: "username or password is wrong",
		});
	}
};

module.exports.register = async (req, res, next) => {
	
	//create user in mifos
	try {
		const body = req.body;
		const token = `${config.mifosAdminTenantkey}`;
		
	const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		// create a user

		let user_data = {
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			password : req.body.password,
			repeatPassword: req.body.repeatPassword,
			email: req.body.email,
			password: req.body.password,
			repeatPassword: req.body.repeatPassword,
			officeId: 1,
			staffId: 1,
			roles:[2],
			sendPasswordToEmail: false,
			
		};
		console.log(user_data)

			const register = await Axios({
				method: "POST",
				httpsAgent: new https.Agent({
					rejectUnauthorized:false
				}),
				url: `${config.mifosUrl}/users`,
				headers: {
					"Content-Type": "application/json",
					"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
					authorization: `Basic ${token}`
				},
				data: user_data,
			});
			console.log(user_data);
			console.log(register);
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
			method: "POST",
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
			url: `${config.mifosUrl}/clients`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				authorization: `Basic ${token}`,
			},
			data:client_data
			
		});
		console.log(client_data);
		console.log(register_client);
		
	//create user and client in database
		const user = await MifosUser.create({
			userId: register.data.resourceId,
			clientId: register_client.data.clientId,
			username: body.username,
			firstName: body.firstname,
			lastName: body.lastname,
			phoneNumber:body.mobileNo,
			emailAddress: body.email,
		});
		//console.log(user);
		return res.json({
			status: "success",
			result: {...user, ...register.data},
		});
	} catch (err) {
		// return next(err);
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

// retrieve  the loan product by Id
module.exports.get_loan_product_by_id = async (req, res, next) => {
	try {
		let product_id = req.params.id;
		const base64AunthenticationKey = req.headers["access-token"];
		const url = `${config.mifosUrl}/loanproducts/${product_id}`;

		await Axios({
			method: "GET",
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
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
		let client_id = req.params.id;
		if(isEmpty(req.body))
		{	

			const client_loans = await MifosLoan.findAll({
				where: {
					clientId: client_id,
				},
			});

			if(client_loans)
			{
				res.json({
					resCode:0,
					status: "success",
					result: [...client_loans],
				});
			}
		}
		else{
			
		let query_param=req.body.filter;

		// Check the user in the database
		const client_loans = await MifosLoan.findAll({
			where: {
				clientId: client_id,
				loanStatus: query_param
			},
		});

		if(client_loans)
		{
			res.json({
				resCode:0,
				status: "success",
				result: [...client_loans],
			});
		}
		else{
			res.json({
				resCode:404,
				status: "clientId does not exist"
				//result: {...client_loans},
			});
		}
		console.log(client_loans);

		}

		
		
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
		const clientId=req.body.clientId;
		var currentDay=new Date().toLocaleDateString('en-US', { weekday: 'long' });
		
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	
		//console.log(disbursement_date.getDay());
		if(config.non_working_days.includes(currentDay)){
			today.setDate(today.getDate() + 3);
		}
		//check if current day or current date is blacklisted
		else if(config.non_working_days.includes(today) || config.non_working_days.includes(currentDay))
		{
			console.log("Chamasoft will submit all awaiting loan(S) on a working day");

		}
		else{

//if(config.non_working_days.includes())
		//"disbursementData":[],
		const fundId=req.body.fundId;
		const productId=req.body.productId;
		let principal=req.body.principal;
		let loanTermFrequency=req.body.loanTermFrequency;
		let loanTermFrequencyType=req.body.loanTermFrequencyType;
		let numberOfRepayments=req.body.numberOfRepayments;
		let repaymentEvery=req.body.repaymentEvery;
		let repaymentFrequencyType=req.body.repaymentFrequencyType;
		let interestRatePerPeriod=req.body.interestRatePerPeriod;
		let amortizationType=req.body.amortizationType;
		let isEqualAmortization=req.body.isEqualAmortization;
		let interestType=req.body.interestType;
		let interestCalculationPeriodType=req.body.interestCalculationPeriodType;
		let allowPartialPeriodInterestCalcualtion=req.body.allowPartialPeriodInterestCalcualtion;
		let transactionProcessingStrategyId=req.body.transactionProcessingStrategyId;
		let repaymentFrequencyNthDayType=req.body.repaymentFrequencyNthDayType;
		let repaymentFrequencyDayOfWeekType=req.body.repaymentFrequencyDayOfWeekType;
		const chargeId=req.body.chargeId;
		const amount=req.body.amount;
		let locale="en";
		let dateFormat="dd MMMM yyyy";
		let loanType="individual";
		let expectedDisbursementDate=today;
		let submittedOnDate=today;
		console.log(submittedOnDate);
		//declare and initialize variables that stores disbursement data
			const accountNumber= req.body.accountNumber;
			const paymentTypeId= req.body.paymentTypeId;
			const loanName=req.body.loanName;
			const base64AunthenticationKey = req.headers["access-token"];
			const url = `${config.mifosUrl}/loans`;
			
		const client_loan = await MifosLoan.create({
			clientId: clientId,
			loanStatus:config.awaitingStatus,
			accountNumber: accountNumber,
			paymentTypeId: paymentTypeId,
			principal:	req.body.principal,
			loanName: loanName,
			fundId: fundId,
			productId:productId,
			loanTermFrequency: loanTermFrequency,
			loanTermFrequencyType: loanTermFrequencyType,
			numberOfRepayments: numberOfRepayments,
			repaymentEvery: repaymentEvery,
			repaymentFrequencyType: repaymentFrequencyType,
			interestRatePerPeriod: interestRatePerPeriod,
			amortizationType: amortizationType,
			interestRatePerPeriod: interestRatePerPeriod,
			amortizationType: amortizationType,
			isEqualAmortization: isEqualAmortization,
			interestType: interestType,
			interestCalculationPeriodType: interestCalculationPeriodType,
			allowPartialPeriodInterestCalcualtion: allowPartialPeriodInterestCalcualtion,
			transactionProcessingStrategyId: transactionProcessingStrategyId,
			repaymentFrequencyNthDayType: repaymentFrequencyNthDayType,
			repaymentFrequencyDayOfWeekType: repaymentFrequencyDayOfWeekType,
			chargeId: chargeId,
			amount: amount,
			submittedOnDate:today,
			expectedDisbursementDate:today,
			dateFormat: dateFormat,
			locale: locale,
		});
		return res.json({
			result_code: 0,
			status: "Your loan request has been received for processing",
			result: client_loan,//loan.data,
		});
		//}


		}

		
	} catch (err) {
		//console.log(err)
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

//retrieve the paymenttypes
module.exports.paymenttypes = async (req, res, next) => {
	try {
		const accessToken = req.headers["access-token"];
		const url = `${config.mifosUrl}/paymenttypes`;
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

//retrieve client profile

module.exports.retrieve_client_profile = async (req, res, next) => {

	const user = await MifosUser.findOne({
		where: {
			clientId: req.params.id
		},
	});
	if(user)
	{
		res.json({
			result_code:0,
			status: "client retrieved",
			result: {...user},
		});
	}
	else{
		res.json({
			result_code:404,
			status: "client not found",
		});
	}	
};



//retrieve client loan balances

module.exports.client_loan_balance = async (req, res, next) => {
	try {
		//const accessToken = req.headers["access-token"];
		const client_id=req.params.id;
		const url = `${config.mifosUrl}/clients/${client_id}/accounts`;
		await Axios({
			method: "GET",
			url: url,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				Authorization: `Basic ${config.mifosAdminTenantkey}`,
			},
			httpsAgent: new https.Agent({ rejectUnauthorized: false })
		}).then((response) => {
			res.json({
				status: "success",
				result: response.data,
			});
		});
	} catch (err) {
		console.log (err);
	}
};