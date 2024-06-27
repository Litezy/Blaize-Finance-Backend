const { where } = require('sequelize')
const { ServerError } = require('../Config/utils')
const moment = require('moment')

const Plans = require('../models').plans
const User = require('../models').users
const Deposit = require('../models').deposits
const Kyc = require('../models').kycs
const Withdrawals = require('../models').withdraws
const Notify = require('../models').notifications

exports.GetAllUserPlans = async (req, res) => {
    try {
        const Userplans = await Plans.findAll({
            where: { userid: req.user },
            order:[['createdAt', 'DESC']]
        })
        return res.json({ status: 200, data: Userplans })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}
exports.CreatePlan = async (req, res) => {
    try {
        const { title, amount, max_deposit, min_with, roi, returns_cap, duration } = req.body
        if (!title || !amount || !max_deposit || !min_with || !roi || !returns_cap || !duration) return res.json({ status: 404, msg: 'Incomplete details submitted' })
        if (amount > max_deposit) return res.json({ status: 404, msg: 'Amount cannot be greater than plan max deposit' })
        let totalDeposits = await Deposit.sum('amount', { where: { user: req.user, status: 'complete' } })
        let totalWithdraws = await Withdrawals.sum('amount', { where: { user: req.user, status: 'complete' } })
        let balance = totalDeposits - totalWithdraws
        if (amount > balance) return res.json({ status: 404, msg: 'Insufficient funds to purchase this plan' })
        const findSimilarPlan = await Plans.findOne({ where: { userid: req.user, title: title } })
        if (findSimilarPlan) return res.json({ status: 404, msg: 'Sorry, you already have purchased this plan' })
        let newCurrentBalance = totalWithdraws;
        newCurrentBalance += parseFloat(amount);

        let startDate = moment();
        const formattedStartDate = startDate.format('DD/MM/YYYY ');
        const endDate = startDate.clone().add(duration, 'days').format('DD/MM/YYYY ');

        let time = parseInt(duration) * 24 * 60 * 60 * 1000
        const Countdown = (milliseconds) => {
            let totalseconds = parseInt(Math.floor(milliseconds / 1000))
            let totalminutes = parseInt(Math.floor(totalseconds / 60))
            let totalhours = parseInt(Math.floor(totalminutes / 60))
            let totaldays = parseInt(Math.floor(totalhours / 24))

            let seconds = parseInt(totalseconds % 60)
            let minutes = parseInt(totalminutes % 60)
            let hours = parseInt(totalhours % 24)

            return { days: totaldays, hours, minutes, seconds }
        }
        let newRoi = parseFloat(roi)
        const newPlan = await Plans.create({
            title,
            amount,
            max_deposit,
            min_with,
            duration: parseInt(duration),
            roi:newRoi,
            returns_cap,
            status: 'active',
            userid: req.user,
            start_date: formattedStartDate,
            end_date: endDate,
            time_left: + ('0' + Countdown(time).days).slice(-2) + 'd ' + ('0' + Countdown(time).hours).slice(-2) + 'h ' + ('0' + Countdown(time).minutes).slice(-2) + "m "  +   ('0' + Countdown(time).seconds).slice(-2) + "s",
        })

        const planName = 'plan purchase'
        const newWithdraw = await Withdrawals.create({
                amount: amount,
                type:planName,
                status: 'complete',
                user: req.user,
                cur_bal: newCurrentBalance,
                message: `You have successfully purchased the ${title} plan, funds deducted from your available balance `
            })
            const notification = await Notify.create({
                type: 'successful plan purchase',
                message: `Congratulations, you have purchased the ${title} plan.`,
                status: 'unread',
                notify: req.user
            })
            balance -= amount
            const Finduser = await Deposit.findOne({ where: { user: req.user } })
            const FinduserW = await Withdrawals.findOne({ where: { user: req.user } })
            await Finduser.save()
            await FinduserW.save()
        return res.json({ status: 200, msg: 'Plan purchased successfully', plan: newPlan, with:newWithdraw, notice:notification })
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}

// const newWithdraw = await Withdrawals.create({
//     amount: amount,
//     type:'plan',
//     status: 'complete',
//     user: req.user,
//     cur_bal: newCurrentBalance,
//     message: `You have successfully purchased the ${title} plan, funds deducted from your available balance `
// })
// const notification = await Notify.create({
//     type: 'successful plan purchase',
//     message: `Congratulations, you have purchased the ${title} plan.`,
//     status: 'unread',
//     notify: req.user
// })
// balance -= amount
// const Finduser = await Deposit.findOne({ where: { user: req.user } })
// const FinduserW = await Withdrawals.findOne({ where: { user: req.user } })
// await Finduser.save()
// await FinduserW.save()