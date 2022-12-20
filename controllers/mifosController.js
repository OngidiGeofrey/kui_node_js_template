const { default: Axios } = require("axios");
const config = require("../config.json");
const { MifosUser } = require("../db");

require("dotenv").config();

module.exports.login = async (req, res, next) => {
	try {
		const username = req.body.username;
		const password = req.body.password;
		await Axios({
			method: "post",
			url: `${config.mifosUrl}/self/authentication?username=${username}&password=${password}`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
			},
		}).then(async (response) => {
			// Check the user in the database
			const user = await MifosUser.findOne({
				where: {
					userId: response.data.userId,
				},
			});

			if (!user) { //if user not found in database
				//create user in database
				const newUser = await MifosUser.create({
					userId: response.data.userId,
					username: response.data.username,
				});

				console.log("New User: ", newUser);
			}

			res.json({
				status: "success",
				prompt: !user.clientId ? "Please create client to proceed" : "Login successful",
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
	try {
		const body = req.body;
		const token = req.headers["access-token"];

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
			url: `${config.mifosUrl}/users`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				"authorization": `Basic ${token}`,
			},
			data: data,
		});

		//create user in database
		const user = await MifosUser.create({
			userId: register.data.resourceId,
			username: body.username,
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
		const token = req.headers["access-token"];

		const today = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		const data = {
			officeId: body.officeId || 1, //req
			firstname: body.firstname,
			lastname: body.lastname,
			address: body.address || [],
			mobileNo: body.mobileNo,
			savingsProductId: body.savingsProductId || null,
			datatables: [...body.datatables] || [],
			externalId: body.externalId,
			dateFormat: "dd MM yyyy",
			locale: "en",
			active: true,
			activationDate: today,
			submittedOnDate: today,
		};
		const clientRegister = await Axios({
			method: "post",
			url: `${config.mifosUrl}/clients`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				"authorization": `Basic ${token}`,
			},
			data: data,
		});
		const user = await MifosUser.findOne({
			where: {
				userId: body.userId,
			},
		});
		// console.log("user: ", user);
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
		const token = req.headers["access-token"];
		const data = {
			locale: "en",
			dateFormat: "dd MMMM yyyy",
			transactionDate: new Date().toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}),
			paymentTypeId: body.paymentTypeId,
			note: body.note || "Repayment",
			transactionAmount: body.amount,
		};

		const repayment = await Axios({
			method: "post",
			url: `${config.mifosUrl}/loans/${body.loanId}/transactions?command=repayment`,
			headers: {
				"Content-Type": "application/json",
				"Fineract-Platform-TenantId": `${config.mifosTenantId}`,
				"authorization": `Basic ${token}`,
			},
			data: data,
		});
		return res.json({
			status: "success",
			result: repayment.data,
		});
	} catch {
		return next(err);
	}
};
