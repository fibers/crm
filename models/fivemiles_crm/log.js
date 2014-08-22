module.exports = function (sequelize, DataTypes) {
    var Log = sequelize.define('Log', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            operator: {type: DataTypes.STRING, allowNull: false},
            url: {type: DataTypes.STRING, allowNull: false}
        }, {
            tableName: 'logs',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8'
        }
    );

    return Log;
};