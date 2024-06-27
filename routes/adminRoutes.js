const { GetAllUsers, getAllDeposits, getKYCUsers, getActivePlans, ValidateDeposits, ValidateWithdrawals, DeclineWithdrawals, DeclineDeposits, OverturnKyc, ApproveKYC, getAllWithdrawals, getAllPendingDeposits, getConfirmedDeposits, getConfirmedWithdrawals, getAllPendingWithdrawals, getPendingKYCS, getAdminProfile, fetchAllActiveChats, fetchInactiveRooms, getAdminChatMessages, getProbChats } = require('../controllers/adminControllers')
const { adminPrivacy, userMiddleware } = require('../middleware/auth')

const router = require('express').Router()
router.get('/all',adminPrivacy, GetAllUsers)
router.get('/all-deposits',adminPrivacy, getAllDeposits)
router.get('/all-withdrawals',adminPrivacy, getAllWithdrawals)

router.get('/confirmed-deposits',adminPrivacy, getConfirmedDeposits)
router.get('/confirmed-withdrawals',adminPrivacy, getConfirmedWithdrawals)

router.get('/all-kycs', adminPrivacy,getKYCUsers)
router.get('/all-plans',adminPrivacy, getActivePlans)
router.get('/pending-kycs',adminPrivacy, getPendingKYCS)

router.post('/validate-deposit',adminPrivacy, adminPrivacy, ValidateDeposits)
router.post('/validate-withdraw', adminPrivacy, ValidateWithdrawals)

router.post('/decline-with',adminPrivacy, DeclineWithdrawals)
router.post('/decline-depo', adminPrivacy, DeclineDeposits)

router.post('/kyc-decline',adminPrivacy, OverturnKyc)
router.post('/kyc-approve',adminPrivacy, ApproveKYC)

router.get('/pending-deposits',adminPrivacy, getAllPendingDeposits)
router.get('/pending-withdrawals',adminPrivacy, getAllPendingWithdrawals)

router.get('/admin-profile', userMiddleware, getAdminProfile)

//Chats routes
router.get('/all-active-chats', userMiddleware, fetchAllActiveChats)
router.get('/all-inactive-chats', userMiddleware, fetchInactiveRooms)
router.get('/admin-chats/:roomid', userMiddleware, getAdminChatMessages)
router.get('/admin-probs/:roomid', userMiddleware, getProbChats)
module.exports = router