const {DataTypes} = require('sequelize');

module.exports.MifosUserModel = (sequelize) => {
    return sequelize.define(
        'MifosUser',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            clientId: {
                type: DataTypes.STRING,
            },
            firstName:
            {
                type:DataTypes.STRING,
                allowNull:false,

            },
            lastName:
            {
                type:DataTypes.STRING,
                allowNull:false,
            },
            phoneNumber:
            {
                type:DataTypes.INTEGER,
                allowNull:false,
            },
            emailAddress:
            {
                type:DataTypes.STRING,
                allowNull:false,
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