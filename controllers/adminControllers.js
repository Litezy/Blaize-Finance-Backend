const { ServerError } = require('../Config/utils');

const User = require('../models').users;
const Deposit = require('../models').deposits
const Withdraws = require('../models').withdraws
const Plan = require('../models').plans
const KYC = require('../models').kycs
const Notify = require('../models').notifications
const Room = require('../models').rooms
const Message = require('../models').messages
const Problem = require('../models').problems
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
})
exports.GetAllUsers = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const users = await User.findAll()
        return res.json({ status: 200, msg: 'fetched successfully', data: users })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getAllDeposits = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const alldepo = await Deposit.sum('amount', { where: { status: 'complete' } })
        return res.json({ status: 200, msg: 'fetched successfully', data: alldepo })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.getAllWithdrawals = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const allwithdraws = await Withdraws.sum('amount', { where: { status: 'complete' } })
        return res.json({ status: 200, msg: 'fetched successfully', data: allwithdraws })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.getKYCUsers = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const users = await KYC.findAll({ where: { status: 'verified' } })
        return res.json({ status: 200, msg: 'fetched successfully', data: users })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.getActivePlans = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const plans = await Plan.findAll({ where: { status: 'active' } })
        return res.json({ status: 200, msg: 'fetched successfully', data: plans })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getAllPendingDeposits = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const pendingDeposits = await Deposit.findAll({
            where: { status: 'pending' },
            include: [
                { model: User, as: 'userdeposits' }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.json({ status: 200, msg: 'fetched successfully', data: pendingDeposits })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.getAllPendingWithdrawals = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const pendingWithdraws = await Withdraws.findAll({
            where: { status: 'pending' },
            include: [
                { model: User, as: 'userwithdrawals' }
            ],
            order: [['createdAt', 'DESC']]
        })
        return res.json({ status: 200, msg: 'fetched successfully', data: pendingWithdraws })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getConfirmedDeposits = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const confirmedDeposits = await Deposit.findAll({
            where: { status: 'complete' },
            include: [
                { model: User, as: 'userdeposits' }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.json({ status: 200, msg: 'fetched successfully', data: confirmedDeposits })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.getConfirmedWithdrawals = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const confirmedWithdrwals = await Withdraws.findAll({
            where: { status: 'complete' },
            include: [
                { model: User, as: 'userwithdrawals' }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.json({ status: 200, msg: 'fetched successfully', data: confirmedWithdrwals })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getPendingKYCS = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const kycs = await KYC.findAll({
            where: { status: 'pending' },
            include: [
                { model: User, as: 'userkyc' }
            ]
        })
        return res.json({ status: 200, msg: 'fetched successfully', data: kycs })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.ValidateDeposits = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin || !findAdmin.role === 'admin') return res.json({ status: 404, msg: 'Unauthorized access to this route' })
        const { id } = req.body
        if (!id) return res.json({ status: 400, msg: 'deposit id is required' })
        const findPendingDeposit = await Deposit.findOne({ where: { id: id } })
        if (!findPendingDeposit) return res.json({ status: 200, msg: 'deposit id not found' })
        if (findPendingDeposit.status === 'complete') return res.json({ status: 404, msg: 'deposit already validated' })

        const findUser = await User.findOne({ where: { id: findPendingDeposit.user } })
        if (!findUser) return res.json({ status: 404, msg: 'Unauthorized access to this route' })


        const message = `You have successfully deposited the sum of ${formatter.format(findPendingDeposit.amount)} to your account via the company's ${findPendingDeposit.wallet} wallet with the transaction ID ${findPendingDeposit.trnxid}.`
        findPendingDeposit.status = 'complete'
        findPendingDeposit.message = message
        await findPendingDeposit.save()
        const notification = await Notify.create({
            type: 'deposit successful',
            message: `You have successfully deposited the sum of ${formatter.format(findPendingDeposit.amount)} to your account.`,
            status: 'unread',
            notify: findPendingDeposit.user
        })
        return res.json({ status: 200, msg: 'Deposit Validated', data: findPendingDeposit, notice: notification })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}


exports.DeclineDeposits = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) return res.json({ status: 404, msg: 'Deposit id required' })
        const findDeposit = await Deposit.findOne({ where: { id } })
        if (!findDeposit) return res.json({ status: 404, msg: 'Deposit not found' })
        const findUser = await User.findOne({ where: { id: findDeposit.user } })
        if (!findUser) return res.json({ status: 404, msg: 'Unauthorized access' })
        let totalDeposits = await Deposit.sum('amount', { where: { user: findDeposit.user } });
        let newCurrentBalance = totalDeposits;
        newCurrentBalance -= parseFloat(findDeposit.amount);
        findDeposit.status = 'declined'
        findDeposit.message = `You deposit of ${formatter.format(findDeposit.amount)} to your account via the company's ${findDeposit.wallet} wallet with the transaction ID ${findDeposit.trnxid} was declined.`
        findDeposit.cur_bal = newCurrentBalance
        findDeposit.save()
        const notification = await Notify.create({
            type: 'deposit Declined',
            message: `Your deposit of ${formatter.format(findDeposit.amount)} to your account was declined.`,
            status: 'unread',
            notify: findDeposit.user
        })
        return res.json({ status: 200, msg: 'Deposit successfully declined' })

    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getAdminProfile = async (req, res) => {
    try {

        const Admin = await User.findAll({ where: { role: 'admin' } })
        return res.json({ status: 200, msg: 'fetched successfully', data: Admin })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.ValidateWithdrawals = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const { id, txid } = req.body
        if (!id || !txid) return res.json({ status: 400, msg: 'id and trnxid required' })
        const findPendingWithdraw = await Withdraws.findOne({ where: { id: id } })
        if (!findPendingWithdraw) return res.json({ status: 200, msg: 'deposit id not found' })
        const findUser = await Withdraws.findOne({ where: { user: findPendingWithdraw.user } })
        if (!findUser) return res.json({ status: 400, msg: 'UnAuthorized access' })
        findPendingWithdraw.status = 'complete'
        findPendingWithdraw.txid = txid
        findPendingWithdraw.message = `Withdrawal of ${formatter.format(findPendingWithdraw.amount)}  to your external ${findPendingWithdraw.wallet} wallet was successful, transaction ID: ${findPendingWithdraw.txid}`
        await findPendingWithdraw.save()
        const notification = await Notify.create({
            type: 'withdrawal successful',
            message: `You have successfully withdrawn the sum of ${formatter.format(findPendingWithdraw.amount)} to your external ${findPendingWithdraw.wallet} wallet. `,
            status: 'unread',
            notify: findPendingWithdraw.user
        })
        return res.json({ status: 200, msg: 'Withdrawal Successful', data: findPendingWithdraw, notice: notification })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.DeclineWithdrawals = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const { id } = req.body
        const findWithdrawFunds = await Withdraws.findOne({ where: { id: id } })
        if (!findWithdrawFunds) return res.json({ status: 200, msg: 'deposit id not found' })
        const findUser = await User.findOne({ where: { id: findWithdrawFunds.user } })
        if (!findUser) return res.json({ status: 400, msg: 'UnAuthorized access' })
        let totalWithdrawals = await Withdraws.sum('amount', { where: { user: findWithdrawFunds.user } });
        let newCurrentBalance = totalWithdrawals;
        newCurrentBalance -= parseFloat(findWithdrawFunds.amount);
        findWithdrawFunds.status = 'declined'
        findWithdrawFunds.cur_bal = newCurrentBalance
        await findWithdrawFunds.save()
        const notification = await Notify.create({
            type: 'withdrawal declined',
            message: `Sorry, your withdrawal of ${formatter.format(findWithdrawFunds.amount)} was declined, this might be due to an incorrect transaction ID. `,
            status: 'unread',
            notify: findWithdrawFunds.user
        })
        return res.json({ status: 200, msg: 'Withdrawal successfully declined', data: findWithdrawFunds, notice: notification })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}



exports.ApproveKYC = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const { id } = req.body
        if (!id) return res.json({ status: 404, msg: 'Kyc ID is required' })
        const findKyc = await KYC.findOne({ where: { id } })
        if (!findKyc) return res.json({ status: 404, msg: 'Invalid ID' })
        const findUser = await User.findOne({ where: { id: findKyc.userid } })
        if (!findUser) return res.json({ status: 404, msg: 'Unauthorized access' })
        findKyc.status = 'verified'
        findUser.kyc_status = 'verified'
        await findUser.save()
        await findKyc.save()
        await Notify.create({
            type: 'KYC Approved',
            message: `Congratulations, your kyc details were reviewed and approved, You can now go ahead to purchase plans and do more on our platform. `,
            status: 'unread',
            notify: findKyc.userid
        })
        return res.json({ status: 200, msg: 'User kyc approved successfully' })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.OverturnKyc = async (req, res) => {
    try {
        const findAdmin = await User.findOne({ where: { id: req.user } })
        if (!findAdmin) return res.json({ status: 404, msg: 'Unauthorized access' })
        const { id } = req.body
        if (!id) return res.json({ status: 404, msg: 'Kyc ID is required' })
        const findKyc = await KYC.findOne({ where: { id } })
        if (!findKyc) return res.json({ status: 404, msg: 'Invalid ID' })
        const findUser = await User.findOne({ where: { id: findKyc.userid } })
        if (!findUser) return res.json({ status: 404, msg: 'Unauthorized access' })
        findKyc.status = 'false'
        findUser.kyc_status = 'unverified'
        await findUser.save()
        await findKyc.destroy({ where: { id } })
        await Notify.create({
            type: 'KYC Declined',
            message: `Sorry, your kyc approval wasn't successful, Kindly apply again. `,
            status: 'unread',
            notify: findKyc.userid
        })
        return res.json({ status: 200, msg: 'User kyc declined successfully' })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.fetchAllActiveChats = async (req, res) => {
    const excludes = ['password', 'reset_code', 'role', 'createdAt', 'updatedAt', 'email_verified', 'kyc_status']
    try {
        const findActiverooms = await Room.findAll({
            where: { receiver: req.user, status: 'active' },
            include: [
                {
                    model: Message, as: 'messages'
                }
            ]
        })
        if (!findActiverooms || findActiverooms.length === 0) return res.json({ status: 404, msg: "This room does not exist" })
        const senderIds = [...new Set(findActiverooms.map(room => room.sender))];

        const findSenders = await User.findAll({
            where: { id: senderIds },
            attributes: { exclude: excludes }
        })
        if (!findSenders) return res.json({ status: 404, msg: "No Senders found" })

        return res.json({ status: 200, msg: 'rooms fetch successfully', data: findActiverooms, findSenders })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.fetchInactiveRooms = async (req, res) => {
    const excludes = ['password', 'reset_code', 'role', 'createdAt', 'updatedAt', 'email_verified', 'kyc_status']
    try {
        const findInactiverooms = await Room.findAll({
            where: { receiver: req.user, status: 'inactive' },
        })
        if (!findInactiverooms || findInactiverooms.length === 0) return res.json({ status: 404, msg: "This room does not exist" })

        const senderIds = [...new Set(findInactiverooms.map(room => room.sender))];
        const findSender = await User.findOne({
            where: { id: senderIds },
            attributes: { exclude: excludes }
        })
        if (!findSender) return res.json({ status: 404, msg: "Sender not found" })
        return res.json({ status: 200, msg: 'rooms fetch successfully', data: findInactiverooms })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getAdminChatMessages = async (req, res) => {
    try {
        const { roomid } = req.params
        if (!roomid) return res.json({ status: 404, msg: 'Room id is required' })
        const room = await Room.findOne({
            where: { id: roomid },
            include: [
                { model: Message, as: 'messages' }
            ]
        })
        if (!room) return res.json({ status: 400, msg: 'Room not found' })

        return res.json({ status: 200, msg: 'msgs fetched successfully', data: room })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

exports.getProbChats = async (req, res) => {
    try {
        const { roomid } = req.params
        if (!roomid) return res.json({ status: 400, msg: 'Problem chat roomid is required' })
        const findroom = await Problem.findOne({ where: { room:roomid } })
        if (!findroom) return res.json({ status: 400, msg: 'problem chats not found' })
        return res.json({ status: 200, msg: 'probchats fetched successfully', data: findroom })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
