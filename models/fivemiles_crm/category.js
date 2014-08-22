module.exports = function (sequelize, DataTypes) {
    var Category = sequelize.define('Category', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            title: {type: DataTypes.STRING, allowNull: false, unique: true},
            level: {type: 'SMALLINT(1)', allowNull: false },
            parent_id: {type: DataTypes.INTEGER, allowNull: false}
        }, {
            tableName: 'categories',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8',
            classMethods: {
                associate: function (models) {
                    Category.hasMany(models.Category, {as: 'Children', foreignKey: 'parent_id', through: null});
                }
            }
        }
    );

    return Category;
};