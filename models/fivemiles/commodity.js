module.exports = function (sequelize, DataTypes) {
    var Commodity = sequelize.define('Commodity', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            attr_keywords_string: {type: DataTypes.STRING(500), allowNull: false},
            owner_id: {type: DataTypes.INTEGER, allowNull: false},
            image: {type: DataTypes.STRING(1000), allowNull: true},
            title: {type: DataTypes.STRING(1000), allowNull: false},
            description: {type: DataTypes.TEXT, allowNull: true},
            longitude: {type: DataTypes.DECIMAL(13, 10), allowNull: true, validate: { min: -180, max: 180 }},
            latitude: {type: DataTypes.DECIMAL(13, 10), allowNull: true, validate: { min: -90, max: 90 }},
            update_time: {type: DataTypes.DATE, allowNull: true, validate: {isDate: true}},
            added_time: {type: DataTypes.DATE, allowNull: true, validate: {isDate: true}},
            status: {type: 'SMALLINT(6)', allowNull: false},
            price_mode: {type: 'SMALLINT(6)', allowNull: false},
            fixed_price: {type: DataTypes.DECIMAL(10, 2), allowNull: true},
            current_bidding_price: {type: DataTypes.DECIMAL(10, 2), allowNull: true},
            bidding_start_time: {type: DataTypes.DATE, allowNull: true, validate: {isDate: true}},
            bidding_end_time: {type: DataTypes.DATE, allowNull: true, validate: {isDate: true}},
            num_in_stock: {type: DataTypes.INTEGER, allowNull: true},
            listing_round: {type: DataTypes.INTEGER, allowNull: true},
            address: {type: DataTypes.STRING, allowNull: true},
            currency_code: {type: DataTypes.STRING(30), allowNull: true},
            ship_mode: {type: 'SMALLINT(6)', allowNull: false},
            image_height: {type: DataTypes.INTEGER(10).UNSIGNED, allowNull: true},
            image_width: {type: DataTypes.INTEGER(10).UNSIGNED, allowNull: true},
            internal_status: {type: 'SMALLINT(6)', allowNull: false}
        }, {
            tableName: 'commodity_commodityproduct',
            freezeTableName: true,
            timestamps: false,
            paranoid: false,
            engine: 'InnoDB',
            charset: 'utf8',
            classMethods: {
                associate: function (models) {
                    Commodity.hasMany(models.Image, {as: 'Images',foreignKey: 'product_id'});
                    Commodity.belongsTo(models.User, {as: 'User', foreignKey: 'owner_id'});
                    Commodity.hasMany(models.CommodityReport, {as: 'CommodityReports', foreignKey: 'commodity_id'});
                }
            }
        }
    );

    return Commodity;
};