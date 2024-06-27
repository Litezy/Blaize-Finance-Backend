const { DepositFunds, WithdrawFunds, FetchAllUserDeposits, FetchAllUserWithdraws, FetchAllUserTransactions, UserAccountBalance, fetchAllDeposits, GetAllPendingDeposits, GetAllPendingWithdraws, DeclineDeposits,  } = require('../controllers/userFundsControllers')
const { userMiddleware } = require('../middleware/auth')

const router = require('express').Router()
//User deposits and withdrawals
router.post('/deposit', userMiddleware, DepositFunds)
router.post('/withdraw', userMiddleware, WithdrawFunds)
router.get('/user-deposits', userMiddleware, FetchAllUserDeposits)
router.get('/user-withdraws', userMiddleware, FetchAllUserWithdraws)
router.get('/all-trnx', userMiddleware, FetchAllUserTransactions)
router.get('/balance', userMiddleware, UserAccountBalance)
router.get('/all-deposits',  fetchAllDeposits)
router.get('/pending-depo', userMiddleware, GetAllPendingDeposits)
router.get('/pending-with', userMiddleware, GetAllPendingWithdraws)

module.exports = router