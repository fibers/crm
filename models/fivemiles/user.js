module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            username: {type: DataTypes.STRING(30), allowNull: false, unique: true},
            first_name: {type: DataTypes.STRING(30), allowNull: false},
            last_name: {type: DataTypes.STRING(30), allowNull: false},
            email: {type: DataTypes.STRING(75), allowNull: false},
            password: {type: DataTypes.STRING(128), allowNull: false},
            is_staff: {type: DataTypes.BOOLEAN, allowNull: false},
            is_active: {type: DataTypes.BOOLEAN, allowNull: false},
            is_superuser: {type: DataTypes.BOOLEAN, allowNull: false},
            last_login: {type: DataTypes.DATE, allowNull: false, validate: {isDate: true}},
            date_joined: {type: DataTypes.DATE, allowNull: false, validate: {isDate: true}}
        }, {
            tableName: 'auth_user',
            freezeTableName: true,
            timestamps: false,
            paranoid: false,
            engine: 'InnoDB',
            charset: 'utf8',
            classMethods: {
                associate: function (models) {
                    User.hasMany(models.CommodityReport, {as: 'CommodityReports', foreignKey: 'reporter_id'});
                }
            }
        }
    );

    return User;
};