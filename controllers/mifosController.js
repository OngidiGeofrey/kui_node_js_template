const config = require('../config.json');

const fetch=require('node-fetch');


module.exports.listing = async (req, res, next) => {
	try {

		 const base64AunthenticationKey = req.headers["acces_token"];
    fetch(`${process.env.MIFOS_URL}/loanproducts/?tenantIdentifier=mkmsandbox`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+base64AunthenticationKey
            },
    }) .then(res => res.json()).then(response=>
        {   
            console.log(response);
           return res.status(200).json({ 'result_code': 1,'token':authorizationHeader, data: response, 'message': "Success" });
            //console.log(response);
        })

        
    //    console.log("Ready");
		//return res.status(200).send("Ready");
		 

		
	} catch (err) {
		return next(err);
	}
};


