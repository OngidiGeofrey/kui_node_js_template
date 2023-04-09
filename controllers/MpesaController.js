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




module.exports.get_authorization_token = async (req, res, next) => {

    res.json({
        status: "success"
    
    });
	
};





// list all loan products

// retrieve  the loan product by Id

// list all loans



