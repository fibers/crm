module.exports = function (sequelize, DataTypes) {
    var Image = sequelize.define('Image', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            _order: {type: DataTypes.INTEGER, allowNull: true, unique: true},
            image_file: {type: DataTypes.STRING(100), allowNull: true},
            description: {type: DataTypes.STRING(100), allowNull: true},
            product_id: {type: DataTypes.INTEGER, allowNull: true},
            image_height: {type: DataTypes.INTEGER(10).UNSIGNED, allowNull: true},
            image_width: {type: DataTypes.INTEGER(10).UNSIGNED, allowNull: true},
            update_time: {type: DataTypes.DATE, allowNull: true, validate: {isDate: true}}
        }, {
            tableName: 'commodity_commodityproductimage',
            freezeTableName: true,
            timestamps: false,
            paranoid: false,
            engine: 'InnoDB',
            charset: 'utf8',
            classMethods: {
                associate: function (models) {
                    Image.belongsTo(models.Commodity, {as: 'Commodity', foreignKey: 'product_id'});
                }
            }
        }
    );

    return Image;
};