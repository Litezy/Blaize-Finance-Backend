module.exports = (sequelize, DataTypes) => {
    return sequelize.define('deposit', {
        amount: { type: DataTypes.INTEGER, allowNull: false },
        status:{type: DataTypes.STRING, allowNull:false, defaultValue:'pending'},
        type:{type: DataTypes.STRING, allowNull:false, defaultValue:'deposit'},
        message:{type: DataTypes.STRING, allowNull:true},
        cur_bal:{type: DataTypes.INTEGER, allowNull:false},
        wallet:{type: DataTypes.STRING, allowNull:false},
        trnxid:{type: DataTypes.STRING, allowNull:false}
    })
}