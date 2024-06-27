const User = require('../models').users
const Deposit = require('../models').deposits
const fs = require('fs')
const jwt = require('jsonwebtoken')
const otpgenerator = require('otp-generator')
var slug = require('slug')
const sendMail = require('../Config/emailConfig')
const { ServerError, ExcludeNames } = require('../Config/utils')
const moment = require('moment')
const { where } = require('sequelize')
const Withdrawal = require('../models').withdraws
const KYC = require('../models').kycs
const Notify = require('../models').notifications


exports.CreateAccount = async (req, res) => {
  try {
    const { full_name, email, username, password, confirm_password, phone } = req.body
    if (!full_name || !email || !username || !password || !confirm_password || !phone) {
      return res.json({ status: 404, msg: 'Incomplete Request' })
    }
    const CheckPhone = await User.findOne({ where: { phone: phone } })
    if (CheckPhone) return res.json({ status: 404, msg: 'Phone number already exists with us' })
    const CheckUsername = await User.findOne({ where: { username: username } })
    if (CheckUsername) return res.json({ status: 404, msg: 'Username already exists with us' })
    const CheckEmail = await User.findOne({ where: { email: email } })
    if (CheckEmail) return res.json({ status: 404, msg: 'Email already exists with us' })
    if (password.length <= 4) return res.json({ status: 404, msg: 'Password must be greater than 5 characters' })
    if (confirm_password !== password) return res.json({ status: 404, msg: 'Password(s) mismatched' })

    const user = await User.create({
      full_name,
      email,
      password,
      username,
      phone,
    })
    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const content = `<div>
    <p>hi dear, please verify your email with the code below</p>
    <div style="  padding: 1rem; background-color: red; width: 100%; dislpay:flex; align-items: center;
    justify-content: center;">
    <h3 style="font-size: 1.5rem">${otp}</h3>
    </div>
    </div>`
    await Notify.create({
      type: 'Successful Sign Up',
      message: `Hi ${username}, Welcome to Blaize Finance, you're one step away from stepping into your financial freedom. Take the bold steps and complete kyc verifications alongside facial recognitions to get started. head over to our help page if you need any, Thank You. `,
      status: 'unread',
      notify: user.id
    })
    user.reset_code = otp
    await user.save()
    await sendMail({ from: 'myonlineemail@gmail.com', to: email, subject: 'Email Verification', html: content })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return res.json({ status: 200, msg: 'Account Created Succcessfully', token })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}


exports.UpdateProfile = async (req, res) => {
  try {
    const { full_name, country, phone, username } = req.body
    const findAccount = await User.findOne({ where: { id: req.user } })
    if (!findAccount) return res.json({ status: 400, msg: 'Account not found' })
    if (full_name || country || phone || username) {
      if (full_name) {
        findAccount.full_name = full_name
      }
      if (username) {
        findAccount.username = username
      }
      if (phone) {
        findAccount.phone = phone
      }
      if (country) {
        findAccount.country = country
      }
      if (req.files) {
        const image = req.files.image
        let imageName;
        const filePath = './public/profiles'
        const currentImagePath = `${filePath}/${findAccount.image}`
        if (fs.existsSync(currentImagePath)) {
          fs.unlinkSync(currentImagePath)
        }

        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath)
        }
        imageName = `${slug(username ? username : findAccount.username, '-')}.png`
        findAccount.image = imageName

        await image.mv(`${filePath}/${imageName}`)
      }


      findAccount.save()

      return res.json({ status: 200, msg: 'Details Updated successfully' })
    }
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}



exports.VerifyEmail = async (req, res) => {

  try {
    const { reset_code, email } = req.body
    if (!reset_code || !email) return res.json({ status: 404, msg: 'Incomplete Request' })
    const FindEmail = await User.findOne({ where: { email: email } })
    if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
    if (reset_code !== FindEmail.reset_code) return res.json({ status: 404, msg: 'Invalid code' })
    FindEmail.reset_code = null
    FindEmail.email_verified = 'true'
    await FindEmail.save()
    return res.json({ status: 200, msg: 'Email verified successfully' })

  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}
exports.VerifyUserEmail = async (req, res) => {

  try {
    const { reset_code, email } = req.body
    if (!reset_code || !email) return res.json({ status: 404, msg: 'Incomplete Request' })
    const FindEmail = await User.findOne({ where: { email: email } })
    if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
    if (reset_code !== FindEmail.reset_code) return res.json({ status: 404, msg: 'Invalid code' })
    FindEmail.reset_code = null
    FindEmail.email_verified = 'true'
    await FindEmail.save()
    return res.json({ status: 200, msg: 'Email verified successfully' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.ProfileImageUpload = async (req, res) => {
  try {
    const { email, username } = req.body
    if (!email || !username) return res.json({ status: 404, msg: 'Incomplete request' })
    if (!req.files) return res.json({ status: 404, msg: 'profile image is required' })

    const profileImage = req.files.image
    const findProfile = await User.findOne({ where: { email } })
    if (!findProfile) return res.json({ status: 404, msg: 'Account not found' })
    const ImageFilePath = './public/profiles'
    if (profileImage.size >= 1000000) return res.json({ status: 404, msg: 'File too large' })
    if (!profileImage.mimetype.startsWith('image/')) return res.json({ status: 404, msg: 'Invalid file format' })
    if (!fs.existsSync(ImageFilePath)) {
      fs.mkdirSync(ImageFilePath)
    }
    const ProfileImageName = `${slug(username, '-')}.png`
    findProfile.image = ProfileImageName
    await profileImage.mv(`${ImageFilePath}/${ProfileImageName}`)
    await findProfile.save()
    return res.json({ status: 200, msg: 'profile image uploaded successfully' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}
exports.ChangeProfileImage = async (req, res) => {
  try {
    const { email, username } = req.body
    if (!email || !username) return res.json({ status: 404, msg: 'Incomplete request' })
    if (!req.files) return res.json({ status: 404, msg: 'profile image is required' })
    const findProfile = await User.findOne({ where: { email } })
    const image = req?.files?.image  // null or undefined
    let imageName;
    const filePath = './public/profiles'
    const currentImagePath = `${filePath}/${findProfile.image}`
    if (image) {
      // Check image size and format
      if (image.size >= 1000000) return res.json({ status: 400, msg: `Cannot upload up to 1MB` })
      if (!image.mimetype.startsWith('image/')) return res.json({ status: 400, msg: `Invalid image format (jpg, jpeg, png, svg, gif, webp)` })

      // Check for the existence of the current image path and delete it
      if (fs.existsSync(currentImagePath)) {
        fs.unlinkSync(currentImagePath)
      }

      // Check for the existence of the blog image path
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath)
      }
      imageName = `${slug(username, '-')}.png`
      findProfile.image = imageName
      await image.mv(`${filePath}/${imageName}`)
    }
    await findProfile.save()
    return res.json({ status: 200, msg: 'profile image uploaded successfully' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.ResendOtp = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.json({ status: 404, msg: 'Email is required' })
    const findEmail = await User.findOne({ where: { email } })
    if (!findEmail) return res.json({ status: 404, msg: 'Invalid Account' })
    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const content = `<div>
    <p>hi dear, please verify your email with the code below</p>
    <div style="  padding: 1rem; background-color: red; width: 100%; dislpay:flex; align-items: center;
    justify-content: center;">
    <h3 style="font-size: 1.5rem">${otp}</h3>
    </div>
    </div>`
    findEmail.reset_code = otp
    await findEmail.save()
    await sendMail({ from: 'myonlineemail@gmail.com', to: email, subject: 'Email Verification', html: content })
    res.json({ status: 200, msg: 'OTP resent successfuly' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}


exports.GetUserProfile = async (req, res) => {
  try {
    const ExcludeNames = ['password', 'role', 'reset_code']
    const user = await User.findOne({
      where: { id: req.user },
      attributes: { exclude: ExcludeNames }
    })
    if (!user) return res.json({ status: 400, msg: 'Incomplete request' })
    return res.json({ status: 200, msg: 'Profile fetched successfully', data: user })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })

  }
}


exports.GetAllusers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Deposit, as: 'userdeposits',
        },
        {
          model: Withdrawal, as: 'userwithdrawals',
        },
      ]
    })
    return res.json({ status: 200, msg: 'Users fetched successfully', data: users })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.LoginAccount = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.json({ status: 404, msg: 'Incomplete request' })
    // check if user exist in database or not
    let user = await User.findOne({ where: { email } })
    if (!user) return res.json({ status: 400, msg: 'Invalid account' })
    if (user.password !== password) return res.json({ status: 404, msg: 'Invalid password' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' })
    user.last_login = moment().format('DD-MM-YYYY  hh:mm A')
    user.status = 'online'
    await user.save()
    return res.json({ status: 200, msg: 'Login successful', token })
  } catch (error) {
    ServerError(res, error)
  }
}

exports.logOutUser = async (req, res) => {
  try {
    const time = moment()
    const user = await User.findByPk(req.user)
    if (!user) return res.json({
      status: 404,
      msg: `Account not found`,
    })
    user.status = 'offline'
    user.lastseen = moment(time).format('DD-MM-YYYY hh:mm A')
    await user.save()
    return res.json({ status: 200, msg: `Logged out successfully ${user.status}`, user })

  } catch (error) {
    return res.json({ status: 404, msg: error })
  }
}


exports.findUserAccount = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.json({ status: 404, msg: 'Email is required' })
    const findEmail = await User.findOne({ where: { email } })
    if (!findEmail) return res.json({ status: 404, msg: 'Account not found' })
    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const content = `<div>
    <p>hi dear, please verify your email with the code below</p>
    <div style="  padding: 1rem; background-color: red; width: 100%; dislpay:flex; align-items: center;
    justify-content: center;">
    <h3 style="font-size: 1.5rem">${otp}</h3>
    </div>
    </div>`
    findEmail.reset_code = otp
    await findEmail.save()
    await sendMail({ from: 'myonlineemail@gmail.com', to: email, subject: 'Email Verification', html: content })
    res.json({ status: 200, msg: 'OTP resent successfuly' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}
exports.ChangeAccountPassword = async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body
    if (!old_password || !new_password || !confirm_password) return res.json({ status: 404, msg: 'Incomplete rquest to change password' })
    const finduser = await User.findOne({ where: { id: req.user, password: old_password } })
    if (!finduser) return res.json({ status: 400, msg: 'Old password does not match ' })
    if (new_password !== confirm_password) return res.json({ status: 404, msg: 'Password(s) mismatched' })
    finduser.password = new_password
    await finduser.save()
    await Notify.create({
      type: 'Account Password Change',
      message: `Your request to change your account password was successful.`,
      status: 'unread',
      notify: req.user
    })
    return res.json({ status: 200, msg: "Password changed succesfully, login account" })
  } catch (error) {
    return res.json({ status: 404, msg: error })
  }
}
exports.ChangeUserPassword = async (req, res) => {
  try {
    const { email, new_password, confirm_password } = req.body
    if (!email || !new_password || !confirm_password) return res.json({ status: 404, msg: 'Incomplete rquest to change password' })
    const finduser = await User.findOne({ where: { email } })
    if (!finduser) return res.json({ status: 400, msg: 'Account not found ' })
    if (new_password !== confirm_password) return res.json({ status: 404, msg: 'Password(s) mismatched' })
    finduser.password = new_password
    await finduser.save()
    return res.json({ status: 200, msg: "Password changed succesfully, login account" })
  } catch (error) {
    return res.json({ status: 404, msg: error })
  }
}
exports.ChangeAccountEmail = async (req, res) => {
  try {
    const { old_email, new_email } = req.body
    if (!old_email || !new_email) return res.json({ status: 404, msg: 'Incomplete rquest to change email' })
    const finduser = await User.findOne({ where: { id: req.user, email: old_email } })
    if (!finduser) return res.json({ status: 400, msg: 'Old email does not match ' })
    finduser.email = new_email
    await finduser.save()
    await Notify.create({
      type: 'Account Email Change',
      message: `Your request to change your account email was successful.`,
      status: 'unread',
      notify: req.user
    })
    return res.json({ status: 200, msg: "Email changed succesfully, login account" })
  } catch (error) {
    return res.json({ status: 404, msg: error })
  }
}

exports.SubmitKYC = async (req, res) => {
  try {
    const findUserKyc = await KYC.findOne({ where: { userid: req.user, status: 'pending' } })
    if (findUserKyc) return res.json({ statsu: 404, msg: 'You already have submitted Kyc, please wait for approval' })
    const findApproveduser = await KYC.findOne({ where: { userid: req.user, status: 'verified' } })
    if (findApproveduser) return res.json({ status: 404, msg: 'Sorry, your account is already verified' })
    const { firstname, lastname, gender, marital, dob, address, city, zip, country, id_type, id_number } = req.body
    if (!firstname) return res.json({ status: 404, msg: 'Firstname is required' })
    if (!lastname) return res.json({ status: 404, msg: 'Lastname is required' })
    if (!gender) return res.json({ status: 404, msg: 'Gender is required' })
    if (!marital) return res.json({ status: 404, msg: 'Marital status is required' })
    if (!dob) return res.json({ status: 404, msg: 'Date of birth is required' })
    if (!address) return res.json({ status: 404, msg: 'Address is required is required' })
    if (!city) return res.json({ status: 404, msg: 'City is required' })
    if (!zip) return res.json({ status: 404, msg: 'Zip code is required' })
    if (!country) return res.json({ status: 404, msg: 'Country is required' })
    if (!id_type) return res.json({ status: 404, msg: 'ID type is required' })
    if (!id_number) return res.json({ status: 404, msg: 'ID number is required' })
    const finduser = KYC.findOne({ where: { userid: req.user } })
    const findOwner = await User.findOne({ where: { id: req.user } })
    if (!findOwner) return res.json({ status: 404, msg: 'User not found' })
    if (!finduser) return res.json({ status: 404, msg: 'Unauthorized Access' })
    if (!req.files) return res.json({ status: 404, msg: 'ID images are required' })
    const frontimg = req?.files?.frontimg
    const backimg = req?.files?.backimg
    let imagefront;
    let imageback;
    const filepath = `./public/kycs/${firstname} ${lastname}'s kyc`

    if (frontimg) {
      if (frontimg.size >= 1000000) return res.json({ status: 404, msg: `Cannot upload up to 1MB` })
      if (!frontimg.mimetype.startsWith('image/')) return res.json({ status: 400, msg: `Invalid image format (jpg, jpeg, png, svg, gif, webp)` })
    }
    if (backimg) {
      if (backimg.size >= 1000000) return res.json({ status: 404, msg: `Cannot upload up to 1MB` })
      if (!backimg.mimetype.startsWith('image/')) return res.json({ status: 400, msg: `Invalid image format (jpg, jpeg, png, svg, gif, webp)` })
    }
    if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath)
    }
    imagefront = `${slug(`${firstname} front ID`, '-')}.png`
    imageback = `${slug(`${firstname} back ID`, '-')}.png`
    const newKyc = await KYC.create({
      firstname,
      lastname,
      gender,
      id_number,
      marital,
      dob,
      address,
      city,
      zip,
      country,
      id_type,
      status: 'pending',
      frontimg: imagefront,
      backimg: imageback,
      userid: req.user
    })

    findOwner.kyc_status = 'submitted'
    await findOwner.save()
    await frontimg.mv(`${filepath}/${imagefront}`)
    await backimg.mv(`${filepath}/${imageback}`)
    await Notify.create({
      type: 'Successful KYC submission',
      message: `Your have successfully submitted your kyc,kindly wait for approval.`,
      status: 'unread',
      notify: req.user
    })
    return res.json({ status: 200, msg: 'Kyc details submitted successfully', data: newKyc })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}
















exports.Testmail = async (req, res) => {
  try {

    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const content = `<div>
    <p>hi dear, please verify your email with the code below</p>
    <div style="color:green; font-size:1rem; margin-top:1rem;">${otp}</div>
    </div>`
    await sendMail({ from: 'myonlineemail@gmail.com', to: 'mrlite402@gmail.com', subject: 'Testing if the mail works from myonline', html: content })
    return res.json({ status: 200, msg: 'Test email sent successfully' })
  } catch (error) {
    res.json({ status: 500, msg: error.message })
  }
}