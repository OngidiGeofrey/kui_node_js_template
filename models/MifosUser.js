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