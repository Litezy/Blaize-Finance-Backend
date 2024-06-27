const { where, Op } = require('sequelize')
const { ServerError } = require('../Config/utils')
const { sequelize, notifications } = require('../models')
const moment = require('moment')

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})
const Deposit = require('../models').deposits
const Withdrawals = require('../models').withdraws
const User = require('../models').users
const Notify = require('../models').notifications


exports.DepositFunds = async (req, res) => {
    try {
        const { amount, wallet, trnxid } = req.body
        if (!amount || !wallet || !trnxid) return res.json({ status: 400, msg: 'Incomplete deposit request' })
        const userid = req.user
        const findUser = await User.findOne({ where: { id: userid } })
        if (!findUser) return res.json({ status: 400, msg: 'UnAuthorized access' })
        let totalDeposits = await Deposit.sum('amount', { where: { user: req.user } });

        // Calculate the new current balance including the recently deposited funds
        let newCurrentBalance = totalDeposits;
        newCurrentBalance += parseFloat(amount);
        const newDeposit = await Deposit.create({
            amount: amount,
            user: userid,
            wallet: wallet,
            status: 'pending',
            trnxid: trnxid,
            cur_bal: newCurrentBalance
        })
        const message = `You have initiated a deposit of  ${formatter.format(amount)} to your account via the company's ${wallet} wallet with the transaction ID ${trnxid}`
        newDeposit.message = message
        await newDeposit.save() 
        const notification = await Notify.create({
            type: 'deposit pending',
            message: `You initiated a deposit of ${formatter.format(amount)} to fund your account through ${wallet}, pending approval.`,
            status: 'unread',
            notify: req.user,
        })
        return res.json({ status: 200, msg: 'Deposit Pending', data: newDeposit, notice: notification })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })

    }
}





exports.WithdrawFunds = async (req, res) => {
    try {
        const { amount, wallet, address } = req.body
        if (!amount || !wallet || !address) return res.json({ status: 400, msg: 'Incomplete deposit request' })
        const userid = req.user
        const findUser = await User.findOne({ where: { id: userid } })
        if (!findUser) return res.json({ status: 400, msg: 'UnAuthorized access' })
        const totalDeposited = await Deposit.sum('amount', { where: { user: userid, status: 'complete' } })
        const totalWithdrawn = await Withdrawals.sum('amount', { where: { user: userid, status: 'complete' } });
        const findPendingWithdrawals = await Withdrawals.findOne({ where: { user: req.user, status: 'pending' } })
        if (findPendingWithdrawals) return res.json({ status: 404, msg: 'Please wait while your pending withdrawal is resolved' })

        let totalWithdraws = await Withdrawals.sum('amount', { where: { user: req.user } });

        // Calculate the new current balance including the recently deposited funds
        let newCurrentBalance = totalWithdraws;
        newCurrentBalance += parseFloat(amount);

        const balance = totalDeposited - totalWithdrawn
        if (amount < 0 || amount === '0') return res.json({ status: 404, msg: 'Please input a positive amount' })
        if (amount > balance) return res.json({ status: 400, msg: 'Insufficient funds' })
        const newWithdraw = await Withdrawals.create({
            amount: amount,
            status: 'pending',
            user: userid,
            wallet: wallet,
            cur_bal: newCurrentBalance,
            address: address,
            message: `You initiated a withdrawal of ${formatter.format(amount)} from your account to your ${wallet} wallet`
        })
      
        const notification = await Notify.create({
            type: 'pending withdrawal',
            message: `Initiated a withdrawal of ${formatter.format(amount)} from my account to external wallet, pending approval.`,
            status: 'unread',
            notify: req.user
        })
        return res.json({ status: 200, msg: 'Withdrawal Initiated', data: newWithdraw, bal: balance, notice: notification })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })

    }
}


exports.fetchAllDeposits = async (req, res) => {
    try {
        const deposits = Deposit.findAll()
        return res.json({ status: 200, msg: 'Deposits fetched successfully', data: deposits })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.fetchAllWithdrawals = async (req, res) => {
    try {
        const withdraws = Withdrawals.findAll()
        return res.json({ status: 200, msg: 'Deposits fetched successfully', data: withdraws })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.GetAllPendingDeposits = async (req, res) => {
    try {
        const findDeposits = await Deposit.findAll({
            where: { user: req.user ,status: 'pending'},
            order: [['createdAt', 'DESC']]
        })
        const deposits = await Deposit.findAll({
            where: { user: req.user,status: 'pending' },
            attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'total']],
        });
        const totalPendingDeposits = deposits.length > 0 ? deposits[0].dataValues.total : 0;
        return res.json({ status: 200, msg: 'fetched successfully', data: findDeposits, total: totalPendingDeposits })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.GetAllPendingWithdraws = async (req, res) => {
    try {
        const findWithdraws = await Withdrawals.findAll({
            where: { user: req.user,status: 'pending' },
            order: [['createdAt', 'DESC']]
        })
        const Pendingwithdrawals = await Withdrawals.findAll({
            where: { user: req.user,status: 'pending' },
            attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'total']],
        });
        const totalpendingWithdrawals = Pendingwithdrawals.length > 0 ? Pendingwithdrawals[0].dataValues.total : 0;
        return res.json({ status: 200, msg: 'fetched successfully', data: findWithdraws, total: totalpendingWithdrawals })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.FetchAllUserDeposits = async (req, res) => {
    try {
        const userid = req.user;
        const user = await User.findOne({
            where: { id: userid },
            include: [{
                model: Deposit,
                as: 'userdeposits',
            }]
        });

        if (!user) return res.json({ status: 400, msg: 'User not found' });
        return res.json({ status: 200, msg: 'Deposits fetched successfully', data: user.userdeposits });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
}
exports.FetchAllUserWithdraws = async (req, res) => {
    try {
        const userid = req.user;
        const user = await User.findOne({
            where: { id: userid },
            include: [{
                model: Withdrawals,
                as: 'userwithdrawals',
            }]
        });

        if (!user) return res.json({ status: 400, msg: 'User not found' });
        const withdrawals = user

        return res.json({ status: 200, msg: 'Deposits fetched successfully', data: withdrawals.userwithdrawals });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
}
exports.FetchAllUserTransactions = async (req, res) => {
    try {
        // Fetch all deposits and withdrawals for the user
        const userDeposits = await User.findOne({
            where: { id: req.user },
            include: [{
                model: Deposit,
                as: 'userdeposits'
            }],

        });

        const userWithdrawals = await User.findOne({
            where: { id: req.user },
            include: [{
                model: Withdrawals,
                as: 'userwithdrawals'
            }],

        });

        // Ensure we have valid data
        const deposits = userDeposits && userDeposits.userdeposits ? userDeposits.userdeposits : [];
        const withdrawals = userWithdrawals && userWithdrawals.userwithdrawals ? userWithdrawals.userwithdrawals : [];

        // Combine deposits and withdrawals into a single array
        const allTransactions = [...deposits, ...withdrawals];

        // Sort the combined array by createdAt timestamp
        allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.json({ status: 200, msg: 'Transactions fetched successfully', data: allTransactions });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
};



exports.UserAccountBalance = async (req, res) => {
    try {
        const deposits = await Deposit.findAll({
            where: { user: req.user,status: 'complete' },
            attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'total']],
        });
        const withdrawals = await Withdrawals.findAll({
            where: { user: req.user,status: 'complete' },
            attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'total']],
        });
        const totalDeposits = deposits.length > 0 ? deposits[0].dataValues.total : 0;
        const totalWithdrawals = withdrawals.length > 0 ? withdrawals[0].dataValues.total : 0;
        const balance = totalDeposits - totalWithdrawals;

        return res.json({ status: 200, msg: 'Balance fetched successfully', total: balance, deposits: totalDeposits, withdraws: totalWithdrawals });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
};



//Notifications Controllers

exports.MarkNotifications = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user;
        if (!userId) return res.json({ status: 400, msg: "Unauthorized access" });
        const findUser = await Notify.findOne({ where: { notify: userId } });
        const notice = await Notify.findOne({ where: { id: id } });
        if (!findUser || !notice) return res.json({ status: 404, msg: "Notification not found" });
        await Notify.update({ status: 'read' }, { where: { id: id } });
        return res.json({ status: 200, msg: "Notification marked as read" });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
}
exports.MarkAllNotifications = async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) return res.json({ status: 400, msg: "Unauthorized access" });
        await Notify.update({ status: 'read' }, { where: { notify: userId } });
        return res.json({ status: 200, msg: "All Notifications marked as read" });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
}
exports.UnMarkAllNotifications = async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) return res.json({ status: 400, msg: "Unauthorized access" });
        await Notify.update({ status: 'unread' }, { where: { notify: userId } });
        return res.json({ status: 200, msg: "All Notifications marked as unread" });
    } catch (error) {
        return res.json({ status: 500, msg: error.message });
    }
}
exports.fetchAllUserNotifications = async (req, res) => {
    try {
        const findUser = await Notify.findAll({
            where: { notify: req.user },
            order: [['createdAt', 'DESC']]
        })
        return res.json({ status: 200, msg: 'Notifications fetched successfully', data: findUser })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}