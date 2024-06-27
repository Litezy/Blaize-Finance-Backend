module.exports = (sequelize, DataTypes) =>{
    return sequelize.define('plan',{
        title:{type:DataTypes.STRING, allowNull:false},
        amount:{type:DataTypes.INTEGER, allowNull:false},
        max_deposit:{type:DataTypes.INTEGER, allowNull:false},
        min_with:{type:DataTypes.INTEGER, allowNull:false},
        roi:{type:DataTypes.FLOAT, allowNull:false},
        returns_cap:{type:DataTypes.STRING, allowNull:false},
        start_date:{type: DataTypes.STRING},
        end_date:{type: DataTypes.STRING},
        time_left:{type: DataTypes.STRING},
        status:{type:DataTypes.STRING, allowNull:true,defaultValue:'notActive'},
        duration: {type: DataTypes.INTEGER, allowNull:false},
    })
}