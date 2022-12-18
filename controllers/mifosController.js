const { default: Axios } = require("axios");
const { date } = require("yup");
const { MifosUser } = require("../db");

require("dotenv").config();

module.exports.login = async (req, res, next) => {
	console.log("headers: ", req.headers);
	try {
		const username = req.body.username;
		const password = req.body.password;
		await Axios({
			method: "post",
			url: `${process.env.MIFOS_URL}/self/authentication?username=${username}&password=${password}`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
			},
		}).then(async (response) => {
			// Check the user in the database
			const user = await MifosUser.findOne({
				where: {
					userId: response.data.userId,
				},
			});

			if(!user){
				//create user in database
				const newUser = await MifosUser.create({
					userId: response.data.userId,
					username: response.data.username,
				}); 

				console.log("New User: ",newUser)
			}

			res.json({
				status: "success",
				result: { ...response.data, ...user },
				prompt: !user? "Please create client to proceed":"Login successful",
			});
		});
	} catch (err) {
		return next(err);
	}
};

module.exports.register = async (req, res, next) => {
	//create user in mifos
	try {
		const body = req.body;
		const data = {
			username: body.username,
			firstname: body.firstname,
			lastname: body.lastname,
			email: body.email,
			officeId: 1,
			staffId: 1,
			roles: [2],
			sendPasswordToEmail: true,
			password: "Password@123",
			repeatPassword: "Password@123",
			isSelfServiceUser: true,
		};
		const register = await Axios({
			method: "post",
			url: `${process.env.MIFOS_URL}/fineract-provider/api/v1/users`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
			},
			data: data,
		});
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		//create client in mifos
		const clientData = {
			officeId: 1, //req
			firstname: body.firstname,
			lastname: body.lastname,
			externalId: body.externalId,
			dateFormat: "dd MM yyyy",
			locale: "en",
			active: true,
			activationDate: today,
			submittedOnDate: today,
			datatables: [...body.datatables] || [],
		};
		const clientRegister = await Axios({
			method: "post",
			url: `${process.env.MIFOS_URL}/fineract-provider/api/v1/clients`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
				"authorization": `BASIC ${register.data.base64EncodedAuthenticationKey}}`,
			},
			data: clientData,
		});

		//create user in database
		const user = await MifosUser.create({
			userId: register.data.resourceId,
			username: body.username,
			clientId: clientRegister.data.clientId,
			resourceId: register.data.resourceId,
		});
		return res.json({
			status: "success",
			result: user,
		});
	} catch (err) {
		return next(err);
	}
};

module.exports.createClient = async (req, res, next) => {
	try {
		const body = req.body;
		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		const data = {
			officeId: 1, //req
			firstname: body.firstname,
			lastname: body.lastname,
			externalId: body.externalId,
			dateFormat: "dd MM yyyy",
			locale: "en",
			active: true,
			activationDate: today,
			submittedOnDate: today,
			datatables: [...body.datatables] || [],
		};
		const clientRegister = await Axios({
			method: "post",
			url: `${process.env.MIFOS_URL}/fineract-provider/api/v1/clients`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID
					}`,
				"authorization": `BASIC ${req.headers.authorization}`,
			},
			data: data,
		});
		const user = await MifosUser.findOne({
			where: {
				userId: body.userId,
			},
		});
		user.clientId = clientRegister.data.clientId;
		await user.save();
		return res.json({
			status: "success",
			result: user,
		});
	} catch (err) {
		return next(err);
	}

};

module.exports.makeLoanRepayment = async (req, res, next) => {
	try {
		const body = req.body;
		const data = {
			locale: "en",
			transactionDate: new Date().toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}),
			paymentTypeId: 2,
			note: "Repayment",
			amount: body.amount,
		};

		const repayment = await Axios({
			method: "post",
			url: `${process.env.MIFOS_URL}/fineract-provider/api/v1/loans/${body.loanId}/transactions`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${process.env.MIFOS_TENANT_ID}`,
					"authorization": `BASIC ${req.headers.authorization}`
			},
			data: data,
		});
		return res.json({
			status: "success",
			result: repayment.data,
		});
		
	}catch{
		return next(err);
	}
};