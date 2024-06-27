 exports.ServerError = (error, res) => {
    return res.json({ status: 500, msg: error.message });
};

exports.ExcludeNames = ['password','role']