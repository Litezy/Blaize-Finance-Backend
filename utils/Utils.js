exports.ServerError = (res,error) => {
    return  res.json({status: 500, error})
}
exports.ClientError = (res,error) => {
    return  res.json({status: 404, msg:error})
}

exports.UserDetails = ['password','last_login','reset_code']