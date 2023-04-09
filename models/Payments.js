const {DataTypes} = require('sequelize');

module.exports.PaymentModel = (sequelize) => {
    return sequelize.define(
        'Payments',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: true,
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            MerchantRequestID: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            CheckoutRequestID: {
                type: DataTypes.STRING,
            },
            ResultCode:{
                type:DataTypes.STRING,
                allowNull:true
            },
            ResultDesc:{
                type:DataTypes.STRING,
                allowNull:true
            },
            Amount:{
                type:DataTypes.DECIMAL,
                allowNull:true
            },
            MpesaReceiptNumber:{
                type:DataTypes.STRING,
                allowNull:true,  
            },
            TransactionDate:{
                type:DataTypes.STRING,
                allowNull:true,  
            },
           
        },
        {
            // Other model options go here
            freezeTableName: true,
            //tableName: 'tablename',
            timestamps: true,
        }
    );
}