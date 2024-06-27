const { CreatePlan } = require('../controllers/userPlans')

const router = require('express').Router()

router.post('create',CreatePlan)
module.exports = router