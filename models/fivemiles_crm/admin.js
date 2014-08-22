module.exports = function (sequelize, DataTypes) {
    var Admin = sequelize.define('Admin', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            username: {type: DataTypes.STRING, allowNull: false, unique: true},
            password: {type: 'CHAR(32)', allowNull: false, validate: {len: [32]}},
            is_super_admin: {type: DataTypes.BOOLEAN, allowNull: false}
        }, {
            tableName: 'admins',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8'
        }
    );

    return Admin;
};