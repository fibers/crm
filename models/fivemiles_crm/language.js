module.exports = function (sequelize, DataTypes) {
    var Language = sequelize.define('Language', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            iso_code: {type: 'CHAR(2)', allowNull: false, unique: true, validate: {len: [2]}},
            title: {type: DataTypes.STRING, allowNull: false},
            status: {type: DataTypes.BOOLEAN, allowNull: false}
        }, {
            tableName: 'languages',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8'
        }
    );

    return Language;
};