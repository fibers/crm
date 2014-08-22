module.exports = function (sequelize, DataTypes) {
    var CommodityReport = sequelize.define('CommodityReport', {
            commodity_id: {type: DataTypes.INTEGER, allowNull: false},
            reporter_id: {type: DataTypes.INTEGER, allowNull: false},
            is_processed: {type: DataTypes.BOOLEAN, allowNull: false},
            reason: {type: DataTypes.INTEGER, allowNull: false}
        }, {
            tableName: 'commodity_reports',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8',
            classMethods: {
                associate: function (models) {
                    CommodityReport.belongsTo(models.Commodity, {as: 'Commodity', foreignKey: 'commodity_id'});
                    CommodityReport.belongsTo(models.User, {as: 'Reporter', foreignKey: 'reporter_id'});
                }
            }
        }
    );

    return CommodityReport;
};