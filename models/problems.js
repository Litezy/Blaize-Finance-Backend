module.exports = (sequelize,DataTypes) =>{
    return sequelize.define('problem', {
        firstname:{type:DataTypes.STRING},
        lastname:{type:DataTypes.STRING},
        issues:{type:DataTypes.STRING},
        sender:{type:DataTypes.STRING},
        details:{type:DataTypes.STRING, allowNull:true},
    })
}