require("dotenv").config();
const { Sequelize } = require("sequelize");
const configs = require("./config.json");
const fs = require("fs");
let sequelize;

if(fs.existsSync('/etc/pki/tls/private/digitallending.chamasoft.com.key')) {
	sequelize = new Sequelize(
		configs.database.database,
		configs.database.prodUser,
		configs.database.prodPassword,
		{
			host: process.env.DB_HOST || configs.database.host,
			port: process.env.DB_PORT || configs.database.port,
			dialect:
				process.env.DB_DIALECT ||
				configs.database.dialect /* 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
		}
	);

}else{
	 sequelize = new Sequelize(
		process.env.DB_NAME || configs.database.database,
		process.env.DB_USER || configs.database.user,
		process.env.DB_USER ? process.env.DB_PASSWORD : configs.database.password,
		{
			host: process.env.DB_HOST || configs.database.host,
			port: process.env.DB_PORT || configs.database.port,
			dialect:
				process.env.DB_DIALECT ||
				configs.database.dialect /* 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
		}
	);

}

(async () => {
	try {
		await sequelize.authenticate();
		console.log("💾 Database connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
})();

// Create Models
const { MifosUserModel } = require("./models/MifosUser");
const MifosUser = MifosUserModel(sequelize);

const { MifosLoanModel } = require("./models/MifosLoan");
const MifosLoan = MifosLoanModel(sequelize);

const migrateDb = process.env.MIGRATE_DB || configs.database.migrate;
if (migrateDb == "TRUE") {
sequelize.sync({force:true,alter:true}).then(() => {
		console.log(`All tables synced!`);
		process.exit(0);
	});
}

module.exports = {
	MifosUser,
	MifosLoan
};
