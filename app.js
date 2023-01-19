require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const fs = require('fs');
var cron = require('node-cron');
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

/*cron.schedule('* * * * * * ', () => {
	//console.log('running a task every 1 second');
	//approve_loans();

  });*/

  //approve loans
  approve_loans = () => {
	console.log(check_pending_loans());
	//logic for approval
  }

  //disburse loans
  disbursed_loans = (loanId) => {
	check_approved_loans();
	//logic for disbursement comes here
  }

  //check pendingApprove loans and approve
  check_pending_loans = () => {
	let clientId;
	return check_client_loan_history(clientId)
  }
	
  check_approved_loans = () => {
	//logic to check approved loans

	return "ready for disbursement";
	
  }
  //checks if a client qualifies for a loan
  check_client_loan_history = (clientId) => {
	return "Hello World!" ;
  }


// Approval and disbursement Scheduler

