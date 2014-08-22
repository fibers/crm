module.exports = function (sequelize, DataTypes) {
    var UserReport = sequelize.define('UserReport', {
            user_id: {type: DataTypes.INTEGER, allowNull: false},
            reporter_id: {type: DataTypes.INTEGER, allowNull: false},
            is_processed: {type: DataTypes.BOOLEAN, allowNull: false},
            reason: {type: DataTypes.INTEGER, allowNull: false}
        }, {
            tableName: 'user_reports',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8',
            classMethods: {
                associate: function (models) {
                    UserReport.belongsTo(models.User, {as: 'User', foreignKey: 'user_id'});
                    UserReport.belongsTo(models.User, {as: 'Reporter', foreignKey: 'reporter_id'});
                }
            }
        }
    );

    return UserReport;
};