const { CreateAccount, Testmail, ProfileImageUpload, ResendOtp, VerifyEmail, UpdateProfile, GetUserProfile, LoginAccount, ChangeProfileImage, GetAllusers, logOutUser, SubmitKYC, OverturnKyc, ApproveKYC, ChangeAccountPassword, ChangeAccountEmail, findUserAccount, VerifyUserEmail, ChangeUserPassword, welcomeNotify, getSignupUser } = require('../controllers/UserControllers')
const {  ValidateDeposits, ValidateWithdrawals, DeclineWithdrawals, DeclineDeposits } = require('../controllers/userFundsControllers')
const { userMiddleware } = require('../middleware/auth')


const router = require('express').Router()
router.post('/create', CreateAccount)
router.post('/test', Testmail)
router.post('/resend-otp', ResendOtp)
router.post('/validateacc',  VerifyEmail)
router.post('/validate-user-acc',  VerifyUserEmail)
router.post('/uploadimg', ProfileImageUpload)
router.post('/update-profile',userMiddleware, UpdateProfile)
router.post('/update-password', ChangeUserPassword)
router.post('/login', LoginAccount)
router.get('/profile', userMiddleware, GetUserProfile)
router.get('/all', GetAllusers)
router.post('/logout', userMiddleware, logOutUser)
router.post('/change-image',userMiddleware, ChangeProfileImage)
router.post('/kyc-upload',userMiddleware, SubmitKYC)
router.post('/change-password', userMiddleware,ChangeAccountPassword)
router.post('/change-email', userMiddleware,ChangeAccountEmail)
router.post('/find-acc', findUserAccount)
// router.post('/welcome', welcomeNotify)
// router.get('/signup-user', getSignupUser)

module.exports = router