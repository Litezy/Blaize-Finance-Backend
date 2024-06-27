module.exports = (sequelize, DataTypes) =>{
    return sequelize.define('user',{
        full_name: {type :  DataTypes.STRING, allowNull: false},
        username: {type :DataTypes.STRING, allowNull: false},
        email: {type :DataTypes.STRING, allowNull: false},
        phone: {type :DataTypes.STRING, allowNull: false},
        country: {type :DataTypes.STRING, allowNull: true},
        password: {type :DataTypes.STRING, allowNull: false},
        image:{type:DataTypes.STRING, allowNull:true},
        reset_code:{type:DataTypes.STRING, allowNull:true},
        last_login:{type:DataTypes.STRING, allowNull:true},
        lastseen:{type:DataTypes.STRING, allowNull:true},
        kyc_status:{type:DataTypes.STRING, allowNull:false,defaultValue:'unverified'},
        email_verified:{type:DataTypes.STRING, allowNull:true, defaultValue: 'false'},
        role:{type:DataTypes.STRING, allowNull:false, defaultValue:'user'},
        status:{type:DataTypes.STRING, allowNull:true, defaultValue: 'offline'},
    })
}