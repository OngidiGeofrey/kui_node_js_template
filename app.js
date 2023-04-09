 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { default: Axios } = require("axios");
var JSON = require("querystring");
var cron = require('node-cron');
const { MifosUser,MifosLoan} = require("./db");
const configs = require('./config.json');
const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(
	cors({
		//origin: process.env.CLIENT_URL
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')); // folder to upload files

global.__basedir = __dirname; // very important to define base directory of the project. this is useful while creating upload scripts

// Routes
app.get('/', (req, res, next) => {
	try {
		res.json({
			status: 'success',
			message: 'Welcome 🙏',
		});
	} catch (err) {
		return next(err);
	}
});

// const taskRoute = require('./routes/taskRoute');
// const userRoute = require('./routes/userRoute');
const mifosRoute = require('./routes/mifosRoute');
const { config } = require('dotenv');
app.use('/api', [ mifosRoute]); // you can add more routes in this array


//404 error
app.get('*', function (req, res) {
	res.status(404).json({
		message: 'What?? 🙅',
	});
});

//An error handling middleware
app.use((err, req, res, next) => {
	console.log('🐞 Error Handler');

	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		err: err,
	});
});

// Run the server
const port = configs.port;
// app.listen(port, () =>
// 	console.log(`🐹 app listening on http://localhost:${port}`)
// );

var  privateKey, certificate, caBundle;

try {
	if (fs.existsSync('/etc/pki/tls/private/digitallending.chamasoft.com.key')) {
		privateKey = fs.readFileSync('/etc/pki/tls/private/digitallending.chamasoft.com.key', 'utf8');
		certificate = fs.readFileSync('/etc/pki/tls/certs/digitallending.chamasoft.com.cert', 'utf8');
		caBundle = fs.readFileSync('/etc/pki/tls/certs/digitallending.chamasoft.com.bundle', 'utf8');
	} 
} catch (error) {
	console.log("Running node.js on local server.");
};

var certificate_options = { key: privateKey, cert: certificate, ca: caBundle };

var httpServer = http.createServer(app);
var httpsServer = https.createServer(certificate_options,app);
httpServer.listen(configs.localPort);
httpsServer.listen(configs.port);
console.log(`🐹 app listening on http://localhost:${configs.localPort}`);
console.log(`🐹 app listening on https://localhost:${configs.port}`);

//scheduler

// cron.schedule('*/1 * * * * ', () => {

// 		//submit loans
	
// 	submit_loans().then(async (response) => {

// 		//approve loans

// 		approve_loans().then(async (response) => {

// 			//disburse loans
// 			disburse_loans();
	
// 		});

// 	});

//   });
submit_loans= async (req, res, next) => {
	try {

		
		console.log(configs.non_working_days);

		//finds the current day e.g Saturday
		var currentDay=new Date().toLocaleDateString('en-US', { weekday: 'long' });
		console.log(currentDay)

		//finds current date e.g 20th January 2023

		const todayDate = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		console.log(todayDate)

		//check if current day or current date is blacklisted
		if(configs.non_working_days.includes(todayDate) || configs.non_working_days.includes(currentDay))
		{
			console.log("Chamasoft will submit all awaiting loan(S) on a working day")

		}
		// scheduler runs in this block 
		else
		{

				// fetch all awaiting loans
				
				const awaiting_loans= await MifosLoan.findAll({
					where: {
						loanStatus: configs.awaitingStatus,
					},
					limit:10
				})
				var obj=[...awaiting_loans] ;
				
	
				// check if there exist awaiting loans
				if(obj.length!=0)
				{
					//iterate through an array
					obj.forEach(async object =>{
	
						// fetch loan items to be submitted to mifos
					 const 	data={
							clientId:object.dataValues.clientId,
							productId:object.dataValues.productId,
							disbursementData:[],
							fundId:object.dataValues.fundId,
							principal:object.dataValues.principal,
							loanTermFrequency:object.dataValues.loanTermFrequency,
							loanTermFrequencyType:object.dataValues.loanTermFrequencyType,
							numberOfRepayments:object.dataValues.numberOfRepayments,
							repaymentEvery:object.dataValues.repaymentEvery,
							repaymentFrequencyType:object.dataValues.repaymentFrequencyType,
							interestRatePerPeriod:object.dataValues.interestRatePerPeriod,
							amortizationType:object.dataValues.amortizationType,
							isEqualAmortization:false,
							interestType:object.dataValues.interestType,
							interestCalculationPeriodType:object.dataValues.interestCalculationPeriodType,
							allowPartialPeriodInterestCalcualtion:false,
							transactionProcessingStrategyId:object.dataValues.transactionProcessingStrategyId,
							repaymentFrequencyNthDayType:object.dataValues.repaymentFrequencyNthDayType,
							repaymentFrequencyDayOfWeekType:object.dataValues.repaymentFrequencyDayOfWeekType,
							charges:[{"chargeId": object.dataValues.chargeId,"amount":object.dataValues.amount}],
							locale:"en",
							dateFormat:"dd MMMM yyyy",
							loanType:"individual",
							expectedDisbursementDate:object.dataValues.expectedDisbursementDate,
							submittedOnDate:object.dataValues.submittedOnDate
	
						}
						console.log(data)
	
					//	submit loans to mifos
						const url = `${configs.mifosUrl}/loans`;
						await Axios({
							method: "POST",
							url: url,
							httpsAgent: new https.Agent({ rejectUnauthorized: false }),
							headers: {
								"Fineract-Platform-TenantId": `${configs.mifosTenantId}`,
								authorization: "Basic "+configs.mifosAdminTenantkey,
							},
							data: data,
							
						}).then(async (response) => {
							if(response){
	
								console.log(response.data)
	
							//update chamasoft db accordingly.
							const MifosClient = await MifosLoan.update(
								{
								  userId: response.data.resourceId,
								  clientId: response.data.clientId,
								  loanId: response.data.loanId,
								  loanStatus:configs.pendingStatus,
								  officeId: response.data.officeId
								},
								{
								  where: { id: object.dataValues.id },
								}
							  );
							  
							 console.log(MifosClient)
	
	
							}
							else
							{
								console.log("this loans will be submitted on Monday")
							}
	
							
	
						});
						
					})
	
				}
	
				else{
					console.log(" no awaiting record(s) found")
				}
		}
		
		}	
	 catch (err) {
		console.log(err);
	}
};

approve_loans=async (req,res,next) =>{

try
{
			const todayDate = new Date().toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
			//console.log(todayDate)

				// fetch all awaiting loans
				
			const pendingApproval_loans= await MifosLoan.findAll({
					attributes:["loanId"],
					where: {
						loanStatus: configs.pendingStatus,
					},
					limit:10
				})
			var obj=[...pendingApproval_loans] ;
				//console.log(obj.dataValues);
	
				// check if there exist pendingApproval  loans
			if(obj.length!=0)
				{
					//iterate through an array
					obj.forEach(async object =>{
						// fetch loan items to be submitted to mifos
					 const 	data={
							locale:"en",
							dateFormat:"dd MMMM yyyy",
							approvedOnDate: todayDate,
							expectedDisbursementDate:todayDate,
							disbursementData:[],
							note: configs.note,
						}
						console.log(data)
	
					//	submit loans to mifos
						const url = `${configs.mifosUrl}/loans/${object.dataValues.loanId}?command=approve`;
						await Axios({
							method: "POST",
							url: url,
							httpsAgent: new https.Agent({ rejectUnauthorized: false }),
							headers: {
								"Fineract-Platform-TenantId": `${configs.mifosTenantId}`,
								authorization: "Basic "+configs.mifosAdminTenantkey,
							}
							,
							data: data,
							
						}).then(async (response) => {
							if(response.status==200){
	
								console.log(response.data)
							//update chamasoft db accordingly.
							const MifosClient = await MifosLoan.update(
								{
								  loanStatus:configs.pendindDisbursementStatus,
								},
								{
								  where: { loanId: object.dataValues.loanId },
								}
							  );
							  
							 console.log(MifosClient)
							}
							else
							{
								console.log("Loan Approval Failed!. Reasons for failures\n1. Loan already approved\n2. Timeout\3. Network issue")
							}
	
							
	
						});
						
					})
	
				}
	
				else{
					console.log(" No pendingApproval record(s) found. Will check again in 10 minutes")
				}
		







 //console.log("approve loans started")
}catch(err){
	console.log(err)
}

}

disburse_loans=async (req,res,next) =>{
	try {

		
		console.log(configs.non_working_days);

		//finds the current day e.g Saturday
		var currentDay=new Date().toLocaleDateString('en-US', { weekday: 'long' });
		console.log(currentDay)

		//finds current date e.g 20th January 2023

		const todayDate = new Date().toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
		console.log(todayDate)

		//check if current day or current date is blacklisted
		if(configs.non_working_days.includes(todayDate) || configs.non_working_days.includes(currentDay))
		{
			console.log("Chamasoft will Disburse  all approved loan(S) on a working day")

		}
		// scheduler runs in this block 
		else
		{

				// fetch all awaiting loans
				
				const pendingDisbursal_loans= await MifosLoan.findAll({
					attributes:["accountNumber","loanId","paymentTypeId","principal"],
					where: {
						loanStatus: configs.pendindDisbursementStatus,
					},
					limit:10
				})
				var obj=[...pendingDisbursal_loans] ;
				console.log(obj);
	
				// check if there exist awaiting loans
				if(obj.length!=0)
				{
					//iterate through an array
					obj.forEach(async object =>{
	
						// fetch loan items to be submitted to mifos
					 const 	data={
						
							accountNumber: object.dataValues.accountNumber,
							actualDisbursementDate :todayDate,
							dateFormat: "dd MMMM yyyy",
							locale: "en",
							paymentTypeId:object.dataValues.paymentTypeId,
							transactionAmount:object.dataValues.principal
							
	
						}
						console.log(data)
	
					//	submit loans to mifos
						const url = `${configs.mifosUrl}/loans/${object.dataValues.loanId}?command=disburse`;
						await Axios({
							method: "POST",
							url: url,
							httpsAgent: new https.Agent({ rejectUnauthorized: false }),
							headers: {
								"Fineract-Platform-TenantId": `${configs.mifosTenantId}`,
								authorization: "Basic "+configs.mifosAdminTenantkey,
							},
							data: data,
							
						}).then(async (response) => {
							if(response.status===200){
	
								console.log(response.data)
	
							//update chamasoft db accordingly.
							const MifosClient = await MifosLoan.update(
								{
								  loanStatus:configs.disbursedStatus,
								},
								{
								  where: { loanId: object.dataValues.loanId},
								}
							  );
							  
							 console.log(MifosClient)
							}
							else
							{
								console.log("Oops Error occured . Trying again after 10 minutes")
							}
	
							
	
						});
						
					})
	
				}
	
				else{
					console.log(" no awaitingDisbursement record(s) found")
				}
		}
		
		}catch(err){
		console.log(err)
	}
	
	}