const { MarkNotifications, fetchAllUserNotifications, MarkAllNotifications, UnMarkAllNotifications } = require('../controllers/userFundsControllers')
const { userMiddleware } = require('../middleware/auth')

const router = require('express').Router()
router.post('/notice/:id', userMiddleware, MarkNotifications)
router.get('/notify', userMiddleware, fetchAllUserNotifications)
router.post('/all-notify', userMiddleware, MarkAllNotifications)
router.post('/undo-notify', userMiddleware, UnMarkAllNotifications)
module.exports = router