const { GetAllUserPlans, CreatePlan } = require('../controllers/PlansController')
const { userMiddleware } = require('../middleware/auth')

const router = require('express').Router()

router.get('/all', userMiddleware, GetAllUserPlans)
router.post('/create', userMiddleware, CreatePlan)
module.exports = router