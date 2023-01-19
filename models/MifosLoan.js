const {DataTypes} = require('sequelize');

module.exports.MifosLoanModel = (sequelize) => {
    return sequelize.define(
        'MifosLoan',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            clientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            loanId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            loanStatus: {
                type: DataTypes.STRING,
            },
            paymentTypeId:{
                type:DataTypes.INTEGER,
                allowNull:false
            },
            accountNumber:{
                type:DataTypes.STRING,
                allowNull:false
            },
            principal:{
                type:DataTypes.FLOAT,
                allowNull:false
            },
            amountDisbursed:{
                type:DataTypes.FLOAT,
                allowNull:true
            }
            
            
        },
        {
            // Other model options go here
            freezeTableName: true,
            //tableName: 'tablename',
            timestamps: true,
        }
    );
}