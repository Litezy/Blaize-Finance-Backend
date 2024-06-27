const { ServerError } = require('../Config/utils')

const Plans = require('../models').plans

exports.CreatePlan = async (req, res) => {
    try {
        const { title, mindept, maxdept, minwithd, maxwithd, roi, returnCapital, duration } = req.body
        if (!title || !mindept || !maxdept || !minwithd || !maxwithd || !roi || !returnCapital || !duration)
            return res.json({ status: 400, msg: 'Incomplete request to purchase plan' })
        await Plans.create({
            title,
            mindept,
            maxdept,
            minwithd,
            maxwithd,
            roi,
            returnCapital,
            duration,
            userid: req.user
        })
        return res.json({ status: 200, msg: 'Plan purchased successfully' })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.UpdatePlan = async (req, res) => {
    try {
        const { title, mindept, maxdept, minwithd, maxwithd, roi, returnCapital, duration, id } = req.body
        if (!title || !mindept || !maxdept || !minwithd || !maxwithd || !roi || !returnCapital || !duration || !id)
            return res.json({ status: 400, msg: 'Incomplete plan update request' })

        const item = await Plans.findOne({ where: { id } })
        if (!item) return res.json({ status: 400, msg: 'Plan does not exist' })
            item.title = title,
            item.mindept = mindept
            item.maxdept =maxdept,
            item.minwithd = minwithd,
            item.maxwithd =maxwithd
            item.roi = roi,
            item.returnCapital = returnCapital
            item.duration = duration

            await item.save()
            return res.json({status:200, msg:'Plan updated successfully'})
    } catch (error) {
        ServerError(error, res)
    }
}

exports.getSinglePlan = async(req,res) =>{
    try {
        const {id} = req.params
        const findUser = await Plans.findOne({where:{id}})
        if(!findUser) return res.json({status:400,msg:'Plan not found'})
        return res.json({status:200,msg:'Plan fetched successfully', data:findUser})
    } catch (error) {
        ServerError(res, error)
    }
}

exports.getAllPlans = async (req,res) =>{
    try {
        const allPlans = await Plans.findAll({})
     return res.json({status:200,data:allPlans,msg:'All plans fetched successfully'})
    } catch (error) {
        ServerError(res,error)
    }
}

exports.DeletePlan = async (req,res) =>{
    try {
        const {id}= req.body
        if(!id) return res.json({status:400,msg:'Plan id is required'})
        const plan = findByPk(id)
        if (!plan) return res.json({ status: 404, msg: `Plan does not exists` })
        await plan.destroy()
      return res.jsn({status:200,msg:"Plan deleted successfully"})
    } catch (error) {
        ServerError(error,res)
    }
}