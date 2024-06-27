const {Sequelize,DataTypes} = require('sequelize')

const sequelize = new Sequelize('blaize_finance', 'root','',{
    host:'localhost',
    dialect:'mysql'
})
sequelize.authenticate()
.then(()=>{ console.log(`db connected successfully`)})
.catch((error) => {console.log(error)})

const db = {}
db.sequelize =sequelize
db.Sequelize =Sequelize
db.users = require('./UserModel')(sequelize,DataTypes)
db.deposits = require('./DepositModel')(sequelize,DataTypes)
db.withdraws = require('./WithdrawalModel')(sequelize,DataTypes)
db.notifications = require('./notificationsModel')(sequelize,DataTypes)
db.plans = require('./PlansModel')(sequelize,DataTypes)
db.kycs = require('./kycModel')(sequelize,DataTypes)
db.messages = require('./messages')(sequelize, DataTypes)
db.rooms = require('./room')(sequelize, DataTypes)
db.problems = require('./problems')(sequelize, DataTypes)


// One to Many relationships
db.users.hasMany(db.deposits, {foreignKey: 'user', as:'userdeposits'})
db.users.hasMany(db.withdraws, {foreignKey: 'user', as:'userwithdrawals'})
db.users.hasMany(db.notifications, {foreignKey: 'notify', as:'usernotify'})
db.users.hasMany(db.plans, {foreignKey:'userid', as:'userplans'})
db.users.hasOne(db.kycs, {foreignKey:'userid', as:'userkyc'})
db.users.hasMany(db.rooms, {foreignKey: 'admin', as:'friend'})
db.rooms.hasMany(db.messages, {foreignKey: 'roomid', as:'messages'})
db.rooms.hasMany(db.problems, {foreignKey:'room', as:'probroom'})


// One to one relationship 
db.deposits.belongsTo(db.users, {foreignKey: 'user', as:'userdeposits'})
db.withdraws.belongsTo(db.users, {foreignKey: 'user', as:'userwithdrawals'})
db.notifications.belongsTo(db.users, {foreignKey: 'notify', as: 'usernotify'})
db.plans.belongsTo(db.users, {foreignKey:'userid', as:'userplans'})
db.kycs.belongsTo(db.users, {foreignKey:'userid', as:'userkyc'})
db.messages.belongsTo(db.rooms, {foreignKey: 'roomid', as:'messages'})
db.rooms.belongsTo(db.users, {foreignKey:'admin', as:'friend'})
db.problems.belongsTo(db.rooms,{foreignKey:'room', as:'probroom'})

db.sequelize.sync({force: false ,alter: true}).then(() => {console.log('database tables synced successfully')})
module.exports = db