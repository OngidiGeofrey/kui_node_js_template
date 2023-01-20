const {DataTypes} = require('sequelize');

module.exports.MifosLoanModel = (sequelize) => {
    return sequelize.define(
        'MifosLoan',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: true,
            },
            clientId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            loanId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            loanName: {
                type: DataTypes.STRING,
                allowNull: true,
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
            },
            fundId:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            loanTermFrequency:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            loanTermFrequencyType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            numberOfRepayments:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            repaymentEvery:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            repaymentFrequencyType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            interestRatePerPeriod:{
                type:DataTypes.FLOAT,
                allowNull:true
            },
            amortizationType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            isEqualAmortization:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },
            isEqualAmortization:{
                type:DataTypes.BOOLEAN,
                allowNull:true
            },
            interestType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            interestCalculationPeriodType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            allowPartialPeriodInterestCalcualtion:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            transactionProcessingStrategyId:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            repaymentFrequencyNthDayType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            repaymentFrequencyDayOfWeekType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            repaymentFrequencyDayOfWeekType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            chargeId:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            amount:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            loanType:{
                type:DataTypes.INTEGER,
                allowNull:true
            },
            expectedDisbursementDate:{
                type:DataTypes.STRING,
                allowNull:true
            },
            submittedOnDate:{
                type:DataTypes.STRING,
                allowNull:true
            },
            dateFormat:{
                type:DataTypes.STRING,
                allowNull:true
            },
            locale:{
                type:DataTypes.STRING,
                allowNull:true
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