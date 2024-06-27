module.exports = (sequelize, DataTypes) =>{
    return sequelize.define('room',{
        sender: {type: DataTypes.INTEGER},
        receiver: {type: DataTypes.INTEGER},
        status:{type: DataTypes.STRING, allowNull:'false', defaultValue:'inactive'}
    })
}