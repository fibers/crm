module.exports = function (sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
            id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            title: {type: DataTypes.STRING, allowNull: false, unique: true},
            status: {type: DataTypes.BOOLEAN, allowNull: false}
        }, {
            tableName: 'tags',
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            engine: 'InnoDB',
            charset: 'utf8'
        }
    );
    return Tag;
};